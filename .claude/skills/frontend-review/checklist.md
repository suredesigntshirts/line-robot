# Frontend-review checklist — what the gate asserts + what the review judges

Two halves: **invariants** (deterministic, pass/fail, survive theme churn) and **design review**
(judgment vs the direction). Everything runs against the **real built/deployed site** in a real
browser, and is **data-driven** — it discovers listings from the rendered page, so it adapts to
seeded test data (local) or live data (deployed) with no hardcoding. NO pixel-regression (deferred to
design lock-in). These map to `packages/website/e2e/`.

## Invariants — the hard gate (pass/fail)

### A. The theme actually applies (the TECH-06 net)
On the home page AND a discovered detail page, via `getComputedStyle`:
- `body` `font-family` resolves to the brand stack (contains `Sarabun`) — NOT empty/serif. (Empty ⇒
  tokens didn't reach the browser; the stack ends in `sans-serif`, so "contains Sarabun" is the right
  signal, not "isn't serif".)
- `--color-primary-600`, `--color-bg`, `--spacing-4` all resolve non-empty.
- Dark mode: emulating `colorScheme: dark` changes `--color-bg` (the prefers-color-scheme block applies).
- Brand fonts are DELIVERED: both `Sarabun` and `Noto Sans Thai` appear in `document.fonts` (the
  FontFaceSet holds only @font-face faces, not system fonts — env-independent proof they're shipped).

### B. The site works (data-driven + behaviour)
- **No broken images** anywhere (`img.complete && naturalWidth>0`) — catches the presign / IAM / CDN
  image path that only breaks against real infra (locally the fake-S3 serves them).
- **No console errors / pageerrors / failed requests / 5xx** over each page + journey.
- Every published listing's **detail page** renders (h1, theme applies, images load) — looped over
  whatever's discovered.
- **Empty result set** renders a healthy empty state, not a 500.
- **Click-through journeys** (grow these over time): browse → open a card → detail → back; the 4.3
  contextual price filter relabels Buy↔Rent (island hydration); `/en/` renders the English document.

## Design review — judgment vs the DIRECTION (no pass/fail on pixels)

A sub-agent opens the captured gallery (`test-results/gallery/{project}-{screen}.png`) and judges
alignment with `docs/design/mockups/direction-a-baania-clean.html` + the taste brief
(`docs/design/design-direction.md`) + the applicable heuristic IDs — STYLE ONLY:
- type hierarchy & feel (looped Sarabun body / loopless Noto headings, sizes, Thai line-height),
- palette (trust-blue primary, neutral surfaces, calm badge colours),
- spacing rhythm & density; card / badge / CTA / price-block treatment; radius/border/shadow;
- dark-mode polish.

Do **NOT** compare fields, copy, sections, or data — those come from the live schema (content =
code-driven). A field the mock shows that the code doesn't (or vice-versa) is **not** a finding here.

## Ad-hoc probes
Caller-provided page/click runs go in `e2e/adhoc/*.spec.ts` (scratch) using the `support.ts` helpers;
the skill runs them against the chosen target and returns results. This is how one-off "does X work
in the browser?" questions get answered without bloating the committed suite.
