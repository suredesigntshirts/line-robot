# Plan 12 (Listing Depth & Fixes) — Design Review

## Epoch summary

Plan 12 expanded extracted property data with eleven physical/commercial fields (bedrooms, bathrooms,
usable area, land area, floors, furnishing, listing type, rent price, contact, source, notes), added
photo-gallery accumulation across ingestion batches, stored and preferred the original shared
Google-Maps URL over reconstructed coordinates, dropped Opus from the extraction ladder, added a
2-minute debounce, and introduced a two-step delete flow (prompt + confirm) accessible from the
detail card.

---

## Design concerns introduced

### [D01] Sentinel-to-undefined helpers duplicated across two files

**Severity:** medium
**File(s):**
- `packages/bot/src/app/ingestionSweep.ts:138–148`
- `packages/bot/src/core/handlers/editReplyHandler.ts:23–33`

**What was introduced:** Plan 12 extended both `applyProperty` (sweep) and `EditReplyHandler.handle`
with the same eleven new fields. Both sites already had locally-defined `nullToUndef`, `emptyToUndef`,
and `listToUndef` — and both kept their own copy rather than sharing. The helpers are byte-identical
in both files.

**Why it's a problem:** This is a pure duplication of three tiny functions that exist in the same
package. Every future field addition must be reflected in both upsert blocks in lock-step, and both
copies of the helpers must stay in sync. Plan 12 is the epoch that introduced the eleven-field growth
spurt and it is also the epoch that most clearly illustrates the risk: two `PropertyUpsert`
construction blocks that are nearly identical but live in different layers (app/ and core/handlers/).
The sweep also silently used `nullToUndef` for sentinel strings before this epoch switched to
`emptyToUndef`; the inconsistency was not caught because they live in separate files.

**Better approach:** Lift `nullToUndef`, `emptyToUndef`, and `listToUndef` — and ideally a single
`extractedToUpsert(extracted: ExtractedProperty): Omit<PropertyUpsert, 'propertyId'>` helper — into
a shared module (e.g. `core/domain/extraction.ts` or alongside the `ExtractedProperty` port). Both
sites import and call the shared function; field additions require one change in one place.

---

### [D02] `mapUrl` extracted in two different ways with different semantics on the two paths

**Severity:** medium
**File(s):**
- `packages/bot/src/core/handlers/editReplyHandler.ts:95` (interactive edit path)
- `packages/bot/src/app/ingestionSweep.ts:477,543` (sweep two-pass and fallback paths)

**What was introduced:** The interactive edit path calls `parseMapUrls(text)[0]` directly on the raw
user message text to extract a map URL, and sets it on the upsert unconditionally when present. The
sweep, however, rewrites map URLs in the transcript to `[MAP n]` tokens during transcript assembly
(`buildTranscript`), then carries them in a `mapLinks` array, and resolves `mapUrl` via index lookup
at `segment.mapIndex`. The two paths have different de-duplication behaviour: the sweep's `[MAP n]`
rewrite de-duplicates by first-seen-index; the edit path calls `parseMapUrls` which de-duplicates by
exact URL string but then takes only `[0]`. They also differ in what "the text" means: the edit path
parses the raw message, the sweep already has the URL rewritten away.

**Why it's a problem:** When a user edits a property by pasting a new map link in a reply, the edit
path correctly captures it. But there is now a subtle asymmetry: the sweep's `mapUrl` is index-stable
(which `[MAP n]` segment owns the URL is decided during pass 1), while the edit path bypasses this
attribution entirely. If a user's edit message contains two Google Maps URLs (rare but possible), the
edit path picks the first one; if the same message were processed by the sweep, pass 1 would attribute
by segment ownership. More practically, `parseMapUrls` is called twice on the sweep path — once inside
`buildTranscript` (to rewrite to `[MAP n]`) and once in the old `singlePassFallback` path which
existed before two-pass was introduced. Adding a third call site in `editReplyHandler` means the regex
runs again on data that the sweep never passes through this code path.

**Better approach:** Treat mapUrl extraction as a responsibility of the `geo` module and call it once.
In the sweep, the `mapLinks` array is already authoritative — no need to call `parseMapUrls` a second
time. The edit path can keep calling `parseMapUrls` since it operates on raw text, but the divergence
in attribution logic should be documented (or reconciled) rather than implicit. Ideally the edit path
also validates that the URL is a recognisable Maps domain before storing it (currently any string
matching the regex goes straight into DynamoDB without normalisation).

---

### [D03] `displayFields` label map is disjoint from `propertyDetail` row labels — silent diff bug

**Severity:** medium
**File(s):** `packages/bot/src/core/handlers/views.ts:204–208,307–308`

**What was introduced:** `propertyDetail` renders bedrooms + bathrooms as a combined `"Rooms"` row
(`"3 bed · 2 bath"`). `displayFields` — the function used to produce the edit-confirmation diff —
represents the same data as two separate keys: `"Beds"` and `"Baths"`. The two representations are
never reconciled.

**Why it's a problem:** When a user edits the number of bedrooms and the confirmation message says
"Beds 3 (was 2)", that label "Beds" has no visual counterpart in the card the user is looking at
(which shows "Rooms: 3 bed · 2 bath"). The edit confirmation and the rendered card use different
vocabulary for the same data. More structurally: if `displayFields` is supposed to mirror what the
card shows, any display label change in the card must also be replicated in `displayFields`, and
there is no mechanical enforcement of that invariant. This is the second independent representation
of the same "display" concept; the first is the `pushRow` call sequence in `propertyDetail`.

**Better approach:** `displayFields` should be the single source of truth for the human-readable
label for each field. `propertyDetail` should use the same map to produce its rows (perhaps via a
shared constant or by iterating `displayFields` directly). The special-cased `"Rooms"` composite
should either live in `displayFields` too (replacing the two separate Beds/Baths keys) or be
formatted consistently. Either way, one function should produce both the card row and the diff label
for a given property field.

---

### [D04] Delete flow does not clean up edges in other conversations — by design but undocumented in the port

**Severity:** low
**File(s):**
- `packages/bot/src/core/handlers/catalogAssistant.ts:219–231`
- `packages/bot/src/core/ports/catalog.ts:87–91`

**What was introduced:** `deleteListing` removes the property's events, the triggering
conversation's edge (`unlinkConversationProperty`), and the property row itself. Edges linking other
conversations to the same property are left in place. A comment in the code notes: "Edges in other
conversations are filtered out at read time (a missing property resolves to null)."

**Why it's a problem:** This is a deliberate choice and the comment is correct, but the trade-off
is invisible at the port boundary. `deleteProperty` in `CatalogRepository` is documented as
removing "the META row"; nothing in the port contract states that callers are responsible for the
edge cleanup (even partial cleanup). A future caller of `deleteProperty` — or a reader of
`listConversationProperties` — would not know that stale edges accumulate silently. The existing
merge path has the same design (`deleteProperty` after `unlinkConversationProperty`), so this is
a consistent pattern, but neither site cleans up all edges. As the property table grows and
properties are deleted, the `CONV→PROP` edges become increasingly stale across conversations, and
the only mitigation is the null-filter on read.

**Better approach:** Either (a) document the "lazy edge cleanup" contract explicitly in
`deleteProperty`'s JSDoc so any caller knows what responsibility they are taking on, or (b)
add a `deleteAllPropertyEdges(propertyId)` method to the port and call it from `deleteListing`
before `deleteProperty` — a DynamoDB query-then-batch-delete that mirrors what `deletePropertyEvents`
already does. Option (b) prevents unbounded edge accumulation over the product lifetime.

---

### [D05] Prompt prefix in `EditReplyHandler` is an unconstrained string literal with no extraction test

**Severity:** low
**File(s):** `packages/bot/src/core/handlers/editReplyHandler.ts:66–69`

**What was introduced:** A plain string is prepended to the user's message before sending it to
the extractor to bias the model toward applying edits to the viewed property:

```
"[The user is editing the property they just viewed — apply the change to THAT listing. " +
'Its "name"/"called" means the project name; "address" means the street address.]\n' +
text
```

**Why it's a problem:** This is a magic literal with no named constant, no contract in the
extraction port, and no unit test that asserts the prefix appears in the extraction request. If the
wording changes (or someone refactors the concatenation), there is no failing test to indicate the
edit disambiguation hint was lost. The prefix is also embedded directly in `handle()` rather than
being a named constant or a builder function, making it invisible to documentation. Additionally,
the prefix is passed as part of `text` to the extractor, which means it appears in structured-output
logging as part of the conversation text — slightly polluting traceability.

**Better approach:** Extract to a named constant (`EDIT_PROMPT_PREFIX`) above the class, or move
to a private method `buildEditPrompt(text: string): string`. Add a test that checks the
`extractor.seen?.text` starts with the expected prefix (the fake extractor already captures
the full request). The approach of injecting a system instruction into the user text is a known
LLM seam; naming it makes the intent clearer.

---

### [D06] `mergePhotos` adds an extra `getProperty` call on every photo-bearing batch

**Severity:** low
**File(s):** `packages/bot/src/app/ingestionSweep.ts:580,643–662`

**What was introduced:** To accumulate photos across batches, `applyProperty` now calls
`mergePhotos`, which — for an existing property — calls `this.deps.catalog.getProperty(propertyId)`
to load the existing photo list before merging. This is a second read of the same property row in
the same ingestion pass: the property was already fetched during candidate loading (to build
`ExtractionCandidate` objects), and for a single-property batch the sweep may already have its
data in memory via the merge-target list.

**Why it's a problem:** At current scale this is cheap (a single DynamoDB point read). But the
pattern is structurally wasteful: the full property read in `mergePhotos` is done purely to
retrieve `photos`, even though the caller already has the pre-extraction snapshot of the property
available at the call site. This is the same data freshness issue that the upsert's set-if-present
semantics are intended to avoid, but re-reading for photo merge bypasses the accumulation guarantee
(there is a narrow window where another concurrent write between the two reads could be clobbered).

**Better approach:** Pass the `before` property (already loaded in `applyProperty`'s caller
context, or retrievable from the candidate list) into `mergePhotos` directly rather than
re-fetching it. The `before` photos can be used as the starting point: `mergePhotos(before?.photos,
newPhotos)`. This removes the extra read and makes the merge a pure function (no IO).

---

## What was done well

1. **The `displayFields`/`pushRow` refactor is a real improvement.** Replacing the previous wall of
   `if (field !== undefined) rows.push(...)` blocks with `pushRow` eliminates a class of
   conditional-but-silent omissions. The consolidation of the edit-diff loop over `Object.keys(a)`
   is also cleaner than the previous per-field manual comparisons.

2. **The `ExtractorClientOptions` interface and the bounded Haiku-only ladder for the processor are
   well-motivated and well-documented.** Keeping the interactive edit path to a single Haiku call
   with a hard 12-second timeout and zero retries is exactly the right safety boundary for a
   synchronous Lambda path, and documenting the contrast with the sweep ladder in the factory
   comment makes the intent clear.

3. **The nullable-budget discipline was respected under expansion pressure.** Adding eleven new
   fields while holding the schema to 8 nullables (using `""` and `[]` sentinels for strings and
   arrays) shows genuine care for a constraint that had already caused a production outage. The
   regression test that enforces ≤ 16 unions means the constraint is machine-checked, not just
   documented.

---

## Patterns

Two recurring shortcuts are visible across this epoch's diff:

- **Copy-paste upsert blocks:** every new field requires three parallel edits (domain type, port
  type, and one upsert block in `ingestionSweep`, plus a second upsert block in
  `editReplyHandler`). The helper-duplication issue (D01) and the upsert-block duplication are
  two symptoms of the same cause: there is no shared "turn extraction output into a PropertyUpsert"
  step.

- **Implicit label coupling:** the detail-card row labels, the `displayFields` map keys, and the
  prompt system instructions all encode human-readable field names in independent string literals.
  When a label changes (D03), all three sites must be updated. None of the three is treated as
  authoritative; they all converge incidentally on the same strings.
