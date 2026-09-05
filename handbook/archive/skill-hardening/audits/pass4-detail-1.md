# Audit: pass4-detail (frontend-review + alignment-review) · 2026-06-14

Combined independent adversarial audit of both pass-4 skill-runs.

## Real finding (SUSTAINED — found by reading the CODE, not pixels): TH-07 scope gap
The auditor verified that `assertThaiBodyLineHeight` queries `[data-listing-card] *` only — so it does
NOT cover the now-restyled DETAIL page's Thai body text. The detail body uses `leading-relaxed`
(compliant by construction) but was **UNVERIFIED by the deterministic net**: a future tight-leading
regression on detail Thai text would not be caught. A genuine, demonstrated coverage gap.

## Disposition: SUSTAINED → fixed (F3b).
- Marked the detail content container `data-th-content`; broadened the invariant selector to
  `[data-listing-card] *, [data-th-content] *`; exempted CTA buttons/links/accordion summaries
  (`button, summary, a[data-cta]` — short labels, NOT body text; deliberately NOT bare `a`, since the
  listing card is an `<a>` wrapping real body text). **Re-verified:** the broadened net passes on the
  detail page across all 4 projects (detail Thai body ≥1.6); the flag mechanism is already proven to
  catch <1.6. Logged as HARDENING-LOG F3b.

## The audit's PIXEL claims = the usual over-flagging (REFUTED).
It claimed the price tint is "not visually distinct" and the spec-table borders "not prominent." The
runner verified the actual render (`mobile-light-detail.png`): the price IS in a clearly primary-tinted
box, and the FieldList renders a bordered table with row/cell dividers (confirmed in code + pixels).
Consistent with the running pattern: audit agents are reliable on CODE-VERIFIABLE FACTS (this scope
gap) and unreliable on raw PIXEL perception.

## Verdicts
Both skill-runs were SOUND on the detail design (ALIGNED matches the runner's own pixel check + all e2e
invariants). alignment-review notably exhibited the full A2 behaviour (cited assertion NAMES, not
tokens). The one real gap (TH-07 scope) is now closed by F3b. No further skill edits.
