# Skill-hardening log — `/frontend-review` + `/alignment-review`

Durable record of the plan-21 run's skill-hardening objective (see `plans/21-goal-prompt.md`
"Definition of Done — SKILL HARDENING"). Every `/frontend-review` and `/alignment-review`
invocation in this run is traced (`traces/`), independently+adversarially audited (`audits/`),
and any **confirmed** gap is fixed in the skill file(s), re-verified to bite, and logged here.

- **Skills under test:** `.claude/skills/frontend-review/{SKILL.md,checklist.md,design-review-prompt.md}`,
  `.claude/skills/alignment-review/{SKILL.md,context-map.md}`.
- **Register:** `docs/research/00-product-principles.md` §4. **Mock:** `docs/design/mockups/direction-a-baania-clean.html`.
- **Discipline:** a skill edit must close a real DEMONSTRATED gap (surfaced by an audit), be
  re-verified to bite (re-run the skill on the same increment, confirm it now catches what it
  missed), and be logged below. No speculative skill bloat.

## Conventions
- Trace files: `traces/<skill>-<pass>-<n>.md` (template in the goal prompt).
- Audit files: `audits/<skill>-<pass>-<n>.md` (independent adversarial agent verdict).
- Each log entry below: date · skill · pass · gap (audit ref) · fix (file+rationale) · re-verify proof.

---

## Gaps found → fixes → re-verification

### 2026-06-14 · frontend-review · pass=phase1-foundation · GAP F1 — mode-B confabulates ALIGNED from source (perceptual blindness)
- **Audit ref:** `audits/frontend-review-phase1-1.md` (verdict INSUFFICIENT).
- **Gap (demonstrated):** mode-B's design-review agent returned a flat **"ALIGNED — zero divergences,
  faithfully implements direction-a"** for a render that is the OLD plain styling (no sticky wordmark
  header, no deal-pill photo overlays, no section-header underline, no results bar) — and cited
  theme.css TOKEN VALUES (`#1f5fad`, `oklch(…)`) as "evidence." Re-running with a text-only "use pixels
  not source" hardening did NOT fix it — the agent still confabulated pills/chips that aren't in the
  render. Root cause: handing the agent the mock's HTML/CSS source lets it imagine the mock and project
  it onto the render; prose can't stop that.
- **Fix (`design-review-prompt.md` + `SKILL.md` Mode B + `checklist.md`):** made mode-B **image-vs-image
  and source-forbidden** — it compares the render gallery PNGs to a *rendered screenshot* of the mock
  (`docs/design/mockups/renders/direction-a-{light,dark}.png`, committed), may not open ANY css/html/
  theme file or cite any token/hex/oklch value, must **describe target + each render screen BLIND before
  diffing**, and must answer a **signature-element checklist** (sticky wordmark header? pill chips with
  filled active? section-header orange underline? ขาย/เช่า deal-pill OVERLAID on the photo? photo-count
  chip? tinted detail price box? bordered spec table? yield pill? bottom nav?) present/absent with a
  cited screen — so it can't hand-wave "it's blue, so aligned."
- **Re-verified to BITE:** re-ran mode-B on the SAME Phase-1 gallery with the hardened prompt → it now
  returns **OPEN-QUESTIONS with 7 correct, pixel-grounded divergences** (header/deal-pill/section-header/
  results-bar/price-box/spec-table/yield all correctly ABSENT; photo-count/price-label/filter-pills
  correctly PRESENT). The false "ALIGNED" is gone; the verdict matches the real pixels (and doubles as
  the Phase-2 work-list). Two prior re-runs (text-only hardening, then images-only without the checklist)
  are recorded as the evidence the structural fix — not the prose — is what bit.
- **Residual risk:** the sub-agent still OCR-garbles some Thai glyphs and can mis-credit fine treatment;
  the signature checklist + images-only constrain the high-impact errors, and design-alignment remains a
  founder-ruled judgment (never an auto-ship), with this run's adversarial audit as the backstop.

### 2026-06-14 · frontend-review · pass=phase1-foundation · GAP F2 — no parity gate for "no visual change" increments
- **Audit ref:** `audits/frontend-review-phase1-1.md` (criterion A: wrong lens for a foundation increment).
- **Gap (demonstrated):** Phase 1's contract is "no visual change," but the skill only offered mode-A
  (a few-token invariant check — BLIND to a real visual regression: a tree-shaken `--badge-*-text` token
  rendered badges with the wrong colour while all 64 invariants stayed green; the runner caught it only
  with an out-of-band pixel-diff, AE up to 38403) and mode-B-vs-direction (wrong lens — a foundation
  increment is *supposed* to still look like the old site). The skill could not assert "unchanged vs the
  prior render," which is exactly the foundation contract.
- **Fix (`SKILL.md` Mode A.5 + `checklist.md` + `packages/website/scripts/gallery-diff.mjs`):** added a
  **parity mode** — capture the gallery before↔after the change and pixel-diff per screen via the new
  `gallery-diff.mjs` helper (ImageMagick AE, dimension-change = divergence). Any diverged screen is a
  finding (surface to founder or fix); for foundation increments use this, NOT mode-B-vs-direction.
- **Re-verified to BITE:** `gallery-diff.mjs /tmp/baseline-gallery <after>` → **PARITY ✓, total AE 0**
  across 36 screens (correct verdict for Phase 1, which the old skill couldn't express). Regression bite:
  injecting a same-dimension change into one screen → **PARITY ✗, DIVERGED that screen (AE 16281), exit 1**;
  and the historical badge regression showed AE 38403 → 0 after the fix. The gate distinguishes a real
  regression from true parity deterministically.
- **Residual risk:** needs a "before" gallery (a git-stash/checkout build); a fuzz=2% budget can miss a
  ≤1px-per-screen change (irrelevant for the regressions this targets).

### 2026-06-14 · alignment-review · pass=phase1-foundation · NO SKILL EDIT (run was SUFFICIENT)
- **Audit ref:** `audits/alignment-review-phase1-1.md` (verdict SUFFICIENT with caveats).
- The run picked the right context groups, evaluated every ID with no silent skips, used rendered
  evidence for the styling IDs, and surfaced the TECH-06 fallback question to the FOUNDER rather than
  self-adjudicating — adequate backpressure. The audit's caveats were agent-level (one cited stale
  fallbacks.css line numbers; the TECH-06 "system fonts" phrasing conflates fonts with colours) or
  already-resolved (it worried the generated fallbacks.css wasn't regenerated — it was). Per the
  anti-bloat guardrail (edit only a DEMONSTRATED skill-file gap, re-verified to bite), **no skill edit**.
  Considered-but-not-applied recommendations (logged for the next run if they recur): an evidence-
  freshness note ("regenerate a generated artifact before citing it"), and clarifying when "Search &
  discovery" applies to styling-only public-page changes. The TECH-06 finding itself → FOUNDER-QUEUE #1.

### 2026-06-14 · p2-pass1-cards · GAP F3 — measurable styling (TH-07 line-height) needs a DETERMINISTIC net
- **Audit ref:** `audits/alignment-review-pass1-1.md` (the alignment audit caught it; the frontend
  audit confabulated — see meta-finding below).
- **Gap (demonstrated):** restyling the cards to Tailwind utilities lost the inherited `--leading-body`
  (1.65) because `text-*` utilities pin a tight default line-height (`text-xs`=1.33, `text-sm`=1.43) —
  so Thai body text (location/spec/postedBy) rendered below the TH-07 ≥1.6 floor. NEITHER design-skill
  caught it: alignment-review passed TH-06/07 from the DECLARED `--leading-body` (source-inference);
  frontend-review's mode-B agent can't read 1.33-vs-1.65 off a screenshot.
- **Fix:** the card bug fixed (Thai body → `text-sm` ≥13px + `leading-relaxed`; heading → `leading-normal`).
  Durable net: **`assertThaiBodyLineHeight` computed-style invariant** in `e2e/support.ts` + `theme.spec.ts`
  (Thai consonant/vowel-bearing card body text must render line-height ≥1.6; excludes headings, pill
  badges, overlay chips, and the ฿-prefixed Latin price — the ฿ sign sits in the Thai Unicode block, an
  edge the first cut tripped on).
- **Re-verified to BITE:** reverting one card line to tight `text-xs` → the invariant flags
  `"สุเทพ · เมืองเชียงใหม่"` at ratio 1.33 (exit fail); fixed cards pass; full suite 72/72.
- **Residual:** scoped to listing-card body text (the redesigned surface) — broaden to chrome/detail as
  those passes land.

### 2026-06-14 · p2-pass1-cards · alignment-review A1 — forbid source-citation for styling IDs (reinforcement)
- The run cited token values (`--badge-npa: oklch(…)`) as evidence for styling IDs despite the existing
  "don't infer from source" rule. **Hardened SKILL §3:** a styling-ID verdict's evidence may NOT contain
  a token/oklch/hex/source line (invalid if it does; citing source *alongside* a screenshot still
  counts); measurable styling must use `/frontend-review`'s computed-style assertions, not eyeballing.
  Bite is verified on the remaining passes (next run must cite the invariant, not the token); F3 makes
  the catch agent-independent regardless. Logged as reinforcement, not the load-bearing fix (F3 is).

### 2026-06-14 · META-FINDING — the adversarial AUDIT agent is ALSO perceptually unreliable
- The pass-1 **frontend-review audit confabulated**: it claimed the ขาย/เช่า deal-pills were "missing /
  in the card chrome" when they ARE overlaid on the photos (runner verified the pixels). So the
  goal's "independent adversarial audit" backstop is itself unreliable for fine-grained VISUAL claims —
  it can false-negative on alignment just as the skill false-positives.
- **Mitigations (in force):** (1) measurable styling → DETERMINISTIC computed-style invariants (F3, the
  TECH-06 net) that neither agent can mis-see; (2) the orchestrator verifies an audit's visual claims
  against the actual pixels before acting (done — the confabulated "pills missing" was refuted, the real
  TH-07 finding sustained); (3) subjective "does it look like the mock" stays a founder-ruled judgment,
  never an auto-ship and never an auto-reject on an unverified audit claim. Audits remain valuable for
  COVERAGE/EVIDENCE/BACKPRESSURE reasoning (the alignment audit found a real bug) — just not as a
  ground-truth oracle for pixels.

### 2026-06-14 · p2-pass2-chrome · alignment-review A2 — STRUCTURAL fix for the source-citation slip
- **Audit ref:** `audits/alignment-review-pass2-1.md`. The run cited `--color-primary-600: oklch(…)` as
  TECH-06 evidence — the **3rd recurrence**; A1's prose ("don't cite source") demonstrably did NOT bite.
- **Fix (`alignment-review/SKILL.md` §3):** measurable styling IDs' `evidence` MUST be the **NAME of a
  deterministic computed-style assertion** in `/frontend-review`'s e2e suite (e.g.
  `assertThaiBodyLineHeight`), never the value/token/screenshot; if no assertion covers it → mark
  **UNVERIFIED** and require it be added. Structural, because citing an assertion NAME leaves no value to
  copy — the slip becomes impossible (where A1's prose ask was ignorable).
- **Bite:** verified on the remaining passes (the next alignment-review run on a measurable-styling
  surface must cite an assertion name or UNVERIFIED). The deterministic invariants (TH-07, TECH-06
  token-resolution) already make the underlying CATCH agent-independent, so a residual slip can't produce
  a false pass.
- **META reinforcement:** the pass-2 audits re-confirmed the unreliability finding — the frontend-review
  audit over-flagged (claimed the section-header underline was absent on mobile; it's present), and the
  alignment audit's speculative "missed issues" (header nav/hamburger/toggle → TH-07/TECH-01/TH-11) were
  fictions (our header is one static `<a>`). Audit agents reason well about PROCESS (the A2 recommendation
  was excellent) but are unreliable about specific PIXELS/FACTS — so the orchestrator verifies every audit
  claim against ground truth before acting, and measurable properties live in deterministic invariants.

### 2026-06-14 · p2-pass3-chips · GAP F4 — deterministic WCAG-contrast invariant for filled CTAs
- **Audit ref:** `audits/pass3-chips-1.md`. The pass-3 audit (the one audit in this run that found a
  REAL bug, by COMPUTING contrast rather than perceiving pixels) caught: `text-white` on `bg-primary-500`
  fails AA in DARK mode (primary-500 flips to light blue `#5b9de0` → white-on-light-blue ≈ 2.9:1). A real
  regression the runner introduced (switched the old flipping `--color-surface` text to non-flipping
  `text-white` in passes 1–3).
- **Fix:** filled-primary CTAs (primary button + active chip) → `text-surface` (flips with the bg; AA in
  both modes: light 6.37, dark 5.84). hover dims via opacity.
- **F4: `assertCtaContrast` deterministic invariant** (`e2e/support.ts` + `theme.spec.ts`) — resolves the
  computed text/bg colours of `[data-cta-solid]` via a 1×1 canvas to sRGB and asserts WCAG ≥4.5 in every
  project (dark covered). **Re-verified to BITE:** `text-white` → desktop-dark fails at 2.63; `text-surface`
  → 4/4 pass; full suite 76/76. The a11y net the audit recommended, made agent-independent (an LLM can't
  read contrast off a PNG, and the alignment agent reached for hex when no assertion existed — A2's
  "UNVERIFIED if no assertion" only partially bit there).
- **A2 follow-through:** A2 DID partially bite on this pass (alignment-review marked COPY-02 UNVERIFIED +
  cited assertion names for TH-06/07) — but slipped on contrast (computed from hex). F4 closes that hole
  deterministically; the residual prose-slip is now low-stakes (the deterministic net catches the bug
  regardless of the agent's discipline). Register has no explicit WCAG heuristic → FOUNDER-QUEUE #6.

### 2026-06-14 · p2-pass4-detail · F3b — broaden the TH-07 invariant to the detail page (scope gap)
- **Audit ref:** `audits/pass4-detail-1.md`. The pass-4 audit (reading the CODE, not pixels) found
  `assertThaiBodyLineHeight` was scoped to `[data-listing-card]` — so the restyled detail page's Thai
  body text was UNVERIFIED (compliant by construction via `leading-relaxed`, but unguarded).
- **Fix:** marked the detail `<main data-th-content>`; broadened the selector to `[data-listing-card] *,
  [data-th-content] *`; exempted CTA buttons/links/summaries (`button, summary, a[data-cta]` — short
  labels, not body text; NOT bare `a`, since the card is an `<a>` around body text). Re-verified: passes
  on detail across 4 projects; the <1.6 flag mechanism is already proven (F3). Suite 76/76.
- **Note:** alignment-review fully exhibited the **A2** behaviour this pass (cited the assertion NAMES —
  assertThaiBodyLineHeight / assertThemeApplies / assertCtaContrast — for the measurable styling IDs,
  not token values). The hardening has converged: the design skills now lean on the deterministic
  invariants for measurable styling, and those invariants now cover cards + chrome/detail.

### 2026-06-14 · p2-pass5-empty/404 · F3c — exercise the TH-07 markers (inert-marker gap) + a bug it hid
- **Audit ref:** `audits/pass5-empty-404-1.md`. The pass-5 audit (reading the TEST INFRA) found the
  `data-th-content` markers on the 404 + empty state were INERT — the TH-07 test only visited `"/"`, so
  no test ever rendered those pages. The "TH-07 covers the 404" claim was syntactically true, practically
  false.
- **Bug it revealed:** the `EmptyState`/`ErrorState` why+next lines used `text-base`/`text-sm` WITHOUT
  `leading-relaxed` (line-height pinned to 1.5/1.43) — a TH-07 violation introduced in pass 1, invisible
  because no TH-07 test rendered the empty state.
- **Fix:** `States.tsx` → `leading-relaxed` on the empty/error Thai body lines + `data-th-content` on the
  state roots; `theme.spec.ts` → TH-07 tests that VISIT the empty state + a 404 path. **Re-verified to
  BITE:** reverting the empty `why` line → the empty-state TH-07 test fails at 1.5; fixed → all pass;
  suite 84/84.
- **Three-in-a-row pattern (the durable conclusion):** every audit that found a REAL defect this run did
  so by COMPUTING (contrast F4) or reading CODE/TEST-INFRA (scope F3b, inert markers F3c) — NOT by
  perceiving pixels; every audit PIXEL claim was an over-flag the runner refuted. So the reliable design-
  defense is: deterministic invariants (theme/TH-07/contrast) + audits reasoning over code + the
  orchestrator verifying any visual claim against the actual pixels. LLM pixel perception (skill OR
  audit) is the unreliable link and is never the sole gate.

---

## SUMMARY (run end — durable hand-off for the next run)

Across plan-21 (Phase 1 + 5 Phase-2 passes), EVERY `/frontend-review` and `/alignment-review` invocation
was traced (`traces/`) and independently+adversarially audited (`audits/`); every CONFIRMED gap was fixed
in the skill files / e2e net and re-verified to BITE. The arc, per skill:

### `/frontend-review` — gaps → fixes (all re-verified to bite)
- **F1 — mode-B CONFABULATED alignment.** It returned "ALIGNED with direction-a" for the OLD plain
  styling, citing theme.css token VALUES as evidence. Prose ("use pixels not source") did NOT stop it.
  FIX: made mode-B **image-vs-image and source-FORBIDDEN** — compare the render gallery to a committed
  *rendered screenshot* of the mock (`docs/design/mockups/renders/`), no css/html/token access, with a
  blind-describe-first step + a **signature-element checklist**. Re-run flipped the false ALIGNED into 7
  correct pixel-grounded divergences.
- **F2 — no parity mode** for "no visual change" increments. Mode A only checks a few tokens (it stayed
  green through a real badge regression). FIX: **Mode A.5 + `scripts/gallery-diff.mjs`** (before↔after
  pixel-diff). Bites: AE 0 = parity, flags an injected regression.
- **F3 / F3b / F3c — the TH-07 line-height net** (`assertThaiBodyLineHeight`). Restyling to Tailwind
  utilities pinned tight default line-heights (1.33–1.43) over the inherited 1.65 on Thai body text —
  invisible to source review and to an LLM reading a PNG. FIX: a **deterministic computed-style
  invariant** (≥1.6), broadened over the run to cover cards (F3), the detail page (F3b), and the
  empty/404 states (F3c — which also exposed a latent EmptyState leading bug from pass 1). Each
  re-verified to bite.
- **F4 — WCAG-AA contrast net** (`assertCtaContrast`). Filled CTAs used `text-white` on a primary bg
  that flips LIGHTER in dark mode → white-on-light-blue ≈ 2.9:1 (fails AA). FIX: `text-surface` (flips
  with the bg) + a **deterministic canvas-resolved contrast invariant** (≥4.5:1, every project). Bites
  at 2.63 on the broken version.

### `/alignment-review` — gaps → fixes
- **A1 → A2 — the source-citation slip.** The agent repeatedly cited token/oklch values as evidence for
  styling IDs despite the rule. A1 (stronger prose) did not bite. **A2 (structural):** a styling-ID's
  evidence MUST be the NAME of a deterministic computed-style assertion (or marked UNVERIFIED if none) —
  there is no value to copy. By passes 3–5 the skill exhibited it (marked COPY-02 UNVERIFIED; cited
  `assertThaiBodyLineHeight`/`assertCtaContrast`/`assertThemeApplies`).
- Otherwise SUFFICIENT throughout (right context groups, every ID, founder-routed the TECH-06 + contrast
  questions rather than self-adjudicating).

### THE durable finding (META)
**LLM pixel perception is unreliable — for BOTH the design skill AND the adversarial audit.** Skill
mode-B agents confabulated PRESENCE (false ALIGNED); audit agents confabulated ABSENCE (claimed present
deal-pills/underlines were missing). Yet every audit that found a REAL defect did so by COMPUTING
(contrast) or reading CODE/TEST-INFRA (TH-07 scope, inert markers) — never by perceiving pixels. So the
reliable design defense is the THREE-layer stack: (1) **deterministic computed-style invariants** for
every measurable property (theme/TH-07/contrast — these neither agent can mis-see); (2) **audits that
reason over code/tests**, with the orchestrator verifying any visual claim against the actual pixels
before acting; (3) **subjective "does it look like the mock" stays a founder-ruled judgment** — never an
auto-ship, never an auto-reject on an unverified audit claim.

### Residual risks / recommended future improvements
- **Mock-render staleness:** mode-B compares to committed PNGs of the mock; regenerate them when the mock
  changes (recipe in SKILL Mode B) or the comparison drifts.
- **Invariant coverage is allow-list:** TH-07/contrast cover cards + chrome/detail/state regions
  (`[data-listing-card]`, `[data-th-content]`, `[data-cta-solid]`). New surfaces must add the marker —
  an un-marked new surface is silently un-checked. Consider a lint that flags Thai-body `text-*` without
  an explicit `leading-*` in `packages/ui`/website components.
- **Contrast invariant** checks only `[data-cta-solid]` filled CTAs + the 4.5 text threshold; it does not
  audit body-text-on-surface contrast generally. The register still has **no explicit WCAG heuristic**
  (FOUNDER-QUEUE #6) — a founder call whether to add one.
- **A2 residual:** the agent still occasionally computes a measurable value from hex when no assertion
  exists (e.g. chip contrast). The deterministic nets make this low-stakes, but adding an assertion for
  any NEW measurable rule keeps it honest (now codified in canon TECH-14).
- The skills are now coupled to the plan-20 e2e harness (the invariants live there); keep them in sync.

_Founder decisions surfaced during the run: `FOUNDER-QUEUE.md` (#1 oklch fallback scope, #2 Thai 13px vs
mock 11px, #3 LINE-green CTA, #4 brand wordmark, #5 header search placement, #6 WCAG heuristic, + the
LINE white-on-green brand exception)._
