import type { Migration } from "../migrator";
import { migration as m001 } from "./001_initial_schema";
import { migration as m002 } from "./002_add_forms_allow_monthly_donations";
import { migration as m003 } from "./003_create_recurring_donations";

/**
 * Every migration, oldest first. To change the schema, add a new file
 * (next number + short description) and append it here. Never edit or
 * reorder a migration that has already been applied somewhere.
 */
export const migrations: readonly Migration[] = [m001, m002, m003];
