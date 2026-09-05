# Extraction Refinement + Hero Photos — Design Review

## Epoch summary
This epoch added per-conversation memory docs (stored in DynamoDB, injected into the extraction prompt, updated by the model), a three-tier model escalation ladder (Haiku → Sonnet → Opus) triggered by a new `lowConfidence` signal, targeted merge hints via `ambiguousWith`, Anthropic prompt-caching TTL configuration, usage logging, and hero-image presigned URLs rendered on property cards. The diff spans 668 lines across 24 files and is accompanied by a solid unit-test suite for the new behaviours.

---

## Design concerns introduced

### [D01] Photos replace instead of accumulate — silent data loss across sweeps
**Severity:** high
**File(s):** `packages/bot/src/app/ingestionSweep.ts` (applyProperty / collectPhotoKeys)
**What was introduced:** `collectPhotoKeys` returns the image S3 keys present in the *current* batch and `applyProperty` writes `{ photos: [...photoKeys] }` into the DynamoDB upsert. ElectroDB's SET semantics replace the stored list wholesale.
**Why it's a problem:** A second sweep of the same property that happens to contain new images silently discards all photos from every prior sweep. The guard comment "never clobber existing photos with an empty list" only protects the zero-image case. A broker who shared photos over multiple chat sessions keeps only the most-recent batch's keys. This was confirmed as a known regression: Plan 12 increment 2 explicitly calls out "photo gallery accumulation" as a fix.
**Better approach:** Fetch the current `photos` from the property record before the upsert (or read it from the already-loaded candidate), merge (deduplicate by S3 key), then store the combined list. Alternatively, model photos as an append-only separate entity with its own DynamoDB items so the upsert never risks overwriting prior data.

---

### [D02] No regression guard for the Anthropic 16-union-parameter limit when new nullable fields were added
**Severity:** high
**File(s):** `packages/bot/src/adapters/anthropic/claudeExtractor.ts:44-63`
**What was introduced:** Two new `.nullable()` fields were added to the extraction schema: `ambiguousWith: z.array(z.string()).nullable()` and `memoryUpdate: z.string().nullable()`. This brought the total from 14 to exactly 16 — the documented hard limit. No test existed at this point to enforce that bound.
**Why it's a problem:** The codebase CLAUDE.md records a prior production outage caused by exceeding this limit, and notes "This is not caught by our tests." This epoch added two more nullables without adding the guard test, leaving the schema at maximum budget with nothing to stop the next contributor from adding a seventeenth (which is exactly what happened in Plan 12, causing another outage). The guard test (`ExtractionSchema — Anthropic 16-union-parameter limit`) was only added after the second outage.
**Better approach:** Add the `countUnionParams` regression test in the same commit as any schema change. The rule in CLAUDE.md should have generated a failing test first. Alternatively, encode the constraint directly: `ambiguousWith` could have been `z.array(z.string())` with `[]` as the sentinel (no nullable needed), saving one budget unit and making the schema more consistent with the project's stated sentinel pattern.

---

### [D03] `ModelTier` interface exported from an adapter, not from the extraction port
**Severity:** medium
**File(s):** `packages/bot/src/adapters/anthropic/claudeExtractor.ts:32-38`
**What was introduced:** `ModelTier` (with `model`, `effort`, and `thinking`) is defined and exported from the Anthropic adapter implementation. The `createClaudeExtractor` factory accepts `ladder?: readonly ModelTier[]`, so callers who want to override the ladder must import from the adapter, not the port.
**Why it's a problem:** In hexagonal architecture the port (`core/ports/extraction.ts`) should express the policy surface that callers depend on; adapters implement the port. Publishing a configuration type from an adapter leaks Anthropic-specific vocabulary (`effort`, `thinking`) into any caller that wants to customise the ladder. The `PropertyExtractor` port stays clean but the factory function couples callers to the Anthropic adapter's internals. If the extractor were ever swapped (e.g., for a cheaper provider), the ladder type would need to move.
**Better approach:** Define an opaque `ExtractionTier` type or a simple ladder-configuration interface in `core/ports/extraction.ts` and have the adapter map it to Anthropic's own parameters internally. Alternatively, keep `ModelTier` internal (unexported) and only expose the factory — the default ladder covers all production use cases and tests can mock `PropertyExtractor` directly.

---

### [D04] Silent presign failures are unobservable — errors swallowed without logging
**Severity:** medium
**File(s):** `packages/bot/src/core/handlers/catalogAssistant.ts:83-101` (heroUrls)
**What was introduced:** `heroUrls` wraps each `signer.presignGet()` call in a `try/catch` that returns `null` on failure. The listing is returned without the hero image. No log is emitted.
**Why it's a problem:** A misconfigured bucket name, an expired IAM credential, or a missing S3 key will silently degrade all property cards to text-only. The failure is invisible in CloudWatch. Because the epoch also adds `s3:GetObject` to the processor IAM policy in the same commit, any future IAM misconfiguration would produce silent degradation rather than a detectable error. There are no tests for the failure case either (no test calls a signer that throws and asserts it logs a warning).
**Better approach:** Log a `logger.warn` with the S3 key and error message before returning `null`. The `CatalogAssistant` would need the logger injected (it currently has no logger dependency), or the warning could be emitted by the signer adapter itself. A minimal alternative is to at least let the first failure propagate and only catch subsequent ones — this surfaces the issue on first occurrence in integration/staging.

---

### [D05] Memory note is wholly replaced each sweep with no merge and no truncation warning
**Severity:** medium
**File(s):** `packages/bot/src/app/ingestionSweep.ts:323-338` (applyMemoryUpdate)
**What was introduced:** `applyMemoryUpdate` accepts the model's proposed replacement note, silently truncates it to 1500 characters with `slice(0, MAX_MEMORY_CHARS)`, and calls `putMemoryDoc` which upserts (replaces) the stored note.
**Why it's a problem:** Two sub-issues: (a) If the model returns a truncated partial note (e.g., mid-sentence), the stored memory is corrupted — the `length` is logged but there is no `warn` to signal truncation occurred or how many chars were dropped. (b) The prompt instructs the model to "return the FULL updated note" and the sweep trusts it to do so, but if the model is low-confidence or returns a compressed version, prior durable facts are lost. There is no diff/merge logic — a busy conversation with many sweeps could oscillate between memory states as each sweep's model response wins outright.
**Better approach:** Log a `warn` when `next.length > MAX_MEMORY_CHARS` before truncating. For the replacement-vs-merge issue: either store an append log (each entry stamped), or on truncation fall back to keeping the prior stored note rather than storing a truncated one. At minimum, include both `stored: bounded.length` and `truncated: next.length > MAX_MEMORY_CHARS` in the log.

---

### [D06] Unhandled API errors inside the escalation ladder — a hard error on tier N prevents tier N+1 from running
**Severity:** medium
**File(s):** `packages/bot/src/adapters/anthropic/claudeExtractor.ts` (extract / callTier)
**What was introduced:** The escalation loop calls `callTier` without any exception handling. `callTier` itself has no try/catch — it calls `this.client.messages.parse(...)` directly.
**Why it's a problem:** A transient 429 throttle, network timeout, or Anthropic 500 on Haiku will throw out of the for-loop and propagate to `ingestOne`, which treats it as a conversation-level failure (claim kept, retry later). The tier-N+1 (Sonnet/Opus) that might have succeeded is never tried. Since the comment explicitly frames the escalation as "escalate past an unparseable tier" it is reasonable to expect the same resilience for transient API errors, but the code only handles `parsed_output === null` (structured-output refusal), not thrown exceptions.
**Better approach:** Wrap `callTier` in a try/catch inside the loop: on a transient/API error, log a warning and continue to the next tier. If all tiers fail (including from thrown errors), return `null` as the current all-null case does. Distinguish API errors from confidence-based escalation in the log so cost analysis stays accurate.

---

### [D07] `collectPhotoKeys` silently skips non-image attachments but does not filter PDFs from multi-property batches — photo attribution remains ambiguous
**Severity:** low
**File(s):** `packages/bot/src/app/ingestionSweep.ts:94-101` (collectPhotoKeys)
**What was introduced:** `collectPhotoKeys` accepts any attachment whose `contentType` starts with `"image/"`. The sweep then only attributes photos when the batch yields exactly one property. A batch with two images and two properties produces no attribution.
**Why it's a problem:** The heuristic is sound for the common case, but it over-captures: a batch of one property-text message plus two images of *different* properties (e.g., a broker sharing a comparison) will incorrectly attribute both images to the single property the extractor identifies. The attribution decision is made purely on property count, not on any model signal about which image belongs to which property.
**Better approach:** Extend `ExtractedProperty` with an optional `photoKeys` field populated by the model (the extraction prompt already describes all media and the property's address, so the model could declare which images it associated with each property). This is a later-slice concern, but the current comment "which property a photo belongs to is ambiguous, so we attach none" acknowledges the limitation without tracking it as a known gap.

---

### [D08] `ambiguousWith: null` in schema versus `readonly string[] | null` in port — nullable array inconsistent with the project's sentinel pattern
**Severity:** low
**File(s):** `packages/bot/src/adapters/anthropic/claudeExtractor.ts:45`, `packages/bot/src/core/ports/extraction.ts:58`
**What was introduced:** `ambiguousWith` is modelled as `.nullable()` in the Zod schema and `readonly string[] | null` in the port. The project's stated convention (CLAUDE.md) is to use empty arrays as sentinels for absent lists to avoid spending nullable budget.
**Why it's a problem:** Minor convention break: `ambiguousWith: []` is a perfectly valid sentinel for "no hints" and would not cost a nullable slot. The inconsistency with `tags: z.array(z.string()).nullable()` (also in this schema) means two list fields use nullable rather than `[]`, burning two of the 16-union budget on arrays that have a natural empty-sentinel. At the time of this epoch both were within budget, but the pattern leaves less room for future fields.
**Better approach:** Use `ambiguousWith: z.array(z.string())` (non-nullable; `[]` = no hint) and update the port type to `readonly string[]`. Then `ingestionSweep` can use `property.ambiguousWith.length > 0` instead of `property.ambiguousWith ?? []`, and one nullable slot is freed.

---

## What was done well

1. **Test coverage for the escalation ladder is thorough and uses a real class under test.** Five distinct scenarios are covered (confident primary, single escalation, best-effort last tier, unparseable tier, usage logging) using a proper fake SDK client — not mocking the class method itself. This makes the ladder behaviour refactoring-safe.

2. **`buildExtractionSystem` and `buildExtractionContent` are pure functions, exported and independently unit-tested.** Extracting the prompt-assembly logic into pure, testable functions rather than burying it inside the class is the right call. The cache-breakpoint placement comment ("NOTE: Haiku's minimum cacheable prefix is 4096 tokens — today's prefix is under that") is honest about a known limitation rather than claiming caching is active when it is not.

3. **The merge-offer narrowing via `ambiguousWith` degrades gracefully.** The `filtered.length > 0 ? filtered : mergeTargets` fallback ensures that if the model returns IDs that don't match any candidate (hallucinated or stale), the UI still shows all candidates rather than an empty merge list. The fallback is tested in the `"narrows the merge offer"` case.

---

## Patterns

Two recurring shortcuts are visible across this epoch:

- **Silent swallow of failures at the domain handler layer.** The `heroUrls` presign failures are swallowed with no log. The pattern of "swallow and degrade" is reasonable at the boundary (a presign failure should not break the listing response) but the lack of any observability signal is the mistake — every swallow should emit at least a warn. The same pattern appears in the media collection path, which does log warns correctly, so the inconsistency is notable.

- **"Never clobber with empty" as a substitute for accumulation.** Both photos and memory use "only write if non-empty" as the guard against data loss, but neither accumulates — a non-empty write always replaces the prior value. The comment language ("never clobber existing photos with an empty list") implies the concern about data loss is understood, but the solution stops short: it prevents the trivially wrong case while leaving the silent-replacement case open.
