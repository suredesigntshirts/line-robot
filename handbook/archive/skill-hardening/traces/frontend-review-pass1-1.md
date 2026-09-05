# Trace: frontend-review · pass=p2-pass1-cards · target=local · 2026-06-14T10:01Z

- **Increment:** Plan 21 Phase 2 pass 1 — restyled the SHARED listing-card components to the
  direction-a mock in Tailwind utilities (replacing inline-style objects). `packages/ui/src/
  components/{ListingCard,Badge,StatusBadge,PriceDisplay,States,Layout}.tsx` + theme.css
  (`--color-white`/`--color-black` brand constants). Chrome + detail are LATER passes.
- **Inputs loaded:** Mode A = `npm run test:e2e` (68/68). Mode B = hardened design-review (images-only,
  source-forbidden): render gallery `test-results/gallery/local` vs the committed mock renders
  `docs/design/mockups/renders/direction-a-{light,dark}.png`; signature-element checklist.
- **Checked / asserted:** Mode A invariants all green (theme applies, fonts, dark flips, no broken
  images incl. the new SVG placeholder, no JS errors, empty state, journeys) + the oklch fallback
  assertion. Mode B signature checklist on the CARDS across the matrix.
- **Findings raised (Mode B):** Cards — deal-pill overlay (ขาย sale / ให้เช่า rent), photo-count chip,
  price-label+bold-price, status badges as pills, rounded+shadow card: ALL **present** across mobile/
  desktop × light/dark, cited from pixels. NPA renders calm-violet (founder ruling). Rental deal-pill
  renders teal — surfaced as a confirm-question (mock-faithful). Chrome (header/filters/section header)
  flagged **later-pass** per the increment framing (not judged this pass).
- **Passed:** Mode A hard gate; card treatment matches the target images.
- **NOT checked / skipped:** Chrome + detail (later passes). Parity mode N/A — this IS an intended
  visual change (a redesign pass), so the lens is direction-alignment, not parity.
- **Verdict + backpressure:** **ALIGNED on the cards (this pass's scope).** Matches the runner's own
  pixel inspection (cards now read as direction-a in both themes). Caveat for the audit: the agent
  described chrome as "present … later pass" — ambiguous (chrome ELEMENTS exist but are NOT mock-styled);
  acceptable here since chrome was explicitly out of scope, but watch in pass 2 that it doesn't
  rubber-stamp un-restyled chrome. → `audits/frontend-review-pass1-1.md`.
