# Trace: alignment-review · pass=phase1-foundation · target=local · 2026-06-14T09:15Z

- **Increment:** Plan 21 Phase 1 — Tailwind v4 + shadcn FOUNDATION, no visual change (same diff as
  `frontend-review-phase1-1.md`).

- **Inputs loaded:**
  - alignment-review: context groups selected from `context-map.md` = **Architecture & frontend**
    (primary — tokens/theme.css/shadcn usage/structured data), **Typography, i18n & copy** (the
    rendered tokens drive the type system), **Listing card & detail UI** (rendered tokens drive
    cards). Heuristic IDs read from register §4 itself. Rendered evidence offered to the agent: the
    36-screen gallery + the confirmed e2e runtime facts (fontFamily contains Sarabun; tokens resolve;
    dark flips; @font-face delivery; served-CSS oklch fallback).

- **Checked / asserted (heuristic IDs judged):**
  - Architecture & frontend: TECH-01..13, TH-09, TH-11, TH-12, COMP-14 — all evaluated.
  - Typography/i18n & copy: TH-06, TH-07, TH-08, TH-13, TH-14, COPY-02/03/07/08/09, B3 — all evaluated.
  - Listing card & detail UI: CONV-03/04/05/06/09, TH-03/04/05, COPY-04/06/10/11, DIST-01/02,
    LEGAL-06/07, MKT-03/09/10 — all evaluated (mostly n-a: Phase 1 renders no new card content).

- **Findings raised:**
  - **TECH-06 → violation/clarification**: the fallback was slimmed to `@supports not (color: oklch())`
    only (the redundant full hex restatement retired). Agent surfaced — correctly NOT self-adjudicated
    — a founder question: does the `@supports`-gated fallback match TECH-06's intent, or should a hex-
    first `:root` (no `@supports`) be restored for devices that parse neither oklch nor `@supports`?
    Ties to §5.8 (beta Android/WebView vintage). `rendered`+`source`.
  - TH-06/07/14, TECH-01/07/12 etc.: **pass**, cited rendered evidence (fonts, computed styles) for
    the styling IDs and source for the semantic/structural ones.

- **Passed:** the full Architecture & frontend + Typography groups (TECH/TH IDs) with rendered
  evidence; card/detail IDs correctly **n-a** for a no-visual-change increment.

- **NOT checked / skipped:** none silently. Card/detail IDs explicitly n-a with one-line reasons.

- **Verdict + backpressure:** **VIOLATIONS** (one clarification-class TECH-06 finding routed to the
  founder, not self-resolved) — reasonable backpressure; it did NOT rubber-stamp. Caveats for the
  audit: (a) the TECH-06 technical analysis is shaky — `@supports` is supported far older (Chrome 28,
  2013) than `oklch` (Chrome 111, 2023), so `@supports not(oklch)` covers the ENTIRE realistic old-
  Android gap; the "falls back to system fonts" phrasing conflates fonts (not oklch) with colours; the
  finding's SURFACING is right even if its analysis is off. (b) It cited `fallbacks.css` "lines 80–115"
  which match the OLD file, not the regenerated one — a possible stale/source-skew read. Flagged for
  adversarial audit → `audits/alignment-review-phase1-1.md`.
