import { sql } from "drizzle-orm";
import {
  char,
  check,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

import { timestamps } from "./helpers";

/**
 * Travel preferences used to prefill trip forms and give Gemini context.
 * Read and written as a whole, never queried by field, so jsonb fits.
 * A Zod schema (typed as z.ZodType<TravelPreferences>) validates it before
 * every write, keeping the two in sync.
 */
export type TravelPreferences = {
  travelStyles?: string[]; // e.g. "adventure", "cultural", "relaxation"
  interests?: string[]; // e.g. "mountains", "food", "photography"
  pace?: "relaxed" | "balanced" | "packed";
};

/**
 * One row per user, sharing its id with auth.users.
 *
 * Created by a database trigger on auth.users (added in a later migration),
 * so every column except id must be nullable or have a default: the trigger
 * runs before the user has filled anything in.
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),

    fullName: varchar("full_name", { length: 120 }),

    /** Object path inside the Supabase Storage bucket, e.g. "<userId>/avatar.webp". */
    avatarPath: text("avatar_path"),

    bio: text("bio"),

    /** ISO 3166-1 alpha-2 country code, e.g. "IN". */
    homeCountry: char("home_country", { length: 2 }),

    /** ISO 4217 currency code, e.g. "INR". */
    preferredCurrency: char("preferred_currency", { length: 3 })
      .notNull()
      .default("INR"),

    travelPreferences: jsonb("travel_preferences")
      .$type<TravelPreferences>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    ...timestamps,
  },
  (table) => [
    check(
      "profiles_full_name_not_blank",
      sql`${table.fullName} is null or length(trim(${table.fullName})) > 0`,
    ),
    check("profiles_bio_length", sql`char_length(${table.bio}) <= 500`),
    check(
      "profiles_home_country_format",
      sql`${table.homeCountry} ~ '^[A-Z]{2}$'`,
    ),
    check(
      "profiles_preferred_currency_format",
      sql`${table.preferredCurrency} ~ '^[A-Z]{3}$'`,
    ),
  ],
).enableRLS();

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
