# 05 — Decompose ingestionSweep.ts (848 lines) + fix the two-pass `memory` omission bug

> **Reconcile-pass note (queue 00).** Land **unit 01 BEFORE this unit** (sequential, not parallel —
> both edit `app/ingestionSweep.ts`'s import block and `applyProperty`). After unit 01 lands:
> - The three sentinel helpers (`nullToUndef`/`emptyToUndef`/`listToUndef`) are **no longer locally
>   defined** in `ingestionSweep.ts` — unit 01 deleted them and replaced their uses with imports from
>   `core/domain/sentinel.ts`. THIS unit must therefore **NOT** "leave them here" as the body below
>   says; instead, leave unit 01's *imports* of `nullToUndef`/`emptyToUndef` untouched and do not
>   re-add the local definitions. (The line at `extractAndApply` reading
>   `const memory = nullToUndef(await this.deps.catalog.getMemoryDoc(key));` stays — it now resolves to
>   the imported `nullToUndef`.)
> - `applyProperty`'s upsert literal has already been collapsed to `...extractedToBaseUpsert(...)` by
>   unit 01; this unit does not touch `applyProperty`'s upsert block.
> - This unit's `app/ingestionMedia.ts` defines `emptyExtracted` (construction-side sentinels) — that
>   is unrelated to unit 01's consume-side helpers; no overlap.
> - Unit 07 later narrows the `IngestionSweepDeps.catalog` *type* (one import line + one field) — land
>   07 AFTER this decomposition so its one-liner rebases onto the final import block.

## Goal & rationale

`packages/bot/src/app/ingestionSweep.ts` has grown to 848 lines and mixes five concerns: sweep
orchestration (the `IngestionSweep` class), the two-pass extraction pipeline, media
classification + transcript building, chanote/photo merging, and a view-concern confirmation-message
builder. This unit splits the file along those seams without changing behaviour — moving the pure
view builder (`buildConfirmation`) to `core/handlers/views.ts`, the media/transcript pipeline helpers
to a new `app/ingestionMedia.ts`, and the domain-free `mapWithConcurrency` to a new
`core/utils/concurrency.ts`. **Separately**, it fixes a confirmed high-severity bug: the pass-2
focused `extractor.extract` call omits the `memory` note, silently degrading multi-property
extraction quality. Source findings: `plans/cleanup/09-epoch-design-debt.md` (refactor #5; epoch G
D01), `plans/cleanup/00-master-plan.md` (P1 #8, Theme C), `plans/cleanup/epoch-G-plan13.md` (D01,
D06), `plans/cleanup/03-app-lambda.md` (F03).

## Blast radius

- **Files created:**
  - `packages/bot/src/core/utils/concurrency.ts` — receives `mapWithConcurrency`.
  - `packages/bot/src/app/ingestionMedia.ts` — receives the media/transcript pipeline helpers and the
    `ClassifiedMedia` type.

- **Files modified:**
  - `packages/bot/src/app/ingestionSweep.ts` — **remove** the moved symbols; convert the two private
    media methods (`classifyMedia`, `collectPhotos`, `collectChanote`) into calls to the extracted
    standalone functions; add the `import`s for the new modules; **BUG FIX** add `memory,` to the
    pass-2 `ExtractionRequest` literal (region: `extractAndApply`, current lines 484–491).
  - `packages/bot/src/core/handlers/views.ts` — **receive** `buildConfirmation` and its two parameter
    types (`AppliedProperty`, `MergeTarget`), exported. `mergePromptQuickReplies` is already here, so
    `buildConfirmation`'s call to it becomes an intra-file call.
  - `packages/bot/test/unit/ingestionSweep.test.ts` — add a two-pass-with-memory regression test
    (pins the bug fix); no existing test changes (all go through the `IngestionSweep` class).
  - `packages/bot/test/unit/views.test.ts` — add a `buildConfirmation` describe block (the function
    has no dedicated unit test today); import `buildConfirmation` from `views.js`.

- **Files deleted:** none.

- **All call-sites to update** (every one — all within `ingestionSweep.ts` unless noted):
  - `ingestionSweep.ts:12` — `import { mergePromptQuickReplies } from "../core/handlers/views.js"` →
    **remove** (only `buildConfirmation` used it, and `buildConfirmation` is leaving).
  - `ingestionSweep.ts:9` — `import { formatShortDateTime } from "../core/domain/datetime.js"` →
    **remove** (only `buildTranscript` used it; it moves).
  - `ingestionSweep.ts:10` — `import { parseGeoLinks, parseMapUrls } from "../core/domain/geo.js"` →
    keep `parseGeoLinks` (still used in `extractAndApply` lines 439/481), **drop `parseMapUrls`**
    (only `buildTranscript` used it).
  - `ingestionSweep.ts:427` — `buildTranscript(batch, classified)` → now an import from
    `./ingestionMedia.js`.
  - `ingestionSweep.ts:497` — `mergeSegment(segment, result?.properties[0])` → import from
    `./ingestionMedia.js`.
  - `ingestionSweep.ts:495` — `this.collectPhotos(segImages)` → `collectPhotos(segImages, maxPropertyPhotos)`.
  - `ingestionSweep.ts:496` — `this.collectChanote(segImages)` → `collectChanote(segImages)`.
  - `ingestionSweep.ts:424` — `this.classifyMedia(batch)` → `classifyMedia({ batch, media: this.deps.media, classifier: this.deps.classifier, logger: this.deps.logger, maxClassify })`.
  - `ingestionSweep.ts:541-543` (inside `singlePassFallback`) — `this.collectPhotos(classified)` /
    `this.collectChanote(classified)` → `collectPhotos(classified, maxPropertyPhotos)` /
    `collectChanote(classified)`.
  - `ingestionSweep.ts:699` — `mapWithConcurrency(...)` call lives inside `classifyMedia`, which moves
    to `ingestionMedia.ts`; that file imports `mapWithConcurrency` from `../core/utils/concurrency.js`.
  - `ingestionSweep.ts:794` — `buildConfirmation(applied)` in `pushConfirmation` → now imported from
    `../core/handlers/views.js`.
  - `ingestionSweep.ts:484-491` — **BUG FIX**: add `memory,` to the `ExtractionRequest` literal.
  - `lambda/sweep.ts:14`, `test/unit/ingestionSweep.test.ts:2`,
    `test/integration/ingestionSweep.integration.test.ts:7` — `import { IngestionSweep }` paths are
    **unchanged** (the class stays in `ingestionSweep.ts`).

- **Tests touched:** add/update `packages/bot/test/unit/ingestionSweep.test.ts` (one new test);
  `packages/bot/test/unit/views.test.ts` (one new describe block + one import). No integration-test
  change.

## Current code

### The bug (`app/ingestionSweep.ts`, `extractAndApply`, lines 440–491)

```ts
    const candidates = await this.loadCandidates(key);
    const memory = nullToUndef(await this.deps.catalog.getMemoryDoc(key));  // line 441 — in scope

    // PASS 1 — segment ...
    const seg = await this.deps.segmenter.segment({
      conversationKey: key,
      text: transcript,
      media: [],
      geoHints: allGeoHints,
      candidates,
      memory,                                  // pass 1 correctly forwards memory
    });
    ...
    for (const segment of seg.segments) {
      ...
      // PASS 2 — a focused extraction filling all fields for THIS property only (no dilution).
      const result = await this.deps.extractor.extract({
        conversationKey: key,
        text: transcript,
        media: [],
        geoHints: segGeo,
        candidates,
        focus: segment.label,                  // ← `memory` is MISSING here (lines 484–491)
      });
```

The single-pass fallback path passes `memory` correctly (line 527), so the bug only manifests on the
two-pass (segmented, multi-property) path.

### `mapWithConcurrency` (`app/ingestionSweep.ts:226–248`)

```ts
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) {
        return;
      }
      results[i] = await fn(items[i] as T, i);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
```

### `buildConfirmation` (`app/ingestionSweep.ts:829–848`) and its types (95–109)

```ts
interface MergeTarget {            // line 95
  readonly id: string;
  readonly label: string;
}
interface AppliedProperty {        // line 101
  readonly propertyId: string;
  readonly isNew: boolean;
  readonly ambiguous: boolean;
  readonly label: string;
  readonly mergeTargets?: readonly MergeTarget[];
}
...
export function buildConfirmation(applied: AppliedProperty[]): OutboundMessage {
  const noun = applied.length === 1 ? "property" : "properties";
  const items = applied
    .map((a) => {
      const tag = a.ambiguous ? "new — please confirm" : a.isNew ? "new" : "updated";
      return `${a.label} (${tag})`;
    })
    .join(", ");
  const text = `✅ Saved ${applied.length} ${noun}: ${items}`;
  const toConfirm = applied.find((a) => a.mergeTargets !== undefined && a.mergeTargets.length > 0);
  if (toConfirm?.mergeTargets !== undefined) {
    return {
      type: "text",
      text,
      quickReplies: mergePromptQuickReplies(toConfirm.propertyId, [...toConfirm.mergeTargets]),
    };
  }
  return { type: "text", text };
}
```

### The media helpers that move (currently `app/ingestionSweep.ts`)

- `ClassifiedMedia` interface (58–65)
- `mergeChanote` (153–174), `emptyExtracted` (178–208), `mergeSegment` (213–224)
- `buildTranscript` (254–288)
- `classifyMedia` method (684–733) — reads `this.deps.media`, `this.deps.classifier`,
  `this.deps.logger`, and `this.opts.maxMedia` (default `DEFAULT_MAX_CLASSIFY = 30`), uses
  `MEDIA_CONTENT_TYPES`, `mapWithConcurrency`, `CLASSIFY_CONCURRENCY = 6`.
- `collectPhotos` method (737–758) — reads `this.opts.maxPropertyPhotos` (default
  `DEFAULT_MAX_PROPERTY_PHOTOS = 12`).
- `collectChanote` method (761–767) — pure (uses `mergeChanote`).

## Target design

### Architectural decision (resolved — not a fork)

Three distinct homes, each matching the hexagonal layering rule:

1. **`core/utils/concurrency.ts`** — `mapWithConcurrency` is a pure generic with zero domain or infra
   knowledge → `core/utils`. (This is a new directory; it is the canonical home the epoch-G review
   D06 and master-plan call for.)

2. **`app/ingestionMedia.ts`** — the transcript/media pipeline helpers depend on **domain types**
   (`Chanote`, `PropertyPhoto`, `StoredMessage`, `ExtractedProperty`) and the **extraction port
   types** (`ImageClassifier`, `PropertySegment`) and the runtime `Logger`/`MediaReader` ports — but
   no concrete adapters. They are application-pipeline helpers that the `IngestionSweep` orchestrator
   composes, so they live in `app/` next to their only caller (the blast-scout's recommended fork
   resolution: app/ over core/, because they consume the sweep's own ports + are private to the sweep
   pipeline; placing them in `core/` would be defensible too but app/ keeps them next to the single
   orchestrator that uses them and avoids a core→port-heavy helper file).

3. **`core/handlers/views.ts`** — `buildConfirmation` is a pure renderer of `OutboundMessage` from
   domain-ish data, exactly like the `reminderMessage` / `mergePromptQuickReplies` already there. Its
   parameter types `AppliedProperty` / `MergeTarget` **travel with it** and are **exported** from
   `views.ts`, so the sweep (`app/`) imports them from `core/handlers/views.js`. This is the same
   (already-present) app→handler import direction as today's line-12 `mergePromptQuickReplies`
   import; no new or reversed dependency edge is created, and there is no circular risk
   (`core/handlers/views.ts` does not import from `app/`).

### `core/utils/concurrency.ts` (new — full file)

```ts
/**
 * Map over items with a bounded number of in-flight promises, preserving input order in the result
 * (workers pull from a shared cursor). Lets us fan out independent I/O — e.g. per-image vision calls
 * — without spawning all N at once or serialising them one at a time. Pure utility: no domain or
 * infrastructure knowledge.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) {
        return;
      }
      results[i] = await fn(items[i] as T, i);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
```

### `app/ingestionMedia.ts` (new — full file)

The two methods that read `this` (`classifyMedia`, `collectPhotos`) become standalone functions
taking their dependencies explicitly. `classifyMedia` takes a deps object; `collectPhotos` takes the
resolved `maxPhotos` cap. The default constants move here.

```ts
import type { Chanote, PropertyPhoto } from "../core/domain/catalog.js";
import { formatShortDateTime } from "../core/domain/datetime.js";
import { parseMapUrls } from "../core/domain/geo.js";
import type { StoredMessage } from "../core/domain/message.js";
import type {
  ExtractedProperty,
  ImageClassifier,
  PropertySegment,
} from "../core/ports/extraction.js";
import type { MediaReader } from "../core/ports/mediaReader.js";
import type { Logger } from "../core/ports/runtime.js";
import { mapWithConcurrency } from "../core/utils/concurrency.js";

/** Backstop on images classified per conversation per run (one cheap vision call each). */
export const DEFAULT_MAX_CLASSIFY = 30;
/** Bounded concurrency for the per-image vision calls (cuts wall-clock without overflowing limits). */
const CLASSIFY_CONCURRENCY = 6;
/** Property photos kept per batch — documents (chanote/other) are uncapped. */
export const DEFAULT_MAX_PROPERTY_PHOTOS = 12;

const MEDIA_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

/** One classified attachment from a batch: its S3 key, content-type, and the model's verdict
 * (null when classification failed → treated as a plain property photo). */
export interface ClassifiedMedia {
  readonly s3Key: string;
  readonly contentType: string;
  readonly kind: PropertyPhoto["kind"];
  readonly label?: string;
  readonly chanote?: Chanote;
  readonly ocrText?: string;
}

/** Dependencies for the per-image classify pass (the sweep threads its own ports + cap here). */
export interface ClassifyMediaDeps {
  readonly batch: readonly StoredMessage[];
  readonly media: MediaReader;
  readonly classifier: ImageClassifier;
  readonly logger: Logger;
  readonly maxClassify: number;
}

/** Merge title-deed reads across a chanote's pages ... (verbatim move) */
export function mergeChanote(a: Chanote, b: Chanote): Chanote { /* unchanged body */ }

/** A blank extracted property (all sentinels) ... (verbatim move) */
export function emptyExtracted(): ExtractedProperty { /* unchanged body */ }

/** Combine a segment's identity decision (pass 1) with the focused field extraction (pass 2). ... */
export function mergeSegment(segment: PropertySegment, fields?: ExtractedProperty): ExtractedProperty {
  /* unchanged body — calls emptyExtracted() directly (now intra-file) */
}

/** Build the single timestamped transcript both passes read. ... (verbatim move) */
export function buildTranscript(
  batch: readonly StoredMessage[],
  classified: readonly ClassifiedMedia[],
): { transcript: string; mapLinks: string[] } { /* unchanged body */ }

/** Classify (+ OCR documents) every media attachment in the batch, one vision call each, capped at
 * the classify backstop. (Was IngestionSweep.classifyMedia; now takes deps explicitly.) */
export async function classifyMedia(deps: ClassifyMediaDeps): Promise<ClassifiedMedia[]> {
  const { batch, media, classifier, logger, maxClassify } = deps;
  const withAttachment = batch.filter(
    (m) => m.attachment !== undefined && MEDIA_CONTENT_TYPES.has(m.attachment.contentType),
  );
  if (withAttachment.length > maxClassify) {
    logger.info("ingestion sweep: capping media", {
      available: withAttachment.length,
      cap: maxClassify,
    });
  }
  const settled = await mapWithConcurrency(
    withAttachment.slice(0, maxClassify),
    CLASSIFY_CONCURRENCY,
    async (message): Promise<ClassifiedMedia | null> => {
      const attachment = message.attachment;
      if (attachment === undefined) {
        return null;
      }
      let bytes: Buffer;
      try {
        bytes = await media.getMedia(attachment.s3Key);
      } catch (error) {
        logger.warn("ingestion sweep: media read failed; skipping", {
          s3Key: attachment.s3Key,
          error: String(error),
        });
        return null;
      }
      const classification = await classifier.classifyImage({
        base64: bytes.toString("base64"),
        mediaType: attachment.contentType,
      });
      return {
        s3Key: attachment.s3Key,
        contentType: attachment.contentType,
        kind: classification?.kind ?? "property",
        ...(classification?.label !== undefined ? { label: classification.label } : {}),
        ...(classification?.chanote !== undefined ? { chanote: classification.chanote } : {}),
        ...(classification?.ocrText !== undefined ? { ocrText: classification.ocrText } : {}),
      };
    },
  );
  return settled.filter((c): c is ClassifiedMedia => c !== null);
}

/** The labelled gallery images for a single set of classified media. (Was collectPhotos; the photo
 * cap is now an explicit param instead of `this.opts.maxPropertyPhotos`.) */
export function collectPhotos(
  classified: readonly ClassifiedMedia[],
  maxPhotos: number,
): PropertyPhoto[] {
  const photos: PropertyPhoto[] = [];
  let propertyCount = 0;
  for (const c of classified) {
    if (!c.contentType.startsWith("image/")) {
      continue;
    }
    if (c.kind === "property") {
      if (propertyCount >= maxPhotos) {
        continue;
      }
      propertyCount += 1;
    }
    photos.push({
      s3Key: c.s3Key,
      kind: c.kind,
      ...(c.label !== undefined ? { label: c.label } : {}),
    });
  }
  return photos;
}

/** Merge the chanote reads across all title-deed images/pages. (Was collectChanote; unchanged.) */
export function collectChanote(classified: readonly ClassifiedMedia[]): Chanote | undefined {
  const chanotes = classified.flatMap((c) => (c.chanote !== undefined ? [c.chanote] : []));
  if (chanotes.length === 0) {
    return undefined;
  }
  return chanotes.reduce((acc, c) => mergeChanote(acc, c));
}
```

> Note: `mergeChanote`, `emptyExtracted`, `mergeSegment`, and `buildTranscript` bodies are **verbatim
> moves** — copy them unchanged. Only `classifyMedia` and `collectPhotos` change shape (deps/param
> threading instead of `this`).

### `core/handlers/views.ts` additions

Add at the end of `views.ts` (after `mergePromptQuickReplies`), exported:

```ts
/** A merge candidate offered in the ambiguous-confirmation quick reply. */
export interface MergeTarget {
  readonly id: string;
  readonly label: string;
}

/** One property the sweep wrote, for the push confirmation. */
export interface AppliedProperty {
  readonly propertyId: string;
  readonly isNew: boolean;
  readonly ambiguous: boolean;
  readonly label: string;
  /** For an ambiguous (create-new) property: the conversation's existing properties offered as
   * merge targets in the confirmation quick reply. */
  readonly mergeTargets?: readonly MergeTarget[];
}

/**
 * "✅ Saved 2 properties: 123 Sukhumvit (new), Thonglor plot (updated)". An ambiguous create-new is
 * tagged "new — please confirm" and, when there are existing properties to merge into, the message
 * carries quick-reply chips that the postback router resolves. LINE only shows one message's quick
 * replies, so we attach the *first* ambiguous property's offer; any others stay flagged in the text.
 */
export function buildConfirmation(applied: AppliedProperty[]): OutboundMessage {
  const noun = applied.length === 1 ? "property" : "properties";
  const items = applied
    .map((a) => {
      const tag = a.ambiguous ? "new — please confirm" : a.isNew ? "new" : "updated";
      return `${a.label} (${tag})`;
    })
    .join(", ");
  const text = `✅ Saved ${applied.length} ${noun}: ${items}`;

  const toConfirm = applied.find((a) => a.mergeTargets !== undefined && a.mergeTargets.length > 0);
  if (toConfirm?.mergeTargets !== undefined) {
    return {
      type: "text",
      text,
      quickReplies: mergePromptQuickReplies(toConfirm.propertyId, [...toConfirm.mergeTargets]),
    };
  }
  return { type: "text", text };
}
```

`views.ts` already imports `OutboundMessage` (line 10) and defines `mergePromptQuickReplies` (line
463) — no new imports needed.

### `app/ingestionSweep.ts` after the refactor — what stays and what changes

**Stays in place (do NOT move):** `IngestionSweepDeps`, `SweepOptions`, `SweepResult`,
`IngestOutcome`, `IngestionSweep` class and all its remaining methods, the constants
`DEFAULT_MAX_CONVERSATIONS`, `DEFAULT_STALE_TIMEOUT_MS`, `DEFAULT_MAX_INGEST_ATTEMPTS`,
`MAX_MEMORY_CHARS`.

> **Sentinel helpers — depends on unit 01 land order (see reconcile note at top).** Unit 01 is
> sequenced first and **deletes** the local `nullToUndef`/`emptyToUndef`/`listToUndef` from this file,
> replacing their uses with imports from `core/domain/sentinel.ts`. So by the time this unit runs,
> there are no local sentinel helpers to "leave in place" — just leave unit 01's *imports* alone and
> don't re-introduce local copies. (In the unlikely event this unit runs before unit 01, leave the
> still-local helpers untouched; unit 01 swaps them afterward.) Either way, this unit neither moves nor
> redefines them.

**New imports at top of `ingestionSweep.ts`:**

```ts
import { buildConfirmation } from "../core/handlers/views.js";
import type { AppliedProperty, MergeTarget } from "../core/handlers/views.js";
import {
  type ClassifiedMedia,
  DEFAULT_MAX_CLASSIFY,
  DEFAULT_MAX_PROPERTY_PHOTOS,
  buildTranscript,
  classifyMedia,
  collectChanote,
  collectPhotos,
  mergeSegment,
} from "./ingestionMedia.js";
```

**Methods that change body** (the class keeps thin wrappers that thread `this`):

```ts
  // was: private async classifyMedia(batch) { ... reads this.deps/this.opts ... }
  // now: call the standalone fn from extractAndApply:
  const maxClassify = this.opts.maxMedia ?? DEFAULT_MAX_CLASSIFY;
  const classified = await classifyMedia({
    batch,
    media: this.deps.media,
    classifier: this.deps.classifier,
    logger: this.deps.logger,
    maxClassify,
  });

  // collectPhotos / collectChanote at the two call sites:
  const maxPhotos = this.opts.maxPropertyPhotos ?? DEFAULT_MAX_PROPERTY_PHOTOS;
  const photos = collectPhotos(segImages, maxPhotos);
  const chanote = collectChanote(segImages);
```

The simplest mechanical approach: **delete** the three private methods (`classifyMedia`,
`collectPhotos`, `collectChanote`) and replace their call sites with the standalone calls, resolving
the cap defaults at each call site (`maxClassify` once in `extractAndApply`; `maxPhotos` once in
`extractAndApply` and once in `singlePassFallback`).

## Step-by-step implementation

Order matters: create the leaf modules first, then rewire the sweep, then fix the bug, then tests.

1. **Create `packages/bot/src/core/utils/concurrency.ts`.** Paste the full-file content from Target
   design. (Creates the `core/utils/` directory.)

2. **Create `packages/bot/src/app/ingestionMedia.ts`.** Paste the full-file content from Target
   design, copying the bodies of `mergeChanote` (lines 153–174), `emptyExtracted` (178–208),
   `mergeSegment` (213–224), and `buildTranscript` (254–288) **verbatim** from `ingestionSweep.ts`.
   Export `ClassifiedMedia`, `ClassifyMediaDeps`, `DEFAULT_MAX_CLASSIFY`,
   `DEFAULT_MAX_PROPERTY_PHOTOS`, `mergeChanote`, `emptyExtracted`, `mergeSegment`, `buildTranscript`,
   `classifyMedia`, `collectPhotos`, `collectChanote`. Keep `CLASSIFY_CONCURRENCY` and
   `MEDIA_CONTENT_TYPES` module-private (not exported).

3. **Add `buildConfirmation` + `AppliedProperty` + `MergeTarget` to
   `packages/bot/src/core/handlers/views.ts`.** Append the block from Target design at the end of the
   file. Export all three.

4. **Edit `packages/bot/src/app/ingestionSweep.ts` — remove moved symbols:**
   - Delete `MergeTarget` (95–98) and `AppliedProperty` (101–109) interface declarations.
   - Delete `ClassifiedMedia` (58–65), `mergeChanote` (153–174), `emptyExtracted` (178–208),
     `mergeSegment` (213–224), `mapWithConcurrency` (229–248), `buildTranscript` (254–288).
   - Delete the constants `DEFAULT_MAX_CLASSIFY` (120), `CLASSIFY_CONCURRENCY` (124),
     `DEFAULT_MAX_PROPERTY_PHOTOS` (126), and `MEDIA_CONTENT_TYPES` (130–136).
   - Delete the `buildConfirmation` function (822–848, including its doc comment).
   - Delete the three private methods `classifyMedia` (681–733), `collectPhotos` (735–758),
     `collectChanote` (760–767).

5. **Edit `ingestionSweep.ts` imports:**
   - Remove `import { formatShortDateTime } from "../core/domain/datetime.js";` (line 9).
   - Change `import { parseGeoLinks, parseMapUrls } from "../core/domain/geo.js";` →
     `import { parseGeoLinks } from "../core/domain/geo.js";` (line 10).
   - Remove `import { mergePromptQuickReplies } from "../core/handlers/views.js";` (line 12).
   - Add the new imports from Target design (`buildConfirmation`, `AppliedProperty`, `MergeTarget`
     from `../core/handlers/views.js`; the `ingestionMedia.js` symbols).
   - Keep all remaining imports (`PropertyExtractor`, `PropertySegmenter`, `ImageClassifier`,
     `ExtractedProperty`, `ExtractionCandidate`, `PropertySegment` are still used by the class —
     `ExtractedProperty`/`ExtractionCandidate`/`PropertySegment` remain in `applyProperty`/
     `toMergeTargets`/`singlePassFallback`/`extractAndApply` signatures; `MediaReader` is still on
     `deps`). Verify after editing that no import is left unused (biome will flag unused imports).

6. **Rewire `extractAndApply`** (currently 422–507):
   - Replace `const classified = await this.classifyMedia(batch);` with:
     ```ts
     const maxClassify = this.opts.maxMedia ?? DEFAULT_MAX_CLASSIFY;
     const classified = await classifyMedia({
       batch,
       media: this.deps.media,
       classifier: this.deps.classifier,
       logger: this.deps.logger,
       maxClassify,
     });
     ```
   - Replace `const { transcript, mapLinks } = buildTranscript(batch, classified);` — already a bare
     call; just ensure it now resolves to the imported `buildTranscript` (no code change beyond the
     import).
   - In the segment loop, add `const maxPhotos = this.opts.maxPropertyPhotos ?? DEFAULT_MAX_PROPERTY_PHOTOS;`
     once (before the loop), then change:
     - `const photos = this.collectPhotos(segImages);` → `const photos = collectPhotos(segImages, maxPhotos);`
     - `const chanote = this.collectChanote(segImages);` → `const chanote = collectChanote(segImages);`
     - `const property = mergeSegment(segment, result?.properties[0]);` — already a bare call; resolves
       to the import.

7. **Rewire `singlePassFallback`** (currently 511–554):
   - Add `const maxPhotos = this.opts.maxPropertyPhotos ?? DEFAULT_MAX_PROPERTY_PHOTOS;` before the
     `single`/`photos` lines.
   - `const photos = single ? this.collectPhotos(classified) : [];` →
     `const photos = single ? collectPhotos(classified, maxPhotos) : [];`
   - `const chanote = single ? this.collectChanote(classified) : undefined;` →
     `const chanote = single ? collectChanote(classified) : undefined;`

8. **Rewire `pushConfirmation`** (currently 784–801): the body call `buildConfirmation(applied)` now
   resolves to the imported function — no code change beyond the import. `AppliedProperty[]` in the
   method signature now resolves to the imported type.

9. **Update remaining `AppliedProperty` references in `ingestionSweep.ts`:** `extractAndApply`
   returns `Promise<AppliedProperty[]>`, `singlePassFallback` returns `Promise<AppliedProperty[]>`,
   `applyProperty` returns `Promise<AppliedProperty>`, and the `applied: AppliedProperty[]` locals —
   all now resolve to the imported type. `toMergeTargets` returns `MergeTarget[]` and `applyProperty`
   takes `mergeTargets: readonly MergeTarget[]` — both now resolve to the imported `MergeTarget`. No
   body changes; just confirm the import covers them.

10. **BUG FIX — add `memory` to the pass-2 extract call** (`extractAndApply`, currently lines
    484–491). Change:
    ```ts
    const result = await this.deps.extractor.extract({
      conversationKey: key,
      text: transcript,
      media: [],
      geoHints: segGeo,
      candidates,
      focus: segment.label,
    });
    ```
    to:
    ```ts
    const result = await this.deps.extractor.extract({
      conversationKey: key,
      text: transcript,
      media: [],
      geoHints: segGeo,
      candidates,
      memory,                // BUG FIX (epoch G D01): pass-2 was silently dropping the memory note
      focus: segment.label,
    });
    ```
    `memory` is already in scope (resolved at line 441 of the current file). `ExtractionRequest.memory`
    is already optional (`core/ports/extraction.ts:66`) — **no port change**.

11. **Run `npm run typecheck` and `npm run lint`**, fix any unused-import / formatting fallout
    (biome may want import ordering adjusted in `ingestionSweep.ts` and `ingestionMedia.ts`).

## Tests

All existing tests must stay green unchanged (they exercise the `IngestionSweep` class; no test
imports a moved symbol directly). Two additions:

### A. Regression guard for the bug fix — `test/unit/ingestionSweep.test.ts`

Add inside the `describe("IngestionSweep — extraction", …)` block. This test FAILS against current
`main` (memory omitted) and PASSES after step 10:

```ts
  it("two-pass: forwards the stored memory note to each pass-2 focused extract", async () => {
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("group#MM"),
          claim: tracker("group#MM"),
          batch: [
            textMsg(1000, "Baan Lak Chai 3 bed"),
            textMsg(40000, "Mooban Wangtan 2.3M"),
          ],
        },
      ],
      {
        memory: { "group#MM": "'the plot' = Baan Lak Chai. Khun Mali is the seller." },
        segment: () => ({
          segments: [
            { label: "Baan Lak Chai", existingPropertyId: "", ambiguous: false, ambiguousWith: [], imageIndices: [], mapIndex: -1 },
            { label: "Mooban Wangtan", existingPropertyId: "", ambiguous: false, ambiguousWith: [], imageIndices: [], mapIndex: -1 },
          ],
          memoryUpdate: "",
        }),
        extract: (req) =>
          req.focus === "Baan Lak Chai"
            ? { properties: [extracted({ normalizedAddress: "Baan Lak Chai" })] }
            : { properties: [extracted({ projectName: "Mooban Wangtan" })] },
      },
    );
    await sweep.run();

    // Pass 1 (segment) AND both pass-2 focused extracts must carry the stored memory note.
    expect(spies.segmentRequests[0]?.memory).toBe("'the plot' = Baan Lak Chai. Khun Mali is the seller.");
    expect(spies.extractRequests).toHaveLength(2);
    expect(spies.extractRequests[0]?.memory).toBe("'the plot' = Baan Lak Chai. Khun Mali is the seller.");
    expect(spies.extractRequests[1]?.memory).toBe("'the plot' = Baan Lak Chai. Khun Mali is the seller.");
    // And focus is still per-segment (we didn't break the two-pass attribution).
    expect(spies.extractRequests.map((r) => r.focus)).toEqual(["Baan Lak Chai", "Mooban Wangtan"]);
  });
```

### B. Dedicated `buildConfirmation` coverage — `test/unit/views.test.ts`

Add `buildConfirmation` to the existing `views.js` import (line 4–15), then add a describe block.
This pins the moved function's text format and quick-reply behaviour (behaviour identical to today):

```ts
describe("buildConfirmation", () => {
  it("renders a single new property as '(new)'", () => {
    const msg = buildConfirmation([
      { propertyId: "p1", isNew: true, ambiguous: false, label: "123 Sukhumvit" },
    ]);
    expect(msg).toEqual({ type: "text", text: "✅ Saved 1 property: 123 Sukhumvit (new)" });
  });

  it("renders a single updated property as '(updated)'", () => {
    const msg = buildConfirmation([
      { propertyId: "p1", isNew: false, ambiguous: false, label: "Thonglor plot" },
    ]);
    expect(msg).toEqual({ type: "text", text: "✅ Saved 1 property: Thonglor plot (updated)" });
  });

  it("tags an ambiguous create-new '(new — please confirm)' and attaches merge quick replies", () => {
    const msg = buildConfirmation([
      {
        propertyId: "new-1",
        isNew: true,
        ambiguous: true,
        label: "The Park",
        mergeTargets: [{ id: "c1", label: "Thonglor plot" }],
      },
    ]);
    expect(msg.type).toBe("text");
    if (msg.type !== "text" || msg.quickReplies === undefined) {
      throw new Error("expected a text confirmation with quick replies");
    }
    expect(msg.text).toBe("✅ Saved 1 property: The Park (new — please confirm)");
    expect(msg.quickReplies[0]).toEqual({
      label: "Merge → Thonglor plot",
      data: "action=merge&from=new-1&into=c1",
    });
    expect(msg.quickReplies.at(-1)).toEqual({ label: "Keep separate", data: "action=keep&id=new-1" });
  });

  it("flags an ambiguous property with no merge targets but adds no quick replies", () => {
    const msg = buildConfirmation([
      { propertyId: "new-1", isNew: true, ambiguous: true, label: "The Park" },
    ]);
    expect(msg).toEqual({ type: "text", text: "✅ Saved 1 property: The Park (new — please confirm)" });
  });

  it("pluralizes and joins multiple properties", () => {
    const msg = buildConfirmation([
      { propertyId: "p1", isNew: true, ambiguous: false, label: "A" },
      { propertyId: "p2", isNew: false, ambiguous: false, label: "B" },
    ]);
    expect(msg).toEqual({ type: "text", text: "✅ Saved 2 properties: A (new), B (updated)" });
  });
});
```

> No new test file for `ingestionMedia.ts` or `concurrency.ts` is required by this unit (the helpers
> remain covered transitively through the `IngestionSweep` tests, and `mapWithConcurrency`'s
> bounded-concurrency property is already pinned by the existing "classifies images with bounded
> concurrency" test). Adding direct unit tests for the now-importable helpers is a reasonable
> follow-up but out of scope here to keep the unit behaviour-preserving.

## Verification

```
npm run typecheck   # tsc across workspaces — expect clean (baseline is clean)
npm run lint        # biome — expect clean; fix import ordering / unused imports if flagged
npm run test        # vitest unit — expect green; the new two-pass-memory test passes only AFTER step 10
```

`npm --prefix packages/bot run test:integration` is **not required** — this unit touches no
persistence/adapter code; the integration test only constructs `IngestionSweep` (path unchanged) and
uses a null segmenter (single-pass fallback), so it is unaffected. Run it opportunistically if docker
is available, but it is not gating.

Expected results: all three gating commands green. Confirm the new
`ingestionSweep.test.ts` memory test would have failed pre-fix (optionally verify by temporarily
reverting step 10) to prove it guards the bug.

## Dependencies & ordering

- **Ordering with the sentinel unit (unit 01): land 01 FIRST, sequentially (not in parallel).** Both
  units edit `ingestionSweep.ts`'s import block and `applyProperty`. The reconcile pass fixed the land
  order to **01 → 05** so the sentinel helpers (`nullToUndef`/`emptyToUndef`/`listToUndef`) are already
  extracted to `core/domain/sentinel.ts` (imported, not locally defined) and `applyProperty`'s upsert
  literal is already collapsed to `...extractedToBaseUpsert(...)` before this unit runs. This unit then
  decomposes the media pipeline / `buildConfirmation` / `mapWithConcurrency` and applies the pass-2
  `memory` bug fix — all in regions disjoint from unit 01's edits. (See the reconcile note at the top
  of this file.)
- The P1 #2 unit also references `ingestionMedia.ts` only indirectly (the `emptyExtracted` sentinels
  are construction-side, not the consume-side `emptyToUndef` — no overlap).
- This unit shares `core/handlers/views.ts` with no other in-flight unit per the blast map (the
  view-layer master-plan note explicitly says "resist restructuring views.ts beyond moving
  `buildConfirmation` out"), so the `views.ts` edit is conflict-free.

## Risk & rollback

- **Anthropic 16-union limit:** NOT at risk. This unit does not touch
  `adapters/anthropic/claudeExtractor.ts`, the `ExtractionSchema`, or any `output_config.format`
  schema. No new `.nullable()`/`.optional()` fields are introduced anywhere. The `memory` bug fix
  reuses an **already-optional** port field (`ExtractionRequest.memory`) — it changes a runtime call
  argument, not a schema. The `countUnionParams` regression test (`claudeExtractor.test.ts`) stays
  green untouched.
- **Layering:** moves strictly toward the hexagonal ideal — a pure utility to `core/utils`, a view
  renderer to `core/handlers/views.ts`, pipeline helpers beside their orchestrator in `app/`. No new
  app→adapter or core→app edges; `core/handlers/views.ts` gains no dependency on `app/` (the type
  flow is app→handler, the already-existing direction).
- **Behavioural risk:** the only behaviour change is the intentional bug fix (memory now reaches
  pass-2). The two cap-resolution moves (`maxClassify`, `maxPhotos` now resolved at the call site
  instead of inside the method) preserve identical defaults (`DEFAULT_MAX_CLASSIFY = 30`,
  `DEFAULT_MAX_PROPERTY_PHOTOS = 12`) and identical option overrides (`opts.maxMedia`,
  `opts.maxPropertyPhotos`). The bounded-concurrency test guards the classify fan-out; the existing
  two-pass and single-pass tests guard photo/chanote attribution.
- **Rollback:** revert the four touched source files + two test files. Because the moves are
  mechanical (verbatim bodies) and the bug fix is one line, a `git revert` of the unit's commit fully
  restores prior behaviour (minus the bug fix). The bug fix alone can be reverted independently by
  removing the single `memory,` line if it were ever suspected of a regression (it cannot regress —
  it only adds context the model may use).

## Open questions / decisions

Status is **ready** — the one design fork (where the media helpers live: `app/ingestionMedia.ts` vs
`core/`) is resolved in favour of `app/ingestionMedia.ts`, matching the scout's recommendation, the
master-plan P1 #8 text ("extract transcript/media helpers to `app/ingestionMedia.ts`"), and the
03-app-lambda F03 suggestion. Rationale: the helpers consume the sweep's own runtime ports
(`MediaReader`, `Logger`) and the extraction port types, and are private to the single
`IngestionSweep` orchestrator — co-locating them in `app/` keeps them next to their only caller
without inventing a core-layer module that depends heavily on ports. `mapWithConcurrency` (zero
dependencies) is the genuinely reusable primitive and correctly goes to `core/utils/`.
