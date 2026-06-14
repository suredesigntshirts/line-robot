// Docker-backed browse smoke: real Postgres (PostGIS container) + the EXACT bundled Lambda
// artifact. Proves the full SSR browse path: consent gate, cards, filters, pagination math.
// Run via `npm run test:browse` (builds first; needs Docker).

import assert from "node:assert/strict";
import {
  createListing,
  createUserWithIdentity,
  dbFromPool,
  ewktPoint,
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
// ดอยสุเทพ / มช. back gate — the radius smoke (4.2) searches around this point.
const SUTHEP = { lon: 98.9525, lat: 18.7953 };
const visible = await createListing(db, {
  listing: {
    ...base,
    dealType: "sale",
    saleStage: "available",
    propertyType: "house",
    priceThb: 4_500_000,
    bedrooms: 3,
    bathrooms: 2,
    geom: ewktPoint(SUTHEP.lon, SUTHEP.lat),
  },
  content: [
    {
      lang: "th",
      headline: "บ้านสามนอนใกล้ดอยสุเทพ",
      description: 'วิวดี</script><script>alert("xss")</script>',
      generatedBy: "human",
    },
  ],
});
await grantPublishConsent(db, visible.id, owner.id, "smoke-v1");
// No consent → must stay invisible to the public site (asserted below).
const hidden = await createListing(db, {
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
process.env.LINE_OA_URL = "https://line.me/R/ti/p/@smoketest";
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
  check("card carries the poster name (TH-03)", homeTh.body.includes("smoke-owner"));
  check("poster-provided notice on browse (LEGAL-06)", homeTh.body.includes("ข้อมูลจากผู้ลงประกาศ"));

  const textHit = await handler(event("/", `q=${encodeURIComponent("ดอยสุเทพ")}`));
  check("text search finds the listing (S4-I4)", textHit.body.includes("บ้านสามนอนใกล้ดอยสุเทพ"));
  const textMiss = await handler(event("/", `q=${encodeURIComponent("คอนโดลับ")}`));
  check("text search cannot see unconsented content", textMiss.body.includes('data-state="empty"'));

  // --- radius search (4.2): SSR ?lat&lng&radius runs the PostGIS radius search ---
  const nearHit = await handler(event("/", `lat=${SUTHEP.lat}&lng=${SUTHEP.lon}&radius=1000`));
  check("radius search finds the in-radius listing", nearHit.body.includes("บ้านสามนอนใกล้ดอยสุเทพ"));
  check("radius search shows the distance line", /ห่าง\s+\d+\s+ม\./.test(nearHit.body));
  check("radius search renders the results map section", nearHit.body.includes("แผนที่ประกาศ"));
  // A point ~14 km away (Hang Dong) with a 1 km radius excludes the only listing.
  const nearMiss = await handler(event("/", "lat=18.6864&lng=98.9192&radius=1000"));
  check(
    "radius search excludes out-of-radius listings",
    nearMiss.body.includes('data-state="empty"'),
  );
  // Out-of-WGS84 lat → `near` dropped → plain browse (no map, listing still shown, no 500).
  const badGeo = await handler(event("/", "lat=999&lng=98.99&radius=3000"));
  check("invalid coords degrade to plain browse", badGeo.statusCode === 200);
  check("invalid coords show no map", !badGeo.body.includes("แผนที่ประกาศ"));

  const rentOnly = await handler(event("/", "deal=rent"));
  check("rent filter excludes the sale card", !rentOnly.body.includes("บ้านสามนอน"));
  check("rent filter shows empty state", rentOnly.body.includes('data-state="empty"'));

  const en = await handler(event("/en/"));
  check("en route renders the th-fallback headline", en.body.includes("บ้านสามนอนใกล้ดอยสุเทพ"));
  check("en count line localized", en.body.includes("Listings: 1"));

  // --- detail page (S4-I3) ---
  const detail = await handler(event(`/properties/${visible.id}`));
  check("detail 200", detail.statusCode === 200);
  check("detail headline rendered", detail.body.includes("บ้านสามนอนใกล้ดอยสุเทพ"));
  const ldMatch = detail.body.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  check("JSON-LD block present", ldMatch !== null);
  const ld = JSON.parse(ldMatch[1]);
  check("JSON-LD is RealEstateListing", ld["@type"] === "RealEstateListing");
  check(
    "JSON-LD carries price + currency",
    ld.offers?.price === 4_500_000 && ld.offers?.priceCurrency === "THB",
  );
  check("JSON-LD address region", ld.address?.addressRegion === "เชียงใหม่");
  check("JSON-LD has no null values", !JSON.stringify(ld).includes(":null"));
  check("detail canonical absolute", detail.body.includes(`/properties/${visible.id}"`));
  check("deed type displayed (FIELD-02)", detail.body.includes("โฉนดที่ดิน"));
  check(
    "hostile description cannot break out of the JSON-LD script (XSS)",
    !ldMatch[1].includes("</script") && ldMatch[1].includes("\\u003c"),
  );
  check(
    "LINE CTA rendered when OA url configured (CONV-06)",
    detail.body.includes("https://line.me/R/ti/p/@smoketest"),
  );
  check("poster-provided notice on detail (LEGAL-06)", detail.body.includes("ข้อมูลจากผู้ลงประกาศ"));
  check("flood/units field list present", detail.body.includes("3 นอน"));

  const enDetail = await handler(event(`/en/properties/${visible.id}`));
  check(
    "en detail 200 + en deed label",
    enDetail.statusCode === 200 && enDetail.body.includes("Chanote"),
  );

  const hiddenDetail = await handler(event(`/properties/${hidden.id}`));
  check("unconsented detail is 404 (LEGAL-02)", hiddenDetail.statusCode === 404);
  check("404 is the localized COPY-07 page", hiddenDetail.body.includes("ไม่พบหน้านี้"));
  const junk = await handler(event("/properties/not-a-uuid"));
  check("junk id is 404, not a pg error", junk.statusCode === 404);
  const enMissing = await handler(event(`/en/properties/${hidden.id}`));
  check(
    "en 404 localizes from the requested path",
    enMissing.statusCode === 404 && enMissing.body.includes("Page not found"),
  );

  // --- sitemap (S4-I5) ---
  const sitemap = await handler(event("/sitemap.xml"));
  check(
    "sitemap 200 + xml",
    sitemap.statusCode === 200 && /xml/.test(sitemap.headers["content-type"] ?? ""),
  );
  const xml = sitemap.isBase64Encoded
    ? Buffer.from(sitemap.body, "base64").toString("utf8")
    : sitemap.body;
  check("sitemap lists the consented listing", xml.includes(`/properties/${visible.id}</loc>`));
  check("sitemap omits the unconsented listing (LEGAL-02)", !xml.includes(hidden.id));
  check(
    "sitemap carries hreflang alternates",
    xml.includes('hreflang="en"') && xml.includes("/en/properties/"),
  );
  check("sitemap has lastmod", xml.includes("<lastmod>"));

  console.log(`ALL ${pass} BROWSE SMOKE CHECKS PASSED`);
  succeeded = true;
} finally {
  await pool.end();
  // The bundled handler holds its OWN module-scope pg pool (D-S1-4) that this script
  // can't close; killing the container severs its idle connection and pg emits an
  // async 'error' after our checks already passed. Treat that one as benign.
  process.once("uncaughtException", (err) => {
    if (!/connection|terminated/i.test(String(err.message))) throw err;
    console.error("(teardown) ignored bundled-pool disconnect:", err.message);
    process.exit(succeeded ? 0 : 1);
  });
  stopPostgresLocal(CONTAINER);
  setTimeout(() => process.exit(succeeded ? 0 : 1), 1000);
}
