import { pgEnum } from "drizzle-orm/pg-core";

export const tripVisibilityEnum = pgEnum(
  "trip_visibility",
  ["private", "public"]
);

export const tripRoleEnum = pgEnum(
  "trip_role",
  ["owner", "editor", "viewer"]
);

export const invitationStatusEnum = pgEnum(
  "invitation_status",
  ["pending", "accepted", "expired", "revoked"]
);

export const expenseScopeEnum = pgEnum(
  "expense_scope",
  ["personal", "shared"]
);

export const expenseCategoryEnum = pgEnum(
  "expense_category",
  [
    "accommodation",
    "transport",
    "food",
    "activities",
    "shopping",
    "miscellaneous",
  ]
);

export const expenseSplitMethodEnum = pgEnum(
  "expense_split_method",
  ["equal", "custom"]
);

export const voteOptionEnum = pgEnum(
  "vote_option",
  ["yes", "no", "maybe"
]);

export const documentTypeEnum = pgEnum(
  "document_type",
  [
    "flight",
    "hotel",
    "train",
    "bus",
    "booking_confirmation",
    "other",
  ]
);

export const aiGenerationStatusEnum = pgEnum(
  "ai_generation_status",
  ["pending", "processing", "completed", "failed"]
);

export const messageRoleEnum = pgEnum(
  "message_role",
  ["user", "assistant", "system"]
);