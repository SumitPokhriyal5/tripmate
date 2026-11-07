import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import {
  expenseScopeEnum,
  expenseCategoryEnum,
  expenseSplitMethodEnum,
} from "./enums";

import { trips } from "./trips";
import { profiles } from "./users";
import { boolean } from "drizzle-orm/pg-core";

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 150 }).notNull(),

    description: text("description"),

    category: expenseCategoryEnum("category")
      .notNull()
      .default("miscellaneous"),

    scope: expenseScopeEnum("scope").notNull().default("personal"),

    amount: numeric("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    currency: varchar("currency", { length: 3 }).notNull().default("INR"),

    paidBy: uuid("paid_by")
      .notNull()
      .references(() => profiles.id),

    splitMethod: expenseSplitMethodEnum("split_method"),

    expenseDate: timestamp("expense_date", {
      withTimezone: true,
    }),

    receiptUrl: text("receipt_url"),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("expenses_trip_idx").on(table.tripId),
    index("expenses_trip_category_idx").on(table.tripId, table.category),
    index("expenses_paid_by_idx").on(table.paidBy),
  ],
);

export const expenseSplits = pgTable(
  "expense_splits",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),

    // The exact amount this member owes.
    amount: numeric("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    isSettled: boolean("is_settled").notNull().default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("expense_splits_expense_user_unique").on(
      table.expenseId,
      table.userId,
    ),
  ],
);
