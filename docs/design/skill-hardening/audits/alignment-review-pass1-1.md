# Audit: alignment-review · pass=p2-pass1-cards · 2026-06-14

Independent adversarial auditor of the run that returned **ALIGNED — 0 violations**.

## Auditor verdict: INSUFFICIENT — found a REAL missed violation + a process slip
1. **TH-07 violation (missed):** small Thai body text in the cards (location/spec/postedBy) uses
   `text-xs`, which pins Tailwind's default line-height (~1.33) over the inherited `--leading-body`
   (1.65). The skill-run passed TH-06/07 by citing the DECLARED `--leading-body: 1.65` rather than
   measuring the rendered small text per size. CONFIRMED by the runner: built CSS shows
   `.text-xs{line-height:var(--text-xs--line-height)}` = 1.33; `.text-sm` = 1.43 — both < 1.6.
2. **Process slip (confirmed):** the run cited SOURCE token values (`--badge-npa: oklch(…)`,
   `--font-body-th: Sarabun`) as evidence for styling IDs — exactly what the skill says not to do.
3. Group selection (Listing card & detail UI + Typography) correct; deal-pill-vs-badge judged
   intentional — sound.

## Runner disposition: SUSTAINED. Fixes applied + re-verified.
- **The card bug is real → FIXED.** Thai body lines bumped to `text-sm` (≥13px, the theme's Thai
  minimum) + `leading-relaxed` (1.625 ≥ 1.6); headline (heading) → `leading-normal` (1.5).
- **F3 (frontend-review): deterministic TH-07 invariant.** Added `assertThaiBodyLineHeight` to the
  e2e suite (computed line-height ≥1.6 on listing-card Thai body text; exempts headings, pill badges,
  overlay chips, and the ฿-prefixed Latin-numeral price). **Re-verified to BITE**: flags the tight
  `text-xs` line at ratio 1.33, passes the fixed cards. This is the load-bearing fix — a deterministic
  net that does NOT depend on an agent reading line-height off a PNG (which neither the skill nor the
  audit agent can do reliably — see the frontend-review-pass1 audit's META-FINDING).
- **A1 (alignment-review): hardened SKILL §3** — a styling-ID verdict's evidence may NOT contain a
  token/oklch/hex/source line (invalid if it does; citing source ALONGSIDE a screenshot still counts);
  and measurable styling (line-height/size/contrast) must use `/frontend-review`'s computed-style
  assertions, not eyeballing. Its bite is verified continuously on the remaining passes (the next
  alignment-review run must cite the invariant, not the token); F3 makes the catch agent-independent
  regardless.

## Verdict: this audit was SUFFICIENT and correct (unlike its frontend-review sibling). Acted on in full.
Founder-queue: mock card location/specs are 11px; we render Thai body at 13px to honor TH-06/07 →
`FOUNDER-QUEUE.md` #2 (density vs Thai readability).
