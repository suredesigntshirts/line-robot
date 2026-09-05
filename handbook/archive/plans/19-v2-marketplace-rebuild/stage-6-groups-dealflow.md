# Stage 6 — Groups & Dealflow

**Spec status: FLESHED — BUILD STARTED (2026-06-15).** Fleshed in the combined stage-5-and-6 `/goal`
autonomous run. **Approval waiver:** the founder explicitly authorized building Stage 6 in this overnight run,
waiving the pre-build approval gate — but its spirit is preserved: the Open questions are resolved with the
**smallest-defensible documented defaults** (see "Resolved decisions" below), each surfaced in
`docs/design/skill-hardening/FOUNDER-QUEUE.md` (S6-*) for morning review; genuinely-open strategy is built as a
minimal version behind a clean seam, not an elaborate engine on a guess. **Foundation reality (verified
2026-06-15):** Stage-1 landed the tables `listing_exclusivity` (listingId/windowOpenedAt/expiresAt/releaseState
`[held|releasable|released]`), `interest_flag` (listingId/userId/createdAt, unique), `quote`
(listingId/brokerUserId/amountThb/discountVsMarket/termsNote/status), `moderation_item`
(targetType/targetId/status `[pending|approved|rejected]`/reason — and the Stage-2 gate-fail WRITE path is LIVE
in `pipeline/src/run.ts`), `role` (userId/kind `roleKind=[broker|investor|owner|visitor]`/approvalStatus
`[none|pending|approved]`), `publish_consent` (+ `publishListing`/`keepListingPrivate`), and `listing.urgency`
`[normal|quick_sale|price_reduced]` (quick-sale flag, pipeline-populated). So most gaps are **repo functions +
one small roles migration (0009)**, NOT new tables. Latest migration = `0008`.

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
12. **Delete the v1 read-api Lambda (`packages/bot/src/lambda/read-api.ts` + `src/app/readApiHandler.ts` + its Pulumi `readApiFn` resource/Function-URL/IAM role + the `loadReadApiEnv` schema/config).** Carried from Stage 5 as a parallel-run rollback — `packages/api` superseded it on day one and it has had ZERO callers since the Stage-5 cutover (the rebuilt React SPA calls `packages/api`; the v1 Preact SPA that was its only caller is deleted — grep-proven in Stage 5 Build E). Before deleting, confirm zero invocations on the deployed `readApiFn` (CloudWatch `Invocations` flat at 0 across the parallel-run window), then drop the code + the infra resource in one `pulumi up`. Until then it stays deployed (returns 401 on an unauthenticated probe — boot-healthy) as a one-`pulumi up` rollback path.

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

## Open questions (all RESOLVED 2026-06-15 — answers in § Resolved decisions; each queued S6-* for founder)

- **Exclusivity window default confirmation**: master plan D8 proposes 7 days as the default, configurable per group; the fleshed spec must confirm this value (is 7 days right for the Thai broker market?) and define the UI for admins to configure it per group
- **Quick-sale matching criteria**: what makes a vetted broker or investor "matched" to a quick-sale listing? Price range? Location? Property type? Preferred criteria? This is the core algorithmic question for the quick-quote push; must be defined before the push can be built
- **Admin surface location**: a protected `/admin` route on the website (Stage 4 Astro), a separate admin SPA, or admin actions directly in the mini-app? Master plan does not specify; the fleshed spec must decide and confirm the auth model for admin users
- **Release mechanics UX**: the release-prompt bot DM — what options does it offer, what is the copy (Thai + English), and what happens if the poster ignores it? Does the listing stay group-private indefinitely, or does it auto-release after a further grace period?
- **Interest flag semantics**: does an interest flag create any obligation or notification for the poster? Does it prevent the poster from releasing early? Needs a clear definition before the domain logic is written
- **Concurrent interest flags**: if multiple members flag interest, does the poster see all of them? Is there a priority/queue? Does the group admin see them?
- **Moderation queue UI scope**: is it a full CRUD admin panel or a minimal approve/reject queue? Determines build time significantly
- **Rental renewal/turnover loop (D26)**: rentals are recurring inventory — lease ends → relist → re-rent. Sales-first sequencing (D26) means this ships after the sale flows, but the fleshed spec should decide whether the listing model gets a "relist from previous rental" affordance here or in a later increment, so landlords/property managers become retained users rather than one-shot posters

## Resolved decisions (smallest-defensible defaults — each queued as FOUNDER-QUEUE S6-*)

- **D-S6-1 Exclusivity window = 7 days, per-group configurable (confirms D8).** Source = `group.exclusivityWindowDays`
  (exists, default 7). Per-group config is a minimal admin control (one number field on the group). Queue: is 7
  right for the Thai broker market; richer per-listing/per-deal-type tuning. *(FQ S6-1)*
- **D-S6-2 Exclusivity STATE is DERIVED, not a new enum.** The persisted `listing_exclusivity.releaseState`
  stays `[held|releasable|released]`; the pure domain engine derives the rich logical state
  (`open | interest_flagged | lapsed | released | extended`) from `(releaseState, expiresAt, hasInterestFlags,
  now)` with a deterministic injected clock. Transitions persisted: extend = bump `expiresAt` (+ a listing_event
  audit), release = `releaseState→released` (+ publish-consent for "publicly"). No `release_state` migration. *(FQ S6-2)*
- **D-S6-3 Interest flag = non-binding signal, all flags shown, no priority queue (v1).** A flag is visible to
  the poster + admin; it does NOT block the poster releasing early and creates no obligation; multiple flags all
  display (newest-first), no ranking. Queue: richer semantics (hold/notify/priority). *(FQ S6-3)*
- **D-S6-4 Release mechanics:** on lapse (or manual), a bot DM offers **release-publicly / release-to-other-groups
  / extend**. Release-publicly = `grantPublishConsent` (appears on the website). Extend = bump `expiresAt` by the
  window. Release-to-other-groups (v1) = drop the group-exclusive mandate so any group the poster is in can see it
  (no per-target-group plumbing v1 — the membership gate already controls visibility; a dedicated target-group
  link is queued). **If the poster ignores the DM: the listing STAYS group-private (NO silent auto-release).**
  Queue: a further grace-period auto-release; per-target-group release. *(FQ S6-4)*
- **D-S6-5 Admin surface = INSIDE the mini-app, gated by an `admin` role, server-enforced.** Sidesteps the
  deferred D19 real-domain / 4.4 LINE-Login dependency (a website `/admin` would need web auth + a real domain,
  unprovisionable autonomously). Admin role-checks live SERVER-SIDE in `packages/api` (mirror `requireClaimant` →
  `requireRole('admin')`), NEVER UI-gated. Queue: mini-app-admin vs a future website `/admin`. *(FQ S6-5)*
- **D-S6-6 Quick-sale matching = the smallest defensible overlap, behind a swappable seam.** Single
  `matchVettedUsers(listing, candidates)` pure function in `packages/domain`: matches `approvalStatus='approved'`
  broker/investor users whose **stated preferences overlap the listing on province + property-type + price-band**
  (price bands reuse the Stage-4 North-Thai boundaries). **Preferences are COLLECTED in the role-application form**
  (provinces, property-types, price-band range) and stored — Stage-1 landed no preference schema, so 0009 adds a
  minimal `broker_preference` representation. The recipient query filters approved-vetted SERVER-SIDE (spec-auditor
  invariant: a quick-quote push can NEVER reach an unvetted user). Queue: weighting, radius, deal-history ranking. *(FQ S6-6)*
- **D-S6-7 Moderation queue = minimal approve/reject (not full CRUD).** Reads `moderation_item WHERE
  status='pending'` (the live gate-fail set) + resolve to `approved`/`rejected`; approve sets the listing active.
  Queue: a full moderation CRUD panel. *(FQ S6-7)*
- **D-S6-8 Vetting can RECORD rejection + reviewer.** 0009 adds `rejected` to `approvalStatus` and
  `reviewed_by`/`reviewed_at` to `role`. Vetting = transition a pending `role` row → approved/rejected with the
  admin's id + timestamp. *(FQ S6-8)*
- **D-S6-9 Rental renewal loop (D26) = NOT built here.** Queued (sales-first per D26). *(FQ S6-9)*

### Migration 0009 (the ONLY schema change — domain-enum-first per `packages/db/CLAUDE.md`)
`roleKind` += `admin`; `approvalStatus` += `rejected`; `role` += `reviewed_by uuid→users` + `reviewed_at timestamptz`;
new minimal `broker_preference` (userId/roleId, province, propertyType, priceBandId — multiple rows per broker, or
array columns — builder's call, smallest queryable). Everything else (exclusivity/interest/quote/moderation tables,
quick-sale flag, publish-consent) already exists → repo functions only. **Applying 0009 to staging RDS is
FOUNDER-GATED** (like Stage-5's migrate) — write + test it against Docker-PG; queue the staging apply.

## Increment plan & sequencing (smallest-defensible; each = reviewed increment with its own tests)

- **INC-B1 — Data + domain foundation.** Migration 0009 (above). The pure **exclusivity-window engine** in
  `packages/domain` (derive state + release-eligibility, deterministic clock, fully unit-tested, never `Date.now()`).
  The **`matchVettedUsers` seam** in `packages/domain` (province+type+price-band overlap; price-band constants
  shared). **Repo functions** (`packages/db`): exclusivity read/transition (extend/release), interest_flag
  create/list, quote create/list, moderation list-pending/resolve, role approval-transition + `getUserRole` +
  list-vetted-by-criteria, broker_preference write/read. No LINE, no HTTP — pure data+logic. Docker-PG integration tests.
- **INC-B2 — `packages/api` endpoints + SERVER-SIDE role gates.** Add `requireRole('admin')`/`requireVetted` to the
  `Repo`/handler (mirror `requireClaimant`). Endpoints: interest-flag create/list; role-application submit (with
  preferences); admin vetting list + approve/reject; admin moderation list + resolve; quick-sale flag toggle
  (sets `urgency='quick_sale'`); quote submit (vetted-gated) + list. **DESIGN CALL (B2/B4 boundary, built
  2026-06-15):** the quick-quote **MATCH + Flex push is INC-B4** (bot, at sweep time), NOT the api — keeps LINE
  out of `packages/api` (hexagonal) + avoids a push-intent table. The server-side approved-vetted filter
  (`listApprovedVettedUsers`) holds wherever `matchVettedUsers` is called → a push can NEVER reach an unvetted
  user. **Moderation v1 = admin REVIEW only** (list pending + approve/reject the `moderation_item`); the
  "approve → publicly-visible" BLOCK (a NOT-EXISTS-pending predicate on the public query / a publish guard —
  cross-cutting into the website/publish path) is **DEFERRED + QUEUED** (the acceptance-criterion "approve sets
  the listing to active" needs it; nothing reads `moderation_item.status` in claim/publish today).
- **INC-B3 — mini-app UI** (additive screens/actions on the Stage-5 SPA; Part-A functional-test discipline —
  every interactive feature WORKS + a biting e2e drives it, against the `e2e-api/` real-backend harness): interest-
  flag action on the detail; role-application screen (with preference capture); admin screens (vetting queue +
  moderation queue) under the `admin` gate; quick-quote quote-response screen. Routes additive (don't break the
  frozen plan-17 deep links).
- **INC-B4 — bot DM + push** (bot app/adapters; honour the webhook→sweep spine; NO LINE in `packages/pipeline`):
  the exclusivity-lapse scan (a scheduled sweep modeled on `reminderSweep.ts`/the 2-min cron) → `releasePromptCard`
  DM (mirror `sendClaimInvites`, once-guarded) with release-publicly/other-groups/extend postbacks; the
  PostbackRouter handlers for the three decisions; the quick-quote **LINE Flex push** to the matched vetted set
  (reuse `gateway.push` + a Flex card with a mini-app `uri` deep link; unverified-channel — no new LIFF reg).
- **INC-B5 — Deliverable #12: retire the v1 read-api.** Verify CloudWatch `Invocations` on
  `linerobot-staging-read-api` is flat at 0 across the parallel-run window; if 0, delete the code
  (`bot/src/lambda/read-api.ts`, `bot/src/app/readApiHandler.ts`, `ReadApiEnvSchema`/`loadReadApiEnv` in
  `bot/src/adapters/config/config.ts`) + ONLY the `read-api*` Pulumi resources in `infra/src/miniapp.ts` (Fn, URL,
  role, log group, alias) + the `AlarmTargets.readApiFn` ref + the `readApiUrlOutput` export — **NOT** the
  `siteBucket`/`siteDistribution` SPA host in the same `createMiniApp` (the current mini-app uses it). The
  `pulumi up` that drops the resource is FOUNDER-GATED. If invocations are non-zero, do NOT delete — investigate + queue.
- **Stage-6 stage gate + DoD** (see Acceptance criteria + Review process below).

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
| 2026-06-15 | **FLESHED → BUILD STARTED** in the combined stage-5-and-6 `/goal` run (approval gate waived by the founder for this overnight run). All 8 open questions resolved with smallest-defensible defaults (D-S6-1…9), queued S6-1…9 in FOUNDER-QUEUE. Verified the Stage-1 foundation (most tables exist → repo-fns + one roles migration 0009). Increment plan B1–B5 + gate defined. | Build Stage 6 minimal-but-real behind clean seams; surface every default for morning review |
