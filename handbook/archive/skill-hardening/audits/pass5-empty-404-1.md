# Audit: pass5-empty-404 (frontend-review + alignment-review) · 2026-06-14

Combined independent adversarial audit of both pass-5 skill-runs.

## Real finding (SUSTAINED — found by reading the TEST INFRA, not pixels): the data-th-content was INERT
The auditor traced the test wiring: the TH-07 invariant (`assertThaiBodyLineHeight`) only ran on `"/"`.
The 404 page (and the empty state) carry `data-th-content`, but NO test ever visited those pages — so
the marker was a compile-time artifact that **never executed**. The "TH-07 now covers the 404" claim was
syntactically true, pragmatically false. A genuine coverage gap.

## This finding REVEALED a latent BUG the gap had been hiding.
Closing the gap exposed it: the `EmptyState` (and `ErrorState`) why/next lines used `text-base`/`text-sm`
**without** `leading-relaxed`, pinning line-height to 1.5/1.43 — a TH-07 violation introduced back in
pass 1 and invisible because no TH-07 test ever rendered the empty state. (Same root cause as F3 — a
`text-*` utility pinning a tight default over the inherited 1.65.)

## Disposition: SUSTAINED → fixed (F3c).
- `States.tsx`: added `leading-relaxed` to the empty/error why+next Thai lines + `data-th-content` on the
  state roots (so the invariant covers them wherever they render).
- `theme.spec.ts`: added TH-07 tests that VISIT the empty state (`/?q=zzqqx-no-such-listing-12345`) and a
  404 path — so the markers are actually exercised. **Re-verified to BITE:** reverting the empty `why`
  line → the empty-state TH-07 test fails at ratio 1.5 ("ยังไม่มีประกาศที่ตรงกับต"); fixed → all pass; suite green.

## Pattern, again
Three audits in this run found REAL bugs/gaps — all by COMPUTING or reading CODE/TEST-INFRA (TH-07 scope
F3b, contrast F4, this inert-marker F3c); the audits' PIXEL claims have all been over-flags the runner
refuted. The durable conclusion (logged): deterministic invariants + audits-on-code + orchestrator
pixel-verification — not LLM pixel perception (skill OR audit) — are what reliably catch design defects.

## Verdicts: both skill-runs SOUND on the visual design (ALIGNED matches the runner's check); the real
gap (inert markers) + the bug it hid are now closed by F3c. No further skill-file edits.
