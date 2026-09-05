# 01 — Extract sentinel helpers + a single ExtractedProperty->Upsert mapping

> **Reconcile-pass note (queue 00).** This unit owns the sentinel helpers' canonical home
> (`core/domain/sentinel.ts`) and the `extractedToBaseUpsert` mapping. It is sequenced **FIRST** in the
> cleanup wave. Coordination:
> - **`app/ingestionSweep.ts`** is also decomposed by unit 05. Unit 05 explicitly **leaves the three
>   local sentinel helpers in place** (it states they are "owned by P1 #2 / this unit"). Land **01
>   before 05**: 01 deletes the local helpers + swaps the `applyProperty` upsert block; 05 then
>   decomposes the *rest* of the file (media pipeline, `buildConfirmation`, `mapWithConcurrency`) and
>   the pass-2 `memory` bug fix. The two edits touch different regions, but both edit the import block
>   and `applyProperty`, so run them **sequentially, never in parallel.** After 01 lands, 05 will find
>   `nullToUndef`/`emptyToUndef` already imported from `sentinel.ts` (not locally defined) — 05 leaves
>   those imports as-is.
> - **`adapters/anthropic/claudeExtractor.ts`** — 01 only removes the local `emptyToUndef` const and
>   adds an import; it does NOT touch any Zod schema, so the 16-union budget is untouched.

## Goal & rationale
Three identical sentinel helpers (`nullToUndef`, `emptyToUndef`, `listToUndef`) are copy-pasted across
`ingestionSweep.ts`, `editReplyHandler.ts`, and `claudeExtractor.ts`, and the ~24-field
`ExtractedProperty -> PropertyUpsert` field mapping exists in **two diverging copies** (sweep's
`applyProperty` L582-618 vs `EditReplyHandler.handle` L96-125 — the sweep applies chanote backfill,
the edit path does not). This is the top "duplication instead of extraction" finding
(`plans/cleanup/09-epoch-design-debt.md` refactor #1; patterns #1 and #6;
`plans/cleanup/04-adapters-ai-storage.md`). Create `core/domain/sentinel.ts` (layer-neutral) and
`core/handlers/propertyMapping.ts` (pure port->domain mapping) so a schema/field change is a single
edit, eliminating both forms of drift while staying behaviourally identical.

## Blast radius
- **Files created:**
  - `/home/user/src/line-robot/packages/bot/src/core/domain/sentinel.ts` — exports `nullToUndef`, `emptyToUndef`, `listToUndef`.
  - `/home/user/src/line-robot/packages/bot/src/core/handlers/propertyMapping.ts` — exports `extractedToBaseUpsert(e, chanote?)`.
  - `/home/user/src/line-robot/packages/bot/test/unit/sentinel.test.ts` — unit tests for the three helpers.
  - `/home/user/src/line-robot/packages/bot/test/unit/propertyMapping.test.ts` — unit tests for the mapping function.
- **Files modified:**
  - `/home/user/src/line-robot/packages/bot/src/app/ingestionSweep.ts` — delete local `nullToUndef`/`emptyToUndef`/`listToUndef` (L138-149); import `nullToUndef` from sentinel.ts and `extractedToBaseUpsert` from propertyMapping.ts; replace the inline upsert field block in `applyProperty` (L582-608) with a spread of `extractedToBaseUpsert(property, chanote)`. The `emptyToUndef` use in the label computation (L623) moves to importing from sentinel.ts.
  - `/home/user/src/line-robot/packages/bot/src/core/handlers/editReplyHandler.ts` — delete local `nullToUndef`/`emptyToUndef`/`listToUndef` (L23-33); import `extractedToBaseUpsert` from propertyMapping.ts; replace the inline upsert field block (L98-121) with a spread of `extractedToBaseUpsert(edit)`.
  - `/home/user/src/line-robot/packages/bot/src/adapters/anthropic/claudeExtractor.ts` — delete local `emptyToUndef` const (L397); import `emptyToUndef` from sentinel.ts. `toChanote` (L401-418) and `classifyImage` (L458,460) keep calling `emptyToUndef` unchanged. (Optional: `toChanote` may stay here — it is Zod-schema-coupled; do NOT move it.)
- **Files deleted:** none.
- **All call-sites to update:** (every line that references a now-removed local symbol)
  - `ingestionSweep.ts:138,144,147` — local helper definitions → DELETE.
  - `ingestionSweep.ts:441` — `nullToUndef(await this.deps.catalog.getMemoryDoc(key))` → now uses imported `nullToUndef` (no code change beyond the new import).
  - `ingestionSweep.ts:582-608` — inline upsert field block → replaced by `...extractedToBaseUpsert(property, chanote)`.
  - `ingestionSweep.ts:623` — `emptyToUndef(property.normalizedAddress) ?? emptyToUndef(property.projectName) ?? propertyId` → uses imported `emptyToUndef`.
  - `editReplyHandler.ts:23,28,31` — local helper definitions → DELETE.
  - `editReplyHandler.ts:98-121` — inline upsert field block → replaced by `...extractedToBaseUpsert(edit)`.
  - `claudeExtractor.ts:397` — local `emptyToUndef` const → DELETE (replaced by import).
  - `claudeExtractor.ts:403-415,458,460` — `emptyToUndef(...)` calls → use imported `emptyToUndef` (no change beyond the new import).
- **Tests touched:**
  - ADD `/home/user/src/line-robot/packages/bot/test/unit/sentinel.test.ts`.
  - ADD `/home/user/src/line-robot/packages/bot/test/unit/propertyMapping.test.ts`.
  - `/home/user/src/line-robot/packages/bot/test/unit/ingestionSweep.test.ts` — UNCHANGED (behaviour identical; no import of the moved symbols).
  - `/home/user/src/line-robot/packages/bot/test/unit/editReplyHandler.test.ts` — UNCHANGED.
  - `/home/user/src/line-robot/packages/bot/test/unit/claudeExtractor.test.ts` — UNCHANGED (the regression test imports `ExtractionSchema`/`ClassifiedImageSchema`, which do not move; no test of `emptyToUndef` lives here).
  - `/home/user/src/line-robot/packages/bot/test/integration/ingestionSweep.integration.test.ts` — UNCHANGED (behaviour test).

## Current code

### Sentinel helpers — three copies
`ingestionSweep.ts` L138-149:
```ts
function nullToUndef<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/** Extraction now uses sentinels (see ports/extraction.ts): `""` for absent text, `[]` for absent
 * lists — so set-if-present upserts never clobber a stored value with an empty one. */
function emptyToUndef(value: string): string | undefined {
  return value === "" ? undefined : value;
}
function listToUndef(value: readonly string[]): string[] | undefined {
  return value.length > 0 ? [...value] : undefined;
}
```
`editReplyHandler.ts` L23-33 — identical bodies (with its own doc comment).
`claudeExtractor.ts` L397 — arrow form: `const emptyToUndef = (v: string): string | undefined => (v === "" ? undefined : v);`

### Mapping copy A — `ingestionSweep.applyProperty` (L582-618, the part to extract is L582-608)
```ts
const upsert: PropertyUpsert = {
  propertyId,
  normalizedAddress: emptyToUndef(property.normalizedAddress),
  rawAddresses: emptyToUndef(property.rawAddress) ? [property.rawAddress] : undefined,
  projectName: emptyToUndef(property.projectName),
  lat: nullToUndef(property.lat),
  long: nullToUndef(property.long),
  // Backfill location from the title deed when the chat text didn't state it.
  district: emptyToUndef(property.district) ?? chanote?.district,
  subdistrict: emptyToUndef(property.subdistrict) ?? chanote?.subdistrict,
  province: emptyToUndef(property.province) ?? chanote?.province,
  propertyType: emptyToUndef(property.propertyType),
  status: emptyToUndef(property.status),
  askingPrice: nullToUndef(property.askingPrice),
  currency: emptyToUndef(property.currency),
  tags: listToUndef(property.tags),
  bedrooms: nullToUndef(property.bedrooms),
  bathrooms: nullToUndef(property.bathrooms),
  usableAreaSqm: nullToUndef(property.usableAreaSqm),
  landArea: emptyToUndef(property.landArea) ?? chanote?.landArea,
  floors: nullToUndef(property.floors),
  furnishing: emptyToUndef(property.furnishing),
  notes: emptyToUndef(property.notes),
  listingType: emptyToUndef(property.listingType),
  rentPrice: nullToUndef(property.rentPrice),
  contact: emptyToUndef(property.contact),
  source: emptyToUndef(property.source),
  // Keep the original shared map link (set-if-present, so it isn't cleared when none this batch).
  ...(mapUrl !== undefined ? { mapUrl } : {}),
  // Title-deed data from a chanote scan this batch (set-if-present).
  ...(chanote !== undefined ? { chanote } : {}),
  // Only set photos when this batch had images — never clobber existing photos with an empty list.
  ...(photos !== undefined ? { photos } : {}),
  updatedAt: now,
  lastActivityAt: now,
  ...(isNew ? { originConversationKey: key, createdAt: now } : {}),
};
```

### Mapping copy B — `EditReplyHandler.handle` (L96-125, the part to extract is L98-121)
```ts
const upsert: PropertyUpsert = {
  propertyId: before.propertyId,
  normalizedAddress: emptyToUndef(edit.normalizedAddress),
  rawAddresses: emptyToUndef(edit.rawAddress) ? [edit.rawAddress] : undefined,
  projectName: emptyToUndef(edit.projectName),
  lat: nullToUndef(edit.lat),
  long: nullToUndef(edit.long),
  district: emptyToUndef(edit.district),            // <-- NO chanote backfill (divergence)
  subdistrict: emptyToUndef(edit.subdistrict),
  province: emptyToUndef(edit.province),
  propertyType: emptyToUndef(edit.propertyType),
  status: emptyToUndef(edit.status),
  askingPrice: nullToUndef(edit.askingPrice),
  currency: emptyToUndef(edit.currency),
  tags: listToUndef(edit.tags),
  bedrooms: nullToUndef(edit.bedrooms),
  bathrooms: nullToUndef(edit.bathrooms),
  usableAreaSqm: nullToUndef(edit.usableAreaSqm),
  landArea: emptyToUndef(edit.landArea),            // <-- NO chanote backfill (divergence)
  floors: nullToUndef(edit.floors),
  furnishing: emptyToUndef(edit.furnishing),
  notes: emptyToUndef(edit.notes),
  listingType: emptyToUndef(edit.listingType),
  rentPrice: nullToUndef(edit.rentPrice),
  contact: emptyToUndef(edit.contact),
  source: emptyToUndef(edit.source),
  ...(mapUrl !== undefined ? { mapUrl } : {}),
  updatedAt: now,
  lastActivityAt: now,
};
```

**The only difference** between A and B is the chanote backfill on `district`, `subdistrict`,
`province`, `landArea` (`?? chanote?.<field>`). Everything else outside the extracted block
(`propertyId`, `mapUrl`, `chanote`, `photos`, timestamps, origin) is layered by the caller and stays
in the caller. Note: in copy A, `chanote` plays two roles — (1) backfill source for those four
fields, and (2) the stored `chanote` field via `...(chanote !== undefined ? { chanote } : {})`. The
extracted function only takes over role (1); the caller keeps spreading role (2).

## Target design

### New file: `core/domain/sentinel.ts`
Pure, dependency-free, layer-neutral. Exports the three helpers verbatim.
```ts
/**
 * Sentinel helpers shared by the extraction-result -> domain mappers. The extractor models absent
 * values as sentinels (see {@link ../ports/extraction.ts}) to stay under Anthropic's 16-nullable
 * limit: `""` = absent text, `[]` = absent list, `null` = absent number. These map each sentinel to
 * `undefined` so a set-if-present upsert never clobbers a stored value with an empty one.
 */

/** Absent number (`null`) -> `undefined`. (Numbers have no clean empty sentinel, so the schema keeps
 * them nullable — these are the only fields that stay `null` end-to-end.) */
export function nullToUndef<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/** Absent text (`""`) -> `undefined`. */
export function emptyToUndef(value: string): string | undefined {
  return value === "" ? undefined : value;
}

/** Absent list (`[]`) -> `undefined`; otherwise a fresh mutable copy. */
export function listToUndef(value: readonly string[]): string[] | undefined {
  return value.length > 0 ? [...value] : undefined;
}
```

### New file: `core/handlers/propertyMapping.ts`
One canonical `ExtractedProperty -> PropertyUpsert` field mapping. Pure core logic — imports only
domain/port types and `sentinel.ts`; NO infra (no DynamoDB/Anthropic/LINE). Returns the
extraction-derived fields only (no `propertyId`, no timestamps, no `mapUrl`/`photos`/`chanote`/origin
— those are the caller's non-extracted concerns). The optional `chanote` argument carries the
backfill that the sweep needs and the edit path omits.
```ts
/**
 * The single canonical map from one extracted property (port type, sentinel-filled) to the
 * extraction-derived slice of a {@link PropertyUpsert}. Both the ingestion sweep and the interactive
 * edit-reply handler call this so a field/schema change is one edit. Sentinels (`""` / `[]` / `null`)
 * become `undefined` (set-if-present, never clobber). The caller layers on the non-extracted fields
 * (`propertyId`, `updatedAt`/`lastActivityAt`, `mapUrl`, `photos`, the stored `chanote`, origin).
 */
import type { Chanote, PropertyUpsert } from "../domain/catalog.js";
import { emptyToUndef, listToUndef, nullToUndef } from "../domain/sentinel.js";
import type { ExtractedProperty } from "../ports/extraction.js";

/** The extraction-derived fields of an upsert: everything mapped from {@link ExtractedProperty},
 * minus the caller-owned `propertyId`. */
export type ExtractedUpsertFields = Omit<PropertyUpsert, "propertyId">;

/**
 * Map an extracted property to its upsert fields. When `chanote` is supplied (the ingestion sweep
 * path, which OCR'd a title deed this batch), its location fields backfill `district` / `subdistrict`
 * / `province` / `landArea` whenever the chat text didn't state them. The edit-reply path passes no
 * `chanote`, so no backfill is applied — preserving the existing per-path behaviour exactly.
 */
export function extractedToBaseUpsert(
  e: ExtractedProperty,
  chanote?: Chanote,
): ExtractedUpsertFields {
  return {
    normalizedAddress: emptyToUndef(e.normalizedAddress),
    rawAddresses: emptyToUndef(e.rawAddress) ? [e.rawAddress] : undefined,
    projectName: emptyToUndef(e.projectName),
    lat: nullToUndef(e.lat),
    long: nullToUndef(e.long),
    // Backfill location from the title deed when the chat text didn't state it (sweep only).
    district: emptyToUndef(e.district) ?? chanote?.district,
    subdistrict: emptyToUndef(e.subdistrict) ?? chanote?.subdistrict,
    province: emptyToUndef(e.province) ?? chanote?.province,
    propertyType: emptyToUndef(e.propertyType),
    status: emptyToUndef(e.status),
    askingPrice: nullToUndef(e.askingPrice),
    currency: emptyToUndef(e.currency),
    tags: listToUndef(e.tags),
    bedrooms: nullToUndef(e.bedrooms),
    bathrooms: nullToUndef(e.bathrooms),
    usableAreaSqm: nullToUndef(e.usableAreaSqm),
    landArea: emptyToUndef(e.landArea) ?? chanote?.landArea,
    floors: nullToUndef(e.floors),
    furnishing: emptyToUndef(e.furnishing),
    notes: emptyToUndef(e.notes),
    listingType: emptyToUndef(e.listingType),
    rentPrice: nullToUndef(e.rentPrice),
    contact: emptyToUndef(e.contact),
    source: emptyToUndef(e.source),
  };
}
```
Note: when `chanote` is `undefined`, `chanote?.<field>` is `undefined`, so e.g. `district` becomes
`emptyToUndef(e.district) ?? undefined` === `emptyToUndef(e.district)` — exactly the edit-path
behaviour. Behaviourally identical to both copies.

### Caller after-shape — `ingestionSweep.applyProperty`
```ts
const upsert: PropertyUpsert = {
  propertyId,
  ...extractedToBaseUpsert(property, chanote),
  // Keep the original shared map link (set-if-present, so it isn't cleared when none this batch).
  ...(mapUrl !== undefined ? { mapUrl } : {}),
  // Title-deed data from a chanote scan this batch (set-if-present).
  ...(chanote !== undefined ? { chanote } : {}),
  // Only set photos when this batch had images — never clobber existing photos with an empty list.
  ...(photos !== undefined ? { photos } : {}),
  updatedAt: now,
  lastActivityAt: now,
  ...(isNew ? { originConversationKey: key, createdAt: now } : {}),
};
```

### Caller after-shape — `EditReplyHandler.handle`
```ts
const upsert: PropertyUpsert = {
  propertyId: before.propertyId,
  ...extractedToBaseUpsert(edit),
  ...(mapUrl !== undefined ? { mapUrl } : {}),
  updatedAt: now,
  lastActivityAt: now,
};
```

## Step-by-step implementation

### Step 1 — create `core/domain/sentinel.ts`
Write the file exactly as in **Target design > sentinel.ts** above.

### Step 2 — create `core/handlers/propertyMapping.ts`
Write the file exactly as in **Target design > propertyMapping.ts** above.

### Step 3 — edit `app/ingestionSweep.ts`
1. Add imports near the existing imports (top of file):
   ```ts
   import { emptyToUndef, nullToUndef } from "../core/domain/sentinel.js";
   import { extractedToBaseUpsert } from "../core/handlers/propertyMapping.js";
   ```
   (Only `emptyToUndef` and `nullToUndef` are still used directly in this file — `nullToUndef` at the
   memory-doc line, `emptyToUndef` in the label computation. `listToUndef` is no longer referenced
   here, so do NOT import it.)
2. DELETE the three local function definitions L138-149 (the `nullToUndef`, `emptyToUndef`,
   `listToUndef` block, including the doc comment between them). Leave `mergeChanote` (L153) intact.
3. In `applyProperty`, replace the inline field block (current L582-608, i.e. from
   `normalizedAddress: emptyToUndef(...)` through `source: emptyToUndef(property.source),`) with a
   single line `...extractedToBaseUpsert(property, chanote),`. Keep `propertyId,` as the first key and
   keep the trailing spreads (`mapUrl`, `chanote`, `photos`, `updatedAt`, `lastActivityAt`, origin)
   exactly as they are. Result == **Caller after-shape — ingestionSweep.applyProperty** above.
4. Leave L623 (`emptyToUndef(property.normalizedAddress) ?? emptyToUndef(property.projectName) ?? propertyId`)
   and L441 (`nullToUndef(await this.deps.catalog.getMemoryDoc(key))`) as-is — they now resolve to the
   imported helpers.

### Step 4 — edit `core/handlers/editReplyHandler.ts`
1. Add import (near the existing imports):
   ```ts
   import { extractedToBaseUpsert } from "./propertyMapping.js";
   ```
   This file no longer references any sentinel helper directly, so do NOT import from sentinel.ts.
2. DELETE the three local function definitions L23-33 (`nullToUndef`, the doc comment, `emptyToUndef`,
   `listToUndef`).
3. Replace the inline field block (current L98-121, from `normalizedAddress: emptyToUndef(...)` through
   `source: emptyToUndef(edit.source),`) with `...extractedToBaseUpsert(edit),`. Keep
   `propertyId: before.propertyId,` first and the trailing `mapUrl`/`updatedAt`/`lastActivityAt`
   exactly. Result == **Caller after-shape — EditReplyHandler.handle** above.

### Step 5 — edit `adapters/anthropic/claudeExtractor.ts`
1. Add import (near the existing imports at top):
   ```ts
   import { emptyToUndef } from "../../core/domain/sentinel.js";
   ```
2. DELETE the local const at L397: `const emptyToUndef = (v: string): string | undefined => (v === "" ? undefined : v);`
3. Leave `toChanote` (L401-418) and `classifyImage` (L458,460) unchanged — they call the now-imported
   `emptyToUndef`. Do NOT move `toChanote` (it is coupled to the Zod `ChanoteSchema` and belongs next
   to the schema). Do NOT touch `ExtractedPropertySchema`, `ExtractionSchema`, `ClassifiedImageSchema`,
   `ChanoteSchema`, or any `output_config.format` schema — the 16-union budget must not move.

### Step 6 — add `test/unit/sentinel.test.ts` and `test/unit/propertyMapping.test.ts`
See **Tests** below.

## Tests
All behaviour stays identical — no bug fix is in scope. The two new tests pin the extracted units that
previously had NO isolated coverage (the divergence-danger gap).

### `test/unit/sentinel.test.ts`
```ts
import { describe, expect, it } from "vitest";
import { emptyToUndef, listToUndef, nullToUndef } from "../../src/core/domain/sentinel.js";

describe("sentinel helpers", () => {
  it("nullToUndef maps null -> undefined and passes through values (incl. 0/'' )", () => {
    expect(nullToUndef(null)).toBeUndefined();
    expect(nullToUndef(0)).toBe(0);
    expect(nullToUndef("")).toBe("");
    expect(nullToUndef(13.7)).toBe(13.7);
  });
  it("emptyToUndef maps '' -> undefined and passes through non-empty strings", () => {
    expect(emptyToUndef("")).toBeUndefined();
    expect(emptyToUndef("x")).toBe("x");
  });
  it("listToUndef maps [] -> undefined and copies non-empty lists", () => {
    expect(listToUndef([])).toBeUndefined();
    const src = ["a", "b"];
    const out = listToUndef(src);
    expect(out).toEqual(["a", "b"]);
    expect(out).not.toBe(src); // fresh mutable copy
  });
});
```

### `test/unit/propertyMapping.test.ts`
Build a blank all-sentinel `ExtractedProperty` (copy the `extracted()` factory used in the existing
unit tests) and assert:
- (a) all-sentinel input -> every mapped field is `undefined` (only the caller adds `propertyId`).
- (b) numeric `null` stays absent (`lat`/`askingPrice`/`bedrooms` etc. -> `undefined`).
- (c) non-empty strings pass through (`normalizedAddress`, `status`, ...).
- (d) `rawAddress` non-empty -> `rawAddresses: [value]`; empty -> `undefined`.
- (e) `tags` non-empty -> copied array; `[]` -> `undefined`.
- (f) chanote backfill: with `chanote` supplied and `e.district === ""`, output `district === chanote.district`;
  with `e.district === "Bang Rak"` the extracted value wins (no backfill).
- (g) NO `chanote` argument -> the four backfilled fields equal `emptyToUndef(e.<field>)` (i.e. the
  edit-path behaviour — backfill never silently applied).
```ts
import { describe, expect, it } from "vitest";
import { extractedToBaseUpsert } from "../../src/core/handlers/propertyMapping.js";
import type { ExtractedProperty } from "../../src/core/ports/extraction.js";

function extracted(over: Partial<ExtractedProperty> = {}): ExtractedProperty {
  return {
    existingPropertyId: "", ambiguous: false, ambiguousWith: [],
    normalizedAddress: "", rawAddress: "", projectName: "",
    lat: null, long: null, district: "", subdistrict: "", province: "",
    propertyType: "", status: "", askingPrice: null, currency: "", tags: [],
    bedrooms: null, bathrooms: null, usableAreaSqm: null, landArea: "",
    floors: null, furnishing: "", notes: "", listingType: "",
    rentPrice: null, contact: "", source: "", ...over,
  };
}

describe("extractedToBaseUpsert", () => {
  it("all-sentinel input -> every field undefined", () => {
    const u = extractedToBaseUpsert(extracted());
    for (const v of Object.values(u)) expect(v).toBeUndefined();
  });
  it("passes through non-empty strings and numbers; wraps rawAddress; copies tags", () => {
    const u = extractedToBaseUpsert(
      extracted({ normalizedAddress: "1 Sukhumvit", rawAddress: "1 sukhumvit rd",
        askingPrice: 5_500_000, tags: ["near-bts"], status: "lead" }),
    );
    expect(u.normalizedAddress).toBe("1 Sukhumvit");
    expect(u.rawAddresses).toEqual(["1 sukhumvit rd"]);
    expect(u.askingPrice).toBe(5_500_000);
    expect(u.tags).toEqual(["near-bts"]);
    expect(u.status).toBe("lead");
  });
  it("backfills location from chanote only when the extracted field is empty", () => {
    const chanote = { district: "Cd", subdistrict: "Cs", province: "Cp", landArea: "1 rai" };
    const u = extractedToBaseUpsert(extracted({ district: "Ed" }), chanote);
    expect(u.district).toBe("Ed");        // extracted wins
    expect(u.subdistrict).toBe("Cs");     // backfilled
    expect(u.province).toBe("Cp");
    expect(u.landArea).toBe("1 rai");
  });
  it("never backfills when no chanote is supplied (edit-path parity)", () => {
    const u = extractedToBaseUpsert(extracted({ district: "" }));
    expect(u.district).toBeUndefined();
    expect(u.landArea).toBeUndefined();
  });
});
```

Existing tests `ingestionSweep.test.ts`, `editReplyHandler.test.ts`, `claudeExtractor.test.ts`, and the
integration test must continue to pass unchanged — they are the behavioural parity guard (especially
the edit-reply test at editReplyHandler.test.ts:81-116 which exercises the full mapping path and would
fail if backfill were wrongly applied to the edit path).

## Verification
```
npm run typecheck   # tsc across workspaces — expect clean (baseline is clean)
npm run lint        # biome — expect clean
npm run test        # vitest unit — expect all pass incl. the two new specs + the 16-union regression guard (claudeExtractor.test.ts:153-170)
```
Integration (`npm --prefix packages/bot run test:integration`) is OPTIONAL here: the change is a pure
refactor of in-memory mapping with no persistence-shape change. Run it if docker is available for extra
confidence (`ingestionSweep.integration.test.ts` exercises the sweep upsert path end-to-end), but it is
not required to land this unit. The schema-regression test in `claudeExtractor.test.ts` MUST stay green
— it is the enforcement gate for the Anthropic 16-union limit.

## Dependencies & ordering
- No other change-unit must land first; this is foundational (it creates the canonical homes other
  units will import from). Recommended to land EARLY in the cleanup sequence.
- Shares files with later units: `ingestionSweep.ts` is also targeted by refactor #5 (IngestionSweep
  decomposition) in `plans/cleanup/09-epoch-design-debt.md`; `claudeExtractor.ts` is touched by
  refactors #1/#2 in `plans/cleanup/04-adapters-ai-storage.md` (F01/F02/F13). To minimise merge
  conflicts, land this unit before those, since it only DELETES the local helpers and swaps a block
  for a call (small, localised diffs) and creates new files those units can build on.

## Risk & rollback
- **Anthropic 16-union limit (highest project risk):** This unit creates two pure TS files with NO Zod
  schema and does NOT touch `ExtractedPropertySchema`/`ExtractionSchema`/`ClassifiedImageSchema`/
  `ChanoteSchema` or any `output_config.format`. The union count is unchanged; the regression test
  (`claudeExtractor.test.ts:153-170`) stays green. Risk: effectively zero, as long as Step 5 only
  removes the `emptyToUndef` const and adds an import — do not edit any schema.
- **Chanote-backfill divergence (highest behavioural risk):** The single most error-prone point is the
  `?? chanote?.<field>` backfill. The shared function takes an OPTIONAL `chanote`; the sweep passes it,
  the edit path omits it. When omitted, `chanote?.<field>` is `undefined`, so the `??` is a no-op and
  the edit path behaves exactly as before. The new propertyMapping test cases (f) and (g) pin both
  directions. A naive "extract the common block" that always-applied or always-dropped the backfill
  would be a silent bug — this design avoids it.
- **`rawAddress -> rawAddresses` wrapping:** Easy to miss because the field is renamed across the
  boundary; reproduced verbatim in the shared function (`emptyToUndef(e.rawAddress) ? [e.rawAddress] : undefined`)
  and pinned by test case (d).
- **Layering:** `sentinel.ts` lives in `core/domain/` (no infra imports). `propertyMapping.ts` lives in
  `core/handlers/` and imports only domain + port types + sentinel — no DynamoDB/Anthropic/LINE. The
  adapter (`claudeExtractor.ts`) importing FROM `core/domain/sentinel.ts` is correct hexagonal direction
  (adapter -> core). No layering violation introduced.
- **Rollback:** Pure refactor with no public-API change to callers' external behaviour. To back out,
  revert the three modified files and delete the four new files; nothing else references the new exports.

## Open questions / decisions
None. The prescribed signature (`extractedToBaseUpsert(e, chanote?) -> Omit<PropertyUpsert, "propertyId">`)
follows `plans/cleanup/09-epoch-design-debt.md` refactor #1 directly; the optional-`chanote` parameter
is the single defensible way to preserve the backfill divergence while collapsing to one mapping.
Status: ready.
