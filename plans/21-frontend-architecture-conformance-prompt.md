# Task (Prompt 1 of 2): Tailwind v4 + shadcn foundation for the website — NO visual change

> **Run-this-prompt artifact.** Written 2026-06-14. Drives **Phase 1** of
> `plans/21-frontend-architecture-conformance.md` (APPROVED). Assumes ZERO memory of the planning session.
> **This prompt is the FOUNDATION only — it must NOT change how the site looks.** The visual redesign to the
> mock is the NEXT prompt (`plans/19-v2-marketplace-rebuild/stage-4-design-alignment-prompt.md`), run after
> this one is green + committed.

## Mission
The website (`packages/website`) silently deviated from our frontend stack canon: it styles everything with
inline `style={{ "var(--token)" }}` objects — **no Tailwind, no shadcn** — even though the canon mandates
both. Put the **Tailwind v4 + shadcn foundation** in place so the next prompt can author the pages to the
mock with real hover/focus/responsive states. **Do NOT rewrite the existing components or change the visual
appearance in this prompt** — just wire the foundation and leave the site looking identical.

## Step 0 — Rebuild context (read first, in order)
1. **`plans/21-frontend-architecture-conformance.md`** — THE plan (you are doing Phase 1). Authoritative.
2. **`docs/research/c1-frontend-stack-canon.md`** — the canon. Key: **Finding 10 + TECH-06** (consumers
   `@import "tailwindcss"` then the shared `@theme`), **TECH-07** (`shadcn init --template astro`, owned code),
   **TECH-01/02** (static = zero JS), **AP-1** (don't SPA-ify), **AP-3** (one `@theme` only). Note the adapter
   is a **settled decision: Pulumi, NOT astro-sst** (TECH-12 is annotated as superseded — do not touch infra).
3. `CLAUDE.md` (root) — "Quality system", "v2 public website (Stage 4)", "Deploying". **Docs-first rule applies.**
4. `plans/20-frontend-visual-e2e-testing.md` + `.claude/skills/frontend-review/SKILL.md` — the gate (mode-A
   invariants are your parity net here).

### Facts already established (don't re-investigate)
- The build adopted half of Finding 10 (token-as-CSS-var sharing) and dropped `@import "tailwindcss"` +
  `shadcn init`. The unstyled-site bug came from `@theme` with no Tailwind to compile it.
- **The deviation is ONLY the styling layer.** Astro SSR, static-React display (zero JS), `client:load` only
  for interaction, i18n, JSON-LD all conform — don't touch them.
- **`theme.css` is already `@theme {}` (Tailwind v4 syntax).** Once Tailwind runs, those tokens compile to
  `:root` natively → the `fallbacks.css` token-restatement becomes redundant for base tokens, BUT its
  oklch/old-Android fallback must be PRESERVED (canon TECH-06).
- Components currently use inline `var(--token)` styles — they will KEEP WORKING after Tailwind is wired
  (same tokens), so the site stays visually unchanged. Leave them; the next prompt rewrites them to the mock.

## Steps
1. **Docs-first:** cache via `/documentation-downloader` — Tailwind v4 `@theme` + the Astro Tailwind-v4
   integration (`@tailwindcss/vite`), and shadcn `init --template astro` + Astro usage. Don't guess the API.
2. **Wire Tailwind v4** into `packages/website`: add the Tailwind v4 Vite plugin to `astro.config.mjs`; create
   the website's global stylesheet that does `@import "tailwindcss";` then imports the shared `@theme`
   (`@line-robot/ui` theme); import it in `Base.astro`. One `@theme` only (AP-3) — do not redefine tokens.
3. **Preserve the oklch/old-Android fallback** (canon TECH-06): ensure `oklch()` colours still degrade for
   pre-Chrome-111 Thai-Android WebViews (`rgb()` + `@supports (color: oklch)`). Retire the now-redundant
   `fallbacks.css` token-restatement (Tailwind emits `:root` tokens once it compiles `@theme`), but KEEP the
   fallback mechanism — move it into the token layer / a small supplemental sheet if needed.
4. **shadcn:** `shadcn init --template astro`; pull in the base primitives as owned code (TECH-07). Don't
   build screens with them yet — just confirm a static shadcn component renders with **zero JS** (`astro check`).
5. **Do NOT rewrite the existing inline-style components or change any visuals.** This prompt only adds the
   foundation; the site must look the same.

## Gate (must pass before commit)
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e -w @line-robot/website` — all green.
- **plan-20 mode-A invariants green**: theme applies (now via Tailwind), brand fonts delivered, dark mode
  flips, no broken images, no JS/5xx errors. This is your proof the migration didn't break the plumbing.
- **An explicit oklch/old-Android fallback assertion holds** (don't regress old WebViews) — treat red as a BLOCKER.
- `/frontend-review` mode B (design review) should read **"unchanged vs the current site"** — visual parity.
- A static shadcn component ships **zero JS** (`astro check`, TECH-01).
- `/increment-review` + architecture-conformance check vs c1 (Tailwind running, one `@theme`, shadcn owned,
  islands still minimal). Address findings.

## Done → hand off to Prompt 2
- Tailwind v4 runs on the website; shared `@theme` is the single token source; shadcn initialized as owned
  code; oklch fallback intact; site visually unchanged; all gates green. **Commit** (e.g. `feat(website):
  Tailwind v4 + shadcn foundation, no visual change (plan 21 ph1)`). Update BACKLOG/SPRINT-LOG.
- Then run **`plans/19-v2-marketplace-rebuild/stage-4-design-alignment-prompt.md`** to implement the
  `direction-a` mock across all pages on this foundation.

## Key paths
- `packages/website/{astro.config.mjs, src/layouts/Base.astro}`, the new website global stylesheet
- `packages/ui/theme.css` (the `@theme {}` source), `packages/ui/fallbacks.css` (+ its `emit-fallbacks` script)
- Canon: `docs/research/c1-frontend-stack-canon.md` · Plan: `plans/21-frontend-architecture-conformance.md`
- Gate: `/frontend-review`, `/increment-review`; `npm run test:e2e -w @line-robot/website`
