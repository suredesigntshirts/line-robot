# Plan 16 — Cleanup: pattern consolidation

> **Status: DONE (audited + executed 2026-06-08).** An adversarial per-item audit (9 critic
> sub-agents, default-CUT) scored all 27 proposed items. **12 landed; 15 were cut.** All gates green:
> typecheck (4 workspaces) · lint · 257+22+2 unit · 27 integration · 5 Lambda bundles + miniapp build.
> Canonical patterns recorded in [`PATTERNS.md`](../PATTERNS.md).

## Audit outcome — what landed vs cut

**Landed (12):** A1–A5 (miniapp dead-code/dedup/CSS), B2 (`wrapBubbles`), E1 (prompt `else ""` vs
`null`), E2 (drop dead model fallback), D3 (drop dead `ParsedGeo.source`), G1 (drop redundant
`SweepResult.claimed`), H1 (stale Pulumi description), H5 (derive SQS timeout from
`PROCESSOR_TIMEOUT_SECONDS`).

**Cut (15) — and *why*, so we don't re-litigate:**
- **C1** `instanceof ConditionalCheckFailedException` — REJECTED: the `.name` string check is the
  cross-bundle-safe pattern; `instanceof` is *more* fragile in a bundled Lambda. The existing code is
  correct (recorded in PATTERNS.md).
- **H4** `@esbuild/linux-x64` platform-neutral — REJECTED: the pin is load-bearing on the x86_64 build
  host; removing it risks breaking the bundle.
- **D2** `ingestAttempts` default `0` — REJECTED: real behavior change (DynamoDB `ADD` starts at 0 →
  first claim already reads 1; the `?? 1` defends legacy rows). Would hand legacy rows a free attempt.
- **G2** inline `createIdempotencyConfig` — DROPPED at implementation: it's used by prod *and* the
  integration test; inlining would duplicate the `"webhookEventId"` magic string. Keeping the factory
  is the cleaner state.
- **C2** `IngestionStatus` union, **D1** `memoryUpdate \| null`, **F1** `compact()` cast, **F2**
  `display.ts` move, **B1** colour constants — all CUT as type-tweaks / cosmetics / relocation, not
  real consolidation. **A6** `Spinner` type, **H2** dep placement, **H3** coverage-pkg move, **H6**
  assertion-key delete — CUT as marginal / risky (see "considered & rejected" below).
- **I** `botLambda` factory, **J** merge `LineContentClient` — CUT (Pulumi resource-rename risk /
  intentional ISP split).

The original PROPOSED plan follows, unchanged, for the record.

---

> **Original status (PROPOSED).** This doc was the *audit surface*: read top-to-bottom, tick or reject
> each item, confirm grouping + land order, then execute.

## Goal

Not "change for the sake of change." The north star: **consolidate recurring patterns to a single
clean/simple/canonical form, then write them down** so future work (human or LLM) inherits best
practice instead of re-introducing the anti-pattern. Each landed pattern is captured in
[`PATTERNS.md`](../PATTERNS.md) and merged into `CLAUDE.md` + memory at the end.

## How we got here

Source: `plans/cleanup/` — a read-only multi-agent audit generated at baseline `b5d12a4`. That dossier
has **already been ~90% executed** (commits `cleanup 01`–`18`). Two fresh verification sweeps (8 Sonnet
agents, 2026-06-08) re-checked every findings file (`01`–`08`) against the **live tree** and discarded
everything ALREADY-DONE / OBSOLETE / not-an-honest-simplification (renames, type redesigns, new
features, speculative guards). What survived is below.

Each item is tagged:
- **PATTERN** — establishes/reinforces a recurring canonical. Carries a **propagation set**: we fix
  *every* instance of the anti-pattern in scope, not just the cited line, so the clean way becomes the
  only way. (User decision 2026-06-08.)
- **HYGIENE** — isolated tidy / dead-code removal with no recurring pattern. Worth doing, low ceremony.

## Item schema

```
[ID] Title                                   [PATTERN|HYGIENE] · risk · ~effort
  Where:  file:line(s) (implementer re-verifies — lines are from the sweep, may drift)
  Now:    current state
  Change: exact mechanical change
  Canon:  the pattern it sets (PATTERN only)
  Prop:   propagation set — every other instance to convert (PATTERN only)
  Verify: gate that must stay green
  Audit:  [ ] valid  [ ] useful   → ACCEPT / REJECT / DEFER
```

---

## Hard constraints (every unit respects these)

- **≤16 nullable/union budget** in `claudeExtractor.ts` `output_config.format`. NO unit touches that
  schema. The union-count regression test stays green. (See repo `CLAUDE.md`.)
- **Do not touch** security verifiers (`signatureVerifier.ts`, `lineTokenVerifier.ts`) beyond nothing
  here, the deliberate `processor.ts` `BATCH_SIZE=1` / `batchItemFailures` pattern, or the
  master-plan "What NOT to touch" list (`plans/cleanup/00-master-plan.md`).
- **Domain renames / type redesigns are out of scope** — they live in
  `plans/15-deferred-domain-type-safety-and-naming.md`. Don't pull them in here.

## Bounded sub-agent contract (every execution unit gets this verbatim)

```
MANDATE:  Implement ONLY unit <X> from plans/16-cleanup-pattern-consolidation.md.
          Touch only the files/sites it lists (+ the propagation set for PATTERN units).
PHILOSOPHY: Consolidate to the single clean/canonical form. Simplify or remove; never add
          speculative abstraction. No drive-by changes outside the unit.
CONSTRAINTS: ≤16-union budget — do NOT touch claudeExtractor output_config.format / any nullable
          field there. Don't touch security verifiers. Respect master-plan "What NOT to touch".
DELIVER:  the edits + run the unit's Verify gate (all green) + report diff stats and a 3-line summary.
STOP RULE: if the change is bigger or riskier than the spec says (extra files, behavioral ripple,
          a failing gate you can't trivially fix), STOP and report — do not improvise a fix.
```

I review each diff + re-run the gate + commit (`cleanup NN: …`, continuing the existing numbering,
next is **cleanup 19**) **between** units. Land order is risk-ascending (miniapp first to prove the
pipeline on isolated ground).

---

## Execution units

### Unit A — miniapp hygiene  [HYGIENE] · very low risk · ~20 min total
*Isolated package, no downstream consumers — the safe place to validate the whole pipeline. One commit.*

- **A1** Delete dead `api.upcoming()` + `UpcomingItem` import — `packages/miniapp/src/api.ts:6,32-33`. No callers anywhere.
- **A2** Dedup `normalizePath` — export it from `src/lib/deeplink.ts:14-16`, delete the private copy in `src/App.tsx:43-45`, import it.
- **A3** Inline the `filters` object into the `useMemo` factory (also fixes a stale dep-array) — `src/screens/List.tsx:54-57`.
- **A4** Compute `caption(photo)` once per item (use for both `alt` and `<figcaption>`) — `src/components/Gallery.tsx:32,34`.
- **A5** Add `white-space: nowrap` to `.card-title` so `text-overflow: ellipsis` actually fires — `src/styles.css:175`.
- **A6** Fix `Spinner` return type `ComponentChildren` → `JSX.Element` — `src/ui.tsx:9`.
- **Verify:** `npm --prefix packages/miniapp run typecheck && build && test`.

### Unit B — LINE flex view pattern  [PATTERN] · low risk · ~20 min
- **B1** Name the 5 inline hex colour literals as module-top constants — `adapters/line/lineGateway.ts:77,85,95,96,103`.
- **B2** Extract `wrapBubbles()` to kill the duplicated single-vs-carousel dispatch — `lineGateway.ts:138-140,162-164`.
- **Canon:** LINE flex colours come from a named palette; bubble→container wrapping has one helper.
- **Prop:** grep `adapters/line/` for any other inline `#`-hex or duplicated wrap ternary; convert all.
- **Verify:** bot `typecheck && lint && test` (esp. `lineGateway.test.ts`).

### Unit C — typed errors & named status in the Dynamo adapter  [PATTERN] · low risk · ~25 min
- **C1** Use `error instanceof ConditionalCheckFailedException` (from `@aws-sdk/client-dynamodb`) instead of the `(e as {name?}).name === "…"` string cast — `adapters/dynamodb/catalogEntities.ts:368`.
- **C2** `export type IngestionStatus = "IDLE" | "INGESTING" | "FAILED"` in `core/domain/catalog.ts`; type the tracker with it and reference it for the 5 raw literals in `adapters/dynamodb/catalogRepository.ts:95,153,187,208,225` + the decoder at `catalogEntities.ts:378`.
- **Canon:** detect SDK errors via typed exception classes, never name-string casts; closed vocabularies get a named union type, never inline string literals.
- **Prop:** grep `adapters/` for `\.name === "` and `as { name` (other SDK-error casts); grep for the three status literals outside the new type.
- **Verify:** bot `typecheck && lint && test`.

### Unit D — domain types model absence & defaults canonically  [PATTERN] · low risk · ~30 min
- **D1** Remove the dead `| null` from `memoryUpdate` on `ExtractionResult` + `SegmentationResult` — `core/ports/extraction.ts:119,151`. (Port interface only — the zod schema already uses `z.string()` with `""` sentinel; **union budget untouched**.)
- **D2** Make `ingestAttempts` required with a `0`-default in the deserializer; drop the `?? 1` hole-filler — `core/domain/catalog.ts:125`, `adapters/dynamodb/catalogEntities.ts:386`, `app/ingestionSweep.ts:208`.
- **D3** Remove the dead `ParsedGeo.source` field and the 3 `.map(g => ({lat,long}))` strip-transforms it forced — `core/domain/geo.ts:13,52`; `app/ingestionSweep.ts:264,307`; `core/handlers/editReplyHandler.ts:63`.
- **Canon:** one absence value per field (no parallel `null`/`undefined`/`""`); a domain field is required when the system always provides it; no struct field exists only to be stripped.
- **Prop:** covered inline above (each sub-item lists its full set).
- **Verify:** bot `typecheck && lint && test`; **confirm the union-count regression test is green** (D1 sits next to the schema).

### Unit E — claudeExtractor non-schema fixes  [HYGIENE] · low risk · ~10 min
*Kept as its own unit so the 16-union rule stays front-of-mind. Neither item touches `output_config.format`.*

- **E1** Fix the prompt instruction `"else null"` → `"else empty string"` (contradicts the `z.string()`/`""` sentinel) — `adapters/anthropic/claudeExtractor.ts:261`.
- **E2** Drop the dead fallback `this.ladder[0]?.model ?? "claude-haiku-4-5"` → `this.ladder[0]!.model` (ladder is non-empty by construction) — `claudeExtractor.ts:289`.
- **Verify:** bot `typecheck && lint && test` **+ explicitly run the union-count regression test**.

### Unit F — catalogDto: truthful mapping + formatter placement  [HYGIENE] · low risk · ~40 min
- **F1** Remove the `as PropertyListDto` / `as PropertyDetailDto` casts by hoisting the always-required fields out of `compact()` — `core/handlers/catalogDto.ts:24-38,41-77`.
- **F2** Move the pure display formatters (`area`, `formatPrice`, `mapsUri`, `propertyTitle`, `statusBadge`) from `views.ts` into a new `core/domain/display.ts`, breaking the `catalogDto → views → commands` transitive dependency — `views.ts`, `catalogDto.ts:10`.
- **Canon:** DTO mappers never cast away a required-field guarantee; pure display formatters live in `core/domain/`, not in the LINE-view layer.
- **Verify:** bot `typecheck && lint && test`.

### Unit G — delete needless indirection in app/lambda  [HYGIENE] · low risk · ~30 min
- **G1** Remove the redundant `SweepResult.claimed` field (always equals `ingested`; documented-but-impossible divergence) + update the 5 test assertions — `app/ingestionSweep.ts:74-75,137,150,169` and the unit + integration sweep tests.
- **G2** Inline the single-use `createIdempotencyConfig()` factory at its only call site — delete `lib/idempotency.ts:24-26`, inline `new IdempotencyConfig({ eventKeyJmesPath: "webhookEventId" })` at `lambda/processor.ts:91`.
- **Canon:** no single-call wrapper factories; no parallel fields that can never diverge.
- **Verify:** bot `typecheck && lint && test` **+ `npm --prefix packages/bot run test:integration`** (G1 touches the sweep).

### Unit H — infra & build hygiene  [HYGIENE + 1 PATTERN] · low risk · ~40 min
*Infra can't be proven by the unit suite — verified by `pulumi preview` = empty diff (behaviour-neutral) + build.*

- **H1** Update the stale `Pulumi.yaml:3` description ("LINE echo bot…") to the catalog-assistant reality.
- **H2** Move `@pulumi/aws` + `@pulumi/pulumi` from `dependencies` → `devDependencies` — `infra/package.json:8-10`.
- **H3** Move `@vitest/coverage-istanbul` from root `package.json:24` into `packages/bot/package.json` (the only package that runs coverage).
- **H4** Make `@esbuild/linux-x64` platform-neutral (let npm pick the host optional dep, or add `linux-arm64`) — `packages/bot/package.json:30`.
- **H5** [PATTERN] Extract `PROCESSOR_TIMEOUT_SECONDS = 30` (`lambdas.ts:190`) and derive SQS `visibilityTimeoutSeconds: 6 * PROCESSOR_TIMEOUT_SECONDS` (`storage.ts:127`); fix the misleading comment. **Canon:** coupled timeouts are derived from one source, never independently hardcoded.
- **H6** Verify-then-act on the orphaned `assertionPrivateKey`/`assertionKeyId` config + `infra/assertion-public-key.jwk.json` (no consumer found): confirm truly unused, then either annotate as deferred or remove. **Implementer must confirm before deleting.**
- **Verify:** `cd infra && pulumi preview` shows empty diff (H1/H5); `npm run build` (H3/H4); typecheck.

---

## Optional units (bigger or marginal — decide during audit)

- **Unit I — `botLambda()` factory  [PATTERN] · ~45 min.** The 5 Lambda definitions still repeat the
  same `runtime/architectures/handler/publish/loggingConfig` block (`infra/src/lambdas.ts:167-177,185-196,231-245,278-289`, `miniapp.ts:136-150`). A `botLambda(opts)` helper defaulting `publish:true` + `architectures:["arm64"]` removes ~60 lines and enforces the convention. Bigger, infra-only, `pulumi preview`-verifiable.
- **Unit J — merge `LineContentClient` into `LineGateway` · ~20 min.** Single-method port file `core/ports/lineContent.ts` + a separate `deps.content` injection; the impl already lives in `lineGateway.ts`. Fold `getContent` into `LineGateway`, delete the file, drop the second constructor arg (touches `eventProcessor.ts`, `lambda/processor.ts`). Marginal — interface consolidation.

## Considered & rejected (do not re-litigate)

- **Parallelize `deleteListing` deletions** (`catalogAssistant.ts:184-187`) — changes execution semantics (sequential→parallel DynamoDB writes); behavioral, not a simplification. PARK.
- **`rawArchive.ts` → split `S3MediaReader`** — interface segregation with debatable value; the class is small and cohesive. PARK.
- **`sqsPublisher` error message** include `Failed[].Code/Message` — fine but a behavior tweak, not a pattern. Optional, low priority.
- **CloudFront cache-policy UUID → `getCachePolicyOutput`** — already has an explanatory comment; the lookup adds an async data source. PARK.
- **`Environment: staging` tag → `pulumi.getStack()`** — only one stack exists; marginal until a 2nd stack is real. PARK.
- **All domain renames / type redesigns** (`GeoLocation.lat/long`, `ConversationTracker` move, `PropertyEvent`→`FollowUp`, `Property` flat-bag, `QueuePublisher<T>` generic, `nowIso→nowMs` port-signature change, `JSON.parse` structural guards, miniapp fetch timeout / `useFetch` / `<dialog>` a11y) — out of scope here; tracked in `plans/15-deferred-domain-type-safety-and-naming.md`.

  > Note: `nowIso→nowMs` (port `findPendingConversations`/`findDueEvents`) is a real pattern win
  > ("time params are epoch-ms everywhere") but it's a port-signature change touching the adapter + 2
  > callers — promote it from plan 15 into a unit here only if the audit wants it.

---

## Tally for audit

| Unit | Items | Tag | Risk | Effort |
|---|---|---|---|---|
| A miniapp | 6 | HYGIENE | very low | ~20m |
| B line view | 2 | PATTERN | low | ~20m |
| C typed errors/status | 2 | PATTERN | low | ~25m |
| D domain absence/defaults | 3 | PATTERN | low | ~30m |
| E extractor non-schema | 2 | HYGIENE | low | ~10m |
| F catalogDto | 2 | HYGIENE | low | ~40m |
| G app/lambda indirection | 2 | HYGIENE | low | ~30m |
| H infra/build | 6 | HYGIENE+1 PATTERN | low | ~40m |
| **Core total** | **25** | | | **~3.5h** |
| I botLambda (optional) | 1 | PATTERN | low | ~45m |
| J LineContentClient (optional) | 1 | — | low | ~20m |

**Recommended cut to hit ~14-16 audited items:** keep A–E + H (the PATTERN-heavy, highest-leverage
core); treat F, G, I, J as a second wave. But that's the audit's call — that's what the checkboxes are for.
</content>
</invoke>
