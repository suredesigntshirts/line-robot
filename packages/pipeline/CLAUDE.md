# CLAUDE.md — packages/pipeline (LLM extraction pipeline + eval)

- **Six steps, in `src/run.ts`:** classify (images) → segment (transcript) → extract → dedup → translate →
  gate, writing the catalog to Postgres through the `@line-robot/db` barrel. Failure semantics: a failed
  segment is dropped and reported; a failed gate or hard blocker queues a `moderation_item`; dedup failure
  means "new"; translate failure skips the row. Partial success is normal.
- **Ports only at the real seams** (`src/ports.ts`): the LLM (`StepLlm`), the DB, media. Adapters live in
  `src/adapters/` (Anthropic + the fakes/oracle the tests use). No other abstractions.
- **Model-facing changes are validated on the real API.** Prompts, schemas, segmentation/dedup/gate logic,
  model tiers: run `EVAL_LLM=anthropic npm run eval` (advisory, D21 — read the delta, regenerate
  `eval-baseline.json` once the behaviour is confirmed right) and the Docker + real-model integration tests
  (`test/integration/*.e2e.test.ts`). The fakes pass green by construction; two CRITICAL merge/geo bugs hid
  under them until the real model exposed them.
- **Anthropic strict structured output caps a schema at 16 nullable/union params.** Exceeding it 400s
  every call (the plan-12 outage). Text fields use `""` sentinels and lists `[]`; keep `.nullable()` for the
  few numbers. A regression test guards each schema.
- **Dedup thresholds** live in `src/dedup/config.ts`, env-overridable (`DEDUP_GEOHASH_PRECISION` 6,
  `DEDUP_GEO_RADIUS_M` 1000, `DEDUP_TRIGRAM_THRESHOLD` 0.55, `DEDUP_JACCARD_THRESHOLD` 0.50,
  `DEDUP_BLOCK_CAP` 8, merge floors `DEDUP_MERGE_SCORE_FLOOR` / `DEDUP_MERGE_CONFIDENCE_FLOOR`). Geo is
  REQUIRED to auto-merge; weak merges go to moderation, never a silent fold. Retune via the scorecard.
- **Eval:** `npm run eval` runs `src/eval/runner.ts` over the synthetic cases + the Tier-A fixtures
  (`goldenSet/tierA/`). `EVAL_LLM=oracle` (default) is a harness smoke. `EVAL_CACHE=1` reuses frozen
  responses (`.eval-cache/`, gitignored); `EVAL_CONCURRENCY` bounds parallel cases.
- **Seed:** `DATABASE_URL=… npm run db:seed` (`src/seed/`) loads synthetic listings + groups and grants
  publish consent to two of every three, so the public site has data while the consent gate stays exercised.
- **Batch transport** (`src/batch/`) is built and was proven on staging, but the live sweep is not routed
  through it (A4d — `STATUS.md` Deferred).
