import type { Migration } from "../migrator";

// A donor's standing monthly commitment to a form. created_at is the date the
// recurring donation was set up. `IF NOT EXISTS` covers databases created
// before migrations, where schema.sql already made this table.
export const migration: Migration = {
  id: "003_create_recurring_donations",
  up(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS recurring_donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id INTEGER NOT NULL,
        contact_id INTEGER NOT NULL,
        amount INTEGER NOT NULL CHECK (amount > 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id),
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
      );

      CREATE INDEX IF NOT EXISTS idx_recurring_donations_contact_id
        ON recurring_donations (contact_id);
    `);
  },
};
