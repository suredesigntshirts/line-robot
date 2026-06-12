import { describe, expect, it } from "vitest";
import { specCatalog } from "./catalog.ts";
import { CALM, type ChaosProfile, MESSY_GROUP_CHAT } from "./chaosProfile.ts";
import { generateCase } from "./generator.ts";

const [SPK_LAND, RENT_CONDO, URGENT_HOUSE] = specCatalog(24);

/**
 * Stub extractor for the round-trip smoke (full eval is Stage 2): recovers a
 * few fields from the generated transcript with plain string heuristics. It
 * only understands our own rendering — that's the point: if generation drops
 * ground-truth signal, this stops recovering it.
 */
function stubExtract(transcript: string) {
  const deeds: Array<[string, string]> = [
    ["โฉนด", "chanote"],
    ["ส.ป.ก.", "spk"],
    ["น.ส.3ก", "ns3g"],
  ];
  const deed = deeds.find(([th]) => transcript.includes(th));
  const phones = [...transcript.matchAll(/0\d{1,2}[- ]\d{3}[- ]\d{3,4}/g)].map((m) => m[0]);
  const propertyCount = new Set(
    [...transcript.matchAll(/<photo (syn-[a-z0-9-]+?)(?:-repost)?#/g)].map((m) => m[1]),
  ).size;
  return {
    titleDeedType: deed?.[1],
    isRent: transcript.includes("ให้เช่า") || transcript.includes("For rent"),
    urgent: transcript.includes("ด่วน"),
    phones,
    propertyCount,
  };
}

describe("generateCase", () => {
  it("is deterministic for the same spec + profile", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const a = generateCase([URGENT_HOUSE], MESSY_GROUP_CHAT);
    const b = generateCase([URGENT_HOUSE], MESSY_GROUP_CHAT);
    expect(a.transcript).toBe(b.transcript);
    expect(a.expected).toEqual(b.expected);
  });

  it("changes output when the seed changes", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const a = generateCase([URGENT_HOUSE], MESSY_GROUP_CHAT);
    const b = generateCase([URGENT_HOUSE], { ...MESSY_GROUP_CHAT, seed: 43 });
    expect(a.transcript).not.toBe(b.transcript);
  });

  it("round-trips ส.ป.ก. land through the stub extractor (calm profile)", () => {
    if (!SPK_LAND) throw new Error("catalog missing");
    const c = generateCase([SPK_LAND], CALM);
    const got = stubExtract(c.transcript);
    expect(got.titleDeedType).toBe("spk");
    expect(got.isRent).toBe(false);
    expect(c.transcript).toContain("ไร่");
  });

  it("round-trips a rental condo", () => {
    if (!RENT_CONDO) throw new Error("catalog missing");
    const c = generateCase([RENT_CONDO], CALM);
    const got = stubExtract(c.transcript);
    expect(got.isRent).toBe(true);
    expect(c.transcript).toContain("/เดือน");
    expect(c.expected.properties[0]).toMatchObject({ dealType: "rent", priceThb: 12_000 });
  });

  it("injects urgency phrasing for quick_sale specs", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const c = generateCase([URGENT_HOUSE], { ...CALM, urgencyPhrases: true });
    expect(stubExtract(c.transcript).urgent).toBe(true);
  });

  it("emits a duplicate-repost dedup pair with price drift within bounds", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const profile: ChaosProfile = {
      ...CALM,
      duplicateRepost: { enabled: true, priceDriftPct: 0.05, contactDrift: true },
    };
    const c = generateCase([URGENT_HOUSE], profile);
    expect(c.expected.duplicatePairs).toEqual([["syn-urgent-house", "syn-urgent-house-repost"]]);
    // Two listing messages for one ground-truth property.
    const listingMessages = c.messages.filter((m) => m.text?.includes("ติดต่อ"));
    expect(listingMessages.length).toBe(2);
    expect(c.expected.properties).toHaveLength(1);
  });

  it("handles a multi-property dump with photo attribution ground truth", () => {
    const specs = specCatalog(24).slice(0, 3);
    const c = generateCase(specs, { ...CALM, photosOutOfOrder: true, seed: 7 });
    expect(c.expected.properties).toHaveLength(3);
    const got = stubExtract(c.transcript);
    expect(got.propertyCount).toBe(3);
    // Photo markers carry per-property attribution.
    for (const spec of specs) {
      const posted = c.messages.filter((m) => m.photoOf?.specId === spec.id).length;
      const expectedProp = c.expected.properties.find((p) => p.id === spec.id);
      expect(expectedProp?.photoCount).toBe(posted);
    }
  });

  it("drops photos per photosMissingRate and records the posted truth", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const c = generateCase([URGENT_HOUSE], { ...CALM, photosMissingRate: 0.5, seed: 99 });
    const posted = c.messages.filter((m) => m.photoOf).length;
    expect(posted).toBeLessThan(URGENT_HOUSE.photoCount);
    expect(c.expected.properties[0]?.photoCount).toBe(posted);
  });

  it("mid-thread correction: original message shows a stale price, correction restores truth", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const c = generateCase([URGENT_HOUSE], { ...CALM, midThreadCorrection: true });
    expect(c.transcript).toContain("แก้ไข");
    expect(c.transcript).toContain(URGENT_HOUSE.priceThb.toLocaleString("en-US"));
    expect(c.expected.properties[0]?.priceThb).toBe(URGENT_HOUSE.priceThb);
  });

  it("typoRate=1 perturbs the text while keeping it recoverable", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const clean = generateCase([URGENT_HOUSE], CALM);
    const typod = generateCase([URGENT_HOUSE], { ...CALM, typoRate: 1 });
    expect(typod.transcript).not.toBe(clean.transcript);
    expect(typod.transcript.length).toBe(clean.transcript.length); // transposition, not deletion
  });

  it("thaiAbbreviations renders ล้าน and ตร.ว. forms", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const c = generateCase([URGENT_HOUSE], { ...CALM, thaiAbbreviations: true });
    expect(c.transcript).toMatch(/ล้าน|ลบ\./);
    expect(c.transcript).toMatch(/ตร\.ว\.|ตร\.ม\./);
    expect(c.transcript).toContain("นอน"); // 3นอน 2น้ำ short form
  });

  it("languageMix=en renders an English listing; mixed renders per-RNG", () => {
    if (!URGENT_HOUSE) throw new Error("catalog missing");
    const en = generateCase([URGENT_HOUSE], { ...CALM, languageMix: "en" });
    expect(en.transcript).toContain("For sale");
    expect(en.transcript).toContain("M THB");
    const mixed = generateCase(specCatalog(24).slice(0, 6), {
      ...CALM,
      languageMix: "mixed",
      seed: 5,
    });
    expect(mixed.transcript).toMatch(/ขาย|ให้เช่า/);
    expect(mixed.transcript).toMatch(/For sale|For rent/);
  });

  it("catalog: ≥24 stable specs, hard cases pinned, all CNX-landmarked (FIELD-06)", () => {
    const specs = specCatalog(24);
    expect(specs.length).toBeGreaterThanOrEqual(24);
    expect(specs.map((s) => s.id)).toEqual(specCatalog(24).map((s) => s.id));
    expect(specs.some((s) => s.titleDeedType === "spk" && s.dealType === "sale")).toBe(true);
    expect(specs.some((s) => s.dealType === "rent")).toBe(true);
    expect(specs.some((s) => s.urgency === "quick_sale")).toBe(true);
    for (const s of specs) expect(s.landmark.length).toBeGreaterThan(0);
  });
});
