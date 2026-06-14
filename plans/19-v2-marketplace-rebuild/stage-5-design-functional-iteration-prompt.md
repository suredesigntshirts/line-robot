# /goal prompt — Stage 5 (MINI App) design + functional iteration: match the mocks AND make every feature actually work

> **Run-this-prompt artifact.** Written 2026-06-15. Paste the block below after `/goal` (or hand it to a fresh
> session). It assumes **ZERO memory** of any prior session. It is a long-running autonomous goal: you act as a
> **thin orchestrator**, dispatching **Opus sub-agents at the highest reasoning effort ("Opus xhigh")** to do the
> work in reviewed increments, each taken to completion *with its own tests* before moving on. Stop only when the
> Definition of Done holds.

---

GOAL: Iterate on the **already-built, already-deployed Plan 19 · Stage 5 LINE MINI App** (`packages/miniapp` — React
on `packages/ui`, served at `https://d15tyvvqffrn4a.cloudfront.net/`, backed by `packages/api` at
`https://gochky6danrywxavclqadecga40misuh.lambda-url.ap-southeast-1.on.aws`) on **two axes the first build left
short**, and re-ship it:

1. **Functional correctness — features must actually WORK, not just render.** Several interactive features render,
   are themed, and pass the existing e2e gate, but **do not function**. The founder reports the **photo gallery is
   broken**; treat that as the canonical case and assume others are broken too (tab switching, the save/unsave
   toggle round-trip, book-a-viewing date picker → submit, add-note, the owner edit submit, claim → publish, etc.).
   The **root cause is a test gap**: the e2e suite asserts computed styles + island hydration + "no broken images"
   + "no JS errors", but it does **not drive the real interactions and assert the resulting behavior**. So a feature
   can be styled, themed, and green while being functionally dead.

2. **Mock fidelity — bring every screen in line with the Stage 5 mockups.** The live mini-app is recognizably
   `direction-a` but is **not a faithful match** to the mocks. Known gaps (from a perceptual review of the live
   site): the home/my-listings is a dense single-column list of small-thumbnail cards instead of the mock's
   spacious, **photo-forward** cards; the **deal pill is not overlaid on the photo** and the **photo-count chip** is
   missing; the search is a plain bar, not the mock's rounded **search pill**; the lifecycle **left-accent stripe**
   reads too thin; the mock's **user-identity chrome** (avatar + name + group) is absent; the **"ทรัพย์ดี"
   wordmark** is not surfaced. Flesh each screen out to the mock — "steal the styling, ignore the data."

## THE CORE PRINCIPLE — internalize this; it is the whole point
> **A frontend feature is not "done" because it renders and the theme applies. It is done when a real user can USE
> it, and the e2e test proves that by DRIVING the actual interaction (click / swipe / type / submit / navigate) and
> asserting the functional OUTCOME — not just the computed style.** "Renders but doesn't work" is a distinct bug
> class — the functional analog of plan-21's "renders but unstyled." The gallery is the proof: it passed the style
> gate and is broken. **Every interactive feature gets a Playwright test that FAILS when the feature is broken.** A
> test that drives nothing, or asserts only that an element exists / is styled, is worthless theatre — it is exactly
> how the gallery shipped broken. When you verify a builder's "done", you (the orchestrator) re-run the test, read
> it, and confirm it actually exercises the interaction and would go red if the behavior regressed (not a tautology).

## Orchestrator operating contract — how to run this without drowning in context
You are a **thin orchestrator**: you do not write feature code yourself — you dispatch Opus-xhigh sub-agents, each
owning a PR-sized slice end-to-end (build → test → self-review). This is what makes a long autonomous run survivable
(the heavy per-increment context lives and dies inside each sub-agent; you keep only the distilled result) — but its
benefits are real ONLY if these five disciplines hold. Treat them as load-bearing, not optional:
1. **Delegate substantial slices; do trivia inline.** One agent per slice (or per reviewer seat). Don't dispatch an
   agent for a typo or a one-line doc edit — do it yourself; don't try to build a slice inside the orchestrator —
   delegate it. Match the unit of work to the boundary.
2. **Brief precisely — the sub-agent has ZERO shared context.** It knows only what you tell it: the exact
   files/paths, the frozen contract/interfaces it must consume, the constraints, the docs-first rule, and the
   explicit "take this to completion WITH ITS OWN TESTS — do not hand back red." A wrong build from a vague brief
   costs far more than a long brief; vague briefs are the #1 failure mode.
3. **Verify load-bearing claims cheaply — never blind-trust "all green".** A sub-agent's report is a claim, not a
   fact. Re-run the gate, grep the one invariant, confirm the key test actually BITES (break it → it goes red, not a
   tautology), re-read the critical diff hunk. But do NOT re-do the agent's work — cheap, decisive checks, not full
   re-reads. (Blind trust compounds errors; full re-verification burns the context you delegated to save.)
4. **Externalize state every increment — a sub-agent's reasoning is DISCARDED on return.** Only its final summary
   survives; the dead-ends, subtle decisions, and gotchas it learned are gone unless written to a durable artifact.
   After each increment, persist what matters to `SPRINT-LOG.md`, the spec's iteration log, the `deploy-status`
   memory, and code comments — so the NEXT sub-agent's brief is accurate AND a fresh orchestrator can reconstruct
   the whole thread from files alone.
5. **Stay thin + assume you'll be cleared.** Keep your own context lean — distilled results, not raw agent
   transcripts or whole-file dumps (read excerpts, not entire files; let the agents hold the bulk). Over a long run
   the orchestrator itself gets summarized/cleared, so **the durable artifacts — not your memory — are the source of
   truth.** That is exactly what makes clearing context between stages safe: a fresh orchestrator re-reads the goal
   prompt + the plan/spec + `SPRINT-LOG.md` + the `deploy-status` memory and resumes. If a single agent loops or
   thrashes, don't let it grind — change the approach or the agent.

## Phase 0 — Orient (no upstream gate; Stage 5 is already built + live)
Read, in this order, before doing anything else — these are the real state:
- `plans/19-v2-marketplace-rebuild/stage-5-miniapp-rebuild.md` (the Stage-5 spec + its iteration log) and the master
  plan `plans/19-v2-marketplace-rebuild.md` §2 + D4/D7/D13.
- The `deploy-status` memory (auto-loaded) — Stage 5 is DEPLOYED + VERIFIED on staging (api 401/CORS/boot; the new
  React SPA serves; sweep redeployed; claim DMs ON). The website's `direction-a` redesign is also now live.
- `docs/design/skill-hardening/FOUNDER-QUEUE.md` **S5-1…S5-11** — the design taste/scope calls already queued
  (thin left-stripe, missing profile chrome, deed-type on the claim screen, the "นัดดูทรัพย์" term, etc.). These are
  inputs to the design work, not separate tickets.
- **The mocks (the visual bar):** `docs/design/mockups/explore-stage5-1-claim.html`, `…-2-mylistings.html`,
  `…-3-viewings.html`, plus the language `docs/design/mockups/direction-a-baania-clean.html`. Render them (headless
  Chromium, mobile viewport) to PNG for image-vs-image comparison.
- **The mini-app code:** `packages/miniapp/src/{app,screens,components,lib}` (the React SPA — routes `/`,
  `/p/{id}`, `/claim/{id}`, `/edit/{id}`; screens MyListings/Detail/Claim/Edit + Saved/Viewings panels +
  SaveToggle/BookViewing/NotesSection/Gallery/etc.) and the **i18n** in `packages/ui/src/i18n/{th,en}.ts`.
- **The existing e2e harness (the thing to upgrade):** `packages/miniapp/e2e/` (`gate.spec.ts`, `claim.spec.ts`,
  `crm.spec.ts`, `support.ts` with `assertThemeApplies`/`assertThaiBodyLineHeight`/`assertCtaContrast`/
  `assertColorScheme`, `mocks/liff.ts`) — note it **mocks the api via `page.route` with fixtures and mocks the LIFF
  SDK**, builds the REAL SPA, and asserts STYLE + render. Understand exactly what it does and does NOT exercise.
- **The api contract** the SPA reads from: `packages/api/src/handler.ts` (the endpoint shapes), and the public model
  via the `@line-robot/db` barrel. The deployed-frontend gate pattern for the website lives in
  `packages/website/e2e/` (the plan-20 net) — model its discipline.

## Phase 1 — AUDIT: what actually works vs. what only renders, and where it diverges from the mock (YOU do this first)
Produce a **per-screen, per-feature matrix** before fixing anything. For EVERY interactive element on EVERY screen
(my-listings home + tabs, detail + its gallery + save/book/notes, claim → publish/keep-private, edit, saved,
viewings + book), record three columns:
- **Functions?** — drive the real interaction against the REAL built SPA in a headless browser (click/swipe/type/
  submit/navigate) and observe whether it does what it should. Capture a screenshot/trace of each. The gallery is a
  known FAIL — find the rest. (E.g.: does the gallery actually advance photos on swipe/click + reflect the active
  photo + show the count? Does the save toggle round-trip — POST then a re-fetch shows saved? Does book-a-viewing's
  picker submit and the viewing appear? Do tabs switch? Does the edit form PATCH and reflect?)
- **Tested?** — does an existing e2e test actually DRIVE this interaction and assert the outcome (not just style/
  existence)? Almost all will be "no" — that's the gap.
- **Matches the mock?** — image-vs-image against the rendered mock, STYLE only. Note each divergence.

Dispatch `Explore`/Opus probes to map the code paths (e.g. how the gallery is implemented, why it doesn't navigate).
Output the matrix + a prioritized fix list (broken-and-core first: gallery, claim/publish, the CRM round-trips) into
a working doc (e.g. append to the Stage-5 spec's iteration section or a `docs/design/skill-hardening/` note). This
matrix is the increment plan.

## Phase 2 — Upgrade the test discipline so it proves FUNCTION (do this BEFORE/ALONGSIDE the first fix)
The deliverable here is a **functional e2e layer** that makes "renders but doesn't work" impossible to ship green:
- **Drive real interactions.** Tests use Playwright to click, swipe (touch/drag or keyboard), type, submit, and
  navigate, then assert the **DOM/route/state change** that proves the feature worked — e.g. the gallery's active
  image `src`/index changes and the count is right; tabs change the rendered panel; the save toggle flips AND a
  re-fetch reflects it; a created viewing appears in the list; a note appears after add; an edit PATCH is sent with
  the right body and the success state shows; claim → 409-loser path AND the happy path → publish.
- **Make the api mock behaviorally STATEFUL (or use a real backend).** The current `page.route` fixtures are static,
  so round-trips can't be tested. Either (a) make the mock stateful (a POST `/save` mutates the state the subsequent
  GET `/me/saved` returns; create-viewing/add-note/edit likewise), and/or (b) stand up a **real backend path** for
  the critical flows — `packages/api` against a **seeded Postgres** (mirror the website's plan-20 Docker-PG harness)
  with the LIFF verifier stubbed to a known test user — so the claim/publish + CRM mutations are tested end-to-end
  against the real contract, not a hand-rolled fake. Prefer (b) for claim/publish + at least one CRM round-trip; (a)
  is acceptable for the rest if stateful. Document the choice.
- **Each invariant must BITE.** For every new functional test, prove it fails when the feature is broken (revert the
  fix or inject a no-op handler → the test goes red), exactly as the plan-21 deterministic invariants were proven to
  bite. A test that stays green when you break the feature is the bug, not the feature.
- **Keep the style invariants.** The existing computed-style net (theme/TH-07/contrast/colorScheme/no-broken-images)
  stays and extends to any new surface (mark Thai body `data-th-content`, solid CTAs `data-cta-solid`). Functional
  and stylistic gates are both required; neither replaces the other.

## Phase 3 — Fix the broken features + bring each screen in line with the mock (the build, in reviewed increments)
Work screen-by-screen (broken-and-core first), each increment to completion with BOTH its functional tests and its
mock-faithful styling:
- **Detail gallery (first — it's the reported break):** a real, working photo gallery — swipe/scroll-snap + tappable
  thumbnails that change the active photo + the photo-count chip — authored in Tailwind/`packages/ui` (no inline
  styles), matched to the mock's photo treatment. Functional test drives navigation + asserts the active photo
  changes. (The shared `packages/ui` `Gallery.tsx` carries inline styles — either fix it to canon or keep the
  mini-app's own Tailwind gallery; don't reintroduce inline-style objects.)
- **My-listings home → mock-faithful:** spacious **photo-forward** cards (large hero, the **deal pill overlaid on
  the photo**, the **photo-count chip**), the **search pill**, a thicker lifecycle **left-accent stripe**, the
  section-header treatment, and the **user-identity chrome** if the schema/LIFF profile can supply it (else queue
  it). Resolve the FOUNDER-QUEUE S5-* design items here (apply the mock-faithful default, surface genuine taste
  calls). Verify tab switching FUNCTIONS.
- **Claim / publish / keep-private:** match `explore-stage5-1-claim.html`; the publish + keep-private + 409-loser
  paths each have a functional test. Consider S5-7 (deed-type / "verify details" on the claim screen) — apply the
  mock-faithful default and surface to the founder.
- **Viewings + book-a-viewing:** match `explore-stage5-3-viewings.html` (date-chip rows, status badges, the
  upcoming/past split); the picker → submit → the viewing appears is a functional test.
- **Saved / notes / edit:** functional round-trips tested; styling on-direction.
- Content stays schema-driven; only the **styling** matches the mock. Where a listing has no photo, the placeholder
  must read intentionally (the live grid currently looks empty/blue because most listings lack photos — make the
  empty-photo state look deliberate, and note the photo-coverage data gap as a non-blocking founder item).

## Review cadence (per `CLAUDE.md` §Quality system — every increment, fresh-context reviewers that did not write it)
- `/increment-review` (spec auditor + correctness via the installed `/code-review` + simplicity critic → skeptic
  adjudicates). The **correctness seat must now also confirm the functional tests genuinely drive the interaction
  and bite** — a feature whose test doesn't exercise it is a correctness finding.
- `/alignment-review` (the heuristic register) for the design-bearing work.
- `/frontend-review` for every UI increment — **upgraded here**: it must (1) render the REAL built SPA with the
  mocked LIFF context and assert the computed-style invariants (the existing net), **(2) DRIVE the feature's real
  interactions and assert the functional outcome** (the new requirement), and (3) compare the screenshot/recording
  gallery to the Stage-5 mocks (image-vs-image, source-forbidden — surface divergences to the founder). LLM pixel/
  behavior perception is unreliable (see `docs/design/skill-hardening/HARDENING-LOG.md`) — the deterministic
  functional + computed-style assertions are the reliable layer; the orchestrator verifies any "it works"/"it
  matches" claim against the actual run before accepting.
- Verify every claim yourself (re-run the gate, re-read the diff, confirm the test asserts behavior not a tautology),
  then **deploy** (per `CLAUDE.md`) and **verify on real infra**, **commit per increment, push to `main`**, update
  `BACKLOG.md`/`SPRINT-LOG.md`/the `deploy-status` memory.

## Guardrails (from `CLAUDE.md` — honour exactly)
- **Testing our own app runs HEADLESS** (the headed-real-user rule is only for third-party anti-bot sites). The
  functional + style gate = the real built artifact in a headless browser, driven by real interactions.
- **Hexagonal boundaries:** the LIFF SDK stays inside `packages/miniapp`; the SPA talks to `packages/api` over HTTP
  only; `packages/api` reads the catalog via the `@line-robot/db` PUBLIC barrel only; no `@line/liff` in `api`.
- **No inline-style objects / no bespoke CSS** (canon TECH-14/AP-9) — Tailwind utilities + owned shadcn on the
  shared `@theme` + the oklch/old-Android fallback (TECH-06 matters MORE inside LINE's WebView).
- **Docs-first** (global rule): cache Playwright / LIFF SDK / Tailwind docs via `/documentation-downloader` before
  writing against them; check `docs/llms.txt` first.
- **Anti-over-engineering** (simplicity critic weights as bugs): no interface until the 2nd impl; no one-caller
  abstractions; no config nobody sets; the deliverable is code a human reads without a guide. Don't pull a heavy
  gallery/date-picker dep if a native element or a small owned component suffices.
- **Deploy** = Pulumi on the local file backend + passphrase (`~/.line-robot-pulumi-passphrase`),
  `AWS_PROFILE=line-robot`; `npm run build` then `cd infra && pulumi up`. The mini-app SPA's `VITE_API_URL` is
  already wired to the deployed api Function URL (`packages/miniapp/.env.production`) — keep it. After a meaningful
  deploy, re-run the deployed checks; the full authenticated claim spot-check needs a real LIFF login (founder
  manual) — note it, don't stall.
- **Usage-budget protocol:** `~/.claude/check-usage.sh` roughly hourly (never < 5 min apart); wrap at 85%,
  hard-stop 95%; log each reading + mode switch in `SPRINT-LOG.md`. Above 85%, only cheap haiku/sonnet cleanups.
- **Autonomous founder-decision handling:** apply the known rulings (edit-by-reply OUT [A3a]; DF-6 descoped;
  `direction-a` + the Stage-5 mocks are the visual target; content schema-driven; claim/publish is the only public
  path). For a genuinely ambiguous taste call, take the most mock-faithful default, **proceed (never block)**, and
  queue it in `docs/design/skill-hardening/FOUNDER-QUEUE.md`.

## Definition of Done
- **Every interactive feature WORKS** — driven by a Playwright e2e test that exercises the real interaction and
  asserts the functional outcome, each proven to BITE (goes red when the feature is broken). The gallery works
  (navigates + count); the CRM round-trips (save/viewings/notes/edit), the claim→publish/keep-private flow, and tab
  navigation all have passing functional tests. The audit matrix's "Functions?" column is all green, with evidence.
- **Every screen matches the Stage-5 mocks** (image-vs-image, founder-confirmable): photo-forward cards with the
  overlaid deal pill + photo-count chip, the search pill, the lifecycle stripe, the claim/viewings treatments — the
  divergences from the perceptual review are closed or explicitly founder-queued.
- **All gates green:** `typecheck`, `lint`, `test`, coverage; the upgraded `npm run test:e2e -w @line-robot/miniapp`
  (functional + computed-style); `/increment-review` + `/alignment-review` + the upgraded `/frontend-review`.
- **Deployed to staging (Pulumi) and verified on real infra** (the deployed checks; live interaction smoke where
  LIFF auth allows). `CLAUDE.md`/`BACKLOG.md`/`SPRINT-LOG.md`/`deploy-status` memory updated; the FOUNDER-QUEUE
  reflects the resolved/remaining design calls. A short retro recorded.

## Key paths
- **Mini-app:** `packages/miniapp/src/{app,screens,components,lib}` · **e2e:** `packages/miniapp/e2e/` ·
  **i18n:** `packages/ui/src/i18n/{th,en}.ts` · **backend:** `packages/api/src/handler.ts`.
- **Mocks:** `docs/design/mockups/explore-stage5-{1-claim,2-mylistings,3-viewings}.html` +
  `direction-a-baania-clean.html` (render to PNG for the visual bar).
- **Reference harness:** `packages/website/e2e/` (the plan-20 net — Docker-PG + real built artifact discipline).
- **Skills/register:** `/increment-review`, `/alignment-review`, `/frontend-review` (`.claude/skills/…`);
  `docs/research/00-product-principles.md`; `docs/design/skill-hardening/{HARDENING-LOG,FOUNDER-QUEUE}.md`.
- **Live:** mini-app `https://d15tyvvqffrn4a.cloudfront.net/` · api
  `https://gochky6danrywxavclqadecga40misuh.lambda-url.ap-southeast-1.on.aws` · website
  `https://d15dpmhcgtrf1r.cloudfront.net/`.

## Exit + final report
Stop only when the Definition of Done holds. Final report: the audit matrix (before → after, with the functional
evidence), the per-screen mock-fidelity before/after, the new functional e2e tests (+ proof each bites), the
review/gate verdicts, the deployed verification, and the founder-decision queue (resolved + remaining design calls).

> **Next goal after this lands (separate prompt):** flesh the **Stage 6 — Groups & Dealflow** skeleton
> (`plans/19-v2-marketplace-rebuild/stage-6-groups-dealflow.md`) into a full spec for founder approval — exclusivity
> windows, role vetting + admin screens, the quick-quote dealflow — resolving its open questions (quick-sale matching
> criteria; admin surface + auth, which pivots on the D19 domain / 4.4 LINE-Login decision). Do NOT start Stage 6 here.

---
