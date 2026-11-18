import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Drizzle Kit runs outside Next.js, so .env.local is not loaded for us.
// `quiet` suppresses dotenv's startup log line.
config({ path: ".env.local", quiet: true });

const migrationsUrl = process.env.DATABASE_URL_MIGRATIONS;

if (!migrationsUrl) {
  throw new Error(
    "DATABASE_URL_MIGRATIONS is not set. Add the Supabase session pooler URL (port 5432) to .env.local.",
  );
}

export default defineConfig({
  dialect: "postgresql",

  // Where our Drizzle table definitions live.
  schema: "./src/db/schema/index.ts",

  // Where generated SQL migration files are written.
  out: "./src/db/migrations",

  dbCredentials: {
    url: migrationsUrl,
  },

  // Only manage our own tables. Supabase owns `auth`, `storage`,
  // `realtime` and others; Drizzle must never try to alter them.
  schemaFilter: ["public"],

  // Supabase already creates roles like `anon`, `authenticated` and
  // `service_role`. This tells Drizzle Kit not to create or drop them
  // when we reference them in RLS policies.
  entities: {
    roles: {
      provider: "supabase",
    },
  },

  // Print the SQL statements Drizzle Kit runs.
  verbose: true,

  // Ask for confirmation before any destructive change (e.g. dropping a column).
  strict: true,
});