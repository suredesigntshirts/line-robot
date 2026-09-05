# Audit: alignment-review · pass=p2-pass2-chrome · 2026-06-14

Auditor verdict: **INSUFFICIENT** — one real finding + a strong structural recommendation, plus
speculation the runner refuted.

## Real finding (SUSTAINED): the source-citation slip recurred
The run cited `--color-primary-600: oklch(0.46 0.15 240)` as TECH-06 evidence — violating the HARD
rule. This is the **3rd recurrence**; the A1 prose hardening did not bite. Confirmed.

## Speculative "missed issues" (REFUTED by the runner)
The auditor guessed the chrome has nav labels / a hamburger / a locale switcher / a dark-mode toggle
→ TH-07 on header text, TECH-01 island JS, TH-11 density regressions. **None exist:** our header is a
single STATIC `<a>` brand link (house-icon + site title), zero JS, ~46px tall. So TECH-01 holds, the
only header Thai text is the heading wordmark (TH-13-exempt), and density is fine. The speculations are
wrong — but harmless (they don't change the ALIGNED verdict, which the deterministic invariants + the
runner's own pixel check confirm).

## Structural recommendation (ADOPTED as A2)
"Route ALL measurable styling IDs to NAMED e2e computed-style assertions; the agent cites the assertion
NAME, not the value; if no assertion exists → mark UNVERIFIED + require it." This makes the source-
citation slip mechanically impossible (there is no value to copy) — the structural fix prose couldn't
achieve. Applied to `alignment-review/SKILL.md` §3.

## Verdict: SUFFICIENT-grade on substance (the ALIGNED verdict is correct), but the evidence-pathway
violation is real and now structurally closed by A2. The audit's value was the recommendation, not its
(wrong) speculative findings — consistent with the META-finding that audit agents reason well about
PROCESS but are unreliable about specific PIXELS/facts.
