# Catalog Assistant P1 (Slices 1–5 + Ingestion + Reminders) — Design Review

## Epoch summary

This epoch built the full core catalog product in one large push: the DynamoDB data layer
(properties, conversation trackers, membership edges, property events), the debounced ingestion
sweep (claim → batch → Claude extraction → upsert → push confirmation), the interactive command and
postback handlers (typed commands, card buttons, quick-reply chips, datetime-picker follow-ups), the
ambiguous-merge confirmation flow, and the reminder calendar sweep. The delta spans ~5 200 lines
across 63 files with substantial test coverage added alongside each piece.

---

## Design concerns introduced

### [D01] App layer imports core/handlers (presentation coupling in both sweeps)

**Severity:** medium
**File(s):** `packages/bot/src/app/ingestionSweep.ts:12`, `packages/bot/src/app/reminderSweep.ts:2`
**What was introduced:** `IngestionSweep` imports `mergePromptQuickReplies` from
`core/handlers/views.ts`; `ReminderSweep` imports `propertyTitle` and `reminderMessage` from the
same file. Both are app-layer orchestrators pulling from the presentation/handler layer.
**Why it's a problem:** In hexagonal architecture the dependency arrow inside the core should point
inward: app/ → core/ports and core/domain only, with core/handlers being a peer (not a dependency)
of app/. The sweeps now need to change whenever the view layer changes, and the view layer's
domain-specific formatting functions can't be tested without indirectly exercising app logic. It
also makes `views.ts` a shared utility that two different layers couple to, which is different from
the role it was meant to play.
**Better approach:** Move the handful of formatting primitives the sweeps need (`propertyTitle`,
`formatDueDate`, the reminder text template) into `core/domain/` (they depend only on domain
types). `buildConfirmation` in `ingestionSweep.ts` should stay local to that file since it composes
`mergePromptQuickReplies` — but `mergePromptQuickReplies` itself could live in `core/domain/` or
the sweep could build the `QuickReply[]` array inline without importing the handler layer.

---

### [D02] LINE platform limits duplicated across two layers

**Severity:** low
**File(s):** `packages/bot/src/core/handlers/views.ts:17–19`, `packages/bot/src/adapters/line/lineGateway.ts:22–24`
**What was introduced:** `MAX_CARDS = 12` and `MAX_UPCOMING_CHIPS = 13` were added to `views.ts`
with a comment noting they are "mirrored in the gateway"; `lineGateway.ts` independently declares
`MAX_BUBBLES = 12` and `MAX_QUICK_REPLIES = 13`. Both files enforce the same cap, doubling the
chance of drift.
**Why it's a problem:** When LINE changes a limit (or a future platform is added), the developer
must update two files. The comment "mirrored in the gateway" is the smell: it signals the author
knew about the duplication and accepted it rather than resolving it.
**Better approach:** Export the constants from the adapter (`lineGateway.ts`) and import them into
`views.ts`; or, better for the direction of dependency, put them in a `core/ports/lineGateway.ts`
companion (they are part of the LINE protocol contract). `views.ts` pre-truncates as a courtesy but
the gateway is the authoritative enforcer, so let it be the single source.

---

### [D03] `withUser` helper duplicated between CommandHandler and CatalogPostbackRouter

**Severity:** low
**File(s):** `packages/bot/src/core/handlers/commandHandler.ts:34–43`, `packages/bot/src/core/handlers/postbackRouter.ts:55–64`
**What was introduced:** Both classes contain an identical private `withUser` method: extract the
sender userId from the ref, return an error message if absent, otherwise call `run(userId)`. The
only difference is the parameter type (`IncomingMessage` vs `ConversationRef`).
**Why it's a problem:** Identical logic in two places means the "I couldn't tell who you are in
this chat" copy and the guard condition must be kept in sync manually. If a third handler needs this
pattern, it will be copied a third time.
**Better approach:** Extract a free function `requireSenderUserId(ref: ConversationRef, run: ...)`
in `commands.ts` or a new `core/handlers/userContext.ts` and import it from both callers. The
difference in parameter type dissolves because both `IncomingMessage` and a postback event carry a
`ref: ConversationRef`.

---

### [D04] Two `CatalogAssistant` instances created in `registry.ts` for the same request lifecycle

**Severity:** low
**File(s):** `packages/bot/src/core/handlers/registry.ts:34–43`
**What was introduced:** `createDefaultMessageHandler` and `createPostbackRouter` each `new
CatalogAssistant(deps.catalog, deps.clock)`. Both are called from `lambda/processor.ts` with the
same deps, so every warm-container invocation constructs two assistants backed by the same
repository and clock.
**Why it's a problem:** The double construction is wasteful and, more importantly, makes it easy to
accidentally pass different deps to the two assistants (e.g. a different clock). The current
`CatalogAssistant` is stateless so there is no functional bug, but if state is added (e.g. a
per-request cache), the divergence would matter.
**Better approach:** Accept `CatalogAssistant` (not just `HandlerDeps`) in both factory functions,
or have a single factory that constructs one assistant and wires both routers against it. The lambda
entry point creates one instance and passes it to both.

---

### [D05] Media MIME-type sets duplicated in three places

**Severity:** low
**File(s):** `packages/bot/src/app/eventProcessor.ts:50–56`, `packages/bot/src/app/ingestionSweep.ts:130–136`, `packages/bot/src/adapters/anthropic/claudeExtractor.ts:48`
**What was introduced:** Three separate `MEDIA_CONTENT_TYPES` / `IMAGE_MEDIA_TYPES` sets covering
overlapping MIME types were added independently. The processor set is over `MessageContentType`
enum values (`"image"`, `"video"`, …); the sweep set is over MIME strings; the extractor set is
over image-only MIME strings. The sweep's `MEDIA_CONTENT_TYPES` guards which attachments are worth
reading from S3, while the extractor's `IMAGE_MEDIA_TYPES` guards which are image-type (vs PDF)
for the API call shape — a subtle but un-obvious distinction.
**Why it's a problem:** Adding a new supported media type (e.g. `image/webp` for S3 passthrough)
requires updating multiple files. The distinction between "worth reading" and "API content block
type" is implicit and not documented at the point of declaration.
**Better approach:** Centralise in `core/ports/extraction.ts` (or `core/domain/message.ts`) as
named constants with explicit doc comments. The extractor imports the shared set and narrows it to
image-only; the sweep imports the "capturable" set. The processor's set (`MessageContentType`
values) remains separate since it operates on a different type space, but a comment linking it to
the MIME mapping would help.

---

### [D06] `keepSeparate` discards the `id` parameter carried by the postback

**Severity:** low
**File(s):** `packages/bot/src/core/handlers/postbackRouter.ts:46–47`, `packages/bot/src/core/handlers/catalogAssistant.ts:317–319`
**What was introduced:** The `ACTIONS.keep` postback encodes `{ id: newPropertyId }` so the
property is identifiable, but `CatalogPostbackRouter.route` ignores the `id` param and calls
`this.assistant.keepSeparate()` which takes no arguments and touches no data.
**Why it's a problem:** The postback carries enough information to clear a hypothetical
"needs-review" flag on the property (D07), but that information is dropped. A future developer
adding a persistence step to "keep-separate" would need to trace back to the encoding in `views.ts`
to learn the param name — the param and the handler are not obviously connected.
**Better approach:** Pass `params.get("id")` through to `keepSeparate(propertyId: string)` now,
even if the body is still a no-op. When the property domain gains a "confirmed" state the handler
already has the id in hand.

---

### [D07] `ambiguous` flag has no persistent representation; re-confirmation is impossible

**Severity:** medium
**File(s):** `packages/bot/src/core/domain/catalog.ts` (Property type), `packages/bot/src/app/ingestionSweep.ts:220–264`
**What was introduced:** The sweep sets `ambiguous: true` on an `AppliedProperty` and pushes a
confirmation message with merge/keep chips. Once the message is sent, there is no record on the
`Property` item that it is awaiting human confirmation. The `Property` domain type has no
`needsReview` or `confirmedAt` field.
**Why it's a problem:** If the user ignores the confirmation message (closes the chat, or the
device loses the push), the property stays in the catalog in an unresolved state with no way to
surface it again. There is also no guard against a second extraction run creating a duplicate if the
same conversation is re-ingested before the user taps a chip. The confirmation quick-reply chips use
the newly-created property's `id` which is still in the DB, so a late "merge" tap can still execute
— but a late "keep" tap is now indistinguishable from never having confirmed.
**Better approach:** Add an optional `needsReviewSince?: number` field to `Property` (one nullable,
inside budget). The sweep stamps it on ambiguous creates; `mergeNewInto` and `keepSeparate` clear
it. The "upcoming" or help flow can surface unreviewed listings. This also gives `keepSeparate` a
meaningful write operation (D06).

---

### [D08] LINE location messages' coordinates are stored but not harvested by the sweep

**Severity:** medium
**File(s):** `packages/bot/src/app/ingestionSweep.ts` (extractAndApply), `packages/bot/src/core/domain/message.ts:GeoLocation`
**What was introduced:** The `EventProcessor` now captures `location` on `StoredMessage` (latitude,
longitude, title, address) from LINE location-share messages. However, `IngestionSweep.extractAndApply`
builds its geo hints exclusively via `parseGeoLinks(text)`, which only finds Google Maps URLs in
the concatenated text. `StoredMessage.location` is never read in the sweep.
**Why it's a problem:** A user who shares a property's location via LINE's native location button
produces a `StoredMessage` with a precise lat/long, but the sweep feeds that information to Claude
as neither a geo hint nor as text (location messages have no `text` field). The coordinate is
silently dropped. This is the most natural way for a non-technical user to share a location in LINE.
**Better approach:** In `extractAndApply`, after collecting text-based geo hints, scan the batch for
messages where `m.location !== undefined` and append `{ lat: m.location.latitude, long: m.location.longitude }`
to the `geoHints` array (and optionally include the title/address in the text payload).

---

### [D09] `S3RawArchive` implements two unrelated ports (`RawArchive` + `MediaReader`)

**Severity:** low
**File(s):** `packages/bot/src/adapters/s3/rawArchive.ts:30`
**What was introduced:** `S3RawArchive` was extended with `putMedia` / `getMedia` and made to
implement both `RawArchive` (webhook event archive) and `MediaReader` (media retrieval for the
sweep). The class comment was updated to acknowledge the dual role.
**Why it's a problem:** The two concerns have different clients (processor writes via `RawArchive`;
sweep reads via `MediaReader`) and could evolve independently (e.g. media could move to a separate
bucket or CDN while the event archive stays in S3). Bundling them means any split requires touching
callers. In tests, a fake that only needs `MediaReader` must also satisfy `RawArchive`.
**Better approach:** Either keep them as separate exported classes in the same file (sharing the S3
client and bucket as a module-private constructor parameter), or split into `S3RawArchive` and
`S3MediaStore`. The `sweep.ts` lambda currently receives the same `S3RawArchive` instance for both
roles; passing a dedicated `S3MediaReader` would make the wiring explicit.

---

### [D10] `buildConfirmation` is exported from an app-layer file and tested externally

**Severity:** low
**File(s):** `packages/bot/src/app/ingestionSweep.ts` (exported `buildConfirmation`)
**What was introduced:** `buildConfirmation` is a pure message-building function (no IO, no state)
that was placed in `ingestionSweep.ts` and exported so it can be unit-tested. Its tests live in the
ingestion-sweep test file.
**Why it's a problem:** The function is only exported for testability; it has no consumer outside
the file except the test suite. Exporting a function from an app-layer file purely to test it is a
signal that it belongs somewhere testable in its own right. It also directly imports `views.ts`
(see D01), so fixing D01 would naturally prompt moving this function.
**Better approach:** Move `buildConfirmation` to `core/handlers/views.ts` (or to a new
`core/handlers/ingestionMessages.ts`) alongside the other outbound-message builders. It becomes
naturally testable without an `export` hack, and the import from `ingestionSweep.ts` becomes a
regular import of a views function — which is what it already effectively is.

---

## What was done well

1. **Atomic DynamoDB operations throughout.** The claim/release protocol for conversation ingestion
   (conditional `claimedAt`), the at-most-once reminder mark (`markEventNotified` with
   `attribute_not_exists(notifiedAt)`), and the sparse GSI design (keys written on activation,
   removed on completion) are all correct and concurrency-safe without a separate lock table. The
   debounce-with-cap implementation in `touchConversation` (two-path write with a conditional check
   on `ingestDeadline`) handles the quiet-timer vs starvation trade-off cleanly.

2. **Extraction port is well-isolated and fully unit-testable.** The `PropertyExtractor` port
   (in `core/ports/extraction.ts`) and the fake-extractor pattern in the sweep tests mean the entire
   ingestion pipeline — batching, candidate loading, upsert logic, merge confirmation, media
   collection — is exercised without a real Anthropic API call. The `buildExtractionContent`
   function in `claudeExtractor.ts` is separately exported and testable. This is the right design
   for an AI-dependent system.

3. **The postback vocabulary is encoded once.** `commands.ts` is the single file that owns action
   names, the encode/decode pair, and the typed `TextCommand` union. Card buttons in `views.ts`,
   quick-reply chips, and the rich menu all use `encodePostback(ACTIONS.xxx, …)`, and the router
   decodes with the same `ACTIONS` constants. A button and its handler cannot silently drift apart.

---

## Patterns

Two recurring shortcuts are visible across this epoch's diff:

- **"Mirror in the gateway"** comments instead of a single source of truth. The LINE limit
  constants appear at least twice with a comment noting the duplication rather than resolving it
  (D02). This pattern tends to compound: once it exists, new contributors follow it.

- **App layer reaching up into the handler layer for convenience.** Both sweeps import from
  `core/handlers/views.ts` because that's where the relevant function already lives, rather than
  moving the function to a layer both can share (D01, D10). The path of least resistance under time
  pressure was "import the function that already does this" rather than "find the right home for it."
