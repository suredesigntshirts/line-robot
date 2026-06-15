# /goal prompt — Implement Plan 19 · Stage 5 (MINI App rebuild) as an orchestrated, reviewed build

> **Run-this-prompt artifact.** Written 2026-06-14. Paste the block below after `/goal` (or hand it to a
> fresh session). It assumes **ZERO memory** of any prior session. It is a long-running autonomous goal:
> you act as a **thin orchestrator**, dispatching **Opus sub-agents at the highest reasoning effort
> ("Opus xhigh")** to build Stage 5 in reviewed increments, taking each to completion *with its own
> tests* before moving on. Stop only when the Definition of Done holds.

---

GOAL: Build **Plan 19 · Stage 5 — the LINE MINI App rebuild** to high quality through our normal review
cadence. Rebuild `packages/miniapp` from Preact-with-bespoke-CSS to **React on the (now Tailwind+shadcn-
conformant) `packages/ui`**, stand up the **`packages/api`** HTTP service the SPA reads from, ship the
**claim/publish opt-in flow** (the only path to a public listing — D7) and the **per-user CRM** (my
listings, saved, viewings, follow-ups — D13), retire the v1 Preact SPA, and parallel-run the v1 read-api
for rollback. You are the **orchestrator**: you do not write feature code yourself — you dispatch Opus-xhigh
sub-agents, each of which owns a slice end-to-end (build → test → self-review) and you verify every claim
before accepting it. Run as long as needed; stop only when the Definition of Done below holds.

## Phase 0 — GATE: do not start until the prior session has landed
A separate session is finishing **Plan 21** (Tailwind v4 + shadcn foundation + the `direction-a` redesign
of the website + design-skill hardening). **Stage 5 rides on that work.** Before you write any Stage 5 code:
1. **Confirm the prior session is done and the tree is clean.** `git status` clean (or only your own new
   files); `git log` shows plan-21 committed and pushed; no build is mid-flight. If the tree is dirty with
   someone else's plan-21 work, **WAIT** — re-check on the cadence the founder set (first check after ~1h,
   then every ~15 min) until it's a committed, clean checkpoint. Use `ScheduleWakeup` to pace the waits;
   do not busy-poll.
2. **Read the prior session's notes (in this order) before doing anything else** — they are the real state:
   - `MORNING.md`, `SPRINT-LOG.md` (tail), `BACKLOG.md` (Stage 5 rows + the "founder queue" section).
   - `docs/design/skill-hardening/HARDENING-LOG.md` + `FOUNDER-QUEUE.md` (what the hardened `/frontend-review`
     and `/alignment-review` now enforce, and any open taste calls).
   - The `deploy-status` and `frontend-architecture-conformance` memories (auto-loaded; confirm against them).
3. **Verify the two preconditions Stage 5 depends on actually shipped:**
   - **`packages/ui` is plan-21-conformant** — Tailwind v4 runs, shadcn primitives are owned code, **no
     inline-style objects**, the oklch/old-Android fallback (canon TECH-06) is intact. (Grep `packages/ui`
     for `style={{` → should be gone; confirm `theme.css` `@theme` + a Tailwind pipeline.)
   - **Stage 4 was re-gated PASS** and `plans/19-v2-marketplace-rebuild/stage-5-miniapp-rebuild.md` was
     **amended by plan-21 Phase 3** to bind `direction-a` + `/frontend-review` + the conformant `packages/ui`.
     If that amendment did NOT land, **you do it first** (Phase 1 below) — don't build on the stale spec.
   - If plan 21 is genuinely incomplete (not just un-amended), STOP and report — Stage 5's UI cannot be built
     on a non-conformant `packages/ui`. Do not work around it with bespoke CSS.

## Phase 1 — Reconcile + update the Stage 5 spec (YOU do this, before dispatching builders)
Read `plans/19-v2-marketplace-rebuild/stage-5-miniapp-rebuild.md` end-to-end, then `plans/19-v2-marketplace-
rebuild.md` §2–§4 + the decision register (D4, D5, D7, D13, D26). **The fleshed spec predates two founder
rulings and the entire plan-20/21 frontend overhaul — fix it before building:**

1. **edit-by-reply is RETIRED, not retained.** The spec lists "edit-by-reply kept" as deliverable #7 + an
   acceptance criterion. That is **STALE** — founder ruling **A3a (2026-06-14): "we don't edit via reply
   anymore"** deleted `EditReplyHandler` + the edit-context machinery (see `BACKLOG.md` A3 row). **Remove
   edit-by-reply from Stage 5 scope** (deliverable #7, the acceptance criterion, and the route). Owners edit
   via the claim/mini-app surface, not by replying in chat. Log the correction in the spec's iteration table.
2. **DF-6 "complete your listing" loop — resolve from the founder queue.** Stage 2's gate left this open
   (`BACKLOG.md`: descope vs reschedule into Stage 5). Check `FOUNDER-QUEUE.md` / `BACKLOG.md` for a ruling:
   - **Blessed descope (recommended, consistent with A3a)** → out of Stage 5 scope; note it.
   - **Rescheduled** → add a **non-reply** mini-app "complete your listing" surface to Stage 5 scope.
   - **Unresolved** → take the mock-faithful default (descope), **proceed (never block)**, and queue the
     question for the founder. Do not build a reply-driven flow under any reading.
3. **Bind Stage 5 to the phase-4 frontend improvements** (these did not exist when the spec was fleshed):
   - The mini-app is **React on `packages/ui`** — Tailwind utilities + **owned shadcn primitives**, the shared
     `@theme` tokens, **no inline-style objects, no bespoke CSS** (the Preact `styles.css` is deleted, not
     ported). The **oklch/old-Android fallback matters MORE here** — LIFF renders inside LINE's in-app WebView,
     which is exactly the old Thai-Android Chrome the fallback protects (TECH-06). Make that an explicit gate.
   - **Visual bar = the Stage 5 mocks + `direction-a`**, not "inspiration only." Mocks already exist:
     `docs/design/mockups/explore-stage5-1-claim.html`, `…-2-mylistings.html`, `…-3-viewings.html`, plus the
     language `docs/design/mockups/direction-a-baania-clean.html`. Apply the reframe the perceptual-blindness
     fix set: **style = match the mock; content = schema/code-driven** ("steal the styling, ignore the data").
   - **A frontend gate adapted for the LIFF SPA** is required on every design-bearing increment + at the stage
     gate (see "Review cadence" below). It must render the REAL built SPA in a browser with a **mocked LIFF
     context** and assert computed styles (theme applies), island/route hydration, no broken images, no JS
     errors — the plan-20 net, ported to the mini-app — then a screenshot gallery reviewed vs the Stage 5 mocks.
4. **Re-confirm the resolved open-questions still hold** (they were defensible defaults — re-verify at build):
   route-shape **freeze** (`/` list, `/p/{id}` detail — keep plan-17 Flex deep links + rich-menu tabs working;
   new screens are additive routes); **no rich-menu re-deploy** by default; **v1 read-api parallel-runs**,
   deleted at the Stage 6 gate (not now); **`packages/api` is built in-stage** porting the PROVEN v1 LIFF
   id-token verifier; **claim DM = first DF-6 gate-pass, once, prospective** (`claim_invited_at` guard, no
   retroactive blast); **group-private = source group only** (`listing.source_group_id`).
5. **Write the updated spec + a concrete increment/phase plan into the doc** (iteration table updated, status
   → `BUILD STARTED`). Then dispatch builders against it.

## Definition of Done — STAGE 5 (all must hold)
- **`packages/api`** exists and serves the SPA: LIFF id-token auth (the **ported** v1 verifier — see Key
  paths), endpoints for my-listings, listing detail, claim/publish, saved, viewings, follow-ups. Reads the
  catalog **only via the `@line-robot/db` public barrel** (repository fns) — no other package's internals;
  **no LIFF SDK call anywhere outside `packages/miniapp`**. Deployed via Pulumi with a scoped IAM role.
- **`packages/miniapp`** is a **React SPA on `packages/ui`** (Tailwind + owned shadcn, shared `@theme`,
  oklch/old-Android fallback intact), matching the Stage 5 mocks + `direction-a`. **No Preact, no bespoke
  CSS, no inline-style objects.** Route-shape freeze honoured; new screens additive.
- **Claim/publish flow works end-to-end:** bot DM (first gate-pass, once, `claim_invited_at`-guarded) → LIFF
  deep link → claim screen shows the extracted listing → Publish flips status to active in Postgres → the
  listing appears on the public website within one refresh; **concurrent claims handled** (optimistic lock or
  first-write-wins with a clear message to the loser); "keep group-private" = source-group-only, with the
  Thai boundary copy ("เฉพาะสมาชิกกลุ่มเดิม").
- **Per-user CRM screens** (D13): my listings (with lifecycle status + edit entry points — to the mini-app
  edit surface, **not** edit-by-reply), saved listings, viewings (upcoming/past; creating one writes Postgres),
  follow-ups/notes. (DF-6 completion surface only if the founder rescheduled it — Phase 1 #2.)
- **v1 retired/parked:** the v1 Preact SPA source is **gone** (no surviving imports — grep-proven); a
  **route-compat unit test** asserts every miniapp path the bot's Flex/rich-menu builders emit exists in the
  new SPA router; the v1 read-api **parallel-runs** (zero callers after cutover) with its deletion logged as a
  Stage 6 checklist item.
- **All gates green** (`typecheck`, `lint`, `test`, coverage) + the **LIFF-SPA frontend gate** + the relevant
  **integration tests**; **deployed to staging (Pulumi) and verified on real infra** (deployed frontend gate +
  a live claim-flow spot-check); eval scorecard unaffected (advisory, D21); `CLAUDE.md` + `BACKLOG.md` +
  `SPRINT-LOG.md` + the `deploy-status` memory updated; the **Stage 5 stage gate** run and recorded.

## Operating loop — you as orchestrator (per increment)
1. **Slice the work** from the Phase-1 increment plan. Suggested phases (sequence by dependency; UI and API
   can parallelize once the API contract is frozen — dispatch concurrently then):
   - **A. `packages/api` foundation** — port the LIFF verifier; the read endpoints the SPA needs; `@line-robot/db`
     public-barrel reads only; Pulumi Function-URL/API + scoped role; parallel to the v1 read-api.
   - **B. `packages/miniapp` React shell on `packages/ui`** — Vite + LIFF SDK; router with the frozen route
     shapes + additive routes; list + detail screens authored to the mocks (replaces the Preact screens).
   - **C. Claim/publish flow** — bot DM trigger + `claim_invited_at` guard; claim screen; publish/keep-private
     state writes; concurrent-claim correctness; website-visibility assertion.
   - **D. Per-user CRM** — my listings / saved / viewings / follow-ups (+ DF-6 surface iff rescheduled).
   - **E. Retire + gate** — delete Preact source; route-compat test; rich-menu route check; full frontend +
     stage gate; docs.
2. **Dispatch an Opus-xhigh sub-agent per slice** (`Agent`, `model: opus`, highest reasoning effort). Give it:
   the updated spec section, the exact files/paths, the **docs-first rule** (cache LIFF SDK / Astro-island /
   shadcn / Pulumi docs via `/documentation-downloader` before coding — don't guess an API), and the explicit
   instruction to **take the slice to completion WITH ITS OWN TESTS in an iterative build→test→fix loop** — it
   does not hand back red. It returns: what it built, the tests it added + their results, and any deviation.
3. **Run the full review cadence on each increment** (fresh-context reviewers that did not write the code):
   `/increment-review` (spec auditor + correctness + simplicity critic → skeptic adjudicates); **`/alignment-
   review`** for design-bearing increments (the heuristic register); **the LIFF-SPA `/frontend-review`** for any
   UI increment (real built SPA, mocked LIFF context, computed-style + hydration invariants, gallery vs the
   Stage 5 mocks). Address findings; judgment calls go to the founder queue, not self-adjudicated.
4. **Verify every claim yourself before accepting** — re-run the gate, re-read the diff, confirm the test
   actually asserts the behaviour (not a tautology). Then **deploy** (Pulumi, per `CLAUDE.md`) and **verify on
   real infra**, **commit per increment, push to `main`**, update `BACKLOG.md`/`SPRINT-LOG.md`.
5. **Unstick a confused builder with helper sub-agents.** If a builder loops, thrashes, or returns vague
   "can't figure it out": spawn a focused helper — an **`Explore`** agent to map the blast radius / find the
   real call site; a **`Plan`** agent to re-architect the approach; a **fresh Opus** for an adversarial second
   opinion; **haiku/sonnet** for cheap mechanical sub-tasks. Feed the helper's finding back and re-dispatch.
   Don't let a single agent grind — change the approach or the agent.

## Guardrails (from `CLAUDE.md` — honour exactly)
- **Docs-first** (global rule): cache LIFF SDK + Astro/shadcn + Pulumi docs via `/documentation-downloader`
  before writing against them. Check `docs/llms.txt` first.
- **Hexagonal boundaries:** `packages/api` reads via the `@line-robot/db` PUBLIC barrel only; LIFF SDK stays
  inside `packages/miniapp`; the bot core never imports adapters. Stage gate runs the arch-conformance check.
- **Testing our own app runs HEADLESS** (the headed-real-user rule is only for third-party anti-bot sites).
  Frontend gate = real built artifact in a headless browser, mocked LIFF context, computed-style assertions.
- **Deploy** = Pulumi on the local file backend + passphrase (`~/.line-robot-pulumi-passphrase`),
  `AWS_PROFILE=line-robot`; `npm run build` then `cd infra && pulumi up`. **After a meaningful deploy, run the
  deployed frontend gate + a live claim-flow spot-check** — it catches infra-boundary bugs local can't.
- **LIFF one-time manual steps** (reuse the existing LIFF id if the route shapes are compatible — they are,
  under the freeze; only a NEW LIFF registration or a new rich-menu tab needs a console step) are **optional
  manual steps, never blockers** — document them, don't stall on them.
- **Usage-budget protocol:** `~/.claude/check-usage.sh` roughly hourly (never < 5 min apart); **wrap at 85%,
  hard-stop 95%**; log each reading + mode switch in `SPRINT-LOG.md`. Above 85%, only cheap haiku/sonnet
  cleanups from `.claude/low-token-cleanups.md`.
- **Anti-over-engineering** (simplicity critic weights these as bugs): no interface until the 2nd impl; ports
  only at real seams (LLM, DB, LINE); no one-caller abstractions; no config nobody sets; the deliverable is
  code a human reads without a guide.

## Autonomous founder-decision handling (no founder present mid-run)
Apply the known rulings: edit-by-reply is OUT (A3a); claim/publish is the only public path (D7); group-private
= source group only; `direction-a` + the Stage 5 mocks are the visual target; content is schema-driven; NPA =
calm violet; adapter is Pulumi. For a genuinely ambiguous taste/scope call the rulings don't settle: take the
most mock-faithful / least-surprising default, **proceed (never block the run)**, and queue the question in
`docs/design/skill-hardening/FOUNDER-QUEUE.md`.

## Key paths
- **Spec:** `plans/19-v2-marketplace-rebuild/stage-5-miniapp-rebuild.md` (update it per Phase 1) · master
  `plans/19-v2-marketplace-rebuild.md` (D4/D5/D7/D13/D26).
- **v1 LIFF verifier to PORT into `packages/api`:** `packages/bot/src/adapters/line/lineTokenVerifier.ts`,
  `packages/bot/src/core/ports/lineTokenVerifier.ts`, `packages/bot/src/app/readApiHandler.ts`,
  `packages/bot/src/lambda/read-api.ts` (the read-api Lambda — keep it running, port its proven auth).
- **v1 Preact SPA to retire:** `packages/miniapp/src/{App.tsx,main.tsx,liff.ts,api.ts,styles.css}`,
  `packages/miniapp/src/screens/{List,Detail}.tsx`, `…/components/{Gallery,MapPin}.tsx`, `…/lib/*`.
- **UI foundation to consume:** `packages/ui` (plan-21-conformant: Tailwind + owned shadcn + `theme.css`
  `@theme` + oklch fallback). **Mocks:** `docs/design/mockups/explore-stage5-{1-claim,2-mylistings,3-viewings}.html`
  + `direction-a-baania-clean.html`.
- **DB:** `packages/db` (public barrel; read `packages/db/CLAUDE.md` for migration hand-fixes if schema gaps
  appear — claim state / saved / viewings / follow-ups; edit `packages/domain` zod enums first).
- **Gates/skills:** `/increment-review`, `/alignment-review`, `/frontend-review` (`.claude/skills/…`); the
  plan-20 e2e harness `packages/website/e2e/` (model to port for the LIFF SPA); register
  `docs/research/00-product-principles.md`.

## Exit + final report
Stop only when the Definition of Done holds. Final report: what shipped (with the live LIFF/mini-app entry +
the claim-flow demo path), the per-phase increment list with commits, the review/gate verdicts, the v1-retirement
proof (no surviving Preact imports + the route-compat test + the read-api parked-for-Stage-6 note), the deployed
verification, and the founder-decision queue (DF-6 ruling status + any taste calls).

---
