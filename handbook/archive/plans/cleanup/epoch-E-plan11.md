# Richer Details + Edit Flow (Plan 11) — Design Review

## Epoch summary
Plan 11 replaced the plain-text property detail with a rich Flex bubble (hero photo, status badge,
price headline, full field table, Maps button, photo gallery button, Follow-up picker, and a
"reply to update" footer hint). It also introduced the edit-reply flow: when a user taps "Details"
the assistant arms a short-lived edit context on the conversation tracker; the next plain-text
message is routed through `EditReplyHandler`, which runs a scoped Claude extraction over the single
viewed property and applies any resolved changes immediately without a debounced sweep.

---

## Design concerns introduced

### D01 — "Reply to update" hint shown unconditionally even when the feature is not wired
**Severity:** medium
**File(s):** `packages/bot/src/core/handlers/views.ts:240`
**What was introduced:** `propertyDetail` always appends the note
`'💬 Reply to update — e.g. "price 4.5M" or "now sold"'` to every detail card. The
`EditReplyHandler` is only added to the message-handler chain when `HandlerDeps.extractor` is
present (i.e. the Anthropic key is wired). Without it the hint is a lie — the user types a reply
and it falls silently into the normal debounced sweep with no confirmation.
**Why it's a problem:** A UI affordance is unconditional when the capability it promises is
conditional. A deployment without the Anthropic key (e.g. a local dev run, a test stage, a
misconfigured production deploy) shows the instruction but silently ignores the reply. The view
layer has no knowledge of whether the feature is live, and `propertyDetail` takes no flag to
suppress it.
**Better approach:** Pass an `editEnabled: boolean` option (or a higher-level `features` bag) into
`propertyDetail` alongside the existing `opts` and omit the note when the feature is off.
`CatalogAssistant.viewProperty` can derive this from whether `this.signer`/extractor is wired, or
the assistant can receive the flag at construction time. This keeps the view function honest without
coupling it to the extractor dependency directly.

---

### D02 — Prompt instruction string injected into the user-text field of `ExtractionRequest`
**Severity:** medium
**File(s):** `packages/bot/src/core/handlers/editReplyHandler.ts:66–72`
**What was introduced:** `EditReplyHandler.handle` prepends a free-text system instruction to the
user's message before passing it as `text` to the extractor:
```
const editText =
  "[The user is editing the property they just viewed — apply the change to THAT listing. " +
  'Its "name"/"called" means the project name; "address" means the street address.]\n' +
  text;
```
The `ExtractionRequest.text` field is documented as "Concatenated text of the batched messages."
The extraction port is a domain port — `PropertyExtractor` is in `core/ports/extraction.ts`. The
port is meant to be provider-agnostic and testable with a fake. Smuggling a behavioural instruction
into the user-text field leaks the Anthropic-specific "bracket instruction" prompt idiom through the
domain seam.
**Why it's a problem:** The `ExtractionRequest` port has no `systemContext` or `editHint` field; the
caller works around the absence by abusing the `text` field. This is invisible to the fake extractor
in tests (the fake ignores `text`, so the injection is never exercised), and tightly couples the
edit behaviour to a prompt pattern that only works for a specific model and prompt structure. A
different extractor implementation (e.g. a GPT or Gemini adapter) might interpret the bracketed
prefix completely differently.
**Better approach:** Add an explicit `editHint?: string` (or `systemInstruction?: string`) field to
`ExtractionRequest` and let each extractor implementation decide how to relay it (as a system
turn, a prefill, a preceding assistant message, or ignore it). The field should also be tested in
the fake so regressions are caught.

---

### D03 — Edit context has no domain type; stored as raw DynamoDB attribute strings
**Severity:** medium
**File(s):** `packages/bot/src/core/ports/catalog.ts:53–62`,
`packages/bot/src/adapters/dynamodb/catalogRepository.ts:586–629`
**What was introduced:** Three new `CatalogRepository` port methods (`armEdit`, `getEditContext`,
`clearEdit`) return an inline anonymous shape `{ propertyId: string; armedAt: number }` rather than
a named domain type. In the DynamoDB adapter the state is stored as bare attributes
`editPropertyId` and `editArmedAt` on the `conversationTracker` item. The `toTracker()` mapper —
which converts a DynamoDB item into the `ConversationTracker` domain type — silently ignores these
two fields. `ConversationTracker` therefore does not model the edit context.
**Why it's a problem:** The edit context is conceptually part of the conversation's state, but it
exists only as a side-channel understood by `catalogRepository` and `editReplyHandler`. Any code
reading `getConversation()` (the sweep, the event processor, any future handler) cannot see whether
an edit is armed. The anonymous return type `{ propertyId: string; armedAt: number }` cannot be
imported, documented, or tested as a named concept. If the edit context gains more fields (e.g. a
retry counter, or which user armed it) the port signature changes without a named type to version.
**Better approach:** Define a named `EditContext` interface in `core/domain/catalog.ts` or
`core/domain/conversation.ts`. Add it as an optional field on `ConversationTracker` so the domain
type models the complete tracker state. Update `toTracker()` to populate it when the attributes are
present. The port methods can then return `EditContext | null` using the named type.

---

### D04 — `presignPhotos` duplicates the error-swallowing presign pattern from `heroUrls`
**Severity:** low
**File(s):** `packages/bot/src/core/handlers/catalogAssistant.ts:202–223` (new `presignPhotos`),
`packages/bot/src/core/handlers/catalogAssistant.ts:84–123` (existing `heroUrls`)
**What was introduced:** `presignPhotos` is a new private method that presigns all photos for a
single property. It has the same structure as the existing `heroUrls`: guard on `signer`, map over
keys, `try/catch` per key returning `null` on error, filter nulls. The comment even says "Mirrors
`heroUrls` for a single listing." The comment is honest about the duplication but does nothing about
it.
**Why it's a problem:** Two nearly identical loops with slightly different inputs/outputs. When the
presign error-handling policy changes (e.g. logging failures, adding a retry, changing the TTL),
both must change together. The self-describing comment "mirrors heroUrls" is a code smell flagging
deferred refactor.
**Better approach:** Extract a single `presignAll(keys: readonly string[]): Promise<string[]>`
private helper that encapsulates the try/catch per-key loop. `heroUrls` can call it with the
single first-photo key (or refactor to use it) and `presignPhotos` calls it with all keys. Both
become one-liners delegating to the shared helper.

---

### D05 — Test fixtures pass `null` for fields typed as `readonly string[]` in `ExtractedProperty`
**Severity:** low
**File(s):** `packages/bot/test/unit/registry.test.ts:62–76`
**What was introduced:** The inline fake extractor in the registry test constructs an
`ExtractedProperty` with `ambiguousWith: null` and `tags: null`. The `ExtractedProperty` interface
defines both as `readonly string[]` (not nullable). TypeScript apparently accepts this in the test
because the object literal is assigned to `unknown` via the `ExtractionResult` return type, but the
real implementation would fail if it called `.length` or tried to spread a `null` array.
**Why it's a problem:** The test fixture misrepresents the actual contract the extractor port
promises. If a real Claude response ever returned a null for these fields and the adapter failed to
normalise it, the `EditReplyHandler`'s `listToUndef(edit.tags)` would throw at runtime. The
`editReplyHandler.test.ts` `extracted()` helper has the same pattern (it also passes `null` for
`ambiguousWith` and `tags`) and is the fixture used across all handler-level tests.
**Better approach:** Fix the fixtures to use `[]` for list fields that must be non-null. The
`extracted()` helper in `editReplyHandler.test.ts` is the shared template — correcting it and
ensuring TypeScript strict mode flags the mismatch would prevent future drift. If the adapter
genuinely might return null for these fields, the `ExtractedProperty` type should say so and the
conversion layer must handle it.

---

### D06 — `mapsUri` in Plan 11 diff did not handle the original `mapUrl` field; that was a silent regression
**Severity:** low
**File(s):** `packages/bot/src/core/handlers/views.ts` (as changed in this epoch)
**What was introduced:** The initial Plan 11 implementation of `mapsUri` checked only
`property.lat`/`property.long` and the fallback address strings. It did not check
`property.mapUrl` (the original Google Maps URL a user may have shared, which is the most accurate
location link). The current file does check `mapUrl` first, indicating the omission was caught and
fixed in a later commit within the same branch — but it was not fixed in a single clean commit.
(The diff at `e80d2d0..d6d7e0e` for `views.ts` shows the original `mapsUri` without `mapUrl`
handling, while `git show d6d7e0e` shows it present.)
**Why it's a problem:** A feature built on Plan 11's established `mapUrl` field omitted it on first
implementation, meaning any property with a stored `mapUrl` but no lat/long would silently fall
back to an address-search link rather than the precise original link the user shared. The test
added for `mapsUri` in this epoch did not cover the `mapUrl` case, so the gap was undetected.
**Better approach:** Test the `mapUrl` priority case explicitly in `views.test.ts` alongside the
lat/long and address cases. A test named "prefers the stored mapUrl over reconstructed coordinates"
would have caught the omission immediately.

---

### D07 — `viewProperty` arms the edit context regardless of whether `EditReplyHandler` is in the chain
**Severity:** low
**File(s):** `packages/bot/src/core/handlers/catalogAssistant.ts:199–203`
**What was introduced:** `CatalogAssistant.viewProperty` calls `this.catalog.armEdit(...)` whenever
a `conversationKey` is supplied. `CatalogAssistant` has no knowledge of whether `EditReplyHandler`
is registered — it only knows the extractor is optional in `HandlerDeps`. The registry wires the
assistant before the handler, so the assistant cannot check whether its sibling handler will consume
the armed context.
**Why it's a problem:** When the extractor is absent (no Anthropic key), the assistant still writes
`editPropertyId`/`editArmedAt` to DynamoDB on every property view. These writes are never read or
cleared (no `EditReplyHandler` in the chain, no TTL on the DynamoDB attribute). The items
accumulate harmlessly but represent unnecessary writes and stale state that could confuse a future
reader inspecting DynamoDB directly.
**Better approach:** Gate the `armEdit` call on whether the feature is active. One option: pass an
`editEnabled` boolean down to `CatalogAssistant` at construction time (the registry knows whether
`deps.extractor` is present and can pass the flag). Another option: let the handler arm the context
itself immediately before running the extraction, rather than having the assistant arm it during the
view — this would also remove the cross-handler coupling and the `conversationKey?` optional
parameter on `viewProperty`.

---

## What was done well

1. **Test coverage for the new flow is broad and scenario-focused.** `editReplyHandler.test.ts`
   tests the armed, expired, fall-through, missing-property, and empty-reply cases separately.
   `catalogAssistant.test.ts` was updated to cover presigning, the hero/count/gallery path, and the
   arm/no-arm distinction. The integration test for `armEdit`/`clearEdit` explicitly verifies the
   "must not enqueue for ingestion" invariant — a subtle correctness requirement that is easy to
   miss.

2. **`views.ts` functions are kept purely functional (no I/O, no side effects).** `mapsUri`,
   `propertyDetail`, `editConfirmationMessage`, and `imageCarouselMessage` all take plain data and
   return plain data. Presigning — the only async, side-effectful step — is resolved by the
   `CatalogAssistant` before calling into views, so view functions remain unit-testable in complete
   isolation from AWS.

3. **The `imageCarousel` message type is a true domain type, not a LINE-SDK leak.** Adding
   `imageCarousel` to `OutboundMessage` and implementing it in the LINE gateway as a Flex carousel
   of image bubbles keeps the LINE-specific rendering (Flex, aspect ratio, tap action) behind the
   adapter boundary. The domain message only holds `imageUrls: readonly string[]`, which is
   provider-neutral.

---

## Patterns

The recurring shortcut in this epoch is **feature-flag by omission rather than by signal**: the
`extractor` dependency being absent disables `EditReplyHandler` in the chain, but nothing tells the
view layer (`propertyDetail`) or the assistant (`armEdit`) that the feature is off. Both continue
to act as if the feature is on — showing the hint, writing DynamoDB state — even when no handler
will ever consume the result. This "wire it and hope" pattern works as long as the absent-extractor
path is the minority case, but becomes a visible UX bug (false hint) on any deployment that lacks
an Anthropic key.
