import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { profiles } from "./users";
import { trips } from "./trips";

export const destinations = pgTable(
  "destinations",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 150 }).notNull(),

    country: varchar("country", { length: 100 }),

    description: text("description"),

    latitude: numeric("latitude", {
      precision: 10,
      scale: 7,
    }),

    longitude: numeric("longitude", {
      precision: 10,
      scale: 7,
    }),

    imageUrl: text("image_url"),

    imageSource: text("image_source"),

    imageLicense: text("image_license"),

    sourceAttribution: text("source_attribution"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("destinations_name_country_unique").on(
      table.name,
      table.country
    ),
  ]
);

export const savedPlaces = pgTable(
  "saved_places",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),

    savedBy: uuid("saved_by")
      .notNull()
      .references(() => profiles.id),

    notes: text("notes"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("saved_places_trip_destination_unique").on(
      table.tripId,
      table.destinationId
    ),
  ]
);