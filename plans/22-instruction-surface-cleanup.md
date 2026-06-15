# Plan 22 — Instruction-surface & artifact-status cleanup

**Status:** DRAFT — awaiting founder approval. **DO NOT EXECUTE yet** (a concurrent run owns the working tree — see §0).
**Date:** 2026-06-14
**Supersedes:** `plans/21-instruction-surface-cleanup.md` (renumbered — "21" collided with an active run; see §0).
**Evidence base:** thorough audit — full reads of 36 files (plan-19 master + decision register D1–D26, all 12 stage specs, all 12 research artifacts, plan 20, the design docs, theme.css, Base.astro, global.css) + 4 cross-check passes (vision-consistency, reference-integrity, status-truth, completeness) + round-1 instruction-surface audit (CLAUDE.md ×3, 3 skills, 11 memory files, 6 root status files, all read in full).

---

## 0. Read this first — concurrent run + numbering collision + sequencing

While this audit ran, **a second autonomous process was actively editing this repo** (a long-running `/goal` per `plans/21-goal-prompt.md`: ship plan-21 frontend conformance + direction-a redesign AND harden `/frontend-review` + `/alignment-review`). Evidence: at session start the only untracked file was `stage-4-design-alignment-prompt.md`; now ~20 files are uncommitted; `theme.css` was edited at 16:08 (minutes before this plan was written). It commits per-increment; nothing committed yet.

**Two consequences:**

1. **Numbering collision.** That run created `plans/21-frontend-architecture-conformance.md` (APPROVED). Its plan-21 is canonical. This cleanup is therefore **plan 22**, and the old `plans/21-instruction-surface-cleanup.md` should be deleted as superseded.

2. **The cleanup MUST run after the conformance run lands on a clean tree.** The conformance run's own Definition-of-Done edits the *same files this cleanup targets*: `CLAUDE.md` (token bullet + cadence), `BACKLOG.md`, `SPRINT-LOG.md`, memory ("update memory at the end"), `c1`, the register, the Stage-5 spec, and both review skills. Executing this cleanup concurrently would clobber its uncommitted work and vice-versa. **Sequencing rule: wait for the conformance run to finish + commit, then run this cleanup on a clean tree so it can ABSORB (not fight) the run's closeout edits.** Re-confirm the §2 findings against the post-run tree before editing — several will already be fixed by the run (e.g. the CLAUDE.md Tailwind bullet, design-direction reconcile).

---

## 1. Headline diagnosis

**The product direction is NOT confusing — it is singular and internally consistent.** Full reads of every stage spec + research artifact found **zero hard contradictions** of the master vision (`plans/19-v2-marketplace-rebuild.md` §2 + decision register **D1–D26**). A blind read of the *code* independently reproduced the same golden path. The confusion the founder senses is **status/artifact/instruction sprawl layered on top of a clear goal** — and it is actively worsening (two runs just collided on a plan number).

The golden path (authoritative, one place — master §2): *LINE group → webhook → SQS → debounced sweep → 6-step Claude pipeline (classify/OCR → segment → extract → dedup → translate → quality-gate) → Postgres (private to the group's mirror) → bot DMs poster to claim & one-tap publish (opt-in is the only public path) → 7-day group exclusivity first-dibs → public Astro SSR site (TH+EN, anonymous browse) → admin-vetted broker/investor dealflow → hybrid AVM.*

---

## 2. Findings (what to clean), grouped

### A. Status sprawl — same status in 4 files + 2 memories (confirmed round-1)
`SPRINT-LOG.md`, `deploy-status.md` (memory, 999 lines), `BACKLOG.md`, `MORNING.md` all carry the 2026-06-14 status; the founder decision queue is in three of them; they have drifted (MORNING claims HEAD `6b55fca` + "all committed"; tree is at `731014e` with ~20 uncommitted files). `BLOCKERS.md` is fully struck-through. **BACKLOG.md is the declared + genuine SoT** (verified: its preamble + "Status at a glance" table reconciles every stage).

### B. NEW — plan-19 artifact header/body drift (systematic, found only by full reads)
**Every built stage spec still carries a stale top-line header.** Stage 0, 1, 2, 3 headers say "FLESHED — pending founder approval" while their *bodies* record passed gates; Stage 4 header says "FLESHED" while its body records CONDITIONAL-PASS + live deploy. `research-program.md` says "APPROVED scope, not yet started" though the program is executed and its register is live. `docs/research/00-product-principles.md` header says "DRAFT — pending founder review" though it is the **live `/alignment-review` input**. The lifecycle-header layer was never updated post-gate across the whole plan-19 tree. (All graded soft — the true status is recoverable from each body — but this is the same disease as the memory staleness, inside the plan artifacts.)

### C. NEW — stale design/research artifacts that actively mislead
- **`docs/design/design-direction.md` (HARD).** Header "AWAITING FOUNDER PICK"; recommends candidate **B (green)**. Reality: candidate **A (Baania-clean trust-blue)** locked 2026-06-13 (`theme.css` header, `mockups/README.md`, commit `4b25dc9`). A reader trusting it builds the wrong palette. → **Tombstone or reconcile to "A chosen."**
- **`CLAUDE.md` design-tokens bullet (HARD, may self-resolve).** Says the website does NOT run Tailwind and must import `theme.css` + `fallbacks.css` directly. The conformance run just made the site run Tailwind via `global.css`. CLAUDE.md now misinstructs. (The conformance run lists this as a closeout edit — verify before re-fixing.)
- **`docs/research/a4-listing-field-canon.md` (soft).** Framed against **DynamoDB** ("DynamoDB schema review", FIELD-13) though the catalog store is settled **Postgres** (D1). Field content still valid; the persistence framing is stale.
- **`docs/research/c1-frontend-stack-canon.md` (soft).** Still recommends the `astro-sst` adapter though **TECH-12 is superseded by Pulumi** (DF-2). (c1 is already modified in the working tree by the conformance run — verify post-run.)

### D. Rule duplication — one canonical home each (confirmed round-1)
Anti-over-engineering rules (3×), review cadence (4 partial copies), usage/budget protocol (2×), pulumi passphrase + AWS profile (3×), "no stage before approval" (4×), single `pg.Pool` max 2 (2×), faithfulness/spawn-fresh-agent guard (3 skills). Canonical home = project `CLAUDE.md` (or `packages/db/CLAUDE.md` for the pool rule); everything else points instead of restating.

### E. NEW — a genuine decision-register contradiction (needs founder ruling, not a doc edit)
**DF-6.** Stage 2 spec mandates the "nudge-and-iterate bot-DM completion loop" as a deliverable; the *same file's gate* records it was never wired AND it is mooted by the later founder ruling **A3a** ("no reply-driven editing"). The register's DF-6 was never amended. This is a real contradiction — resolve by founder ruling (formally descope DF-6, or reschedule), then amend the register + Stage 2 spec to match.

### F. Memory staleness (round-1 + corrected preservation rule)
- `MEMORY.md` index leads with plan-14/17 and describes plan-19 as "skeletons / NO dev" though Stages 0–4 are gated; the `deploy-status` and `sprint-01-outcome` index lines describe the wrong era / are a stage behind. → Rewrite the index to state current reality first.
- `sprint-01-overnight-outcome.md` is a stage behind ("Stages 0–3 built"). → Update to "Stages 0–4 gated" or collapse to one index line.
- `cleanup-patterns.md` → keep only the 2 live "do-not-re-clean" gotchas. `numbered-plans.md` → bump the stale `plans/11` example. `pulumi-backend.md` → drop the v1-era "Stage 08" line.
- **CORRECTED preservation rule:** `deploy-status.md` (memory) is NOT safe to trim to a bare pointer. Lines 853–869 hold the **plan-12/13 "16-nullable structured-output cap" outage + fix (`ea12c4f`)** — load-bearing history that SPRINT-LOG.md only references in passing, never explains, and that CLAUDE.md + MEMORY.md both cite. **Preserve that incident knowledge** (keep it in deploy-status, or extract it to a dedicated `lessons`/`gotchas` memory, or confirm it already lives as the CLAUDE.md "16 nullable params" note) before trimming the rest of the chronological log.

---

## 3. Cleanup actions

1. **Status → one owner.** Make BACKLOG.md the sole live status: fold MORNING.md's founder decision queue + eyeball list into it, then delete MORNING.md; delete BLOCKERS.md; keep SPRINT-LOG.md as the only chronological journal (add a 1-line "live status → BACKLOG.md" header); trim the deploy-status memory to a pointer **after** preserving the §2F outage history.
2. **De-duplicate rules (§2D)** to one canonical home each; skills + memory point, not restate.
3. **Fix stale memory + index (§2F).**
4. **Golden-path header** — add the 4–6 line §1 golden-path statement to the TOP of CLAUDE.md (the goal currently lives only in a memory file).
5. **Demote ops trivia** (rich-menu, MINI App console steps, deploy block, ARNs, test catalog) from CLAUDE.md to a new `docs/runbook.md`; CLAUDE.md keeps 1-line pointers. Resolve the 6 instruction conflicts (C1 headed/headless scope; C3 `/code-review` review-only vs `--fix`; C2 review-panel-vs-budget; C5 approval-per-envelope; C6 design source-of-truth) while moving.
6. **Reconcile plan-19 artifact headers (§2B)** — update each built stage spec's top-line header to its true gated status; flip the register header DRAFT→live; fix research-program's "not started". (Low-risk find/replace of header lines only; do NOT touch spec bodies.)
7. **Tombstone/reconcile the stale design+research artifacts (§2C):** design-direction.md → "A chosen"; a4 persistence framing → note Postgres; c1 adapter → note Pulumi/TECH-12-superseded (verify both against the post-run tree first).

## 4. Founder rulings needed before editing
1. **DF-6 (§2E)** — formally descope or reschedule? (Then I amend register + Stage 2 spec.)
2. **C2 wording** — under the 85% budget cap, the per-increment review panel is *deferred*, not skipped? (I'll word it so.)
3. **C5 wording** — autonomous-run authorization is "approval per sprint envelope," reconciling the literal "NO dev without approval"?
4. **deploy-status history (§2F)** — keep it in deploy-status, or extract to a dedicated `lessons` memory?

## 5. Execution order (only after the conformance run lands + commits, on a clean tree)
0. Confirm the conformance run is finished + committed; `git status` clean. Re-confirm §2 findings against the post-run tree (skip what the run already fixed).
1. §4 rulings resolved.
2. Status consolidation (§3.1) → memory + index (§3.3) + golden-path header (§3.4) — cheap, high-signal.
3. Rule de-dup (§3.2) + plan-19 header reconcile (§3.6) + stale-artifact tombstones (§3.7).
4. Runbook extraction + conflict-wording fixes (§3.5).
5. Verify: `grep` each de-duplicated rule returns one full copy; read MEMORY.md + BACKLOG.md cold and confirm they state current reality; the §2F outage history still findable. Docs-only — no code gates.

## 6. Out of scope (explicitly NOT touched)
`plans/19-v2-marketplace-rebuild.md` master + vision; `docs/research/*` content of record + the heuristic register §4 bodies; stage-spec *bodies*; code/schema/infra; `LINE.md` (founder handling the plaintext-secrets finding separately); the conformance run's frontend work.

---

## Appendix — product/strategy flags surfaced by the audit (NOT cleanup; for the founder)
The thorough read surfaced soft *product* tensions worth a home so they aren't found-then-forgotten (the exact failure BACKLOG.md's preamble describes). None contradict a settled decision; all are founder-flagged or research-logged:
- **7-day exclusivity window** — the single most load-bearing UNVALIDATED assumption; research found no Thai-broker precedent (likely our invention); DF-1 conditions it on real-group validation before Stage 6. The vision narrates it as settled fact.
- **NPA/LED ingestion (a3)** vs "poster opt-in is the only public path" — externally-ingested distressed listings have no consenting poster and can't carry `publishConsentTimestamp` (LEGAL-02). Reconcile before any NPA listing shows publicly.
- **Owner-direct selling (a1 F14)** may cannibalize the broker-subscription revenue the vision monetizes on.
- **Co-Agent (รับโค) handshake (a1 DEAL-05/06)** — a whole dealflow feature area the vision's golden path omits.
- **AVM input set** — research (a2 MKT-07) specs a narrower 3-source v1 than the vision's 4-source hybrid; Stage-7 review is told to challenge the "LLM comps" input.
- **Chiang-Mai-as-default** — NOT a vision conflict (D18 blesses North-Thai flavor, no hard restriction), but heuristics like FIELD-06 (mandatory CM landmark) and COPY-08 (CM-only romanization at the DB layer), if implemented *literally*, would bake in the restriction D18 forbids. Implement as CM-calibrated defaults, not national invariants.
