# Design mockups — VISUAL STYLE reference (not a content/field spec)

**Status (founder, updated 2026-06-14).** These HTML files are the **look-and-feel reference**
for the build: typography, colour, spacing, radius, and how each element is *styled*. The shipped
site **should look like these mockups.** They are NOT a content, field, or data spec — and not
markup to copy verbatim.

## Two axes — keep them separate

**Style / look-and-feel → MATCH the mockups.**
The chosen-direction mockup (`direction-a-baania-clean.html`) is the **visual acceptance
reference**. The rendered *production* site is checked against it for *style*: Thai typography
(looped Sarabun body / loopless Noto headings), the trust-blue palette, the spacing scale, and the
card / badge / CTA / price-block treatment — the overall "Baania-clean" register. If the live site
doesn't read like this mockup, that's a defect. (This is exactly the gap that let an unstyled site
ship through a whole build — see the `quality-loop-perceptually-blind` post-mortem.)

**Content / fields / structure → DRIVEN BY THE CODE, not the mockup.**
Build *what* is shown — which fields, which data, which sections, which filters — from the **actual
schema and the current feature set**, not from the mockup. The mock content was illustrative and
not carefully thought through: it may show fields that don't exist in our schema, or omit fields we
now need. Do NOT lift the mock's fields, copy, or markup. Decide each element from the real
requirement and implement it fresh against the live code. **When the mock and the code disagree
about content, the code wins.**

> In one line: **steal the styling, ignore the data.**

## What IS confirmed (binding)

- **Theme A — "Baania-clean"** (trust-blue Thai-portal) is the confirmed token system
  (`packages/ui/theme.css`, founder-confirmed). The palette / typography / radius are the real
  visual direction.
- `direction-a-baania-clean.html` is the **visual-style acceptance reference** the rendered site is
  diffed against at every design-bearing increment and user-facing stage gate (via
  `/frontend-review`).

## Chosen interaction directions (pick the visual treatment; build the behaviour from real requirements)

| Area | Direction picked | Style-reference mock |
|---|---|---|
| Price filter | Contextual — a Buy/Rent toggle relabels one price range (sale ฿ ↔ rent ฿/mo) | `explore-price-1-contextual.html` |
| NPA / new-vs-resale | Calm category treatment + detail-page provenance disclosure (NOT a red alert) | `explore-schema-3-disclosure.html` |
| Stage 5 mini-app | claim/publish flow + My-Listings dashboard + viewings/follow-ups | `explore-stage5-1-claim.html`, `-2-mylistings.html`, `-3-viewings.html` |

These pick the *visual treatment*; the fields, copy, and data come from the live schema, not the
mock. The three `direction-{a,b,c}.html` files are the A/B/C theme comparison that led to picking A.

## Founder constraints that still hold

1. **Style is the reference; content/fields come from the code.** Don't port mock fields or
   invented data; build from the real schema and feature set.
2. **Price ranges reflect ACTUAL North-Thailand prices** (`docs/research/a2-market-landscape-north.md`),
   not the demo's invented brackets.
3. **NPA is a calm *category highlight*, not a danger alert.** Keep the required DIST-02 disclosure
   caveats; de-escalate the visual alarm (a restrained accent / label, not aggressive red).

## Process

Design-bearing work runs `/alignment-review` (semantic heuristics against the register) AND
`/frontend-review` (renders the real production artifact, asserts computed styles, runs the e2e /
visual suite, and diffs the rendered screen against the style reference above). The mockups are the
*style* bar inside that gate — never a bypass of it.
