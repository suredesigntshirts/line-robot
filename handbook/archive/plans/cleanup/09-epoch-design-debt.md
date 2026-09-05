# Epoch Design Debt Analysis

## Executive summary

Epochs A and B were the cleanest relative to their scope: A built a sound hexagonal skeleton with genuine least-privilege IAM and broad test coverage; B established correct concurrency primitives and a clean GSI design, even if the domain model started too flat. Epoch C was the largest single epoch and the single largest debt introducer — 5,200 lines in one push left the app layer reaching into the handler layer, media type sets scattered, and an ambiguous-merge flow with no persistent state. Epochs D and F both introduced production outages through the same schema negligence (nullable budget) and both introduced the same "never clobber with empty" half-fix that prevents trivially wrong writes while leaving silent-replacement writes open. Epochs G and H are the most structurally complex — G layered a full two-pass pipeline into an already 400-line class that grew to 848 lines, and H chose speed over extraction in every case where the miniapp needed something the bot already had, seeding a cross-package type drift that will only worsen as the API evolves.

---

## Recurring patterns across epochs

### 1. Duplication instead of extraction (appears in every epoch C–H)

The same logic is written fresh in a new file rather than extracted to a shared module. The pattern occurs at every scale: a 3-line helper (`emptyToUndef`, `listToUndef`, `nullToUndef` — three copies across three files by epoch G), a 10-line ordering function (`PHOTO_KIND_ORDER` / `orderedPhotos` / `heroPhotoKey` — two copies by epoch H), a 30-line upsert block (sweep vs. edit-reply handler — two copies by epoch F, never merged), and a 100-line type file (bot DTOs vs. miniapp types — epoch H). Each copy ships with a comment acknowledging the duplication ("mirrors heroUrls", "keep these in sync", "matches the chat gallery"), which proves the author knew but chose velocity. The root cause identified across all epochs is the absence of a canonical home: `core/domain/` has no utility subdirectory, and there is no `packages/shared` workspace for cross-package concerns.

### 2. App-layer boundary erosion (epochs A, C, D, H)

The app layer repeatedly imports concrete adapter code or presentation-layer code rather than depending on ports. Epoch A introduced the founding violations (`parseRawEvent` imported directly into `EventProcessor`; AWS Lambda types in `ingestHandler`). Epoch C propagated the pattern upward — both sweeps import `mergePromptQuickReplies` and `propertyTitle` from `core/handlers/views.ts`, reversing the intended dependency direction. Epoch H added a third violation: `readApiHandler.ts` accepts and returns raw `APIGatewayProxyEventV2` / `APIGatewayProxyResultV2` throughout its internals. Each violation was taken as a shortcut ("it's just a utility import", "the function is already there") and none was cleaned up before the next epoch added another.

### 3. "Never clobber with empty" as a substitute for accumulation (epochs D, F)

Both photos (epoch D) and the conversation memory note (epoch D) adopted the pattern: "only write the field if the new value is non-empty." The guard comment in both cases uses the word "clobber," showing awareness of the data-loss risk. But the guard only prevents the trivially empty case — a non-empty replacement still silently overwrites all prior data. Epoch D introduced this for photos (and the outage-causing regression was confirmed in epoch F's notes). Epoch F added photo-gallery accumulation as an explicit fix, but the memory note remained on the replace-if-non-empty pattern through epoch G.

### 4. Feature-flag by omission rather than by signal (epochs C, E)

When a feature is conditionally available (the ambiguous-merge confirmation in epoch C, the edit-reply flow in epoch E), the code disables it by omitting a dependency from the DI graph. The view layer and assistant layer are not informed of the absence and continue to emit UI affordances (the "Reply to update" hint, the armed DynamoDB edit context) as if the feature is live. This produces false UX promises on any deployment without the Anthropic key and accumulates stale database state (armed edit contexts that are never cleared).

### 5. Silent swallow without logging (epochs D, E, F)

Error paths at handler boundaries consistently swallow exceptions without emitting an observable signal. Epoch D introduced this for presigned-URL failures in `heroUrls` (catch returns null, no log). Epoch E copied the pattern verbatim into `presignPhotos` and noted it with a "mirrors heroUrls" comment. Both survived into epoch H's `readApiHandler.ts` presign chain, which drops a bad photo silently. The correct pattern (log a warn before returning null) exists in the media-collection path — the inconsistency is that it was applied there but not at the handler boundary.

### 6. Sentinel discipline applied inconsistently (epochs D, F, G)

The project's hard-won rule — use `""` and `[]` sentinels rather than `null` / `.nullable()` to preserve the Anthropic 16-union budget — was applied inconsistently across epochs. Epoch D introduced `ambiguousWith: z.array(z.string()).nullable()` and `tags: z.array(z.string()).nullable()`, both of which have natural empty-array sentinels, spending two of the 16 budget slots unnecessarily. Epoch G fixed the mass-nullable problem that caused the production 400 outage and added the regression test. But the `ambiguousWith: null` vs `readonly string[] | null` mismatch between schema and port remained unfixed. No epoch added a parallel regression guard for the `SegmentationSchema`.

---

## Legacy debt (introduced early, never addressed)

### From Epoch A — App layer imports adapters directly

`EventProcessor` imports `parseRawEvent` from `adapters/line/webhookParser.ts`. `ingestHandler` imports the LINE SDK header constant and is typed against `APIGatewayProxyEventV2`. These are the founding architectural violations. By epoch H, the same pattern had been replicated in `readApiHandler.ts` rather than corrected. A `WebhookParser` port and a `SignatureVerifier` port were never defined; the app layer has always been coupled to its adapters.

### From Epoch A — Shared `EnvSchema` with optional fields

`QUEUE_URL: z.string().min(1).optional()` in the shared schema forces the ingest Lambda to re-validate at runtime what the schema validation should have enforced at cold start. By epoch H, the read-api Lambda carries env vars (`QUEUE_URL`, `CHANNEL_SECRET`) it has no IAM permission to use, because the same shared-env antipattern was extended rather than split. The five Lambda files each carry noise configuration from the common pool.

### From Epoch A — Lambda entry points: no validation, no test

The `JSON.parse(record.body) as EventPayload` blind cast in `processor.ts` has never been guarded with a Zod parse or structural check. The `buildDeps` composition root — where cold-start failures would memoize a rejected promise and brick all subsequent warm invocations — has no test. By epoch H there are five Lambda files, all following the same unguarded pattern.

### From Epoch B — `Property` is a flat bag of 27+ optionals

The decision not to introduce nested value objects (`PropertyLocation`, `CommercialTerms`, `PhysicalDetail`) at foundation time meant every new field added in epochs C, D, E, F, G was appended as a top-level optional. The `PropertyUpsert` type, the `toProperty` mapper (now 28+ field assignments with no exhaustiveness check), the upsert blocks in both sweep and edit-reply handler, and the extraction schema all reflect the same flat shape. Grouping fields into nested objects would have cost the same Zod budget as today's sentinels, but the decision was deferred and never revisited.

### From Epoch B — `status` typed as bare `string`

The property status field was documented as an 8-value lifecycle enum in epoch B but typed as `string`. Through epochs C, D, E, F, G, and H — across every handler that renders a status badge, every extraction that writes a status, and every view that displays lifecycle state — there is no type-system enforcement. The extraction can write any arbitrary string and it will be stored and displayed without validation.

### From Epoch B — N+1 queries in `listPropertiesForUser`

Three serial fan-out stages (1 Query → N Queries → M GetItems) were introduced in epoch B as "a classic N+1 at the infrastructure boundary." The port signature was already shaped to hide a future GSI3 fix. Through epoch H, the `readApiHandler.allowedPropertyIds` function independently implements the same traversal as a second fan-out, doubling the cost on every detail request. GSI3 remains deferred.

### From Epoch C — Ambiguous merge flow with no persistent state

The confirmation flow (send merge/keep chips after ambiguous extraction) was built in epoch C without recording on the `Property` item that it is awaiting human confirmation. Through epochs D, E, F, G, H, no `needsReviewSince` field was added. A user who ignores the chip produces a property in an unresolved state with no mechanism to surface it again. The confirmation and keep-separate handlers are wired but the kept-separate case still executes no database write (the `id` param from the postback continues to be ignored through epoch H).

### From Epoch C — Duplicate LINE platform limit constants

`MAX_CARDS = 12` / `MAX_UPCOMING_CHIPS = 13` in `views.ts` and `MAX_BUBBLES = 12` / `MAX_QUICK_REPLIES = 13` in `lineGateway.ts` were introduced in epoch C with a comment noting the duplication. They are still separate declarations through epoch H.

---

## Highest-leverage refactors

### 1. `core/domain/sentinel.ts` + `core/handlers/propertyMapping.ts`
**Files touched:** `packages/bot/src/app/ingestionSweep.ts`, `packages/bot/src/core/handlers/editReplyHandler.ts`, `packages/bot/src/adapters/anthropic/claudeExtractor.ts`

Create `core/domain/sentinel.ts` exporting `nullToUndef`, `emptyToUndef`, `listToUndef`. Create `core/handlers/propertyMapping.ts` exporting a single `extractedToBaseUpsert(e: ExtractedProperty): Omit<PropertyUpsert, 'propertyId'>` that both sweep and edit-reply handler call. This eliminates three independent sentinel copies and two diverging 30-field upsert blocks — addressing epoch C, D, F, G findings simultaneously and giving field additions a single edit point. Estimated cross-epoch debt resolved: D-C-D05, D-F-D01, D-G-D02.

### 2. `WebhookParser` port + `SignatureVerifier` port + transport-agnostic `readApiHandler`
**Files touched:** `packages/bot/src/core/ports/runtime.ts` (or new `ports/parsing.ts`), `packages/bot/src/app/eventProcessor.ts`, `packages/bot/src/app/ingestHandler.ts`, `packages/bot/src/app/readApiHandler.ts`, `packages/bot/src/lambda/ingest.ts`

Define `WebhookParser`, `SignatureVerifier`, and `HttpRequest`/`HttpResponse` ports in `core/ports/`. Remove the three concrete adapter imports from the app layer. Move the AWS Lambda type mapping to the lambda entry points. This closes all three architectural boundary violations (epoch A D01, A D02, H D07) in one sweep and enforces the hexagonal rule that was the stated design intent from day one.

### 3. `core/domain/photos.ts` (or `core/handlers/photoHelpers.ts`)
**Files touched:** `packages/bot/src/core/handlers/catalogAssistant.ts`, `packages/bot/src/app/readApiHandler.ts`, `packages/bot/src/core/handlers/catalogDto.ts`

Extract `PHOTO_KIND_ORDER`, `orderedPhotos`, `heroPhotoKey` from `catalogAssistant.ts` into a shared module imported by both `catalogAssistant` and `readApiHandler`. Co-locate `presignGallery` and `presignHero` in `catalogDto.ts` alongside the DTO shape they populate. This resolves epoch H D01 and D07, and makes the miniapp/bot photo-ordering guarantee compile-time rather than comment-enforced.

### 4. `packages/shared` workspace (or TypeScript project reference)
**Files touched:** `packages/miniapp/src/types.ts`, `packages/bot/src/core/handlers/catalogDto.ts`, `packages/miniapp/src/lib/format.ts`, `packages/bot/src/core/domain/datetime.ts`

Create a `packages/shared` (or `packages/api-types`) workspace that both `packages/bot` and `packages/miniapp` import. Export DTO interfaces, Bangkok timezone constants, and `MONTHS` from there. This resolves epoch H D05 and D06 as a side effect of the same workspace setup, turning the "keep these in sync" comment into a compile error. This is the only fix that closes the cross-package drift risk permanently.

### 5. `IngestionSweep` decomposition
**Files touched:** `packages/bot/src/app/ingestionSweep.ts` (848 lines), `packages/bot/src/core/handlers/views.ts`

Extract `buildConfirmation` to `core/handlers/views.ts` (or a new `core/handlers/ingestionMessages.ts`), extract transcript/media helpers to `app/ingestionMedia.ts`, and promote `mapWithConcurrency` to `core/utils/concurrency.ts`. The two-pass pipeline's `ingestOne` method remains orchestration; the helpers become importable and independently testable. Also fix the high-severity bug found in epoch G: add `memory` to the `ExtractionRequest` literal in the two-pass loop (currently omitted, silently degrading multi-property batch quality). This closes epoch C D01, C D10, G D01, G D06 and reduces the class to a tractable size for future changes.

---

## Epoch scorecard

| Epoch | Name | Design quality | Key debt introduced |
|-------|------|----------------|---------------------|
| A | Foundation | Good — clean ports, broad tests, genuine least-privilege IAM | Two architectural violations seeded (adapter imports in app layer, shared EnvSchema with optional fields); lambda entry points untested |
| B | Infra & Staging | Good — correct concurrency primitives, sparse GSI design | Flat 25-optional `Property` type, `status: string` instead of union, N+1 in `listPropertiesForUser`, policy/key constants in wrong layer |
| C | Catalog P1 | Poor — largest single debt epoch (5,200 lines, 10 findings) | App sweeps import handler layer, LINE limit constants duplicated, media MIME sets triplicated, ambiguous-merge flow with no persistent state, `S3RawArchive` dual-role |
| D | Extraction & Photos | Medium — photo-replace-not-accumulate regression, observable failure swallowed silently | Photos overwrite prior sweeps, no regression guard for nullable limit, `ModelTier` leaked from adapter, presign errors swallowed without logging |
| E | Plan 11 (Edit Flow) | Medium — coherent feature with two systemic shortcuts | "Feature-flag by omission" (hint shown when feature inactive, edit context written when handler absent), edit hint injected through `ExtractionRequest.text` field, presign pattern copied verbatim |
| F | Plan 12 (Listing Depth) | Medium — respects nullable discipline under pressure, but copy-paste accelerates | Three helper functions duplicated, two diverging upsert blocks, `mapUrl` extracted differently on two paths, `displayFields` disjoint from card labels |
| G | Plan 13 (Chanote OCR) | Poor — high-severity silent bug introduced, monolith doubles in size | `memory` omitted from two-pass extraction calls (high severity, silently degrading quality), emptyToUndef triplicated, `ClaudeExtractor` does two jobs, `singlePassFallback` diverges from main path |
| H | Plan 14 (MINI App) | Medium — well-tested new surface, but duplication is the defining pattern | Photo ordering duplicated, `allowedPropertyIds` redundant traversal, miniapp types hand-copied from bot DTOs, Bangkok offset duplicated, `readApiHandler` is a monolith on day one |
