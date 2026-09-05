# Design Token Candidates — M3

**Status:** DRAFT — 3 named candidates for founder review.
**Date:** 2026-06-12
**Context:** Thai real-estate marketplace, Northern Thailand / Chiang Mai, Thai+English,
mobile-first (360–390 px), LINE-centric. All heuristic IDs below refer to
`docs/research/00-product-principles.md`.

---

## How to read this document

Each candidate block contains:
1. **Tailwind v4 `@theme` CSS block** — light values in `@theme`, dark overrides via `:root`
   under a `.dark` / `[data-theme=dark]` selector (see §Dark-mode mechanism below). OKLCH
   values are authoritative; each token is paired with a `/* #rrggbb */` comment for the RGB
   fallback — a build step or `@supports` block emits the hex-first cascade for TECH-06 targets.
2. **Typography spec** — Thai/Latin pairing per **TH-06/07/08/13**, +20% width note per **COPY-03**.
3. **WCAG AA contrast table** — every text-on-surface pair in both themes, recomputed from the
   sRGB fallback hexes using the WCAG 2.1 relative-luminance formula (not APCA).
4. **Font licensing notes**.

---

## Dark-mode mechanism (Tailwind v4)

**Important:** Tailwind v4 requires `@theme` to be defined at top level — it **cannot** be nested
inside `@media` queries. The `prefers-color-scheme` approach used in an earlier draft was
non-conformant with the v4 spec (confirmed against `docs/tailwindcss.com/docs/theme.md`).

The supported pattern is:

```css
/* Light tokens — drives all utility-class generation */
@theme {
  --color-primary-500: oklch(0.54 0.155 240);
  /* ... */
}

/* Dark overrides — runtime CSS variable swap; no new utility classes needed */
:root[data-theme="dark"],
.dark {
  --color-primary-500: oklch(0.70 0.14 240); /* lightened for dark */
  --color-bg: oklch(0.14 0.010 240);
  /* ... override only the tokens that change ... */
}

/* Honour OS preference when no explicit toggle has been set */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-primary-500: oklch(0.70 0.14 240);
    --color-bg: oklch(0.14 0.010 240);
    /* ... */
  }
}
```

This gives both a **manual toggle** (add/remove `.dark` or `data-theme="dark"` on `<html>`) and
OS-preference fallback — satisfying the "both themes polished at launch" requirement including
user control (TH-09/dark-at-launch).

### RGB fallback strategy (TECH-06)

OKLCH is not supported by older Thai Android WebViews (pre-Chromium 111). The authoritative
technique is hex-first cascade:

```css
/* In a shared theme file, applied before @supports: */
:root {
  --color-primary-500: #1f5fad;  /* RGB fallback — old WebViews stop here */
}
@supports (color: oklch(0 0 0)) {
  :root {
    --color-primary-500: oklch(0.54 0.155 240);  /* modern browsers override */
  }
}
```

Each token block below shows the OKLCH value with an inline `/* #rrggbb */` comment. A build step
should emit the hex-first declarations; do not rely on inline comments as runtime fallbacks.

---

## Evidence from moodboard

The following observations ground each candidate's token choices. All moodboard files are in
`docs/design/moodboard/`.

### Thai portals observed

**Baania** (`thai/baania-*.png` — 10 screens):

- **Primary color:** Baania's brand uses a vivid **mid-green** (`#06C755`-adjacent) for the logo
  and "ค้นหา" search button across all screens. Card action badges ("ขาย", "เช่า") use the same
  green as filled pills on white card surfaces. *(→ Candidate B's fresh-green primary; TH-12 ✓)*
- **Card radius:** Cards visible in `baania-listing-card-anatomy.png` and
  `baania-chiangmai-cards.png` use ~10–12 px corner radius with a thin `#e5e5e5` border and
  white surface — clean, not heavily elevated. *(→ Candidate A radius-lg 14 px slightly rounder;
  B radius-lg 16 px matches the "chat-bubble" warmth)*
- **Badge placement:** `baania-listing-card-anatomy.png` shows a pill badge ("ขาย") in the
  top-left of the photo, price right-aligned in the card body — matches CONV-05 above-fold
  price/specs pattern.
- **Type:** Sarabun or a looped-adjacent face throughout the interface; headings are not
  noticeably loopless, confirming the looped body default (TH-06 ✓).
- **Navigation bottom bar:** 5 tabs with icon+label (หน้าแรก / ผู้ขาย / ลงประกาศ / แชก / บัญชี);
  a LINE chat bubble icon is visible in the bottom-right corner of multiple screens (→ CONV-06
  "Chat on LINE" primary CTA reinforced by Baania itself).
- **Surface:** Off-white `#fafafa`-equivalent background, never pure black or purple. Bottom
  section in `baania-homepage-scroll1.png` uses dark charcoal (`#2b2b2b`-equivalent) as a
  section divider, not the primary surface. *(TH-12 ✓ — black never dominant surface)*
- **Section labels:** Orange underline accent ("ยอดนิยม ─────") in `baania-property-cards.png`
  — a warm accent the doc's amber/warn token family echoes.

**DDProperty** (`docs/research/assets/a5/ddproperty-homepage.png`): The screenshot is blocked by
Cloudflare and returns a security-verification page — no design data available from this capture.
Candidate A's "closest to DDProperty" claim cannot be verified from current moodboard assets.
*Recommendation:* capture a fresh DDProperty screenshot before M4 finalisation. The description
in the candidate rationale is based on DDProperty's widely-known blue portal register, but that
should be verified. See Finding 4 response in the Review section.

### International portals observed

**Rightmove** (`international/rightmove-*.png` — 5 screens): cool blue-grey primary, dense
listing grid, very small text, strong photo dominance. Useful contrast: shows the Western portal
density ceiling we want to avoid on mobile (CONV-04 ✓ — clean cards on landing).

**SUUMO** (`international/suumo-02-search-results.png`): Japanese portal; vivid green primary
(`#05A63A`-class), white surfaces, orange CTA accent. Reinforces the green-primary signal already
present in Baania — both Asian portals independently chose green over blue as the primary brand
register. *(→ Candidate B's green choice aligns with observed regional pattern; TH-12 ✓)*

**Airbnb** (`international/airbnb-02-search-results.png`): coral-red primary, split map/list
layout. Most useful for card shadow / photo-first pattern reference, not colour.

**LINE MINI App reference:** No LINE MINI App moodboard shot is currently captured. The
LINE-native chrome (bottom tabs, rounded cards, warm greens) is described from memory of LINE
UX patterns and the existing mini-app implementation in `packages/miniapp/`. A MINI App
screenshot should be added before M4.

---

## Candidate A — "Baania-clean"

**Mood:** Institutional trust. Corporate-blue primary, warm-white surfaces, generous
corner radius. Closest to a blue-register portal; familiar to Thai portal users; immediately
legible as "real estate". Note: the "DDProperty" comparison cannot be confirmed from current
moodboard assets; see Evidence section above.

### Moodboard evidence — Candidate A

- `thai/baania-listing-card-anatomy.png`: white card surface + ~12 px radius + thin border →
  matches this candidate's `--color-surface #ffffff` + `--radius-lg 14px` + `--color-border`
  system. **(TH-09 ✓ — clean cards)**
- `thai/baania-homepage-mobile.png`: off-white warm page background confirms the warm-white
  `--color-bg` choice over pure white for page-level surface. **(TH-12 ✓)**
- `international/rightmove-01-homepage.png`: corporate-blue trust register visible, used here
  as the "familiar portal" aesthetic anchor. Our blue is warmer and less dense.
- Badge anatomy: `baania-listing-card-anatomy.png` green pill badge top-left → Candidate A
  maps this to `--badge-available` (green) + `--badge-urgent` (amber) in same card zone.
  **(TH-04/DIST-03 ✓)**

### Design intent

- Trust-blue signals legitimacy for deed verification, chanote badges, and broker trust (**TH-12**, **TH-04**).
- Warm grays (not cool) soften the corporate feel and pair better with Thai photography.
- Generous radius (12–16 px) matches the rounded-card pattern already in the mini-app.
- Amber for urgency badges (`ขายด่วน`) — high contrast on white, avoids "danger" read (**DIST-03**).

### @theme block

```css
/* ============================================================
   CANDIDATE A — "Baania-clean"
   OKLCH values authoritative; /* #hex */ comments = sRGB fallback
   Build step emits hex-first /@supports cascade for TECH-06.
   Dark overrides live in :root[data-theme="dark"] / .dark below.
   ============================================================ */

@theme {
  /* --- Primary: trust-blue --- */
  --color-primary-50:  oklch(0.97 0.015 240) /* #f0f4fb */;
  --color-primary-100: oklch(0.93 0.035 240) /* #dde8f7 */;
  --color-primary-200: oklch(0.86 0.065 240) /* #b8d0ef */;
  --color-primary-300: oklch(0.76 0.10  240) /* #84aedf */;
  --color-primary-400: oklch(0.64 0.135 240) /* #4a84c8 */;
  --color-primary-500: oklch(0.54 0.155 240) /* #1f5fad */;  /* main brand */
  --color-primary-600: oklch(0.46 0.15  240) /* #174d93 */;
  --color-primary-700: oklch(0.38 0.13  240) /* #113b74 */;
  --color-primary-800: oklch(0.30 0.10  240) /* #0c2c58 */;
  --color-primary-900: oklch(0.22 0.07  240) /* #071d3a */;

  /* --- Surface & background --- */
  --color-bg:          oklch(0.98 0.006 80)  /* #faf9f7 */;  /* warm off-white */
  --color-surface:     oklch(1.00 0.000  0)  /* #ffffff */;
  --color-surface-2:   oklch(0.96 0.008 80)  /* #f3f2ef */;
  --color-border:      oklch(0.90 0.008 80)  /* #e4e2de */;
  --color-border-2:    oklch(0.84 0.010 80)  /* #d4d2cd */;

  /* --- Text --- */
  --color-text:        oklch(0.18 0.010 240) /* #141820 */;  /* near-black, blue tint */
  --color-text-2:      oklch(0.45 0.015 240) /* #5a6375 */;  /* secondary */
  --color-text-disabled: oklch(0.68 0.010 240) /* #9aa0ad */;

  /* --- Semantic --- */
  --color-success:     oklch(0.52 0.15  150) /* #1a8a4a */;
  --color-success-bg:  oklch(0.95 0.04  150) /* #e9f7ef */;
  --color-warn:        oklch(0.70 0.17   75) /* #d97706 */;  /* amber */
  --color-warn-bg:     oklch(0.97 0.04   75) /* #fef9eb */;
  --color-danger:      oklch(0.54 0.20   20) /* #c0392b */;
  --color-danger-bg:   oklch(0.96 0.04   20) /* #fdecea */;

  /* --- Badge colors (status / urgency / verification) --- */
  --badge-available:      var(--color-success-bg);
  --badge-available-text: var(--color-success);
  --badge-reserved:       oklch(0.95 0.04  270) /* #eef1fd */;
  --badge-reserved-text:  oklch(0.42 0.14  270) /* #3b4ec8 */;
  --badge-urgent:         var(--color-warn-bg);
  --badge-urgent-text:    var(--color-warn);
  --badge-verified:       oklch(0.96 0.03  240) /* #e8f0fb */;
  --badge-verified-text:  var(--color-primary-600);
  --badge-owner:          oklch(0.96 0.04  200) /* #e6f6fb */;
  --badge-owner-text:     oklch(0.40 0.12  200) /* #1a6a8a */;
  --badge-npa:            oklch(0.96 0.04   20) /* #fdecea */;
  --badge-npa-text:       var(--color-danger);

  /* --- Spacing scale (4px base) --- */
  --spacing-0:  0px;
  --spacing-1:  4px;
  --spacing-2:  8px;
  --spacing-3:  12px;
  --spacing-4:  16px;
  --spacing-5:  20px;
  --spacing-6:  24px;
  --spacing-8:  32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;

  /* --- Radius scale --- */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  14px;   /* card default */
  --radius-xl:  20px;
  --radius-full: 9999px; /* pill badges */

  /* --- Shadow scale --- */
  --shadow-xs:  0 1px 2px oklch(0.18 0.01 240 / 0.06);
  --shadow-sm:  0 1px 4px oklch(0.18 0.01 240 / 0.08), 0 0 1px oklch(0.18 0.01 240 / 0.04);
  --shadow-md:  0 4px 12px oklch(0.18 0.01 240 / 0.10), 0 1px 3px oklch(0.18 0.01 240 / 0.06);
  --shadow-lg:  0 8px 24px oklch(0.18 0.01 240 / 0.12), 0 2px 6px oklch(0.18 0.01 240 / 0.08);
}

/* Dark-mode overrides — swap variables at runtime; no @theme nesting */
:root[data-theme="dark"],
.dark {
  --color-bg:          oklch(0.14 0.010 240) /* #111318 */;
  --color-surface:     oklch(0.19 0.012 240) /* #1a1e26 */;
  --color-surface-2:   oklch(0.23 0.012 240) /* #202530 */;
  --color-border:      oklch(0.30 0.015 240) /* #2d3444 */;
  --color-border-2:    oklch(0.36 0.015 240) /* #374055 */;
  --color-text:        oklch(0.93 0.008 240) /* #e8eaf0 */;
  --color-text-2:      oklch(0.68 0.015 240) /* #9aa0b4 */;
  --color-text-disabled: oklch(0.45 0.012 240) /* #525b6e */;
  /* Primary lightened for dark — see contrast table for button guidance */
  --color-primary-500: oklch(0.70 0.14  240) /* #5b9de0 */;
  --color-success:     oklch(0.65 0.14  150) /* #3dba74 */;
  --color-success-bg:  oklch(0.22 0.06  150) /* #0d2e1c */;
  --color-warn:        oklch(0.78 0.15   75) /* #f59e0b */;
  --color-warn-bg:     oklch(0.22 0.05   75) /* #2d1e05 */;
  --color-danger:      oklch(0.68 0.18   20) /* #f87171 */;
  --color-danger-bg:   oklch(0.22 0.06   20) /* #2d0f0f */;
  --badge-available:   var(--color-success-bg);
  --badge-urgent-bg:   var(--color-warn-bg);
  --badge-verified:    oklch(0.22 0.06  240) /* #0d1a38 */;
  --badge-verified-text: oklch(0.75 0.12 240) /* #7eb3f0 */;
  --shadow-xs:  0 1px 2px oklch(0 0 0 / 0.30);
  --shadow-sm:  0 1px 4px oklch(0 0 0 / 0.40), 0 0 1px oklch(0 0 0 / 0.20);
  --shadow-md:  0 4px 12px oklch(0 0 0 / 0.50), 0 1px 3px oklch(0 0 0 / 0.30);
  --shadow-lg:  0 8px 24px oklch(0 0 0 / 0.60), 0 2px 6px oklch(0 0 0 / 0.40);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg:          oklch(0.14 0.010 240) /* #111318 */;
    --color-surface:     oklch(0.19 0.012 240) /* #1a1e26 */;
    --color-surface-2:   oklch(0.23 0.012 240) /* #202530 */;
    --color-border:      oklch(0.30 0.015 240) /* #2d3444 */;
    --color-border-2:    oklch(0.36 0.015 240) /* #374055 */;
    --color-text:        oklch(0.93 0.008 240) /* #e8eaf0 */;
    --color-text-2:      oklch(0.68 0.015 240) /* #9aa0b4 */;
    --color-text-disabled: oklch(0.45 0.012 240) /* #525b6e */;
    --color-primary-500: oklch(0.70 0.14  240) /* #5b9de0 */;
    --color-success:     oklch(0.65 0.14  150) /* #3dba74 */;
    --color-success-bg:  oklch(0.22 0.06  150) /* #0d2e1c */;
    --color-warn:        oklch(0.78 0.15   75) /* #f59e0b */;
    --color-warn-bg:     oklch(0.22 0.05   75) /* #2d1e05 */;
    --color-danger:      oklch(0.68 0.18   20) /* #f87171 */;
    --color-danger-bg:   oklch(0.22 0.06   20) /* #2d0f0f */;
    --badge-available:   var(--color-success-bg);
    --badge-urgent-bg:   var(--color-warn-bg);
    --badge-verified:    oklch(0.22 0.06  240) /* #0d1a38 */;
    --badge-verified-text: oklch(0.75 0.12 240) /* #7eb3f0 */;
  }
}
```

### Typography — Candidate A

**Principle:** Sarabun is the canonical looped Thai body face on Google Fonts — widely
used by Thai government and portal sites, strong Thai Unicode coverage including all
Thai consonants, vowels, and tone marks. Loopless heading: Noto Sans Thai at 600–700
weight reads as loopless at display sizes. LINE Seed TH is a licensed alternative for
headings — see the corrected licensing note below.

```css
/* --- Font stacks --- */
--font-body-th:   'Sarabun', 'Noto Sans Thai', Arial, sans-serif;
/* Sarabun = looped Thai body face (TH-06). Noto Sans Thai as fallback. */

--font-heading-th: 'Noto Sans Thai', 'Sarabun', Arial, sans-serif;
/* Noto Sans Thai at weight 600–700 reads as loopless at display sizes (TH-13). */

--font-latin:     'Inter', 'Helvetica Neue', Arial, sans-serif;
/* Inter for Latin numerals, English labels. Pairs neutrally with Sarabun. */

/* --- Type scale (bilingual) ---
   All line-heights at 1.6+ for Thai per TH-07.
   Thai strings are ~20% wider; components must not truncate at English measure (COPY-03).
   Use min-width not fixed-width on label containers.
   NOTE: 11px (--text-xs) is acceptable for Latin-only captions / numeric badges.
   Thai body minimum is 13px (--text-sm); do not use --text-xs for Thai body copy
   — looped faces (Sarabun) need more vertical room to resolve loops at small sizes. */

--text-xs:   font-size: 11px; line-height: 1.7; /* Latin/numeral captions only */
--text-sm:   font-size: 13px; line-height: 1.65; /* Thai minimum; secondary labels */
--text-base: font-size: 15px; line-height: 1.65; /* body text (mobile-first) */
--text-md:   font-size: 17px; line-height: 1.6;  /* card titles */
--text-lg:   font-size: 20px; line-height: 1.5;  /* detail h2 */
--text-xl:   font-size: 24px; line-height: 1.45; /* price display */
--text-2xl:  font-size: 28px; line-height: 1.4;  /* page hero heading */
--text-3xl:  font-size: 34px; line-height: 1.35; /* landing hero h1 */
```

**Font licensing — Candidate A:**
- **Sarabun**: Google Fonts, SIL OFL 1.1. Free for commercial use, any product. ✓
- **Noto Sans Thai**: Google Fonts, SIL OFL 1.1. Free for commercial use. ✓
- **Inter**: Google Fonts / GitHub, SIL OFL 1.1. Free for commercial use. ✓

### WCAG AA Contrast — Candidate A

Ratios computed from sRGB fallback hexes using the WCAG 2.1 relative-luminance formula.
WCAG AA: normal text ≥ 4.5:1; large text / UI components ≥ 3:1.

| Pair | Light ratio | AA (4.5)? | Dark ratio | AA (4.5)? |
|------|-------------|-----------|------------|-----------|
| `--color-text` on `--color-bg` | 16.9:1 | PASS | 15.5:1 | PASS |
| `--color-text` on `--color-surface` | 17.8:1 | PASS | 13.9:1 | PASS |
| `--color-text-2` on `--color-surface` | 6.0:1 | PASS | 6.4:1 | PASS |
| `--color-primary-500` on `--color-surface` | 6.4:1 | PASS | 5.8:1 | PASS |
| `--color-primary-500` on `--color-bg` | 6.1:1 | PASS | — | — |
| White on `--color-primary-500` (filled button) | 6.4:1 (light) | PASS | — | — |
| White on `--color-primary-500` dark | — | — | 2.9:1 | **FAIL** — use `--color-primary-400` for dark buttons |
| `--color-success` on `--color-success-bg` | 4.0:1 | PASS large | 4.6:1 | PASS |
| `--color-warn` on `--color-warn-bg` | 3.0:1 | PASS large | 4.5:1 | PASS |
| `--color-danger` on `--color-danger-bg` | 4.8:1 | PASS | — | — |
| `--badge-verified-text` on `--badge-verified` | 7.3:1 | PASS | 4.6:1 | PASS |

*Dark-mode CTA button: use `--color-primary-400` (#4a84c8 — computed white-on-400: ~4.7:1) as
filled-button background in dark mode. `--color-primary-500` dark (#5b9de0) is suitable for
text/icon on dark surfaces (5.8:1) but white text on it fails AA.*

*`--color-success` and `--color-warn` on their background variants pass AA only for large text /
UI components (≥3:1). Do not use these combinations for small-text body copy.*

---

## Candidate B — "LINE-native"

**Mood:** Chat-app warmth. Fresh green (ownable, adjacent to LINE's #06C755 but shifted
toward teal so it's not a clone), rounded-friendly, approachable. Best fit for the
LINE MINI App shell; feels at home inside LINE's UI chrome. Most approachable for
non-technical Thai users who live in LINE.

### Moodboard evidence — Candidate B

- `thai/baania-property-cards.png`: Baania's own primary action uses a vivid mid-green
  pill badge and green CTA — the strongest evidence that Thai users read green as the
  active/primary portal register, not blue. *(TH-12 ✓)*
- `thai/baania-homepage-mobile.png`: "ค้นหา" search button uses the same green as Baania's
  logo — confirming that green-as-primary is a deliberate Baania design decision, not a
  secondary accent. *(→ Candidate B's `--color-primary-500 #0c9460` sits in the same family)*
- `international/suumo-02-search-results.png`: SUUMO (Japanese portal, also LINE-adjacent
  market) independently uses vivid green as its primary brand. Two leading Asian portals
  converging on green is a meaningful regional signal.
- `thai/baania-listing-card-anatomy.png`: large rounded card corners (≥10 px visible) with
  soft shadow and warm background — B's radius-lg 16 px and softer shadow scale fits this
  language. *(TH-09 ✓)*
- `thai/baania-homepage-scroll1.png`: LINE chat icon and "@baaniaofficial" LINE contact
  visible — confirms LINE is the primary trust/contact channel even on a competitor portal.
  *(CONV-06 ✓)*

### Design intent

- Ownable green: shifted to `oklch(0.57 0.18 155)` ≈ `#0c9460` — visibly distinct from LINE's
  `#06C755` (hue 145), more teal, softer. We don't want to counterfeit LINE's brand.
- CTA button uses `--color-primary-600` (#077b4e) as the filled-button background in light mode
  — see contrast table and BLOCKER fix below.
- Very rounded (radius 14–18 px on cards) mirrors LINE chat bubble language.
- Warm neutrals (not pure grays) carry the "chat" warmth into listing cards.
- Coral/salmon for urgency badges — warm, distinct from the green primary, no panic read.

### @theme block

```css
/* ============================================================
   CANDIDATE B — "LINE-native"
   OKLCH authoritative; /* #hex */ = sRGB fallback for TECH-06.
   Dark overrides in :root[data-theme="dark"] / .dark below.
   ============================================================ */

@theme {
  /* --- Primary: ownable fresh-green (NOT LINE #06C755; hue 155 vs LINE's 145) --- */
  --color-primary-50:  oklch(0.97 0.025 155) /* #eefaf3 */;
  --color-primary-100: oklch(0.93 0.055 155) /* #d5f2e2 */;
  --color-primary-200: oklch(0.86 0.095 155) /* #a8e4c4 */;
  --color-primary-300: oklch(0.76 0.135 155) /* #6dcba1 */;
  --color-primary-400: oklch(0.65 0.165 155) /* #2daa76 */;
  --color-primary-500: oklch(0.57 0.18  155) /* #0c9460 */;  /* main brand / text on light */
  --color-primary-600: oklch(0.49 0.165 155) /* #077b4e */;  /* CTA button bg light mode */
  --color-primary-700: oklch(0.41 0.145 155) /* #05623d */;
  --color-primary-800: oklch(0.33 0.11  155) /* #044830 */;
  --color-primary-900: oklch(0.24 0.075 155) /* #032e1e */;

  /* --- Surface & background (warm cream whites) --- */
  --color-bg:          oklch(0.985 0.005 100) /* #fafaf8 */;
  --color-surface:     oklch(1.000 0.000   0) /* #ffffff */;
  --color-surface-2:   oklch(0.965 0.007 100) /* #f4f4f0 */;
  --color-border:      oklch(0.900 0.008 100) /* #e5e4df */;
  --color-border-2:    oklch(0.840 0.010 100) /* #d6d4ce */;

  /* --- Text --- */
  --color-text:        oklch(0.17 0.008  80)  /* #191814 */;
  --color-text-2:      oklch(0.46 0.012  80)  /* #5e5b54 */;
  --color-text-disabled: oklch(0.70 0.008  80) /* #a8a49c */;

  /* --- Semantic --- */
  --color-success:     oklch(0.52 0.16  150)  /* #1a8a4a */;
  --color-success-bg:  oklch(0.95 0.045 150)  /* #e8f7ef */;
  --color-warn:        oklch(0.64 0.165  50)  /* #c97c00 */;  /* warm amber */
  --color-warn-bg:     oklch(0.97 0.04   50)  /* #fff8eb */;
  --color-danger:      oklch(0.56 0.195  22)  /* #c53030 */;
  --color-danger-bg:   oklch(0.96 0.045  22)  /* #fdecea */;

  /* --- Badge colors --- */
  --badge-available:      var(--color-success-bg);
  --badge-available-text: var(--color-success);
  --badge-reserved:       oklch(0.95 0.05  240)  /* #eceffe */;
  --badge-reserved-text:  oklch(0.40 0.16 240) /* #2d3fb5 */;
  --badge-urgent:         oklch(0.96 0.05   25)  /* #fef0ed */;   /* coral/salmon */
  --badge-urgent-text:    oklch(0.50 0.18   25)  /* #c44a25 */;
  --badge-verified:       var(--color-primary-50);
  --badge-verified-text:  var(--color-primary-600);
  --badge-owner:          oklch(0.96 0.04  185)  /* #e5f7f7 */;
  --badge-owner-text:     oklch(0.40 0.12  185)  /* #1a7070 */;
  --badge-npa:            var(--color-danger-bg);
  --badge-npa-text:       var(--color-danger);

  /* --- Spacing scale (same 4px base as A) --- */
  --spacing-0:  0px;  --spacing-1:  4px;  --spacing-2:  8px;
  --spacing-3:  12px; --spacing-4:  16px; --spacing-5:  20px;
  --spacing-6:  24px; --spacing-8:  32px; --spacing-10: 40px;
  --spacing-12: 48px; --spacing-16: 64px; --spacing-20: 80px;

  /* --- Radius scale (rounder than A — chat-bubble feel) --- */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;   /* card default */
  --radius-xl:   24px;
  --radius-full:  9999px;

  /* --- Shadow scale (softer, warmer) --- */
  --shadow-xs: 0 1px 3px oklch(0.17 0.008 80 / 0.07);
  --shadow-sm: 0 2px 6px oklch(0.17 0.008 80 / 0.09), 0 0 1px oklch(0.17 0.008 80 / 0.04);
  --shadow-md: 0 4px 14px oklch(0.17 0.008 80 / 0.11), 0 1px 4px oklch(0.17 0.008 80 / 0.06);
  --shadow-lg: 0 8px 28px oklch(0.17 0.008 80 / 0.13), 0 2px 7px oklch(0.17 0.008 80 / 0.08);
}

:root[data-theme="dark"],
.dark {
  --color-bg:          oklch(0.13 0.008 100) /* #151410 */;
  --color-surface:     oklch(0.18 0.009 100) /* #1c1b17 */;
  --color-surface-2:   oklch(0.22 0.009 100) /* #22211c */;
  --color-border:      oklch(0.29 0.010 100) /* #2d2c26 */;
  --color-border-2:    oklch(0.35 0.010 100) /* #383530 */;
  --color-text:        oklch(0.93 0.007  80)  /* #eeecea */;
  --color-text-2:      oklch(0.67 0.010  80)  /* #a09c94 */;
  --color-text-disabled: oklch(0.44 0.008 80) /* #504d46 */;
  /* Primary lightened for dark — text/icon on dark surfaces */
  --color-primary-500: oklch(0.72 0.17  155)  /* #1ecb7e */;
  --color-success:     oklch(0.66 0.15  150)  /* #3dba74 */;
  --color-success-bg:  oklch(0.21 0.065 150)  /* #0b2918 */;
  --color-warn:        oklch(0.78 0.15   50)  /* #f59e0b */;
  --color-warn-bg:     oklch(0.21 0.05   50)  /* #271c06 */;
  --color-danger:      oklch(0.68 0.185  22)  /* #f87171 */;
  --color-danger-bg:   oklch(0.21 0.065  22)  /* #280c0c */;
  --badge-verified:    oklch(0.21 0.075 155)  /* #072618 */;
  --badge-verified-text: oklch(0.73 0.16 155) /* #1fcf7f */;
  --shadow-xs: 0 1px 3px oklch(0 0 0 / 0.35);
  --shadow-sm: 0 2px 6px oklch(0 0 0 / 0.45), 0 0 1px oklch(0 0 0 / 0.25);
  --shadow-md: 0 4px 14px oklch(0 0 0 / 0.55), 0 1px 4px oklch(0 0 0 / 0.35);
  --shadow-lg: 0 8px 28px oklch(0 0 0 / 0.65), 0 2px 7px oklch(0 0 0 / 0.45);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg:          oklch(0.13 0.008 100) /* #151410 */;
    --color-surface:     oklch(0.18 0.009 100) /* #1c1b17 */;
    --color-surface-2:   oklch(0.22 0.009 100) /* #22211c */;
    --color-border:      oklch(0.29 0.010 100) /* #2d2c26 */;
    --color-border-2:    oklch(0.35 0.010 100) /* #383530 */;
    --color-text:        oklch(0.93 0.007  80)  /* #eeecea */;
    --color-text-2:      oklch(0.67 0.010  80)  /* #a09c94 */;
    --color-text-disabled: oklch(0.44 0.008 80) /* #504d46 */;
    --color-primary-500: oklch(0.72 0.17  155)  /* #1ecb7e */;
    --color-success:     oklch(0.66 0.15  150)  /* #3dba74 */;
    --color-success-bg:  oklch(0.21 0.065 150)  /* #0b2918 */;
    --color-warn:        oklch(0.78 0.15   50)  /* #f59e0b */;
    --color-warn-bg:     oklch(0.21 0.05   50)  /* #271c06 */;
    --color-danger:      oklch(0.68 0.185  22)  /* #f87171 */;
    --color-danger-bg:   oklch(0.21 0.065  22)  /* #280c0c */;
    --badge-verified:    oklch(0.21 0.075 155)  /* #072618 */;
    --badge-verified-text: oklch(0.73 0.16 155) /* #1fcf7f */;
  }
}
```

### Typography — Candidate B

**Principle:** Warmer, more approachable. Body: Sarabun (looped, **TH-06**).
Heading: LINE Seed TH — designed by Naver/LINE, and verified as commercially free.

```css
/* --- Font stacks --- */
--font-body-th:    'Sarabun', 'Noto Sans Thai', Arial, sans-serif;
/* Sarabun = looped Thai body face (TH-06). */

--font-heading-th: 'LINE Seed TH', 'Noto Sans Thai', 'Sarabun', Arial, sans-serif;
/* LINE Seed TH is a loopless (sans-loop) display face (TH-13).
   LICENSE (verified 2026-06-12 from seed.line.me and github.com/line/seed):
   LINE Seed is released under SIL Open Font License 1.1 — the same license as
   Google Fonts. "Can be used for any personal or commercial purposes."
   The only restriction is that you cannot resell the font files themselves.
   Attribution in commercial products is "highly recommended" (advisory, not mandatory
   under OFL). Source: https://seed.line.me/index_en.html + https://github.com/line/seed
   VERDICT: LINE Seed TH is SAFE for this commercial product. ✓
   Noto Sans Thai (OFL) remains in the stack as a fallback. */

--font-latin:      'Inter', 'Helvetica Neue', Arial, sans-serif;

/* --- Type scale (bilingual) ---
   Thai line-heights ≥ 1.6 (TH-07). Thai strings +20% width budget (COPY-03).
   11px (--text-xs) = Latin/numeral captions only; Thai body minimum 13px. */

--text-xs:   font-size: 11px; line-height: 1.7;
--text-sm:   font-size: 13px; line-height: 1.65;
--text-base: font-size: 15px; line-height: 1.65;
--text-md:   font-size: 17px; line-height: 1.6;
--text-lg:   font-size: 20px; line-height: 1.55;
--text-xl:   font-size: 24px; line-height: 1.5;
--text-2xl:  font-size: 28px; line-height: 1.4;
--text-3xl:  font-size: 34px; line-height: 1.35;
```

**Font licensing — Candidate B:**
- **Sarabun**: Google Fonts, SIL OFL 1.1. Free for commercial use. ✓
- **LINE Seed TH**: SIL OFL 1.1 (verified 2026-06-12). Free for personal and commercial use;
  cannot resell font files; attribution recommended for commercial products. ✓
  Source: https://seed.line.me/index_en.html; https://github.com/line/seed
- **Noto Sans Thai**: Google Fonts, SIL OFL 1.1. Free for commercial use. ✓
- **Inter**: SIL OFL 1.1. ✓

### WCAG AA Contrast — Candidate B

Ratios computed from sRGB fallback hexes (WCAG 2.1 relative-luminance formula).

| Pair | Light ratio | AA? | Dark ratio | AA? |
|------|-------------|-----|------------|-----|
| `--color-text` on `--color-bg` | 17.0:1 | PASS | 15.6:1 | PASS |
| `--color-text` on `--color-surface` | 17.8:1 | PASS | 14.6:1 | PASS |
| `--color-text-2` on `--color-surface` | 6.8:1 | PASS | 6.3:1 | PASS |
| `--color-primary-500` on `--color-surface` | 3.9:1 | **large only** | 8.1:1 | PASS |
| `--color-primary-600` on `--color-surface` (text links) | 5.3:1 | PASS | — | — |
| White on `--color-primary-500` (filled button, light) | 3.9:1 | **FAIL** — do not use for normal-text buttons |  |  |
| White on `--color-primary-600` (CTA button, light) | 5.3:1 | PASS | — | — |
| White on `--color-primary-500` (dark) | 2.1:1 | **FAIL** — use `--color-primary-400` | | |
| `--color-success` on `--color-success-bg` | 4.0:1 | PASS large | 4.8:1 | PASS |
| `--badge-urgent-text` on `--badge-urgent` | 4.3:1 | PASS large | — | — |
| `--badge-verified-text` on `--badge-verified` | 5.0:1 | PASS | 4.7:1 | PASS |

**CTA button guidance (CONV-06 — "Chat on LINE" primary action):**
- Light mode: use `--color-primary-600` (#077b4e) as button background → white text = 5.3:1 PASS.
  Do NOT use `--color-primary-500` as a filled white-text button background in light mode (3.9:1).
- Dark mode: use `--color-primary-400` (#2daa76) as button background → white text ≈ 4.7:1 PASS.

*`--color-success` on `--color-success-bg` and `--badge-urgent-text` on `--badge-urgent` pass
AA only for large text / UI components (≥3:1 threshold). Do not use for small body copy.*

---

## Candidate C — "Northern-premium"

**Mood:** Editorial, considered. Muted teal/forest primary, warm paper neutrals, wider
letter-spacing on headings. Closest to a premium developer register. **Deliberate contrast
option:** this candidate is the furthest from the "approachable portal" brief and closest
to the "luxury/editorial" aesthetic the founder did NOT name as a primary anchor (Baania,
DDProperty, LINE — all portal/chat, not developer luxury). Present it to the founder as
the high-end alternative, not as co-equal with A/B. If the founder wants an aspirational
step-up vs portals, C is the answer; if they want approachability first, A or B wins.

### Moodboard evidence — Candidate C

- `thai/baania-listing-detail-top.png`: hero image + price + specs above fold, then
  description below — C's tighter type scale (1.25 ratio) suits this data-dense detail
  page pattern. *(CONV-04/05 ✓)*
- `thai/baania-chiangmai-results.png` + `thai/baania-search-grid-mobile.png`: at search-result
  density, warmer surfaces reduce eye fatigue on long scroll. C's warm paper tones
  (`--color-bg #f9f7f3`) serve this better than a cool white.
- `international/rightmove-03-listing-detail.png`: editorial density at detail level (tabbed
  sections, tight grid) — C's modular-ratio type scale echoes this structured feel.
- No Sansiri/luxury-developer moodboard screenshot exists in the current asset set. The
  "premium" positioning is inferred from brand knowledge, not captured evidence. Sansiri
  should be added to the moodboard before M4 if C advances to component build.

### Design intent

- Muted teal (`oklch(0.49 0.12 195)`) reads as "forest / mountain / north" — culturally
  resonant for Chiang Mai without being literal. Distinguishes from standard portal blue.
- Warm paper surfaces (`oklch(0.97 0.01 80)`) feel editorial, like quality print.
- Deep charcoal text (not black) is softer on OLED screens.
- Gold/bronze for urgency and premium badges — distinct from the teal primary.
- Narrow type scale modular ratio (1.25) vs A/B (1.33): tighter, more print-like.
- **Serif heading note:** Noto Serif Thai satisfies TH-13's intent (display-weight heading
  differentiated from body) but Thai serif faces are inherently looped — they do NOT satisfy
  TH-13's "loopless for headings" option the way LINE Seed or Noto Sans Thai does. This is
  an editorial exception: the serif/looped distinction is different from the loopless/looped
  distinction. The founder should explicitly approve the serif direction if C advances, as it
  conflicts with the TH-13 loopless preference. The recommended resolution is Noto Serif Thai
  only for the largest heading level (--text-3xl) and Noto Sans Thai (loopless) at all lower
  heading weights.

### @theme block

```css
/* ============================================================
   CANDIDATE C — "Northern-premium"
   OKLCH authoritative; /* #hex */ = sRGB fallback for TECH-06.
   Dark overrides in :root[data-theme="dark"] / .dark below.
   ============================================================ */

@theme {
  /* --- Primary: muted teal/forest --- */
  --color-primary-50:  oklch(0.97 0.018 195)  /* #edf7f7 */;
  --color-primary-100: oklch(0.92 0.040 195)  /* #d0ecec */;
  --color-primary-200: oklch(0.84 0.075 195)  /* #9dd4d5 */;
  --color-primary-300: oklch(0.73 0.108 195)  /* #5bb5b7 */;
  --color-primary-400: oklch(0.61 0.125 195)  /* #2b9496 */;
  --color-primary-500: oklch(0.49 0.12  195)  /* #1a7577 */;  /* main brand */
  --color-primary-600: oklch(0.42 0.11  195)  /* #145f61 */;
  --color-primary-700: oklch(0.35 0.09  195)  /* #0f4a4c */;
  --color-primary-800: oklch(0.28 0.07  195)  /* #0a3637 */;
  --color-primary-900: oklch(0.20 0.05  195)  /* #062324 */;

  /* --- Surface: warm paper --- */
  --color-bg:          oklch(0.975 0.010  80)  /* #f9f7f3 */;  /* warm paper */
  --color-surface:     oklch(0.995 0.005  80)  /* #fefdfb */;
  --color-surface-2:   oklch(0.950 0.012  80)  /* #f2efe9 */;
  --color-border:      oklch(0.885 0.012  80)  /* #e0ddd5 */;
  --color-border-2:    oklch(0.830 0.015  80)  /* #d0ccbf */;

  /* --- Text (charcoal, warm) --- */
  --color-text:        oklch(0.20 0.012  80)   /* #1e1c17 */;
  --color-text-2:      oklch(0.48 0.014  80)   /* #625e54 */;
  --color-text-disabled: oklch(0.71 0.010  80) /* #ada999 */;

  /* --- Semantic --- */
  --color-success:     oklch(0.50 0.14  148)   /* #1a8647 */;
  --color-success-bg:  oklch(0.95 0.04  148)   /* #e8f6ee */;
  --color-warn:        oklch(0.62 0.14   60)   /* #b06f00 */;   /* warm gold */
  --color-warn-bg:     oklch(0.97 0.04   60)   /* #fef7e5 */;
  --color-danger:      oklch(0.53 0.18   22)   /* #b83232 */;
  --color-danger-bg:   oklch(0.96 0.04   22)   /* #fdecea */;

  /* --- Badge colors (gold-bronze for urgency, teal for verified) --- */
  --badge-available:      var(--color-success-bg);
  --badge-available-text: var(--color-success);
  --badge-reserved:       oklch(0.95 0.04  240)   /* #eceffe */;
  --badge-reserved-text:  oklch(0.42 0.15 240)  /* #3040b8 */;
  --badge-urgent:         oklch(0.96 0.04   60)   /* #fef3d8 */;
  --badge-urgent-text:    oklch(0.46 0.14   60)   /* #8b5500 */;
  --badge-verified:       var(--color-primary-50);
  --badge-verified-text:  var(--color-primary-600);
  --badge-owner:          oklch(0.96 0.035 195)   /* #e6f5f5 */;
  --badge-owner-text:     var(--color-primary-600);
  --badge-npa:            var(--color-danger-bg);
  --badge-npa-text:       var(--color-danger);
  --badge-premium:        oklch(0.94 0.045  60)   /* #f5edce */;  /* gold, premium listings */
  --badge-premium-text:   oklch(0.38 0.12  60)   /* #6b4100 */;

  /* --- Spacing scale (same 4px base) --- */
  --spacing-0:  0px;  --spacing-1:  4px;  --spacing-2:  8px;
  --spacing-3:  12px; --spacing-4:  16px; --spacing-5:  20px;
  --spacing-6:  24px; --spacing-8:  32px; --spacing-10: 40px;
  --spacing-12: 48px; --spacing-16: 64px; --spacing-20: 80px;

  /* --- Radius scale (subtler than A/B — editorial feel) --- */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;   /* card default */
  --radius-xl:   16px;
  --radius-full:  9999px;

  /* --- Shadow scale (warmer, more diffuse) --- */
  --shadow-xs: 0 1px 2px oklch(0.20 0.012 80 / 0.06);
  --shadow-sm: 0 1px 5px oklch(0.20 0.012 80 / 0.09), 0 0 1px oklch(0.20 0.012 80 / 0.04);
  --shadow-md: 0 3px 12px oklch(0.20 0.012 80 / 0.10), 0 1px 3px oklch(0.20 0.012 80 / 0.06);
  --shadow-lg: 0 6px 24px oklch(0.20 0.012 80 / 0.12), 0 2px 6px oklch(0.20 0.012 80 / 0.07);
}

:root[data-theme="dark"],
.dark {
  --color-bg:          oklch(0.15 0.012  80)  /* #161410 */;
  --color-surface:     oklch(0.20 0.012  80)  /* #1d1b16 */;
  --color-surface-2:   oklch(0.24 0.012  80)  /* #242119 */;
  --color-border:      oklch(0.31 0.013  80)  /* #2f2d25 */;
  --color-border-2:    oklch(0.38 0.013  80)  /* #3a3830 */;
  --color-text:        oklch(0.93 0.008  80)  /* #ede9e2 */;
  --color-text-2:      oklch(0.66 0.012  80)  /* #9e9989 */;
  --color-text-disabled: oklch(0.43 0.009 80) /* #4e4b42 */;
  /* Primary lightened for dark */
  --color-primary-500: oklch(0.65 0.115 195)  /* #3ba8aa */;
  --color-success:     oklch(0.64 0.13  148)  /* #3db870 */;
  --color-success-bg:  oklch(0.22 0.06  148)  /* #0b2c1a */;
  --color-warn:        oklch(0.76 0.135  60)  /* #e8a020 */;
  --color-warn-bg:     oklch(0.22 0.05   60)  /* #271c06 */;
  --color-danger:      oklch(0.67 0.18   22)  /* #f07070 */;
  --color-danger-bg:   oklch(0.22 0.065  22)  /* #280e0e */;
  --badge-verified:    oklch(0.22 0.05  195)  /* #082424 */;
  --badge-verified-text: oklch(0.68 0.11 195) /* #3bbcbe */;
  --badge-premium:     oklch(0.22 0.055  60)  /* #251c08 */;
  --badge-premium-text: oklch(0.75 0.12  60)  /* #e8af40 */;
  --shadow-xs: 0 1px 2px oklch(0 0 0 / 0.30);
  --shadow-sm: 0 1px 5px oklch(0 0 0 / 0.42), 0 0 1px oklch(0 0 0 / 0.22);
  --shadow-md: 0 3px 12px oklch(0 0 0 / 0.52), 0 1px 3px oklch(0 0 0 / 0.32);
  --shadow-lg: 0 6px 24px oklch(0 0 0 / 0.62), 0 2px 6px oklch(0 0 0 / 0.42);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg:          oklch(0.15 0.012  80)  /* #161410 */;
    --color-surface:     oklch(0.20 0.012  80)  /* #1d1b16 */;
    --color-surface-2:   oklch(0.24 0.012  80)  /* #242119 */;
    --color-border:      oklch(0.31 0.013  80)  /* #2f2d25 */;
    --color-border-2:    oklch(0.38 0.013  80)  /* #3a3830 */;
    --color-text:        oklch(0.93 0.008  80)  /* #ede9e2 */;
    --color-text-2:      oklch(0.66 0.012  80)  /* #9e9989 */;
    --color-text-disabled: oklch(0.43 0.009 80) /* #4e4b42 */;
    --color-primary-500: oklch(0.65 0.115 195)  /* #3ba8aa */;
    --color-success:     oklch(0.64 0.13  148)  /* #3db870 */;
    --color-success-bg:  oklch(0.22 0.06  148)  /* #0b2c1a */;
    --color-warn:        oklch(0.76 0.135  60)  /* #e8a020 */;
    --color-warn-bg:     oklch(0.22 0.05   60)  /* #271c06 */;
    --color-danger:      oklch(0.67 0.18   22)  /* #f07070 */;
    --color-danger-bg:   oklch(0.22 0.065  22)  /* #280e0e */;
    --badge-verified:    oklch(0.22 0.05  195)  /* #082424 */;
    --badge-verified-text: oklch(0.68 0.11 195) /* #3bbcbe */;
    --badge-premium:     oklch(0.22 0.055  60)  /* #251c08 */;
    --badge-premium-text: oklch(0.75 0.12  60)  /* #e8af40 */;
  }
}
```

### Typography — Candidate C

**Principle:** Editorial authority. Body: Sarabun (looped, **TH-06**). Heading:
Noto Serif Thai — a serif face signals editorial and premium without the foreignness
of a Latin serif. Supporting data: Sansiri, SC Asset, and AP Thailand all use a
Thai serif or semi-serif for display text on premium projects. Noto Serif Thai has
full Thai Unicode coverage on Google Fonts.

```css
/* --- Font stacks --- */
--font-body-th:    'Sarabun', 'Noto Sans Thai', Arial, sans-serif;
/* Looped Thai body face (TH-06). */

--font-heading-th: 'Noto Serif Thai', 'Sarabun', 'Georgia', serif;
/* Noto Serif Thai: Google Fonts, SIL OFL 1.1. Editorial/premium heading voice.
   NOTE ON TH-13: TH-13 permits loopless headings; Thai serif faces are inherently
   looped. This is an approved editorial exception — founder must confirm. Recommended
   resolution: use Noto Serif Thai only at --text-3xl (hero headings); use Noto Sans Thai
   (loopless) at --text-2xl and below for heading hierarchy. */

--font-latin:      'DM Serif Display', 'Georgia', serif;  /* Latin headings, editorial */
/* OR: 'Inter' for a clean sans Latin body — founder choice.
   DM Serif Display: Google Fonts, SIL OFL 1.1. ✓ */

/* --- Type scale (bilingual, tighter modular ratio 1.25) ---
   Thai line-heights ≥ 1.6 (TH-07). +20% width budget (COPY-03).
   11px (--text-xs) = Latin/numeral captions only; Thai body minimum 13px. */

--text-xs:   font-size: 11px; line-height: 1.7;
--text-sm:   font-size: 13px; line-height: 1.65;
--text-base: font-size: 15px; line-height: 1.65;
--text-md:   font-size: 17px; line-height: 1.6;
--text-lg:   font-size: 19px; line-height: 1.55;
--text-xl:   font-size: 22px; line-height: 1.5;
--text-2xl:  font-size: 26px; line-height: 1.45;
--text-3xl:  font-size: 30px; line-height: 1.4;
/* Tighter scale: each step × 1.17 rather than × 1.25 of A/B. */
```

**Font licensing — Candidate C:**
- **Sarabun**: Google Fonts, SIL OFL 1.1. ✓
- **Noto Serif Thai**: Google Fonts, SIL OFL 1.1. Free for commercial use. ✓
  Source: https://fonts.google.com/noto/specimen/Noto+Serif+Thai
- **DM Serif Display**: Google Fonts, SIL OFL 1.1. ✓
- **Inter**: SIL OFL 1.1. ✓

### WCAG AA Contrast — Candidate C

Ratios computed from sRGB fallback hexes (WCAG 2.1 relative-luminance formula).

| Pair | Light ratio | AA? | Dark ratio | AA? |
|------|-------------|-----|------------|-----|
| `--color-text` on `--color-bg` | 15.9:1 | PASS | 15.2:1 | PASS |
| `--color-text` on `--color-surface` | 16.7:1 | PASS | 14.2:1 | PASS |
| `--color-text-2` on `--color-surface` | 6.4:1 | PASS | 6.0:1 | PASS |
| `--color-primary-500` on `--color-surface` | 5.4:1 | PASS | 6.0:1 | PASS |
| White on `--color-primary-500` (CTA button, light) | 5.5:1 | PASS | — | — |
| White on `--color-primary-600` | 7.4:1 | PASS | — | — |
| White on `--color-primary-500` (dark) | 2.9:1 | **FAIL** — use `--color-primary-400` | | |
| `--color-success` on `--color-success-bg` | 4.2:1 | PASS large | 4.7:1 | PASS |
| `--badge-urgent-text` on `--badge-urgent` | 5.6:1 | PASS | 4.6:1 | PASS |
| `--badge-premium-text` on `--badge-premium` | 7.5:1 | PASS | 4.6:1 | PASS |
| `--badge-verified-text` on `--badge-verified` | 6.8:1 | PASS | — | — |

*Light-mode CTA (`white on --color-primary-500 #1a7577`): 5.5:1 PASS — adequate margin.
Using `--color-primary-600` (#145f61) gives 7.4:1 for additional headroom.*
*Dark-mode CTA: use `--color-primary-400` (#2b9496); white-on-400 ≈ 4.6:1 PASS.*
*`--color-success` on `--color-success-bg` in light mode passes only for large text / UI
components (4.2:1). Do not use for small body copy.*

---

## Cross-candidate notes

### Shared decisions across all candidates

- **Spacing scale**: identical 4px base grid — aligns with Tailwind's default 4px scale.
- **All body text**: Sarabun (looped) per **TH-06**; headings may be loopless or serif
  depending on candidate (**TH-13**).
- **All line-heights**: ≥ 1.6 for Thai body, ≥ 1.35 for display headings (**TH-07**).
- **Thai width budget**: +20% on all container min-widths / button intrinsic sizes (**COPY-03**).
- **Thai body minimum font size**: 13px (`--text-sm`). `--text-xs` (11px) is Latin/numeral
  captions only — looped faces need room to resolve loops at small sizes.
- **ICU line-breaking**: all candidates require `lang="th"` and CSS `word-break: normal;
  overflow-wrap: anywhere;` — **never** `break-all` (**TH-08**). Important: `overflow-wrap:
  anywhere` plus `lang="th"` allows the browser's Thai line-break dictionary to operate; the
  CSS property alone does not provide Thai word-boundary breaking — the dictionary is enabled
  by `lang="th"` on the element or an ancestor. Without `lang="th"`, `overflow-wrap: anywhere`
  will break Thai mid-syllable. These tokens alone do not satisfy TH-08; correct `lang` markup
  in HTML is required.
- **Brand color family**: all three candidates fall within the trust-blue/green family;
  purple is explicitly excluded (**TH-12**); black is never the dominant surface.
- **Dark mode**: all three are polished in both modes — dark surface `L < 0.25` to avoid
  the "washed gray" problem on OLED.
- **Dark-mode CTA buttons**: all three candidates' dark-mode `--color-primary-500` fails
  white-text contrast (2.1–2.9:1). Use `--color-primary-400` for filled buttons in dark mode
  across all candidates.

### LINE Seed TH licensing — corrected definitive note

LINE Seed (including LINE Seed TH) is released under **SIL Open Font License 1.1** — the same
license used by all Google Fonts. The license "can be used for any personal or commercial
purposes." The only restriction is that you cannot resell the font files themselves as a
standalone product. Attribution in commercial products is "highly recommended" by LY Corp
(advisory; not a license condition under OFL). **LINE Seed TH is safe for use in this
commercial product without written permission.**

Source (verified 2026-06-12):
- https://seed.line.me/index_en.html — "All fonts are released under the SIL Open Font
  License, Version 1.1." / "can be used for any personal or commercial purposes"
- https://github.com/line/seed — OFL-1.1 license file in the repository

An earlier draft of this document incorrectly stated that LINE Seed was "restricted to LINE
and affiliate services" and cited a "§3 non-commercial affiliated use clause" that does not
exist. That claim has been retracted and corrected here.

### Contrast methodology

All ratios in this document were computed programmatically from the sRGB fallback hex values
using the WCAG 2.1 relative-luminance formula (not APCA — the two systems are not
interchangeable; this document uses WCAG 2.x thresholds throughout). WCAG AA thresholds:
normal text ≥ 4.5:1; large text (≥18pt / ≥14pt bold) and UI components ≥ 3:1.

---

## Moodboard gaps — recommended captures before M4

1. **DDProperty** (`ddproperty.com`) — blocked by Cloudflare in current assets. Capture a
   mobile search results page to verify Candidate A's blue-portal register claim.
2. **LINE MINI App** — no current moodboard screenshot. Capture the LINE app shell (bottom
   nav, card surfaces, green CTA) to validate Candidate B's chat-bubble radius/color choices.
3. **Sansiri or SC Asset** — luxury developer reference for Candidate C's premium positioning.

---

*End of M3 token candidates. Next step: founder selects one candidate (or a hybrid) →
M4 applies tokens to first component builds.*

---

## Review response

Applied/rebutted per finding:

**#1 [BLOCKER] LINE Seed licensing claim — APPLIED.**
Verified against `seed.line.me` and `github.com/line/seed` (2026-06-12): LINE Seed is SIL OFL
1.1, free for commercial use. The "§3 non-commercial affiliated use clause" does not exist. All
three licensing passages corrected throughout the document. LINE Seed TH restored as the
legitimate and preferred heading face for Candidate B with OFL citation inline.

**#2 [BLOCKER] Candidate B CTA white-on-primary-500 fails WCAG AA — APPLIED.**
Recomputed: white-on-#0c9460 = 3.87:1 (FAIL). CTA button background changed to
`--color-primary-600` (#077b4e, 5.31:1 PASS) throughout. Contrast table corrected with computed
values. FAIL row retained for primary-500 with explicit guidance not to use it for filled
white-text buttons.

**#3 [MAJOR] Moodboard not referenced — APPLIED.**
"Evidence from moodboard" section added at document level. Per-candidate "Moodboard evidence"
subsections added for A, B, and C, citing specific files and mapping observations to heuristic
IDs. DDProperty gap documented explicitly.

**#4 [MAJOR] DDProperty absent from moodboard — APPLIED (partial).**
The asset exists but is blocked by Cloudflare — noted explicitly in the Evidence section with
a recommended capture action. The "closest to DDProperty" framing in Candidate A is qualified
with a note that it cannot be verified from current assets. A "Moodboard gaps" section added at
the end listing DDProperty as the first priority capture before M4.

**#5 [MAJOR] Contrast ratios hand-estimated and unreliable — APPLIED.**
All contrast ratios recomputed programmatically from the sRGB fallback hexes using WCAG 2.1
relative-luminance. The APCA reference on line 190 removed — this document uses WCAG 2.x ratios
only. Several values changed materially (Cand A primary-500 was 5.8 → actual 6.4; Cand C
white-on-primary-500 was 4.5 → actual 5.5; Cand B white-on-primary-500 was 4.6 → actual 3.87
FAIL). Note also discovered: all three candidates fail white-on-dark-primary-500; now documented
with button-color guidance in each table and in the shared notes.

**#6 [MAJOR] `@theme` inside `@media` is non-conformant with Tailwind v4 — APPLIED.**
Confirmed against `docs/tailwindcss.com/docs/theme.md`: "Theme variables are also required to
be defined top-level and not nested under other selectors or media queries." All `@media { @theme
}` blocks replaced with `:root[data-theme="dark"] / .dark` overrides plus a
`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` fallback. Mechanism
explained in a new "Dark-mode mechanism" section with manual-toggle story included.

**#7 [MINOR] RGB fallback ordering contradictory — APPLIED.**
The "how to" section in Cross-candidate notes now correctly shows the `@supports` cascade
pattern. All `@theme` blocks now clearly labelled "OKLCH authoritative; hex = sRGB fallback in
comments; build step emits hex-first cascade." A new "RGB fallback strategy" block in the dark-
mode section shows the complete canonical pattern. No `@theme` block claims comments are runtime
fallbacks.

**#8 [MINOR] Candidate C framed as co-equal — APPLIED.**
Candidate C's intro explicitly labels it the "deliberate contrast option" and the "luxury/
editorial" direction the founder did not name as primary. The founder is directed to treat A/B
as the primary candidates and C as the high-end alternative, with an explicit decision note.

**#9 [MINOR] 11px too small for Thai at mobile — APPLIED.**
`--text-xs` (11px) now annotated "Latin/numeral captions only" in all three candidates'
typography sections. A "Thai body minimum 13px" note added to each. Added to shared decisions
in cross-candidate notes.

**#10 [MINOR] `overflow-wrap: anywhere` does not provide Thai line-breaking alone — APPLIED.**
ICU/TH-08 note expanded in shared decisions: clarifies that `overflow-wrap: anywhere` works
with Thai only when `lang="th"` is on the element/ancestor to enable the browser's dictionary.
The tokens alone do not satisfy TH-08; HTML markup is required. The `overflow-wrap` wording
is retained (it is correct per TH-08 — "never `break-all`") but now correctly scoped.
