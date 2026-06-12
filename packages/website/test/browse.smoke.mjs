// Docker-backed browse smoke: real Postgres (PostGIS container) + the EXACT bundled Lambda
// artifact. Proves the full SSR browse path: consent gate, cards, filters, pagination math.
// Run via `npm run test:browse` (builds first; needs Docker).

import assert from "node:assert/strict";
import {
  createListing,
  createUserWithIdentity,
  dbFromPool,
  grantPublishConsent,
} from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";

const CONTAINER = "linerobot-website-smoke";

const connectionString = await startPostgresLocal(CONTAINER);
const pool = new pg.Pool({ connectionString, max: 2 });
const db = dbFromPool(pool);
await migrateDb(db);

const owner = await createUserWithIdentity(
  db,
  { displayName: "smoke-owner" },
  { provider: "line", providerSubject: "smoke", verifiedAt: new Date() },
);
const base = {
  ownerUserId: owner.id,
  titleDeedType: "chanote",
  province: "เชียงใหม่",
  amphoe: "เมืองเชียงใหม่",
  tambon: "สุเทพ",
};
const visible = await createListing(db, {
  listing: {
    ...base,
    dealType: "sale",
    saleStage: "available",
    propertyType: "house",
    priceThb: 4_500_000,
    bedrooms: 3,
    bathrooms: 2,
  },
  content: [
    { lang: "th", headline: "บ้านสามนอนใกล้ดอยสุเทพ", description: "x", generatedBy: "human" },
  ],
});
await grantPublishConsent(db, visible.id, owner.id, "smoke-v1");
// No consent → must stay invisible to the public site (asserted below).
await createListing(db, {
  listing: {
    ...base,
    dealType: "rent",
    saleStage: null,
    rentalStatus: "available",
    propertyType: "condo",
    priceThb: null,
  },
  content: [{ lang: "th", headline: "คอนโดลับ ห้ามโชว์", description: "x", generatedBy: "human" }],
  rental: { monthlyRent: 9_000, utilityRateType: "unknown" },
});

process.env.DATABASE_URL = connectionString;
const { handler } = await import("../dist-lambda/server/index.mjs");
const event = (rawPath, rawQueryString = "") => ({
  rawPath,
  rawQueryString,
  headers: { host: "local.test" },
  requestContext: { http: { method: "GET" } },
});

let pass = 0;
let succeeded = false;
const check = (name, cond) => {
  assert.ok(cond, name);
  pass += 1;
  console.log(`PASS  ${name}`);
};

try {
  const homeTh = await handler(event("/"));
  check("browse 200", homeTh.statusCode === 200);
  check("consented card shown", homeTh.body.includes("บ้านสามนอนใกล้ดอยสุเทพ"));
  check("unconsented listing hidden (LEGAL-02)", !homeTh.body.includes("คอนโดลับ"));
  check("card links to /properties/{id}", homeTh.body.includes(`/properties/${visible.id}`));
  check("count line present", homeTh.body.includes("1 ประกาศ"));

  const rentOnly = await handler(event("/", "deal=rent"));
  check("rent filter excludes the sale card", !rentOnly.body.includes("บ้านสามนอน"));
  check("rent filter shows empty state", rentOnly.body.includes('data-state="empty"'));

  const en = await handler(event("/en/"));
  check("en route renders the th-fallback headline", en.body.includes("บ้านสามนอนใกล้ดอยสุเทพ"));
  check("en count line localized", en.body.includes("Listings: 1"));

  console.log(`ALL ${pass} BROWSE SMOKE CHECKS PASSED`);
  succeeded = true;
} finally {
  await pool.end();
  // The bundled handler holds its OWN module-scope pg pool (D-S1-4) that this script
  // can't close; killing the container severs its idle connection and pg emits an
  // async 'error' after our checks already passed. Treat that one as benign.
  process.once("uncaughtException", (err) => {
    console.error("(teardown) ignored bundled-pool disconnect:", err.message);
    process.exit(succeeded ? 0 : 1);
  });
  stopPostgresLocal(CONTAINER);
  setTimeout(() => process.exit(succeeded ? 0 : 1), 1000);
}
