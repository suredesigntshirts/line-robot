# Founder decision queue — plan-21 design run

Genuinely-ambiguous TASTE calls the known rulings don't settle, surfaced during the autonomous
run. For each: the most mock-faithful default was chosen and the build PROCEEDED (never blocked);
the founder reviews these later. Known rulings already applied (NOT queued): NPA = calm violet
(not red); "steal the styling, ignore the data"; responsive (not app-only); `direction-a` is the
target; content is schema-driven; adapter is Pulumi.

| # | Surface | Question | Default taken (mock-faithful) | Status |
|---|---------|----------|-------------------------------|--------|
| 1 | TECH-06 oklch fallback (Phase 1) | The oklch fallback was slimmed to a `@supports not (color: oklch())` block only (retiring the redundant hex-first `:root` restatement). alignment-review surfaced: does this match TECH-06's intent for the oldest Thai-Android WebViews? | **Proceeded with `@supports not(oklch)`.** Verified technically sound: `@supports` ships since Chrome 28 (2013), `oklch()` since Chrome 111 (2023) — the gate covers the ENTIRE realistic pre-oklch Android range; a device too old for `@supports` predates the oklch cutoff by ~10yr. Low risk; confirm against §5.8 (beta Android vintage) if data arrives. | OPEN (low) |
