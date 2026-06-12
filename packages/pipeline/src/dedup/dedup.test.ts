import { describe, expect, it } from "vitest";
import { CostLog } from "../cost.ts";
import type { StepContext } from "../steps/context.ts";
import { FakeStepLlm } from "../steps/fakeLlm.ts";
import type { ExtractedListing } from "../steps.ts";
import { specCatalog } from "../synthetic/catalog.ts";
import type { ListingSpec } from "../synthetic/spec.ts";
import { blockCandidates, type DedupCandidate } from "./candidateFinder.ts";
import { dedupConfig } from "./config.ts";
import {
  geohash,
  haversineM,
  jaccardSimilarity,
  normalizeAddress,
  trigramSimilarity,
} from "./normalize.ts";
import { dedupVerify } from "./verify.ts";

const CONFIG = dedupConfig();

function listingFromSpec(spec: ListingSpec, drift = 0): ExtractedListing {
  return {
    dealType: spec.dealType,
    propertyType: spec.propertyType,
    titleDeedType: spec.titleDeedType,
    priceThb: Math.round(spec.priceThb * (1 + drift)),
    urgency: spec.urgency,
    urgentBadge: spec.urgency === "quick_sale",
    title: `${spec.dealType === "sale" ? "ขาย" : "ให้เช่า"} ${spec.landmark}`,
    description: "",
    province: spec.province,
    amphoe: spec.amphoe,
    tambon: spec.tambon,
    landmark: spec.landmark,
    lat: spec.lat,
    lon: spec.lon,
    landRai: spec.landRai ?? null,
    landNgan: spec.landNgan ?? null,
    landWah: spec.landWah ?? null,
    landSqm: null,
    floorAreaSqm: spec.floorAreaSqm ?? null,
    bedrooms: spec.bedrooms ?? null,
    bathrooms: spec.bathrooms ?? null,
    facingDirection: null,
    contactPhone: spec.phone,
    posterName: spec.ownerName,
    lowConfidence: false,
  };
}

function candidateFromSpec(spec: ListingSpec): DedupCandidate {
  return {
    id: spec.id,
    deedNo: null,
    lat: spec.lat,
    lon: spec.lon,
    addressText: `${spec.landmark} ${spec.tambon} ${spec.amphoe} ${spec.province}`,
    summary: `${spec.propertyType} ${spec.landmark} ${spec.priceThb}THB`,
  };
}

describe("primitives", () => {
  it("normalizeAddress strips Thai admin prefixes and punctuation", () => {
    expect(normalizeAddress("ต.สุเทพ อ.เมือง จ.เชียงใหม่ ซ.9!")).toBe("สุเทพ เมือง เชียงใหม่ soi 9");
  });

  it("trigram similarity is 1 for identical, lower for variants", () => {
    const a = normalizeAddress("บ้านเดี่ยว ใกล้ มช. สุเทพ เชียงใหม่");
    const b = normalizeAddress("บ้านเดี่ยวใกล้มช. ต.สุเทพ จ.เชียงใหม่");
    expect(trigramSimilarity(a, a)).toBe(1);
    expect(trigramSimilarity(a, b)).toBeGreaterThan(0.55);
    expect(trigramSimilarity(a, "คอนโดริมปิง ฟ้าฮ่าม")).toBeLessThan(0.3);
  });

  it("jaccard handles token sets", () => {
    expect(jaccardSimilarity("a b c", "a b c")).toBe(1);
    expect(jaccardSimilarity("a b c d", "a b x y")).toBeCloseTo(2 / 6);
  });

  it("haversine: Nimman to Hang Dong is ~13km", () => {
    const d = haversineM(18.7995, 98.9683, 18.6864, 98.9192);
    expect(d).toBeGreaterThan(11_000);
    expect(d).toBeLessThan(15_000);
  });

  it("geohash precision 6 groups near points and splits far ones", () => {
    expect(geohash(18.7995, 98.9683, 6)).toBe(geohash(18.7996, 98.9684, 6));
    expect(geohash(18.7995, 98.9683, 6)).not.toBe(geohash(18.6864, 98.9192, 6));
  });
});

describe("blockCandidates (D2.6 keys: deed → geo → text, never text alone)", () => {
  const specs = specCatalog(24);
  const base = specs[2] as ListingSpec; // urgent house, ช้างเผือก

  it("deed-exact scores 1.0 and skips geo/text", () => {
    const extracted = { ...listingFromSpec(base), deedNo: "45678" };
    const pool: DedupCandidate[] = [
      { ...candidateFromSpec(base), id: "deed-match", deedNo: "45678", lat: 10.0, lon: 100.0 },
    ];
    const blocked = blockCandidates(extracted, pool, CONFIG);
    expect(blocked[0]).toMatchObject({ id: "deed-match", score: 1, reasons: ["deed_exact"] });
  });

  it("DEAL-09: matching text cannot resurrect a geo-disagreeing pair", () => {
    const extracted = listingFromSpec(base);
    const farTwin = { ...candidateFromSpec(base), id: "far-twin", lat: 19.9, lon: 99.8 };
    expect(blockCandidates(extracted, [farTwin], CONFIG)).toHaveLength(0);
  });

  it("text block works when either side lacks coordinates", () => {
    const extracted = { ...listingFromSpec(base), lat: null, lon: null };
    const candidate = { ...candidateFromSpec(base), id: "text-match", lat: null, lon: null };
    const blocked = blockCandidates(extracted, [candidate], CONFIG);
    expect(blocked[0]?.id).toBe("text-match");
    expect(blocked[0]?.reasons.join()).toContain("text_similar");
  });

  it("caps the block at config.blockCap", () => {
    const extracted = listingFromSpec(base);
    const pool = Array.from({ length: 20 }, (_, i) => ({
      ...candidateFromSpec(base),
      id: `near-${i}`,
    }));
    expect(blockCandidates(extracted, pool, CONFIG)).toHaveLength(CONFIG.blockCap);
  });
});

describe("synthetic dup pairs: blocking precision & recall ≥ 0.90 (acceptance)", () => {
  it("re-posts with drift block to their original; distinct listings don't pair up", () => {
    const specs = specCatalog(24);
    const pool = specs.map(candidateFromSpec);

    // Recall: every spec re-posted with ±5% price drift + jittered coords (~50m)
    // must include its original among the blocked candidates.
    let recalled = 0;
    for (const spec of specs) {
      const repost = listingFromSpec(
        { ...spec, lat: spec.lat + 0.0004, lon: spec.lon - 0.0004 },
        0.05,
      );
      const blocked = blockCandidates(repost, pool, CONFIG);
      if (blocked.some((c) => c.id === spec.id)) recalled += 1;
    }
    const recall = recalled / specs.length;

    // Precision: for each spec, candidates blocked from OTHER tambons with
    // other landmarks count as false positives if they outrank the true match.
    let truePositiveTop = 0;
    for (const spec of specs) {
      const repost = listingFromSpec(spec, 0.03);
      const blocked = blockCandidates(repost, pool, CONFIG);
      if (blocked[0]?.id === spec.id) truePositiveTop += 1;
    }
    const precisionAtTop = truePositiveTop / specs.length;

    expect(recall).toBeGreaterThanOrEqual(0.9);
    expect(precisionAtTop).toBeGreaterThanOrEqual(0.9);
  });
});

describe("dedupVerify", () => {
  function ctx(llm: FakeStepLlm): StepContext {
    return { llm, costLog: new CostLog(), mode: "sync" };
  }
  const specs = specCatalog(24);
  const base = specs[1] as ListingSpec;
  const extracted = listingFromSpec(base);
  const blocked = [
    { id: base.id, summary: "condo near Nimman", score: 0.85, reasons: ["geo_same_cell"] },
  ];

  it("merges when the verifier confirms a blocked candidate", async () => {
    const llm = new FakeStepLlm().enqueue("dedup", {
      decision: "merge",
      intoId: base.id,
      confidence: 0.93,
      reason: "same unit, price drift only",
    });
    const result = await dedupVerify(ctx(llm), extracted, blocked);
    expect(result).toMatchObject({ decision: "merge", intoId: base.id });
  });

  it("defaults to new on verify failure (spec: never silently merge)", async () => {
    const llm = new FakeStepLlm().enqueue("dedup", null);
    const result = await dedupVerify(ctx(llm), extracted, blocked);
    expect(result.decision).toBe("new");
    expect(result.reasons).toEqual(["verify_default_new"]);
  });

  it("rejects a merge into an id that was never blocked (hallucinated id)", async () => {
    const llm = new FakeStepLlm().enqueue("dedup", {
      decision: "merge",
      intoId: "prop-not-in-block",
      confidence: 0.99,
      reason: "?",
    });
    const result = await dedupVerify(ctx(llm), extracted, blocked);
    expect(result.decision).toBe("new");
  });

  it("deed-exact skips the LLM entirely", async () => {
    const llm = new FakeStepLlm(); // would throw if called
    const result = await dedupVerify(ctx(llm), extracted, [
      { id: "x", summary: "s", score: 1, reasons: ["deed_exact"] },
    ]);
    expect(result).toMatchObject({ decision: "merge", intoId: "x", score: 1 });
    expect(llm.requests).toHaveLength(0);
  });

  it("empty block → new without an LLM call", async () => {
    const llm = new FakeStepLlm();
    const result = await dedupVerify(ctx(llm), extracted, []);
    expect(result).toMatchObject({ decision: "new", reasons: ["no_candidates"] });
  });
});
