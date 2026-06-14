# Stage 5 — MINI App Rebuild

**Spec status: BUILD STARTED (2026-06-14 — orchestrated build takeover).** The 2026-06-13 flesh
predated two founder rulings (A3a) and the plan-20/21 frontend overhaul; it is reconciled in
"Reconciliation for build" below (edit-by-reply removed, DF-6 descoped, bound to the plan-21
`packages/ui` + `direction-a` + the ported LIFF frontend gate) before any builders were dispatched.
Open questions remain resolved with the defensible defaults below; the A–E increment plan is the
build order.

> **Inherits the plan-21 frontend foundation (added 2026-06-14).** The shared `@line-robot/ui` is now
> Tailwind v4 + owned shadcn + the `direction-a` token/component system (cards, badges, price, states,
> spec table, accordion, CTA — all in Tailwind utilities, no inline-style objects per canon TECH-14/AP-9).
> Stage 5 **consumes these directly** (re-style only where the mini-app's LIFF chrome genuinely differs).
> Its visual gate is **`direction-a` + `/frontend-review`**, and the same deterministic computed-style
> invariants apply (TH-06/07 line-height, WCAG-AA CTA contrast, theme/oklch fallback) — add a marker +
> assertion for any new measurable rule. Author in Tailwind utilities/shadcn; never inline-style objects.

## Purpose

Rebuilds the LINE MINI App (LIFF SPA) from Preact with bespoke CSS to React on `packages/ui`, retiring the v1 read-api and the v1 Preact SPA. Implements the claim/publish opt-in flow (the only path to public listing — D7), and the per-user CRM features (my listings, saved listings, viewings, follow-ups) defined in D13. Owners edit their own listings via a mini-app edit surface (edit-by-reply was retired 2026-06-14 per founder ruling A3a). Corresponds to master plan §2 points 1–2, D4, D5 (LIFF side), D7, D13.

## Scope

**In:**
- `packages/miniapp` — rebuilt React SPA using `packages/ui` components; LIFF SDK integration
- Claim/publish opt-in flow: bot sends DM → user opens mini-app → reviews extracted listing → claims ownership → chooses to publish publicly or keep group-private (D7)
- My listings screen: user's claimed listings with lifecycle status; edit-by-reply entry point
- Saved listings screen: listings the user has saved from browse/search
- Viewings screen: upcoming and past viewings (per-user CRM, D13)
- Follow-ups / notes: per-user notes on listings (D13)
- Listing edit surface **in the mini-app** for owners editing their own listings (replaces edit-by-reply, retired 2026-06-14 per A3a; edits write to Postgres via `packages/api`)
- LIFF token → `packages/api` auth (LIFF always uses LIFF token, not the website LINE Login flow)
- Deep links from the existing MINI App: compatibility with existing LIFF links from plan 17 (or a defined migration path)
- Retirement of the v1 Preact SPA (`packages/miniapp` v1 deleted or the v1 LIFF app replaced)
- Retirement of the v1 membership-gated read-api (replaced by the new `packages/api`)

**Out (explicitly):**
- Group management or exclusivity screens (Stage 6)
- Quick-quote flow or broker/investor admin (Stage 6)
- AVM estimate display (Stage 7, though Stage 5 mini-app may show a placeholder)
- Website auth flows (Stage 4 — LIFF and website use different auth mechanisms)
- Public browse/search (Stage 4 — the mini-app is for authenticated users with a LINE context; public browse is on the website)

## Key deliverables

1. `packages/miniapp` React SPA using `packages/ui`, LIFF SDK integrated, deployed via Pulumi
2. Claim flow: bot DM push → LIFF deep link → claim screen → publish/keep-private decision → Postgres state update
3. My listings screen (all user's listings with lifecycle status and edit entry points)
4. Saved listings screen
5. Viewings screen (upcoming/past)
6. Follow-ups/notes screen (per-listing user notes)
7. **Listing edit surface in the mini-app** — owners edit their own listings' fields from the mini-app; edits write to Postgres via `packages/api` (NOT edit-by-reply — that path was retired 2026-06-14 per A3a)
8. v1 Preact SPA removed from the codebase
9. v1 read-api Lambda removed (or confirmed deprecated with a cutover date)
10. Rich menu updated if any tabs point to v1 LIFF paths (route update)

## Dependencies

- Stage 3 must be complete: `packages/ui` components required
- Stage 4 must be partially complete: specifically, `packages/api` auth (LIFF token validation) must exist before the mini-app can authenticate — confirm whether this is a hard dependency or whether Stage 5 can stub it
- Stage 1 must be complete: Postgres schema required for claim/viewings/saved data
- Stage 2 must be complete: pipeline must be writing listings to Postgres for the claim flow to have listings to claim
- LIFF app registration: existing LIFF ID (plan 17) is reused if URL structure is compatible; otherwise a new LIFF registration is required in LINE console

## Acceptance criteria (sketch)

- End-to-end claim flow: bot DM sent → user taps LIFF link → claim screen shows extracted listing fields → user taps Publish → listing status changes to active in Postgres → listing appears on the public website (Stage 4) within one page refresh
- My listings screen shows all listings owned by the authenticated LINE user with correct lifecycle status
- Saved listings screen shows listings the user saved from the website or mini-app
- Viewings screen shows future and past viewings; creating a viewing from the mini-app creates a record in Postgres
- Owner edit: editing a field on a listing the user owns (via the mini-app edit surface) writes to Postgres through `packages/api`; no reply-driven edit path exists (grep-proven absent)
- v1 Preact source files are absent from the codebase; no import references remain
- v1 read-api is unreachable (Lambda deleted or returning 410) and no existing mini-app URL relies on it
- TypeScript strict-mode clean; no LIFF SDK calls outside `packages/miniapp`

## Open questions — RESOLVED (sprint-01 extension defaults; founder review before build)

- **LIFF deep-link compatibility → route-shape freeze.** The rebuilt SPA keeps the EXACT v1 route
  shapes (`/` list, `/p/{id}` detail — the shapes plan 17's Flex deep links and the rich menu
  already use); new screens are additive routes. Existing chat links and the LIFF id keep working;
  no Flex template changes. A route-compat check (grep bot card builders for miniapp paths → assert
  each exists in the SPA router) becomes a Stage 5 unit test.
- **Rich menu → no re-deploy by default.** Tab routes are stable under the route-shape freeze. If
  a new tab is wanted (e.g. "My Listings" direct), that is a founder choice + the documented
  one-time setup-script run — listed as an optional manual step, never a blocker.
- **v1 read-api cutover → parallel-run, delete at the Stage 6 gate.** The new `packages/api`
  serves the rebuilt SPA from day one; the v1 read-api stays deployed (zero callers after cutover)
  through the Stage 5 gate as rollback, and its deletion is an explicit Stage 6 checklist item.
  Known callers: only the v1 SPA (grep-verified at flesh time; re-verify at build).
- **Stage 4 auth dependency → NOT a prerequisite.** Stage 4 deferred website auth entirely (logged
  in its iteration table), so Stage 5 builds `packages/api` itself, porting the PROVEN LIFF
  id-token verifier from the v1 read-api adapter (spine-audit row 7: KEEP). LIFF token is the only
  mini-app auth mechanism; no coupling to the website's LINE Login flow.
- **Claim DM trigger → gate-passing listings only, once, prospectively.** The DM is sent on a
  listing's FIRST DF-6 gate pass after Stage 5 ships (no retroactive blast — push quota + spam
  risk), exactly once per listing (a `claim_invited_at` timestamp guards re-sends). Listings that
  never pass the gate surface through the DF-6 ask loop instead.
- **Group-private semantics → source group only.** "Keep group-private" = visible to members of
  `listing.source_group_id` only (matches the exclusivity model). Cross-group visibility is Stage 6
  dealflow scope; the claim UI copy says "เฉพาะสมาชิกกลุ่มเดิม" to make the boundary explicit.

## Reconciliation for build (2026-06-14 — build takeover)

The flesh (2026-06-13) predated two founder rulings and the plan-20/21 frontend overhaul. Reconciled
here before dispatching builders; each correction is logged in the iteration table.

- **Edit-by-reply is RETIRED, not retained (founder ruling A3a, 2026-06-14: "we don't edit via reply
  anymore").** `EditReplyHandler` + the edit-context machinery were already deleted (BACKLOG A3a/A3b,
  commits `c482d84` / `1fefbfd`). Owners edit via a **mini-app edit surface**, never by replying in chat.
  This supersedes D13's "edit-by-reply survives for own listings" clause; D13's CRM split otherwise holds.
  Removed from Purpose, Scope, deliverable #7, acceptance criterion, and the route set.
- **DF-6 "complete your listing" loop → DESCOPED (mock-faithful default, queued).** The Stage 2 gate (A8)
  left DF-6 open (descope vs reschedule); the founder queue's recommended default — consistent with A3a —
  is to **bless the descope** (DF-6 superseded by claim/publish + admin moderation). No ruling has landed,
  so per the build prompt ("unresolved → mock-faithful default = descope, proceed, queue it") we **descope
  DF-6 from Stage 5** and keep the question in `docs/design/skill-hardening/FOUNDER-QUEUE.md` + MORNING §3.2.
  **No reply-driven flow is built under any reading.** If the founder reschedules it, add a NON-reply
  mini-app "complete your listing" surface — additive, no spec rewrite.
- **Frontend foundation = plan-21 (see the top blockquote).** React on `packages/ui` (Tailwind utilities +
  owned shadcn, shared `@theme`, oklch/old-Android fallback — TECH-06 matters MORE inside LINE's in-app
  WebView). Visual bar = the Stage 5 mocks (`docs/design/mockups/explore-stage5-{1-claim,2-mylistings,
  3-viewings}.html`) + `direction-a-baania-clean.html`; **style = match the mock, content = schema/code-
  driven.** No Preact, no bespoke CSS, no inline-style objects. **Conformance caveat:** `packages/ui`'s
  shared `Gallery.tsx` and the website map islands still carry inline-style objects (plan-21's five visual
  passes did not cover island components) — the mini-app gallery must be authored/refactored in Tailwind,
  not reuse the inline-styled `Gallery`.
- **LIFF-SPA frontend gate (required — every design-bearing increment + the stage gate).** Port the plan-20
  net (`packages/website/e2e/`) to the mini-app: render the REAL built SPA headless with a **mocked LIFF
  context**, assert computed styles (`assertThemeApplies`), route/island hydration, the deterministic
  invariants (`assertThaiBodyLineHeight` ≥1.6, `assertCtaContrast` ≥4.5 — add a marker + assertion for any
  NEW measurable rule per canon TECH-14), no broken images, no JS errors; then a screenshot gallery reviewed
  vs the Stage 5 mocks (image-vs-image, source-forbidden — the hardened `/frontend-review` Mode B).
- **Open questions re-confirmed (still hold):** route-shape freeze (`/` list, `/p/{id}` detail — plan-17
  Flex deep links + rich-menu tabs keep working; new screens additive); no rich-menu re-deploy by default;
  v1 read-api parallel-runs, deleted at the Stage 6 gate; `packages/api` built in-stage porting the PROVEN
  v1 LIFF id-token verifier; claim DM = first DF-6 gate-pass, once, prospective (`claim_invited_at` guard);
  group-private = source group only (`listing.source_group_id`), copy "เฉพาะสมาชิกกลุ่มเดิม".

## Increment / phase plan (build order)

Sequenced by dependency; B/C/D parallelize once the API contract is frozen in A. Each phase is taken to
completion WITH ITS OWN TESTS (build→test→fix to green) before review; every increment runs the full cadence
(`/increment-review`; `/alignment-review` for design-bearing; the LIFF-SPA `/frontend-review` for any UI),
then deploy + verify on real infra + commit + push.

- **A — `packages/api` foundation.** Port the v1 LIFF id-token verifier; read endpoints (my-listings, listing
  detail, saved, viewings, follow-ups) + writes (claim/publish, save/unsave, create-viewing, add-note/edit
  listing). `@line-robot/db` public-barrel reads only; **no LIFF SDK**. Pulumi Function-URL + scoped IAM role;
  parallel to the v1 read-api. Freezing the contract here unblocks B/C/D concurrently.
- **B — `packages/miniapp` React shell on `packages/ui`.** Vite + LIFF SDK; router with the frozen route
  shapes + additive routes; list + detail screens authored to the mocks (replace the Preact screens).
- **C — Claim/publish flow.** Bot DM trigger (`claim_invited_at` guard; first gate-pass; once; prospective);
  claim screen; publish / keep-group-private state writes; concurrent-claim correctness (optimistic lock or
  first-write-wins + a clear message to the loser); assert the listing appears on the public website.
- **D — Per-user CRM.** My listings (lifecycle status + edit entry points → the mini-app edit surface), saved,
  viewings (upcoming/past; creating one writes Postgres), follow-ups/notes. (DF-6 surface only iff rescheduled.)
- **E — Retire + gate.** Delete the Preact source (grep-proven no surviving imports); route-compat unit test;
  rich-menu route check; full LIFF-SPA frontend gate + the Stage 5 stage gate; docs + memories updated.

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), Playwright smoke (if user-facing), docs updated.

Stage-5-specific review notes:
- Playwright smoke covers the claim flow end-to-end (requires a test LIFF context or mock — define the test strategy in the fleshed spec); also covers my listings, saved listings, and edit-by-reply
- The spec auditor verifies that the v1 Preact SPA and v1 read-api are genuinely gone — grep for any surviving imports or Lambda resource definitions; any survivor is a defect
- The correctness reviewer focuses on the claim flow: concurrent claims on the same listing must be handled correctly (optimistic lock or first-write-wins with a clear error message to the second claimant)

## Iteration log

| Date | What changed | Why |
|---|---|---|
| 2026-06-13 | SKELETON→FLESHED under the sprint-01 extension; defaults: v1 route-shape freeze (deep links keep working), no rich-menu re-deploy, read-api parallel-run until Stage 6, packages/api built in-stage with the ported v1 LIFF verifier, claim DM = first gate-pass / once / prospective, group-private = source group only. **No build started** | Founder cascade ruling ("keep doing that until time is finished"); flesh-only because the remaining sprint window could not fit a reviewed Stage 5 increment |
| 2026-06-14 | **BUILD STARTED (takeover).** Reconciled the fleshed spec to the post-flesh rulings/overhaul: removed edit-by-reply (Purpose / Scope / deliverable #7 / acceptance / route) per A3a; descoped DF-6 (queued) as the mock-faithful default; bound the build to plan-21's `packages/ui` + `direction-a` + the ported plan-20 LIFF frontend gate (deterministic invariants); flagged the `Gallery` / island inline-style conformance caveat; added the A–E increment plan. Re-confirmed the resolved open questions. | A separate session landed plan-21 then exited mid-plan-22 (work preserved + stashed); the Stage-5 build prompt requires reconciling the stale flesh before dispatching builders |
