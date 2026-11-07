import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  integer,
} from "drizzle-orm/pg-core";

import { documentTypeEnum } from "./enums";
import { trips } from "./trips";
import { profiles } from "./users";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),

    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => profiles.id),

    name: varchar("name", { length: 200 }).notNull(),

    type: documentTypeEnum("type")
      .notNull()
      .default("other"),

    // Path in a private Supabase Storage bucket.
    storagePath: text("storage_path").notNull(),

    mimeType: varchar("mime_type", { length: 100 }),

    fileSize: integer("file_size"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("documents_trip_idx").on(table.tripId),
  ]
);