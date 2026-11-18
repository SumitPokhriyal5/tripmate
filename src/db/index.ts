import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Runtime database client.
 *
 * Connects through the Supabase transaction pooler (DATABASE_URL, port 6543).
 * Migrations use a separate session-pooler URL — see drizzle.config.ts.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add the Supabase transaction pooler URL (port 6543) to .env.local.",
  );
}

/**
 * In development, Next.js re-evaluates modules on every hot reload.
 * Without caching, each reload would open a new connection pool and
 * leak the old one, eventually exhausting the pooler's connection limit.
 * Storing the client on globalThis lets it survive reloads.
 */
const globalForDb = globalThis as unknown as {
  pgClient?: postgres.Sql;
};

const client =
  globalForDb.pgClient ??
  postgres(connectionString, {
    // Required for the transaction pooler: each transaction may run on a
    // different backend connection, so prepared statements can't persist.
    prepare: false,

    // Refuse unencrypted connections.
    ssl: "require",

    // Small per-instance pool. Supabase's pooler does the heavy lifting;
    // a few connections let parallel queries (e.g. Promise.all) run
    // concurrently instead of queuing behind each other.
    max: 5,

    // Release idle connections after 20s so we don't hold pooler slots.
    idle_timeout: 20,

    // Fail fast if the database is unreachable.
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle({ client, schema });

export type Database = typeof db;