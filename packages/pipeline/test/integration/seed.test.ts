import { readFile } from "node:fs/promises";
import { type Db, dbFromPool, findListingsNear } from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ckanIngestor } from "../../src/seed/ckanIngestor.ts";
import { seed } from "../../src/seed/seed.ts";
import { syntheticIngestor } from "../../src/seed/syntheticIngestor.ts";

const CONTAINER = "linerobot-seed-it";
const FIXTURE = new URL("../../src/seed/fixtures/ckan-led-sample.json", import.meta.url);

let pool: pg.Pool;
let db: Db;

beforeAll(async () => {
  const connectionString = await startPostgresLocal(CONTAINER);
  pool = new pg.Pool({ connectionString, max: 2 });
  db = dbFromPool(pool);
  await migrateDb(db);
});

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("db:seed (synthetic + ckan adapters through the same interface)", () => {
  it("loads ≥20 listings, 3 groups, and a role spread without error", async () => {
    const fixtureFetch = (async () =>
      new Response(await readFile(FIXTURE, "utf8"), { status: 200 })) as typeof fetch;

    const summary = await seed(db, [
      syntheticIngestor(24),
      ckanIngestor("https://example.org/datastore_search?resource_id=led", fixtureFetch),
    ]);

    expect(summary.listings).toBeGreaterThanOrEqual(20 + 2);
    expect(summary.groups).toBe(3);
    expect(summary.moderationFlagged).toBeGreaterThanOrEqual(1); // the pinned ส.ป.ก. sale

    const { rows: counts } = await pool.query(
      `SELECT
         (SELECT count(*) FROM listing)::int AS listings,
         (SELECT count(*) FROM "group")::int AS groups,
         (SELECT count(*) FROM listing_content)::int AS content,
         (SELECT count(DISTINCT kind) FROM role)::int AS role_kinds,
         (SELECT count(*) FROM group_membership)::int AS memberships,
         (SELECT count(*) FROM price_history)::int AS price_rows`,
    );
    const c = counts[0];
    expect(c.listings).toBe(summary.listings);
    expect(c.groups).toBe(3);
    expect(c.content).toBe(summary.listings); // one th row per listing (D-S1-8)
    expect(c.role_kinds).toBeGreaterThanOrEqual(2); // owner + broker at minimum
    expect(c.memberships).toBeGreaterThanOrEqual(summary.users);
    expect(c.price_rows).toBeGreaterThan(0);
  });

  it("spot-query: rentals carry listing_rental rows with defaults", async () => {
    const { rows } = await pool.query(
      `SELECT lr.deposit_months, lr.min_lease_months, lr.utility_rate_type
       FROM listing_rental lr JOIN listing l ON l.id = lr.listing_id
       WHERE l.deal_type = 'rent' LIMIT 1`,
    );
    expect(rows[0]).toMatchObject({
      deposit_months: 2,
      min_lease_months: 12,
      utility_rate_type: "unknown",
    });
  });

  it("spot-query: seeded geometry answers a CNX radius search", async () => {
    // มช. back gate — several synthetic specs cluster near here.
    const near = await findListingsNear(db, 98.9525, 18.7953, 3_000);
    expect(near.length).toBeGreaterThan(0);
  });
});
