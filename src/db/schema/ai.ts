import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import {
  messageRoleEnum,
  aiGenerationStatusEnum,
} from "./enums";

import { trips } from "./trips";
import { profiles } from "./users";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),

    title: varchar("title", { length: 150 }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("conversations_trip_idx").on(table.tripId),
    index("conversations_user_idx").on(table.userId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),

    role: messageRoleEnum("role").notNull(),

    content: text("content").notNull(),

    // Optional structured data for AI suggestions or tool results.
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt
    ),
  ]
);

export const aiGenerations = pgTable(
  "ai_generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    requestedBy: uuid("requested_by")
      .notNull()
      .references(() => profiles.id),

    model: varchar("model", { length: 100 }).notNull(),

    status: aiGenerationStatusEnum("status")
      .notNull()
      .default("pending"),

    // User's generation input.
    input: jsonb("input").notNull(),

    // Validated AI response.
    output: jsonb("output"),

    errorMessage: text("error_message"),

    idempotencyKey: varchar("idempotency_key", {
      length: 150,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("ai_generations_trip_created_idx").on(
      table.tripId,
      table.createdAt
    ),
    index("ai_generations_status_idx").on(table.status),
  ]
);