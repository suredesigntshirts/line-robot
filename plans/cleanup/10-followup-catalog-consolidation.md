# Follow-up: catalog adapter + port consolidation (post-sprint units 10–11)

> Written after the 9-unit cleanup sprint (`changes/01–09`) shipped. This round was driven by a
> **critical re-review of the sprint itself** — specifically unit 07 — not by the original audit.
> Baseline for the original dossier was `b5d12a4`; this work sits on top of units 01–09.

## Why this happened

Unit 07 ("split the CatalogRepository god-port into six focused stores", `e4c76ea`) was the weakest
unit on a cost/benefit basis. A skeptical pass found:

- It split the **port** into six interfaces but left the **implementation** (`DynamoCatalogRepository`,
  one class) and the `FakeCatalog` double untouched — so the actual "god-object" (the 30-method class)
  survived; only the type surface changed.
- The six seams don't match the single-table data model. Two concrete proofs from the code:
  - **Edit context is stored ON the tracker META item** (`armEdit`/`getEditContext`/`clearEdit` use
    the same `trackerKey(conversationKey)` as `touchConversation`/`getConversation`) — so
    `ConversationIngestionStore` and `EditContextStore` were two views of one physical item.
  - **`listPropertiesForUser` fans across three entities** (membership → conv-property → property),
    so no per-entity store can own it.
- Net effect: it added 2–3-way intersection types + a `Pick<>` at every injection site (call sites got
  *harder* to read) to buy a compiler guard against a mistake that wasn't occurring, in a system with
  one implementation and one fake.

The conclusion: the real complexity was (a) the **file size** of the adapter (schema + logic in one
796-line file) and (b) **over-segregation** of the port. Neither is fixed by more interfaces.

## What units 10–11 did

### Unit 10 — extract `catalogEntities.ts` (schema vs. logic) — `541a868`
The adapter file mixed ~360 lines of single-table layout (5 ElectroDB entity builders, key helpers,
row mappers) with ~410 lines of method logic. Moved the layout layer to a new
`adapters/dynamodb/catalogEntities.ts`; `DynamoCatalogRepository` imports it back.

- `catalogRepository.ts` **796 → 444** lines (adapter methods only)
- `catalogEntities.ts` **new, 376** lines (the table shape)
- The moved code is **byte-for-byte the original** (verified by diff, modulo the export/import header)
  — zero behaviour change. The `noTemplateCurlyInString` biome-ignore moved with the ElectroDB key
  templates.

This is the simplification the "god-class" complaint was really about, and it required **no** interface
gymnastics.

### Unit 11 — collapse the port to two aggregate stores — `15539b8`
Replaced the six interfaces with the **two aggregates the data actually has**:

- `ConversationStore` — tracker + edit context + membership + memory (all `CONV#…` / `USER#…` keyed).
- `PropertyStore` — properties + conv-property edges + events + the user fan-out (all `PROP#…` keyed).

`CatalogRepository = ConversationStore & PropertyStore` stays the alias, so the Dynamo adapter and the
fake are untouched. Every method's JSDoc moved verbatim. The `Pick<PropertyStore, …>` ceremony in
`readApiHandler` is gone.

**Finding confirmed by the collapse:** of six consumers, only `eventProcessor` (`ConversationStore`)
and `reminderSweep` (`PropertyStore`) are single-store; the other four genuinely span both aggregates.
That is direct evidence the six-way split was over-cut.

**Tradeoff accepted:** `eventProcessor.test.ts` uses an inline stub (not `FakeCatalog`), so it now
stubs 5 edit/memory no-ops it never calls (documented in a comment). One test file, five throwaway
lines.

**Deliberately NOT done — the implementation split (one Dynamo class → N).** A single-table DynamoDB
adapter is one cohesive unit: the `listPropertiesForUser` fan-out and the shared tracker item mean N
classes would fight the data model (they'd share entities or duplicate wiring). This supersedes the
original **P2 #12** plan, which proposed splitting the port *and* having "the DynamoDB adapter
implement all" — we keep one class on purpose.

### Verification (both units)
typecheck (bot + miniapp + shared + infra) + lint (139 files) green; 281 unit + 27 integration; all 5
lambdas bundle (`catalogEntities` inlined, 0 runtime module refs); `claudeExtractor.ts` untouched
(16-union budget safe).

---

## Remaining honest simplification / consolidation candidates

Re-verified against the **live tree** (the dossier's findings were generated at `b5d12a4`; units 01–11
have since landed). Filtered to genuine *simplify-and-consolidate* moves — excluding renames, new
features, type-safety redesigns, and bug fixes. **None of these are done; this is a survey only.**

### Tier 1 — clear wins, same spirit as 10–11 (real shared home, low risk)

1. **`infra/index.ts` decomposition + Lambda/IAM helpers — `P2 #11` + `#20`.** Still a **772-line**
   monolith wiring 5 Lambdas, 5 IAM roles, CloudFront, and storage, with the per-Lambda IAM + function
   boilerplate copy-pasted 5×. The `infra/src/` skeleton the audit mentioned is **gone**, so this is
   greenfield. A `lambdaRole(name, statements)` + `botLambda(opts)` helper plus `storage.ts`/`iam.ts`/
   `lambdas.ts` split is the **direct infra-side analog of unit 10** — biggest remaining file, zero bot
   risk, fully self-contained.

2. **Merge the two identical image-MIME `Set`s + extract `toMediaBlock` in `claudeExtractor.ts` —
   `P2 #25` / `F02`.** Confirmed live: `IMAGE_MEDIA_TYPES` (line 49) and `IMAGE_TYPES_FOR_CLASSIFY`
   (line 420) hold **identical** values, and the image/document content-block construction is
   duplicated at two sites. Merging into one `SUPPORTED_IMAGE_MEDIA_TYPES` + one `toMediaBlock` helper
   is pure dedup. **Safe:** this touches neither `output_config.format` nor any nullable field — the
   16-union budget is untouched.

3. **De-duplicate the integration-test harness — `P3 #29` / `F11`.** Now **3-way** copy-paste (worse
   than the audit's 2): `startContainer` / `tryDocker` / `waitForReady` are repeated across
   `catalog`, `dynamodb`, and `ingestionSweep` integration tests. Extract
   `test/integration/dynamodbLocal.ts` exporting `startDynamoDBLocal(name)`. Test-only, pure
   consolidation.

### Tier 2 — honest but smaller, or carrying a caveat

4. **One `CatalogAssistant` + `createHandlers(deps)` — `P2 #23`.** `registry.ts` builds **two**
   separate `CatalogAssistant` instances (lines 50 and 67) across two factory functions. Merge into one
   `createHandlers(deps)` returning `{ messageHandler, postbackRouter }` sharing a single assistant.
   Small, clean, low-risk.

5. **Consolidate the "upcoming" fan-out — `P1 #3` (was deferred in unit 03).** Confirmed still
   duplicated: `catalogAssistant.upcoming()` and `readApiHandler.handleUpcoming()` both do
   listings → per-property `listPropertyEvents` → collect-future-events, into near-identical row
   shapes. **Caveat (why it was deferred):** the shared logic needs `propertyTitle` (a `core/handlers`
   view concern) and the catalog port, and no `core/domain` file may import those — so there is no
   clean domain home. The honest move is a shared **query** helper (raw rows) in `app/` or `core`, with
   each surface formatting its own DTO/message. Worth doing, but it needs the same kind of
   home-placement judgment we just applied to the stores.

6. **One home for the LINE platform-limit constants — legacy debt.** `MAX_CARDS = 12` /
   `MAX_UPCOMING_CHIPS = 13` in `views.ts` mirror `MAX_BUBBLES = 12` / `MAX_QUICK_REPLIES = 13` in
   `lineGateway.ts` (same values, different layers, comments admit the mirror). Same cross-layer
   duplication unit 03 resolved for photo/sort helpers by relocating to `core/domain` — apply the same
   pattern. Small.

7. **Name the GSI partition-key + entity-type magic strings — `P2 #24` / `F03`,`F04`.** `"PENDING"`,
   `"DUE"`, `"conversationTracker"` are inline in the adapter methods. Now that `GSI1`/`GSI2` live in
   `catalogEntities.ts` (unit 10), the PK *values* belong there too as named consts. Tiny, cheap, in a
   file we just touched.

### Tier 3 — listed in the dossier but I would NOT do as "simplification"

- **Remove the thin `createXxx` factories** (cross-cutting note in `04`). `createCatalogRepository` /
  `createClaudeExtractor` / etc. are thin wrappers, but they're a harmless, stable construction seam.
  Removing them is a style preference, not a simplification — **leave them**.
- **`Property` nested value objects / flat-bag redesign — `P2 #16`, epoch-B legacy.** This is a
  *redesign* (27 optionals → nested objects), interacts with the extraction schema budget, and is
  debatable in value. Not an "honest simplification" — out of scope.
- **Defensive-mapper "fixes" — `F05`/`F07`.** The audit itself says the current defensiveness is
  correct (raw GSI rows + typed ElectroDB rows share the mapper); `00-master-plan.md` "What NOT to
  touch" protects it. **Leave.**
- **Domain renames** (`GeoLocation.lat/long`, `ConversationTracker` → `ingestion.ts`, `PropertyEvent`
  → `FollowUp`). Clarity, not consolidation, and a risky cascade. Not now.

### Recommended order if pursued
Tier 1 first (each self-contained: infra is zero-bot-risk; the two bot dedups are small and safe),
then Tier 2 #4 and #6 (trivial), then #5 (needs a home decision), then #7 (cheap polish). Skip Tier 3.
Every item must keep `claudeExtractor.ts`'s `output_config.format` schema and the ≤16-union regression
test untouched.
