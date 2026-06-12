# Stage 0 — Quality Bootstrap

**Spec status: SKELETON.** This document is fleshed into a full spec, iterated with the user, and approved before any code for this stage is written. (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

## Purpose

Establishes the quality workflow infrastructure before any product code is written, ensuring every subsequent stage builds under the same adversarial review discipline. Encodes the process into durable project artifacts — a project skill, CLAUDE.md rules, and an eval-runner npm script — so the workflow is automated and repeatable rather than remembered. Also runs the **v1-spine first-principles re-audit (D24)**: the layer the master plan proposes to keep is reviewed from zero by fresh-context agents, so it is kept on evidence rather than by default — and the audit doubles as the inaugural exercise of the new review machinery. Corresponds to master plan §5.3 and D22/D23/D24.

## Scope

**In:**
- `/increment-review` project skill written to `.claude/skills/` (or `.claude/` per harness convention) — invokes the three-reviewer panel (spec auditor, correctness reviewer, simplicity critic) plus skeptic-verification pass as described in master plan §5.3
- `/alignment-review` project skill (D25) — loads the heuristic register from `docs/research/00-product-principles.md` (+ relevant artifact) and judges screens/flows/copy/schema per heuristic ID (pass / violation / not-applicable); runs on design-bearing increments and user-facing stage gates. Depends on the research program's capstone existing; if research is still in flight, the skill ships with a stub register and is finalized when the capstone lands
- Quality rules section added to repo `CLAUDE.md` (anti-over-engineering rules, review cadence summary, pointer to the skill)
- Eval-runner npm script scaffold: `npm run eval` wired up in root `package.json`; the runner file exists with stub structure (step harness, per-field scorer stubs, scorecard output) but no real golden cases yet — golden set is Stage 2
- **v1-spine re-audit (D24)**: fresh-context agents review each kept component (webhook handler, signature verify, SQS spine, processor, debounce/sweep scheduling, idempotency, LINE adapters, S3 archive) against the question "designed from zero for v2, would this differ?" — one keep-or-rebuild verdict per component with justification, written to an audit dossier in this directory; rebuild verdicts feed the Stage 1/2 fleshed specs
- Stage gate review of Stage 0 itself

**Out (explicitly):**
- Real golden set / eval cases (Stage 2)
- Synthetic data generator (Stage 1)
- Any pipeline, schema, or product code (Stages 1–7)

## Key deliverables

1. `.claude/skills/increment-review` skill file — runnable, invokes the three-agent panel
2. Updated `CLAUDE.md` quality-rules section (cadence, anti-over-engineering rules, pointer to skill)
3. `packages/pipeline/src/eval/runner.ts` (or equivalent path) — stubbed eval runner with `npm run eval` wired
4. Scorecard output format documented in the runner (fields, per-step score shape) so Stage 2 can populate it without redesigning
5. Spine audit dossier (`stage-0-spine-audit.md` alongside this doc): per-component keep/rebuild verdict + justification; rebuild items cross-referenced into Stage 1/2 open questions
6. Stage-gate review notes appended to this doc

## Dependencies

- No prior stages required — Stage 0 is the prerequisite for everything else
- No external/manual steps

## Acceptance criteria (sketch)

- Running `/increment-review` against a trivial one-line diff produces three distinct reviewer reports and a skeptic-verification summary without error
- `npm run eval` exits cleanly with a printed "0 cases, 0 failures" scorecard (stub, no golden set yet)
- `CLAUDE.md` quality-rules section is present and accurately describes the cadence in master plan §5.3
- Anti-over-engineering rules are enumerated (no interface until second implementation; ports only at real seams; no one-caller abstractions)
- Spine audit dossier exists with a verdict for every kept component listed in master plan §7; no component is "kept" without a written justification; any rebuild verdict appears as an open question in the affected stage's spec
- Stage gate: high-effort review of Stage 0's own diff confirms no scope creep into product code

## Open questions (resolve when fleshing this spec)

- Exact file path and format the harness expects for a project skill — confirm `.claude/skills/` vs another location
- What the skill's output format should be: structured JSON, markdown report, or inline chat stream? Determines how findings are relayed to the user
- Where simplicity-critic rules live: inline in the skill prompt, a separate rules file, or in `CLAUDE.md`? (Must be in a place the skill can reliably load them at review time)
- Whether the eval runner lives under `packages/pipeline/` from day one or a top-level `eval/` package — depends on final package layout decision in Stage 1; the Stage 0 stub should not prematurely commit to a path that Stage 1 will move
- Does the eval runner need a config file per eval run (model, temperature, batch size) or is that deferred to Stage 2?

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), docs updated.

Stage-0-specific review notes:
- The spec auditor on Stage 0's own increments checks that the skill accurately describes the §5.3 panel — meta, but important: a wrong skill definition silently degrades all future reviews
- The simplicity critic pays special attention to the skill prompt length: the simplest prompt that reliably produces three distinct reviewers wins; no elaborate orchestration before it's needed
- Stage gate has no Playwright smoke (Stage 0 is not user-facing)

## Iteration log

| Date | What changed | Why |
|---|---|---|
| 2026-06-12 | Added v1-spine first-principles re-audit (D24) to scope | User chose "hybrid + spine re-audit" over keep-by-default |
