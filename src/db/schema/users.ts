import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { authUsers } from "./auth";

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),

  fullName: varchar("full_name", { length: 120 }),

  avatarUrl: text("avatar_url"),

  bio: text("bio"),

  homeCountry: varchar("home_country", { length: 100 }),

  preferredCurrency: varchar("preferred_currency", {
    length: 3,
  }).notNull().default("INR"),

  travelPreferences: text("travel_preferences").array(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).notNull().defaultNow(),
});