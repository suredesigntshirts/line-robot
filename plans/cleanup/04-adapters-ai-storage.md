# Anthropic/AI Extraction Adapter + DynamoDB Repositories — Code Quality Findings

## Summary

The AI extraction adapter is well-structured: the nullable budget is carefully managed, prompt engineering is readable and well-annotated, and the escalation ladder is cleanly separated from call mechanics. The DynamoDB repositories handle a genuinely complex single-table design with good access-pattern encapsulation, solid defensive mappers, and the only raw DynamoDB operations are justified and clearly commented. The main concerns are: a duplicated Docker/DynamoDB-Local test harness between the two integration tests; several magic strings embedded inline instead of as named constants; a subtle type-annotation gap where `memoryUpdate` carries conflicting nullability between the schema, the port, and the mapper; and a small but real duplication between `buildConversionContent` and `buildExtractionContent` around the image-block construction that appears in two separate places.

## Findings

### [F01] `memoryUpdate` nullability is inconsistent across schema, port, and mapper
**Severity:** medium
**File:** packages/bot/src/adapters/anthropic/claudeExtractor.ts:88 / packages/bot/src/core/ports/extraction.ts:119
**Issue:** The Zod schema at line 88 declares `memoryUpdate: z.string()` — so the model always emits a non-null string (sentinel `""` = no update). The `ExtractionResult` port at `extraction.ts:119` however declares `memoryUpdate?: string | null`. The test fake at `claudeExtractor.test.ts:209` explicitly passes `memoryUpdate: null` as a parsed value, which the real schema never produces. This means the escalation logic in `extract()` silently passes `null` upward as if it were a valid update, and any consumer that checks `memoryUpdate` for truthiness is accidentally correct only because `null` is falsy — the types are lying.
**Suggestion:** Normalise to the sentinel convention throughout: change `ExtractionResult.memoryUpdate` to `readonly memoryUpdate?: string` (or `string | undefined`) and convert `""` to `undefined` when mapping from `ParsedExtraction` to `ExtractionResult`. Remove `null` from the test fake. The same applies to `SegmentationResult.memoryUpdate` at `extraction.ts:151`.

---

### [F02] Duplicated image/document content-block construction
**Severity:** medium
**File:** packages/bot/src/adapters/anthropic/claudeExtractor.ts:267–284 and 467–485
**Issue:** `buildExtractionContent` (lines 267–284) and `mediaBlock` / `classifyImage` (lines 467–485) both convert an `ExtractionMedia` to an Anthropic image or document block with identical `base64` source shapes and the same `IMAGE_MEDIA_TYPES` set guard. There are even two separate `Set` constants for what is the same set of image MIME types: `IMAGE_MEDIA_TYPES` (line 48) and `IMAGE_TYPES_FOR_CLASSIFY` (line 421), containing identical values. If a new media type (e.g. `image/avif`) is added, a developer must remember to update both.
**Suggestion:** Extract a single `toMediaBlock(media: ExtractionMedia): Anthropic.ContentBlockParam | null` helper (already named `mediaBlock` but private to the classifier class). Expose it as a module-level function and call it from both `buildExtractionContent` and `classifyImage`. Merge the two `Set` constants into one named `SUPPORTED_IMAGE_MEDIA_TYPES`.

---

### [F03] Magic string "PENDING" / "DUE" embedded at point-of-use rather than as constants
**Severity:** low
**File:** packages/bot/src/adapters/dynamodb/catalogRepository.ts:437, 447, 479, 746
**Issue:** The GSI partition key values `"PENDING"` (GSI1) and `"DUE"` (GSI2) are magic strings that appear inline in `UpdateCommand` expression attribute values (line 437) and `QueryCommand` expressions (lines 479, 746). If either is ever renamed (e.g. to distinguish staging/prod tables), there is no single place to update — a grep is required, and renaming one but not the other silently breaks the index.
**Suggestion:** Define two module-level constants — `const GSI1_PK = "PENDING"` and `const GSI2_PK = "DUE"` — adjacent to the existing `GSI1` and `GSI2` index-name constants (lines 24–28), and reference them everywhere.

---

### [F04] `touchConversation` embeds magic entity-type string `"conversationTracker"` in two places
**Severity:** low
**File:** packages/bot/src/adapters/dynamodb/catalogRepository.ts:445, 597–598
**Issue:** The string literal `"conversationTracker"` is used as the `entityType` discriminator in both `touchConversation` (line 445) and `armEdit` (line 597). It is the only entity that bypasses ElectroDB for these writes, so mistyping it in one of the two places means old items won't be recognised by future reads that filter on it. It's not actually queried anywhere in the current code, but the inconsistency is a future bug magnet.
**Suggestion:** Extract `const TRACKER_ENTITY_TYPE = "conversationTracker"` alongside the other file-level constants and reference it in both expressions.

---

### [F05] `toEvent` mapper is defensively over-general when called on a typed ElectroDB item
**Severity:** low
**File:** packages/bot/src/adapters/dynamodb/catalogRepository.ts:329–339
**Issue:** `toEvent` accepts `Record<string, unknown>` and re-casts every field with `String(item.x ?? "")` / `Number(item.x ?? 0)` / `typeof item.x === "number" ? ...`. This defensive style is appropriate for the raw GSI2 `QueryCommand` result at line 751 (which returns plain `Record`s), but the same function is also called on `result.data` from `this.event.query.byProperty().go()` at line 725 — which is a fully-typed `EntityItem`. The two call sites have different needs, and the shared function paper-masks an `EntityItem`-to-`Record` cast at line 725 via `result.data.map(toEvent)`. TypeScript allows it because `EntityItem` is structurally compatible with `Record<string, unknown>`, but it hides the fact that the typed path needs no defensive coercion.
**Suggestion:** Either (a) create a typed `EntityItem`-accepting overload for the ElectroDB path and keep the `Record` version for the raw GSI2 result, or (b) accept the current single function and add an explicit comment explaining why the defensive casts are retained for the raw-query path.

---

### [F06] `listPropertiesForUser` does N+1 GetItem fetches with no batching
**Severity:** medium
**File:** packages/bot/src/adapters/dynamodb/catalogRepository.ts:697–705
**Issue:** `listPropertiesForUser` does: one Query per conversation (lines 699–701) then one `getProperty` (GetItem) per unique property (lines 703–704). For a user with M conversations containing K unique properties total this is M+K round-trips with no batching. DynamoDB's `BatchGetItem` could collapse the K GetItems to `ceil(K/100)` calls (the hard limit per BatchGet). For the expected scale (dozens of properties) this is currently acceptable, but there is no comment acknowledging the trade-off, and the pattern will silently degrade as the catalog grows.
**Suggestion:** Add an inline comment documenting the N+1 and the rationale for deferring BatchGet (e.g. "acceptable at current scale; switch to BatchGetItem once a user is expected to exceed ~30 properties"). When the limit is hit, replace `Promise.all(uniqueIds.map(id => this.getProperty(id)))` with a BatchGetItem wrapper.

---

### [F07] `toPhotos` accepts `unknown` and does manual runtime type-narrowing instead of a versioned migration
**Severity:** low
**File:** packages/bot/src/adapters/dynamodb/catalogRepository.ts:285–301
**Issue:** `toPhotos` handles the schema migration from bare `string[]` (pre-plan-13) to `PropertyPhoto[]` by accepting `unknown` and doing `typeof p === "string"` checks at runtime. This pattern quietly continues working forever, so old rows never fail — which is intentional — but it is invisible to TypeScript; a future change to the stored shape would need to add another branch here without any compiler guidance. The function's parameter type `unknown` also means it can't be called through ElectroDB's typed accessor without a cast.
**Suggestion:** The migration approach is correct for a live system. Add a JSDoc note explicitly marking this as a "read-time migration shim for pre-plan-13 rows" with an estimate of when it can be removed (once all existing rows have been round-tripped through an upsert). This turns an implicit design decision into documented intent. Alternatively, a one-time migration script that back-fills all legacy rows would let this function be deleted entirely.

---

### [F08] `buildExtractionContent` has a misleading instruction ("else null") for `existingPropertyId`
**Severity:** low
**File:** packages/bot/src/adapters/anthropic/claudeExtractor.ts:258
**Issue:** The candidates section of `buildExtractionContent` ends with: "match against these for updates (set existingPropertyId to the id if one matches, **else null**)". But the Zod schema and `SYSTEM_PROMPT` both correctly say the absent value is `""` (empty string), not `null`. The instruction in the candidates section contradicts both the system prompt and the schema, introducing a model instruction inconsistency that could cause the model to produce `null` where `""` is expected.
**Suggestion:** Change "else null" to "else empty string" at line 258 so the three sources (system prompt, schema comment, user turn) all agree.

---

### [F09] `segment` falls back to a hardcoded model string rather than a type-safe default
**Severity:** low
**File:** packages/bot/src/adapters/anthropic/claudeExtractor.ts:297
**Issue:** `segment()` accesses `this.ladder[0]?.model ?? "claude-haiku-4-5"`. The fallback string is the same as `DEFAULT_LADDER[0].model` but is not derived from it. If the default model is ever renamed in `DEFAULT_LADDER`, the fallback string in `segment` will silently remain wrong. The ladder is guaranteed non-empty by construction, so `this.ladder[0]!.model` is safe, or the optional-chain is unnecessary.
**Suggestion:** Remove the `?? "claude-haiku-4-5"` fallback entirely and use `this.ladder[0]!.model` — the constructor always receives `DEFAULT_LADDER` (non-empty) or a test-supplied ladder, and an empty ladder is a programming error that should throw rather than silently fall back to a magic string. Alternatively, validate `ladder.length >= 1` in the constructor.

---

### [F10] `ClaudeImageClassifier` model string has no validation; `createClaudeImageClassifier` allows silent misconfiguration
**Severity:** low
**File:** packages/bot/src/adapters/anthropic/claudeExtractor.ts:426–463, 487–494
**Issue:** `ClaudeImageClassifier` accepts any `string` for `model`. There is no guard that the supplied model actually supports vision. If a caller accidentally passes a text-only model (e.g. the Opus text tier), every classify call will return a 400 from Anthropic with no compile-time signal. `ClaudeExtractor.callTier` has the same issue for the escalation ladder — any string is accepted.
**Suggestion:** Define a `const VISION_MODELS` allowlist or a branded type, or at minimum document the constraint in the constructor JSDoc. For the tier system, the `ModelTier` interface already uses `readonly model: string` — a comment naming the required capability (vision for classify, structured output for extract) would flag accidental misuse without requiring a runtime check.

---

### [F11] Both integration tests duplicate the full Docker/DynamoDB-Local harness
**Severity:** medium
**File:** packages/bot/test/integration/catalog.integration.test.ts:1–108 and packages/bot/test/integration/dynamodb.integration.test.ts:1–99
**Issue:** `startContainer`, `waitForReady`, `tryDocker`, the `sleep` helper, and the container-naming/port-parsing logic are copy-pasted verbatim between the two integration test files. The only differences are the container name (`linerobot-ddb-catalog-it` vs `linerobot-ddb-it`) and which tables are created. Any change to startup logic (e.g. switching to a different DynamoDB Local image version) must be applied in both places.
**Suggestion:** Extract a shared `test/integration/dynamodbLocal.ts` helper module that exports `startDynamoDBLocal(containerName: string): Promise<DynamoDBDocumentClient>` (encapsulating `tryDocker`, `startContainer`, `waitForReady`, and the client construction). Each test file calls it with its own container name and creates its own tables. This also makes `afterAll` teardown consistent.

---

### [F12] `messageRepository` entity uses default `casing` (lowercased keys) while `catalogRepository` entities all use `casing: "none"`
**Severity:** medium
**File:** packages/bot/src/adapters/dynamodb/messageRepository.ts:48–51 vs catalogRepository.ts:104, 128, etc.
**Issue:** The `byConversation` index in `messageRepository.ts` does not set `casing: "none"` on its pk/sk composite fields (lines 48–51). ElectroDB's default casing lowercases the composite values before writing them as the pk/sk. The catalog entities explicitly set `casing: "none"` because LINE conversation/user IDs are case-sensitive (e.g. `U1234abCD`). The message entity writes keys like `pk: "conversationkey#u1234abcd"` rather than preserving the original casing — but `findSince` at line 124 takes a raw `conversationKey` string and passes it straight to ElectroDB's query, so the key materialised at write time and the key used at read time both go through the same lowercasing path, making it accidentally consistent. However, `findRecent` converts a `ConversationRef` via `conversationKey()` and then ElectroDB lowercases it on read — so a key like `group#GroupABC` would be stored as `group#groupabc` (pk). If LINE group IDs are mixed-case (they typically are uppercase `C...` prefixed), stored messages are silently written under a lowercased key that can never be found by an exact-match lookup from a non-ElectroDB caller (e.g., a raw GetItem in a scan, the idempotency layer, or a migration script).
**Suggestion:** Add `casing: "none"` to the pk and sk in `buildMessageEntity`'s `byConversation` index, mirroring the catalog entities. Verify with a one-time scan that no existing messages have lowercased pk values that would become unreachable after the fix.

---

### [F13] `ExtractionSchema` type alias `ParsedExtraction` is module-private but effectively duplicates `ExtractionResult`
**Severity:** low
**File:** packages/bot/src/adapters/anthropic/claudeExtractor.ts:92
**Issue:** `ParsedExtraction = z.infer<typeof ExtractionSchema>` is a private alias used only inside `callTier` and `extract`. The port's `ExtractionResult` is structurally very similar but uses `readonly` arrays and optional instead of required. The mapping from `ParsedExtraction` to `ExtractionResult` in `extract()` (line 334–337) is an implicit field-by-field spread that loses the sentinel-to-undefined conversion: `memoryUpdate` is passed through as-is (a possibly-empty string), while `ExtractionResult` declares it as `string | null | undefined`. This is the same gap as F01 but from the perspective of the internal type alias: `ParsedExtraction.properties` is `z.infer<...>` (mutable array), while `ExtractionResult.properties` is `readonly ExtractedProperty[]`.
**Suggestion:** Inline the conversion explicitly rather than relying on structural compatibility. At the `return` in `extract`, convert `memoryUpdate: parsed.memoryUpdate || undefined` and `properties: parsed.properties as readonly ExtractedProperty[]` so the types are correct at the boundary.

## Cross-cutting patterns

**Missing module-level constants for infrastructure identifiers.** `catalogRepository.ts` defines `GSI1` and `GSI2` as constants (good) but then embeds their partition key values (`"PENDING"`, `"DUE"`) and entity-type discriminators (`"conversationTracker"`) inline. The `messageRepository.ts` has no constants at all — table names, index names, and entity strings are passed through constructor parameters, which is cleaner, but the entity `service` name (`"linerobot"`) differs from the catalog's (`"catalog"`) with no explanation. A single `ENTITY_SERVICE` constant per file would at least make the divergence intentional and searchable.

**Two parallel adapter construction functions (`createXxx`) that are thin wrappers.** `createClaudeExtractor`, `createClaudeImageClassifier`, `createCatalogRepository`, and `createMessageRepository` all simply `new` their class with the arguments forwarded unchanged. These factory functions add no logic, no validation, and no dependency-injection wiring. They were presumably introduced to avoid exposing the class constructor in external call sites, but since the classes themselves are exported, the factories provide no real encapsulation. Either make them the only export (unexport the classes), or remove them and call `new` directly at the Lambda entry points.

**Defensive mappers (`toEvent`, `toTracker`) mix raw-query and typed-ElectroDB call sites.** Both are called from both a typed ElectroDB `.go()` result and a raw `QueryCommand` result (for GSI access). The defensive casts are necessary only for the raw path but are applied uniformly. A type union `EntityItem<...> | Record<string, unknown>` would be more honest, or the two call sites should use separate (possibly derived) mappers. As written, the typing is correct-by-accident: TypeScript allows passing an `EntityItem` where `Record<string, unknown>` is expected because `EntityItem` is structurally wider.

**No error handling on ElectroDB calls.** Every `this.property.upsert(...).go()`, `this.event.create(...).go()`, `this.membership.upsert(...).go()`, etc., is unawaited without a try/catch. The raw `UpdateCommand` calls do have selective `ConditionalCheckFailedException` handling (correct), but the ElectroDB-managed calls propagate DynamoDB throttles, provisioned-capacity exhaustion, and transient network errors as unhandled promise rejections. The Lambda handlers will surface these as 500s with no domain-layer retry or logging context. A thin try/catch that logs the operation name and re-throws would make CloudWatch diagnosis significantly faster.
