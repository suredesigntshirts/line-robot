# Stage 5 — MINI App Rebuild

**Spec status: FLESHED (sprint-01 extension, 2026-06-13) — BUILD NOT STARTED.** Open questions
below are resolved with defensible defaults under the founder's extension ruling; every default is
cheap to reverse and flagged for morning review. No Stage 5 code was written tonight — the flesh
exists so the founder can approve (or amend) the defaults and the build can start next session.

## Purpose

Rebuilds the LINE MINI App (LIFF SPA) from Preact with bespoke CSS to React on `packages/ui`, retiring the v1 read-api and the v1 Preact SPA. Implements the claim/publish opt-in flow (the only path to public listing — D7), and the per-user CRM features (my listings, saved listings, viewings, follow-ups) defined in D13. Keeps edit-by-reply for users editing their own listings. Corresponds to master plan §2 points 1–2, D4, D5 (LIFF side), D7, D13.

## Scope

**In:**
- `packages/miniapp` — rebuilt React SPA using `packages/ui` components; LIFF SDK integration
- Claim/publish opt-in flow: bot sends DM → user opens mini-app → reviews extracted listing → claims ownership → chooses to publish publicly or keep group-private (D7)
- My listings screen: user's claimed listings with lifecycle status; edit-by-reply entry point
- Saved listings screen: listings the user has saved from browse/search
- Viewings screen: upcoming and past viewings (per-user CRM, D13)
- Follow-ups / notes: per-user notes on listings (D13)
- Edit-by-reply: retained for owners editing their own listings via the bot DM chat flow
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
7. Edit-by-reply: bot handler recognizes replies to a listing DM and routes to the extraction pipeline (interactive/sync path)
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
- Edit-by-reply: a reply to a listing DM updates the listing in Postgres via the synchronous pipeline path
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
