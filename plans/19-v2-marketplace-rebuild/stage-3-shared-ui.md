# Stage 3 — Shared UI

**Spec status: FLESHED — pending founder approval.** (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

## Purpose

Establish `packages/ui` — the single React 19 component library shared by the Astro website (Stage 4) and the rebuilt LIFF mini-app (Stage 5) — so neither downstream stage builds its own primitives. Ships token architecture (dual-theme, light+dark polished from the start), Thai/English i18n plumbing, and the listing-domain component set, all browsable in a self-hosted gallery used for visual review. Corresponds to master plan D4/D14; enforced by `/alignment-review` against `docs/research/00-product-principles.md`.

## Decisions (each with rationale)

- **D3.1 — shadcn integration: owned code, CLI v4, override via tokens only (TECH-07).** `shadcn init` copies Radix-backed primitives into `packages/ui/src/components/ui/`; we never npm-depend on shadcn. No structural rewrites of component internals — restyle by pointing shadcn's CSS variables at our `@theme` tokens. A monthly `shadcn diff` CI job (Stage 0 wiring) surfaces upstream fixes. *Rationale:* registry model is the supported path; owning the code keeps us free of a build-time wrapper layer (anti-over-engineering) while tokens-only overrides prevent drift.
- **D3.2 — Tokens in ONE `theme.css` via Tailwind v4 `@theme`; placeholder set tonight, swap is one file (TECH-06).** `packages/ui/theme.css` holds the full semantic token set in a single `@theme` block (light) + `:root[data-theme="dark"]`/`.dark` overrides + `prefers-color-scheme` fallback, exactly mirroring the structure in `docs/design/tokens-candidates.md`. Tonight ships **one placeholder candidate** (the "Baania-clean" trust-blue set, §A of that doc) wired end-to-end. *Rationale:* values are pending the founder's morning mood-board pick; architecture must not block the build. Because every component resolves `var(--…)` only, adopting the chosen candidate is a paste-over of `theme.css` (see Swap procedure) with zero component edits.
- **D3.3 — Tokens are also runtime CSS vars, so the non-Tailwind mini-app and JS consumers read the same source.** Tailwind v4 compiles `@theme` to `:root` custom properties; both Astro and the React SPA `@import "../ui/theme.css"` after `@import "tailwindcss"`. No JS token config, no `tailwind.config.js`. The `--*: initial` reset lives in the shared file only (AP-3). *Rationale:* one source of truth, satisfies TECH-06 and the master-plan "tokens once in packages/ui" rule.
- **D3.4 — i18n: typed TS string catalogs + a ~40-line `t()` util, NO i18n library.** `packages/ui/src/i18n/` holds `th.ts`/`en.ts` as `as const` typed modules and a `createTranslator(locale, dict)` returning `t(key, vars?)` with ICU-lite `{var}` interpolation only. Locale is passed explicitly (prop/arg), never via React context — context does not cross Astro islands (TECH-08/AP-4). Designed-for-N (add `my.ts`, extend a union), ships th+en, **th default (DF-3)**. *Rationale:* react-i18next/next-intl are heavyweight for ~a few hundred keys and assume a context provider that breaks across islands; a typed catalog gives compile-time key safety and serves SSR + SPA identically (anti-over-engineering rule, simplicity critic is primary reviewer here).
- **D3.5 — Component gallery: a tiny in-package Vite app, NOT Storybook.** `packages/ui/gallery/` is a Vite + React 19 app (`npm run gallery`) listing every component in every state, with a **light/dark toggle and a th/en toggle** in its chrome — both themes and both locales reviewable side by side. *Rationale:* Storybook is a heavy dep tree + config surface for a library this size; a flat gallery page is the minimum that serves visual review (master-plan simplicity mandate). It doubles as the stage-gate Playwright smoke target.
- **D3.6 — Component tests: vitest + @testing-library/react for behavior; gallery is the visual harness.** No Playwright component tests tonight; visual correctness is reviewed against the gallery in both themes. *Rationale:* matches master-plan §5.3 free-tier (unit + RTL) without standing up a screenshot pipeline prematurely.
- **D3.7 — Typography: looped Thai body, line-height ≥1.6, loopless headings allowed, +20% Thai width budget (TH-06/07/08/13, COPY-03).** Placeholder stacks (license-checked OFL, shared across all candidates per the M3 doc): body `'Sarabun','Noto Sans Thai',Arial,sans-serif`; heading `'Noto Sans Thai','Sarabun',Arial,sans-serif` (600–700 reads loopless at display); Latin/numerals `'Inter','Helvetica Neue',Arial,sans-serif`. Body `line-height: 1.65`. Every text root sets `lang` and relies on ICU/`word-break: normal` (never `break-all`, TH-08). Layout primitives reserve +20% horizontal budget for Thai (COPY-03). *Rationale:* all three candidates converge on Sarabun-looped body + OFL fonts; only the heading face differs by direction, so the placeholder is direction-agnostic and the swap stays a single-file change.
- **D3.8 — No domain-type redefinition; components import `Listing` et al. from `packages/domain` (Stage 1).** Listing-rendering components accept the domain type directly; UI-only view-models are derived in a `toCardView()` helper, not by re-declaring fields. *Rationale:* type drift between UI and domain is the named recurring failure mode (spec-auditor focus).
- **D3.9 — No adapter imports in `packages/ui`.** No LINE SDK, AWS SDK, DB, or `fetch` to internal APIs; all components are stateless given props (filters/CTA emit `onChange`/`href`, never fetch). *Rationale:* hexagonal boundary; keeps the package consumable by both SSR and SPA.

## Token architecture

**Semantic naming scheme** (mirrors `docs/design/tokens-candidates.md` so any candidate drops in unchanged):
- **Color ramps:** `--color-primary-{50..900}`; surfaces `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-border`, `--color-border-2`; text `--color-text`, `--color-text-2`, `--color-text-disabled`; semantic `--color-{success,warn,danger}` + matching `-bg`.
- **Badge tokens (paired bg+text), one per register concept:** `--badge-available`, `--badge-reserved`, `--badge-urgent`, `--badge-verified`, `--badge-owner`, `--badge-npa` each with a `-text` sibling. These map 1:1 to COPY-04/05/10, DIST-01, TH-04 so badge components reference a named token, never a raw color.
- **Scales:** `--spacing-{0..20}` (4px base), `--radius-{sm,md,lg,xl,full}` (`lg` = card default, `full` = pill), `--shadow-{xs,sm,md,lg}`.
- **Type:** `--font-body-th`, `--font-heading-th`, `--font-latin`; `--text-{xs..3xl}`; `--leading-body: 1.65`.

**Dual-theme mechanics:** light values in the top-level `@theme` block (drives utility generation); dark is a runtime variable swap under `:root[data-theme="dark"], .dark` (no `@theme` nesting — Tailwind v4 forbids it), plus a `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` block for OS preference when no explicit toggle is set. This gives a manual toggle AND OS fallback. **RGB fallback (TECH-06):** OKLCH authoritative, each token carries a `/* #hex */`; a tiny build step (`scripts/emit-fallbacks.mjs`) emits the hex-first `:root` + `@supports (color: oklch(0 0 0))` cascade so pre-Chromium-111 Thai Android WebViews render the hex.

**Swap procedure (chosen candidate → live, single-file):** (1) copy the chosen candidate's `@theme` + dark blocks from `tokens-candidates.md` over the body of `packages/ui/theme.css`; (2) if its heading font differs, that's already inside the same file's `--font-heading-th`; (3) run `npm run tokens:fallbacks` to regenerate the hex cascade; (4) `npm run gallery` and review both themes. No component file changes — enforced by a lint rule (D3.2) that fails on any hardcoded hex/oklch/named color in `src/components`.

## Increments

Each increment ends with `/increment-review` (spec auditor + correctness + simplicity critic) **and** `/alignment-review` against the cited heuristic IDs.

1. **Package scaffold + tokens + typography.** Files: `packages/ui/{package.json,tsconfig.json}`, `theme.css`, `scripts/emit-fallbacks.mjs`, `src/index.ts`, shadcn init (`components.json`). *Accept:* builds in TS strict; `theme.css` has full semantic set + dark + OS-fallback; placeholder = Baania-clean; fonts wired with `--leading-body:1.65`; fallback script emits hex cascade; lint rule rejects hardcoded colors. *Review focus:* TECH-06/07, TH-06/07/08/13, AP-3; no token value hardcoded anywhere.
2. **i18n plumbing.** Files: `src/i18n/{th.ts,en.ts,index.ts}` (`createTranslator`, typed keys, `{var}` interp). *Accept:* `t()` returns correct string per locale; missing key is a type error; th is default; no React context used; both Astro-callable (plain fn) and SPA-callable. *Review focus:* D14/DF-3, TECH-08/AP-4, COPY-02 (buttons = bare verbs — grep catalog), COPY-03.
3. **Badge system + Price display + LINE-CTA.** Files: `src/components/{Badge,StatusBadge,PriceDisplay,LineCtaButton}.tsx`. *Accept:* badges cover status/urgency/owner-direct/verified/deed-type/NPA via badge tokens; PriceDisplay frames "asking / ราคาเสนอขาย" + negotiable flag, Thai land-unit-aware per-area; LINE CTA primary with phone secondary. *Review focus:* COPY-04/05/10/11, CONV-06/09, COPY-06, DIST-01, TH-03.
4. **ListingCard + Gallery + FieldList/accordion primitives.** Files: `src/components/{ListingCard,Gallery,FieldList,Accordion}.tsx`, `src/view/toCardView.ts`. *Accept:* ListingCard renders hero (heroPhotoIndex), price, badge row, freshness stamp, human trust signal from `packages/domain` `Listing` (no redefinition); Gallery = thumbnail strip + count (not dots-only); Accordion collapses sections but chanote/title-deed section is default-expanded and stays expandable. *Review focus:* CONV-03/04/05/11, COPY-04/06, TH-03, D3.8 type reuse.
5. **SearchFilters chips + EmptyState/ErrorState + layout shells.** Files: `src/components/{SearchFilters,EmptyState,ErrorState,Screen,CardGrid}.tsx`. *Accept:* SearchFilters is stateless (value + onChange, no fetch) with chip facets incl. new-vs-resale, NPA, pet-friendly, deed-type, price range; Empty/Error follow what+why+next; shells verified at 360–390px. *Review focus:* COMP-05/06, COPY-07, TH-09, D3.9 (no fetch/adapters).
6. **Gallery app + cross-cutting polish.** Files: `gallery/{index.html,main.tsx,sections/*}`. *Accept:* `npm run gallery` lists every component × every state with light/dark + th/en toggles; renders without error in all four combinations; serves as Playwright smoke target. *Review focus:* dual-theme parity, locale parity, every prior component present.

## Stage gate checklist

- TS strict build clean; no circular dep with `packages/domain`; no adapter imports anywhere in `packages/ui` (architecture-conformance check).
- Listing components accept `packages/domain` types directly — zero local redefinitions (spec auditor).
- Every component renders error-free in **both themes** and **both locales**; gallery toggles work.
- No hardcoded color/spacing/radius/font value in any component (lint rule green); chosen-candidate swap is provably one-file (dry-run the swap procedure on a second candidate).
- Unit tests (RTL) cover key states + edge cases per component; `npm test` green; coverage threshold met.
- `/alignment-review` pass: TH-03/06/07/08/13, CONV-03/04/05/06/09/11, COPY-02/03/04/05/06/07/10/11, COMP-05/06, DIST-01, TECH-06/07/08/09, TH-09 — each pass/violation/N-A logged.
- High-effort full-diff review; Playwright smoke (gallery loads, all sections render, both toggles work); CLAUDE.md + stack canon updated; retro appended.

## Risks

- **Token values still placeholder at gate.** Mitigated: architecture + swap procedure are the deliverable; the chosen set is a follow-on one-file change with no component churn. If the founder's pick arrives during the build, swap and re-review; otherwise gate on Baania-clean placeholder and note the pending swap.
- **OKLCH on old Thai Android (TECH-06).** Mitigated by the hex-first `@supports` cascade; verify against the §5.8 device-vintage answer before Stage 5 ships to LIFF.
- **shadcn upstream drift.** Mitigated by owned-code + monthly `shadcn diff` (Stage 0); no internal rewrites.
- **Domain schema churn (Stage 1).** ListingCard/FieldList depend on stable `Listing`; if Stage 1 fields move, `toCardView()` is the single adaptation point — keep the indirection thin (one caller), not a premature abstraction.
- **Over-abstraction (the named Stage 3 trap).** Simplicity critic is primary reviewer; no prop, context, or interface ships without a second consumer in Stage 4/5.
- **LINE Seed TH / heading-font choice** only matters if a non-placeholder candidate is picked; all candidate fonts are OFL and pre-license-checked in `tokens-candidates.md`, so the swap carries no license re-review.

## Iteration log

| Date | What changed | Why |
|---|---|---|
| 2026-06-12 | Skeleton → fleshed spec; open questions resolved (D3.1–D3.9); placeholder token set (Baania-clean) wired with one-file swap procedure; i18n = typed TS catalogs (no library); gallery = in-package Vite app (no Storybook); 6 increments with TH-/CONV-/COPY- review IDs. | Built unattended; pending founder design-direction pick + spec approval. |
