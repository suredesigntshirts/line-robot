# Design Direction — Candidate Pick

**Status: DECIDED — Direction A "Baania-clean" (trust-blue), founder-confirmed 2026-06-13** (after reviewing side-by-side A/B/C HTML mockups; locked in `packages/ui/theme.css`, commit `4b25dc9`). The live palette's source of truth is `packages/ui/theme.css`, **not** this file. This memo is kept as the record of the pre-decision candidate analysis — note the recommendation below was for **B**, but the founder chose **A**. Synthesized 2026-06-12 from the mood-board collection (`moodboard/thai/NOTES.md`, `moodboard/international/NOTES.md`, `tokens-candidates.md` — each collect→critique→revise audited).

## Founder taste brief (verbatim intent)
Admires Baania, DDProperty, LINE (Naver): "nice clean aesthetic, feels modern, clean UX, approachable." Dark mode polished at launch.

## Evidence highlights that shape all three candidates
- **Green convergence**: Baania (#00B14F) and LINE (#06C755) are ~4 hue steps apart — a LINE-adjacent green reads native inside the LINE chrome *and* familiar on Thai listing cards.
- **Dual sticky bottom CTA bar** (two solid green buttons, 50/50, ~52px) is the converged Thai detail-page pattern — ours becomes "ผู้ประกาศ/Contact" + an explicitly LINE-branded chat CTA (CONV-06). *(Critique corrected the earlier "outlined+solid" claim — Baania uses two solid buttons.)*
- **Typography**: every Thai site audited uses loopless headings / looped body. ⚠️ **LINE Seed TH is licensed for LINE services only — we cannot bundle it.** Headings: **Noto Sans Thai (loopless cut, OFL)**. Body: **Sarabun (looped, OFL)** at line-height 1.65 — Baania/AP Thai sit at ~1.5, so we ship the most readable Thai listing text in the market (TH-06/07).
- **Dark mode**: zero of six international benchmarks have it. Recipe: zinc-900 card surfaces, off-white price text, photos as the brightest anchor. Differentiator, not parity.
- **Card patterns**: AP Thai's horizontal card for new-project entries; vertical photo-first cards for resale. Rightmove thumbnail-strip + count = the CONV-03 reference; Airbnb's horizontal filter chips = the mobile filter pattern (with +20% Thai width budget, COPY-03).
- Blocked captures (honesty): DDProperty, Zillow, Idealista, KBank — bot-walls; covered by secondary evidence, noted in the NOTES files.

## The three candidates (full token sets in `tokens-candidates.md`)

### A — "Baania-clean" (trust-blue) ← ✅ CHOSEN (founder, 2026-06-13)
Trust-blue primary, warm neutral grays, generous radius. **For**: maximally "professional portal," differentiates from LINE's own green chrome. **Against**: the founder's three admired references are all green-family; blue reads more corporate than "approachable"; inside the LINE mini-app it looks most like a foreign embed.

### B — "LINE-native" (fresh green) ← *was recommended below — NOT chosen (founder picked A)*
LINE-adjacent (not identical) green primary, rounded-friendly, chat-app warmth. **For**: directly expresses the taste brief; the green convergence means one palette feels native in the mini-app *and* normal on a Thai property card; trust-green satisfies TH-12. **Against**: least distinctive vs LINE itself — mitigated by our own hue (ownable, not #06C755), photography-led cards, and the premium type discipline.

### C — "Northern-premium" (muted teal + warm paper)
Editorial, Sansiri-pole made approachable. **For**: most distinctive brand, fits "North-flavored" identity. **Against**: furthest from the stated taste brief; teal primary needed a darker shade to pass AA on light buttons (handled in the token set); risks "Bangkok-luxury" signal at odds with ขายด่วน practicality.

**Original recommendation was B** (borrowing A's neutral surface scale for data-dense screens) — **superseded: the founder chose A** (trust-blue) on 2026-06-13 after reviewing the rendered mockups. All three sets pass WCAG AA in both themes (verified in tokens-candidates.md, with the one borderline — C's light-mode primary — already resolved).

## Outcome
Founder picked **A** on 2026-06-13; the Direction-A `@theme` block from `tokens-candidates.md` is now live in `packages/ui/theme.css`. The Tailwind v4 + shadcn foundation and the direction-a redesign across all pages are being implemented under **plan 21** (`plans/21-frontend-architecture-conformance.md`).
