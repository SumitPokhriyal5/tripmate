import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

/**
 * Reusable column definitions, spread into table definitions:
 *
 *   export const trips = pgTable("trips", {
 *     id: uuid("id").primaryKey().defaultRandom(),
 *     ...timestamps,
 *   });
 *
 * Not exported from schema/index.ts: these are building blocks, not tables.
 */

/** For append-only rows that are never edited (votes, chat messages). */
export const createdAt = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

/** For editable rows. */
export const timestamps = {
  ...createdAt,
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    // Drizzle adds this to every UPDATE it builds.
    .$onUpdate(() => sql`now()`),
};
