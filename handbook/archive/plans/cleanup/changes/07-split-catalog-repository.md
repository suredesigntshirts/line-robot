# 07 — Split the 25-method CatalogRepository god-port into focused stores

> **Reconcile-pass note (queue 00):** the sole `needs-decision` item (port-file layout, Open
> question 1) is **RESOLVED to Option A** — keep one `core/ports/catalog.ts` — because unit 02 keeps
> ports as flat files (no new directory, no barrel). This unit is now **ready**, gated only by its
> hard dependency on **unit 02** (which must land first so its `eventProcessor.ts` / `readApiHandler.ts`
> edits are already in place). It also shares the *type-import line only* of `ingestionSweep.ts` with
> units 01 + 05 and `readApiHandler.ts` with units 02/03/04/09 — land this unit AFTER those textual
> edits so its one-line import narrowing rebases onto their final import blocks.

## Goal & rationale
`CatalogRepository` (`packages/bot/src/core/ports/catalog.ts:13-149`) is one interface covering
**five+ unrelated concerns** — conversation-ingestion state machine, edit context, membership edges,
property CRUD+edges, follow-up events, and per-conversation memory (24 methods; the scout's "25"
counts the duplicated `listPropertiesForUser` boundary-crosser). Every app-layer consumer is injected
the full surface even though `reminderSweep` touches 3 methods and `eventProcessor` touches 3. This is
finding **F11 in `01-domain-ports.md`** and **P2 #12 / Theme C in `00-master-plan.md`** (line 59).

This unit splits the **port** into focused interfaces (`ConversationIngestionStore`,
`EditContextStore`, `MembershipStore`, `PropertyStore`, `FollowUpStore`, `MemoryStore`), keeps
`CatalogRepository` as an **intersection alias** of all six, and **narrows each injection site** to
exactly the stores it uses. The single `DynamoCatalogRepository` adapter and the single `FakeCatalog`
test double continue to implement the full intersection — **zero implementation churn, zero blast to
the 8 consumer test files**, only the typed injection points get narrower. This is the exact path
F11 recommends ("one class, multiple interfaces … only the injection points become narrower").

This unit touches **no extraction schema** (`claudeExtractor.ts` / `ports/extraction.ts`), so the
≤16-union limit and its regression test are unaffected.

## Blast radius

- **Files created:** none. (All new interfaces are added to the existing `core/ports/catalog.ts`.
  See Open question 1 for the alternative of one-file-per-store.)

- **Files modified:**
  - `packages/bot/src/core/ports/catalog.ts` — split the body of `CatalogRepository` into six exported
    sub-interfaces; redefine `CatalogRepository` as their intersection. Method signatures, JSDoc, and
    ordering are preserved verbatim; only the enclosing `interface` braces move.
  - `packages/bot/src/app/eventProcessor.ts` — narrow `EventProcessorDeps.catalog`
    (`:33`) from `CatalogRepository` to `ConversationIngestionStore & MembershipStore`; update import (`:16`).
  - `packages/bot/src/app/ingestionSweep.ts` — narrow `IngestionSweepDeps.catalog` (`:28`) to
    `ConversationIngestionStore & MemoryStore & PropertyStore`; update import (`:13`).
  - `packages/bot/src/app/reminderSweep.ts` — narrow `ReminderSweepDeps.catalog` (`:8`) to
    `FollowUpStore & PropertyStore`; update import (`:3`).
  - `packages/bot/src/app/readApiHandler.ts` — narrow `ReadApiDeps.catalog` (`:22`) to
    `MembershipStore & PropertyStore & FollowUpStore`; narrow the `allowedPropertyIds` param (`:110`)
    to `MembershipStore & Pick<PropertyStore, "listConversationProperties">` (it only calls
    `listUserConversations` + `listConversationProperties`); update import (`:16`).
  - `packages/bot/src/core/handlers/registry.ts` — `HandlerDeps.catalog` (`:36`) stays the broadest
    site; keep it typed as `CatalogRepository` (the intersection alias). Update import (`:2`) only if
    the alias name/path changes (it does not). **Net: no functional change here** — kept in the
    modified list because the import line is reviewed, but it may end up untouched.
  - `packages/bot/src/core/handlers/catalogAssistant.ts` — narrow the constructor field `catalog`
    (`:67`) to `PropertyStore & EditContextStore & FollowUpStore`; update import (`:10`).
  - `packages/bot/src/core/handlers/editReplyHandler.ts` — narrow the constructor field `catalog`
    (`:37`) to `EditContextStore & PropertyStore`; update import (`:14`).
  - `packages/bot/src/adapters/dynamodb/catalogRepository.ts` — **no signature change.**
    `class DynamoCatalogRepository implements CatalogRepository` (`:385`) still works because
    `CatalogRepository` is the intersection of all six. (Optional clarity edit: change the
    `implements` clause to the explicit six-interface list — see Step 8. Either is fine.)
  - `packages/bot/test/fixtures/fakeCatalog.ts` — `implements CatalogRepository` (`:15`) still works
    unchanged (intersection). **No edit required** unless Open question 1 picks per-file ports and
    the import path changes.

- **Files deleted:** none.

- **All call-sites to update** (every site that imports the `CatalogRepository` *type*; runtime call
  sites need no change because the methods and the concrete classes are untouched):
  - `packages/bot/src/app/eventProcessor.ts:16` (import), `:33` (field type)
  - `packages/bot/src/app/ingestionSweep.ts:13` (import), `:28` (field type)
  - `packages/bot/src/app/reminderSweep.ts:3` (import), `:8` (field type)
  - `packages/bot/src/app/readApiHandler.ts:16` (import), `:22` (field type), `:110` (param type)
  - `packages/bot/src/core/handlers/registry.ts:2` (import — keep `CatalogRepository`), `:36` (field)
  - `packages/bot/src/core/handlers/catalogAssistant.ts:10` (import), `:67` (field type)
  - `packages/bot/src/core/handlers/editReplyHandler.ts:14` (import), `:37` (field type)
  - `packages/bot/src/adapters/dynamodb/catalogRepository.ts:20` (import — keep, or expand the
    `implements` list at `:385`)
  - `packages/bot/test/fixtures/fakeCatalog.ts:7` (import — keep `CatalogRepository`)
  - `packages/bot/test/unit/ingestionSweep.test.ts:9` (import), `:143` (`Partial<CatalogRepository>`),
    `:199` (`as CatalogRepository`) — keep `CatalogRepository` (the IngestionSweep stub only needs
    the ingestion+memory+property subset, but `Partial<CatalogRepository>` still type-checks; see Tests)
  - `packages/bot/test/unit/eventProcessor.test.ts:58-108` — inline `EventProcessorDeps` catalog stub.
    After narrowing, the 18 extraneous method keys (`findPendingConversations` … `putMemoryDoc`)
    become **excess properties on an object literal assigned to a narrowed field type** → TypeScript
    WILL error (`Object literal may only specify known properties`). These must be removed. See Tests.
  - **No change** to the runtime call sites in `processor.ts`, `sweep.ts`, `reminder.ts`,
    `read-api.ts` (they `new DynamoCatalogRepository(...)`; the concrete class still satisfies every
    narrowed field because it implements the full intersection).

- **Tests touched** (all "update", no new test files):
  - `packages/bot/test/unit/eventProcessor.test.ts` — **must** trim the inline catalog stub to the
    3 methods `EventProcessorDeps.catalog` now requires (`touchConversation`, `recordMembership`,
    `removeMembership`). Excess keys now fail object-literal excess-property checking.
  - `packages/bot/test/unit/ingestionSweep.test.ts` — keep `Partial<CatalogRepository>` /
    `as CatalogRepository` as-is (still assignable to the narrowed intersection) OR optionally tighten
    to `Partial<ConversationIngestionStore & MemoryStore & PropertyStore>`. No behavioural change.
  - `packages/bot/test/fixtures/fakeCatalog.ts` and the 8 files that import it
    (`catalogAssistant.test.ts`, `editReplyHandler.test.ts`, `reminderSweep.test.ts`,
    `readApiHandler.test.ts`, `commandHandler.test.ts`, `postbackRouter.test.ts`, `registry.test.ts`,
    plus `eventProcessor.test.ts` does NOT use FakeCatalog) — **no edit** with the intersection alias
    (FakeCatalog implements `CatalogRepository`, which satisfies every narrowed intersection it's
    passed to). They are listed by the scout out of caution; verify green via typecheck.
  - `packages/bot/test/integration/catalog.integration.test.ts` and
    `packages/bot/test/integration/ingestionSweep.integration.test.ts` — **no edit**; they instantiate
    the concrete `DynamoCatalogRepository` (unchanged) and call methods on it directly.

## Current code

The port today is one interface (abridged — the five concern bands are marked by comment headers):

```ts
// packages/bot/src/core/ports/catalog.ts:13-149
export interface CatalogRepository {
  // --- Conversation tracker (debounced-ingestion state machine) ---
  touchConversation(conversationKey: string, inboundAtMs: number): Promise<void>;
  findPendingConversations(nowIso: string, limit: number): Promise<ConversationTracker[]>;
  claimConversation(conversationKey: string, nowMs: number, staleTimeoutMs: number): Promise<ConversationTracker | null>;
  failConversation(conversationKey: string): Promise<void>;
  releaseConversation(conversationKey: string, opts: { watermark: number; claimSeenInboundAt: number }): Promise<void>;
  getConversation(conversationKey: string): Promise<ConversationTracker | null>;
  // --- Edit context (last-viewed property → free-text "reply to update") ---
  armEdit(conversationKey: string, propertyId: string, armedAtMs: number): Promise<void>;
  getEditContext(conversationKey: string): Promise<{ propertyId: string; armedAt: number } | null>;
  clearEdit(conversationKey: string): Promise<void>;
  // --- User ↔ Conversation membership (read-access edges) ---
  recordMembership(userId: string, conversationKey: string, seenAtMs: number): Promise<void>;
  removeMembership(userId: string, conversationKey: string): Promise<void>;
  listUserConversations(userId: string): Promise<string[]>;
  // --- Properties + Conv→Property edges (write-scope + listing) ---
  upsertProperty(input: PropertyUpsert): Promise<void>;
  getProperty(propertyId: string): Promise<Property | null>;
  deleteProperty(propertyId: string): Promise<void>;
  deletePropertyEvents(propertyId: string): Promise<void>;
  linkConversationProperty(conversationKey: string, propertyId: string, nowMs: number): Promise<void>;
  unlinkConversationProperty(conversationKey: string, propertyId: string): Promise<void>;
  listConversationProperties(conversationKey: string): Promise<string[]>;
  listPropertiesForUser(userId: string): Promise<Property[]>;
  // --- Property events (calendar / reminders) ---
  addEvent(event: PropertyEvent): Promise<void>;
  listPropertyEvents(propertyId: string): Promise<PropertyEvent[]>;
  findDueEvents(nowIso: string, limit: number): Promise<PropertyEvent[]>;
  markEventNotified(event: PropertyEvent, nowMs: number): Promise<boolean>;
  // --- Per-conversation memory (durable learned context) ---
  getMemoryDoc(conversationKey: string): Promise<string | null>;
  putMemoryDoc(conversationKey: string, content: string): Promise<void>;
}
```

Verified per-consumer method usage (from `grep -n "catalog\." src/...`):

| Consumer | Methods used | Narrowed type |
|---|---|---|
| `eventProcessor.ts` | touchConversation; recordMembership; removeMembership | `ConversationIngestionStore & MembershipStore` |
| `ingestionSweep.ts` | findPendingConversations, claimConversation, failConversation, releaseConversation; getMemoryDoc, putMemoryDoc; upsertProperty, linkConversationProperty, getProperty, listConversationProperties | `ConversationIngestionStore & MemoryStore & PropertyStore` |
| `reminderSweep.ts` | findDueEvents, markEventNotified; getProperty | `FollowUpStore & PropertyStore` |
| `readApiHandler.ts` | listUserConversations, listConversationProperties, listPropertiesForUser, getProperty, listPropertyEvents | `MembershipStore & PropertyStore & FollowUpStore` |
| `catalogAssistant.ts` | listPropertiesForUser, getProperty, upsertProperty, deleteProperty, deletePropertyEvents, linkConversationProperty, unlinkConversationProperty, listPropertyEvents, addEvent; armEdit, clearEdit | `PropertyStore & EditContextStore & FollowUpStore` |
| `editReplyHandler.ts` | getEditContext, clearEdit, armEdit; getProperty, upsertProperty | `EditContextStore & PropertyStore` |
| `registry.ts` (`HandlerDeps`) | passes catalog to both handlers (union of the two rows above) | `CatalogRepository` (intersection alias — broadest) |

`getConversation` is called by NO app/handler code — only the two integration tests. It stays on
`ConversationIngestionStore` (it belongs there conceptually and the integration test instantiates the
concrete class, which still has it).

## Target design

`packages/bot/src/core/ports/catalog.ts` — the imports block is unchanged. The single interface is
replaced by six focused interfaces plus an intersection alias. **All method signatures and JSDoc are
copied verbatim** from the current file; only the `interface ... { }` wrappers and the section
comments change.

```ts
import type {
  ConversationTracker,
  Property,
  PropertyEvent,
  PropertyUpsert,
} from "../domain/catalog.js";

/**
 * Persistence seams for the catalog, split by concern. Keyed by raw string ids (conversationKey /
 * userId / propertyId) rather than {@link ConversationRef} because the ingestion/reminder sweeps work
 * purely from keys discovered via GSIs; callers that hold a ref convert with `conversationKey()`.
 *
 * One DynamoDB adapter ({@link ../../adapters/dynamodb/catalogRepository.DynamoCatalogRepository})
 * implements every store; app-layer consumers depend only on the store(s) they use.
 */

/** Conversation tracker — the debounced-ingestion state machine. */
export interface ConversationIngestionStore {
  /** Record an inbound message … (verbatim JSDoc) */
  touchConversation(conversationKey: string, inboundAtMs: number): Promise<void>;
  /** Conversations whose ready-at time is at or before `nowIso` … */
  findPendingConversations(nowIso: string, limit: number): Promise<ConversationTracker[]>;
  /** Atomically claim a conversation for ingestion … */
  claimConversation(
    conversationKey: string,
    nowMs: number,
    staleTimeoutMs: number,
  ): Promise<ConversationTracker | null>;
  /** Abandon a conversation after repeated failed ingestion attempts … */
  failConversation(conversationKey: string): Promise<void>;
  /** Finish an ingestion run … */
  releaseConversation(
    conversationKey: string,
    opts: { watermark: number; claimSeenInboundAt: number },
  ): Promise<void>;
  getConversation(conversationKey: string): Promise<ConversationTracker | null>;
}

/** Edit context — last-viewed property → free-text "reply to update". */
export interface EditContextStore {
  /** Arm a short-lived "edit context" … */
  armEdit(conversationKey: string, propertyId: string, armedAtMs: number): Promise<void>;
  /** The conversation's armed edit context … */
  getEditContext(conversationKey: string): Promise<{ propertyId: string; armedAt: number } | null>;
  /** Clear the armed edit context … */
  clearEdit(conversationKey: string): Promise<void>;
}

/** User ↔ Conversation membership — read-access edges. */
export interface MembershipStore {
  /** Upsert a membership edge `USER#<userId> → CONV#<conversationKey>`. */
  recordMembership(userId: string, conversationKey: string, seenAtMs: number): Promise<void>;
  /** Remove a membership edge (on `memberLeft`) … */
  removeMembership(userId: string, conversationKey: string): Promise<void>;
  /** Conversation keys this user is (or has been) a member of. */
  listUserConversations(userId: string): Promise<string[]>;
}

/** Properties + Conv→Property edges — write-scope + listing. */
export interface PropertyStore {
  /** Create or merge a property (set-if-present; never clobbers omitted fields). */
  upsertProperty(input: PropertyUpsert): Promise<void>;
  getProperty(propertyId: string): Promise<Property | null>;
  /** Delete a property's META row … */
  deleteProperty(propertyId: string): Promise<void>;
  /** Delete every follow-up event on a property … */
  deletePropertyEvents(propertyId: string): Promise<void>;
  /** Upsert a Conv→Property edge … */
  linkConversationProperty(conversationKey: string, propertyId: string, nowMs: number): Promise<void>;
  /** Remove a Conv→Property edge … */
  unlinkConversationProperty(conversationKey: string, propertyId: string): Promise<void>;
  /** Property ids discussed in (scoped to) this conversation … */
  listConversationProperties(conversationKey: string): Promise<string[]>;
  /** "Show my listings": resolve user → their conversations → those conversations' properties … */
  listPropertiesForUser(userId: string): Promise<Property[]>;
}

/** Property events — calendar / reminders. */
export interface FollowUpStore {
  /** Create a follow-up event on a property … */
  addEvent(event: PropertyEvent): Promise<void>;
  /** Every event on a property (past + future) … */
  listPropertyEvents(propertyId: string): Promise<PropertyEvent[]>;
  /** Un-notified events whose due time is at or before `nowIso` … */
  findDueEvents(nowIso: string, limit: number): Promise<PropertyEvent[]>;
  /** Atomically claim an event for notification … */
  markEventNotified(event: PropertyEvent, nowMs: number): Promise<boolean>;
}

/** Per-conversation memory — durable learned context. */
export interface MemoryStore {
  /** The conversation's memory note … or null. */
  getMemoryDoc(conversationKey: string): Promise<string | null>;
  /** Replace the conversation's memory note … */
  putMemoryDoc(conversationKey: string, content: string): Promise<void>;
}

/**
 * Backwards-compatible union of every catalog store. The DynamoDB adapter and the in-memory test
 * double implement this; the broadest injection site ({@link HandlerDeps}) uses it. Prefer depending
 * on the narrowest store(s) you actually call.
 */
export type CatalogRepository = ConversationIngestionStore &
  EditContextStore &
  MembershipStore &
  PropertyStore &
  FollowUpStore &
  MemoryStore;
```

**New exports:** `ConversationIngestionStore`, `EditContextStore`, `MembershipStore`,
`PropertyStore`, `FollowUpStore`, `MemoryStore`. **`CatalogRepository` changes from `interface` to a
`type` alias** (same name, same structural shape — every existing `implements CatalogRepository` /
`: CatalogRepository` keeps compiling; you cannot `implements` a `type` only if it's not an object
type, but an intersection of object types is fine and `implements` accepts it).

**`listPropertiesForUser` placement:** it is assigned to `PropertyStore` (it returns `Property[]`).
It internally orchestrates membership→edges→properties, which architecturally belongs in an app
service, but extracting that service is **out of scope for this unit** (it would change runtime
behaviour and call graphs). Keeping it on `PropertyStore` keeps the adapter unchanged. See
Open question 2. Because it lives on `PropertyStore`, `readApiHandler` and `catalogAssistant` already
get it via their `PropertyStore` member — no extra store needed.

## Step-by-step implementation

**Step 1 — Rewrite `packages/bot/src/core/ports/catalog.ts`.**
Replace the single `export interface CatalogRepository { … }` (lines 13-149) with the six interfaces
and the `CatalogRepository` intersection alias shown in *Target design*. Keep the import block
(lines 1-6) and copy every method's existing JSDoc verbatim into its new interface. Do not change any
signature, parameter name, or return type.

**Step 2 — `packages/bot/src/app/eventProcessor.ts`.**
- Line 16: change `import type { CatalogRepository } from "../core/ports/catalog.js";`
  to `import type { ConversationIngestionStore, MembershipStore } from "../core/ports/catalog.js";`
- Line 33: change `readonly catalog: CatalogRepository;`
  to `readonly catalog: ConversationIngestionStore & MembershipStore;`

**Step 3 — `packages/bot/src/app/ingestionSweep.ts`.**
- Line 13: change the import to
  `import type { ConversationIngestionStore, MemoryStore, PropertyStore } from "../core/ports/catalog.js";`
- Line 28: change `readonly catalog: CatalogRepository;`
  to `readonly catalog: ConversationIngestionStore & MemoryStore & PropertyStore;`

**Step 4 — `packages/bot/src/app/reminderSweep.ts`.**
- Line 3: change the import to
  `import type { FollowUpStore, PropertyStore } from "../core/ports/catalog.js";`
- Line 8: change `readonly catalog: CatalogRepository;`
  to `readonly catalog: FollowUpStore & PropertyStore;`

**Step 5 — `packages/bot/src/app/readApiHandler.ts`.**
- Line 16: change the import to
  `import type { FollowUpStore, MembershipStore, PropertyStore } from "../core/ports/catalog.js";`
- Line 22: change `readonly catalog: CatalogRepository;`
  to `readonly catalog: MembershipStore & PropertyStore & FollowUpStore;`
- Lines 109-110: change the `allowedPropertyIds` signature
  ```ts
  async function allowedPropertyIds(
    catalog: CatalogRepository,
    userId: string,
  ): Promise<Set<string>> {
  ```
  to
  ```ts
  async function allowedPropertyIds(
    catalog: MembershipStore & Pick<PropertyStore, "listConversationProperties">,
    userId: string,
  ): Promise<Set<string>> {
  ```
  (It calls only `listUserConversations` + `listConversationProperties`. `deps.catalog` is passed in
  at line 140 and satisfies this.) If you prefer minimal churn, `catalog: MembershipStore & PropertyStore`
  also type-checks — pick the tighter `Pick` form for clarity.

**Step 6 — `packages/bot/src/core/handlers/catalogAssistant.ts`.**
- Line 10: change the import to
  `import type { EditContextStore, FollowUpStore, PropertyStore } from "../ports/catalog.js";`
- Line 67: change `private readonly catalog: CatalogRepository,`
  to `private readonly catalog: PropertyStore & EditContextStore & FollowUpStore,`

**Step 7 — `packages/bot/src/core/handlers/editReplyHandler.ts`.**
- Line 14: change the import to
  `import type { EditContextStore, PropertyStore } from "../ports/catalog.js";`
- Line 37: change `private readonly catalog: CatalogRepository,`
  to `private readonly catalog: EditContextStore & PropertyStore,`

**Step 8 — `packages/bot/src/core/handlers/registry.ts` (broadest site — keep the alias).**
- Line 2 import and line 36 `readonly catalog: CatalogRepository;` stay as-is. `HandlerDeps.catalog`
  is passed into BOTH `CatalogAssistant` (needs `PropertyStore & EditContextStore & FollowUpStore`)
  and `EditReplyHandler` (needs `EditContextStore & PropertyStore`); the intersection of those is a
  subset of `CatalogRepository`, so the full alias is the correct broadest type. **No edit needed.**

**Step 9 — `packages/bot/src/adapters/dynamodb/catalogRepository.ts` (adapter — no behaviour change).**
- Line 20 import of `CatalogRepository` and line 385 `class DynamoCatalogRepository implements
  CatalogRepository` keep compiling unchanged (the alias is the full intersection).
- OPTIONAL clarity edit (recommended): change line 20 to import the six stores and line 385 to
  `export class DynamoCatalogRepository implements ConversationIngestionStore, EditContextStore,
  MembershipStore, PropertyStore, FollowUpStore, MemoryStore {` so the class explicitly advertises
  every contract it fulfils. This is cosmetic; if it adds noise, keep `implements CatalogRepository`.
  `DebouncePolicy` (`:353`) and `createCatalogRepository` (`:791`) are untouched.

**Step 10 — `packages/bot/test/fixtures/fakeCatalog.ts` (no edit).**
- Line 7 import of `CatalogRepository` and line 15 `implements CatalogRepository` keep compiling.
  Leave as-is. (Optional parallel clarity edit to the explicit six-interface `implements` list, same
  as Step 9 — not required.)

**Step 11 — `packages/bot/test/unit/eventProcessor.test.ts` (required trim).**
- The `deps.catalog` object literal (lines 75-108) is assigned to `EventProcessorDeps`, whose
  `catalog` field is now `ConversationIngestionStore & MembershipStore`. The literal supplies 24
  methods but the field accepts only 8 — TypeScript flags the **18 excess** as
  "Object literal may only specify known properties". Delete every key except:
  ```ts
  catalog: {
    touchConversation: async (key, at) => {
      spies.touched.push({ key, at });
    },
    recordMembership: async (uid, key) => {
      spies.memberships.push({ uid, key });
    },
    removeMembership: async (uid, key) => {
      spies.removed.push({ uid, key });
    },
    findPendingConversations: async () => [],
    claimConversation: async () => null,
    releaseConversation: async () => {},
    failConversation: async () => {},
    getConversation: async () => null,
  },
  ```
  Keep the six `ConversationIngestionStore` methods (`touchConversation`, `findPendingConversations`,
  `claimConversation`, `releaseConversation`, `failConversation`, `getConversation`) AND the three
  `MembershipStore` methods (`recordMembership`, `removeMembership`, `listUserConversations`). That is
  8 method names total (`ConversationIngestionStore` has 6, `MembershipStore` has 3, no overlap = 9 —
  include `listUserConversations: async () => []` as well). Remove the property/event/edit/memory
  stubs (`armEdit`, `getEditContext`, `clearEdit`, `upsertProperty`, `getProperty`, `deleteProperty`,
  `deletePropertyEvents`, `linkConversationProperty`, `unlinkConversationProperty`,
  `listConversationProperties`, `listPropertiesForUser`, `addEvent`, `listPropertyEvents`,
  `findDueEvents`, `markEventNotified`, `getMemoryDoc`, `putMemoryDoc`).
  Final required key set (9): `touchConversation`, `findPendingConversations`, `claimConversation`,
  `releaseConversation`, `failConversation`, `getConversation`, `recordMembership`, `removeMembership`,
  `listUserConversations`.

**Step 12 — `packages/bot/test/unit/ingestionSweep.test.ts` (no required edit).**
- `const catalog: Partial<CatalogRepository>` (`:143`) and `catalog as CatalogRepository` (`:199`)
  still compile: `Partial<CatalogRepository>` is assignable nowhere by itself, but the `as
  CatalogRepository` cast at the injection point produces a value assignable to the narrowed
  `ConversationIngestionStore & MemoryStore & PropertyStore` field (every member of the narrowed type
  is in `CatalogRepository`). Leave as-is. (Optional tighten to
  `Partial<ConversationIngestionStore & MemoryStore & PropertyStore>` + matching cast.)

**Step 13 — verify FakeCatalog consumers untouched.** The 7 FakeCatalog-importing unit tests
(`catalogAssistant`, `editReplyHandler`, `reminderSweep`, `readApiHandler`, `commandHandler`,
`postbackRouter`, `registry`) pass a `FakeCatalog` (which `implements CatalogRepository`) into the
narrowed constructors/deps. `CatalogRepository` is assignable to every narrower intersection, so no
edits. Confirm with `npm run typecheck`.

## Tests

No behavioural assertions change — this is a pure type refactor. Functionality stays identical; no bug
fix is in scope.

- **`packages/bot/test/unit/eventProcessor.test.ts`** — the only **required** test edit (Step 11).
  It pins that `EventProcessor` constructs with a catalog exposing only the
  ingestion+membership surface; the trimmed stub still satisfies every runtime call the processor
  makes (`touchConversation`, `recordMembership`, `removeMembership`). After trimming, every existing
  `it(...)` assertion (spies on touched/memberships/removed) passes unchanged.
- **`packages/bot/test/unit/ingestionSweep.test.ts`** — optionally tighten the `Partial<...>`
  annotation; behaviour identical. No assertion change.
- **All FakeCatalog-based unit tests** — no edit; they must remain green, proving the intersection
  alias preserves the full surface for the shared double.
- **Integration tests** (`catalog.integration.test.ts`, `ingestionSweep.integration.test.ts`) — no
  edit; they exercise the concrete `DynamoCatalogRepository`, which is structurally unchanged. Run
  only if a reviewer wants belt-and-suspenders; persistence code is untouched so they are not
  strictly required for this unit.

## Verification

```
npm run typecheck   # tsc across workspaces — MUST pass; this is the unit's real gate (catches every
                    # narrowed-injection mismatch and the eventProcessor.test.ts excess-property trim)
npm run lint        # biome — formatting/import-order on the edited files
npm run test        # vitest unit — all suites green; no assertion changed
```

`npm --prefix packages/bot run test:integration` (DynamoDB Local) is **not required** — this unit
changes only port *types* and narrowed injection sites; the concrete adapter, its persistence logic,
and the integration tests are untouched. Expected result: typecheck/lint/test all green with no
behavioural diff.

## Dependencies & ordering

- **Depends on change-unit 02 (handler/port boundaries) landing first.** Per `00-master-plan.md:118`,
  P2 #12 follows the P1 boundary fixes "once the injection points are narrowed, the smaller interfaces
  become immediately usable." Concretely: if unit 02 relocates port files into a new directory
  structure (e.g. `core/ports/catalog/`), the new store interfaces must be authored in whatever path
  unit 02 establishes, and the import specifiers in Steps 2-9 must point there. If unit 02 leaves
  `core/ports/catalog.ts` in place, follow the paths above verbatim. **See Open question 1.**
- **Shared files with other units:** `readApiHandler.ts` is also the subject of P1 #7 (the
  Lambda-coupling refactor) — coordinate so the import-line edit here doesn't clash with that unit's
  larger rewrite (land #7 first if both are in flight). `ingestionSweep.ts` is the subject of Theme C
  decomposition (#10) — this unit only touches its import + one field type, so a textual conflict is
  unlikely, but rebase order should put the decomposition first if both are queued.
- **No unit depends on this one's output**, but later app-service extraction (the `listPropertiesForUser`
  relocation, Open question 2) would build on the `PropertyStore`/`MembershipStore` split established
  here.

## Risk & rollback

- **Anthropic ≤16-union limit:** **not touched.** This unit changes no extraction schema, no
  `output_config.format`, no `claudeExtractor.ts`. The union-count regression test is unaffected and
  must stay green (it will — nothing in its input changed).
- **Hexagonal layering:** strictly improving. New interfaces live in `core/ports/` (zero infra
  imports — the import block is unchanged and references only `../domain/catalog.js`). The adapter
  still implements from the adapter layer. `DebouncePolicy` stays adapter-private. No layering
  regression.
- **Main failure mode:** a narrowed injection site that's missing a method the consumer actually
  calls → a **compile error caught by `npm run typecheck`** (never a runtime surprise). The per-consumer
  table above was derived by grepping every `catalog.` call; if typecheck flags a missing member, widen
  that site's intersection to include the owning store.
- **`eventProcessor.test.ts` excess-property error** is expected and handled by Step 11; if the trim
  is skipped, typecheck fails loudly (good — no silent breakage).
- **Rollback:** revert the single `catalog.ts` change back to one `interface CatalogRepository`
  declaration; the alias name is unchanged so all `implements`/`:` references keep compiling, and the
  narrowed injection sites (which use the new store names) are the only other edits to revert. A clean
  `git revert` of this unit's commit restores the prior state with no data/runtime impact (no
  persistence, infra, or behaviour touched).

## Open questions / decisions

**1 — Port file layout, coordinated with unit 02 — RESOLVED to Option A (reconcile pass, queue 00).**
The reconcile pass confirmed that **unit 02 does NOT introduce a per-port directory**: it adds three
new *flat* files (`core/ports/webhookParser.ts`, `signatureVerifier.ts`, `httpGateway.ts`) alongside
the existing flat `core/ports/*.ts`, and the repo has **no barrels today**. Therefore this unit keeps
**Option A**: all six interfaces + the `CatalogRepository` alias stay in the existing single file
`core/ports/catalog.ts`. The Steps above assume exactly this — no path changes needed. (Option B —
one file per store under a `core/ports/catalog/` folder with a barrel — is rejected: it would invent
the repo's first barrel and rewrite every import specifier for no benefit.) This open question is now
**closed**; the only remaining `needs-decision` rationale for this unit was the layout fork, so with
it resolved the unit is **ready to implement** once its hard dependency (unit 02) has landed.

**2 — `listPropertiesForUser` home (membership-vs-property boundary crosser).**
- It returns `Property[]` but internally orchestrates membership→edges→properties (an app-service
  concern leaking into the adapter, per F11 risk note).
- **Decision for THIS unit:** keep it on `PropertyStore` (returns properties; both `readApiHandler`
  and `catalogAssistant` that call it already depend on `PropertyStore`). Extracting a
  `CatalogQueryService` to own the orchestration is a **separate, behaviour-touching unit** and is
  explicitly out of scope here. No action needed now; recorded so a later unit can relocate it.
