# `plans/cleanup/` — the cleanup-sprint dossier

This folder is the complete, self-contained planning dossier for a **code-quality cleanup sprint** on
`line-robot`. It was produced **entirely by read-only multi-agent analysis** — no source file was
touched while generating it. The output is a set of findings reports plus, in [`changes/`](./changes/),
nine ready-to-implement refactor specs and one ordered implementation queue.

Generated against baseline commit **`b5d12a4`** (branch `feat/catalog-assistant`, 2026-06-08).

> **Start here:** [`changes/00-implementation-queue.md`](./changes/00-implementation-queue.md) — the
> ordered, conflict-free plan a single agent executes one unit at a time.

---

## How this folder was made

Three saved workflows in [`.claude/workflows/`](../../.claude/workflows/) produced it, in sequence.
Each is a deterministic fan-out script (see the [Workflow tool] orchestration model): parallel agents
do read-only analysis, then a synthesis/reconcile agent consolidates. Re-running any stage with the
same inputs reproduces the same shape of output.

### Stage 1 — `cleanup-analysis.js` → the layer findings (`00`–`08`)
A static, layer-by-layer audit of the **current** source.

- **8 parallel agents**, one per architectural area (domain+ports, handlers, app+lambda, AI+storage
  adapters, LINE+infra adapters, miniapp, infra+build, cross-cutting). Each read every file in its
  scope and wrote numbered findings (`F01`, `F02`, …) with severities and file:line citations.
  → `01-domain-ports.md` … `08-cross-cutting.md`
- **1 synthesis agent** deduped across all eight, grouped findings into themes, assigned P1/P2/P3
  priorities, and wrote the master plan. → `00-master-plan.md`

### Stage 2 — `cleanup-commit-review.js` → the epoch design-debt reports (`epoch-*`, `09`)
A *diff-based* review: not "what does the code look like now" but "what shortcuts were introduced when
each feature was built". The git history `ae0debb..HEAD` was sliced into 8 feature epochs (A–H).

- **8 parallel agents**, one per epoch, each reviewing that epoch's `git diff` for design debt
  introduced at that increment. → `epoch-A-foundation.md` … `epoch-H-plan14.md`
- **1 synthesis agent** found debt seeded early and never cleaned up, patterns recurring across 3+
  epochs, and the **highest-leverage refactors**. → `09-epoch-design-debt.md`

### Stage 3 — `cleanup-strategize.js` → the implementation specs (`changes/`)
Turns the findings into executable specs. The 9 **change-units** are the 5 mandatory "highest-leverage
refactors" from `09-epoch-design-debt.md` plus 4 curated additions (units 06–09) selected for
architecture / data-integrity value. The unit list is hard-coded at the top of the script — edit it to
retarget the sprint.

Per unit, a two-stage pipeline (no barrier — each unit advances independently):

1. **Map** — an `Explore` agent (**Sonnet**) maps the *complete* blast radius: every symbol, call-site,
   import, test, and constraint the change ripples to.
2. **Strategy** — an **Opus** agent verifies that map against live source and writes one self-contained
   spec (`changes/<id>-<slug>.md`) — current code, target design, mechanical step-by-step, tests,
   verification commands, rollback, and any escalated design fork.

Then a single **Reconcile** agent (**Opus**) built a cross-unit conflict matrix, **auto-fixed
mechanical conflicts by editing the specs** (unifying helper names, pinning land-order, mapping
disjoint edit regions), escalated genuine design forks, and wrote the ordered queue.
→ `changes/00-implementation-queue.md`

*This stage's run: 19 agents, ~1.9M agent tokens, ~17 min wall-clock.*

[Workflow tool]: the scripts live in `.claude/workflows/` and are launched with the Workflow tool
(`Workflow({name: "cleanup-analysis"})` etc.). They are also exposed as the `/cleanup-analysis`,
`/cleanup-commit-review`, and `/cleanup-strategize` skills.

---

## File inventory

| File | Stage | What it is |
|---|---|---|
| `00-master-plan.md` | 1 | Themed, P1/P2/P3-prioritized master cleanup plan (the synthesis of `01`–`08`). |
| `01-domain-ports.md` … `08-cross-cutting.md` | 1 | Per-layer static findings (severities + file:line). |
| `09-epoch-design-debt.md` | 2 | Cross-epoch debt synthesis + the highest-leverage refactors. |
| `epoch-A-foundation.md` … `epoch-H-plan14.md` | 2 | Per-epoch diff design reviews (`D01`, `D02`, …). |
| `changes/01-…` … `changes/09-…` | 3 | The nine self-contained, ready-to-implement refactor specs. |
| `changes/00-implementation-queue.md` | 3 | **The ordered execution plan** — sequence, dependency graph, auto-resolved conflicts, escalated decisions, ready checklist. |
| `README.md` | — | This file. |

---

## Status & how to use it

- **All escalated decisions are resolved.** The only genuine design fork — **D1** (`collectUpcomingRows`
  placement, unit 03) — was resolved to **Option A (defer it)**, user-confirmed 2026-06-08. All 9 units
  are ready to implement.
- **Execution:** follow `changes/00-implementation-queue.md` order, implementing **one unit at a time**,
  running `npm run typecheck && npm run lint && npm run test` after each (plus
  `npm --prefix packages/bot run test:integration` after unit 06, the only persistence change).
- **Hard constraint every unit respects:** the Anthropic strict-output **≤16 nullable/union** schema
  limit (see the repo `CLAUDE.md`). No unit touches `claudeExtractor.ts`'s `output_config.format`
  schema; the union-count regression test stays green throughout.

### Regenerating or extending
- **Re-audit after changes land:** re-run `Workflow({name: "cleanup-analysis"})` and
  `Workflow({name: "cleanup-commit-review"})` (update the epoch ranges in the latter to include new
  commits).
- **Re-plan / add units:** edit the `units` array at the top of `.claude/workflows/cleanup-strategize.js`
  (add/remove units, retarget files), then re-run `Workflow({name: "cleanup-strategize"})`. It rewrites
  `changes/` and the queue.
- The reports reflect the codebase **as of `b5d12a4`** — treat findings as stale once the referenced
  files change, and re-run the relevant stage.
