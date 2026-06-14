# Stage 5 MINI App — functional + mock-fidelity audit (Phase 1)

> Working doc for the Stage-5 design+functional iteration goal
> (`plans/19-v2-marketplace-rebuild/stage-5-design-functional-iteration-prompt.md`).
> Produced 2026-06-15 from three converging audit agents (code-map, e2e-harness/contract map, and an
> **empirical** driver that built the real SPA and drove every interaction headless). This matrix is the
> increment plan. **Update the "After" columns as increments land.**

## Headline correction — the gallery "break"
The founder reports the photo gallery is broken. Empirically (drove the real built SPA): the gallery is **not a
JS-logic break** — `Gallery.tsx` is a bare CSS scroll-snap strip (`w-[78%]` tiles, `overflow-x-auto`). Scrolling
DOES change the in-view photo and tapping opens a lightbox. The real defect is **missing affordance + missing mock
treatment**: NO next/prev control, NO thumbnail row, NO index/position indicator, **NO photo-count chip anywhere**.
The mock (`direction-a` + `mylistings`) specifies a **hero photo + "PHOTOS (N)" / "รูปภาพ x/N รูป" overlay + a
thumbnail row**, and cards carry a **"N รูป" count chip**. So it "renders but doesn't function as a navigable
gallery" — the canonical "renders but doesn't work" bug. (Black tiles in e2e are a 1×1-PNG fixture artifact, not the bug.)

## The systemic test gap (root cause, Phase 2 target)
The e2e api mock is **static `page.route` fixtures, NOT stateful** (`e2e/support.ts` `mockApi`). Writes push to a
`writes[]` array and return canned bodies; reads always return fixed fixtures. So today's "round-trips" assert only
**client-side optimistic UI**, never real persistence. NEVER driven/asserted end-to-end: real save→/me/saved reflect;
create-viewing→/me/viewings reflect; the **edit PATCH allowlist** (`EDITABLE_*` in `handler.ts`) — body is never
inspected; the `isSaved` EXISTS round-trip; group-membership authz; 401/unauthorized. Fix = a **real-backend e2e
layer** (Docker-PG + real `handleApi` + stubbed verifier + fake-S3), mirroring the website plan-20 net
(`packages/website/test/e2e-server.mjs` + `@line-robot/db/testing`), preferred for claim/publish + ≥1 CRM round-trip;
a stateful mock is acceptable for the rest. Each new functional test must BITE (break feature → red).

## Per-feature matrix (Functions? / Tested-for-function? / Matches mock?)
Verdicts are from code-map + empirical run. "Tested?" = does an e2e test DRIVE the interaction and assert the
functional outcome (not style/existence/optimistic-only).

| # | Screen / feature | Functions? | Tested (drives+asserts outcome)? | Matches mock? |
|---|---|---|---|---|
| 1 | **Detail photo gallery** | **BROKEN (no affordance/count/hero/thumbnails)** | No (gate never taps/swipes/opens lightbox; no count assert) | **No** — needs hero + thumbnail row + count chip |
| 2 | Tab switching (listings/saved/viewings) | WORKS (local state) | Partial (crm drives forward only, vs static fixtures) | n/a (chrome) |
| 3 | Save/unsave toggle | WORKS (optimistic + rollback) | **Optimistic-only** (no real round-trip; SavedPanel mount-only → cross-panel staleness) | tbd |
| 4 | Book-a-viewing (picker→submit) | WORKS (no auto-refresh by design) | **Optimistic/canned-only** (created viewing never seen in list) | needs date-chip rows + status badges + upcoming/past split |
| 5 | Add-note | WORKS (prepends returned row) | Drives add; not a real round-trip | tbd |
| 6 | Owner edit (PATCH) | WORKS | **Form never edited in e2e; PATCH body/allowlist never asserted** | tbd |
| 7 | Claim → publish / keep-private / 409-loser | WORKS (all branches wired) | Drives clicks vs **canned** statuses (no real claim/consent state) | match `explore-stage5-1-claim.html` |
| 8 | Route nav (/, /p/{id}, /claim, /edit) | WORKS | Yes (unit + gate card-tap) | n/a |
| 9 | **My-listings cards** | render | n/a | **No** — dense small-thumb list vs spacious photo-forward cards; deal pill not overlaid; no photo-count chip; plain search bar (not pill); thin lifecycle stripe; no identity chrome; no "ทรัพย์ดี" wordmark; 4 text stat-cells vs 5 icon tiles |

## Prioritized increment plan (broken-and-core first)
- **INC-1 — Gallery** ✅ DONE (committed; e2e 48 green, biting gallery.spec). (client-only; uses existing static-mock harness): rebuild mock-faithful — hero photo +
  thumbnail row + "N รูป" count chip + deliberate working navigation (tap thumbnail → active photo changes; index
  reflects; swipe works). Tailwind/`@line-robot/ui` only, no inline styles. Functional test drives thumbnail-tap +
  asserts active `src`/index changes + count correct; prove it BITES.
- **INC-2 — Real-backend e2e harness** (Phase 2 foundation): Docker-PG + in-process `handleApi` + stubbed verifier +
  fake-S3, separate playwright config; seed groups + membership (claim/detail/notes/viewings authz gate on it).
  Enables true round-trips for INC-4/5/6.
- **INC-3 — My-listings home → mock fidelity** ✅ DONE (committed; e2e 58 green; filter/search/tab controls work+bite; TH-07 net hole fixed). (mostly styling + tab functional test; no backend dep): photo-forward
  cards, deal pill overlaid, photo-count chip, search pill, thicker lifecycle stripe, section headers, identity
  chrome (LIFF profile/schema or queue), wordmark; resolve S5-1/5/9 etc.
- **INC-4 — Claim/publish/keep-private** fidelity + **real-backend** functional tests (publish, keep-private, 409).
- **INC-5 — Viewings + book-a-viewing** fidelity (date-chip rows, status badges, upcoming/past) + round-trip test.
- **INC-6 — Saved / notes / edit** real round-trip tests (save→saved list; note→reflect; edit PATCH allowlist) + polish.
- **Stage-5 stage gate**: full-diff review, hexagonal conformance, eval advisory, upgraded `/frontend-review` +
  full `test:e2e`; deploy to staging; verify on real infra; DoD + retro.

## Key evidence cites
- Gallery: `packages/miniapp/src/components/Gallery.tsx:12,18-44,64-68`; hosted `screens/DetailScreen.tsx:124`.
- Contract: `packages/api/src/handler.ts` (detail `:206-230` carries `isSaved`; edit allowlist `:277-321`;
  claim 409 `:233-257`; viewings past-guard `:381-391`).
- Harness: static mock `e2e/support.ts` `mockApi` (`:48-177`); LIFF alias `vite.config.ts` mode `e2e`; SPA served by
  `e2e/server.mjs` (`sirv single:true`); style invariants `support.ts:199-326`.
- Reference real-backend net: `packages/website/test/e2e-server.mjs` (Docker-PG `@line-robot/db/testing`
  `startPostgresLocal`/`migrateDb`, fake-S3 forward, seed via real repos).
- Mocks rendered to `/tmp/stage5-audit/mocks/`; SPA screenshots `/tmp/stage5-audit/spa/`.
