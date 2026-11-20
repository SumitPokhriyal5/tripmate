import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Postgres enums shared across the schema.
 *
 * Rule: only include values we are sure about. Adding a value later is a
 * one-line migration (ALTER TYPE ... ADD VALUE); removing or renaming one
 * requires recreating the type and migrating every column that uses it.
 */

// ─── Access ───────────────────────────────────────────────────────────

/** A member's permission level within a trip. */
export const tripRoleEnum = pgEnum("trip_role", ["owner", "editor", "viewer"]);

/**
 * Lifecycle of an invitation.
 * "Expired" is deliberately NOT a status: it is derived from `expires_at`,
 * so the database can never claim an out-of-date invitation is pending.
 */
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "declined",
  "revoked",
]);

// ─── Itinerary ────────────────────────────────────────────────────────

/** What kind of thing an activity is; drives icons and filters. */
export const activityCategoryEnum = pgEnum("activity_category", [
  "sightseeing",
  "food",
  "accommodation",
  "transport",
  "adventure",
  "shopping",
  "other",
]);

// ─── Budget ───────────────────────────────────────────────────────────

/** Personal expenses belong to one member; shared ones are split. */
export const expenseScopeEnum = pgEnum("expense_scope", ["personal", "shared"]);

/** What money was spent on. Independent of activity_category. */
export const expenseCategoryEnum = pgEnum("expense_category", [
  "accommodation",
  "transport",
  "food",
  "activities",
  "shopping",
  "miscellaneous",
]);

/**
 * How the user entered a shared expense's split.
 * expense_splits always stores each member's final amount; this only lets
 * the edit form reopen in the same mode.
 */
export const expenseSplitMethodEnum = pgEnum("expense_split_method", [
  "equal",
  "exact",
]);

// ─── Documents ────────────────────────────────────────────────────────

export const documentTypeEnum = pgEnum("document_type", [
  "flight",
  "hotel",
  "train",
  "bus",
  "booking_confirmation",
  "other",
]);

// ─── AI ───────────────────────────────────────────────────────────────

/** Reviewed again with ai.ts (batch 6). */
export const aiGenerationStatusEnum = pgEnum("ai_generation_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

/**
 * Provider-neutral chat roles. Gemini calls the assistant "model"; the
 * Gemini service maps between the two so the database never changes if
 * we switch AI providers.
 */
export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

// ─── TypeScript types derived from the enums ──────────────────────────

export type TripRole = (typeof tripRoleEnum.enumValues)[number];
export type InvitationStatus = (typeof invitationStatusEnum.enumValues)[number];
export type ActivityCategory = (typeof activityCategoryEnum.enumValues)[number];
export type ExpenseScope = (typeof expenseScopeEnum.enumValues)[number];
export type ExpenseCategory = (typeof expenseCategoryEnum.enumValues)[number];
export type ExpenseSplitMethod =
  (typeof expenseSplitMethodEnum.enumValues)[number];
export type DocumentType = (typeof documentTypeEnum.enumValues)[number];
export type AiGenerationStatus =
  (typeof aiGenerationStatusEnum.enumValues)[number];
export type MessageRole = (typeof messageRoleEnum.enumValues)[number];
