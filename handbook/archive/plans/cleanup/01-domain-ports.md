# Core Domain + Port Interfaces — Code Quality Findings

## Summary

The domain and port layer is generally well-structured and shows clear hexagonal intent: adapters are kept out of core, the domain is provider-agnostic, and most port interfaces are appropriately sized. The most significant systemic issue is a **coordinate naming split** (`lat`/`long` vs `latitude`/`longitude`) that lives within the same module (`domain/message.ts`) and propagates out. Secondary concerns are two near-duplicate geo types across the boundary, a domain type (`ConversationTracker`) that carries infra-scheduling concerns into the catalog module, and `ConversationTracker.status` modelled as a raw string union rather than a named type. One thing done well: the sentinel-over-nullable discipline in `ExtractedProperty` is enforced consistently and correctly documented.

---

## Findings

### [F01] Coordinate naming is split: `lat`/`long` vs `latitude`/`longitude` in the same domain module
**Severity:** medium
**File:** `packages/bot/src/core/domain/message.ts:17-18`
**Issue:** `GeoLocation` (used in `IncomingMessage` and `StoredMessage`) uses `latitude`/`longitude`, while every other coordinate-bearing type in the codebase — `Property` (catalog.ts:62-63), `ParsedGeo` (geo.ts:10-11), `ExtractionGeoHint` (extraction.ts:43-44), `ExtractionCandidate` (extraction.ts:53-54), `ExtractedProperty` (extraction.ts:91-92) — uses `lat`/`long`. This means location data read from a LINE location message must be accessed via `.latitude`/`.longitude`, while catalog coordinate data uses `.lat`/`.long`. The two properties are never cross-assigned (the adapter bridges them), but the inconsistency is a latent trap when any new code touches both paths.
**Suggestion:** Pick one convention and apply it globally. `lat`/`long` already wins by 5:1 in the codebase. Rename `GeoLocation.latitude` → `lat` and `GeoLocation.longitude` → `long` in `message.ts`, update the two assignment sites in `webhookParser.ts:40-41`, and the inconsistency is closed.

---

### [F02] `ParsedGeo` and `ExtractionGeoHint` are structurally identical modulo a `source` field — one is unused
**Severity:** medium
**File:** `packages/bot/src/core/domain/geo.ts:9-14` and `packages/bot/src/core/ports/extraction.ts:42-45`
**Issue:** `ParsedGeo` (`{ lat, long, source }`) and `ExtractionGeoHint` (`{ lat, long }`) represent the same concept — a coordinate pair mined from a Google Maps link. Every call site that bridges the two strips `source` and re-maps `lat`/`long` verbatim (e.g. `ingestionSweep.ts:439` and `editReplyHandler.ts:74`: `.map((g) => ({ lat: g.lat, long: g.long }))`). The `source` field on `ParsedGeo` is documented as "logging / audit" but is not logged anywhere in the codebase (confirmed by grep). This forces a gratuitous transform on every caller.
**Suggestion:** If `source` is genuinely useful for debugging, keep `ParsedGeo` and make `ExtractionGeoHint` an alias: `export type ExtractionGeoHint = Omit<ParsedGeo, "source">` — or just accept `ParsedGeo` directly on `ExtractionRequest.geoHints` so callers don't map. If `source` is not used, remove it from `ParsedGeo` and collapse the two types into one shared `GeoCoord` that lives in `domain/geo.ts`.

---

### [F03] `ConversationTracker` in `catalog.ts` is an ingestion-infrastructure type, not a catalog domain type
**Severity:** medium
**File:** `packages/bot/src/core/domain/catalog.ts:131-150`
**Issue:** `ConversationTracker` models the debounce/sweep state machine — `claimedAt`, `ingestAttempts`, `pendingSince`, `status: "IDLE"|"INGESTING"|"FAILED"` — which is purely an ingestion-infrastructure concern. It has no role in the real-estate domain (listings, events, contacts). Colocating it in `catalog.ts` with `Property`, `PropertyEvent`, and `Chanote` makes the module responsible for two completely separate concerns. A developer looking for "what is a property?" must scan past this type, and a developer asking "how does ingestion state work?" is sent to the catalog domain.
**Suggestion:** Move `ConversationTracker` into its own file, `core/domain/ingestion.ts`, or alongside the ingestion port in `core/ports/catalog.ts` as a local type (since it is only returned by `CatalogRepository` methods and consumed by `ingestionSweep`). This keeps `catalog.ts` focused on the property domain.

---

### [F04] `ConversationTracker.status` is a raw string union literal — should be a named type
**Severity:** low
**File:** `packages/bot/src/core/domain/catalog.ts:139`
**Issue:** `readonly status: "IDLE" | "INGESTING" | "FAILED"` is re-typed inline. The adapater in `catalogRepository.ts:373` must also duplicate the same three literals in a ternary to decode it from DynamoDB. If a fourth state is added, both sites must be updated manually — and the compiler won't tell you if one was missed.
**Suggestion:** `export type IngestionStatus = "IDLE" | "INGESTING" | "FAILED"` — one definition, used in `ConversationTracker` and in the adapter's decode function. This also makes exhaustiveness checking possible.

---

### [F05] `ConversationTracker.ingestAttempts` is `optional` but treated as always-present when non-zero
**Severity:** low
**File:** `packages/bot/src/core/domain/catalog.ts:149`
**Issue:** `readonly ingestAttempts?: number` is optional in the domain type. In practice, the adapter sets it to 0 on reset (`catalogRepository.ts:430`) and increments via an `ADD` expression, so it is always a number in DynamoDB. The sweep checks whether the count exceeds a cap, but the `undefined` case is never explicitly handled — the comparison `undefined > cap` silently returns false, making the field effectively required at runtime with a type that says otherwise.
**Suggestion:** Make it `readonly ingestAttempts: number` (required), defaulting to `0` in the adapter's `toTracker` deserializer (`catalogRepository.ts:381`) with `typeof item.ingestAttempts === "number" ? item.ingestAttempts : 0`. This makes the domain model honest about the field being always present.

---

### [F06] `ExtractionResult.memoryUpdate` typed as `string | null | undefined` — two absence values for one concept
**Severity:** low
**File:** `packages/bot/src/core/ports/extraction.ts:119` and `151`
**Issue:** `readonly memoryUpdate?: string | null` is both optional (`?`) and nullable (`| null`). This gives three possible "nothing to update" values: `undefined` (field absent), `null` (field present but null), and `""` (empty string — which the adapter uses per the Zod schema on `claudeExtractor.ts:88`). The `ingestionSweep.ts:667` call site has `string | null | undefined` in its own signature. Three ways to say "no update" with no documented distinction is confusing.
**Suggestion:** Pick one sentinel. The simplest: make it `readonly memoryUpdate?: string` (optional but never null), and use `undefined`/omission to mean "no update" while `""` is never produced (already the extractor's contract). Alternatively `string | null` (not optional), and treat `null` as "no update". Either way, remove the redundancy.

---

### [F07] `PropertyEvent` name collides with `InboundEvent` in the same `domain/` folder
**Severity:** low
**File:** `packages/bot/src/core/domain/catalog.ts:116` and `packages/bot/src/core/domain/events.ts:8`
**Issue:** `PropertyEvent` (a calendar follow-up) and `InboundEvent` (a parsed LINE webhook event) both live in `core/domain/`, both use the suffix `Event`, and the shorter unqualified name `Event` matches both if you squint. While import disambiguation prevents actual bugs today, the naming causes cognitive friction — a reader seeing `event` in handler code must confirm which domain is in play.
**Suggestion:** Rename `PropertyEvent` to `FollowUp` or `CalendarEvent` to make its specific meaning clear, and update `CatalogRepository.addEvent` → `addFollowUp`, `listPropertyEvents` → `listFollowUps`, `findDueEvents` → `findDueFollowUps`. The distinction becomes self-documenting.

---

### [F08] `Property` has too many `optional` fields — domain type is effectively a partial bag
**Severity:** medium
**File:** `packages/bot/src/core/domain/catalog.ts:55-103`
**Issue:** Of 28 fields on `Property`, only `propertyId` is required. Every other field, including `createdAt`, `updatedAt`, and `lastActivityAt`, is optional. This means the type system provides almost no guarantee about what a returned `Property` contains. Callers defensively check for `undefined` everywhere (e.g. `views.ts:57`, `views.ts:200`, `views.ts:242-243`). The timestamps in particular (`createdAt?`, `updatedAt?`) should be set by the repository on every write and are always present after creation — but the type does not reflect this.
**Suggestion:** At minimum, promote `createdAt`, `updatedAt`, and `lastActivityAt` to required on the `Property` read type, with the repository guaranteeing they are set. `PropertyUpsert` (the write type) can keep them optional since the caller doesn't supply them. This would already cut the "maybe undefined" defensive checks in view code considerably.

---

### [F09] `Property.status` and related classification fields are untyped `string` where narrow unions exist
**Severity:** low
**File:** `packages/bot/src/core/domain/catalog.ts:68-86`
**Issue:** `status`, `propertyType`, `listingType`, and `furnishing` are all typed as `string`. The doc comments enumerate the valid values (e.g. `"lead" | "researching" | ... | "dropped"` for status, `"sale" | "rent"` for listingType, `"unfurnished" | "partly furnished" | "fully furnished"` for furnishing). These are free-text from the extractor and subject to model variance, but the domain type accepts any string, so no code path enforces or validates the documented vocabulary.
**Suggestion:** For fields that genuinely have a closed vocabulary enforced by the system (not just the model), introduce narrow union types (`export type ListingType = "sale" | "rent"`) and use them. For fields that are truly best-effort open strings (e.g. `propertyType` which the extractor free-forms), document that explicitly. Mixing both in the same interface without distinction conflates two different contracts.

---

### [F10] `GeoLocation` (LINE location message) coordinates are never used for property extraction
**Severity:** low
**File:** `packages/bot/src/core/domain/message.ts:16-21`
**Issue:** `GeoLocation.latitude`/`longitude` from LINE native location messages is stored on `IncomingMessage` and `StoredMessage`, but the ingestion sweep only mines coordinates from Google Maps URLs in text messages (via `parseGeoLinks`). There is no code path that reads `StoredMessage.location.latitude` and feeds it into `ExtractionRequest.geoHints`. The field is dead weight in extraction — the adapter stores it faithfully but nothing downstream reads it.
**Suggestion:** Either wire it up (the sweep should include native location messages as a geo hint — simpler and more reliable than URL parsing), or add a comment to `ingestionSweep` explaining why it is intentionally skipped. The current silence leaves the reader wondering if this is an oversight or a deliberate choice.

---

### [F11] `CatalogRepository` is a single large interface with ~25 methods across 5 unrelated concerns
**Severity:** medium
**File:** `packages/bot/src/core/ports/catalog.ts:13-149`
**Issue:** `CatalogRepository` covers five distinct responsibility groups in one interface: (1) conversation ingestion state machine (`touchConversation`, `claimConversation`, `releaseConversation`, `failConversation`, `findPendingConversations`, `getConversation`), (2) edit context (`armEdit`, `getEditContext`, `clearEdit`), (3) membership edges (`recordMembership`, `removeMembership`, `listUserConversations`), (4) property CRUD + edges (`upsertProperty`, `getProperty`, `deleteProperty`, `linkConversationProperty`, `unlinkConversationProperty`, `listConversationProperties`, `listPropertiesForUser`), and (5) follow-up events (`addEvent`, `listPropertyEvents`, `findDueEvents`, `markEventNotified`). While there is only one DynamoDB adapter implementing this, every app-layer consumer receives the full 25-method interface even when it only needs one group. `reminderSweep` only needs groups 4 and 5; `readApiHandler` only needs group 3 and 4.
**Suggestion:** Split into focused interfaces: `ConversationIngestionStore`, `PropertyStore`, `MembershipStore`, `FollowUpStore`. App-layer consumers declare exactly which store they need. The DynamoDB adapter can implement all of them (one class, multiple interfaces), so there is zero implementation churn — only the injection points become narrower.

---

### [F12] `findPendingConversations` and `findDueEvents` accept `nowIso: string` while all other time parameters are epoch ms
**Severity:** low
**File:** `packages/bot/src/core/ports/catalog.ts:26` and `133`
**Issue:** The entire port interface uses epoch milliseconds for time values (`touchConversation(key, inboundAtMs)`, `claimConversation(key, nowMs, staleMs)`, `markEventNotified(event, nowMs)`), but the two "find due/pending" methods take an ISO 8601 string. This forces callers (`ingestionSweep.ts:312`, `reminderSweep.ts:48`) to convert `nowMs` → `new Date(nowMs).toISOString()` before calling, leaking the DynamoDB GSI sort-key encoding detail into the app layer.
**Suggestion:** Change both signatures to accept `nowMs: number`, move the `toISOString()` conversion into the DynamoDB adapter. The port then speaks one consistent time currency.

---

### [F13] `LineContentClient` is a single-method interface in its own file — could merge into `LineGateway`
**Severity:** low
**File:** `packages/bot/src/core/ports/lineContent.ts:1-5`
**Issue:** `LineContentClient` has exactly one method (`getContent(messageId): Promise<Buffer>`). It is always implemented by the same class as `LineGateway` (`LineMessagingContentClient` and `LineMessagingGateway` are sibling exports in `lineGateway.ts`). The split creates an extra file, an extra import in `eventProcessor.ts`, and an extra constructor argument to wire. The conceptual separation ("inbound binary" vs "outbound messages") is real but very thin at this scale.
**Suggestion:** Add `getContent(messageId: string): Promise<Buffer>` to `LineGateway` and remove `lineContent.ts`. If the separation is important for testing (the content client is injected separately), a comment suffices; a separate port file is over-engineering for a one-liner interface.

---

### [F14] `QueuePublisher.publish` accepts `readonly unknown[]` — weakest possible element type
**Severity:** low
**File:** `packages/bot/src/core/ports/runtime.ts:2-4`
**Issue:** `publish(events: readonly unknown[]): Promise<void>` is the most permissive possible signature. The only caller (`ingestHandler.ts`) passes `ParsedWebhook.events` which are typed as `readonly InboundEvent[]`. The `unknown` type provides zero documentation of what the queue actually carries and no compile-time guard against accidentally publishing the wrong payload.
**Suggestion:** Type it as `publish(events: readonly InboundEvent[]): Promise<void>` (import from `domain/events.ts`). If the queue is intentionally kept raw for forward compatibility, at least use `readonly Record<string, unknown>[]` to indicate the payload is a JSON object.

---

## Cross-cutting patterns

**Coordinate naming fragmentation.** Three interfaces in `core/` each define a lat/long pair with slightly different names and optionality: `GeoLocation` (`latitude`/`longitude`, required), `ParsedGeo` (`lat`/`long`, required, with `source`), `ExtractionGeoHint` (`lat`/`long`, required, no source), `ExtractionCandidate` (`lat`/`long`, optional), `Property` (`lat`/`long`, optional). This should be one or two shared types.

**Optional-everything domain objects.** Both `Property` and `ConversationTracker` err so far toward optional fields that the types provide almost no structural guarantee. The pattern forces defensive `?? undefined` checks throughout handler and view code. Separating the write type (all optional) from the read type (required fields guaranteed by the repository) would remove a large class of `undefined` checks.

**ISO string leaks into port signatures.** The `nowIso: string` pattern in two `CatalogRepository` methods is the only place a storage-layer encoding detail (DynamoDB GSI sort key format) surfaces in a port interface. All other time params correctly use `number`. This is an isolated, low-effort fix (F12).

**Single-method ports.** Four of the nine port files (`lineContent.ts`, `lineTokenVerifier.ts`, `mediaReader.ts`, `mediaUrlSigner.ts`) each define exactly one interface with exactly one method. This is appropriate for `lineTokenVerifier` and `mediaUrlSigner` (distinct enough concerns, genuinely separate adapters). `lineContent` merging into `lineGateway` (F13) and `mediaReader` potentially merging into `mediaUrlSigner` (both are S3 operations implemented by the same class) would reduce file count without losing clarity.
