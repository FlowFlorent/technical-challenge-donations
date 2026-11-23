// Deletes the local database, then recreates it from migrations and seed
// data. Stop the dev server first: it keeps the old file open.
import fs from "fs";
import path from "path";

// Resolved here rather than imported, because importing ../db opens the file.
const DB_PATH = path.join(__dirname, "../../data.db");

for (const suffix of ["", "-wal", "-shm"]) {
  fs.rmSync(DB_PATH + suffix, { force: true });
}
console.log(`Deleted ${path.relative(process.cwd(), DB_PATH)}`);

// Imported only after the files are gone, so it creates a fresh database.
import("../db").then(({ initializeDatabase }) => initializeDatabase());
