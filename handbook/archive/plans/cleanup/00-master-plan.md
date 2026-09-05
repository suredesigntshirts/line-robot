# Master Cleanup Plan

## Executive summary

The codebase is architecturally sound and shows clear hexagonal intent: the core domain is free of infrastructure concerns, Lambda entry points are thin, and the cold-start memoisation pattern is consistent. The most significant quality debt is concentrated in two areas. First, the same business logic is repeated two or three times across layers — photo ordering, "upcoming" event collection, the sentinel-to-upsert mapping, the activity-sort comparator, and the search haystack field list each appear in at least two files with no shared source. Second, two concrete adapter imports have leaked into the app orchestration layer (`eventProcessor.ts` and `ingestHandler.ts`), and the `readApiHandler.ts` in `app/` is coupled directly to AWS Lambda types rather than an abstract HTTP contract, which are the only genuine architectural violations in an otherwise clean graph. A third cluster of issues — `ingestionSweep.ts` at 848 lines, `infra/index.ts` at 760 lines, and `CatalogRepository` with 25 methods across five concerns — reflects normal accrual and is easily decomposed. The miniapp is well-written but carries a manually-synchronised type mirror of the bot's DTO layer that will eventually drift.

---

## Themes

**Theme A — Business logic duplication (velocity blocker).**
Photo ordering (`PHOTO_KIND_ORDER` / `orderedPhotos` / `heroPhotoKey`), the "upcoming" event query fan-out, the `ExtractedProperty → PropertyUpsert` sentinel-stripping mapping (`nullToUndef` / `emptyToUndef` / `listToUndef`), the activity-sort comparator, and the search-haystack field list all appear in two or three files. Because the duplicates live in different layers (`core/handlers/` vs `app/`), neither can import from the other without a violation — the root cause is that these pure domain utilities have no home in `core/domain/`. Every schema change forces two or three edits in unrelated files, with the compiler unable to catch a missed update.

**Theme B — Architectural boundary violations.**
Three specific imports break the hexagonal rule: `eventProcessor.ts` imports `isPermanentLineError` and `parseRawEvent` from adapter files; `ingestHandler.ts` types its verifier dep as the concrete `SignatureVerifier` class and imports a LINE SDK constant; and `readApiHandler.ts` accepts and returns raw `APIGatewayProxyEventV2` / `APIGatewayProxyResultV2` throughout its internals. These are the only places where an `app/` file directly couples to an adapter or to an AWS type.

**Theme C — Monolithic files that have grown past a single concern.**
`ingestionSweep.ts` (848 lines) mixes sweep orchestration, two-pass extraction pipeline, media classification, transcript building, chanote merging, photo merging, and view-concern message building in one file. `infra/index.ts` (760 lines) wires all five Lambdas, five IAM roles, the CloudFront distribution, and all storage resources without decomposition — the `infra/src/` skeleton was set up but never used. `CatalogRepository` exposes 25 methods across five unrelated concern groups.

**Theme D — Cross-package DTO drift.**
`packages/miniapp/src/types.ts` is a hand-maintained copy of `packages/bot/src/core/handlers/catalogDto.ts` under renamed identifiers. The comment in `types.ts` explicitly says "keep these in sync" — the only enforcement is developer discipline. The monorepo has no shared package today, so fixing this requires either adding `packages/shared` or using TypeScript project references to import bot types directly.

**Theme E — Naming and type inconsistencies in the domain.**
`GeoLocation` (LINE location messages) uses `latitude`/`longitude` while every other coordinate-bearing type uses `lat`/`long` (5:1 ratio). `ConversationTracker` lives in `catalog.ts` despite being an ingestion-infrastructure concern. `IngestionStatus` is a repeated inline string union with no named type. `Property` has 27 optional fields including `createdAt`/`updatedAt`, so the read type provides almost no structural guarantee. `PropertyEvent` collides cognitively with `InboundEvent` in the same folder. `findPendingConversations` and `findDueEvents` accept `nowIso: string` while all other time parameters in the same interface are epoch milliseconds.

**Theme F — Duplicated boilerplate with a clear shared home.**
`SYSTEM_CLOCK` is defined identically in four Lambda files. The lazy-singleton memoisation pattern (`let depsPromise; depsPromise ??= buildDeps()`) is written five times with inconsistent variable naming. Both integration tests duplicate 100 lines of Docker/DynamoDB-Local harness. The two image-MIME-type `Set` constants in `claudeExtractor.ts` (`IMAGE_MEDIA_TYPES` and `IMAGE_TYPES_FOR_CLASSIFY`) contain identical values. The single-vs-carousel dispatch in `lineGateway.ts` is copy-pasted between two functions.

**Theme G — Missing test coverage and test quality gaps.**
`parseRawEvent` (the hot path for every processed SQS message) has zero test coverage and contains an unsafe blind cast. `SqsQueuePublisher` has no test at all. `rawArchive.test.ts` is missing a test for `getMedia`. Test assertions in `lineGateway.test.ts` use optional chaining, which hides missing fields behind `undefined` rather than throwing on the missing intermediate. The shared `ExtractedProperty` fixture is inlined in full in two test files.

**Theme H — Minor infra and build hygiene.**
`infra/index.ts` duplicates Lambda + IAM boilerplate five times (a helper function would reduce it by ~60 lines). The shared `EnvSchema` forces the read-only `read-api` Lambda to carry env vars it has no IAM permission to use. `messageRepository.ts` omits `casing: "none"` on its ElectroDB entity, meaning LINE group IDs are silently lowercased on write, which could cause key mismatches with non-ElectroDB callers. A handful of magic strings (`"PENDING"`, `"DUE"`, `"conversationTracker"`, `"setfollowup"`) are embedded inline rather than named constants.

---

## Priority queue

### P1 — Do first (architecture + velocity blockers)

| # | Theme | File(s) | Summary | Est. effort |
|---|-------|---------|---------|-------------|
| 1 | A — Logic duplication | `core/handlers/catalogAssistant.ts`, `app/readApiHandler.ts` | Extract `orderedPhotos`, `heroPhotoKey`, `byActivityDesc` into `core/domain/photos.ts` or `core/domain/catalog.ts`; both callers import from domain | 1 h |
| 2 | A — Logic duplication | `core/handlers/editReplyHandler.ts`, `app/ingestionSweep.ts`, `adapters/anthropic/claudeExtractor.ts` | Create `core/domain/sentinel.ts` with `nullToUndef`/`emptyToUndef`/`listToUndef`; create `core/handlers/propertyMapping.ts` with `extractedToBaseUpsert()`; replace all three independent copies | 2 h |
| 3 | A — Logic duplication | `core/handlers/catalogAssistant.ts`, `app/readApiHandler.ts` | Extract `collectUpcomingRows()` into a shared helper; both the chat handler and the read-API use it | 1 h |
| 4 | A — Logic duplication | `core/handlers/catalogDto.ts`, `core/handlers/catalogAssistant.ts` | Move `searchableText()` into `core/domain/` (single authoritative field list); have `matchesQuery` call it | 1 h |
| 5 | B — Boundary violations | `app/eventProcessor.ts` | Add `isPermanentError(e: unknown): boolean` to the `LineGateway` port; add `WebhookParser` port with `parse(raw: unknown): InboundEvent`; remove direct adapter imports from `app/` | 2 h |
| 6 | B — Boundary violations | `app/ingestHandler.ts` | Define `SignatureVerifier` port interface in `core/ports/`; move LINE SDK header constant into adapter; remove `@line/bot-sdk` import from `app/` | 1 h |
| 7 | B — Boundary violations | `app/readApiHandler.ts` | Define `HttpRequest`/`HttpResponse` in `core/ports/`; move Lambda type mapping to `lambda/read-api.ts`; app handler becomes transport-agnostic | 3 h |
| 8 | C — Monolith | `app/ingestionSweep.ts` (848 lines) | Extract `buildConfirmation` + view types to `core/handlers/views.ts`; extract transcript/media helpers to `app/ingestionMedia.ts` | 2 h |
| 9 | E — Domain naming | `adapters/dynamodb/messageRepository.ts` | Add `casing: "none"` to ElectroDB entity pk/sk; verify no existing rows have lowercased keys (silent data-access bug if mixed-case GROUP IDs exist) | 1 h |
| 10 | G — Test coverage | `adapters/line/webhookParser.ts` | Add Zod/guard validation to `parseRawEvent` before the blind cast; add unit tests for the SQS-path (valid event → parses, invalid shape → throws) | 2 h |

### P2 — Soon (code smells + naming)

| # | Theme | File(s) | Summary | Est. effort |
|---|-------|---------|---------|-------------|
| 11 | C — Monolith | `infra/index.ts` (760 lines) | Extract `infra/src/storage.ts`, `iam.ts`, `lambdas.ts`, `miniapp.ts`; `index.ts` becomes an orchestrator | 2 h |
| 12 | C — Monolith | `core/ports/catalog.ts` | Split `CatalogRepository` (25 methods, 5 concerns) into `ConversationIngestionStore`, `PropertyStore`, `MembershipStore`, `FollowUpStore`; DynamoDB adapter implements all | 3 h |
| 13 | D — Cross-package drift | `packages/miniapp/src/types.ts`, `packages/bot/src/core/handlers/catalogDto.ts` | Add `packages/shared` workspace or use TS project references; both packages import DTO interfaces from one source | 3 h |
| 14 | E — Domain naming | `core/domain/message.ts`, `adapters/line/webhookParser.ts` | Rename `GeoLocation.latitude/longitude` → `lat/long`; collapse `ParsedGeo` and `ExtractionGeoHint` into a shared `GeoCoord` type | 1 h |
| 15 | E — Domain naming | `core/domain/catalog.ts` | Move `ConversationTracker` to `core/domain/ingestion.ts`; add `export type IngestionStatus = "IDLE"|"INGESTING"|"FAILED"` | 1 h |
| 16 | E — Domain naming | `core/domain/catalog.ts` | Promote `createdAt`, `updatedAt`, `lastActivityAt` to required on the read `Property` type; add a write-only `PropertyUpsert` type where they remain optional | 2 h |
| 17 | E — Domain naming | `core/ports/catalog.ts` | Change `findPendingConversations` and `findDueEvents` from `nowIso: string` to `nowMs: number`; move `toISOString()` into the DynamoDB adapter | 30 m |
| 18 | F — Boilerplate | `lambda/processor.ts`, `read-api.ts`, `sweep.ts`, `reminder.ts`, `ingest.ts` | Extract `lazySingleton<T>` helper to `lib/`; export `SYSTEM_CLOCK` from `core/ports/runtime.ts` or `lib/clock.ts`; unify all five Lambda files | 1 h |
| 19 | H — Infra hygiene | `adapters/config/config.ts`, `infra/index.ts` | Define `ReadApiEnvSchema` with only the three vars the read-api Lambda actually uses; remove noise env vars from its role | 1 h |
| 20 | H — Infra hygiene | `infra/index.ts` | Add `lambdaRole(name, statements)` and `botLambda(opts)` helpers to eliminate five sets of copy-pasted IAM + Lambda boilerplate | 2 h |
| 21 | G — Test coverage | `adapters/queue/sqsPublisher.ts` | Add `test/unit/sqsPublisher.test.ts` covering single batch, multi-batch (>10), partial failure, empty input | 1 h |
| 22 | G — Test coverage | `test/unit/rawArchive.test.ts` | Add tests for `getMedia` success path and missing-body error path | 30 m |
| 23 | A — Logic duplication | `core/handlers/registry.ts` | Merge `createDefaultMessageHandler` + `createPostbackRouter` into `createHandlers(deps)` returning `{ messageHandler, postbackRouter }` sharing one `CatalogAssistant` instance | 1 h |
| 24 | H — Magic strings | `adapters/dynamodb/catalogRepository.ts` | Define `GSI1_PK = "PENDING"`, `GSI2_PK = "DUE"`, `TRACKER_ENTITY_TYPE = "conversationTracker"` as module-level constants; replace inline literals | 30 m |
| 25 | C — Monolith | `adapters/anthropic/claudeExtractor.ts` | Merge `IMAGE_MEDIA_TYPES` and `IMAGE_TYPES_FOR_CLASSIFY` into one `SUPPORTED_IMAGE_MEDIA_TYPES`; extract shared `toMediaBlock()` helper used by both content builders | 1 h |
| 26 | H — Infra hygiene | `adapters/line/lineGateway.ts` | Name the five hardcoded hex colour literals; extract `wrapBubbles()` to deduplicate the single-vs-carousel dispatch in `toFlexContainer` and `toImageCarousel` | 30 m |

### P3 — Nice to have

| # | Theme | File(s) | Summary | Est. effort |
|---|-------|---------|---------|-------------|
| 27 | E — Domain naming | `core/domain/catalog.ts` | Rename `PropertyEvent` → `FollowUp` (or `CalendarEvent`) to avoid cognitive collision with `InboundEvent`; cascade rename to `addEvent`, `listPropertyEvents`, `findDueEvents` | 1 h |
| 28 | E — Domain typing | `core/domain/catalog.ts` | Introduce `ListingType`, `IngestionStatus` narrow union types for fields currently typed as `string` where a closed vocabulary is enforced | 2 h |
| 29 | F — Boilerplate | `test/integration/` | Extract shared `startDynamoDBLocal(containerName)` helper from the two integration test files that duplicate 100 lines of Docker harness | 1 h |
| 30 | G — Test quality | `test/unit/lineGateway.test.ts` | Replace optional-chaining inside `expect()` with intermediate `toBeDefined()` assertions so failures report the missing field, not `undefined` | 30 m |
| 31 | G — Test quality | `test/unit/`, `editReplyHandler.test.ts`, `registry.test.ts` | Create `test/fixtures/fakeExtraction.ts` builder so both test files stop inlining the full 22-field `ExtractedProperty` literal | 1 h |
| 32 | B — Domain naming | `core/ports/runtime.ts` | Make `QueuePublisher` generic (`QueuePublisher<T>`) or at least type it as `EventPayload[]` instead of `unknown[]` | 30 m |
| 33 | H — Build hygiene | `packages/bot/package.json` | Replace pinned `@esbuild/linux-x64` with platform-neutral optional-dependency detection so ARM CI and Apple Silicon work | 30 m |
| 34 | H — Build hygiene | `tsconfig.base.json`, `packages/miniapp/tsconfig.json` | Add `noUnusedLocals`/`noUnusedParameters` to base config; have miniapp extend base; add comment to infra tsconfig | 30 m |
| 35 | H — Build hygiene | `infra/package.json` | Move `@pulumi/aws` and `@pulumi/pulumi` from `dependencies` to `devDependencies` | 5 m |
| 36 | H — Infra hygiene | `infra/Pulumi.yaml` | Update stale "LINE echo bot" description; move hardcoded `Environment: staging` tag into `index.ts` using `pulumi.getStack()` | 15 m |
| 37 | H — Infra hygiene | `infra/index.ts` | Add comment or use `aws.cloudfront.getCachePolicyOutput({ name: "Managed-CachingOptimized" })` to replace the opaque UUID | 15 m |
| 38 | H — Infra hygiene | `infra/Pulumi.staging.yaml` | Add comment to `assertionPrivateKey`/`assertionKeyId` entries explaining deferred purpose, or remove if abandoned | 15 m |
| 39 | miniapp | `packages/miniapp/src/App.tsx` | Split mount-only `popstate` listener from path-tracking `replaceState` effect; fix misleading "Mount-only" comment | 30 m |
| 40 | miniapp | `packages/miniapp/src/api.ts` | Delete dead `api.upcoming()` and `UpcomingItem`; add 15 s `AbortController` timeout; handle network errors in `ErrorView` | 1 h |
| 41 | miniapp | `packages/miniapp/src/lib/format.ts` | Replace manual UTC+7 epoch-shift in `formatDate` with `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok' })` | 30 m |
| 42 | miniapp | `packages/miniapp/src/screens/List.tsx` | Show `visible.length` (filtered) vs `items.length` (total) in header when filters are active | 15 m |
| 43 | miniapp | `packages/miniapp/src/components/Gallery.tsx` | Wrap lightbox in `<dialog>` for native focus trap + Escape key; assign `caption(photo)` to a variable used for both `alt` and `figcaption` | 1 h |
| 44 | miniapp | `packages/miniapp/src/styles.css` | Add `white-space: nowrap` to `.card-title` (or switch to `-webkit-line-clamp: 2`) | 5 m |
| 45 | miniapp | `packages/miniapp/src/screens/List.tsx` | Inline filters object inside `useMemo` factory to remove the redundant outer variable | 15 m |
| 46 | miniapp | `packages/miniapp/src/lib/deeplink.ts`, `App.tsx` | Export `normalizePath` from `deeplink.ts`; delete the private copy in `App.tsx` | 15 m |
| 47 | E — Domain typing | `core/ports/extraction.ts` | Normalise `memoryUpdate` to `readonly memoryUpdate?: string` (no `null`); remove dual-absence values | 30 m |
| 48 | adapters | `adapters/line/lineTokenVerifier.ts` | Change `<=` to `<` in JWT expiry check to match standard semantics | 5 m |
| 49 | adapters | `adapters/line/richMenu.ts` | Rename `RICH_MENU_TABS` to `BASE_RICH_MENU_TABS` with JSDoc noting it excludes the Catalog tab | 15 m |
| 50 | adapters | `adapters/anthropic/claudeExtractor.ts` | Replace `?? "claude-haiku-4-5"` fallback with `this.ladder[0]!.model`; validate ladder non-empty in constructor | 15 m |
| 51 | adapters | `adapters/anthropic/claudeExtractor.ts` | Fix misleading "else null" instruction in `buildExtractionContent` candidates section — should say "else empty string" | 5 m |
| 52 | adapters | `adapters/dynamodb/catalogRepository.ts` | Add `import { ConditionalCheckFailedException }` and use `instanceof` instead of the string-name cast | 15 m |
| 53 | adapters | `lambda/processor.ts` | Add structural check on `EventPayload` after `JSON.parse` before processing; skip + log on missing `webhookEventId` | 30 m |
| 54 | infra | `infra/index.ts` | Derive SQS `visibilityTimeoutSeconds` from `processorTimeout * 6` instead of the hardcoded `180` | 15 m |

---

## Execution order

**Start with P1 #2 (sentinel.ts + propertyMapping.ts) before #1, #3, #4.** The sentinel helpers appear in three files and one of them (`ingestionSweep.ts`) also contains the duplicated upsert mapping. Extracting the shared module first gives #1, #3, and #8 a cleaner working surface.

**P1 #5 and #6 (boundary violations) before #7.** Fixing `eventProcessor.ts` and `ingestHandler.ts` first (simpler, narrower changes) builds familiarity with the port-extension pattern before tackling the larger `readApiHandler.ts` refactor (#7), which touches every helper function in that file.

**P1 #9 (messageRepository casing) should be done and deployed early** because it is a silent data-integrity risk: LINE GROUP IDs contain uppercase characters and the missing `casing: "none"` means those keys are stored lowercased in DynamoDB. Confirm the impact with a scan before applying the fix — if no GROUP messages exist yet, the fix is trivially safe.

**P2 #12 (split CatalogRepository) after P1 work is landed,** because the port split interacts with the boundary-violation fixes (#5, #6, #7): once the injection points are narrowed, the smaller interfaces become immediately usable.

**P2 #13 (shared types package) is independent** — it touches only `packages/miniapp/src/types.ts` and the bot's DTO layer. It can be done in parallel with the P1 wave if a second developer is available.

**P2 #11 (infra decomposition) and #20 (infra helpers) are entirely independent** of the bot code and can be done any time without risk of breaking Lambda behaviour.

**P3 miniapp items (#39–#46) are a single focused session** — the miniapp is small, has no downstream consumers, and can be cleaned in one sitting after the P1/P2 waves are stable.

---

## What NOT to touch

- **The sentinel-over-nullable discipline in `ExtractedProperty` and `ExtractionSchema`.** The ≤16 union-type hard limit (documented in CLAUDE.md and the area-specific CLAUDE.md) is non-negotiable. The current sentinel approach is correct and must not be reversed.
- **The ElectroDB single-table design and access patterns in `catalogRepository.ts`.** The raw `QueryCommand` calls for GSI1/GSI2 (bypassing ElectroDB) are intentional and clearly commented. The mapper defensiveness is correct given both typed and raw call sites.
- **The `idempotency.ts` module.** The `powertools-lambda-typescript` idempotency integration is correct and the thin wrapper is justified by the test injection seam. Leave it alone.
- **The Lambda cold-start memoisation pattern overall.** `lazySingleton` (P2 #18) is a style improvement; the underlying `??=` logic is correct and should not be altered beyond the structural normalisation.
- **Security-critical code: `signatureVerifier.ts` and `lineTokenVerifier.ts`.** Both are simple, correct, and well-tested. The `<=` vs `<` fix (#48) is the only safe change here.
- **`views.ts` module.** It is the best-executed file in the handler layer — flat, readable, pure, well-separated. Resist the urge to restructure it beyond moving `buildConfirmation` out (P1 #8).
- **The two-pass extraction pipeline logic in `claudeExtractor.ts`.** The escalation ladder, segmentation flow, and nullable budget management are complex and correct. Changes here carry production risk. Limit cleanup to the constant deduplication and instruction-text fix (P2 #25, P3 #51).
- **The `processor.ts` `BATCH_SIZE = 1` setting and `batchItemFailures` pattern.** This is a deliberate correctness choice for the SQS event source — do not change.
