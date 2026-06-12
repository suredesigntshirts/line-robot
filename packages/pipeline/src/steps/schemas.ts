import {
  dealType,
  facingDirection,
  propertyType,
  titleDeedType,
  urgency,
} from "@line-robot/domain";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Per-step LLM output schemas (D2.8). Strict structured output caps a schema
// at 16 union-typed parameters; the per-step split keeps every schema far
// under it. House rule: required-with-sentinel for strings ("" = absent) and
// arrays ([] = absent); .nullable() reserved for numbers.
// ---------------------------------------------------------------------------

/** classify+ocr — vision on the 1568px derivative. */
export const classifySchema = z.object({
  kind: z.enum(["property", "chanote", "other"]),
  label: z.string(),
  // Chanote OCR fields; all sentinel/null when kind != chanote.
  deedNo: z.string(),
  deedProvince: z.string(),
  landRai: z.number().nullable(),
  landNgan: z.number().nullable(),
  landWah: z.number().nullable(),
  ocrText: z.string(),
  lowConfidence: z.boolean(),
});
// unions: 3 nullables

/** segment — split a multi-property dump and attribute photos. */
export const segmentSchema = z.object({
  segments: z.array(
    z.object({
      label: z.string(),
      imageIndices: z.array(z.number()),
      mapIndex: z.number().nullable(),
      existingPropertyId: z.string(), // "" = none
      ambiguous: z.boolean(),
      ambiguousWith: z.array(z.string()),
    }),
  ),
});
// unions: 1 nullable

/** extract — per-segment listing fields. */
export const extractSchema = z.object({
  dealType,
  propertyType,
  titleDeedType, // FIELD-02 enum; "unknown" when unstated
  priceThb: z.number().nullable(),
  urgency,
  title: z.string(),
  description: z.string(),
  province: z.string(),
  amphoe: z.string(),
  tambon: z.string(),
  landmark: z.string(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  landRai: z.number().nullable(),
  landNgan: z.number().nullable(),
  landWah: z.number().nullable(),
  floorAreaSqm: z.number().nullable(),
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  facingDirection: z.enum([...facingDirection.options, ""]), // "" = unstated (FIELD-11 as-claimed)
  contactPhone: z.string(),
  posterName: z.string(),
  lowConfidence: z.boolean(),
});
// unions: 9 nullables (numbers only) — well under the 16 cap

/** dedup verify — yes/no same-property judgment over the blocked candidates. */
export const dedupVerifySchema = z.object({
  decision: z.enum(["new", "merge"]),
  intoId: z.string(), // "" when decision = new
  confidence: z.number(),
  reason: z.string(),
});
// unions: 0

/** translate — constrained th↔en of already-structured content. */
export const translateSchema = z.object({
  title: z.string(),
  description: z.string(),
  notes: z.string(),
});
// unions: 0

/** gate — DF-6 missing/weak contract. */
export const gateSchema = z.object({
  pass: z.boolean(),
  missing: z.array(
    z.object({
      field: z.string(),
      severity: z.enum(["required", "important"]),
      promptKey: z.string(),
    }),
  ),
});
// unions: 0

/** Counts union-typed parameters the way the strict-output limit does (regression guard). */
export function countUnions(schema: z.ZodType): number {
  const json = JSON.stringify(z.toJSONSchema(schema));
  return (json.match(/"anyOf"|"oneOf"/g) ?? []).length;
}
