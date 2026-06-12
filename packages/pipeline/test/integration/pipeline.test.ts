import { createUserWithIdentity, type Db, dbFromPool } from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CostLog } from "../../src/cost.ts";
import { runPipeline } from "../../src/run.ts";
import type { StepContext } from "../../src/steps/context.ts";
import { FakeStepLlm } from "../../src/steps/fakeLlm.ts";
import { specCatalog } from "../../src/synthetic/catalog.ts";
import { CALM } from "../../src/synthetic/chaosProfile.ts";
import { generateCase } from "../../src/synthetic/generator.ts";

const CONTAINER = "linerobot-pipeline-it";

let pool: pg.Pool;
let db: Db;
let ownerId: string;

const SPEC = specCatalog(24)[2]; // urgent house ช้างเผือก
if (!SPEC) throw new Error("catalog missing");
const CASE = generateCase([SPEC], CALM);

const EXTRACT_FIXTURE = {
  dealType: SPEC.dealType,
  propertyType: SPEC.propertyType,
  titleDeedType: SPEC.titleDeedType,
  priceThb: SPEC.priceThb,
  urgency: SPEC.urgency,
  title: `ขายบ้านเดี่ยว ${SPEC.landmark}`,
  description: "3 นอน 2 น้ำ",
  province: SPEC.province,
  amphoe: SPEC.amphoe,
  tambon: SPEC.tambon,
  landmark: SPEC.landmark,
  lat: SPEC.lat,
  lon: SPEC.lon,
  landRai: SPEC.landRai ?? null,
  landNgan: SPEC.landNgan ?? null,
  landWah: SPEC.landWah ?? null,
  floorAreaSqm: SPEC.floorAreaSqm ?? null,
  bedrooms: SPEC.bedrooms ?? null,
  bathrooms: SPEC.bathrooms ?? null,
  facingDirection: "",
  contactPhone: SPEC.phone,
  posterName: SPEC.ownerName,
  lowConfidence: false,
};

function fakeRun(opts: { merge?: string } = {}): StepContext {
  const llm = new FakeStepLlm()
    .enqueue("segment", {
      segments: [
        {
          label: "บ้าน",
          imageIndices: [0],
          mapIndex: null,
          existingPropertyId: "",
          ambiguous: false,
          ambiguousWith: [],
        },
      ],
    })
    .enqueue("extract", EXTRACT_FIXTURE)
    .enqueue("translate", {
      title: "House near the market",
      description: "3 bed 2 bath",
      notes: "",
    })
    .enqueue("gate", { pass: true, missing: [] });
  if (opts.merge) {
    llm.enqueue("dedup", {
      decision: "merge",
      intoId: opts.merge,
      confidence: 0.95,
      reason: "same house re-posted",
    });
  }
  return { llm, costLog: new CostLog(), mode: "sync" };
}

beforeAll(async () => {
  const connectionString = await startPostgresLocal(CONTAINER);
  pool = new pg.Pool({ connectionString, max: 2 });
  db = dbFromPool(pool);
  await migrateDb(db);
  const user = await createUserWithIdentity(
    db,
    { displayName: SPEC.ownerName },
    { provider: "line", providerSubject: "U-pipeline", verifiedAt: new Date() },
  );
  ownerId = user.id;
});

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("pipeline → Postgres round-trip (Increment 6 acceptance)", () => {
  let firstListingId: string;

  it("lands a listing with per-language rows, media, geometry, and price history", async () => {
    const ctx = fakeRun();
    const outcome = await runPipeline(ctx, db, {
      transcript: CASE.transcript,
      ownerUserId: ownerId,
      photos: [{ index: 0, s3Key: "conv/x/1/content.jpg" }],
      geoHints: [],
      contentLang: "th",
    });

    expect(outcome.droppedSegments).toEqual([]);
    expect(outcome.listings).toHaveLength(1);
    const first = outcome.listings[0];
    if (!first) throw new Error("no listing outcome");
    expect(first.decision.decision).toBe("new");
    expect(first.gate.pass).toBe(true);
    firstListingId = first.listingId;

    const { rows } = await pool.query(
      `SELECT l.price_thb::bigint AS price, l.title_deed_type, l.urgency,
              ST_Y(l.geom::geometry) AS lat,
              (SELECT count(*)::int FROM listing_content c WHERE c.listing_id = l.id) AS content_rows,
              (SELECT count(*)::int FROM listing_media m WHERE m.listing_id = l.id) AS media_rows,
              (SELECT count(*)::int FROM price_history p WHERE p.listing_id = l.id) AS price_rows
       FROM listing l WHERE l.id = $1`,
      [firstListingId],
    );
    expect(rows[0]).toMatchObject({
      title_deed_type: SPEC.titleDeedType,
      urgency: SPEC.urgency,
      content_rows: 2, // th + en (D2.9)
      media_rows: 1,
      price_rows: 1,
    });
    expect(Number(rows[0].price)).toBe(SPEC.priceThb);
    expect(rows[0].lat).toBeCloseTo(SPEC.lat, 4);
  });

  it("re-sweep is idempotent: the same thread merges instead of duplicating (writes idempotent)", async () => {
    const ctx = fakeRun({ merge: firstListingId });
    const outcome = await runPipeline(ctx, db, {
      transcript: CASE.transcript,
      ownerUserId: ownerId,
      photos: [{ index: 0, s3Key: "conv/x/1/content.jpg" }],
      geoHints: [],
      contentLang: "th",
    });

    expect(outcome.listings[0]?.decision).toMatchObject({
      decision: "merge",
      intoId: firstListingId,
    });
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM listing");
    expect(rows[0].n).toBe(1); // no duplicate row
    // Identical price on re-sweep → NO new audit row (idempotent, no history spam).
    const { rows: history } = await pool.query(
      "SELECT count(*)::int AS n FROM price_history WHERE listing_id = $1",
      [firstListingId],
    );
    expect(history[0].n).toBe(1);
  });

  it("a merged re-post with a DIFFERENT price records exactly one audit entry", async () => {
    const drifted = { ...EXTRACT_FIXTURE, priceThb: SPEC.priceThb - 100_000 };
    const llm = new FakeStepLlm()
      .enqueue("segment", {
        segments: [
          {
            label: "บ้าน",
            imageIndices: [0],
            mapIndex: null,
            existingPropertyId: "",
            ambiguous: false,
            ambiguousWith: [],
          },
        ],
      })
      .enqueue("extract", drifted)
      .enqueue("dedup", {
        decision: "merge",
        intoId: firstListingId,
        confidence: 0.95,
        reason: "price reduced re-post",
      })
      .enqueue("gate", { pass: true, missing: [] });
    const ctx: StepContext = { llm, costLog: new CostLog(), mode: "sync" };

    await runPipeline(ctx, db, {
      transcript: CASE.transcript,
      ownerUserId: ownerId,
      photos: [{ index: 0, s3Key: "conv/x/1/content.jpg" }],
      geoHints: [],
      contentLang: "th",
    });
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM price_history WHERE listing_id = $1",
      [firstListingId],
    );
    expect(rows[0].n).toBe(2);
    const { rows: listings } = await pool.query("SELECT count(*)::int AS n FROM listing");
    expect(listings[0].n).toBe(1);
  });

  it("FIELD-03: a ส.ป.ก. sale lands but is queued for moderation with the deed blocker", async () => {
    const spk = specCatalog(24)[0];
    if (!spk) throw new Error("catalog missing");
    const llm = new FakeStepLlm()
      .enqueue("segment", null) // exercise the single-segment fallback too
      .enqueue("extract", {
        ...EXTRACT_FIXTURE,
        dealType: "sale",
        propertyType: "land",
        titleDeedType: "spk",
        priceThb: spk.priceThb,
        landmark: spk.landmark,
        tambon: spk.tambon,
        lat: spk.lat,
        lon: spk.lon,
        bedrooms: null,
        bathrooms: null,
      })
      .enqueue("dedup", { decision: "new", intoId: "", confidence: 0.9, reason: "different area" })
      .enqueue("translate", { title: "SPK land", description: "", notes: "" })
      .enqueue("gate", { pass: true, missing: [] });
    const ctx: StepContext = { llm, costLog: new CostLog(), mode: "sync" };

    const outcome = await runPipeline(ctx, db, {
      transcript: generateCase([spk], CALM).transcript,
      ownerUserId: ownerId,
      photos: [],
      geoHints: [],
      contentLang: "th",
    });

    const listing = outcome.listings[0];
    if (!listing) throw new Error("no listing outcome");
    expect(listing.gate.pass).toBe(false);
    expect(listing.gate.blockers[0]?.reason).toBe("deed_not_transferable");
    const { rows } = await pool.query(
      "SELECT target_type, reason, status FROM moderation_item WHERE target_id = $1",
      [listing.listingId],
    );
    expect(rows[0]).toMatchObject({
      target_type: "listing",
      reason: "deed_not_transferable",
      status: "pending",
    });
  });
});
