# Core Handlers — Code Quality Findings

## Summary

The handler layer is well-structured and generally clean: thin coordinators, a clear hexagonal seam,
good test coverage with realistic fakes, and almost no LINE-specific coupling inside core. The
biggest concerns are (1) `orderedPhotos`/`heroPhotoKey` being duplicated verbatim between
`catalogAssistant.ts` and `readApiHandler.ts` with a subtle difference, (2) the registry
instantiating two independent `CatalogAssistant` objects from one `HandlerDeps`, which is surprising
and wasteful, and (3) `catalogDto.ts` leaking view-rendering helpers that belong in `views.ts`. The
`views.ts` module is notably well-done: flat, readable helper functions with a clean separation
between data-structure construction and any LINE-specific rendering.

## Findings

### [F01] `orderedPhotos` and `heroPhotoKey` duplicated between handler and app layers
**Severity:** medium
**File:** `packages/bot/src/core/handlers/catalogAssistant.ts:29–43` and
`packages/bot/src/app/readApiHandler.ts:33–48`
**Issue:** Both files contain byte-for-byte identical `heroPhotoKey` implementations and near-
identical `orderedPhotos` implementations. The only difference is that `readApiHandler.ts` uses
`PHOTO_KIND_ORDER[a.kind] ?? 9` as a default fallback whereas `catalogAssistant.ts` uses a typed
`Record<PhotoKind, number>` with no default, relying on exhaustiveness of the union — a subtle
behavioural difference that could diverge silently if a new `PhotoKind` is added. Duplication like
this has already caused the gallery ordering comment "matches the chat assistant" to be written in
`readApiHandler.ts` as an admission of the coupling.
**Suggestion:** Extract `orderedPhotos` and `heroPhotoKey` into `packages/bot/src/core/domain/catalog.ts`
or a new `packages/bot/src/core/domain/photos.ts` utility (pure functions over domain types, no IO).
Use the typed `Record<PhotoKind, number>` variant in both callers and delete the duplicates. The
comment in `readApiHandler.ts` (`// Gallery order: property photos first…`) can then simply cite the
shared function.

### [F02] `registry.ts` instantiates two separate `CatalogAssistant` objects from one `HandlerDeps`
**Severity:** medium
**File:** `packages/bot/src/core/handlers/registry.ts:48–60`
**Issue:** `createDefaultMessageHandler` constructs one `CatalogAssistant`, and `createPostbackRouter`
constructs a second one independently, even though both are called with the same `HandlerDeps` in
practice. The assistant is stateless (it holds no mutable data beyond injected collaborators), so
this is not a correctness bug, but it is surprising: a reader expects a factory to produce wired
collaborators that share state where appropriate, and calling both functions from the same call-site
produces two objects that look shared but are not. If the assistant ever gains any lightweight cached
state it would silently diverge.
**Suggestion:** Accept (or return) a pre-constructed `CatalogAssistant` from both functions, or
combine them into a single `createHandlers(deps)` that returns `{ messageHandler, postbackRouter }`
sharing one assistant instance. This also removes the only reason to expose `CatalogAssistant` as a
public class import in test files that build the postback router independently.

### [F03] `withUser` helper duplicated in `commandHandler.ts` and `postbackRouter.ts`
**Severity:** low
**File:** `packages/bot/src/core/handlers/commandHandler.ts:36–45` and
`packages/bot/src/core/handlers/postbackRouter.ts:61–70`
**Issue:** Both classes contain an identical `withUser` private method: extract a user id from a ref,
return an error message if absent, otherwise delegate to a callback. The only difference is parameter
type (`IncomingMessage` vs `ConversationRef`). The error text is also identical (`"I couldn't tell
who you are in this chat."`), confirmed by the test assertions in both test files.
**Suggestion:** Extract a free function (not a class method) — `withSenderUserId(ref, run)` — in a
shared location (e.g. `commands.ts`, which both already import). Both handlers reduce to a one-liner
call. The error string becomes a single constant, eliminating the risk of the two copies drifting.

### [F04] `catalogDto.ts` duplicates the search-haystack field list from `catalogAssistant.ts`
**Severity:** low
**File:** `packages/bot/src/core/handlers/catalogDto.ts:82–94` and
`packages/bot/src/core/handlers/catalogAssistant.ts:51–61`
**Issue:** `searchText()` in `catalogDto.ts` and `matchesQuery()` in `catalogAssistant.ts` iterate
the same field set (`normalizedAddress`, `projectName`, `district`, `subdistrict`, `province`,
`rawAddresses`). The DTO comment even acknowledges this: "mirrors `listingsOnRoad`". If a new
address-bearing field is added to `Property`, both must be updated together, and the comment is the
only enforcement. These two functions implement the same domain concept — "what fields make a
property searchable by location text" — from different angles (one builds a haystack string, the
other matches a needle against the same fields inline).
**Suggestion:** Extract a `searchableText(property: Property): string` pure function into the domain
layer (e.g. `catalog.ts` or a `search.ts` utility). Both callers use it: `catalogDto.ts` uses the
string directly; `catalogAssistant.ts` computes it once and calls `.includes(needle)`. This makes
the field list authoritative in one place and removes the comment that currently serves as the sole
synchronisation reminder.

### [F05] `catalogDto.ts` imports view-rendering helpers (`statusBadge`, `formatPrice`, `area`, `mapsUri`, `propertyTitle`) — a layering leak
**Severity:** low
**File:** `packages/bot/src/core/handlers/catalogDto.ts:9`
**Issue:** The DTO module's stated purpose is "pure `Property → JSON DTO` mappers … so the webview
and the chat cards never drift." But it imports five rendering helpers from `views.ts`, which is a
peer module inside the same `handlers/` layer. `views.ts` also imports from `commands.ts` (to build
postback payloads), so the dependency chain from `catalogDto.ts` reaches `commands.ts` transitively.
The DTO is conceptually a projection layer (domain → wire format); its dependency on postback-
building machinery is unintended and could pull LINE action names into a mini-app JSON payload
accidentally.
**Suggestion:** Move `propertyTitle`, `formatPrice`, `statusBadge`, `area`, and `mapsUri` out of
`views.ts` into a `packages/bot/src/core/domain/display.ts` file (or similar). These are pure
formatting functions over domain types with no LINE dependency and no postback awareness — they
belong in the domain, not the handler layer. Both `views.ts` and `catalogDto.ts` then import from
domain, and the transitive `commands.ts` dependency from the DTO layer disappears.

### [F06] `toDetailDto` spreads `compact(...)` and then adds `photos: []` separately, requiring an unsafe cast
**Severity:** low
**File:** `packages/bot/src/core/handlers/catalogDto.ts:113–149`
**Issue:** `toDetailDto` returns `{ ...compact({ ... }), photos: [] } as PropertyDetailDto`. The `as`
cast is needed because `compact` erases the concrete type (it returns `T` but the inference breaks
when the spread is split). The pattern also means the TypeScript compiler cannot verify that every
required field of `PropertyDetailDto` is present — the cast silences what should be a compile-time
guarantee. The comment `// photos always present (possibly empty)` is the only explanation.
**Suggestion:** Construct the object in full before passing to `compact`, keeping `photos` inside the
object literal but outside the compacted block, and remove the `as` cast. Alternatively, define
`photos` as a required field inside `compact`'s input type and let `compact` keep arrays with zero
elements only when flagged. At minimum, rename the internal shape so the `as` assertion targets a
named intermediate type rather than the public interface directly.

### [F07] `editReplyHandler.ts` applies sentinel-to-`undefined` conversions inline with three ad-hoc helper functions
**Severity:** low
**File:** `packages/bot/src/core/handlers/editReplyHandler.ts:23–33`
**Issue:** Three tiny private-scope functions — `nullToUndef`, `emptyToUndef`, `listToUndef` — are
defined at the module top level and used only in `handle()`. Their names are clear, but their
existence is a sign that the sentinel-stripping contract (extraction returns `""` for absent strings,
`null` for absent numbers, `[]` for absent lists) is not encoded at the extraction boundary. Every
caller that converts an extraction result to a `PropertyUpsert` must remember to apply these
conversions. Currently `editReplyHandler.ts` is the only such caller so the duplication is zero, but
the helper set would need to be duplicated (or extracted) if a second direct-edit path were added.
**Suggestion:** Define a `extractedToUpsert(edit: ExtractedProperty, propertyId: string, now: number): PropertyUpsert`
helper, ideally colocated with the `ExtractedProperty` port definition or in a small
`extractionUtils.ts`. The three sentinel helpers become internal to that function, and any future
extraction consumer gets the conversion for free without knowing the sentinel contract.

### [F08] `propertyDetail` in `views.ts` is an 80-line function with imperative row assembly
**Severity:** low
**File:** `packages/bot/src/core/handlers/views.ts:187–283`
**Issue:** `propertyDetail` assembles rows through 14 successive `pushRow` calls plus a
`pushChanoteRows` call, interleaved with conditional logic for bed/bath joining, rent vs. sale
headline selection, title-deduplication for the Project/Address rows, and action-button visibility.
The function is correct and well-commented, but it is long enough that reviewers must hold a lot of
context simultaneously. The title-deduplication logic (`property.projectName !== title`) is subtle
and would be invisible in a diff.
**Suggestion:** Extract the row-assembly phase into a `propertyDetailRows(property, title)` helper
that returns a `PropertyCardRow[]`. This gives the deduplication logic its own named scope and makes
`propertyDetail` itself a short orchestrator (compute title → get headline → get rows → get actions
→ assemble card). No behaviour changes needed; the refactor is purely structural.

### [F09] `CatalogAssistant.deleteListing` performs four sequential awaits where some could be parallel
**Severity:** low
**File:** `packages/bot/src/core/handlers/catalogAssistant.ts:227–231`
**Issue:** The four repository calls in `deleteListing` are issued sequentially:
`deletePropertyEvents` → `unlinkConversationProperty` → `deleteProperty` → `clearEdit`. All four
are independent once we've confirmed the property exists (line 224). Sequential execution serialises
four DynamoDB round-trips where at most the final `deleteProperty` needs to follow
`deletePropertyEvents` (to avoid orphan event scans on a deleted parent, if the repository has that
concern). In practice for a low-traffic bot this is immaterial, but it is inconsistent with the
`Promise.all` used elsewhere in the same file (e.g. `mergeNewInto` line 275, `upcoming` line 130).
**Suggestion:** Group the independent deletions with `Promise.all([deletePropertyEvents, unlinkConversationProperty, clearEdit])` and then `deleteProperty`. If the ordering between events and property deletion is significant for the data model, document that constraint with a comment rather than relying on sequential `await` as implicit documentation.

### [F10] `ACTIONS` constant uses string literal values that differ in casing from their key names
**Severity:** low
**File:** `packages/bot/src/core/handlers/commands.ts:9–33`
**Issue:** Three action names use all-lowercase string values that differ from their camelCase key
names: `setFollowUp: "setfollowup"`, `deleteConfirm: "deleteconfirm"`, `keep: "keep"`. The
inconsistency between key (`setFollowUp`) and value (`"setfollowup"`) means that anyone grepping for
`setFollowUp` in the postback data payloads stored in LINE's servers will find nothing. The values
are what travel over the wire and end up in logs; the keys are what code reads. This is a minor
cognitive friction point, not a bug, but the lack of a naming rule creates silent inconsistency
between `view`, `photos`, `merge`, `keep` (match their keys) and the two camelCase keys that don't.
**Suggestion:** Either normalize all values to match their keys (camelCase where the key is camelCase:
`"setFollowUp"`, `"deleteConfirm"`), or document a naming rule in the constant's JSDoc. Given that
these values are stored in LINE messages already in production, a migration would be required to
change them — adding the doc comment is the lower-risk fix.

## Cross-cutting patterns

**Null-as-sentinel vs. absent-field inconsistency across the boundary.** The extraction port uses
`null` for absent numbers and `""` for absent strings (because the Anthropic strict-output schema
requires required fields), while the domain uses `undefined`-absent optional fields. The conversion
is handled ad-hoc in `editReplyHandler.ts` with three helpers. This is the right place for it, but
the implicit contract is not encoded in the type system — the `ExtractedProperty` type and the
`PropertyUpsert` type are structurally incompatible in a way that TypeScript cannot catch, relying
on developer discipline. A thin `extracted → upsert` adapter function would make this explicit.

**Consistent "not found" pattern.** Every `CatalogAssistant` method that loads a property begins
with `const x = await catalog.getProperty(id); if (x === null) return [{ type: "text", text: "…" }]`.
This guard is repeated eight times across the class. The strings are distinct (appropriate), but the
structural pattern could be a helper such as `withProperty(id, callback)` that handles the null case
once, similar to how `withUser` abstracts the missing-sender case.

**Test fixtures replicate the full `ExtractedProperty` shape.** Both `editReplyHandler.test.ts` and
`registry.test.ts` inline the full 22-field `ExtractedProperty` literal (every sentinel value
spelled out) in each test that needs a fake extraction result. The `extracted()` helper in
`editReplyHandler.test.ts` is a good start but is not shared with `registry.test.ts`, which inlines
the full shape again. A shared `fixtures/fakeExtraction.ts` with a builder/factory would eliminate
this repetition and make adding new extraction fields less painful across tests.

**`views.ts` is the right place for its content.** The module cleanly separates data assembly (what
fields to show, in what order) from LINE presentation (left to the gateway). Every exported function
is pure and testable without mocks. The `pushRow` / `pushChanoteRows` helpers follow a consistent
pattern. This is the best-executed file in the area.
