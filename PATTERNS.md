# PATTERNS.md — canonical patterns for line-robot

> Durable home for "the one clean way we do X" so future work (human or LLM) inherits best practice.
> **Honest note:** an adversarial audit of the plan-16 cleanup cut most of the proposed "patterns"
> (they were renames, type tweaks, or cosmetics, not real consolidation). What's left below is small
> but real. Merge the ESTABLISHED rules into `CLAUDE.md` + memory when convenient.

Each pattern: the rule (imperative), why, and the canonical reference site.

---

## Validated existing patterns — do NOT "clean these up"
*(The audit flagged these as tempting-but-wrong refactors. Recorded so they aren't re-attempted.)*

### AWS SDK v3 error detection uses the `.name` string check, NOT `instanceof`
- **Do:** `if ((error as { name?: string }).name === "ConditionalCheckFailedException") …`
- **Don't:** `if (error instanceof ConditionalCheckFailedException) …`
- **Why:** in a bundled Lambda, an SDK error can cross a module boundary (duplicate SDK copies,
  middleware re-throw) where `instanceof` silently returns `false`. The `name` string is stable and
  is AWS's own cross-bundle-safe guidance. It also keeps `catalogEntities.ts` free of a client-layer
  import. **This is correct as-is.**
- **Ref:** `adapters/dynamodb/catalogEntities.ts` (`isConditionalCheckFailed`).

### The `compact()` + `as DTO` cast in `catalogDto.ts` is benign — leave it
- Removing the cast means restructuring a correct object literal (more code) to delete a cast that
  hides no bug. Not a simplification. **Ref:** `core/handlers/catalogDto.ts`.

### `@esbuild/linux-x64` pin is load-bearing
- It's the native binary esbuild runs on the x86_64 build host to produce the arm64 bundle. Do not
  "make it platform-neutral." **Ref:** `packages/bot/package.json`.

---

## Established this session (plan 16)

### Coupled timeouts derive from one source
- **Do:** `visibilityTimeoutSeconds: 6 * PROCESSOR_TIMEOUT_SECONDS`.
- **Don't:** hardcode `180` next to a hardcoded `30` with a comment hoping they stay in sync.
- **Ref:** `infra/src/naming.ts` (`PROCESSOR_TIMEOUT_SECONDS`) → `storage.ts` + `lambdas.ts`.

### No parallel field that can never diverge
- One counter, not two. `SweepResult` dropped `claimed` (it was incremented in lockstep with
  `ingested` on every reachable path). **Ref:** `app/ingestionSweep.ts` (`SweepResult`).

### No struct field that exists only to be stripped
- If every consumer does `.map(x => ({ a, b }))` to drop a field, the field shouldn't be on the
  type. `ParsedGeo` dropped its never-read `source`; three identical strip-maps disappeared.
- **Ref:** `core/domain/geo.ts` (`ParsedGeo`).

### Extraction prompt text must match the schema's sentinel
- The schema is `z.string()` with `""` = absent (never `null`). Prompt instructions must say
  `else ""`, never `else null`, or the model is told to emit a value the schema rejects.
- **Ref:** `adapters/anthropic/claudeExtractor.ts` (`buildExtractionContent`).

### Strict-output extraction: sentinel-over-nullable, ≤16 union budget  *(do not regress)*
- Required-with-sentinel — strings `z.string()` with `""`; arrays `z.array()` with `[]`. Reserve
  `.nullable()` for numbers. Anthropic strict output hard-caps the schema at **16 union params**;
  exceeding it 400s every call. A regression test asserts ≤16 — keep it green.
- **Ref:** `adapters/anthropic/claudeExtractor.ts`, `adapters/anthropic/CLAUDE.md`.

---

## Already-established patterns worth knowing (from the cleanup 01–18 sprint)

- **Lambda cold-start:** `const getDeps = lazySingleton(buildDeps)` (`lib/lazySingleton.ts`); clock via
  `SYSTEM_CLOCK` from `lib/clock.ts`. Don't re-roll `let p; p ??= …` per file.
- **Cross-package DTOs:** one source in `@line-robot/shared` (`packages/shared/src/dto.ts`); never a
  hand-mirrored copy in `packages/miniapp`.
- **Shared sentinel helpers:** `nullToUndef`/`emptyToUndef`/`listToUndef` in `core/domain/sentinel.ts`;
  one `extractedToBaseUpsert` mapping in `core/handlers/propertyMapping.ts`.
- **Catalog port shape:** two aggregate stores (`ConversationStore` + `PropertyStore`), one Dynamo
  class implementing both — matches the single-table data model. Don't re-segregate per entity.
- **LINE flex bubble wrapping:** one `wrapBubbles()` helper (single bubble vs carousel) — not copied
  per builder. **Ref:** `adapters/line/lineGateway.ts`.
- **Shared infra config:** cross-module constants live in `infra/src/naming.ts` (`prefix`,
  `logRetentionDays`, `PROCESSOR_TIMEOUT_SECONDS`), imported anywhere side-effect-free.
- **Integration tests:** shared `startDynamoDBLocal(name)` from `test/integration/dynamodbLocal.ts`.
</content>
