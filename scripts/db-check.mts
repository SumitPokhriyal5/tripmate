/**
 * Database connectivity check.
 *
 * Verifies that both Supabase connection strings work:
 *   - DATABASE_URL            → transaction pooler (runtime queries)
 *   - DATABASE_URL_MIGRATIONS → session pooler   (Drizzle Kit migrations)
 *
 * Run with:
 *   node --env-file=.env.local scripts/db-check.mts
 *
 * This script deliberately does NOT import src/db or the schema,
 * so any failure here is a connection problem, not a code problem.
 */
import postgres from "postgres";

type Target = {
  label: string;
  envVar: string;
  expectedPort: string;
  // Transaction mode can't hold prepared statements across requests.
  prepare: boolean;
};

const targets: Target[] = [
  {
    label: "Runtime — transaction pooler",
    envVar: "DATABASE_URL",
    expectedPort: "6543",
    prepare: false,
  },
  {
    label: "Migrations — session pooler",
    envVar: "DATABASE_URL_MIGRATIONS",
    expectedPort: "5432",
    prepare: true,
  },
];

async function check(target: Target): Promise<void> {
  const url = process.env[target.envVar];

  if (!url) {
    throw new Error(`${target.envVar} is not set in .env.local`);
  }

  // Parse the URL only to report host and port. Never print the password.
  const { hostname, port } = new URL(url);

  if (port !== target.expectedPort) {
    console.warn(
      `⚠️  ${target.envVar} uses port ${port}, expected ${target.expectedPort}`,
    );
  }

  const sql = postgres(url, {
    prepare: target.prepare,
    max: 1, // one connection is enough for a check
    ssl: "require", // refuse to connect without encryption
    connect_timeout: 10, // seconds — fail fast instead of hanging
  });

  try {
    // First query: includes DNS lookup, TCP + TLS handshake and auth.
    const coldStart = performance.now();
    const [info] = await sql<
      { user: string; database: string; version: string }[]
    >`
      select
        current_user as "user",
        current_database() as "database",
        current_setting('server_version') as "version"
    `;
    const coldMs = Math.round(performance.now() - coldStart);

    // Second query: connection already open → pure network round trip.
    const warmStart = performance.now();
    await sql`select 1`;
    const warmMs = Math.round(performance.now() - warmStart);

    console.log(`✅ ${target.label}`);
    console.log(`   host:       ${hostname}:${port}`);
    console.log(`   user:       ${info.user}`);
    console.log(`   database:   ${info.database}`);
    console.log(`   postgres:   ${info.version}`);
    console.log(`   cold query: ${coldMs} ms (connect + TLS + auth + query)`);
    console.log(`   warm query: ${warmMs} ms (round trip only)\n`);
  } finally {
    // Always close the connection, even if the query failed.
    await sql.end({ timeout: 5 });
  }
}

let failed = false;

for (const target of targets) {
  try {
    await check(target);
  } catch (error) {
    failed = true;
    const err = error as { code?: string; message?: string };
    console.error(`❌ ${target.label}`);
    console.error(`   ${err.code ?? "ERROR"}: ${err.message ?? String(error)}\n`);
  }
}

// Non-zero exit code lets scripts/CI detect failure.
process.exitCode = failed ? 1 : 0;