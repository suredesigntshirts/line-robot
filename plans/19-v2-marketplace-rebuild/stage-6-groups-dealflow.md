# Stage 6 — Groups & Dealflow

**Spec status: SKELETON.** This document is fleshed into a full spec, iterated with the user, and approved before any code for this stage is written. (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

## Purpose

Makes groups first-class entities and activates the private dealflow features that are the platform's core business differentiation: time-based exclusivity windows within LINE-mirrored groups, interest flags, release mechanics, admin-vetting of broker/investor roles, admin screens, and the quick-quote push flow (LINE Flex push to matched vetted users → structured in-app quotes). Corresponds to master plan §2 points 3 and 5, D6, D7, D8, D9, D10, D11.

## Scope

**In:**
- Group entity promotion: LINE chat mirrors are first-class entities in Postgres (schema landed in Stage 1; behaviors built here)
- Exclusivity window mechanics: time-based window starts when a listing is extracted from a group; default 7 days (configurable per group); interest flags allow members to hold the listing within the window
- Release mechanics: when the window lapses (or the poster manually releases), the poster is prompted (via bot DM) to release publicly, release to other groups, or extend; confirmation recorded in Postgres (D7/D8)
- Interest flag UX: group members can flag interest on a listing in the mini-app; flags are visible to the poster and admin
- Broker / investor role vetting: admin reviews and approves/rejects broker and investor role applications (D9); vetting status tracked in Postgres (schema from Stage 1)
- Admin screens: web-based (part of Stage 4's website or a separate `/admin` route) for moderation queue review (D11), role vetting, group management — location to be confirmed in flesh-out
- Quick-quote flow (D10):
  - Owner marks a listing as quick-sale (discounted, time-sensitive)
  - System identifies matched vetted brokers/investors (matching criteria TBD — see Open questions)
  - LINE Flex push sent to matched users via bot
  - Vetted users respond with structured quotes in the mini-app (quote stored in Postgres; also feeds Stage 7 AVM)
- Moderation review queue UI: admin reviews listings that failed the Stage 2 quality gate (D11)

**Out (explicitly):**
- AVM price estimates (Stage 7 — though quotes collected here feed Stage 7)
- Web-native groups (master plan D6 defers this to post-v2)
- Public browse/search (Stage 4)
- LIFF claim/publish flow (Stage 5 — already built)

## Key deliverables

1. Group exclusivity window engine in `packages/domain` (pure logic: window open/closed, interest-flag state, release eligibility)
2. Postgres state machine for group exclusivity (window open → interest-flagged → lapsed → released/extended)
3. Bot DM: release-prompt message sent to poster when window lapses; response handler for release decision
4. Interest flag UX in the mini-app (Stage 5 mini-app extended with a new screen/action)
5. Broker/investor role application flow (mini-app or website form → admin queue)
6. Admin vetting screen: review + approve/reject role applications
7. Admin moderation queue screen: review listings that failed the quality gate
8. Quick-sale listing flag in the mini-app
9. Matched-push LINE Flex: composed and sent to matched vetted users
10. Quote response screen in the mini-app: structured quote input form
11. Quote stored in Postgres (feeds Stage 7 AVM input)

## Dependencies

- Stage 5 must be complete: mini-app is the primary surface for interest flags, role applications, and quote responses
- Stage 1 must be complete: group, membership, exclusivity, quote, and moderation queue schema all required
- Stage 2 must be complete: the quality gate (D11) that routes failures to the moderation queue is a pipeline step
- Stage 4: admin screens may be a protected route on the website — Stage 4's auth and Astro setup should be stable
- LINE console: no new LIFF registration expected, but any new LINE push template types must be tested on the unverified channel

## Acceptance criteria (sketch)

- A listing extracted from a group has an open exclusivity window visible in the mini-app to group members; the window closes after the configured period
- A group member can flag interest on a listing; the flag appears in the poster's view and in admin
- When the window lapses, the poster receives a bot DM with release options; selecting "release publicly" changes the listing's visibility to public in Postgres and it appears on the website
- A user applying for broker role sees a confirmation; admin sees the application in the vetting queue; approving the role updates the user's role in Postgres
- A listing in the moderation queue (failed quality gate) is visible to admin; approving it sets the listing to active
- Quick-quote: a quick-sale listing triggers LINE Flex pushes to at least one matched vetted user in a test scenario; a structured quote response is stored in Postgres
- All exclusivity-window logic in `packages/domain` is unit-tested independently of DB state

## Open questions (resolve when fleshing this spec)

- **Exclusivity window default confirmation**: master plan D8 proposes 7 days as the default, configurable per group; the fleshed spec must confirm this value (is 7 days right for the Thai broker market?) and define the UI for admins to configure it per group
- **Quick-sale matching criteria**: what makes a vetted broker or investor "matched" to a quick-sale listing? Price range? Location? Property type? Preferred criteria? This is the core algorithmic question for the quick-quote push; must be defined before the push can be built
- **Admin surface location**: a protected `/admin` route on the website (Stage 4 Astro), a separate admin SPA, or admin actions directly in the mini-app? Master plan does not specify; the fleshed spec must decide and confirm the auth model for admin users
- **Release mechanics UX**: the release-prompt bot DM — what options does it offer, what is the copy (Thai + English), and what happens if the poster ignores it? Does the listing stay group-private indefinitely, or does it auto-release after a further grace period?
- **Interest flag semantics**: does an interest flag create any obligation or notification for the poster? Does it prevent the poster from releasing early? Needs a clear definition before the domain logic is written
- **Concurrent interest flags**: if multiple members flag interest, does the poster see all of them? Is there a priority/queue? Does the group admin see them?
- **Moderation queue UI scope**: is it a full CRUD admin panel or a minimal approve/reject queue? Determines build time significantly
- **Rental renewal/turnover loop (D26)**: rentals are recurring inventory — lease ends → relist → re-rent. Sales-first sequencing (D26) means this ships after the sale flows, but the fleshed spec should decide whether the listing model gets a "relist from previous rental" affordance here or in a later increment, so landlords/property managers become retained users rather than one-shot posters

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), Playwright smoke (if user-facing), docs updated.

Stage-6-specific review notes:
- Playwright smoke covers: interest flag on a listing → poster view shows flag → window lapse → release flow; also covers the admin vetting screen approve flow
- The correctness reviewer focuses on the exclusivity window state machine: every transition (open → flagged → lapsed → released) must be covered by unit tests; time-based transitions must use deterministic clocks in tests, not `Date.now()` directly
- The spec auditor verifies that quick-quote push cannot be sent to unvetted users — role check must be server-side, not just UI-gated

## Iteration log

| Date | What changed | Why |
|---|---|---|
| 2026-06-12 | D26 recorded: sale flows ship before rental-specific UX in this stage; rental dealflow (renewal loop, facets) is a fast-follow increment, not cut. Added renewal-loop open question | Founder confirmed sales-first, rentals-second priority |
