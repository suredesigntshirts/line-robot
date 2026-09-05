# Plan 21 — Frontend architecture conformance (Tailwind v4 + shadcn + Astro best-practice) → then implement the `direction-a` mock across all pages

**Status: APPROVED 2026-06-14 — build directly via the two prompts below. No separate spike (founder ruled
"we're redoing the frontend anyway, just do it").** Build = **Prompt 1** (foundation) then **Prompt 2** (mock
across all pages). Supersedes the earlier "Path A restyle-in-inline" approach.

Governing reference: **`docs/research/c1-frontend-stack-canon.md`** (version-pinned frontend stack canon) +
the heuristic register `docs/research/00-product-principles.md`. This plan brings the build back into
conformance with c1, which it silently deviated from.

## Why — the diagnosis

`c1-frontend-stack-canon.md` already prescribes the proper architecture:
- **Finding 10 / TECH-06:** tokens in `packages/ui/theme.css` as `@theme {}`; **consumers `@import
  "tailwindcss"` THEN the theme** — the website is meant to RUN Tailwind.
- **TECH-07:** **shadcn via `shadcn init --template astro`**, components owned (copied in).
- Tailwind v4's `@theme` compiles to `:root` CSS vars consumed by utilities AND readable at runtime.

The Stage 3/4 build adopted **half** of Finding 10 (token-as-CSS-var sharing) and dropped the other half
(`@import "tailwindcss"`, `shadcn init`). It styled every component with inline `style={{ "var(--token)" }}`
objects — **no Tailwind, no shadcn, no utility classes anywhere.** Consequences:
1. **The unstyled-site bug (gate "TECH-06").** `@theme {}` with no Tailwind to compile it → tokens discarded
   → unstyled site. `fallbacks.css` hand-re-derived what Tailwind + the canon's oklch-fallback clause would
   emit — a workaround around the symptom, not a return to canon.
2. **Inline style objects can't express `:hover` / `:focus` / `:active` / `::placeholder` / `@media`.** The
   `direction-a` restyle NEEDS those. The current medium structurally cannot reach the mock (the live
   `ListingCard` has no hover state — because it can't).
3. **Restyle-twice waste** — avoided here by the two-prompt split (foundation first, then author each surface
   to the mock once).

**The deviation is ONLY the styling/component-authoring layer.** Astro SSR, static-React display (zero-JS,
TECH-01/02), `client:load` only for real interaction, i18n routing, server-rendered JSON-LD — all already
conform to c1. So this is "fix the styling layer to canon," not "rewrite the frontend."

**c1's own gap (fix it as part of this work):** the canon never states a component-authoring rule
("utilities/shadcn, never inline style objects"). Add it (new heuristic + an anti-pattern) so it can't recur.

## Scope

### In
1. **Tailwind v4 running on the website** — the global stylesheet does `@import "tailwindcss";` then `@import`
   the shared `@theme` tokens (Finding 10). The website's `astro.config` gains the Tailwind v4 Vite plugin.
   `@theme` is the **single** token source (AP-3: one `@theme`; the consumer must not redefine the namespace).
2. **Preserve the OKLCH / old-Android fallback (canon TECH-06).** Tailwind v4 emits `oklch()`; pre-Chrome-111
   Thai-Android WebViews can't parse it. Keep an `rgb()`/`@supports (color: oklch)` fallback. The hand-
   generated `fallbacks.css` token-restatement becomes redundant for base tokens once Tailwind compiles
   `@theme` — retire that part, keep the oklch-fallback mechanism. Verify with the plan-20 mode-A invariants.
3. **shadcn via `shadcn init --template astro`** — components copied in as owned code (TECH-07). Use
   **judiciously**: thin presentational primitives (Card / Badge / Button) rendered statically in Astro =
   zero JS (TECH-01); Radix-heavy interactive primitives (Dialog / Dropdown / Combobox) only where an island
   needs them. Do NOT SPA-ify (AP-1).
4. **Author components with Tailwind utilities / shadcn — retire inline-style objects.** No raw hex/px and no
   inline `style` objects for anything a class can do. (Reached in Phase 2 as each surface is authored.)
5. **Implement the `direction-a` mock across ALL pages** on the new foundation — home/browse (th+en), detail
   (th+en), empty/zero-result, 404, and the shared `@line-robot/ui` components. Content stays schema-driven
   ("steal the styling, ignore the data").
6. **Close c1's gap** — add the component-authoring heuristic + anti-pattern to the canon + register.

### Out (settled — not in scope here)
- **Deploy adapter = Pulumi + `build-lambda.mjs` + `@astrojs/node` — CONFIRMED DECISION (spiked, 2026-06-14).**
  We spiked it and chose Pulumi over `astro-sst`/SST Ion (canon TECH-12); the existing Pulumi infra + scoped
  deploy identity already runs the whole stack and the site is live on it. Supersedes canon TECH-12 (annotated
  there + in c1's Confidence section), **not** an open question. No infra change in this plan.
- **The mini-app (Stage 5)** consumes the now-conformant `packages/ui`; its own shadcn/Tailwind adoption
  happens in the Stage 5 build. This plan sets `ui` up so Stage 5 inherits it.
- i18n / JSON-LD / island strategy — already conform; no change.

## Phases — two runnable prompts, run in sequence (no separate spike — redoing the frontend regardless)

**Prompt 1 = `plans/21-frontend-architecture-conformance-prompt.md` (foundation).**
**Prompt 2 = `plans/19-v2-marketplace-rebuild/stage-4-design-alignment-prompt.md` (implement the mock, all pages).**

### Phase 1 — Tailwind + shadcn FOUNDATION (Prompt 1) — no component rewrites, site stays unchanged
- **Docs-first (global CLAUDE.md rule):** cache Tailwind v4 `@theme` + the Astro Tailwind-v4 integration +
  shadcn `init --template astro` docs via `/documentation-downloader`. Don't guess the API.
- Wire Tailwind v4 into the website (`astro.config` plugin; global stylesheet `@import "tailwindcss";` then the
  shared `@theme`). `shadcn init --template astro`; bring in the base primitives as owned code.
- Handle the **oklch/old-Android fallback** (canon TECH-06) and retire the now-redundant `fallbacks.css` token
  restatement (Tailwind emits the `:root` tokens once it compiles `@theme`).
- **Do NOT mass-migrate the existing inline-style components** — they keep working (they read the same tokens
  Tailwind now emits), so the site looks **unchanged**. Per-component authoring to the mock happens in Prompt 2,
  so each surface is touched once, not twice.
- Gate: site builds; plan-20 **mode-A invariants green** (theme applies via Tailwind, fonts, dark mode, no
  broken images, no errors) + an explicit **oklch/old-Android fallback assertion**; a static shadcn component
  ships **zero JS** (`astro check`, TECH-01); typecheck/lint/test green. Commit — a safe foundation checkpoint.

### Phase 2 — Implement the `direction-a` mock across ALL pages (Prompt 2) — on the Tailwind/shadcn foundation
- Author every user-facing surface to the mock in Tailwind utilities / shadcn — **this is where inline-style
  objects get replaced** (the "no inline-style objects" end state is reached here). All pages: home/browse
  (th+en), detail (th+en), empty/zero-result, 404, and the shared `@line-robot/ui` components.
- Five passes, highest leverage first: shared cards → website chrome/header → filter bar → detail → empty
  states. Proper hover/focus/responsive states (now possible). Match the mock's treatment; responsive (not
  app-only); content schema-driven; NPA stays calm violet (surface divergences, don't auto-"fix").
- Per pass: free gates + `test:e2e`; `/frontend-review` (mode A green + mode B design-vs-`direction-a`,
  iterate until aligned + founder agrees); `/increment-review` + `/alignment-review`; architecture-conformance
  check (no inline-style objects, one `@theme`, islands minimal). Commit per pass.

### Phase 3 — Deploy, verify, lock-in, hand-off (end of Prompt 2)
- Deploy to staging (Pulumi, per CLAUDE.md). Verify on real infra: `/frontend-review` **deployed mode**
  (`E2E_BASE_URL=https://d15dpmhcgtrf1r.cloudfront.net`).
- Founder blesses = **design lock-in** → re-enable pixel-regression baselines (deferred during flux).
- Re-gate Stage 4 (CONDITIONAL-PASS → PASS); update `deploy-status` memory; add the missing component-
  authoring heuristic to `c1` + the register.
- Amend `stage-5-miniapp-rebuild.md` to bind `direction-a` + `/frontend-review` + the conformant `packages/ui`.

## Review cadence (per CLAUDE.md §Quality system)
- Every change: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e -w @line-robot/website`.
- Every increment: `/increment-review` (3 reviewers + skeptic) + `/alignment-review` (design-bearing) +
  `/frontend-review` (perceptual). Plus an **architecture-conformance check vs `c1`** (Tailwind running, one
  `@theme`, no inline-style objects, shadcn as owned code, islands still minimal).
- Stage-4 re-gate: full-diff review + the conformance check + deployed `/frontend-review`.

## Risks
- **Tailwind v4 + Astro 6 SSR + oklch fallback** — the canon flags oklch-on-old-Android as unverified; with no
  separate spike, Phase 1's mode-A invariants + an explicit old-Android/oklch-fallback assertion are the net.
  A regression re-introduces the unstyled/old-device bug class — treat that assertion as a blocker.
- **Live gated stage** — Phase 1 leaves the site visually unchanged (foundation only, components not rewritten),
  so it's a safe committed checkpoint before the Phase 2 redesign rides on it.
- **Coordination with plan-20** — the e2e harness was just rebuilt; this plan leans on it (mode A = the safety
  net) and must not clobber it. Pixel baselines stay deferred until Phase 3 lock-in.
- **shadcn scope creep** — keep it to primitives that earn their keep; the website is mostly static.

## Done criteria
- Website runs Tailwind v4; shared `@theme` is the single token source; no component uses inline-style objects;
  shadcn initialized as owned code; oklch/old-Android fallback intact (mode-A green). Phase 1 visually identical.
- Phase 2: every page reads like `direction-a` (founder-confirmed via mode B), th/en × light/dark × mobile/desktop.
- Deployed + verified (deployed mode); Stage 4 re-gated PASS; pixel baselines re-enabled.
- `c1` + register updated with the component-authoring heuristic; Stage 5 spec amended.
