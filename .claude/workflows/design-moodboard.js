export const meta = {
  name: 'design-moodboard',
  description: 'Collect visual references (Thai + international), draft token candidates, critique against heuristics + founder taste',
  phases: [
    { title: 'Collect', detail: 'browse + screenshot references; annotate against heuristic IDs' },
    { title: 'Critique', detail: 'Opus alignment check vs heuristic register + founder taste brief', model: 'opus' },
    { title: 'Revise', detail: 'apply valid findings, rebut invalid' },
  ],
}

const BRIEF = `PRODUCT + TASTE BRIEF (June 2026):
We are designing a Thai real-estate marketplace (Northern Thailand / Chiang Mai), Thai+English, mobile-first, LINE-centric: public Astro website + LINE mini-app sharing one React/Tailwind/shadcn design system ("packages/ui").

FOUNDER TASTE BRIEF (verbatim intent): admires the aesthetic of Baania, DDProperty, and LINE (Naver) — "nice clean aesthetic, feels modern, clean UX, approachable." No single anchor product; we will propose 2-3 candidate directions. DARK MODE: both light and dark themes polished at launch — every token/reference note must consider both.

BINDING DESIGN HEURISTICS (from docs/research/00-product-principles.md — observations must be mapped to these IDs):
- TH-06/07/08/13: looped Thai face (Sarabun/Noto Sans Thai looped) for body, line-height >=1.6, lang="th" + ICU breaking (never break-all), loopless (LINE Seed TH / Noto loopless) allowed for headings only.
- TH-03/04/05: human trust signal on every card; verification badge; renders labeled.
- TH-09/11/12: mobile-first (360-390px), clean cards on landing with density reserved for results/detail, brand primary in the trust-blue/green family (NOT purple; black never dominant surface).
- CONV-03/04/05/06: thumbnail-strip galleries with count; above-fold = hero/price/specs/pin/CTA only; accordions below (chanote section stays expanded); primary CTA = "Chat on LINE".
- COPY-03/06: +20% width budget for Thai strings; land area Thai-units-first display.
- TECH-06: tokens defined once via Tailwind v4 @theme; OKLCH colors need RGB fallbacks (older Thai Android WebViews).
Read docs/research/00-product-principles.md for full context before starting.`

const ITEMS = [
  { id: 'M1', label: 'thai-visual-audit', out: 'docs/design/moodboard/thai/NOTES.md',
    brief: `THAI VISUAL AUDIT (live browsing with the playwright-cli skill; save screenshots to /home/user/src/line-robot/docs/design/moodboard/thai/ with descriptive kebab-case names).
Targets, in priority order (founder explicitly admires the first three):
1. Baania (baania.com) — deep visual dive beyond the existing A5 screenshots (docs/research/assets/a5/ — reuse, don't re-shoot what exists): capture type treatment, spacing, card anatomy, color usage, badge styles, search UX chrome.
2. DDProperty (ddproperty.com) — was Cloudflare-blocked in earlier research; retry browsing (try mobile viewport, direct listing URLs). If still blocked, gather visual evidence via web sources (press kits, design write-ups, app-store screenshots) and SAY SO explicitly.
3. LINE design language — line.me, LINE Seed font specimen pages (seed.line.me), any public LINE design-system/brand resources; the LIFF/mini-app visual conventions our mini-app sits inside.
4. Thai developer sites famous for clean design: sansiri.com, apthai.com (premium-minimal pole — capture what makes them feel premium).
5. One top Thai bank/consumer app marketing surface (e.g. kasikornbank.com / K PLUS pages, krungthai.com NEXT) for the trustworthy-clean pole.
For EVERY screenshot, add an entry in NOTES.md: what the screen does well/badly, specific measurements where visible (approx type sizes, card radius, spacing rhythm, palette hexes via inspection), which heuristic IDs it supports or violates, and STEAL/AVOID verdicts. End NOTES.md with: top 10 STEAL patterns for us, top 5 AVOID patterns, and how each pole (Baania-clean / LINE-friendly / developer-premium) maps to the founder's brief.` },
  { id: 'M2', label: 'international-benchmark', out: 'docs/design/moodboard/international/NOTES.md',
    brief: `INTERNATIONAL RE/MARKETPLACE BENCHMARK (live browsing with the playwright-cli skill; screenshots to /home/user/src/line-robot/docs/design/moodboard/international/).
Targets: Zillow, Rightmove, Idealista, Airbnb (search + detail patterns), Opendoor (seller-flow patterns), and ONE dense-by-design Asian portal for contrast (e.g. Suumo Japan). For each: homepage, search results, listing detail (above-fold!), gallery interaction, contact/CTA placement, and dark mode if offered.
In NOTES.md per screenshot: card anatomy breakdown (image ratio, badge placement, price treatment, metadata order), above-fold inventory vs our CONV-04 rule, gallery pattern vs CONV-03, filter UX, what translates to mobile-first Thai usage and what does NOT (label cultural mismatches explicitly — e.g. email-form CTAs violate CONV-06).
End with: top 10 STEAL patterns, top 5 AVOID patterns, and 3 observations specifically about polished dark-mode listing UIs (the founder wants dark polished at launch).` },
  { id: 'M3', label: 'token-candidates', out: 'docs/design/tokens-candidates.md',
    brief: `DESIGN TOKEN CANDIDATES (research + drafting; browsing optional for font specimens).
Produce docs/design/tokens-candidates.md containing THREE named candidate token sets, each expressed as a real Tailwind v4 @theme CSS block (light + dark values side by side, OKLCH with RGB fallbacks per TECH-06):
- Candidate A "Baania-clean": trust-blue primary, neutral warm grays, generous radius.
- Candidate B "LINE-native": fresh-green primary (NOT LINE's exact #06C755 — adjacent but ownable), rounded-friendly, chat-app warmth.
- Candidate C "Northern-premium": muted teal/forest + warm paper neutrals, editorial type scale (the Sansiri pole, made approachable).
Each candidate must include: full color ramp (primary, surface, text, success/warn/danger, badge colors for status/urgency/verification), spacing scale, radius scale, shadow scale, AND a typography spec: Thai/Latin font pairing obeying TH-06/13 (body = looped Thai face; heading may be loopless), exact font stacks with fallbacks, a bilingual type scale with line-heights >=1.6 for Thai (TH-07), and the +20% Thai width note (COPY-03). Verify every font choice actually supports Thai (check Google Fonts / LINE Seed licensing — LINE Seed is free but check the license terms for commercial non-LINE-affiliated use and report what you find). Check WCAG AA contrast for every text-on-surface pair in BOTH themes and show the ratios. Cite sources for licensing and contrast claims.` },
]

function collectPrompt(it) {
  return `${BRIEF}

YOUR ASSIGNMENT — ${it.id} (${it.label}): ${it.brief}

Write your output file at /home/user/src/line-robot/${it.out} (create directories as needed). Screenshots must actually exist on disk — verify with ls before finishing. Your final reply: max 12 lines — output file path, screenshot count (if applicable), your 5 strongest observations/choices, and anything you could not capture (with reason).`
}

function critiquePrompt(it) {
  return `${BRIEF}

You are an ADVERSARIAL DESIGN CRITIC. Review the mood-board artifact at /home/user/src/line-robot/${it.out} (assignment summary: ${it.brief.slice(0, 350)}...).

Lenses:
1. TASTE ALIGNMENT — does it serve the founder's brief (Baania/DDProperty/LINE clean-modern-approachable, dark polished at launch), or drift toward generic/Western/luxury aesthetics?
2. HEURISTIC COMPLIANCE — check claims against the binding heuristics above AND docs/research/00-product-principles.md; any recommendation that violates TH-*/CONV-*/COPY-*/TECH-06 is a finding (e.g. loopless body font, purple primary, email-first CTA patterns praised, missing dark-mode treatment).
3. EVIDENCE — do referenced screenshots actually exist on disk (run ls on the moodboard dirs)? Are hexes/measurements/licensing/contrast claims plausible — spot-check 2-3 (WebFetch font licensing; recompute one contrast ratio).
4. USEFULNESS — are notes specific enough that a designer could act (real values, named patterns), or vibes? Vague entries are findings.
DO NOT edit files. Return numbered findings with severity [BLOCKER/MAJOR/MINOR] and what a fix requires. If strong, say so and list only real findings.`
}

function revisePrompt(it, critique) {
  return `${BRIEF}

Revise /home/user/src/line-robot/${it.out} per this critique:

${critique}

Apply valid findings (re-browse/re-research where flagged — playwright-cli available); rebut invalid ones. Append "## Review response" listing each finding: Applied/Rebutted + why. Keep structure intact. Final reply max 5 lines: applied vs rebutted counts, most significant change, remaining weakest area.`
}

log('Mood board: 3 collectors -> critique -> revise; outputs in docs/design/')

const results = await pipeline(
  ITEMS,
  (it) => agent(collectPrompt(it), { label: `collect:${it.id}`, phase: 'Collect', model: 'sonnet', agentType: 'general-purpose' }),
  (summary, it) => agent(critiquePrompt(it), { label: `critique:${it.id}`, phase: 'Critique', model: 'opus' })
    .then((critique) => ({ critique, summary })),
  (prev, it) => prev && prev.critique
    ? agent(revisePrompt(it, prev.critique), { label: `revise:${it.id}`, phase: 'Revise', model: 'sonnet', agentType: 'general-purpose' })
        .then((rev) => ({ id: it.id, out: it.out, collect: prev.summary, revision: rev }))
    : { id: it.id, out: it.out, collect: prev ? prev.summary : null, revision: 'SKIPPED — critique unavailable' }
)

const done = results.filter(Boolean)
log(`${done.length}/3 mood-board pipelines completed`)
return done
