import process from "node:process";
import pg from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { pgConnectionConfig } from "../../src/rdsCa.ts";

// Real-RDS test gate (A5). The TLS/CA bug (SELF_SIGNED_CERT_IN_CHAIN) slipped because every test ran
// against Docker Postgres, whose host is 127.0.0.1 — so pgConnectionConfig's verify-full-against-the-
// embedded-CA path was NEVER exercised by the suite. This gate connects to the REAL staging RDS
// endpoint (an rds.amazonaws.com host) so that exact CA-verification path runs for real.
//
// Opt-in: it needs live creds, so it only runs when DATABASE_URL points at an rds.amazonaws.com host
// (set it to the staging `dbConnectionString` Pulumi output). Otherwise it skips loudly rather than
// passing vacuously. Kept out of the default `npm run test` via its own vitest config
// (vitest.rds.config.ts) — run with `npm run test:rds -w @line-robot/db`.

const DATABASE_URL = process.env.DATABASE_URL;
const isRdsTarget = Boolean(DATABASE_URL?.includes("rds.amazonaws.com"));

const describeRds = isRdsTarget ? describe : describe.skip;

if (!isRdsTarget) {
  // A visible breadcrumb so a skipped gate is never mistaken for a passing one.
  console.warn(
    "test:rds SKIPPED — set DATABASE_URL to the staging RDS endpoint (rds.amazonaws.com) to run the real-RDS TLS gate",
  );
}

describeRds("real RDS TLS / CA verification (the path Docker tests can't reach)", () => {
  // DATABASE_URL is defined inside this block (isRdsTarget gates it), but TS can't narrow across the
  // describe boundary — assert it once.
  const url = DATABASE_URL as string;
  let client: pg.Client | undefined;

  afterAll(async () => {
    await client?.end();
  });

  it("pgConnectionConfig requests verify-full against the embedded CA for an RDS host", () => {
    const cfg = pgConnectionConfig(url);
    expect(cfg.ssl).toBeDefined();
    expect(cfg.ssl?.rejectUnauthorized).toBe(true);
    // The embedded bundle, not Node's trust store (which lacks the RDS CA).
    expect(cfg.ssl?.ca).toContain("BEGIN CERTIFICATE");
    // The in-URL sslmode (if any) is stripped so it can't override the explicit ssl object.
    expect(cfg.connectionString).not.toMatch(/sslmode=/);
  });

  it("connects to the live RDS endpoint with the bundled CA validating the server cert", async () => {
    // This is the assertion the Docker suite cannot make: if the embedded CA did NOT chain to the
    // live server cert, .connect() rejects with SELF_SIGNED_CERT_IN_CHAIN (exactly the prod break),
    // so a non-throwing connect IS the CA-validation proof. (pg's connect() resolves to the client,
    // not undefined — so we await it directly rather than asserting the resolved value.)
    client = new pg.Client({ ...pgConnectionConfig(url), connectionTimeoutMillis: 10_000 });
    await client.connect();

    const { rows } = await client.query("SELECT 1 AS ok");
    expect(rows[0].ok).toBe(1);
  });

  it("the established session is actually TLS-encrypted (force_ssl honoured)", async () => {
    if (client === undefined) throw new Error("client not connected");
    // biome-ignore lint/suspicious/noExplicitAny: pg does not type the internal connection socket.
    const encrypted = (client as any).connection?.stream?.encrypted;
    expect(encrypted).toBe(true);
  });
});
