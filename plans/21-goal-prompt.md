# /goal prompt — Ship plan 21 (frontend conformance + direction-a redesign) AND harden the two design-quality skills

> Paste the block below after `/goal`. It is a long-running autonomous goal — two intertwined objectives,
> both required for "done". The build is the vehicle; the skill-hardening rides on every design increment.

---

GOAL: Deliver plan 21 — bring the website onto the Tailwind v4 + shadcn foundation and implement the
`direction-a` mock across ALL pages — to high quality through our normal review iterations; AND in the
same run, debug and harden our two design-quality skills (`/frontend-review`, `/alignment-review`) by
tracing every invocation, auditing each with an independent adversarial agent to confirm it applies
enough backpressure to guarantee the work is complete, fixing any skill weakness it exposes, and writing
the learnings down durably so the skills stay sharp for future runs. Run as long as needed; stop only when
BOTH definitions of done below hold.

## Read first (rebuild context — zero memory assumed)
- `plans/21-frontend-architecture-conformance.md` (THE plan, APPROVED) and its two run-prompts:
  `plans/21-frontend-architecture-conformance-prompt.md` (Prompt 1 = foundation, no visual change) then
  `plans/19-v2-marketplace-rebuild/stage-4-design-alignment-prompt.md` (Prompt 2 = mock across all pages).
- `docs/research/c1-frontend-stack-canon.md` (the canon this conforms to; adapter = Pulumi, settled).
- The two skills under test: `.claude/skills/frontend-review/{SKILL.md,checklist.md,design-review-prompt.md}`
  and `.claude/skills/alignment-review/{SKILL.md,context-map.md}`; plus the register
  `docs/research/00-product-principles.md` §4 and the mock `docs/design/mockups/direction-a-baania-clean.html`.
- `CLAUDE.md` (review cadence, deploy, usage-budget protocol). `plans/20-frontend-visual-e2e-testing.md`.

## Definition of Done — BUILD (all must hold)
- Prompt 1 complete: website runs Tailwind v4; shared `@theme` single token source; shadcn initialized as
  owned code; oklch/old-Android fallback intact; **no inline-style objects** by the end of the work; site
  visually unchanged at the end of Prompt 1 (mode-A green proves it).
- Prompt 2 complete: every page reads like `direction-a` — home/browse (th+en), detail (th+en),
  empty/zero-result, 404, shared `@line-robot/ui` — responsive, content schema-driven, NPA calm violet.
- All free gates green (`typecheck`, `lint`, `test`, `test:e2e`); deployed to staging (Pulumi) and verified
  in `/frontend-review` deployed mode; Stage 4 re-gated CONDITIONAL-PASS → PASS; pixel baselines re-enabled
  at lock-in; `c1` + register + Stage 5 spec updated per the plan.

## Definition of Done — SKILL HARDENING (all must hold)
- **Every** `/frontend-review` and `/alignment-review` invocation in this run wrote a structured trace to
  `docs/design/skill-hardening/traces/` (template below).
- **Every** trace was audited by an INDEPENDENT, ADVERSARIAL agent (fresh `Agent`, read-only, did NOT run
  the skill) that re-derived what the skill *should* have surfaced from the real artifact + mock + register/
  context-map — not from the trace — and judged backpressure/coverage. Audit written to
  `docs/design/skill-hardening/audits/`.
- **Every confirmed skill gap was fixed** in the skill file(s) and the fix **re-verified to bite** (run the
  skill again on the same increment; confirm it now catches what it missed — red-proof discipline), with the
  change + rationale logged in `docs/design/skill-hardening/HARDENING-LOG.md`.
- `context-map.md` verified (and updated if a design surface here maps to a context group it was missing),
  and confirmed the design surfaces pulled the right groups (Listing card & detail UI, Search & discovery,
  Typography/i18n & copy, Architecture & frontend, Dealflow & distressed/NPA).
- A final `## SUMMARY` in `HARDENING-LOG.md` lists, per skill: gaps found, changes made, residual risks,
  and recommended future improvements — the durable hand-off for the next run.

## Operating loop (per design increment / pass)
1. **Build** the increment per the two prompts + our normal cadence (the iteration is built in: `/frontend-review`
   iterates mode-B until aligned; `/increment-review` runs the panel).
2. **Run the skills** the cadence requires (`/alignment-review` + `/frontend-review` on design-bearing passes).
   **Capture each invocation into a trace file** (template below) — what it loaded, checked, surfaced, passed,
   skipped, and the backpressure it applied.
3. **Audit each skill-run with an independent adversarial agent** (criteria below). It re-examines the actual
   diff + rendered screens + mock + register/context-map and asks "what would a rigorous reviewer have caught
   that this skill didn't?" Write its verdict + gaps to `audits/`.
4. **If the audit finds insufficient backpressure / missed coverage / source-inferred styling / wrong context
   groups** → edit the skill file(s) to close the gap, log it in `HARDENING-LOG.md`, and **re-run the skill on
   the same increment to confirm the fix bites**.
5. The increment is **done** only when it passes the (now-hardened) skills AND the audit confirms adequate
   backpressure. Then commit; next pass. (Audits may run concurrently with the next build to save wall-clock,
   but fold their findings in before final sign-off.)

## Trace template → `docs/design/skill-hardening/traces/<skill>-<pass>-<n>.md`
```
# Trace: <skill> · pass=<id> · target=<local|deployed> · <ISO time>
- Increment: <what was built + diff ref/commit>
- Inputs loaded:
  - frontend-review: screens captured · gallery dir · reference mock used
  - alignment-review: context groups selected (from context-map.md) · heuristic IDs evaluated (from §4)
- Checked / asserted: <invariants run; heuristic IDs judged>
- Findings raised: <invariant fails · mode-B divergences/open-Qs · violations> (each: id · evidence · rendered|source)
- Passed: <what passed + on what evidence>
- NOT checked / skipped: <anything uncovered + why>
- Verdict + backpressure: <PASS | CHANGES-REQUESTED | BLOCKER> + how hard it pushed
```

## Audit agent — independent + adversarial, per skill-run. Judge against:
- **A. Coverage.** frontend-review: did it render ALL changed screens × {th/en, light/dark, mobile/desktop}?
  alignment-review: did it pick every applicable context group, and evaluate EVERY heuristic ID in them with
  no silent skips? Did it pick the RIGHT groups for this surface (cross-check `context-map.md` + the diff)?
- **B. Evidence faithfulness.** Styling heuristics (TH-06/07, the TECH-06 token-resolution / NPA-tone IDs)
  judged from RENDERED evidence on the real built artifact — never source/token declarations. Real artifact,
  not `astro dev`, not the Tailwind `ui` gallery.
- **C. Backpressure adequacy (adversarial).** Independently find at least one real issue in the increment;
  did the skill flag it? Did it surface mock↔render divergences as founder open-questions rather than self-
  adjudicating? Did a `violation`/`BLOCKER` actually block, or was it soft-passed?
- **D. Signal quality.** False positives/negatives, noise, actionability.
- Output: per-skill **SUFFICIENT** or **INSUFFICIENT** (with the specific gaps) + concrete recommended edits
  to the skill file(s). Write to `audits/`. INSUFFICIENT ⇒ do the skill-improvement step (loop 4).

## Autonomous founder-decision handling (no founder present mid-run)
Apply the known rulings: NPA = calm violet (not red); "steal the styling, ignore the data"; responsive, not
app-only; `direction-a` is the target; content is schema-driven; adapter is Pulumi. For a genuinely ambiguous
TASTE call the rulings don't settle: pick the most mock-faithful default, **proceed (never block the run)**,
and queue the question in `docs/design/skill-hardening/FOUNDER-QUEUE.md` for later review.

## Guardrails
- Skill-hardening serves the build's quality — don't let meta-work stall shipping; but never ship an increment
  the hardened skill or its audit calls incomplete.
- Skill edits must close a real DEMONSTRATED gap, be re-verified to bite, and be logged — don't bloat the
  skills with speculative noise.
- Keep mode-A invariants green throughout; one `@theme`; oklch fallback intact; islands minimal (don't SPA-ify);
  static = zero JS.
- Follow the usage-budget protocol (`~/.claude/check-usage.sh`; wrap at 85%, hard-stop 95%); log readings in
  `SPRINT-LOG.md`. Commit per increment; update `BACKLOG.md`/`SPRINT-LOG.md`; update memory at the end.

## Exit + final report
Stop only when BOTH DoDs hold: deployed + verified, Stage 4 re-gated PASS, every skill-run traced + audited +
gaps fixed-and-reverified, `context-map.md` confirmed/updated, `HARDENING-LOG.md` SUMMARY written, `FOUNDER-QUEUE.md`
surfaced. Final report: what shipped (with the live URL), the per-skill hardening summary (gaps → fixes →
residual risk), and the founder-decision queue.

---
