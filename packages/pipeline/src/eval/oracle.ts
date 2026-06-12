import type { z } from "zod";
import type { LlmUsage, StepLlm, StepLlmRequest } from "../ports.ts";
import type { ListingSpec } from "../synthetic/spec.ts";

const ZERO: LlmUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 };

/**
 * HARNESS ONLY — never instantiated in production code paths.
 * Harness-smoke mode: answers segment/extract from the case's own ground-truth
 * specs. A perfect pipeline scores 1.0 — running `npm run eval` with the
 * oracle validates the harness plumbing end-to-end (case generation → steps →
 * scoring → scorecard), NOT model quality. The real baseline comes from
 * EVAL_LLM=anthropic with an API key (D2.1).
 */
export class OracleStepLlm implements StepLlm {
  // Explicit field: parameter properties aren't erasable under Node strip-only TS.
  private readonly specs: ListingSpec[];

  constructor(specs: ListingSpec[]) {
    this.specs = specs;
  }

  run<S extends z.ZodType>(request: StepLlmRequest<S>) {
    const value =
      request.step === "segment"
        ? this.segment()
        : request.step === "extract"
          ? this.extract(request)
          : request.step === "translate"
            ? this.translate()
            : request.step === "gate"
              ? this.gate()
              : null;
    const parsed = value === null ? null : request.schema.parse(value);
    return Promise.resolve({ value: parsed as z.infer<S> | null, usage: ZERO });
  }

  private segment() {
    return {
      segments: this.specs.map((spec, i) => ({
        label: spec.id,
        imageIndices: [i],
        mapIndex: null,
        existingPropertyId: "",
        ambiguous: false,
        ambiguousWith: [],
      })),
    };
  }

  /** A "perfect" translation for invariant scoring: target-language text, fields filled. */
  private translate() {
    return {
      title: "Perfect translated title",
      description: "Perfect translated description",
      notes: "",
    };
  }

  /** A "perfect" gate verdict — runGate layers the deterministic deed rules on top. */
  private gate() {
    return { pass: true, missing: [] };
  }

  private extract(request: StepLlmRequest<z.ZodType>) {
    const text = request.content.find((c) => c.type === "text");
    const spec =
      this.specs.find(
        (s) => text?.type === "text" && text.text.includes(`FOCUS SEGMENT: ${s.id}`),
      ) ?? this.specs[0];
    if (!spec) return null;
    return {
      dealType: spec.dealType,
      propertyType: spec.propertyType,
      titleDeedType: spec.titleDeedType,
      priceThb: spec.priceThb,
      urgency: spec.urgency,
      title: spec.landmark,
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
      floorAreaSqm: spec.floorAreaSqm ?? null,
      bedrooms: spec.bedrooms ?? null,
      bathrooms: spec.bathrooms ?? null,
      facingDirection: "",
      contactPhone: spec.phone,
      posterName: spec.ownerName,
      lowConfidence: false,
    };
  }
}
