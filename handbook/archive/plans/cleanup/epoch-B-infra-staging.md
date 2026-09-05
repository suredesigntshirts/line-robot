# Infrastructure & Staging Setup — Design Review

## Epoch summary

This epoch bootstrapped the production-shaped AWS environment: a scoped deploy IAM identity, LINE assertion signing key generation, staging stack initialisation with encrypted Pulumi secrets, and the full catalog data layer (DynamoDB single-table schema, ElectroDB entity definitions, conversation-tracker state machine, port interface, and domain types). The `@anthropic-ai/sdk` dependency was also added and the Lambda idempotency context registration was fixed. Twelve commits, ~1 400 lines added.

---

## Design concerns introduced

### D01 — `Property` domain type is a flat bag of ~25 optional fields with no value-object grouping

**Severity:** medium
**File(s):** `packages/bot/src/core/domain/catalog.ts`
**What was introduced:** The `Property` interface carries every attribute as a direct top-level optional field: physical dimensions (`bedrooms`, `bathrooms`, `usableAreaSqm`, `floors`, `furnishing`), commercial terms (`askingPrice`, `currency`, `rentPrice`, `listingType`), location (`lat`, `long`, `district`, `subdistrict`, `province`, `normalizedAddress`), provenance (`source`, `contact`, `mapUrl`), and so on. The comment "Slice 1 models the identity/location/commercial core … richer fields added alongside extraction" anticipated growth, but the growth happened inline rather than in nested value objects.
**Why it's a problem:** A flat interface of 25+ optionals makes it impossible to express "these three fields form a location" or "these four form a price". At call sites, callers pattern-match the whole bag. Adding more fields in future plans (which already happened — `chanote`, `photos`, `PropertyEvent`, `memory`) continues to widen one type rather than composing domain concepts. The `PropertyUpsert = Partial<Omit<Property, "propertyId">>` derivation copies the same flatness into the write model.
**Better approach:** Group logically related fields into value-object interfaces: `PropertyLocation { lat?, long?, normalizedAddress?, district?, subdistrict?, province? }`, `CommercialTerms { askingPrice?, currency?, rentPrice?, listingType? }`, `PhysicalDetail { bedrooms?, bathrooms?, ... }`. `Property` then contains `location?: PropertyLocation` etc. ElectroDB's `map` type already supports nested objects cleanly (as demonstrated by `chanote`). This also makes the 16-nullable budget easier to reason about because each group costs 1 union, not N.

---

### D02 — `status` on `Property` is typed as a bare `string` despite having a documented lifecycle

**Severity:** medium
**File(s):** `packages/bot/src/core/domain/catalog.ts:68`
**What was introduced:** The field comment documents eight concrete states (`lead → researching → visited → negotiating → offer → under-contract → closed → dropped`) but the type is `readonly status?: string`. The ElectroDB schema mirrors this as `type: "string"`.
**Why it's a problem:** Nothing in the type system prevents a caller (or an LLM extraction) from writing `"pending"`, `"active"`, or any other string. Transitions are not validated anywhere. When UI or query code needs to render a status badge or filter by lifecycle stage, it must defensively handle arbitrary strings. Every downstream consumer reimplements the same ad-hoc validation.
**Better approach:** Define `export type PropertyStatus = "lead" | "researching" | "visited" | "negotiating" | "offer" | "under-contract" | "closed" | "dropped"` in the domain file. Use `readonly status?: PropertyStatus` on the interface. Add a small `parsePropertyStatus(raw: string): PropertyStatus | undefined` helper the extraction adapter can use when it receives an LLM string. ElectroDB's `enum` type can enforce the values at the write layer too.

---

### D03 — `listPropertiesForUser` does N+1 GetItem calls in the adapter

**Severity:** medium
**File(s):** `packages/bot/src/adapters/dynamodb/catalogRepository.ts` (`listPropertiesForUser`)
**What was introduced:**
```
const conversationKeys = await this.listUserConversations(userId);        // 1 Query
const idLists = await Promise.all(
  conversationKeys.map((key) => this.listConversationProperties(key)),    // N Queries
);
const uniqueIds = [...new Set(idLists.flat())];
const properties = await Promise.all(uniqueIds.map((id) => this.getProperty(id)));  // M GetItems
```
Three serial fan-out stages: 1 Query → N Queries → M GetItems. All requests inside each stage are concurrent, but stages are sequential. For a user in 5 conversations each with 10 properties, that's 1 + 5 + up to 50 individual DynamoDB requests per "my listings" call.
**Why it's a problem:** The port interface `listPropertiesForUser(userId)` promises a single atomic-feeling call but hides O(conversations × properties) round trips. This is a classic N+1 at the infrastructure boundary. As user history grows it will be slow and expensive. The current integration test uses at most 2 conversations and 2 properties, so the pattern was never exercised at realistic scale.
**Better approach:** Use `BatchGetItem` (up to 100 keys per call) for the final property hydration step, cutting M GetItems to ceil(M/100) batched calls. For the mid-stage conversation→property queries, consider a User→Property GSI (GSI3, noted as deferred in the memory) that collapses the whole fan-out to a single Query. The port signature already matches that — the implementation just needs to grow into it.

---

### D04 — `DebouncePolicy` and its default constants live inside the adapter, not in the port or a domain policy object

**Severity:** low
**File(s):** `packages/bot/src/adapters/dynamodb/catalogRepository.ts:353–361`
**What was introduced:** `DebouncePolicy { quietDebounceMs, maxWaitMs }` and `DEFAULT_DEBOUNCE = { quietDebounceMs: 2 min, maxWaitMs: 30 min }` are exported from the DynamoDB adapter module. The sweep Lambda (not yet in this epoch) would import this from the adapter to configure its call.
**Why it's a problem:** The debounce policy is a domain/application-level decision — "how long to wait before ingesting a conversation" is business logic, not a detail of the DynamoDB implementation. Putting it in the adapter couples the sweep's business rules to its persistence layer and makes the policy invisible from a domain reading. The numeric magic values (2 min, 30 min) are also only documented by comments.
**Better approach:** Move `DebouncePolicy` and `DEFAULT_DEBOUNCE` to `packages/bot/src/core/domain/catalog.ts` or to the application layer (`app/sweepPolicy.ts`). The adapter constructor can accept a `DebouncePolicy` parameter (it already does via `Partial<DebouncePolicy>`), but the type and defaults belong above the adapter.

---

### D05 — The conversation tracker bypasses ElectroDB entirely, duplicating the key-format contract in a raw string template

**Severity:** low
**File(s):** `packages/bot/src/adapters/dynamodb/catalogRepository.ts` (`trackerKey`)
**What was introduced:** The tracker writes use raw `UpdateCommand` with `Key: trackerKey(conversationKey)` where `trackerKey` returns `{ pk: \`CONV#${conversationKey}\`, sk: "META" }`. The `convProperty` entity also writes to `CONV#<conversationKey>` as its PK, derived by ElectroDB from the template `"CONV#${conversationKey}"`. The `sk: "META"` literal is duplicated between the tracker's raw writes and the `memory` entity's template `"MEMORY"` — a reader must hold both mentally to understand what lives under a `CONV#` partition.
**Why it's a problem:** The key format `CONV#…` / `META` / `PROP#…` / `USER#…` is a single-table schema contract. It appears in multiple places: raw string in `trackerKey()`, ElectroDB templates in four entity builders, and the test's `CreateTableCommand`. Any renaming or prefix change requires touching all of them. The bypass-ElectroDB choice is legitimate (conditional updates need precise `UpdateExpression` control), but the key-format knowledge is now scattered.
**Better approach:** Centralise the key-prefix constants at the top of the adapter file: `const PREFIX = { CONV: "CONV#", PROP: "PROP#", USER: "USER#" } as const` and `const SK = { META: "META", MEMORY: "MEMORY" } as const`. `trackerKey` and all ElectroDB templates reference the same constants. This doesn't eliminate the ElectroDB bypass but does make the schema contract explicit and single-sourced in the file.

---

### D06 — `toProperty` is a manual field-by-field copy with no structural guarantee it stays in sync with `Property`

**Severity:** low
**File(s):** `packages/bot/src/adapters/dynamodb/catalogRepository.ts` (`toProperty`)
**What was introduced:** A function that maps an ElectroDB `PropertyItem` to the domain `Property` by explicitly naming each field. At the time of the epoch's final commit (`acd8b27`) the function already had ~28 field assignments. As more fields were added in subsequent plans, each required a corresponding line in `toProperty`.
**Why it's a problem:** TypeScript cannot verify that the mapping is exhaustive: if a field is added to `Property` and the ElectroDB schema but `toProperty` is not updated, the field silently returns `undefined` for all existing records. The existing `stripUndefined` pattern shows awareness of this gap but doesn't close it. The test suite for `toProperty` only exercises the ElectroDB upsert → getProperty round-trip, so a missing field in the mapping would only surface at runtime.
**Better approach:** Use a type-level exhaustiveness check on the mapping: `const mapped: Required<Omit<Property, 'propertyId'>> = { normalizedAddress: item.normalizedAddress, ... }` — the assignment will fail to compile if any field is missing (required keys cannot be `undefined` in the object literal). Alternatively, accept that ElectroDB item types are already structurally aligned and use a single spread `return { ...item } as unknown as Property` behind a narrow guard. Either approach beats a manual 30-field copy.

---

### D07 — The `@anthropic-ai/sdk` package is added as a runtime dependency but is used only in one adapter

**Severity:** low
**File(s):** `packages/bot/package.json`
**What was introduced:** `"@anthropic-ai/sdk": "^0.102.0"` was added to `dependencies` (not `devDependencies`). At the time of this epoch it was not yet used by any code in the diff — it was added in preparation for the extraction adapter that arrives in later epochs.
**Why it's a problem:** Adding a dependency before any code uses it obscures the actual dependency graph and inflates the Lambda bundle for the processor that does not use Anthropic at all. The processor Lambda and a future ingestion/sweep Lambda will share the same `packages/bot` bundle, meaning every deployed Lambda carries the SDK whether or not it calls Anthropic.
**Better approach:** Add the dependency when the consuming code is committed in the same commit (or at minimum the same PR). If the two Lambda entry points have meaningfully different runtime needs, consider whether the build already tree-shakes it. If not, moving the Anthropic adapter into a separate package or using dynamic import at the boundary would prevent the dependency from loading in Lambda cold paths that do not need it.

---

### D08 — Integration test duplicates the DynamoDB table DDL that Pulumi already owns

**Severity:** low
**File(s):** `packages/bot/test/integration/catalog.integration.test.ts` (`createTable`)
**What was introduced:** The test contains a `CreateTableCommand` with the full table schema — `AttributeDefinitions`, `KeySchema`, `GlobalSecondaryIndexes` — mirroring what `infra/index.ts` declares as the Pulumi-managed `catalogTable`. The index name `"gsi1"` and attribute names `gsi1pk`/`gsi1sk` are literals in both places.
**Why it's a problem:** If the GSI name or a key attribute is renamed in the Pulumi infra definition, the integration test silently uses the old schema and continues passing, masking the divergence. This is the same problem as the existing `dynamodb.integration.test.ts` (which has the same pattern for the messages table), but it compounds with each new table added.
**Better approach:** Extract a shared `catalogTableDefinition` (or a `createCatalogTableInput(): CreateTableCommandInput` helper) from the adapter or a test-fixture module, and import it in both the integration test setup and any future table-creation script. This ensures the test schema is always in sync with the real schema by construction. The Pulumi definition is still separately maintained (Pulumi types differ from SDK types) but the key names and GSI names can at minimum be imported from the same constants used in the adapter.

---

## What was done well

1. **Conditional claim with stale-timeout recovery is correct.** The `claimConversation` write uses a single atomic `UpdateItem` with `ConditionExpression` to enforce the at-most-one-worker guarantee while also allowing stale claim recovery — a non-trivial concurrency primitive handled cleanly without optimistic retry loops leaking into the port.

2. **Sparse GSI design is architecturally sound.** Using a constant `gsi1pk = "PENDING"` and writing `gsi1sk` only while a conversation has pending work (removing both keys on completion) keeps the ingestion sweep's query bounded to genuinely pending conversations with no table scan. The two-path `releaseConversation` (clean close vs. re-arm) is correctly symmetric.

3. **Assertion signing key tooling is well-scoped.** `scripts/generate-assertion-key.mjs` generates the LINE RSA key pair in one command, writes the public key to `infra/` (safe to commit) and the private key to a user-specified path at mode `0600`, and never prints the private key to stdout. The usage comment and the LINE documentation reference make the one-time setup reproducible by any future maintainer.

---

## Patterns

Two recurring shortcuts are visible across this epoch's diff:

- **Grow in place instead of composing.** When a new concept needed representation (debounce policy, key prefixes, status values), it was added as fields or constants inside the nearest existing file rather than extracted into a focused module. This is a fast-moving codebase and the choices are defensible, but the pattern means the adapter file is already doing schema definition, key formatting, state-machine logic, result mapping, and policy constants simultaneously.

- **Test coverage follows the happy path.** The integration test is strong on the core state-machine scenarios (debounce anchor, claim, clean release, re-arm) but does not cover error paths: what happens if `getProperty` is called for a property id that exists in a `CONV→PROP` edge but whose `PROP#…` item was deleted; what `listPropertiesForUser` returns when one of the fan-out `getProperty` calls silently returns null for a valid id. These gaps are consistent across the epoch's new tests and suggest coverage was written to match the happy-path implementation, not to probe the boundaries.
