import { createUserWithIdentity, type Db, dbFromPool } from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CostLog } from "../../src/cost.ts";
import { runPipeline } from "../../src/run.ts";
import type { StepContext } from "../../src/steps/context.ts";
import { FakeStepLlm } from "../../src/steps/fakeLlm.ts";

// ---------------------------------------------------------------------------
// A1 acceptance harness — "geo binds per-segment" (plan 23, group A).
//
// THE BUG (data loss): the per-segment extract loop used to pass the FULL
// conversation-level geoHints to EVERY segment, so a coordinate belonging to
// listing A was stamped onto B/C/… → they geo-blocked → the verifier merged
// them → distinct listings collapsed into one row.
//
// THE FIX: each segment is bound to its OWN map pin (segmenter mapIndex →
// coordByMapIndex), and that pin is applied AUTHORITATIVELY (the model's lat/lon
// is overwritten — the extract prompt never reads GEO HINTS, so it can't be
// trusted to honor it). This test drives the REAL runPipeline with a FakeStepLlm
// and asserts BOTH layers: (1) each segment's extract prompt receives only its
// own pin; (2) the PERSISTED geom is each listing's own pin (overriding the
// model's deliberately-wrong coords), or null for a pinless listing.
// Runs under `npm run test:integration -w @line-robot/pipeline` (needs Docker;
// no API key — uses FakeStepLlm).
// ---------------------------------------------------------------------------

const CONTAINER = "linerobot-geobind-it";

// Two real far-apart pins from the 2026-06-15 incident (14.15 km apart, §2.1).
const COORD_A = "18.72989755,98.96882414"; // property #1's pin ([MAP 0])
const COORD_B = "18.82638337,99.05647534"; // property #2's pin ([MAP 1])

function extractFixture(over: Record<string, unknown>) {
  return {
    dealType: "sale",
    propertyType: "house",
    titleDeedType: "chanote",
    priceThb: 2_000_000,
    urgency: "normal",
    title: "ขายบ้าน",
    description: "",
    province: "เชียงใหม่",
    amphoe: "เมืองเชียงใหม่",
    tambon: "สุเทพ",
    landmark: "x",
    lat: 18.0,
    lon: 98.0,
    landRai: null,
    landNgan: null,
    landWah: null,
    floorAreaSqm: null,
    bedrooms: null,
    bathrooms: null,
    facingDirection: "",
    contactPhone: "0810000000",
    posterName: "test",
    lowConfidence: false,
    ...over,
  };
}

function segment(label: string, mapIndex: number | null) {
  return {
    label,
    imageIndices: [],
    mapIndex,
    existingPropertyId: "",
    ambiguous: false,
    ambiguousWith: [],
  };
}

let pool: pg.Pool;
let db: Db;
let llm: FakeStepLlm;

/** The rendered `GEO HINTS:` line for the nth `extract` call (segment order). */
function geoHintsLine(n: number): string {
  const reqs = llm.requests.filter((r) => r.step === "extract");
  const text = (reqs[n]?.content ?? []).map((c) => (c.type === "text" ? c.text : "")).join("\n");
  return text.split("\n").find((line) => line.startsWith("GEO HINTS:")) ?? "";
}

beforeAll(async () => {
  const connectionString = await startPostgresLocal(CONTAINER);
  pool = new pg.Pool({ connectionString, max: 2 });
  db = dbFromPool(pool);
  await migrateDb(db);
  const owner = await createUserWithIdentity(
    db,
    { displayName: "geobind" },
    { provider: "line", providerSubject: "U-geobind", verifiedAt: new Date() },
  );

  // 3 distinct listings: #1 has pin [MAP 0], #2 has pin [MAP 1], #3 has NO pin
  // (the data-loss victim — property #3 in the incident inherited #2's coord).
  // Far-apart extracted coords so they never block each other (no dedup calls).
  llm = new FakeStepLlm()
    .enqueue("segment", {
      segments: [segment("seg-1", 0), segment("seg-2", 1), segment("seg-3", null)],
    })
    // Extracted coords are DELIBERATELY WRONG (1,1)/(2,2): the authoritative bind must overwrite
    // them with each segment's own pin. Segment 3 has no pin → model returns null → stays null.
    // Fully distinct admin text per segment so none text-block against another (no dedup calls).
    .enqueue(
      "extract",
      extractFixture({
        title: "A",
        landmark: "A-place",
        tambon: "tA",
        amphoe: "aA",
        province: "pA",
        lat: 1.0,
        lon: 1.0,
      }),
    )
    .enqueue(
      "extract",
      extractFixture({
        title: "B",
        landmark: "B-place",
        tambon: "tB",
        amphoe: "aB",
        province: "pB",
        lat: 2.0,
        lon: 2.0,
      }),
    )
    .enqueue(
      "extract",
      extractFixture({
        title: "C",
        landmark: "C-place",
        tambon: "tC",
        amphoe: "aC",
        province: "pC",
        lat: null,
        lon: null,
      }),
    )
    .enqueue("translate", { title: "House A", description: "", notes: "" })
    .enqueue("translate", { title: "House B", description: "", notes: "" })
    .enqueue("translate", { title: "House C", description: "", notes: "" })
    .enqueue("gate", { pass: true, missing: [] })
    .enqueue("gate", { pass: true, missing: [] })
    .enqueue("gate", { pass: true, missing: [] });
  const ctx: StepContext = { llm, costLog: new CostLog(), mode: "sync" };

  await runPipeline(ctx, db, {
    transcript:
      "[0m] U: listing one [MAP 0]\n[1m] U: listing two [MAP 1]\n[2m] U: listing three (no map)",
    ownerUserId: owner.id,
    photos: [],
    geoHints: [COORD_A, COORD_B], // conversation-level (segmentation context)
    coordByMapIndex: [COORD_A, COORD_B], // [MAP 0]→#1, [MAP 1]→#2 (segment 3 has no pin)
    contentLang: "th",
  });
});

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("A1: geo binds per-segment", () => {
  it("harness sanity: runPipeline issued one extract per segment", () => {
    expect(llm.requests.filter((r) => r.step === "extract")).toHaveLength(3);
  });

  it("gives each segment's extract only its own pin in the prompt (A1)", () => {
    // Segment 3 has NO pin of its own → receives neither coordinate.
    expect(geoHintsLine(2)).not.toContain(COORD_A);
    expect(geoHintsLine(2)).not.toContain(COORD_B);
    // Segment 1 must not receive segment 2's pin, and vice-versa.
    expect(geoHintsLine(0)).not.toContain(COORD_B);
    expect(geoHintsLine(1)).not.toContain(COORD_A);
    // Positive: each pinned segment DOES receive its own coordinate.
    expect(geoHintsLine(0)).toContain(COORD_A);
    expect(geoHintsLine(1)).toContain(COORD_B);
  });

  it("PERSISTS each listing's own pin authoritatively, overriding the model's lat/lon", async () => {
    const { rows } = await pool.query(
      `SELECT ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lon FROM listing`,
    );
    expect(rows).toHaveLength(3);
    const hasCoord = (lat: number, lon: number) =>
      rows.some(
        (r) =>
          r.lat !== null &&
          Math.abs(Number(r.lat) - lat) < 1e-4 &&
          Math.abs(Number(r.lon) - lon) < 1e-4,
      );
    // #1 and #2 persist THEIR OWN pins (not the model's wrong (1,1)/(2,2)); #3 persists null.
    expect(hasCoord(18.72989755, 98.96882414)).toBe(true); // segment 1's pin (COORD_A)
    expect(hasCoord(18.82638337, 99.05647534)).toBe(true); // segment 2's pin (COORD_B)
    expect(rows.filter((r) => r.lat === null)).toHaveLength(1); // segment 3: no pin → null
    expect(hasCoord(1, 1)).toBe(false); // the model's wrong coord was overridden
    expect(hasCoord(2, 2)).toBe(false);
  });
});
