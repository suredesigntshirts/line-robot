# Audit: frontend-review · pass=phase1-foundation · 2026-06-14

Independent adversarial auditor (fresh `Explore`, read-only, did NOT run the skill). Re-derived ground
truth from the gallery + mock + register itself, then judged the skill-run in `traces/frontend-review-phase1-1.md`.

## Ground truth (auditor, re-derived)
The mode-B agent claimed **"ALIGNED — implements direction-a faithfully"** citing token values. By
opening the actual screenshots the auditor found the render does NOT match direction-a — concrete
divergences independently surfaced: missing deal-pill photo overlays, no styled filter row / pills,
weak/absent section-header treatment. (Runner's note: even the auditor partly conflated mock vs render
detail — reinforcing that evidence must be FORCED pixel-grounded, not narrated.)

## Judgement
- **A. Coverage — INSUFFICIENT.** Wrong lens: a "no visual change" foundation increment needs
  parity-vs-prior, but the skill only compares vs direction-a and has no parity mode.
- **B. Evidence faithfulness — INSUFFICIENT.** The run cited `theme.css` token values (`oklch(…)`,
  `#1f5fad`) — source-inference, not rendered pixels. The exact failure the skill exists to catch.
- **C. Backpressure — FAILED.** Auditor independently found ≥3 real divergences; the skill flagged
  NONE and returned a flat "ALIGNED" with zero founder-facing open questions (a false negative).
- **D. Signal quality — LOW.** False-positive ALIGNED; non-actionable token citations.

## Verdict: **INSUFFICIENT**
Two confirmed gaps: (1) source-inference / confabulated alignment; (2) no parity mode for foundation
increments (wrong comparison lens).

## Recommended skill edits (auditor) → disposition
1. Add a parity-vs-prior mode for foundation/refactor increments. → **APPLIED** (SKILL Mode A.5 + `gallery-diff.mjs` + checklist).
2. Mandate rendered-pixel evidence, forbid source/token citations. → **APPLIED + strengthened** (design-review-prompt is now images-only, source-forbidden, blind-description-first, + a signature-element checklist).
3. Enforce systematic screen-matrix coverage. → **APPLIED** (HARD RULE "walk the whole matrix").
4. Require open-question surface for ANY divergence; ALIGNED must be earned. → **APPLIED** (verdict rule + "ALIGNED is earned, not assumed").
5. Make parity the default lens for foundation increments. → **APPLIED** (SKILL intro distinguishes the two increment types).

## Bite (re-verified) — see `HARDENING-LOG.md` F1 + F2
- Parity gate: AE 0 on Phase 1 (correct "unchanged") + flags an injected regression (AE 16281, exit 1).
- Hardened mode-B re-run: false "ALIGNED" → **OPEN-QUESTIONS with 7 correct pixel-grounded divergences.**
