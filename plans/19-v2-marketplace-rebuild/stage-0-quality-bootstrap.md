# Stage 0 — Quality Bootstrap

**Spec status: FLESHED — pending founder approval.** (Lifecycle: skeleton → fleshed spec → approval → build with increment reviews → stage gate → retro.) Built in an unattended overnight sprint: commit straight to `main`, full autonomy, no founder input mid-build. Every decision below is resolved — no TBDs.

## Purpose

Stand up the quality workflow before any product code exists, so every later stage is built under the same adversarial discipline. Encode the process into durable artifacts — two project skills, repo `CLAUDE.md` rules, and an `npm run eval` scaffold — so the workflow is automated, not remembered. Also run the **v1-spine first-principles re-audit (D24)**: fresh-context agents review the layer the master plan proposes to keep, so it survives on evidence, not by default; the audit doubles as the inaugural exercise of the new machinery. Corresponds to master plan §5.3, D21–D24, D25.

## Decisions (resolved from skeleton open questions)

| # | Question | Resolution | Rationale |
|---|---|---|---|
| Q1 | Skill file path/format | `.claude/skills/<name>/SKILL.md`: YAML frontmatter (`name`, `description`, `disable-model-invocation: true`) + markdown body; supporting files referenced by relative path. | Matches every installed skill on this harness (`~/.claude/skills/*/SKILL.md`); de-facto Claude Code convention. `disable-model-invocation` keeps these explicit `/`-invoked, not auto-fired. |
| Q2 | Skill output format | **Markdown report, one section per reviewer, then a verdict-summary block.** No JSON. | Reports are read by the founder and pasted into PRs; markdown is the native medium of the existing `.claude/workflows/*` reports. |
| Q3 | Where simplicity-critic / anti-over-eng rules live | **Canonical copy in `CLAUDE.md` quality-rules section**; the skill loads it via `Read CLAUDE.md` at review time and inlines the list. | Single source of truth; skill stays thin and rules are visible to humans editing `CLAUDE.md`. |
| Q4 | Eval runner location | **`packages/pipeline/` from day one** (`packages/pipeline/src/eval/`). | Master plan §4.2 already names `packages/pipeline` as the pipeline+eval home; Stage 2 builds in the same package — no later move. A new minimal workspace is cheap; a top-level `eval/` would be the move Stage 1 avoids. |
| Q5 | Eval run config file? | **Yes, minimal: `packages/pipeline/eval.config.ts`** exporting `{ model, temperature, scoreThresholds }` with sane defaults; runner reads it. Batch size deferred to Stage 2. | A typed config is the seam the scorecard needs; over-spec'ing knobs nobody sets violates our own anti-over-eng rule, so keep it to the three fields Stage 2 will actually set. |
| Q6 | Golden set timing (founder update) | **Synthetic-first.** Tier A (real hand-verified chats) **parked indefinitely**; eval scaffold consumes **Tier B synthetic cases** from the Stage 1 generator. Scaffold ships with a typed `EvalCase[]` loader returning `[]` until Stage 1/2 supply cases. | Founder deferred hand-labeling; synthetic ground-truth-by-construction (§5.1) is the only source for the foreseeable sprint cycle. Scorecard shape is fixed now so Stage 2 only adds cases. |
| Q7 | `/alignment-review` register source | **Real register, no stub.** Loads `docs/research/00-product-principles.md` §4 (134 heuristics, exists now) + the canonical-merge table; maps changed-surface → context groups. | Register is live; skeleton's stub-fallback is obsolete. |
| Q8 | Spine-audit immovable constraint (founder) | v2 deploys **OVER v1's external endpoints**: same CloudFront domain = LIFF endpoint, same ingest Function URL = webhook. Audit treats both URLs as **immovable** (LINE console settings cannot change). | Hard external constraint; any "rebuild" verdict must preserve these exact entry URLs or it's out of bounds. |
| Q9 | Eval gating posture | **Advisory only (D21).** Runner prints scorecard + delta vs baseline, exits 0 even on regression. | Founder judges regressions; never block the overnight sprint. |
| Q10 | Reviewer agents | Use the `Agent` tool with `subagent_type: Explore` (read-only) for the three reviewers + skeptic, spawned fresh per invocation (no shared context with the author). | Read-only review must not mutate code; fresh context is the whole point of the panel. |

## Increments

Each increment is a PR-sized unit; its own `/increment-review` runs before the next starts (the skill reviews itself once it exists — Increment 1 is reviewed manually/by skeptic only).

### Increment 1 — `/increment-review` skill
- **Deliverables:** `.claude/skills/increment-review/SKILL.md` (frontmatter + body); supporting `reviewer-prompts.md` (the three reviewer briefs + skeptic brief).
- **Behavior:** takes an optional diff ref (default `git diff main...HEAD`, else working tree) + a stage-spec path arg. Spawns four fresh `Explore` agents in parallel:
  1. **Spec auditor** — diff vs named stage spec; verifies every acceptance criterion; flags scope drift both directions.
  2. **Correctness reviewer** — bugs, edge cases, error paths, untested branches.
  3. **Simplicity critic** — hunts one-caller abstractions, single-impl interfaces, premature generality, config nobody sets (loads anti-over-eng rules from `CLAUDE.md`); findings weighted as bugs.
  4. **Skeptic** — re-checks the other three's findings against the actual code; drops unsupported ones, flags judgment calls for the founder.
- **Output:** one markdown report per reviewer + a final `## Verdict` block (PASS / CHANGES-REQUESTED / NEEDS-FOUNDER, with the skeptic-survived findings).
- **Files:** `.claude/skills/increment-review/{SKILL.md,reviewer-prompts.md}`.
- **Acceptance:** invoking `/increment-review` on a trivial one-line diff produces three distinct reviewer reports + skeptic summary + verdict, no error; reviewers are read-only (no file writes).
- **Its review checks:** (skeptic-only, since the skill reviews itself) — that the four briefs are distinct and that the spec-auditor brief actually names §5.3's panel.

### Increment 2 — `/alignment-review` skill
- **Deliverables:** `.claude/skills/alignment-review/SKILL.md` + `context-map.md` (changed-surface → §4 context-group table).
- **Behavior:** reads `docs/research/00-product-principles.md` §4 + canonical-merges; given a diff/surface description, picks applicable context groups (Schema / Pipeline+gate / Card+detail UI / Search / Typography+i18n / Bot+consent / Dealflow / Architecture); for each heuristic ID in those groups emits **pass / violation / n-a** with a one-line reason; resolves duplicates to the canonical ID.
- **Output:** markdown table grouped by context, then a `## Violations` rollup.
- **Files:** `.claude/skills/alignment-review/{SKILL.md,context-map.md}`.
- **Acceptance:** running `/alignment-review` describing a "listing card" change reports against the Card+detail context IDs (CONV-04/05/06, COPY-04/06/10/11, TH-03/04/05, …) with a verdict each and no off-context IDs; cites canonical IDs for merged rules.
- **Its review checks:** spec auditor confirms it loads the *real* 134-heuristic register (not a stub) and that the context map covers all eight §4 contexts.

### Increment 3 — `CLAUDE.md` quality-rules section
- **Deliverables:** new `## Quality system (Stage 0 onward)` section in repo `CLAUDE.md`.
- **Content:** review cadence summary (every-change free checks → per-increment panel → per-stage gate, per §5.3); **anti-over-engineering rules** enumerated (no interface until a 2nd implementation exists; ports only at real seams — LLM/DB/LINE; no one-caller abstractions; no config nobody sets; deliverable is code a human reads without a guide); pointers to both skills and to `npm run eval`; pointer to `docs/research/00-product-principles.md` as the alignment register.
- **Files:** `CLAUDE.md`.
- **Acceptance:** section present, cadence matches §5.3, all five anti-over-eng rules listed, both skills + eval + register referenced by path.
- **Its review checks:** spec auditor diffs the cadence text against master-plan §5.3 verbatim claims; simplicity critic ensures it's a summary+pointers, not a duplicated essay.

### Increment 4 — eval-runner scaffold (`npm run eval`)
- **Deliverables:** new `packages/pipeline` workspace (`package.json`, `tsconfig.json`, vitest-free standalone `tsx` entry); `packages/pipeline/src/eval/{runner.ts,scorecard.ts,cases.ts,scoring.ts}`; `packages/pipeline/eval.config.ts`; root `package.json` `"eval": "npm run eval -w @line-robot/pipeline"` (and a pipeline `"eval": "tsx src/eval/runner.ts"`).
- **Structure (synthetic-first):**
  - `cases.ts` — `loadCases(): EvalCase[]` returns `[]` (Tier A parked; Tier B injected by Stage 1/2). `EvalCase = { id, tier: 'A'|'B', transcript, expected }`.
  - `scoring.ts` — per-field scorer **stubs** with documented shapes: exact-match (enums/strings), numeric-with-tolerance, fuzzy/LLM-judge (free text); plus segmentation (property-count, photo-attribution) and dedup (pair precision/recall) score stubs.
  - `scorecard.ts` — fixed output schema: per-step + per-field aggregate scores, case count, pass/fail, **API cost per run** (stub `0`), and delta-vs-baseline (baseline file path reserved, none committed yet).
  - `runner.ts` — loads config + cases, runs scorers, prints scorecard, **always exits 0** (D21 advisory).
- **Files:** as above; root `package.json`, root `tsconfig` references if needed.
- **Acceptance:** `npm run eval` prints `0 cases, 0 failures` scorecard incl. a `cost: $0.00` line and exits 0; `npm run typecheck`/`lint` stay green; scorecard schema documented in `scorecard.ts` so Stage 2 populates without redesign.
- **Its review checks:** simplicity critic guards against premature scorer machinery (stubs only, no real model calls); spec auditor confirms the scorecard schema names every step the Stage 2 pipeline (classify→segment→extract→dedup→translate→gate) will score.

### Increment 5 — v1-spine first-principles re-audit (D24)
- **Deliverables:** `plans/19-v2-marketplace-rebuild/stage-0-spine-audit.md`.
- **Method:** one fresh-context `Explore` agent per kept component, each answering "designed from zero for v2, would this differ?" — **treating v1's external endpoints as immovable (Q8)**: the CloudFront LIFF domain and the ingest Function URL webhook are fixed; verdicts may rebuild internals but not these entry URLs.
- **Components (master-plan §7):** webhook handler (`lambda/ingest.ts`), signature verify (`adapters/line/signatureVerifier.ts`), SQS spine (`adapters/queue/sqsPublisher.ts` + processor wiring), processor (`app/eventProcessor.ts`/`lambda/processor.ts`), debounce/sweep scheduling (`app/ingestionSweep.ts`/`lambda/sweep.ts`), idempotency (`lib/idempotency.ts`), LINE adapters (gateway, webhook parser, rich menu), S3 raw archive (`adapters/s3/rawArchive.ts`).
- **Output per component:** KEEP (with written justification) or REBUILD (with the finding + which Stage 1/2 spec absorbs it). A summary table; rebuild rows cross-referenced as open questions into the affected stage spec.
- **Files:** `stage-0-spine-audit.md`; edits to `stage-1`/`stage-2` specs' open-questions for any REBUILD.
- **Acceptance:** every §7 kept component has exactly one verdict + justification; no component "kept" silently; every REBUILD appears in a downstream stage's open questions; the immovable-endpoint constraint is stated and respected in every verdict.
- **Its review checks:** spec auditor confirms full §7 coverage and that no verdict proposes changing the LIFF domain or webhook URL.

## Stage gate checklist

- [ ] Free checks green: `npm run typecheck`, `npm run lint` (Biome), `npm run test`.
- [ ] `/increment-review` runs end-to-end on a sample diff → 3 reports + skeptic + verdict.
- [ ] `/alignment-review` runs on a sample surface → per-ID pass/violation/n-a against the real register.
- [ ] `npm run eval` exits 0 with `0 cases, 0 failures` + cost line.
- [ ] `CLAUDE.md` quality section present, cadence matches §5.3, 5 anti-over-eng rules listed, both skills + eval + register linked.
- [ ] `stage-0-spine-audit.md` complete: verdict+justification per §7 component; REBUILDs threaded into Stage 1/2; endpoints treated immovable.
- [ ] High-effort review of Stage 0's own full diff confirms **no scope creep into product code** (no schema, pipeline, or UI).
- [ ] No Playwright smoke (Stage 0 is not user-facing).
- [ ] Retro notes appended below.

## Risks

- **Self-review blind spot** — Increment 1 can't `/increment-review` itself before it exists; mitigated by skeptic-only review + the meta-check in its acceptance criteria.
- **`packages/pipeline` path bet (Q4)** — if Stage 1 renames the package, the eval scaffold moves; low cost (4 stub files) and master-plan §4.2 already commits to the name.
- **Stub scorers drift from real schema** — scorecard schema is frozen now from the §4.3 six-step pipeline; if Stage 2 adds a step, scorecard gains a field (additive, non-breaking).
- **Immovable-endpoint constraint** — if a spine REBUILD verdict secretly needs a new URL, it's infeasible; the audit acceptance criterion forces this surfaced, not buried.
- **Reviewer agent cost/time** — four parallel Explore agents per increment; acceptable for the panel value, bounded by read-only scope.

## Iteration log

| Date | What changed | Why |
|---|---|---|
| 2026-06-12 | Added v1-spine first-principles re-audit (D24) to scope | User chose "hybrid + spine re-audit" over keep-by-default |
| 2026-06-12 | Skeleton → fleshed for overnight sprint: all 5 open questions resolved (Q1–Q5), founder updates folded in — synthetic-first evals (Tier A parked, Q6), real 134-heuristic register no stub (Q7), immovable v1 endpoints constraint on the audit (Q8); restructured into 5 numbered increments with acceptance criteria + per-increment review checks; header set to FLESHED | Sprint runs unattended tonight with full autonomy, commit-to-main; spec must be executable with zero founder input, so nothing may remain a TBD |
