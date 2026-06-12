import { describe, expect, it } from "vitest";
import { CostLog } from "../cost.ts";
import { classifyImage } from "./classify.ts";
import { STEP_MODELS, type StepContext } from "./context.ts";
import { extractListing } from "./extract.ts";
import { FakeStepLlm } from "./fakeLlm.ts";
import {
  classifySchema,
  countUnions,
  dedupVerifySchema,
  extractSchema,
  gateSchema,
  segmentSchema,
  translateSchema,
} from "./schemas.ts";
import { segmentTranscript, singleSegmentFallback } from "./segment.ts";

function ctx(llm: FakeStepLlm): StepContext {
  return { llm, costLog: new CostLog(), mode: "sync" };
}

const IMAGE = {
  s3Key: "derivatives/p/1-vision.jpg",
  mediaType: "image/jpeg",
  base64: "aGk=",
} as const;

const CLASSIFY_PROPERTY = {
  kind: "property",
  label: "house exterior",
  deedNo: "",
  deedProvince: "",
  landRai: null,
  landNgan: null,
  landWah: null,
  ocrText: "",
  lowConfidence: false,
};

const EXTRACT_BASE = {
  dealType: "sale",
  propertyType: "house",
  titleDeedType: "chanote",
  priceThb: 4_500_000,
  urgency: "normal",
  title: "บ้านเดี่ยวใกล้นิมมาน",
  description: "ขายบ้าน 3 นอน",
  province: "เชียงใหม่",
  amphoe: "เมืองเชียงใหม่",
  tambon: "สุเทพ",
  landmark: "ใกล้ มช.",
  lat: 18.79,
  lon: 98.96,
  landRai: 0,
  landNgan: 1,
  landWah: 50,
  floorAreaSqm: 180,
  bedrooms: 3,
  bathrooms: 2,
  facingDirection: "E",
  contactPhone: "081-234-5678",
  posterName: "คุณสมชาย",
  lowConfidence: false,
};

describe("schemas stay under the strict-output union cap (16)", () => {
  it.each([
    ["classify", classifySchema],
    ["segment", segmentSchema],
    ["extract", extractSchema],
    ["dedupVerify", dedupVerifySchema],
    ["translate", translateSchema],
    ["gate", gateSchema],
  ] as const)("%s schema ≤ 16 unions", (_name, schema) => {
    expect(countUnions(schema)).toBeLessThanOrEqual(16);
  });
});

describe("classifyImage", () => {
  it("classifies a property photo on haiku, no escalation", async () => {
    const llm = new FakeStepLlm().enqueue("classify", CLASSIFY_PROPERTY);
    const c = ctx(llm);
    const result = await classifyImage(c, IMAGE);
    expect(result).toMatchObject({ kind: "property", chanote: undefined });
    expect(llm.requests).toHaveLength(1);
    expect(llm.requests[0]?.model).toBe(STEP_MODELS.classify);
    expect(llm.requests[0]?.content[0]).toMatchObject({ type: "image" });
    expect(c.costLog.all()).toHaveLength(1);
  });

  it("escalates low-confidence chanote OCR to sonnet (D2.2 ladder)", async () => {
    const blurry = {
      ...CLASSIFY_PROPERTY,
      kind: "chanote",
      label: "title deed",
      deedNo: "456",
      deedProvince: "เชียงใหม่",
      lowConfidence: true,
    };
    const sharp = { ...blurry, deedNo: "45678", landRai: 1, lowConfidence: false };
    const llm = new FakeStepLlm().enqueue("classify", blurry).enqueue("classify", sharp);
    const result = await classifyImage(ctx(llm), IMAGE);
    expect(result?.chanote?.deedNo).toBe("45678");
    expect(llm.requests.map((r) => r.model)).toEqual([
      STEP_MODELS.classify,
      STEP_MODELS.classifyEscalation,
    ]);
  });

  it("returns null on a failed call (caller keeps the photo as plain media)", async () => {
    const llm = new FakeStepLlm().enqueue("classify", null);
    expect(await classifyImage(ctx(llm), IMAGE)).toBeNull();
  });
});

describe("segmentTranscript", () => {
  const input = {
    transcript: "ขายบ้าน A ... ขายที่ดิน B ...",
    mediaMarkers: [
      { index: 0, classify: null },
      { index: 1, classify: null },
    ],
    geoHints: [],
    candidates: [{ id: "prop-9", label: "บ้านเดี่ยวสุเทพ" }],
  };

  it("maps segments and turns empty existingPropertyId into null", async () => {
    const llm = new FakeStepLlm().enqueue("segment", {
      segments: [
        {
          label: "บ้าน A",
          imageIndices: [0],
          mapIndex: null,
          existingPropertyId: "prop-9",
          ambiguous: false,
          ambiguousWith: [],
        },
        {
          label: "ที่ดิน B",
          imageIndices: [1],
          mapIndex: null,
          existingPropertyId: "",
          ambiguous: false,
          ambiguousWith: [],
        },
      ],
    });
    const result = await segmentTranscript(ctx(llm), input);
    expect(result?.segments[0]?.existingPropertyId).toBe("prop-9");
    expect(result?.segments[1]?.existingPropertyId).toBeNull();
  });

  it("falls back to a single whole-transcript segment on failure", async () => {
    const llm = new FakeStepLlm().enqueue("segment", null);
    const result = (await segmentTranscript(ctx(llm), input)) ?? singleSegmentFallback(input);
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0]?.imageIndices).toEqual([0, 1]);
  });
});

describe("extractListing", () => {
  const input = { transcript: "...", focus: "บ้าน A", geoHints: [], candidates: [] };

  it("normalizes a clean extraction incl. landSqm computation", async () => {
    const llm = new FakeStepLlm().enqueue("extract", EXTRACT_BASE);
    const result = await extractListing(ctx(llm), input);
    expect(result).toMatchObject({
      titleDeedType: "chanote",
      landSqm: 400 + 200, // 1 ngan + 50 wah²
      facingDirection: "E",
      urgentBadge: false,
    });
  });

  it("COPY-05: strips ขายด่วน from the title into the badge; COPY-12: strips emoji", async () => {
    const llm = new FakeStepLlm().enqueue("extract", {
      ...EXTRACT_BASE,
      title: "ขายด่วน!! 🔥 บ้านเดี่ยวใกล้นิมมาน 🏡",
      urgency: "quick_sale",
    });
    const result = await extractListing(ctx(llm), input);
    expect(result?.title).toBe("บ้านเดี่ยวใกล้นิมมาน");
    expect(result?.urgentBadge).toBe(true);
    expect(result?.urgency).toBe("quick_sale");
  });

  it("FIELD-11: keeps the seller's stated facing direction as-claimed; '' maps to null", async () => {
    const llm = new FakeStepLlm().enqueue("extract", { ...EXTRACT_BASE, facingDirection: "" });
    const result = await extractListing(ctx(llm), input);
    expect(result?.facingDirection).toBeNull();
  });

  it("escalates lowConfidence to opus and uses the escalated answer", async () => {
    const llm = new FakeStepLlm()
      .enqueue("extract", { ...EXTRACT_BASE, priceThb: 450_000, lowConfidence: true })
      .enqueue("extract", { ...EXTRACT_BASE, priceThb: 4_500_000 });
    const result = await extractListing(ctx(llm), input);
    expect(result?.priceThb).toBe(4_500_000);
    expect(llm.requests.map((r) => r.model)).toEqual([
      STEP_MODELS.extract,
      STEP_MODELS.extractEscalation,
    ]);
  });

  it("FIELD-02: an unstated deed type arrives as 'unknown', never guessed", async () => {
    const llm = new FakeStepLlm().enqueue("extract", { ...EXTRACT_BASE, titleDeedType: "unknown" });
    const result = await extractListing(ctx(llm), input);
    expect(result?.titleDeedType).toBe("unknown");
  });

  it("returns null when both attempts fail", async () => {
    const llm = new FakeStepLlm().enqueue("extract", null);
    expect(await extractListing(ctx(llm), input)).toBeNull();
  });
});
