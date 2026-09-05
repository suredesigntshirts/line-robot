# Audit: frontend-review · pass=p2-pass1-cards · 2026-06-14

Independent adversarial auditor of the mode-B run that returned **ALIGNED on the cards**.

## Auditor verdict (as returned): INSUFFICIENT
Its core claim: the ขาย/เช่า deal-pills are "NOT overlaid on the photos — they're in the card chrome",
the price-label hierarchy is "wrong/missing", and the chrome is unstyled (skill glossed it as "later
pass"). Recommended a 3-state matrix (missing / present-but-misplaced / correct) and pixel-location
grounding.

## Runner disposition: AUDIT LARGELY REFUTED (the auditor itself confabulated)
- **"Deal-pills missing/in chrome" → FALSE.** The runner directly inspected `mobile-light-home.png`:
  the ขาย/ให้เช่า pills ARE overlaid top-left ON the photos. The auditor failed to see them and
  concluded absence — the **same perceptual unreliability as the skill, in the opposite direction
  (false-negative on alignment).**
- **"Price label missing" → FALSE.** `PriceDisplay` renders the "ราคาเสนอขาย/ค่าเช่า" label above the
  bold price (visible in the render).
- **"Chrome unstyled, skill glossed it" → TRUE but out-of-scope.** Chrome is pass 2/3; the skill
  correctly deferred it. The auditor treated a correct deferral as a failure.

## META-FINDING (durable): the adversarial AUDIT agent is ALSO perceptually unreliable.
The goal leans on "independent adversarial audit" as the backstop — but for fine-grained VISUAL claims
the audit agent confabulates just like the skill agent (here: claiming present elements are absent).
**Mitigation, applied:** measurable styling properties move to DETERMINISTIC computed-style invariants
(see HARDENING-LOG F3 — the TH-07 line-height net), which neither agent can mis-see; and the
orchestrator verifies an audit's visual claims against the actual pixels before acting (done here).
Subjective "does it look like the mock" stays an agent judgment that the FOUNDER rules — never an
auto-ship, and never auto-rejected on an unverified audit claim.

## Verdict: run was SOUND on the cards (this pass's scope); audit's "INSUFFICIENT" not actionable.
- The one durable improvement taken: SKILL Mode A.5 / design-review already says don't grade un-styled
  chrome on a foundation increment; for a partial redesign pass, deferred surfaces are noted as
  "not-yet-styled (later pass)", not "present". No further skill edit from this (confabulated) audit.
