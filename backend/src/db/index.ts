import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { seedDatabase } from "./seed";

const DB_PATH = path.join(__dirname, "../../data.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initializeDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  db.exec(schema);
  addMissingColumns();

  const row = db.prepare("SELECT COUNT(*) as count FROM forms").get() as {
    count: number;
  };
  if (row.count === 0) {
    seedDatabase(db);
    console.log("Database seeded with sample data");
  }
}

// `CREATE TABLE IF NOT EXISTS` never alters an existing table, so databases
// created before a column was added need it backfilled here. Stopgap until
// the project has real migrations.
function addMissingColumns() {
  const formColumns = db.prepare("PRAGMA table_info(forms)").all() as {
    name: string;
  }[];
  if (!formColumns.some((c) => c.name === "allow_monthly_donations")) {
    db.exec(
      "ALTER TABLE forms ADD COLUMN allow_monthly_donations INTEGER NOT NULL DEFAULT 0"
    );
  }
}

export default db;
