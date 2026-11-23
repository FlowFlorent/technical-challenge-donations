import Database from "better-sqlite3";
import path from "path";
import { seedDatabase } from "./seed";
import { runMigrations } from "./migrator";
import { migrations } from "./migrations";

export const DB_PATH = path.join(__dirname, "../../data.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/** Brings the schema up to date. Safe to call on every startup. */
export function migrateDatabase() {
  const applied = runMigrations(db, migrations);
  for (const id of applied) {
    console.log(`Applied migration ${id}`);
  }
  return applied;
}

export function initializeDatabase() {
  migrateDatabase();

  const row = db.prepare("SELECT COUNT(*) as count FROM forms").get() as {
    count: number;
  };
  if (row.count === 0) {
    seedDatabase(db);
    console.log("Database seeded with sample data");
  }
}

export default db;
