# Plan 13 — Fix broken extraction (schema union limit), per-image classify+OCR, chanote schema, photo type labels, S3 format detection

Status: **DONE & LIVE.** Inc 1 (`ea12c4f`) + Incs 2–5 (`4d130fe`) deployed code-only (6 updated, 40
unchanged; no DynamoDB/IAM diff). 175 unit / 24 integration green. Post-deploy sweep runs clean.
Follows plan 12. Driven by a production outage found in staging logs + new chanote-OCR requirements.

## Context / why

**Production outage (P0).** Every extraction has been failing since the plan-12 deploy with a hard
Anthropic 400:

```
400 invalid_request_error: "Schemas contains too many parameters with union types
(27 parameters with type arrays or anyOf)... Reduce the number of nullable or union-typed
parameters (limit: 16 parameters with unions)."
```

Anthropic strict structured output (`output_config.format`) caps a schema at **16 nullable
("anyOf") parameters**. Plan 12 added 11 `.nullable()` fields → **27 nullables** → every sweep +
edit call 400s. The sweep doesn't release a conversation's claim on error, so each stuck
conversation retries and re-fails every 2 min forever. **Zero successful extractions in 24h.** The
user's images were captured to S3 fine (sweep saw 26 + 16 media); extraction is what's broken.
Tests missed it because they use a *fake* extractor — the real-API limit was never exercised.

**Secondary:** the sweep's `maxMedia` cap is **8** images/conversation/run, so the 26- and 16-image
listings only ever sent 8 to the model; the rest were marked ingested unread.

**New requirements (chanote OCR + image pipeline):**
- Extract & store structured **chanote (Thai title-deed)** data — see the grounded reference below.
- Don't rely on **file format** (chanotes usually arrive as photos, not PDFs) or Garuda colour
  (greyscale on photocopies; absent on back/continuation pages) — classify by document content.
- Label every stored photo with a **type**: `property` | `chanote` | `other` (3 DB categories).
  Gallery displays them identically on LINE but ordered **property → chanote → other**.
- S3 should detect **jpg vs png vs gif vs webp** (sniff bytes) instead of hard-coding `image/jpeg`.
- **Process images independently** (decided): one small vision call per image to classify +, for
  documents, OCR. Property photos get minimal processing. **No cap on documents; cap property
  photos.** OCR best-effort on illegible text, flagging confidence.
- Out of scope (explicitly deferred): image resizing/downscaling, the LINE picker-compression risk.

## Grounded chanote reference (the data model target)

- **Title types** (recognise by document text/layout, NOT Garuda colour or file type): Chanote /
  Nor Sor 4 Jor (โฉนด, full freehold, surveyed) · Nor Sor 3 Gor (น.ส.3ก) · Nor Sor 3 (น.ส.3) ·
  Sor Por Kor (ส.ป.ก., agricultural) · other/lesser.
- **Front-side fields:** deed number (เลขที่โฉนด), land/parcel number (เลขที่ดิน), survey page
  (หน้าสำรวจ), map-sheet/ระวาง number, Land Office (สำนักงานที่ดิน), location
  (จังหวัด/อำเภอ/ตำบล — reuse property province/district/subdistrict), **area in rai/ngan/wah**
  (1 rai = 4 ngan = 400 wah = 1600 sqm), plot diagram, registered **owner name(s)**.
- **Reverse side (สารบัญจดทะเบียน):** transfer history + **encumbrances** — mortgages (จำนอง),
  leases, usufructs (สิทธิเก็บกิน), servitudes (ภาระจำยอม).

## Decisions (resolved with the user)

- Image architecture → **per-image classify + OCR** (one small Haiku vision call per image).
- Image cap → **no cap on documents** (chanote/other), **cap property photos** (~8 stored/displayed).
- Photo categories → `property` | `chanote` | `other`; gallery order property → chanote → other.
- S3 → sniff magic bytes for the real image type.
- Chanote stored as a **nested `chanote` group** on the property; rendered as its own Details section.

## Increment 1 — P0 hotfix: restore extraction (deploy first) ✅ DONE & LIVE (`ea12c4f`)

Deployed code-only (4 updated, 42 unchanged). **Verified live:** the 09:50 post-deploy sweep
extracted 2 properties from the previously-stuck 33-message batch on Haiku with no 400; catalog now
has 2 PROP# rows. Regression guard (`claudeExtractor.test.ts`) asserts ≤16 unions; current count = 8.


Reduce nullable count 27 → ~8 by switching text/array fields to **required-with-sentinel** (strict
mode already forces every key to be present, so we keep determinism without `.nullable()`):

| File | Change |
|---|---|
| `adapters/anthropic/claudeExtractor.ts` | `ExtractedPropertySchema`: string fields → `z.string()` (`""` = absent), arrays (`ambiguousWith`, `tags`) → `z.array(z.string())` (`[]` = absent), `existingPropertyId` → `z.string()` (`""` = create-new), `memoryUpdate` → `z.string()` (`""` = no update). **Numbers stay `.nullable()`** (lat, long, askingPrice, rentPrice, bedrooms, bathrooms, usableAreaSqm, floors = 8). Update `SYSTEM_PROMPT`: *"empty string for text not stated, empty array for lists, null only for numeric fields not stated."* |
| `core/ports/extraction.ts` | `ExtractedProperty`: string fields non-null, arrays non-null, numbers `\| null`; `existingPropertyId: string` (`""`=new); `memoryUpdate: string`. |
| `app/ingestionSweep.ts` | Mapping: add `emptyToUndef` (string `""`→undef) + `[]`→undef for arrays; keep `nullToUndef` for numbers; `existingPropertyId === "" ` ⇒ create-new. |
| `core/handlers/editReplyHandler.ts` | Same sentinel mapping. |
| tests | Update `extracted()` helpers + inline literals (null→`""`/`[]` for text/arrays). **Add a regression test** that serialises the output schema and asserts ≤16 nullable/anyOf params. |

Deploy code-only (`pulumi up`). Stuck conversations self-heal: claims weren't released → the
stale-timeout lets a later sweep re-claim and now succeed.

## Increment 2 — chanote schema + concise prompt

| File | Change |
|---|---|
| `core/domain/catalog.ts` | Add `Chanote` interface + `Property.chanote?: Chanote`. Fields: `titleType?`, `deedNumber?`, `landNumber?`, `surveyPage?`, `mapSheet?`, `landOffice?`, `landArea?` (rai/ngan/wah string — may reuse top-level `landArea`), `ownerName?`, `encumbrances?: string[]`, `confidenceNote?` (free text when illegible). |
| `adapters/anthropic/claudeExtractor.ts` | Add a nested `chanote` object to the schema (nullable object = **1** nullable; inner fields required-`""`/`[]`). Add a **concise, well-structured chanote block** to `SYSTEM_PROMPT`: what a chanote/title-deed is; recognise by content not Garuda/file type; the field list; best-effort OCR + set `confidenceNote` when text is not fully legible. |
| `core/ports/extraction.ts` | `ExtractedProperty.chanote: ...` (or surface via the per-image result — see Inc 3). |
| `core/handlers/views.ts` | `propertyDetail` renders a **Chanote** section (title type + deed/parcel/area/owner/encumbrances) when present. |
| `adapters/dynamodb/catalogRepository.ts` | Persist `chanote` (map attr) + `toProperty` mapping. |

## Increment 3 — per-image classify + OCR (architecture change)

| File | Change |
|---|---|
| `core/ports/extraction.ts` | New `ImageClassifier` port (or extractor method): `classifyImage(media): Promise<{ kind: "property"\|"chanote"\|"other"; chanote?: Chanote; ocrText?: string }>`. Property photos return `kind:"property"` and nothing else. |
| `adapters/anthropic/claudeExtractor.ts` | Implement: one Haiku vision call/image, small `max_tokens`, strict output. Classify; if chanote → fill `chanote`; if other (contract/screenshot) → return `ocrText`. |
| `app/ingestionSweep.ts` | Replace the single big multimodal call: (a) classify each image (no cap on documents; cap property photos); (b) feed chat text **+ OCR'd document text** into the existing text extractor; (c) merge any `chanote` data onto the resulting property; (d) build `photos[]` with per-image `kind`. Cost cap = a high backstop only. |

## Increment 4 — photo type labels + gallery ordering + DB

| File | Change |
|---|---|
| `core/domain/catalog.ts` | `Property.photos?: readonly PropertyPhoto[]` where `PropertyPhoto = { s3Key: string; kind: "property"\|"chanote"\|"other" }`. **Blank slate ⇒ no migration.** |
| `adapters/dynamodb/catalogRepository.ts` | `photos` as list-of-maps; `toProperty` + upsert mapping; `mergePhotos` merges by `s3Key`. |
| `core/handlers/catalogAssistant.ts` | `heroUrls`/`presignPhotos`: sort property → chanote → other; hero = first `property` photo (fallback any); presign all. |
| `core/handlers/views.ts` | Gallery alt-text unchanged; carousel renders all (LINE 12-bubble display cap stands). |

## Increment 5 — S3 content-type detection (magic-byte sniff)

| File | Change |
|---|---|
| `app/eventProcessor.ts` | After fetching the LINE blob, sniff magic bytes → `image/jpeg` (FFD8FF) / `image/png` (89504E47) / `image/gif` (474946) / `image/webp` (RIFF…WEBP); fall back to the current best-guess. Use the sniffed type for the S3 `Content-Type` + key extension (today `"image"` hard-codes `image/jpeg`). |

## Increment 6 — two-pass extraction (segment → per-property) + per-segment attribution — DONE & LIVE

Deployed (`26ca152`, code-only 6 updated/40 unchanged). 176 unit / 24 integration green. Transcript
is timestamped (second resolution, so burst/gap structure is visible) with `[IMG n]`/`[MAP n]`
markers; pass 1 segments + attributes media by index; pass 2 extracts each property focused (no
dilution); fallback to single-pass when segmentation returns null. Photo subtype label
(`PropertyPhoto.label`, e.g. "external - front") added. **Blank-slate wipe executed** afterwards
(admin profile): catalog 0 / messages 0 / S3 0 — re-share to test the new pipeline fresh.

### Debug finding that drove inc 6
First live batch (group chat, 33 msgs) held two properties; the sparse one was NOT a context/
truncation issue — multi-property batches attributed photos/map/chanote to NEITHER property (the
old single-property guard), so both group listings lost their photos. Two-pass fixes attribution +
dilution. Mooban Wangtan stays text-sparse because its details live only in photos we don't
deep-extract — expected, not a bug.

**Why:** Debugging the first live batch (group chat, 33 msgs) found the model returned two properties
but one (Mooban Wangtan) was sparse, and — the real bug — **multi-property batches attribute photos /
map links / chanote to NO property** (the sweep only attaches on a single-property batch). So both
group properties lost their photos + location; only the DM copy kept photos. Root cause is NOT context
/truncation (the call parsed fine; Mooban Wangtan is genuinely text-sparse — its details live only in
photos we don't deep-extract). Fix = the user's two-pass: segment first, then extract each property
individually, attributing each one's own images/map/chanote.

| File | Change |
|---|---|
| `core/ports/extraction.ts` | Add `focus?: string` to `ExtractionRequest` (pass-2 extracts ONE named property). Add `PropertySegment { label, existingPropertyId, ambiguous, ambiguousWith, imageIndices[], mapIndex }`, `SegmentationResult { segments[], memoryUpdate }`, and `PropertyExtractor.segment(request)`. |
| `adapters/anthropic/claudeExtractor.ts` | `SegmentationSchema` (0 nullables — arrays/sentinels) + concise `SEGMENT_SYSTEM_PROMPT`; `segment()` method. `buildExtractionContent` honours `focus` ("extract ONLY this property; emit exactly one"). |
| `app/ingestionSweep.ts` | New flow: classify images (ordered) → build a marked transcript (`[IMG n]` with kind/label, `[MAP n]`, text) → `segment()` → for each segment `extract({focus})` → take the one property, attach photos at `imageIndices`, chanote merged from those, mapUrl at `mapIndex`, identity from the segment. `memoryUpdate` from the segment pass. Fallback to the old single-`extract()` if `segment()` returns null. |
| tests | segment + per-segment attribution (multi-property batch attaches each property's own photos/map); focus in content; fallback. |

Also: **photo subtype label** — `PropertyPhoto.label?` + `ImageClassification.label` + a `label` field
in the classify schema/prompt (e.g. "external - front", "internal - kitchen", "chanote - back",
"chat log"); stored + round-tripped. Cheap metadata since we already classify each image.

## Verification (per increment)
- `npm run test` / `test:integration` / `lint` / `typecheck`.
- **Inc 1 first**, deploy, watch the sweep logs for a successful extraction (no 400) within a couple
  of cycles; the stuck conversations should drain.
- Live: send a chanote photo + property photos → Details shows the chanote section + the gallery
  ordered property→chanote→other; logs show one classify call per image; documents uncapped.
