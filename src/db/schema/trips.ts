import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import {
  tripVisibilityEnum,
  tripRoleEnum,
  invitationStatusEnum,
} from "./enums";

import { profiles } from "./users";

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 150 }).notNull(),

    description: text("description"),

    destinationName: varchar("destination_name", {
      length: 150,
    }).notNull(),

    startDate: timestamp("start_date", {
      withTimezone: true,
    }),

    endDate: timestamp("end_date", {
      withTimezone: true,
    }),

    numberOfTravelers: integer("number_of_travelers")
      .notNull()
      .default(1),

    budget: numeric("budget", {
      precision: 12,
      scale: 2,
    }),

    currency: varchar("currency", { length: 3 })
      .notNull()
      .default("INR"),

    travelStyle: varchar("travel_style", { length: 50 }),

    visibility: tripVisibilityEnum("visibility")
      .notNull()
      .default("private"),

    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id),

    // Used for itinerary concurrency control.
    itineraryVersion: integer("itinerary_version")
      .notNull()
      .default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("trips_owner_idx").on(table.ownerId),
    index("trips_start_date_idx").on(table.startDate),
  ]
);

export const tripMembers = pgTable(
  "trip_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    role: tripRoleEnum("role").notNull().default("viewer"),

    addedBy: uuid("added_by")
      .references(() => profiles.id, { onDelete: "set null" }),

    joinedAt: timestamp("joined_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("trip_members_trip_user_unique").on(
      table.tripId,
      table.userId
    ),
    index("trip_members_user_idx").on(table.userId),
  ]
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    email: varchar("email", { length: 255 }).notNull(),

    role: tripRoleEnum("role").notNull().default("viewer"),

    // Store a hash of the invitation token, not the raw token.
    tokenHash: text("token_hash").notNull().unique(),

    status: invitationStatusEnum("status")
      .notNull()
      .default("pending"),

    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => profiles.id),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("invitations_trip_idx").on(table.tripId),
    index("invitations_email_status_idx").on(
      table.email,
      table.status
    ),
  ]
);