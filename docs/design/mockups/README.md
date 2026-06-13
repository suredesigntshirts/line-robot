# Design mockups — INSPIRATION ONLY (not production design)

**Status (founder, 2026-06-13): these HTML files are demo mock-ups for direction/inspiration ONLY.**
They are NOT a component spec and NOT to be lifted into the build. When the design phase starts,
**rebuild every screen, element, and filter from scratch** with the elements we actually need — use
these only to anchor the look-and-feel and the chosen directions below.

## What IS confirmed (real, not inspiration)

- **Theme A — "Baania-clean"** (trust-blue Thai-portal) is the confirmed token system. It lives in
  `packages/ui/theme.css` (founder-confirmed). The palette/typography/radius are the real direction.

## Chosen directions (inspiration only — rebuild the implementation)

| Area | Direction picked | Reference mock |
|---|---|---|
| Price filter | **Contextual** — a Buy/Rent toggle relabels one price range (sale ฿ ↔ rent ฿/mo) | `direction-a-baania-clean.html` look + `explore-price-1-contextual.html` |
| NPA / new-vs-resale | **Detail-page disclosure + subtle meta** (NPA shown with disclosure framing, not a loud badge) | `explore-schema-3-disclosure.html` |
| Stage 5 mini-app | **Shape approved** — claim/publish flow + My-Listings dashboard + viewings/follow-ups together form the Stage 5 spine | `explore-stage5-1-claim.html`, `-2-mylistings.html`, `-3-viewings.html` |

The three `direction-{a,b,c}.html` files are the A/B/C theme comparison that led to picking A.

## Founder constraints for the REAL design (must hold when rebuilt)

1. **Rebuild from scratch, focused on what we actually need.** The demo elements/filters are
   illustrative; do not port them. Decide each element from the real requirement, not the mock.
2. **Price ranges must reflect ACTUAL North-Thailand prices** (from `docs/research/a2-market-landscape-north.md`),
   not the demo's invented brackets. Anchors:
   - **Sale:** ~80% of purchases ฿2–9M, average house ~฿4.5M; new central condos start ฿3M+; land
     Hang Dong ฿4–8M/rai, San Sai ~฿5M/rai, suburban fringe from ฿0.5M/rai; per-sqm ~฿20k (suburb)
     to ฿160k (Riverside), median ~฿60k/sqm.
   - **Rent (furnished/mo):** studio ฿7–12k (avg ฿9.5k), 1-bed ฿10–18k (avg ฿13.5k), 2-bed ฿16–35k
     (avg ฿22k), family houses ฿20–45k.
3. **NPA treatment must be TONED DOWN.** The current red reads as an alert/warning. NPA is a
   *category highlight* ("this is a bank/auction asset"), not a danger state — use a calmer, distinct
   treatment (a restrained accent / label, not aggressive red). Keep the required disclosure caveats
   (DIST-02 / a6) but de-escalate the visual alarm.

## Process note

When the design phase runs, it goes through `/alignment-review` against the heuristic register
(`docs/research/00-product-principles.md`) like any design-bearing work — these mocks do not bypass
that. They are a starting sketch, nothing more.
