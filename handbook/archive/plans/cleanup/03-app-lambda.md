# App Orchestration Layer + Lambda Entry Points — Code Quality Findings

## Summary

The lambda entry points are genuinely thin and follow a clean, consistent memoization pattern. `EventProcessor` and `ReminderSweep` are well-structured and easy to follow. The main concerns are: `ingestionSweep.ts` has grown to 848 lines and carries too many responsibilities — it is the clear hotspot in this area; two app-layer handlers (`ingestHandler`, `readApiHandler`) directly import AWS Lambda types, which is an architectural boundary violation; and three utility function triplets (`nullToUndef`/`emptyToUndef`/`listToUndef`) are defined independently in three separate files without a shared home. The `idempotency.ts` module and `logger.ts` adapter are tight and well-designed.

---

## Findings

### [F01] `ingestHandler.ts` imports a Lambda SDK type constant into the app layer
**Severity:** medium
**File:** `packages/bot/src/app/ingestHandler.ts:1`
**Issue:** `LINE_SIGNATURE_HTTP_HEADER_NAME` is imported directly from `@line/bot-sdk` into the app handler. The app layer is supposed to be infrastructure-agnostic; this couples it to the LINE SDK package. The handler also directly accepts and returns `APIGatewayProxyEventV2` / `APIGatewayProxyResultV2` (lines 34–35), which are Lambda-specific AWS types. Together these mean `ingestHandler.ts` cannot be tested without the LINE SDK or the `aws-lambda` type package being available, and it would need to change if the transport ever changed (Function URL → API Gateway, or a different runtime).
**Suggestion:** Move the header constant to a string literal or a shared `lineConstants.ts` in the adapters layer. For the event/result types, either keep them in the lambda entry point (a one-liner `handleIngest(deps, event)` call) and have the app function accept a plain `{ headers: Record<string, string|undefined>, body: string|undefined, isBase64Encoded: boolean }`, or accept the current pragmatism given the tight Function URL coupling — but at minimum the LINE SDK import should not cross this boundary.

---

### [F02] `readApiHandler.ts` is an AWS Lambda handler living in `app/`
**Severity:** medium
**File:** `packages/bot/src/app/readApiHandler.ts:12`
**Issue:** The file imports `APIGatewayProxyEventV2` and `APIGatewayProxyResultV2` at lines 12, 54, 63, 121, 138, 152, 194–195. Every private helper function (`json`, `bearerToken`, `handleMyProperties`, `handlePropertyDetail`, `handleUpcoming`) returns or accepts these Lambda types directly. This is more severe than `ingestHandler` because the routing logic, auth extraction, and response serialization are all interleaved with the Lambda request/response contract rather than working against an abstract HTTP request shape. The `app/` layer is documented as "pure orchestration over ports — fully unit-testable"; the tests work around this by casting `as unknown as APIGatewayProxyEventV2`, which is a sign the abstraction is leaking.
**Suggestion:** Define a small `HttpRequest` / `HttpResponse` interface in `core/ports/` (method, path, headers, body) and a matching `HttpHandler` port. The lambda entry point (`lambda/read-api.ts`) maps `APIGatewayProxyEventV2` → `HttpRequest` before calling the app function and maps `HttpResponse` → `APIGatewayProxyResultV2` on the way out. The app handler becomes genuinely transport-agnostic and the tests drop the ugly cast.

---

### [F03] `ingestionSweep.ts` is 848 lines — it has grown beyond a single orchestration file
**Severity:** medium
**File:** `packages/bot/src/app/ingestionSweep.ts`
**Issue:** The file contains: the sweep runner and its tally (`run`, `ingestOne`), a two-pass extraction pipeline (`extractAndApply`, `singlePassFallback`), media classification with concurrency control (`classifyMedia`, `mapWithConcurrency`), transcript building (`buildTranscript`), MIME sniffing helpers (`MEDIA_CONTENT_TYPES`), chanote merging (`mergeChanote`, `collectChanote`), photo merging (`collectPhotos`, `mergePhotos`), confirmation message building (`buildConfirmation`), memory update application (`applyMemoryUpdate`), and four free-standing utility functions. The public export `buildConfirmation` is the confirmation message builder — a view concern — sitting in the same file as sweep mechanics. Each responsibility is individually clear, but the file has grown past the point where a reader can hold it in one mental frame.
**Suggestion:** Extract at minimum two things: (1) move `buildConfirmation` and its `AppliedProperty`/`MergeTarget` types to `core/handlers/views.ts` (where `reminderMessage`, `mergePromptQuickReplies`, and `propertyTitle` already live) — it's a view function, not sweep mechanics; (2) move `buildTranscript`, `mapWithConcurrency`, and the media helpers (`classifyMedia`, `collectPhotos`, `collectChanote`, `mergeChanote`) to a co-located `ingestionMedia.ts` or `transcriptBuilder.ts`. The sweep file then orchestrates, and the helpers are independently readable and testable.

---

### [F04] `claimed` and `ingested` in `SweepResult` are always identical — one is redundant
**Severity:** low
**File:** `packages/bot/src/app/ingestionSweep.ts:351–352`
**Issue:** In `run()`, `tally.claimed` and `tally.ingested` are always incremented together (`tally.claimed += 1; tally.ingested += 1`) in the same branch. They can never diverge: a conversation is either skipped (neither incremented), abandoned (neither incremented), failed (neither incremented), or successfully processed (both incremented by 1). The `SweepResult` interface documents them separately ("Conversations this sweep claimed" vs "Conversations fully processed and released") as if a claim could succeed but the ingestion fail — but that failure path increments `failed`, not `claimed`. Having both in the public result type creates a maintenance hazard (a future change might increment only one) and a documentation lie.
**Suggestion:** Remove `claimed` from `SweepResult` and use `ingested` as the sole count. Update the log line and any consumers. If distinguishing claim-won-but-processing-failed ever becomes meaningful, add that back explicitly then.

---

### [F05] Sentinel helpers `nullToUndef`/`emptyToUndef`/`listToUndef` are defined three times
**Severity:** low
**File:** `packages/bot/src/app/ingestionSweep.ts:138–149`, `packages/bot/src/core/handlers/editReplyHandler.ts:23–31`, `packages/bot/src/adapters/anthropic/claudeExtractor.ts:397`
**Issue:** The same three one-liner utility functions (`nullToUndef`, `emptyToUndef`, `listToUndef`) are independently defined in `ingestionSweep.ts`, `editReplyHandler.ts`, and a variant of `emptyToUndef` in `claudeExtractor.ts`. Each copy is identical in behavior. This is pure duplication — the functions exist for the same reason (sentinel-to-absent mapping for set-if-present upserts) and will diverge silently if the sentinel convention ever changes.
**Suggestion:** Create `packages/bot/src/core/domain/sentinel.ts` exporting all three helpers with their doc comments. Replace all three sets of local definitions with imports from that module. The file belongs in `domain/` because the sentinel convention is a domain decision (empty string = absent), not an infrastructure one.

---

### [F06] `SYSTEM_CLOCK` is copy-pasted into four Lambda files
**Severity:** low
**File:** `packages/bot/src/lambda/processor.ts:26`, `packages/bot/src/lambda/read-api.ts:12`, `packages/bot/src/lambda/reminder.ts:10`, `packages/bot/src/lambda/sweep.ts:17`
**Issue:** `const SYSTEM_CLOCK = { now: () => Date.now() }` appears verbatim in all four Lambda entry points. It is not exported or shared. This is a trivial but clean example of unnecessary repetition — if the clock interface ever changed (e.g., adding a `nowIso()` helper), all four files would need to be updated individually.
**Suggestion:** Export `SYSTEM_CLOCK` from `lib/clock.ts` (one line) and import it in each lambda. Alternatively, if `Clock` is already defined in `core/ports/runtime.ts`, a `systemClock` constant exported from there fits naturally.

---

### [F07] `reminder.ts` lambda uses a different memoization variable name than the others
**Severity:** low
**File:** `packages/bot/src/lambda/reminder.ts:30`, `packages/bot/src/lambda/sweep.ts:49`
**Issue:** The two scheduled-event lambdas (`reminder.ts`, `sweep.ts`) memoize their built objects in a module-level `let sweepPromise`. The two HTTP lambdas (`ingest.ts`, `read-api.ts`) use `depsPromise`. The inconsistency is minor but the sweep lambdas also differ from each other in build-function naming (`buildReminderSweep` vs `buildSweep`) and they skip the `getDeps()` indirection that the HTTP lambdas use, instead inlining `sweepPromise ??= buildSweep()` directly in the handler body. None of this causes bugs, but a reader switching between files has to re-orient to the local pattern each time.
**Suggestion:** Normalise all four files to the same three-part pattern: `buildDeps`, `let depsPromise`, `getDeps`. The handler always calls `getDeps()`. The build-function names can differ (they describe what they build), but the variable and getter should be uniform.

---

### [F08] `ingestHandler.ts` imports a LINE SDK adapter constant — adapter concern in app layer
**Severity:** low
**File:** `packages/bot/src/app/ingestHandler.ts:1`
**Issue:** `LINE_SIGNATURE_HTTP_HEADER_NAME` from `@line/bot-sdk` is a string constant (`"x-line-signature"`). Importing the LINE SDK package into the app layer adds a compile-time dependency from the orchestration layer to an adapter-level library. If the constant were inlined as `"x-line-signature"` in the `SignatureVerifier` adapter (which is the only caller that needs it), or exported from the adapter, the app layer would have no direct dependency on `@line/bot-sdk`.
**Suggestion:** Move the constant into `adapters/line/signatureVerifier.ts` or a `adapters/line/lineConstants.ts` file, and have `ingestHandler.ts` receive the header name as part of the `SignatureVerifier` interface — or simply have the verifier accept a `headers` map directly, so the app handler never needs to know the header name at all.

---

### [F09] `handleUpcoming` in `readApiHandler.ts` fetches all properties then all events — N+1 pattern
**Severity:** low
**File:** `packages/bot/src/app/readApiHandler.ts:152–177`
**Issue:** `handleUpcoming` calls `listPropertiesForUser` to get all properties (one query), then fans out `listPropertyEvents` for every property in parallel. For a user with many properties this is an N+1 pattern (1 + N DynamoDB queries). The current user base is small so this is not urgent, but the design bakes in the pattern rather than letting the repository handle it.
**Suggestion:** Add a `listDueEventsForUser(userId, nowMs)` method to `CatalogRepository` that performs a single GSI query. The read-api handler calls it directly without loading properties first. The property title join can be done either in a single `batchGetProperties` call or dropped from this endpoint if the SPA can derive the title from the already-loaded properties list.

---

### [F10] `idempotency.ts` wraps a thin factory that adds little over direct construction
**Severity:** low
**File:** `packages/bot/src/lib/idempotency.ts`
**Issue:** `createPersistenceLayer` (lines 11–16) is a factory that constructs a `DynamoDBPersistenceLayer` with optional `awsSdkV3Client` forwarding. The spread conditional `...(opts.awsSdkV3Client ? { awsSdkV3Client: opts.awsSdkV3Client } : {})` is three lines to express "pass the client if present." `createIdempotencyConfig` (lines 24–26) is a one-liner that returns `new IdempotencyConfig(...)`. Both functions exist solely to be injected into the processor lambda and to allow the integration test to swap the DynamoDB client — a reasonable goal, but the abstraction is so thin it provides almost no insulation. The JMESPath string `"webhookEventId"` is a magic string with no validation.
**Suggestion:** Collapse `createIdempotencyConfig` into its only call site in `lambda/processor.ts` where the config intent is already documented. Keep `createPersistenceLayer` for the DDB client injection seam. Consider naming the JMESPath key via `keyof EventPayload` or at minimum a named constant so it stays in sync with the `EventPayload` type.

---

### [F11] `ingestHandler.ts` silently maps a missing `webhookEventId` to `""`
**Severity:** low
**File:** `packages/bot/src/app/ingestHandler.ts:50`
**Issue:** `webhookEventId: typeof raw.webhookEventId === "string" ? raw.webhookEventId : ""` — a missing or non-string event id is silently coerced to the empty string `""`. The idempotency system keys on `webhookEventId` (via JMESPath), so two events with a missing id would collide in the idempotency table: the second would be silently deduplicated as if it were a redelivery of the first. LINE's webhook spec guarantees the field is always present and a UUID, so this is low risk in practice, but the silent coercion hides a structural problem that should be a warning-log + drop (matching the parse-error handling in `EventProcessor`).
**Suggestion:** Log a `warn` and skip the event (return without enqueuing it) when `webhookEventId` is missing or not a string, rather than coercing to `""`. This matches the processor's own logic for structurally malformed events.

---

## Cross-cutting patterns

**Consistent thin-lambda pattern.** All four lambda entry points follow the same structural skeleton: `buildDeps` (async, reads env + SSM + wires SDK clients), a module-level `let ...Promise` for warm-start memoization, a `getDeps()` getter, and a one-line `handler` that calls the app function. This is clean and testable. The minor naming inconsistency (F07) is the only deviation.

**App-layer AWS type leakage.** Both `ingestHandler.ts` and `readApiHandler.ts` import AWS Lambda types (`APIGatewayProxyEventV2`, `APIGatewayProxyResultV2`) directly into the `app/` layer. The hexagonal intent is violated: the app layer should not know what a Lambda event looks like. `EventProcessor`, `IngestionSweep`, and `ReminderSweep` get this right — they operate entirely on domain types. The two HTTP handlers are the exception and stand out as the most significant architectural drift.

**Sentinel-to-absent mapping as repeated boilerplate.** The `emptyToUndef`/`nullToUndef`/`listToUndef` triplet appears in at least three files with identical implementations. This is the most widespread duplication in this area. A shared `domain/sentinel.ts` would fix it in one move.

**Good error handling discipline.** Across all files, the distinction between "log and swallow" (for best-effort operations like push confirmations) vs "log and rethrow" (for retryable infra failures) vs "log and return early" (for permanent errors) is consistently applied and well-commented. This is the strongest aspect of the error handling.

**Missing `debug` level in the `Logger` port.** `PowertoolsLoggerAdapter` exposes only `info`, `warn`, and `error`. Powertools supports `debug`, which would be useful for the sweep's per-image and per-segment tracing that currently uses `info`. Without `debug`, every verbose trace line appears in production CloudWatch Logs with the same severity as genuinely informational events — making filtering noisier.
