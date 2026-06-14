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

---

## SUMMARY (written at run end)

_Per skill: gaps found, changes made, residual risks, recommended future improvements._
