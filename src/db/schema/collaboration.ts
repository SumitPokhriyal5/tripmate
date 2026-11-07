import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { voteOptionEnum } from "./enums";
import { trips } from "./trips";
import { activities } from "./itinerary";
import { profiles } from "./users";

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    vote: voteOptionEnum("vote").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("votes_activity_user_unique").on(
      table.activityId,
      table.userId
    ),
  ]
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    activityId: uuid("activity_id")
      .references(() => activities.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),

    content: text("content").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("comments_trip_created_idx").on(
      table.tripId,
      table.createdAt
    ),
    index("comments_activity_idx").on(table.activityId),
  ]
);