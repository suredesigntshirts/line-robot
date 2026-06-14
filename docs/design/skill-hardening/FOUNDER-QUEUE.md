# Founder decision queue — plan-21 design run

Genuinely-ambiguous TASTE calls the known rulings don't settle, surfaced during the autonomous
run. For each: the most mock-faithful default was chosen and the build PROCEEDED (never blocked);
the founder reviews these later. Known rulings already applied (NOT queued): NPA = calm violet
(not red); "steal the styling, ignore the data"; responsive (not app-only); `direction-a` is the
target; content is schema-driven; adapter is Pulumi.

| # | Surface | Question | Default taken (mock-faithful) | Status |
|---|---------|----------|-------------------------------|--------|
| 1 | TECH-06 oklch fallback (Phase 1) | The oklch fallback was slimmed to a `@supports not (color: oklch())` block only (retiring the redundant hex-first `:root` restatement). alignment-review surfaced: does this match TECH-06's intent for the oldest Thai-Android WebViews? | **Proceeded with `@supports not(oklch)`.** Verified technically sound: `@supports` ships since Chrome 28 (2013), `oklch()` since Chrome 111 (2023) — the gate covers the ENTIRE realistic pre-oklch Android range; a device too old for `@supports` predates the oklch cutoff by ~10yr. Low risk; confirm against §5.8 (beta Android vintage) if data arrives. | OPEN (low) |
| 2 | Card density: Thai body size (pass 1) | The `direction-a` mock renders card location/specs at 11px. TH-06/07 + theme rule say Thai body is ≥13px with line-height ≥1.6 (looped-Thai readability). The two conflict. | **Rendered Thai body at 13px (`text-sm`) + leading 1.625** — honoring the register over the mock's pixel size (Thai readability > matching the mock exactly). Cards are slightly denser/taller than the mock as a result. Numerals/price stay tight. Confirm the readability-over-compactness call. | OPEN (low) |
| 3 | Detail/card LINE CTA colour | The mock's primary CTA ("Chat on LINE") is trust-blue; our `LineCtaButton` is LINE-green (`--color-line` #06c755). | **Kept LINE-green** per CONV-06 + the taste brief ("explicitly LINE-branded chat CTA") — the mock's blue is generic primary styling. Settled by the brief, surfaced for confirmation. | OPEN (low) |
