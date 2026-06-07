# Plan 13 — Chanote OCR + Image Pipeline — Design Review

## Epoch summary

Plan 13 fixed the nullable-parameter extraction outage (27 → 8 by replacing `null` with sentinels),
then layered in: (a) a per-image classify/OCR pass that labels photos and reads title-deeds and
documents, (b) a two-pass extraction pipeline where pass 1 segments a batch into distinct
properties and attributes their images/maps, and pass 2 runs a focused field-extraction per
property, and (c) resilience features — abandon conversations after repeated failed ingestion
attempts, and drop permanently-rejected LINE events rather than burning SQS retries.

---

## Design concerns introduced

### [D01] Memory note silently omitted from every pass-2 extraction call

**Severity:** high
**File(s):** `packages/bot/src/app/ingestionSweep.ts:484–491`

**What was introduced:** The two-pass path calls `segmenter.segment()` with `memory` (line 450)
but every subsequent `extractor.extract()` call in the `for (const segment …)` loop omits the
`memory` field entirely (lines 484–491). The `singlePassFallback()` path correctly passes `memory`
(line 527).

**Why it's a problem:** The conversation memory note is the primary mechanism for resolving aliases
("the Thonglor plot", "Khun Mali's land") and area abbreviations. When it is absent from the
focused extraction calls, every property in a two-property-or-more batch is extracted without that
context, silently producing worse data quality than the single-pass fallback it replaced. There is
no test that asserts `req.memory` is populated during the two-pass path (the two-pass test at line
507 in `ingestionSweep.test.ts` never sets a `memory` option and never checks `req.memory`).

**Better approach:** Add `memory` to the `ExtractionRequest` literal at lines 484–491:
```ts
const result = await this.deps.extractor.extract({
  conversationKey: key,
  text: transcript,
  media: [],
  geoHints: segGeo,
  candidates,
  memory,          // ← missing
  focus: segment.label,
});
```
Add a test case that sets `opts.memory`, runs a two-property batch through the two-pass path, and
asserts that each `extractRequest.memory` equals the stored note.

---

### [D02] `emptyToUndef` / `listToUndef` defined three times across three files

**Severity:** medium
**File(s):**
- `packages/bot/src/app/ingestionSweep.ts:144–148`
- `packages/bot/src/core/handlers/editReplyHandler.ts:28–32`
- `packages/bot/src/adapters/anthropic/claudeExtractor.ts:397` (`emptyToUndef` only)

**What was introduced:** The sentinel-stripping helpers `emptyToUndef` and `listToUndef` were
copy-pasted into every file that needed them rather than extracted once. The three copies have
identical semantics and are module-private in each.

**Why it's a problem:** The sentinel contract (empty string = absent; empty array = absent) is an
invariant that spans the extraction port boundary: `ExtractionRequest` → `ExtractedProperty` →
`PropertyUpsert`. All callers on the "consume sentinels" side must agree. A divergent copy (e.g.
one that also treats `"null"` as absent, or forgets `readonly`) would silently corrupt data. There
is no single place to find or update the rule.

**Better approach:** Export both helpers from `packages/bot/src/core/ports/extraction.ts` (or a
small `packages/bot/src/core/domain/sentinel.ts` module if the domain layer is preferred) and
import them everywhere. One canonical location also makes the invariant visible next to the port
types that define it.

---

### [D03] `ClassifiedMedia` internal interface duplicates `ImageClassification` from the port

**Severity:** medium
**File(s):**
- `packages/bot/src/app/ingestionSweep.ts:56–65` (`ClassifiedMedia`)
- `packages/bot/src/core/ports/extraction.ts:22–33` (`ImageClassification`)

**What was introduced:** `ClassifiedMedia` is a private interface in `ingestionSweep.ts` that
carries `s3Key` and `contentType` alongside the classifier's result fields (`kind`, `label`,
`chanote`, `ocrText`). Its shape is a manual union of `{ s3Key, contentType }` with
`ImageClassification`, rather than being expressed as a composition of the port type.

**Why it's a problem:** If `ImageClassification` gains a new field (e.g. `confidence`, or an
additional subtype), `ClassifiedMedia` and the downstream `buildTranscript` / `collectPhotos` /
`collectChanote` functions must all be updated in sync. The connection is invisible — there is no
structural link between the two types, so a type-safe refactor of the port does not automatically
surface the divergence in `ClassifiedMedia`.

**Better approach:** Define `ClassifiedMedia` as a composition:
```ts
interface ClassifiedMedia extends ImageClassification {
  readonly s3Key: string;
  readonly contentType: string;
}
```
Or, since `ImageClassification` can be null on failure, keep a discriminated union:
```ts
type ClassifiedMedia =
  | { readonly s3Key: string; readonly contentType: string; readonly classification: ImageClassification }
  | { readonly s3Key: string; readonly contentType: string; readonly classification: null };
```
Either approach makes the structural dependency on the port explicit.

---

### [D04] `ClaudeExtractor` implements both `PropertyExtractor` and `PropertySegmenter` — two roles, one class

**Severity:** medium
**File(s):** `packages/bot/src/adapters/anthropic/claudeExtractor.ts:288`

**What was introduced:** `ClaudeExtractor` was extended to `implements PropertyExtractor,
PropertySegmenter` — adding `segment()` as a second public method. The lambda wiring in
`packages/bot/src/lambda/sweep.ts` passes the same instance to both `extractor` and `segmenter`
slots of `IngestionSweepDeps`.

**Why it's a problem:** `PropertySegmenter` and `PropertyExtractor` are separate ports for a good
reason: they have different system prompts, different output schemas, and are expected to use
different model tiers (segmenter uses the cheap primary tier; extractor escalates). Collapsing them
into one class means: (a) the segmenter inherits the extractor's model ladder even though it should
always stay on the cheap tier; (b) adding a second ladder (or configuration) requires polluting the
extractor class; (c) tests that want to stub only one of the two roles still get the full extractor.
The comment in `sweep.ts` ("one instance, two roles") signals the shortcut.

**Better approach:** Extract `ClaudeSegmenter` as a small sibling class next to `ClaudeExtractor`,
with its own `createClaudeSegmenter` factory. It takes only a single model string (not a ladder),
keeping the cheap-tier intent enforced by the type. The lambda wires them as separate instances.
This matches the existing `ClaudeImageClassifier` pattern introduced in the same epoch.

---

### [D05] `IMAGE_MEDIA_TYPES` and `IMAGE_TYPES_FOR_CLASSIFY` are identical sets defined twice in the same file

**Severity:** low
**File(s):** `packages/bot/src/adapters/anthropic/claudeExtractor.ts:48` and `:421`

**What was introduced:** Two `Set<string>` constants containing the same four MIME types
(`image/jpeg`, `image/png`, `image/gif`, `image/webp`) were defined at the top and bottom of the
file for two different uses — one guards `buildExtractionContent`'s image blocks, the other guards
the new `mediaBlock()` helper used by `ClaudeImageClassifier`.

**Why it's a problem:** Adding or removing a supported image type requires two edits. The names
differ (`IMAGE_MEDIA_TYPES` vs `IMAGE_TYPES_FOR_CLASSIFY`), so a reader may not notice they are
identical or understand why they differ. When `ClaudeImageClassifier` was added as a new class in
the same file, it could have reused the existing constant.

**Better approach:** Consolidate into a single `SUPPORTED_IMAGE_MEDIA_TYPES` constant at the top
of the file and reference it from both `buildExtractionContent` and `mediaBlock`.

---

### [D06] `mapWithConcurrency` is a general utility buried inside application orchestration code

**Severity:** low
**File(s):** `packages/bot/src/app/ingestionSweep.ts:229–248`

**What was introduced:** A generic bounded-concurrency map function was added as a module-level
function inside `ingestionSweep.ts`. It is general-purpose (no domain knowledge), well-named, and
correct — but lives in a domain-specific orchestration file.

**Why it's a problem:** The next feature that needs fan-out I/O (e.g. parallel presigned-URL
generation, parallel message sends) will either copy it or import it from an odd location
(`../app/ingestionSweep`). A utility that is not co-located with peer utilities is invisible to
contributors looking for reuse.

**Better approach:** Move it to a small `packages/bot/src/core/utils/concurrency.ts` (or alongside
the existing domain utilities). It is already pure and has no dependencies.

---

### [D07] `toPhotos` migration function uses `unknown` cast without validating `s3Key` presence

**Severity:** low
**File(s):** `packages/bot/src/adapters/dynamodb/catalogRepository.ts:285–302`

**What was introduced:** The on-read migration for legacy bare-string photo arrays uses
`String(obj.s3Key ?? "")` when the stored item is an object. If a corrupted row stores a photo
object without an `s3Key` field (e.g. a partial write), the result is `{ s3Key: "", kind: "property" }` — an empty-key photo that would render a broken presigned URL.

**Why it's a problem:** The migration silently accepts malformed data and emits a structurally
valid but semantically broken `PropertyPhoto`. The error surface is invisible until a broken image
appears in a user's gallery. The function has no test for the corrupted-object case.

**Better approach:** Add a guard: if `typeof obj.s3Key !== "string" || obj.s3Key === ""`, log a
warning and skip the entry (return `undefined` from `map`, then filter). A test fixture with a
zero-s3Key object would cover this.

---

### [D08] `SegmentationSchema` duplicates the identity-decision fields of `ExtractedPropertySchema`

**Severity:** low
**File(s):**
- `packages/bot/src/adapters/anthropic/claudeExtractor.ts:97–109` (`SegmentSchema`)
- `packages/bot/src/adapters/anthropic/claudeExtractor.ts:47–89` (`ExtractedPropertySchema`)

**What was introduced:** `SegmentSchema` re-declares `existingPropertyId`, `ambiguous`, and
`ambiguousWith` with the same sentinel semantics as `ExtractedPropertySchema`. The rule (empty
string = new, array of ids = candidates) is described in comments in both schemas.

**Why it's a problem:** If the identity-decision model changes (e.g. a confidence score is added,
or the sentinel changes), two Zod schemas and two port types (`PropertySegment` /
`ExtractedProperty`) must be updated in sync. The existing `countUnionParams` regression test does
not assert the `SegmentationSchema` limit is "sane from above" — only "within 16" — so a
drift in count would not be flagged.

**Better approach:** Extract a `PropertyIdentitySchema = z.object({ existingPropertyId: z.string(), ambiguous: z.boolean(), ambiguousWith: z.array(z.string()) })` and spread it into both schemas with `.merge()`. At the port level, a shared `PropertyIdentityDecision` interface can be extended by both `PropertySegment` and `ExtractedProperty`. This is a small refactor that removes the duplication at both the schema and the type layer simultaneously.

---

### [D09] `singlePassFallback` is a large private method that keeps the old pipeline alive indefinitely

**Severity:** low
**File(s):** `packages/bot/src/app/ingestionSweep.ts:509–554`

**What was introduced:** When segmentation fails or returns null, the sweep falls back to the
pre-two-pass single-pass behaviour via `singlePassFallback`. This is a safety net for launch but
the method is full-weight (50 lines) and duplicates much of the two-pass main path's structure
(load result, apply memory, collect photos, loop over properties, call `applyProperty`).

**Why it's a problem:** Two parallel ingestion code paths must now be kept in sync. Any change to
`applyProperty`, `collectChanote`, or `collectPhotos` semantics must be reflected in both the main
loop and the fallback. The fallback also has a latent difference: it passes `memory` (correct)
while the main two-pass loop does not (see D01), making the two paths diverge in behavior.

**Better approach:** Once the two-pass pipeline is stable in production (a few weeks of metrics),
remove the fallback and let a null-segmentation result simply log and return early (no properties
extracted), the same as a null extraction result. If a safety net is still desired, it should be a
flag not a code path, and it should share the same `applyProperty` orchestration as the main path.

---

## What was done well

1. **Regression guard for the nullable limit.** The `countUnionParams` test in
   `claudeExtractor.test.ts` directly tests the serialised JSON schema and asserts both a lower
   bound (guards against a broken counter) and the upper bound. This is exactly the right place for
   this guard and gives strong protection against the outage recurring.

2. **Bounded concurrency for image classification.** `mapWithConcurrency` with `CLASSIFY_CONCURRENCY = 6`
   is the correct pattern for fan-out I/O that must not overflow a Lambda timeout or Anthropic
   rate limits. The unit test that asserts `peak > 1` and `peak < COUNT` is a solid, non-flaky way
   to verify both the "not serial" and "not unbounded" properties.

3. **Chanote location backfill in `applyProperty`.** Using `chanote?.district ?? emptyToUndef(...)` to
   backfill property location fields from the title deed's own structured data is clean and handles
   the common case where users share a chanote without narrating the address in chat. The precedence
   (chat text wins over deed) is correct and the logic is in one place.

---

## Patterns

Two recurring shortcuts are visible across this epoch's diff:

**Copy-paste over extraction.** `emptyToUndef` / `listToUndef` (three copies), `IMAGE_MEDIA_TYPES`
(two copies), and the identity-decision fields in two schemas all show the same pattern: a new
concern was added quickly by duplicating rather than abstracting. These are individually small but
collectively indicate that shared sentinel-handling semantics have no canonical home, which will
cause drift as more callers are added.

**Long orchestration methods accumulating special cases.** `ingestionSweep.ts` grew from ~400 to
~820 lines in this epoch, with `ingestOne` growing to contain the entire two-pass pipeline inline.
The fallback path, the abandon-on-cap path, the classify path, the transcript builder, and the
merge path are all implemented as private methods on the class, which keeps dependencies
encapsulated but means the class is doing heavy orchestration work that could be split into
collaborating objects or pipeline steps. This is not yet a crisis but is the direction the file is
trending.
