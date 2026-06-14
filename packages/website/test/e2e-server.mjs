// E2E test server (plan 20) — boots the REAL production build for Playwright, backed by a seeded
// Docker Postgres. It serves the built static client (`dist/client/_astro/*`) via sirv AND falls
// through to the SSR middleware (`dist/server/entry.mjs`) — faithfully reproducing the prod
// CloudFront(static)+Lambda(SSR) split. That split is the point: if a CSS asset 404s or a token
// fails to resolve, the page renders unstyled HERE exactly as it would in prod.
//
// It ALSO stands in for the private S3 archive: the website presigns `derivatives/*` thumb keys via
// `media.ts` against AWS_ENDPOINT_URL_S3, which we point at THIS server. The presigned URL is
// path-style (http://127.0.0.1:PORT/<bucket>/derivatives/<prop>/NN.jpg); we strip the prefix and
// serve the matching fixture under test/fixtures/property-images/. So 4.1 image rendering runs end
// to end locally with no AWS, no creds, real photos.
//
// NOT `astro dev` (different pipeline), NOT the component gallery (Tailwind). Needs Docker + a built
// `dist/` (run `astro build` first).

import { readFile } from "node:fs/promises";
import http from "node:http";
import { fileURLToPath } from "node:url";
import {
  createListing,
  createUserWithIdentity,
  dbFromPool,
  ewktPoint,
  grantPublishConsent,
  listings,
} from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import sirv from "sirv";

const CONTAINER = "linerobot-website-e2e";
const PORT = Number(process.env.E2E_PORT || 4321);
const BUCKET = "linerobot-archive-e2e";

// Point the website's S3 presigner at this very server (set BEFORE the SSR bundle is imported — its
// pg pool + S3 client read env at module load). The fake bucket never leaves localhost.
process.env.ARCHIVE_BUCKET = BUCKET;
process.env.AWS_ENDPOINT_URL_S3 = `http://127.0.0.1:${PORT}`;
process.env.AWS_ACCESS_KEY_ID ||= "test";
process.env.AWS_SECRET_ACCESS_KEY ||= "test";
process.env.AWS_REGION ||= "ap-southeast-1";

const connectionString = await startPostgresLocal(CONTAINER);
// The SSR bundle's pg pool (D-S1-4) + LINE CTA read these at module load — set before the import.
process.env.DATABASE_URL = connectionString;
process.env.LINE_OA_URL ||= "https://line.me/R/ti/p/@linerobot";
const pool = new pg.Pool({ connectionString, max: 2 });
const db = dbFromPool(pool);
await migrateDb(db);

// N fixture photos for a property: derivatives/<prop>/NN.jpg, exterior (01) is the hero (heroIndex 0).
const photos = (prop, n) =>
  Array.from({ length: n }, (_, i) => {
    const nn = String(i + 1).padStart(2, "0");
    return {
      s3Key: `originals/${prop}/${nn}.jpg`, // the archived ORIGINAL (required; website never reads it)
      thumbKey: `derivatives/${prop}/${nn}.jpg`, // the 640px web derivative the site presigns + serves
      kind: "photo",
      heroIndex: i,
    };
  });

// --- deterministic seed: fixed values so screenshots are stable run-to-run ---
const owner = await createUserWithIdentity(
  db,
  { displayName: "ภูมิ ผู้ลงประกาศ" },
  { provider: "line", providerSubject: "e2e", verifiedAt: new Date(0) },
);
const base = {
  ownerUserId: owner.id,
  titleDeedType: "chanote",
  province: "เชียงใหม่",
  amphoe: "เมืองเชียงใหม่",
  tambon: "สุเทพ",
};
const SUTHEP = { lon: 98.9525, lat: 18.7953 };

const house = await createListing(db, {
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
      headline: "บ้านเดี่ยวสามห้องนอน ใกล้ดอยสุเทพ",
      description: "บ้านสวยพร้อมอยู่ ใกล้มหาวิทยาลัยเชียงใหม่ เดินทางสะดวก",
      generatedBy: "human",
    },
    {
      lang: "en",
      headline: "3-Bedroom House near Doi Suthep",
      description: "Move-in ready, close to Chiang Mai University.",
      generatedBy: "llm",
    },
  ],
  media: photos("house", 7),
});
await grantPublishConsent(db, house.id, owner.id, "e2e");

const condo = await createListing(db, {
  listing: {
    ...base,
    dealType: "rent",
    saleStage: null,
    rentalStatus: "available",
    propertyType: "condo",
    priceThb: null,
  },
  content: [
    {
      lang: "th",
      headline: "คอนโดให้เช่า ใจกลางเมือง",
      description: "เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่",
      generatedBy: "human",
    },
  ],
  rental: { monthlyRent: 13_500, utilityRateType: "unknown" },
  media: photos("condo", 7),
});
await grantPublishConsent(db, condo.id, owner.id, "e2e");

// NPA / distressed house — exercises the calm provenance disclosure (DIST-01/02) + a 3rd gallery.
const npa = await createListing(db, {
  listing: {
    ...base,
    dealType: "sale",
    saleStage: "available",
    propertyType: "house",
    listingType: "npa",
    priceThb: 2_900_000,
    bedrooms: 2,
    bathrooms: 1,
    geom: ewktPoint(SUTHEP.lon, SUTHEP.lat),
  },
  content: [
    {
      lang: "th",
      headline: "บ้านเดี่ยว ทรัพย์ธนาคาร (NPA) ราคาพิเศษ",
      description: "ทรัพย์มือสองจากสถาบันการเงิน สภาพพร้อมปรับปรุง",
      generatedBy: "human",
    },
  ],
  media: photos("npa", 6),
});
await grantPublishConsent(db, npa.id, owner.id, "e2e");

// Pin freshness so visual snapshots are deterministic (this replaces the screenshot mask — all data
// is test data, so the date no longer needs hiding; it just needs to not flap day-to-day).
await db.update(listings).set({ updatedAt: new Date("2026-05-01T00:00:00Z") });

// --- HTTP: fake-S3 first, then static assets, then SSR ---
const fixturesDir = fileURLToPath(new URL("./fixtures/property-images/", import.meta.url));
const clientDir = fileURLToPath(new URL("../dist/client", import.meta.url));
const assets = sirv(clientDir, { dev: false, etag: true, maxAge: 0 });
const { handler: ssr } = await import("../dist/server/entry.mjs");

const CONTENT_TYPE = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const s3Prefix = `/${BUCKET}/derivatives/`;

const server = http.createServer(async (req, res) => {
  const path = decodeURIComponent((req.url || "").split("?")[0]);
  if (path.startsWith(s3Prefix)) {
    const rel = path.slice(s3Prefix.length); // <prop>/NN.jpg
    try {
      const buf = await readFile(fixturesDir + rel);
      const ext = rel.slice(rel.lastIndexOf(".") + 1).toLowerCase();
      res.writeHead(200, {
        "content-type": CONTENT_TYPE[ext] || "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(buf);
    } catch {
      res.writeHead(404).end("missing fixture");
    }
    return;
  }
  assets(req, res, () => ssr(req, res));
});
server.listen(PORT, () => {
  console.log(
    `e2e server: http://localhost:${PORT}  (house=${house.id} condo=${condo.id} npa=${npa.id})`,
  );
});

let closing = false;
const shutdown = () => {
  if (closing) return;
  closing = true;
  pool.end().catch(() => {});
  try {
    stopPostgresLocal(CONTAINER);
  } catch {}
  setTimeout(() => process.exit(0), 500);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
