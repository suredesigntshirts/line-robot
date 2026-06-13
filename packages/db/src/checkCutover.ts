import process from "node:process";
import pg from "pg";
import { pgConnectionConfig } from "./rdsCa.ts";

// `npm run db:check-cutover` — assert the v2 catalog-cutover invariants hold against the live
// database `DATABASE_URL` points at. Run after a flip or a deploy that touches the catalog path:
// it is the one-shot verifier that catches a split-brain (readers on the wrong store) or a TLS/CA
// regression before users hit it. Standalone (own pool, like migrate.ts) — never the Lambda pool.
//
// Each check prints a PASS/FAIL line and the script exits non-zero if any fails, so it doubles as a
// CI/ops gate. The connection itself goes through pgConnectionConfig(), so on the RDS host the
// SELF_SIGNED_CERT-in-chain fix (verify-full against the embedded CA) is exercised end to end.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

interface Check {
  name: string;
  run: (client: pg.Client) => Promise<void>;
}

// The invariants. Each throws (with a human-readable reason) when violated.
const checks: Check[] = [
  {
    // The catalog must be Postgres on the real RDS endpoint — not Docker, not a leftover local DB.
    // pgConnectionConfig only engages CA verification for an rds.amazonaws.com host, so this is also
    // the precondition for the TLS check below to mean anything.
    name: "DATABASE_URL targets the RDS endpoint (rds.amazonaws.com)",
    run: async () => {
      if (!connectionString.includes("rds.amazonaws.com")) {
        throw new Error(`host is not an RDS endpoint: ${redactHost(connectionString)}`);
      }
    },
  },
  {
    // The live connection is TLS-encrypted (rds.force_ssl=1 server-side; verify-full client-side).
    // pg exposes the negotiated TLS socket on the connection; ssl=false here would mean a plaintext
    // session slipped through (split-brain / a weakened connection string).
    name: "connection is TLS-encrypted (force_ssl + verify-full)",
    run: async (client) => {
      // biome-ignore lint/suspicious/noExplicitAny: pg does not type the internal connection socket.
      const ssl = (client as any).connection?.stream?.encrypted;
      if (ssl !== true) {
        throw new Error("the Postgres session is not encrypted (expected TLS to RDS)");
      }
    },
  },
  {
    // Catalog readers (bot processor + read-api + website) resolve listings from this table.
    name: "listing table is queryable",
    run: async (client) => {
      await client.query("SELECT count(*) FROM listing");
    },
  },
  {
    // The reminder sweep reads/claims follow-ups here; A1 added this table during the cutover.
    name: "listing_event table is queryable",
    run: async (client) => {
      await client.query("SELECT count(*) FROM listing_event");
    },
  },
  {
    // The reminder's only query (due_at <= now AND notified_at IS NULL) is served by this partial
    // index; its absence would silently table-scan or, worse, signal a missed migration.
    name: "listing_event_due partial index exists",
    run: async (client) => {
      const { rows } = await client.query(
        "SELECT 1 FROM pg_indexes WHERE tablename = 'listing_event' AND indexname = 'listing_event_due'",
      );
      if (rows.length === 0) throw new Error("listing_event_due index is missing");
    },
  },
  {
    // The reminder's claim path actually runs against the live schema (notified_at predicate + the
    // partial index) — proves the query plans, not just that the table exists.
    name: "reminder due-events query executes against the live schema",
    run: async (client) => {
      await client.query(
        "SELECT id FROM listing_event WHERE notified_at IS NULL AND due_at <= now() LIMIT 1",
      );
    },
  },
];

/** Strip the password from a connection string before logging it. */
function redactHost(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username}@${u.host}${u.pathname}`;
  } catch {
    return "<unparseable DATABASE_URL>";
  }
}

const client = new pg.Client({
  ...pgConnectionConfig(connectionString),
  connectionTimeoutMillis: 10_000,
});

let failures = 0;
try {
  await client.connect();
  console.log(`cutover invariant check → ${redactHost(connectionString)}`);
  for (const check of checks) {
    try {
      await check.run(client);
      console.log(`  PASS  ${check.name}`);
    } catch (error) {
      failures += 1;
      console.error(`  FAIL  ${check.name}: ${(error as Error).message}`);
    }
  }
} catch (error) {
  failures += 1;
  console.error("could not connect:", (error as Error).message);
} finally {
  await client.end();
}

if (failures > 0) {
  console.error(`\n${failures} cutover invariant(s) FAILED`);
  process.exitCode = 1;
} else {
  console.log(`\nall ${checks.length} cutover invariants hold`);
}
