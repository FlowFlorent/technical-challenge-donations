// Applies pending migrations without starting the server.
import { migrateDatabase } from "../db";

const applied = migrateDatabase();
if (applied.length === 0) console.log("Database is up to date");
