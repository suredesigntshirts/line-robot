# Plan 23 — resume prompt (paste after clearing context)

> Paste the block below to continue implementing plan 23, ONE small-blast-radius unit at a time.
> It assumes ZERO memory — everything it needs is on disk.

---

You are continuing the implementation of `plans/23-ingestion-pipeline-audit/` (ingestion-pipeline
audit). You have zero prior context; everything is on disk. Work in SMALL blast-radius units — build
exactly ONE unit this turn, then stop for review.

**Orient (read in this order):**
1. `plans/23-ingestion-pipeline-audit/IMPLEMENTATION-STATUS.md` — what's DONE vs LEFT, and the process
   learnings. This is the source of truth for what to do next.
2. `plans/23-ingestion-pipeline-audit/00-CONSOLIDATED-sequencing.md` — phase order + the cross-group
   conflict register (esp. **CR-1**: do not parallel-edit `packages/bot/src/app/pipelineV2Sweep.ts`).
3. The specific group artifact for the unit you pick (e.g. `group-b-image-stage-rewrite.md`,
   `group-d-dm-group-unification.md`).
4. Root `CLAUDE.md` — quality cadence + the **"For model-facing changes"** real-API rule + the
   anti-over-engineering rules. `packages/db/CLAUDE.md` for any migration.

**Pick the next unit:** the smallest, lowest-blast-radius LEFT unit in `IMPLEMENTATION-STATUS.md` §3
that has no unmet dependency (respect CR-1 ordering on the sweep file). If a unit is large (e.g. the
image-stage rewrite), build only its first sub-step. If a unit is founder-gated (Phase 5, or marked
"founder call"), do NOT build it — list it and stop.

**Build it with the discipline that caught our bugs (non-negotiable):**
1. Implement the smallest correct change. Honor hexagonal boundaries (no adapter imports in
   `packages/pipeline` core) and the anti-over-engineering rules.
2. **Free gate:** `npm run typecheck`, `npm run lint` (Biome), `npm run test`, coverage — all green.
3. **If the change is model-facing** (prompts, extraction/segmentation/dedup/gate logic, schemas, or
   anything altering what the LLM sees/returns): run **real-API validation** —
   `EVAL_LLM=anthropic npm run eval` and/or the relevant real-model Docker integration test in
   `packages/pipeline/test/integration/*.e2e.test.ts` — and **iterate until the behavior is actually
   correct.** Make tests assert the REAL persisted effect (DB rows/geom), never a proxy like a prompt
   string. The oracle/`FakeStepLlm` fakes pass green by construction — they are NOT validation.
   (There is a founder ANTHROPIC_API_KEY in repo-root `.env`; live runs cost cents.)
4. **Adversarial audit (for any correctness-critical unit):** spawn a fresh-context sub-agent told to
   "assume idiots wrote this, it is full of bugs; review the CODE ONLY — do NOT read plans/ or design
   docs or CLAUDE.md; find concrete defects with file:line, severity, a failing scenario, and a fix."
   Verify its findings yourself against the real code (it may overstate); fix the real ones.
5. **Migrations:** domain-enum-first if an enum changes, then `npm run generate -w @line-robot/db`,
   then hand-fix per `packages/db/CLAUDE.md` (geography quoting, postgis extension).
6. **Commit** the unit (focused message, reference the plan unit id). Commit to `main`.
7. **Update `IMPLEMENTATION-STATUS.md`:** move the unit to §1 DONE with its commit; add any new
   learning to §4; note any new follow-up in §3.
8. **Stop.** Report: the unit built, gate/validation results (incl. real-API if run), what the
   adversarial audit found + how you resolved it, and the single next unit. Do not start another unit.

**Guardrails:** read-only on staging (never mutate); migrations go through drizzle + the hand-fixes;
if a unit needs a founder decision (a divergence, a flag default, enabling PII capture), surface it and
stop rather than guessing.
