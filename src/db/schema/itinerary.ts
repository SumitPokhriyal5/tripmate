import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { trips } from "./trips";
import { profiles } from "./users";
import { destinations } from "./destinations";

export const itineraryDays = pgTable(
  "itinerary_days",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    dayNumber: integer("day_number").notNull(),

    date: timestamp("date", {
      withTimezone: true,
    }),

    title: varchar("title", { length: 150 }),

    description: text("description"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("itinerary_days_trip_day_unique").on(
      table.tripId,
      table.dayNumber
    ),
    index("itinerary_days_trip_idx").on(table.tripId),
  ]
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    dayId: uuid("day_id")
      .notNull()
      .references(() => itineraryDays.id, { onDelete: "cascade" }),

    destinationId: uuid("destination_id")
      .references(() => destinations.id, { onDelete: "set null" }),

    title: varchar("title", { length: 150 }).notNull(),

    description: text("description"),

    locationName: varchar("location_name", { length: 200 }),

    latitude: numeric("latitude", {
      precision: 10,
      scale: 7,
    }),

    longitude: numeric("longitude", {
      precision: 10,
      scale: 7,
    }),

    startTime: timestamp("start_time", {
      withTimezone: true,
    }),

    endTime: timestamp("end_time", {
      withTimezone: true,
    }),

    estimatedCost: numeric("estimated_cost", {
      precision: 12,
      scale: 2,
    }),

    currency: varchar("currency", { length: 3 })
      .notNull()
      .default("INR"),

    imageUrl: text("image_url"),

    displayOrder: integer("display_order")
      .notNull()
      .default(0),

    createdBy: uuid("created_by")
      .references(() => profiles.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("activities_day_order_idx").on(
      table.dayId,
      table.displayOrder
    ),
  ]
);

export const itineraryVersions = pgTable(
  "itinerary_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    versionNumber: integer("version_number").notNull(),

    // Complete snapshot of itinerary days and activities.
    snapshot: jsonb("snapshot").notNull(),

    changeDescription: text("change_description"),

    createdBy: uuid("created_by")
      .references(() => profiles.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("itinerary_versions_trip_version_unique").on(
      table.tripId,
      table.versionNumber
    ),
    index("itinerary_versions_trip_created_idx").on(
      table.tripId,
      table.createdAt
    ),
  ]
);