import type { Migration } from "../migrator";

export const migration: Migration = {
  id: "002_add_forms_allow_monthly_donations",
  up(db) {
    // Databases from before migrations may already have this column (it was
    // backfilled at startup), and SQLite has no ADD COLUMN IF NOT EXISTS.
    const columns = db.prepare("PRAGMA table_info(forms)").all() as {
      name: string;
    }[];
    if (columns.some((c) => c.name === "allow_monthly_donations")) return;

    db.exec(
      "ALTER TABLE forms ADD COLUMN allow_monthly_donations INTEGER NOT NULL DEFAULT 0"
    );
  },
};
