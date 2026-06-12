---
name: increment-review
description: Adversarial review panel for a PR-sized increment — spec auditor, correctness reviewer, and simplicity critic run as fresh-context read-only agents, their findings verified by a skeptic before being reported. Use after completing an increment of a v2 stage, before starting the next. Args: [stage-spec-path] [diff-ref]
disable-model-invocation: true
---

# Increment review — three-reviewer adversarial panel

Reviews one PR-sized increment against its stage spec and the project's quality rules (master plan §5.3). Reviewers are **fresh-context, read-only agents that did not write the code** — that independence is the point. Do not summarize the diff for them or pre-explain intent; they read cold.

## Inputs

- **Stage spec path** (first arg, required): e.g. `plans/19-v2-marketplace-rebuild/stage-1-data-foundations.md`. The spec's increment section defines what this diff was supposed to do.
- **Diff ref** (second arg, optional): a git ref/range. Default resolution order: (1) the explicit arg if given; (2) if the working tree is dirty: staged + unstaged vs `HEAD`; (3) else if the current branch is not `main`: `main...HEAD` (the whole branch); (4) else (clean tree on `main`, e.g. the commit-to-main sprint flow): the increment's own commits — `HEAD~N..HEAD` where N is the number of commits since the previous increment's review (check SPRINT-LOG.md; fall back to `HEAD~1..HEAD`).

## Procedure

1. Resolve the diff: `git diff <ref>` (plus `git status --short` for untracked files in scope). If the diff is empty, stop and say so.
2. Read `.claude/skills/increment-review/reviewer-prompts.md` for the agent briefs.
3. **Correctness seat — invoke the installed `/code-review` skill** (Skill tool, medium effort, review-only — never `--fix`) on the diff. It is the well-tested machinery for correctness bugs and reuse/efficiency cleanups; do not duplicate it with a bespoke reviewer.
4. In parallel with step 3, spawn the **two bespoke reviewers** via the Agent tool, `subagent_type: Explore` (read-only), each given: the diff ref, the stage spec path, the increment name, and its brief from `reviewer-prompts.md`. They read the actual files/spec themselves.
   - **Spec auditor** — diff vs the named increment's deliverables + acceptance criteria; scope drift in either direction is a finding. (No existing skill covers spec compliance.)
   - **Simplicity critic** — loads the anti-over-engineering rules from the repo `CLAUDE.md` quality section (fallback: master plan §5.3); hunts one-caller abstractions, single-implementation interfaces, premature generality, config nobody sets — against OUR rules, which generic review doesn't know. Its findings carry the same weight as bugs.
5. Spawn the **skeptic** (also Explore, fresh) with the two bespoke reports: it re-checks each finding against the actual code, **drops** findings it cannot reproduce/support, **confirms** the rest, and marks judgment calls as NEEDS-FOUNDER. `/code-review` findings pass through as-is (already confidence-calibrated) unless they conflict with a bespoke finding — conflicts go to the skeptic too.

**FAITHFULNESS GUARD — non-negotiable:** the reviews MUST run as fresh sub-agents / the installed skill, never inline in the main conversation. The entire value of this panel is fresh-context independence from the author; an inline "review" by the session that wrote the code is worthless theater. If you cannot spawn agents or invoke `/code-review` for any reason, STOP and report that — do not substitute yourself.
6. Report, as markdown:
   - One `## <Reviewer>` section per seat (`/code-review` output, spec auditor, simplicity critic — findings numbered, with severity).
   - `## Skeptic` — per bespoke finding: CONFIRMED / DROPPED (why) / NEEDS-FOUNDER.
   - `## Verdict` — **PASS** (no confirmed findings), **CHANGES-REQUESTED** (confirmed findings listed, ordered by severity), or **NEEDS-FOUNDER** (judgment calls present). Confirmed findings must be fixed before the next increment starts; rebuttals are allowed but must be argued in writing in the increment's commit message or SPRINT-LOG.

## Rules

- Reviewers and skeptic are read-only: they never edit files. All fixes happen after the verdict, by the author.
- Never soften a confirmed finding to keep momentum; never invent findings to seem thorough — a clean PASS is a valid outcome.
- If the increment is design-bearing (UI, copy, schema, user-facing flows), remind the caller to also run `/alignment-review`.
