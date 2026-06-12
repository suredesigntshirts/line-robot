# Sprint 01 — Overnight Autonomous Build (2026-06-12 → 13)

**Authorized by founder 2026-06-12.** Claude orchestrates unattended for ~5–8h; the founder is not reachable. This charter is the contract for what happens, what may happen, and what must not happen.

## Scope & order

Build pre-approved FLESHED specs only, in order; a stage gate (heavy review) must pass before the next stage starts:

1. **Stage 0** — quality bootstrap: `/increment-review` + `/alignment-review` skills, eval scaffold (synthetic-first), v1-spine re-audit dossier, CLAUDE.md rules.
2. **Stage 1** — data foundations: RDS Postgres (db.t4g.micro + PostGIS, additive to existing stack), packages/domain + packages/db (drizzle), full marketplace schema + migrations, synthetic generator, pluggable seed-ingestor + fixtures, Docker-Postgres integration tests.
3. **Stage 2** — extraction pipeline v2: six-step pipeline, synthetic-first evals + scorecard, hybrid sync/batch, DF-6 completion loop, image derivatives, cutover of catalog writes to Postgres.
4. **Stage 3** — shared UI (only if time remains): packages/ui token architecture (placeholder values; founder picks the design direction in the morning), core listing components, dual-theme from the start.

**Founder rulings shaping the night:** golden set Tier A deferred (evals synthetic-only); seeding = synthetic + pluggable ingestor (seed-scale, clean sources, no ToS-violating scraping); commit straight to main; full autonomy incl. IAM.

## Hard guardrails (never violate)

- **Immovable URLs**: the LINE webhook ingest Function URL and the mini-app CloudFront domain (LIFF endpoint) must keep working as URLs — LINE console settings cannot be changed. Code behind them may be replaced (v1 is disposable); the URL-bearing resources are never deleted/recreated.
- **Pulumi**: changes to the existing staging stack are ADDITIVE or explicit v2 replacements per spec — never a blanket destroy; `pulumi preview` is read before every `up`, and any unexpected delete/replace of a URL-bearing resource aborts the deploy → BLOCKERS.md.
- **IAM (full autonomy granted, used minimally)**: admin profile only when a specific named permission blocks; smallest possible addition; every change logged in SPRINT-LOG.md with before/after.
- **Spend**: new AWS resources ≈ RDS t4g.micro + storage (~$15–20/mo). Nothing larger without a spec saying so. Anthropic usage: synthetic generation + eval runs, batch-priced where possible.
- **Secrets**: never into the repo; DB password = generated, stored as Pulumi config secret; passphrase stays in its 0600 file.
- **plans/ and docs/research/** are spec/reference: build code may not silently diverge — divergence = spec edit with iteration-log entry, or BLOCKERS.md.

## Quality loop (per master plan §5.3)

- Every increment: typecheck + lint + unit tests, then the 3-reviewer panel (spec auditor / correctness / simplicity critic) with skeptic verification; design-bearing increments also run /alignment-review against the heuristic register.
- Every stage gate: high-effort full-diff review, architecture conformance, eval scorecard (advisory), docs updated.
- Findings get fixed before moving on; rebuttals recorded.

## When blocked

Park it: write the blocker (what, why, exact error, what was tried) to **BLOCKERS.md**, pick the next non-dependent task. Never wait, never guess at founder intent, never disable a failing check to proceed. If both Stage paths are blocked, fall back to: more synthetic corpus coverage, more component-gallery breadth, test depth.

## Morning deliverables

- **SPRINT-LOG.md** (repo root): chronological — increments completed, review findings + resolutions, decisions made within spec bounds, IAM/infra changes, costs incurred, eval scorecard.
- **BLOCKERS.md**: anything parked, with enough context to unblock in one founder action.
- Committed work on `main` (per founder ruling), one commit per reviewed increment.
- From the parallel mood-board workflow: `docs/design/design-direction.md` + 3 token candidates → founder picks a direction over coffee (Stage 3 token swap is a single-file change).
- Anything requiring founder taste/approval queued as questions, not guessed.

## Parked (not tonight)

Golden set Tier A labeling; broker-group validation questions (§5 of the register); design-direction choice; ~~Stage 4+ (website, mini-app rebuild, groups/dealflow, AVM)~~ **superseded by the extension below**; production hardening of DB network posture (documented staging posture: public + forced TLS + strong creds).

## Sprint extension — approved 2026-06-13 ~02:39

Founder (verbatim): *"After stage 3 is done. We need to work on the other stages until 8:30am. We
need to update the plan to continue to work and iterate on what we can to use this extra time
after stage 3 is done. I want to work on as many things as possible until 8:30am. I approve this.
Commit it to plans."*

Stages 0–3 closed their gates ahead of schedule, so the original charter's "Stage 4+ parked"
ruling is lifted for the remainder of the night. Extension scope, in priority order:

1. **Eval harness truth fix** (in flight at approval time): synthetic `expected` now reflects what
   the transcript actually states (deed/urgency misses were harness bugs, not model failures);
   real-model baseline re-measured and rewritten deliberately.
2. **Stage 4 (public website) — flesh + build what is buildable unattended.** The skeleton's open
   questions get defensible defaults recorded in the spec's iteration log (founder can overrule in
   the morning — all cheap to change). Build proceeds domain-agnostic: Astro 6 SSR app per the
   DF-2 spike, browse/search/detail with Stage 3 components, SEO (JSON-LD, sitemap, hreflang),
   Pulumi resources coded + preview only. **Parked for founder:** domain (D19), LINE Login
   console config, Google OAuth verification, the deploy itself.
3. **Flip de-riskers interleaved** (background-friendly): Message Batches live acceptance,
   sharp-on-Lambda packaging, translate/gate eval coverage, Q-SA1 SQS timeout algebra.
4. Stages 5–7 remain out of reach tonight; not started.

Same quality loop applies (increment panels, alignment review on design-bearing increments, stage
gate if Stage 4 completes — it likely won't; partial work is committed increment-by-increment, each
leaving `main` shippable). Hard guardrails above remain in force, unchanged: immovable URLs,
additive-only Pulumi, no secrets in repo, 85/95% usage protocol, wrap to a clean endpoint by 8:30.
