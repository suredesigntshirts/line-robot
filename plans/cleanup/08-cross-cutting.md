# Cross-Cutting Architectural Concerns — Code Quality Findings

## Summary
The hexagonal architecture is largely respected: core domain and ports know nothing about adapters, and the lambda entry points are thin. The primary quality debt is concentrated in three patterns — duplicated business logic (photo ordering, property search, upsert mapping, and upcoming-event collection each appear independently in two or more files), a handful of app-layer files that import adapter concretions directly rather than through ports (violating the dependency rule), and a DTO contract maintained manually in two separate packages with no shared source of truth. One thing done genuinely well: the cold-start memoisation pattern (`let depsPromise ??= buildDeps()`) is consistent, the Logger port adapts cleanly, and the structured error handling in the DynamoDB adapter is exemplary.

## Findings

### [F01] Duplicated photo-ordering logic in two separate layers
**Severity:** high
**File:** `packages/bot/src/core/handlers/catalogAssistant.ts:27–43` and `packages/bot/src/app/readApiHandler.ts:31–48`
**Issue:** `PHOTO_KIND_ORDER`, `orderedPhotos()`, and `heroPhotoKey()` are defined identically (copy-paste) in both files. The only difference is a type annotation (`Record<PhotoKind, number>` vs `Record<string, number>`) and a missing null-coalesce in the sort comparator. Because `catalogAssistant` is in `core/handlers` and `readApiHandler` is in `app/`, neither can import from the other without a layering violation. If the sort order ever changes (e.g. a new `PhotoKind`), it must be updated in both places, and one will drift.
**Suggestion:** Extract a `photoHelpers.ts` module in `core/domain/` (or `core/handlers/`) exporting `orderedPhotos()` and `heroPhotoKey()`. Both call-sites import from there. The `Record<PhotoKind, number>` typing from `catalogAssistant` is the stricter one and should be kept.

### [F02] Duplicated "upcoming" query logic between CatalogAssistant and readApiHandler
**Severity:** high
**File:** `packages/bot/src/core/handlers/catalogAssistant.ts:127–147` and `packages/bot/src/app/readApiHandler.ts:152–177`
**Issue:** `CatalogAssistant.upcoming()` and `handleUpcoming()` in `readApiHandler` are structurally identical: both fan out `listPropertiesForUser` → `listPropertyEvents` per property, filter on `notifiedAt === undefined`, sort ascending by `dueAt`, and build a row list. The only difference is the output format (one returns `OutboundMessage[]`, the other returns an `APIGatewayProxyResultV2`). Any change to the collection logic (e.g. adding a timezone filter, paginating) must be made twice.
**Suggestion:** Extract `collectUpcomingRows(catalog, userId)` returning `UpcomingFollowUp[]` into `CatalogAssistant` or a shared helper in `core/handlers/`. The read-API handler calls it and wraps in `json(200, rows)`; the chat handler calls it and passes to `upcomingMessage()`.

### [F03] Duplicated ExtractedProperty → PropertyUpsert mapping (sentinel stripping)
**Severity:** high
**File:** `packages/bot/src/core/handlers/editReplyHandler.ts:96–125` and `packages/bot/src/app/ingestionSweep.ts:582–618`
**Issue:** `nullToUndef`, `emptyToUndef`, and `listToUndef` are defined as private module-level functions in both `editReplyHandler.ts` (lines 23–33) and `ingestionSweep.ts` (lines 138–148). The 22-field sentinel-to-`PropertyUpsert` mapping that follows is nearly identical in both files — the sweep adds chanote backfill and photo merging, but the 19 shared fields are verbatim duplicates. A future schema change (adding/removing an `ExtractedProperty` field) requires edits in two files that are not obviously linked.
**Suggestion:** Move `nullToUndef`, `emptyToUndef`, `listToUndef`, and an `extractedToBaseUpsert(extracted: ExtractedProperty, now: number): PropertyUpsert` function into a shared module (e.g. `core/handlers/propertyMapping.ts`). The sweep's `applyProperty` and `editReplyHandler` both call it and add their deltas (`chanote`, `photos`, `originConversationKey`, etc.) via spread.

### [F04] Duplicated activity-sort comparator in app and handler layers
**Severity:** medium
**File:** `packages/bot/src/core/handlers/catalogAssistant.ts:45–47` and `packages/bot/src/app/readApiHandler.ts:123`
**Issue:** `byActivityDesc` is a named function in `catalogAssistant.ts` and an anonymous inline in `readApiHandler.ts`, but both express `(b.lastActivityAt ?? b.updatedAt ?? 0) - (a.lastActivityAt ?? a.updatedAt ?? 0)`. The `updatedAt` field in `catalogDto.ts:108` repeats the same two-field fallback `p.lastActivityAt ?? p.updatedAt`. This is a three-way duplication of the same sort key logic.
**Suggestion:** Export `byActivityDesc` from `core/domain/catalog.ts` (where `Property` is defined) or from `core/handlers/catalogDto.ts`, and import it in the other two files.

### [F05] Duplicated "search haystack" logic
**Severity:** medium
**File:** `packages/bot/src/core/handlers/catalogDto.ts:82–94` (`searchText`) and `packages/bot/src/core/handlers/catalogAssistant.ts:50–61` (`matchesQuery`)
**Issue:** `searchText` builds a lowercased joined string from `[normalizedAddress, projectName, district, subdistrict, province, ...rawAddresses]`. `matchesQuery` does a case-insensitive `.includes()` check over exactly the same field list. The list of fields appears in both places. If a new address field is added to `Property`, the developer must update both functions. The `catalogDto` already computes the searchable string — the `catalogAssistant` reimplements the same field enumeration to search it differently.
**Suggestion:** `matchesQuery(p, query)` should call `searchText(p).includes(query.toLowerCase())`, eliminating the field list duplication. Move `searchText` (or a helper returning the field array) to `core/domain/catalog.ts` so both consumers import from the domain.

### [F06] app/eventProcessor.ts imports directly from adapter implementations, not ports
**Severity:** medium
**File:** `packages/bot/src/app/eventProcessor.ts:1–2`
**Issue:**
```
import { isPermanentLineError } from "../adapters/line/lineGateway.js";
import { parseRawEvent } from "../adapters/line/webhookParser.js";
```
`eventProcessor.ts` is in the `app/` orchestration layer. The hexagonal rule is that `app/` depends on ports (interfaces) and receives adapters via injection. By importing `isPermanentLineError` from a concrete adapter, the app layer is coupled to the LINE HTTP error type (`HTTPFetchError` from `@line/bot-sdk`). Similarly, `parseRawEvent` is an adapter implementation detail (it knows about the raw LINE JSON shape). Neither has a port interface.
**Suggestion:** `isPermanentLineError` belongs on the `LineGateway` port: add `isPermanentError(error: unknown): boolean` to the port interface (or as a re-exported helper from the port file), so the app layer calls `this.deps.gateway.isPermanentError(error)` instead. `parseRawEvent` can become part of a `WebhookParser` port whose `parse(raw: unknown): InboundEvent` method is injected into `EventProcessor`.

### [F07] app/ingestHandler.ts holds a concrete adapter type as a port dependency, and imports the LINE SDK constant directly
**Severity:** medium
**File:** `packages/bot/src/app/ingestHandler.ts:1,3,8`
**Issue:**
```
import { LINE_SIGNATURE_HTTP_HEADER_NAME } from "@line/bot-sdk";   // line 1
import type { SignatureVerifier } from "../adapters/line/signatureVerifier.js";  // line 3
…
readonly verifier: SignatureVerifier;   // IngestDeps line 8
```
`IngestDeps.verifier` is typed as the concrete class `SignatureVerifier` (from the adapters) instead of an interface. This means the only way to unit-test `handleIngest` with a fake verifier is to construct the real class or subclass it. `LINE_SIGNATURE_HTTP_HEADER_NAME` from `@line/bot-sdk` is also leaked into the app layer — knowing the header name is a LINE-SDK concern.
**Suggestion:** Define a `SignatureVerifier` port interface in `core/ports/` with a single `verify(body: string | Buffer, signature: string | undefined): boolean` method. Reference that interface in `IngestDeps`. Move the header-name constant into the adapter (`signatureVerifier.ts`) so `ingestHandler` receives the signature via `verifier.headerName` or passes the raw headers to `verifier.verifyRequest(headers, body)`.

### [F08] CatalogAssistant is instantiated twice per cold start in registry.ts
**Severity:** medium
**File:** `packages/bot/src/core/handlers/registry.ts:48,59`
**Issue:** `createDefaultMessageHandler` creates one `CatalogAssistant` instance (line 48) and `createPostbackRouter` creates a second (line 59), both passed the same `deps`. At the lambda level, `processor.ts` calls both factory functions:
```ts
handler: createDefaultMessageHandler({ catalog, clock: SYSTEM_CLOCK, signer, extractor }),
postback: createPostbackRouter({ catalog, clock: SYSTEM_CLOCK, signer }),
```
Two `CatalogAssistant` objects exist for the lifetime of the warm Lambda, both holding references to the same catalog/clock/signer. It is harmless only because `CatalogAssistant` is stateless — but if any state is ever added (a cache, a counter), this silently diverges.
**Suggestion:** Let `createDefaultMessageHandler` and `createPostbackRouter` accept an already-constructed `CatalogAssistant` as a parameter (or have a single `createHandlers(deps)` factory that returns both). Callers pass one shared instance.

### [F09] DTO types duplicated across packages with no shared source of truth
**Severity:** medium
**File:** `packages/miniapp/src/types.ts` and `packages/bot/src/core/handlers/catalogDto.ts`
**Issue:** `types.ts` in the miniapp declares `PropertyListItem`, `Photo`, `Chanote`, `PropertyDetail`, and `UpcomingItem`. `catalogDto.ts` in the bot declares `PropertyListDto`, `PhotoDto`, `PropertyDetailDto` — structurally identical interfaces under different names. The comment in `types.ts` explicitly says "These mirror `catalogDto.ts` … keep these in sync". Manual sync is how drift happens. Because the monorepo has no shared package (`packages/` has only `bot` and `miniapp`), there is nowhere to house the shared contract today.
**Suggestion:** Add a `packages/shared` workspace exporting these DTO interfaces and the `ApiError` class. Both `bot` and `miniapp` import from `@line-robot/shared`. Alternatively, use a path alias in the miniapp's `tsconfig.json` pointing at the bot's `catalogDto.ts` types directly (simpler, no new package). Either approach eliminates the manual sync comment.

### [F10] Lambda cold-start memoisation pattern is copy-pasted across four entry points with inconsistent naming
**Severity:** low
**File:** `packages/bot/src/lambda/ingest.ts:9,24`, `processor.ts:33,93`, `read-api.ts:38,40`, `sweep.ts:49`, `reminder.ts:30`
**Issue:** All five Lambda entry points implement the same "lazy singleton" pattern:
```ts
let depsPromise: Promise<Deps> | undefined;
function getDeps(): Promise<Deps> {
  depsPromise ??= buildDeps();
  return depsPromise;
}
```
The naming is inconsistent: `sweep.ts` and `reminder.ts` use `sweepPromise` / `sweepPromise` without a `getDeps()` wrapper. `processor.ts` uses `depsPromise` with `getDeps()`. There is no shared utility, so the pattern is repeated from memory.
**Suggestion:** Extract a one-liner generic into `lib/`:
```ts
export function lazySingleton<T>(factory: () => Promise<T>): () => Promise<T> {
  let p: Promise<T> | undefined;
  return () => { p ??= factory(); return p; };
}
```
Each Lambda: `const getDeps = lazySingleton(buildDeps);`. Eliminates the module-level `let` and the boilerplate `??=` in every file.

### [F11] SYSTEM_CLOCK object defined inline in four separate lambda files
**Severity:** low
**File:** `packages/bot/src/lambda/processor.ts:26`, `read-api.ts:12`, `sweep.ts:17`, `reminder.ts:10`
**Issue:** `const SYSTEM_CLOCK = { now: () => Date.now() }` appears verbatim in all four files. This is the same trivial object with the same value and the same name, written four times.
**Suggestion:** Export `SYSTEM_CLOCK` from `lib/` or from `core/ports/runtime.ts` (where the `Clock` interface lives). Every lambda imports it instead of defining it locally.

### [F12] `QueuePublisher.publish` accepts `readonly unknown[]` — type erased at the port boundary
**Severity:** low
**File:** `packages/bot/src/core/ports/runtime.ts:3`
**Issue:** The `QueuePublisher` port accepts `readonly unknown[]`. The actual payload type is `EventPayload[]` (with a `webhookEventId: string` and `raw: unknown`). Because the port erases the type, `SqsQueuePublisher` JSON-serialises blindly. If a second payload type were ever published on a different queue, there is no type-level enforcement.
**Suggestion:** Make the port generic: `interface QueuePublisher<T> { publish(events: readonly T[]): Promise<void>; }`. Wire the ingest Lambda as `QueuePublisher<EventPayload>`. The current erasure is tolerable for a single queue system, but the generic form costs nothing and documents intent.

### [F13] `isConditionalCheckFailed` uses an unsafe string-name cast instead of the typed SDK exception
**Severity:** low
**File:** `packages/bot/src/adapters/dynamodb/catalogRepository.ts:363–369`
**Issue:**
```ts
(error as { name?: string }).name === "ConditionalCheckFailedException"
```
The AWS SDK v3 exports `ConditionalCheckFailedException` as a typed class from `@aws-sdk/client-dynamodb`. The current implementation uses a cast and a magic string, which silently returns `false` if the SDK ever renames the error or the import path changes.
**Suggestion:** Import the typed class and use `instanceof`:
```ts
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
function isConditionalCheckFailed(error: unknown): boolean {
  return error instanceof ConditionalCheckFailedException;
}
```

### [F14] `JSON.parse(record.body) as EventPayload` in processor Lambda — no runtime validation
**Severity:** low
**File:** `packages/bot/src/lambda/processor.ts:107`
**Issue:** SQS record bodies are cast directly to `EventPayload` with `as`, skipping runtime validation. If `ingestHandler` ever changes the payload shape, or a dead-letter re-drive delivers a malformed message, the processor processes garbage silently. The idempotency key is derived from `payload.webhookEventId`, which would be `undefined` for a malformed record, causing an idempotency miss rather than a clean error.
**Suggestion:** Add a narrow structural check before the cast: verify `typeof payload.webhookEventId === "string"` and log + skip the record if it fails, similar to the `parseRawEvent` error path in `EventProcessor.process()`.

### [F15] `compact<T>` function in catalogDto.ts uses `as T` cast to paper over a type hole
**Severity:** low
**File:** `packages/bot/src/core/handlers/catalogDto.ts:75–79`
**Issue:**
```ts
function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(…) as T;
}
```
`Object.fromEntries` returns `Record<string, unknown>`, and the `as T` cast hides the fact that required fields (`propertyId`, `photos`) might have been dropped. The function is then called with `compact({…}) as PropertyListDto`, which is a double cast. A required field with an `undefined` value would be silently dropped at runtime while TypeScript considers it present.
**Suggestion:** Separate the optional-field object (which `compact` strips) from the required fields, and merge them: `{ ...compact(optionalFields), propertyId: p.propertyId, search: searchText(p) }`. The `compact` function then only touches genuinely optional fields and doesn't need the cast. `toDetailDto` already does this pattern for `photos` — apply it uniformly.

### [F16] miniapp `api.ts` blindly casts API responses with `as T` — no runtime validation
**Severity:** low
**File:** `packages/miniapp/src/api.ts:24`
**Issue:** `(await response.json()) as T` casts the server response to the caller's type with no validation. If the read-api Lambda changes its response shape, or returns an unexpected error body with a 2xx status code, the SPA processes the wrong shape silently and surfaces confusing UI errors instead of a clear `ApiError`.
**Suggestion:** For a small, well-defined API surface, a simple structural check (or Zod parse) on the response before the cast is sufficient. At minimum, verify that the response is an array (for list endpoints) or an object with expected keys, and throw `ApiError` for structural mismatches.

## Cross-cutting patterns

**The sentinel-to-undefined pattern is load-bearing but scattered.** Three files independently define the same `nullToUndef`/`emptyToUndef`/`listToUndef` trio and the same 20-field `ExtractedProperty → PropertyUpsert` mapping. This pattern exists because the strict-output schema forces sentinels (`""`, `[]`, `null`) over optional fields, but the domain's `PropertyUpsert` uses `undefined`. The translation is a seam that belongs in a single place — the extraction port boundary — not repeated at every call site.

**Two concrete adapter imports leak into the app layer.** `eventProcessor.ts` imports `isPermanentLineError` and `parseRawEvent` from adapter files; `ingestHandler.ts` types its `verifier` dep as the concrete `SignatureVerifier` class and imports the LINE SDK header constant. These are the only architecture violations in an otherwise clean dependency graph — the core never imports from adapters or app, and adapters only import from core ports.

**The Lambda entry-point pattern is stable but written five times.** Every Lambda solves the same cold-start problem (lazy-memoised async dependency graph, shared across invocations) with nearly identical code. A `lazySingleton` utility would make the pattern explicit and eliminate the four boilerplate `??=` blocks.

**No type is duplicated within the `packages/bot` codebase.** All domain types flow from `core/domain/` through ports to adapters. The duplication is exclusively cross-package (bot DTOs vs. miniapp types), which the monorepo's lack of a shared package forces today.
