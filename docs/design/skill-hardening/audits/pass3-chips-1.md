# Audit: pass3-chips (frontend-review + alignment-review) · 2026-06-14

Combined independent adversarial audit of both pass-3 skill-runs.

## The one audit in this run that found a REAL, substantive bug (not over-flagging)
Independently computing WCAG contrast from the rendered colours, the auditor found: the FILLED active
chip / primary button used `text-white` on `bg-primary-500`, which is fine in light (`#1f5fad`, 6.4:1)
but **fails AA in DARK mode** — `--color-primary-500` flips to a light blue (`#5b9de0`), so
white-on-light-blue ≈ **2.9:1** (runner reproduced: 2.63:1 on the dark project). It even located the
design-doc note flagging this. This is a real regression the runner introduced in passes 1–3 (it had
switched the old *flipping* `--color-surface` text to a non-flipping `text-white`).

## Disposition: SUSTAINED. Fixed + deterministic net added.
- **Fix:** filled-primary CTAs (primary button + active chip) use `text-surface` (flips with the bg →
  white-on-dark-blue in light, dark-on-light-blue in dark, both AA — light 6.37, dark 5.84). Button
  hover dims via opacity (changing the bg shade re-breaks the dark pairing).
- **F4 (frontend-review): `assertCtaContrast` deterministic invariant** — for `[data-cta-solid]` (the
  primary button + active chips), resolve the computed text/bg colours via a 1×1 canvas to sRGB and
  assert the WCAG ratio ≥4.5 in EVERY project (so dark is covered). **Re-verified to BITE**: `text-white`
  → desktop-dark fails at 2.63; `text-surface` → all 4 pass. This is the a11y net the audit recommended,
  made agent-independent (an LLM can't read contrast off a PNG; the alignment agent reached for hex).

## On the audits' RELIABILITY (continuing the META-finding)
This audit got the contrast bug right because it's a COMPUTABLE fact (it did the math), not a pixel
perception — consistent with the pattern: audit agents are reliable on PROCESS/COMPUTATION, unreliable
on raw PIXELS. (It also mis-attributed scope — claimed frontend-review "deferred chips" when the pass-3
run did review them — but that didn't affect the real finding.) frontend-review's chip verdict
(ALIGNED) and alignment-review's (ALIGNED-minus-contrast) both stand; the contrast gap is now closed by
F4 + the fix.

## Register gap (→ FOUNDER-QUEUE #6): the register §4 has no explicit WCAG-contrast heuristic.
Contrast is enforced here by the F4 invariant; whether to add an explicit a11y/contrast heuristic to the
register is a founder call (a register change). Verdicts: both runs SUFFICIENT in substance; the real
contrast finding is fixed + guarded.
