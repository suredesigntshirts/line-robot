# /loop prompt — Stage-23 ingestion audit: per-group Research + Plan (RPI, R+P only)

> **Run-this-in-a-loop artifact.** Paste the block below after `/loop` (self-paced — omit an interval).
> It assumes ZERO memory of any prior session: everything it needs is on disk. Each iteration produces
> ONE group's deep-dive (Research + Plan) and then the loop advances; it STOPS when all four group plans
> exist. **RPI = Research → Plan → Implement. We are doing R + P ONLY this run — NO code/schema/infra
> changes.** Groups are explored **independently**; cross-group conflicts are reconciled in a SEPARATE
> later review pass (explicitly out of scope here — flag overlaps, don't resolve them).

---

## Source of truth (read every iteration)
- **`plans/23-ingestion-pipeline-audit.md`** — the first-pass audit: the incident, the issue groups,
  founder notes (verbatim), the verified code paths, and the open evidence items. AUTHORITATIVE.
- Per-group outputs go in **`plans/23-ingestion-pipeline-audit/`** (this folder).

## The work units — four groups (Group E "my recommendations" is distributed into them, see mapping)
| Group | Output file | Scope (see the audit for code paths + founder notes) |
|---|---|---|
| **A** | `group-a-dedup-correctness.md` | Dedup over-merge: 5 distinct listings → 1 row. Founder items 1 & 5. |
| **B** | `group-b-performance-resilience.md` | Timeouts, no-chunking, image-preprocess caching, smart failure-flagging. Founder items 3 & 4. |
| **C** | `group-c-eval-hillclimbing.md` | Eval/replay infra + "prod failure → golden case → hill-climb" loop + architecture vs best-in-class. Founder item 2. |
| **D** | `group-d-dm-group-unification.md` | 1:1 DM vs Group; "DM = group of one" exploration. Founder item 6. |

**Group E → group routing (each sub-agent folds in its assigned E items as inputs):**
- A ← E1 (conservative-merge asymmetry), E2 (segment-scoped geo), E3 (candidate-pool scaling), E5
  (confirmation counts persisted rows, not segments), E10 (write idempotency keys).
- B ← E4 (preprocess images once at ingest + persist), E9 (size-aware backpressure / deliberate chunking).
- C ← E6 (auto-capture failures as eval cases), E7 (missing "N distinct listings" eval archetype),
  E8 (per-step tracing/timing + per-conversation trace).
- D ← (no E items specific; D stands alone, but note any E10 idempotency overlap).

---

## Per-iteration procedure — you are a THIN orchestrator
1. **Assess state.** Read `plans/23-ingestion-pipeline-audit.md`, then list this folder. A group is **DONE**
   iff its output file exists AND its last line is exactly `<!-- RPI: R+P COMPLETE -->`.
2. **Stop condition.** If A, B, C, D are all DONE → the loop is finished: **do not reschedule.** Post a
   one-line summary + the four artifact paths for review, and end.
3. **Pick the next un-done group** in order A → B → C → D.
4. **Dispatch ONE sub-agent** for it via the Agent tool with:
   - `subagent_type: "general-purpose"`, `model: "opus"`, **maximum reasoning effort**, `description`
     "RPI R+P: group <X>".
   - The **sub-agent brief** below, with `<GROUP>` / `<OUTPUT_FILE>` / `<SCOPE>` / `<E_ITEMS>` filled from
     the table above. The agent has ZERO shared context — the brief is everything it knows.
5. **Verify the return (cheap, decisive — never blind-trust "done").** Confirm: the output file exists; its
   last line is the completion marker; it contains all eight required sections; and **`git status --short`
   shows ONLY the new markdown file** (no code/schema/infra was touched — this run is R+P only). If any check
   fails, re-dispatch ONCE with the specific gap named; if it still fails, write a short note in the file's
   place explaining the gap and move on (don't let one group wedge the loop).
6. **Stay thin.** You dispatch + verify + leave a one-line progress note in your reply. You do NOT do the
   research yourself or read whole files into your own context — that's the sub-agent's job.

---

## SUB-AGENT BRIEF (fill the <…> placeholders, paste as the agent's prompt)

> You are an Opus, maximum-reasoning sub-agent doing the **Research + Plan** phases of an RPI loop for ONE
> group of a code audit. **You will NOT implement anything** — no code, schema, infra, or config edits. Your
> ONLY write is one markdown artifact. You have zero shared context; everything is on disk.
>
> **Read first (in order):**
> 1. `plans/23-ingestion-pipeline-audit.md` — the full audit. Focus on **Group <GROUP>** and §0 (the
>    incident) and the "open evidence" list at the end.
> 2. The exact code paths the audit cites for Group <GROUP> — open them and verify them at `file:line`.
> 3. Repo conventions: root `CLAUDE.md` (quality system, anti-over-engineering rules, the data-layer + eval
>    notes), `packages/db/CLAUDE.md` for migrations, `docs/research/00-product-principles.md` for any
>    design-bearing heuristics. **Docs-first:** before reasoning about any external lib / LLM pattern, check
>    `docs/llms.txt` and use the `/documentation-downloader` skill if missing — don't guess APIs.
>
> **Your scope (Group <GROUP>):** <SCOPE>. Also fold in these cross-cutting recommendations as inputs:
> <E_ITEMS>.
>
> **RESEARCH (be rigorous, evidence-based):**
> - Verify or REFUTE the audit's hypotheses for this group with concrete evidence (quote `file:line`). Do not
>   accept the audit's guesses — confirm them in the code.
> - You MAY read staging data **read-only** to ground claims (DynamoDB `linerobot-staging-messages`, the
>   Postgres catalog via `dbConnectionString`) — the incident conversation key is
>   `user#U810f7671d201fe7ce3ec2ef49ab8d16a`. **Never mutate staging. Never run avoidable paid LLM/API
>   calls.** If a pipeline replay would help, prefer the LOCAL Docker / eval harness, or DESCRIBE it as a
>   planned research step — do not write to staging or rack up cost.
> - Survey best-in-class approaches for this class of problem (how mature LLM/data systems solve it) and how
>   they map onto our hexagonal step-LLM pipeline + eval harness. Cite the docs you used.
> - Enumerate root cause(s) precisely. For Group A specifically, pin the exact failing step (geo-bind vs
>   blocking vs the Haiku verify verdict) with the strongest evidence you can get cheaply.
>
> **PLAN (options, not orders):**
> - Give **2–4 solution options**, each with trade-offs scored on: effort, risk/blast-radius, alignment with
>   the existing architecture, and the project's anti-over-engineering rules (no interface until the 2nd impl,
>   ports only at real seams, no one-caller abstractions, no config nobody sets, smallest thing that works).
>   For dedup, weigh the **asymmetry**: a false "new" is a recoverable dup; a false "merge" is silent data
>   loss — bias designs accordingly.
> - **Recommend one** option with rationale.
> - Write a concrete **implementation plan (to be executed in a LATER phase, not now):** the steps, the exact
>   files to touch (`file:line`), new/changed unit tests AND **eval cases** (tie to `npm run eval` /
>   `packages/pipeline/src/eval`), any migration (domain-enum-first per `packages/db/CLAUDE.md`),
>   rollout/feature-flagging, and how it'll be verified against the project's review cadence.
> - List **open questions / founder decisions**, **cross-group dependencies** (flag only — another agent owns
>   the other group; do NOT design their fix), and **out-of-scope/deferred** items.
>
> **WRITE** your artifact to `plans/23-ingestion-pipeline-audit/<OUTPUT_FILE>` with EXACTLY these sections,
> then end the file with the marker line:
>
> ```
> # Plan 23 — Group <GROUP>: <title> — Research + Plan (RPI)
> > Status: R+P COMPLETE · Source: plans/23-ingestion-pipeline-audit.md (Group <GROUP>) · Phase: Research+Plan ONLY (no implementation)
>
> ## 1. Problem & scope
> ## 2. Research findings   (2.1 root cause(s) w/ evidence+file:line · 2.2 verified code-path map · 2.3 data/replay evidence if any · 2.4 best-practice survey w/ cited docs)
> ## 3. Solution options    (2–4; each: approach · trade-offs effort/risk/blast-radius/alignment · why / why-not)
> ## 4. Recommended direction (+ rationale)
> ## 5. Implementation plan (NOT executed)   (steps · files file:line · tests + eval cases · migrations · rollout/flags · verification)
> ## 6. Open questions / founder decisions
> ## 7. Cross-group dependencies (flag, don't resolve)
> ## 8. Out of scope / deferred
>
> <!-- RPI: R+P COMPLETE -->
> ```
>
> **Return** (your final message = data for the orchestrator, not prose for a human): the artifact path, a
> 3–5 bullet executive summary of the recommended direction, and any blocker you hit. Confirm you edited NO
> code (only the one markdown file).

---

## Guardrails (apply to the loop AND every sub-agent)
- **R + P ONLY.** No code/schema/infra/config edits this run. The sole write per group is its markdown
  artifact. After each iteration, `git status --short` must show only new files under this folder.
- **Read-only research; protect staging.** Reading staging data is fine; mutating it is not. Avoid needless
  paid API calls; prefer local/Docker/eval harness for any replay.
- **Docs-first** (`docs/llms.txt` → `/documentation-downloader`). No guessed APIs.
- **Honor the project rules:** hexagonal boundaries, anti-over-engineering (weighted like bugs), deterministic-
  first for dedup, the eval/hill-climbing north star.
- **Independent groups.** Each sub-agent owns exactly one group, flags cross-group overlaps, and never
  designs another group's fix. The conflict-reconciliation pass is a later, separate step.

## How to run / stop
- Start: `/loop` with this whole block as the prompt (self-paced — no interval).
- It processes one group per iteration (A→B→C→D) and ends itself once all four `*.md` carry the
  `<!-- RPI: R+P COMPLETE -->` marker. (Independent groups → you may instead ask for a single parallel pass
  that dispatches all four at once; the loop form is the default for incremental review.)
- After it stops, review the four artifacts, THEN we do the separate cross-group conflict review +
  implementation sequencing (NOT part of this loop).
