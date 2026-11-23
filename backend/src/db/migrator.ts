import type Database from "better-sqlite3";

/**
 * A single, forward-only schema change.
 *
 * `id` is the migration's permanent identity: it is recorded in
 * `schema_migrations` once applied, so never rename or edit a migration that
 * has shipped. To change the schema again, add a new migration.
 */
export interface Migration {
  /** Zero-padded sequence + description, e.g. "004_add_contact_notes". */
  id: string;
  up(db: Database.Database): void;
}

const MIGRATIONS_TABLE = "schema_migrations";

/**
 * Applies every migration in `migrations` that this database has not run yet,
 * in order. Each migration runs in its own transaction together with the row
 * that records it, so a failing migration leaves no partial changes and is
 * retried on the next run.
 *
 * Returns the ids of the migrations applied by this call.
 */
export function runMigrations(
  db: Database.Database,
  migrations: readonly Migration[]
): string[] {
  assertWellOrdered(migrations);

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id TEXT PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const applied = new Set(
    (db.prepare(`SELECT id FROM ${MIGRATIONS_TABLE}`).all() as { id: string }[]).map(
      (row) => row.id
    )
  );

  const known = new Set(migrations.map((m) => m.id));
  const unknown = [...applied].filter((id) => !known.has(id));
  if (unknown.length > 0) {
    // The database is ahead of this code (e.g. after switching to an older
    // branch). Running anyway could misbehave, so stop and say why.
    throw new Error(
      `Database has migrations this code does not know about: ${unknown.join(", ")}. ` +
        "Switch to a branch that includes them, or reset the database with `npm run db:reset`."
    );
  }

  const record = db.prepare(`INSERT INTO ${MIGRATIONS_TABLE} (id) VALUES (?)`);
  const newlyApplied: string[] = [];

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;

    db.transaction(() => {
      migration.up(db);
      record.run(migration.id);
    })();

    newlyApplied.push(migration.id);
  }

  return newlyApplied;
}

function assertWellOrdered(migrations: readonly Migration[]) {
  for (let i = 1; i < migrations.length; i++) {
    if (migrations[i].id <= migrations[i - 1].id) {
      throw new Error(
        `Migrations must be listed in increasing id order with unique ids: ` +
          `"${migrations[i - 1].id}" is followed by "${migrations[i].id}".`
      );
    }
  }
}
