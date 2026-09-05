# Trace: frontend-review · pass=phase1-foundation · target=local · 2026-06-14T09:15Z

- **Increment:** Plan 21 Phase 1 — Tailwind v4 + shadcn FOUNDATION, no visual change. Uncommitted
  working tree on `main` (base 731014e). Files: `astro.config.mjs` (+@tailwindcss/vite),
  `src/styles/global.css` (NEW Tailwind entry), `Base.astro` (imports global.css), `ui/theme.css`
  (`@theme`→`@theme static`), `ui/fallbacks.css`+`emit-fallbacks.mjs` (oklch-fallback only),
  `ui/src/components/ui/*` + `lib/utils.ts` + `components.json` (shadcn owned code),
  `e2e/theme.spec.ts` (+oklch fallback assertion), `vitest.config.ts` (NEW, scope vitest off e2e).

- **Inputs loaded:**
  - frontend-review: screens captured = 36 (`test-results/gallery/local/{desktop,mobile}-{light,dark}-{home,home-rent,detail,empty,journey-*}.png`); gallery dir = `packages/website/test-results/gallery/local`; reference mock = `docs/design/mockups/direction-a-baania-clean.html`.

- **Checked / asserted:**
  - **Mode A (hard gate)** = `npm run test:e2e` → `test-results/results.json` `stats.unexpected===0`: **68/68 passed**. Invariants: theme applies (home+detail, computed `--color-primary-600`/`--color-bg`/`--spacing-4` resolve, body fontFamily contains "Sarabun"), both brand fonts delivered via @font-face (document.fonts), dark mode flips `--color-bg`, no broken images, no console/network/5xx errors, healthy empty state, click-through journeys.
  - **NEW invariant**: oklch/old-Android fallback — served CSS ships `@supports not (color: oklch())` with hex `--color-bg`/`--color-primary-500` (TECH-06 net). Green.
  - **Mode B (design review)** = fresh `Explore` agent on the gallery vs direction-a + taste brief + register visual groups (per `design-review-prompt.md`).
  - (Runner's out-of-band objective check, NOT part of the skill: ImageMagick pixel-diff of this gallery vs the pre-change baseline gallery = **AE 0 across all 36 screens** → the foundation is genuinely visually identical.)

- **Findings raised:**
  - Mode A: none (all green) · `rendered` evidence.
  - Mode B: agent returned **"ALIGNED — zero divergences"**, asserting the render "implements Direction A (Baania-clean) faithfully" and citing token values `oklch(0.96 0.03 295)`/`#f3efff`, `#1f5fad`, `#06c755` as evidence. `source` (these are theme.css declarations, not pixel observations).

- **Passed:** Mode A invariants + the oklch fallback assertion, all on RENDERED evidence (computed styles, FontFaceSet, served CSS text).

- **NOT checked / skipped:** Pixel-regression baselines (deferred during design flux). **The skill has NO "parity / unchanged-vs-prior" mode** — yet that is exactly the Phase-1 contract ("frontend-review mode B should read 'unchanged vs the current site'"). Mode B compared vs DIRECTION (direction-a), not vs the prior render.

- **Verdict + backpressure:**
  - Mode A: **PASS** — hard gate green; strong, evidence-faithful (rendered).
  - Mode B: reported PASS/ALIGNED but this is a **SUSPECTED FALSE NEGATIVE**. The rendered site is the OLD plain styling (a basic search form + plain card grid; no sticky trust-blue app-header/wordmark, no pill filter chips, no deal-pill photo overlay, no section-header accent underline, no bottom-nav) — it does NOT read like direction-a. The agent nonetheless said "faithfully implements direction-a" and leaned on theme.css SOURCE token values as "evidence" — the precise source-inference failure the skill is meant to prevent. **Backpressure INADEQUATE on mode B.** Two candidate gaps for the audit to confirm: (1) mode-B agent inferred alignment from source/token values instead of judging the pixels; (2) the skill cannot express the "unchanged vs prior render" parity check the foundation increment actually needs. Flagged for adversarial audit → `audits/frontend-review-phase1-1.md`.

- **Re-verification (after hardening):** audit returned INSUFFICIENT and confirmed both gaps. Fixes
  logged in `HARDENING-LOG.md` (F1 mode-B images-only + signature checklist; F2 parity Mode A.5 +
  `gallery-diff.mjs`). Both re-verified to bite on THIS increment: parity gate → AE 0 (correct
  "unchanged" verdict + catches an injected regression at AE 16281); hardened mode-B → now returns
  OPEN-QUESTIONS with 7 correct pixel-grounded divergences instead of the false "ALIGNED" (the
  divergences are also the Phase-2 work-list: sticky wordmark header, deal-pill photo overlay,
  section-header underline, results bar, tinted detail price box, bordered spec table, yield pill).
