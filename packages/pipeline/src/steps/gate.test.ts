import { describe, expect, it } from "vitest";
import { CostLog } from "../cost.ts";
import type { ExtractedListing } from "../steps.ts";
import type { StepContext } from "./context.ts";
import { FakeStepLlm } from "./fakeLlm.ts";
import { runGate } from "./gate.ts";
import { translateContent } from "./translate.ts";

function ctx(llm: FakeStepLlm): StepContext {
  return { llm, costLog: new CostLog(), mode: "sync" };
}

const EXTRACTED: ExtractedListing = {
  dealType: "sale",
  propertyType: "land",
  titleDeedType: "spk",
  priceThb: 850_000,
  urgency: "normal",
  urgentBadge: false,
  title: "ที่ดิน 2 ไร่",
  description: "",
  province: "เชียงใหม่",
  amphoe: "เมืองเชียงใหม่",
  tambon: "แม่เหียะ",
  landmark: "ติดคลอง",
  lat: null,
  lon: null,
  landRai: 2,
  landNgan: 0,
  landWah: 0,
  landSqm: 3200,
  floorAreaSqm: null,
  bedrooms: null,
  bathrooms: null,
  facingDirection: null,
  contactPhone: "053-321-456",
  posterName: "คุณวิชัย",
  lowConfidence: false,
};

const CLEAN_GATE = { pass: true, missing: [] };

describe("runGate (DF-6 contract)", () => {
  it("FIELD-03: ส.ป.ก. SALE hard-blocks deterministically, regardless of the model verdict", async () => {
    const llm = new FakeStepLlm().enqueue("gate", CLEAN_GATE);
    const result = await runGate(ctx(llm), {
      extracted: EXTRACTED,
      photoCount: 3,
      deedType: "spk",
      listingType: "sale",
    });
    expect(result.pass).toBe(false);
    expect(result.blockers).toEqual([
      { reason: "deed_not_transferable", promptKey: "blocked_deed_cannot_sell" },
    ]);
  });

  it("FIELD-03: rentals are exempt from the deed block", async () => {
    const llm = new FakeStepLlm().enqueue("gate", CLEAN_GATE);
    const result = await runGate(ctx(llm), {
      extracted: { ...EXTRACTED, dealType: "rent" },
      photoCount: 3,
      deedType: "spk",
      listingType: "rent",
    });
    expect(result.blockers).toEqual([]);
    expect(result.pass).toBe(true);
  });

  it("FIELD-02: unknown deed forces a required ask even when the model omits it", async () => {
    const llm = new FakeStepLlm().enqueue("gate", CLEAN_GATE);
    const result = await runGate(ctx(llm), {
      extracted: { ...EXTRACTED, titleDeedType: "unknown" },
      photoCount: 3,
      deedType: "unknown",
      listingType: "sale",
    });
    expect(result.pass).toBe(false);
    expect(result.missing[0]).toMatchObject({ field: "titleDeedType", promptKey: "ask_deed_type" });
  });

  it("CONV-01: missing photos arrive as 'important' (nudge), and don't block pass", async () => {
    const llm = new FakeStepLlm().enqueue("gate", {
      pass: true,
      missing: [{ field: "photos", severity: "important", promptKey: "ask_photos" }],
    });
    const result = await runGate(ctx(llm), {
      extracted: { ...EXTRACTED, titleDeedType: "chanote" },
      photoCount: 0,
      deedType: "chanote",
      listingType: "sale",
    });
    expect(result.pass).toBe(true);
    expect(result.missing).toHaveLength(1);
  });

  it("model failure → pass:false with a generic needs_review (→ moderation, D11)", async () => {
    const llm = new FakeStepLlm().enqueue("gate", null);
    const result = await runGate(ctx(llm), {
      extracted: { ...EXTRACTED, titleDeedType: "chanote" },
      photoCount: 3,
      deedType: "chanote",
      listingType: "sale",
    });
    expect(result.pass).toBe(false);
    expect(result.missing[0]?.promptKey).toBe("needs_review");
  });

  it("required missing fields block pass even when the model claims pass:true", async () => {
    const llm = new FakeStepLlm().enqueue("gate", {
      pass: true,
      missing: [{ field: "priceThb", severity: "required", promptKey: "ask_price" }],
    });
    const result = await runGate(ctx(llm), {
      extracted: { ...EXTRACTED, titleDeedType: "chanote", priceThb: null },
      photoCount: 3,
      deedType: "chanote",
      listingType: "sale",
    });
    expect(result.pass).toBe(false);
  });
});

describe("translateContent (D2.9)", () => {
  it("translates th → en and labels the row", async () => {
    const llm = new FakeStepLlm().enqueue("translate", {
      title: "Land 2 rai near the canal",
      description: "For sale",
      notes: "",
    });
    const result = await translateContent(ctx(llm), {
      fromLang: "th",
      title: "ที่ดิน 2 ไร่",
      description: "ขาย",
      notes: "",
    });
    expect(result).toMatchObject({ lang: "en", title: "Land 2 rai near the canal" });
  });

  it("returns null on failure — caller skips the row, gate flags translation pending", async () => {
    const llm = new FakeStepLlm().enqueue("translate", null);
    const result = await translateContent(ctx(llm), {
      fromLang: "en",
      title: "x",
      description: "y",
      notes: "",
    });
    expect(result).toBeNull();
  });
});
