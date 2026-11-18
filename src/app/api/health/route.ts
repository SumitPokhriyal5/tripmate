import { sql } from "drizzle-orm";
import { connection, NextResponse } from "next/server";

import { db } from "@/db";

/**
 * GET /api/health
 *
 * Liveness check for the app and its database.
 * Returns 200 when the database answers, 503 when it doesn't.
 */
export async function GET() {
  // With Cache Components enabled, Next.js may try to prerender a route
  // at build time. A health check must reflect the *current* state, so we
  // explicitly mark this handler as request-time only.
  await connection();

  const startedAt = performance.now();

  try {
    await db.execute(sql`select 1`);

    return NextResponse.json(
      {
        status: "ok",
        database: "up",
        latencyMs: Math.round(performance.now() - startedAt),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    // Log details on the server only — never send internal errors to clients.
    console.error("[health] database check failed:", error);

    return NextResponse.json(
      { status: "error", database: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}