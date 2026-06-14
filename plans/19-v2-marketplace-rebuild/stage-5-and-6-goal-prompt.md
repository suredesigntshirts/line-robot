# /goal prompt — Stage 5 (MINI App) design+functional iteration, THEN Stage 6 (Groups & Dealflow)

> **Run-this-prompt artifact.** Written 2026-06-15. Paste the block below after `/goal` (or hand it to a fresh
> session). It assumes **ZERO memory** of any prior session. It is a long-running autonomous goal with **two
> sequential parts** (Part B does not start until Part A's Definition of Done holds). You act as a **thin
> orchestrator**, dispatching **Opus sub-agents at the highest reasoning effort ("Opus xhigh")**, building in
> reviewed increments, each taken to completion *with its own tests*. Run as long as needed — across multiple usage
> windows if the budget protocol pauses you. **Stop only when BOTH parts' Definitions of Done hold.**

---

## Shared operating principles (apply to BOTH parts)

- **Thin orchestrator.** You do not write feature code yourself — dispatch Opus-xhigh sub-agents, each owning a slice
  end-to-end (build → test → self-review), and **verify every claim before accepting** (re-run the gate, re-read the
  diff, confirm the test asserts the behavior — not a tautology).
- **THE CORE PRINCIPLE — a feature is not "done" because it renders; it is done when it WORKS and an e2e test proves
  it by DRIVING the real interaction (click/swipe/type/submit/navigate) and asserting the functional OUTCOME, not
  just computed style.** "Renders but doesn't work" is a distinct bug class (the functional twin of "renders but
  unstyled"). Every interactive feature — in BOTH parts — gets a Playwright test that FAILS when the feature is
  broken; prove each bites (break the feature → the test goes red). A test that drives nothing is worthless theatre.
  Keep the computed-style invariants too (theme/TH-07/contrast/colorScheme/no-broken-images); both gates are required.
- **Review cadence (per `CLAUDE.md` §Quality system — fresh-context reviewers that did not write the code):**
  `/increment-review` (spec auditor + correctness via the installed `/code-review` + simplicity critic → skeptic
  adjudicates; the correctness seat must confirm functional tests genuinely drive the interaction and bite);
  `/alignment-review` for design-bearing work (the heuristic register); `/frontend-review` for UI increments —
  render the REAL built artifact, assert computed-style invariants **and DRIVE the real interactions + assert the
  outcome**, plus image-vs-image vs the mocks (source-forbidden; surface divergences). LLM pixel/behavior perception
  is unreliable (see `docs/design/skill-hardening/HARDENING-LOG.md`) — deterministic functional + computed-style
  assertions are the reliable layer; you verify any "it works"/"it matches" claim against the actual run.
- **Guardrails (honour exactly):** hexagonal boundaries (LIFF SDK only in `packages/miniapp`; SPA→`packages/api`
  HTTP-only; `api` reads the `@line-robot/db` PUBLIC barrel only; bot core never imports adapters; **no LINE import
  in `packages/pipeline`**); no inline-style objects / no bespoke CSS (Tailwind + owned shadcn on the shared
  `@theme` + the oklch/old-Android fallback, TECH-06); docs-first (cache Playwright/LIFF/Tailwind/Pulumi docs via
  `/documentation-downloader`, check `docs/llms.txt`); anti-over-engineering (no interface until the 2nd impl, no
  one-caller abstractions, no config nobody sets, smallest thing that satisfies the requirement — the simplicity
  critic weights these as bugs); migrations domain-enum-first → `packages/db/schema.ts` → `npm run generate` →
  hand-fix per `packages/db/CLAUDE.md`.
- **Deploy** = Pulumi on the local file backend + passphrase (`~/.line-robot-pulumi-passphrase`),
  `AWS_PROFILE=line-robot`; `npm run build` then `cd infra && pulumi up`; after a meaningful deploy, verify on real
  infra. **Commit per increment, push to `main`.** Update `BACKLOG.md`/`SPRINT-LOG.md`/the `deploy-status` memory.
- **Usage-budget protocol:** `~/.claude/check-usage.sh` roughly hourly (never < 5 min apart); wrap at 85%,
  hard-stop 95%; log each reading + mode switch in `SPRINT-LOG.md`. Above 85%, only cheap haiku/sonnet cleanups.
- **Autonomous founder-decision handling (no founder present mid-run):** for a genuinely ambiguous taste/strategy
  call, take the **most defensible, least-surprising, smallest-blast-radius default**, **proceed (never block the
  run)**, and queue the question in `docs/design/skill-hardening/FOUNDER-QUEUE.md`. Never let a single agent grind —
  change the approach or the agent (Explore to map, Plan to re-architect, a fresh Opus for an adversarial opinion).

---

# PART A — Stage 5 (MINI App) design + functional iteration

**Execute, in full, the prompt at `plans/19-v2-marketplace-rebuild/stage-5-design-functional-iteration-prompt.md`.**
Read it end-to-end and complete its ENTIRE Definition of Done — it is the authoritative spec for Part A. In brief:
make every interactive mini-app feature actually WORK (the gallery is the reported break; audit the rest), proven by
interaction-driven Playwright e2e that bites; and bring every screen in line with the Stage-5 mockups
(`docs/design/mockups/explore-stage5-*.html` + `direction-a-baania-clean.html`) — photo-forward cards with the
overlaid deal pill + photo-count chip, the search pill, the lifecycle stripe, the claim/viewings treatments;
resolve the queued `S5-*` design items. Full review cadence; deploy to staging; verify on real infra.

### GATE between A and B (do not skip)
Part B does NOT start until **Part A's Definition of Done holds**: every Part-A interactive feature works with a
biting functional test, the screens match the mocks (founder-confirmable / queued), all gates green, **deployed +
verified on staging**, and the tree is a clean committed+pushed checkpoint. Record a short Part-A retro before B.

---

# PART B — Stage 6 (Groups & Dealflow): the private-dealflow layer

**This is the business-differentiation stage** (master plan §2.3/§2.5; D6/D7/D8/D9/D10/D11): groups as first-class
entities, time-based exclusivity windows + interest flags + release mechanics, broker/investor role vetting + admin
screens, and the quick-quote dealflow (quick-sale flag → matched LINE-Flex push to vetted users → structured in-app
quotes). The spec is `plans/19-v2-marketplace-rebuild/stage-6-groups-dealflow.md` — **read it IN FULL** (scope, the
12 key deliverables incl. #12 "delete the v1 read-api", the acceptance criteria, and the **Open questions**).

### B.0 — Approval-waiver note (read this)
The project's normal lifecycle is `skeleton → fleshed spec → FOUNDER APPROVAL → build`. **The founder has explicitly
authorized building Stage 6 in this overnight run, waiving the pre-build approval gate** — BUT you preserve its
spirit: flesh the spec with *documented* defaults, build the well-defined parts, take the *smallest defensible*
version of the genuinely-open strategy calls, and **surface every such default prominently in FOUNDER-QUEUE for
morning review** (it is reversible staging work). Do NOT build an elaborate engine on a guessed strategy — build the
minimal version behind a clean seam and queue the expansion.

### B.1 — Flesh the spec first (a doc; always safe)
Turn the skeleton into a full spec (update its iteration log; status → `BUILD STARTED`), resolving its Open questions
with these **recommended defaults** (each also queued in FOUNDER-QUEUE as a decision point):
- **Quick-sale matching criteria (the core algorithmic question):** default to the **smallest defensible match** —
  a vetted broker/investor is "matched" to a quick-sale listing when their stated preferences overlap the listing on
  **province + property-type + price-band** (reuse the Stage-4 North-Thai price bands). Build it behind a single
  `matchVettedUsers(listing)` seam in `packages/domain` so the algorithm can be swapped. **Queue** the sophistication
  (weighting, radius, deal history) for the founder — do NOT over-build a guessed ranking engine.
- **Admin surface + auth:** default to **admin inside the mini-app** (LIFF auth — already built in Stage 5 — gated by
  an `admin` role on the user), which **sidesteps the deferred D19 domain / 4.4 LINE-Login dependency** (a website
  `/admin` route would need web auth + a real domain, which can't be provisioned autonomously). **Queue** the
  "mini-app admin vs website `/admin`" call. Admin role-checks MUST be server-side in `packages/api`, never UI-gated.
- **Exclusivity window:** 7-day default, configurable per group (D8); the per-group config UI is a minimal admin
  control; queue any tuning. **Release mechanics:** the lapse bot-DM offers release-publicly / release-to-other-groups
  / extend; if ignored, the listing stays group-private (no silent auto-release) — queue the grace-period question.
- **Interest-flag semantics:** a flag is a non-binding signal visible to the poster + admin; multiple flags all show
  (no priority queue in v1); queue richer semantics. **Moderation queue:** a minimal approve/reject queue (not a full
  CRUD panel) in v1; queue the expansion. **Rental renewal loop (D26):** queue it (don't build here).

### B.2 — Build the well-defined deliverables (reviewed increments; sequence by dependency)
Per the fleshed spec, build (smallest-correct, each with its own tests incl. the functional-test discipline for any
UI):
- **Exclusivity-window engine** (`packages/domain`, pure logic: window open/closed, interest-flag state, release
  eligibility — deterministic clocks in tests, never `Date.now()` directly) + its **Postgres state machine** (open →
  interest-flagged → lapsed → released/extended; schema landed in Stage 1 — verify, migrate only if a real gap).
- **Bot DM release-prompt** + response handler (the bot core/adapters; honour the existing webhook→sweep spine).
- **Interest-flag UX** in the mini-app (additive screen/action; the Part-A functional-test discipline applies — it
  must WORK + be driven by an e2e test).
- **Role application flow** (mini-app) → **admin vetting screen** (approve/reject → role in Postgres) +
  **moderation-queue screen** (the listings that failed the Stage-2 quality gate, D11). Admin screens live in the
  mini-app under an `admin`-role gate (server-enforced).
- **Quick-quote dealflow (D10):** quick-sale flag on a listing → `matchVettedUsers` → **LINE Flex push** to matched
  vetted users (test on the unverified channel; no new LIFF registration expected) → **structured quote-response
  screen** in the mini-app → quote stored in Postgres (it feeds Stage 7's AVM).
- **Deliverable #12 — retire the v1 read-api:** confirm CloudWatch `Invocations` on `readApiFn` is flat at 0 across
  the parallel-run window (zero callers since the Stage-5 cutover), THEN delete the code
  (`packages/bot/src/lambda/read-api.ts`, `src/app/readApiHandler.ts`, the `loadReadApiEnv` schema/config) + its
  Pulumi `readApiFn`/Function-URL/IAM resources in one `pulumi up`. If invocations are non-zero, do NOT delete —
  investigate the caller + queue it.

### B.3 — Stage 6 stage gate + Definition of Done
- The exclusivity-window state machine has every transition unit-tested with deterministic clocks; quick-quote push
  **cannot reach unvetted users** (server-side role check, spec-auditor-verified); every Stage-6 UI feature WORKS
  (interaction-driven e2e that bites) and is on-direction.
- Per-increment review cadence throughout; a **Stage 6 stage gate** (high-effort full-diff review, hexagonal
  architecture-conformance, eval scorecard advisory, the functional+style frontend gate on the new flows) run +
  recorded; deployed to staging + verified on real infra (the authenticated/admin paths that need a real LINE login
  are flagged as founder-manual, don't stall).
- `CLAUDE.md` gains a "v2 Groups & Dealflow (Stage 6)" section; `BACKLOG.md`/`SPRINT-LOG.md`/the `deploy-status`
  memory updated; the Stage-6 spec's iteration log + a retro recorded; every strategy default surfaced in
  FOUNDER-QUEUE for morning review.

---

## Key paths
- **Part A:** `plans/19-v2-marketplace-rebuild/stage-5-design-functional-iteration-prompt.md` (authoritative) ·
  mini-app `packages/miniapp/{src,e2e}` · backend `packages/api` · mocks `docs/design/mockups/explore-stage5-*.html`.
- **Part B:** spec `plans/19-v2-marketplace-rebuild/stage-6-groups-dealflow.md` · domain `packages/domain` ·
  db `packages/db` · bot `packages/bot` · mini-app `packages/miniapp` (interest flags / admin / quote screens) ·
  infra `infra/`.
- **Decisions:** master plan `plans/19-v2-marketplace-rebuild.md` (D6/D7/D8/D9/D10/D11/D19/D26) ·
  register `docs/research/00-product-principles.md` · `docs/design/skill-hardening/{HARDENING-LOG,FOUNDER-QUEUE}.md`.
- **Live:** mini-app `https://d15tyvvqffrn4a.cloudfront.net/` · api
  `https://gochky6danrywxavclqadecga40misuh.lambda-url.ap-southeast-1.on.aws` · website
  `https://d15dpmhcgtrf1r.cloudfront.net/`.

## Exit + final report
Stop only when BOTH Definitions of Done hold. Final report, per part: what shipped (with the demo/entry paths), the
per-increment list with commits + review/gate verdicts, the functional-test evidence (+ proof each bites), the
deployed verification, and the founder-decision queue — **especially the Stage-6 strategy defaults** (quick-sale
matching criteria; mini-app-admin vs website `/admin`; exclusivity/interest/moderation defaults) flagged for the
founder's morning review.

---
