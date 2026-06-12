# Stage 5 — MINI App Rebuild

**Spec status: SKELETON.** This document is fleshed into a full spec, iterated with the user, and approved before any code for this stage is written. (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

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

## Open questions (resolve when fleshing this spec)

- **LIFF deep-link compatibility**: the existing LIFF links from plan 17 (miniappUrl config, deep links in Flex cards) use specific LIFF URL patterns — will the rebuilt mini-app's routing be compatible, or do the Flex card templates in `packages/bot` need to be updated? A broken deep link silently fails for users already in chats
- **Rich menu updates**: do any of the current rich menu tabs need to change to point to new mini-app routes? If yes, the rich menu must be re-deployed (manual step with the setup script from CLAUDE.md) — this must be identified before Stage 5 starts
- **v1 read-api cutover**: when exactly is the v1 read-api Lambda removed? Is there a parallel-run period or a hard cutover? Any external clients (bots, scripts) depending on it must be identified
- **Stage 4 auth dependency**: can Stage 5 proceed with a stubbed LIFF token validator before Stage 4's `packages/api` auth is complete, or is Stage 4 a hard prerequisite?
- **Claim flow bot DM trigger**: what exactly triggers the bot to send the claim DM? Is it every new extracted listing, or only listings above a quality threshold? Does the poster receive a DM for every listing they've ever posted, or only new ones after Stage 2 goes live?
- **Publish to group-private vs public**: the claim flow offers both options (D7); what does "group-private" mean in the mini-app UI — visible to which groups? Only the group where it was originally posted?

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), Playwright smoke (if user-facing), docs updated.

Stage-5-specific review notes:
- Playwright smoke covers the claim flow end-to-end (requires a test LIFF context or mock — define the test strategy in the fleshed spec); also covers my listings, saved listings, and edit-by-reply
- The spec auditor verifies that the v1 Preact SPA and v1 read-api are genuinely gone — grep for any surviving imports or Lambda resource definitions; any survivor is a defect
- The correctness reviewer focuses on the claim flow: concurrent claims on the same listing must be handled correctly (optimistic lock or first-write-wins with a clear error message to the second claimant)

## Iteration log

| Date | What changed | Why |
|---|---|---|
| (empty — filled during flesh-out and build) |
