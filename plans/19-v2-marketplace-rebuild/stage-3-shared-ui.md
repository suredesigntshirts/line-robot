# Stage 3 — Shared UI

**Spec status: SKELETON.** This document is fleshed into a full spec, iterated with the user, and approved before any code for this stage is written. (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

## Purpose

Establishes `packages/ui` — the single React component library shared by both the Astro website (Stage 4) and the rebuilt LIFF mini-app (Stage 5) — so that neither downstream stage builds its own component primitives. Implements Thai + English i18n plumbing, design tokens, and the core listing-specific components. The deliverable is a component gallery that lets Stage 4 and Stage 5 pull from a fully-tested shared library rather than duplicating UI work. Corresponds to master plan D4 and D14.

## Scope

**In:**
- `packages/ui` package: React + Tailwind CSS + shadcn/ui, wired into the monorepo
- Design tokens: color, spacing, typography, radius — defined as Tailwind theme extensions and/or CSS custom properties
- Thai + English i18n plumbing: string catalogs, a `useTranslation`-style hook or equivalent, language-switching mechanism; designed for N languages, ships Thai + English
- Core listing components:
  - Listing card (thumbnail, price, key facts, badges)
  - Listing gallery (image carousel / lightbox)
  - Listing detail field set (all extracted fields rendered correctly including Thai units)
  - Map component (PostGIS-backed lat/lng pin; library TBD — see Open questions)
  - Filter/facet bar (property type, price range, location, deed type)
  - Status badges (listing lifecycle: draft / active / under-offer / sold / rented / withdrawn)
- Component gallery: a browsable local page (Storybook or lighter alternative — see Open questions) showing all components in all relevant states; no deployment required, runs locally

**Out (explicitly):**
- Astro site wiring, SSR, routing, or SEO (Stage 4)
- LIFF SDK integration, LINE Login, or mini-app scaffolding (Stage 5)
- Auth UI (Stage 4)
- Admin or group-management screens (Stage 6)
- AVM estimate display components (Stage 7, though the components may reuse Stage 3 primitives)
- Preact SPA removal — that's Stage 5

## Key deliverables

1. `packages/ui` monorepo package with TypeScript, Tailwind, shadcn configured
2. Design token file (Tailwind config extension or CSS vars) — covers color, spacing, typography, radius
3. i18n plumbing: Thai and English string catalogs, translation mechanism (library/approach resolved during flesh-out — see Open questions), language-switching support for both SSR and SPA consumers
4. Listing card component with Storybook/gallery stories covering: standard, featured, under-offer, sold states
5. Listing gallery (image carousel) component
6. Listing detail field-set component rendering all listing schema fields from Stage 1 types
7. Map pin component (single listing lat/lng)
8. Filter/facet bar component (stateless — accepts value + onChange; no data fetching)
9. Lifecycle status badge component set
10. Component gallery page: all of the above browsable locally with Thai and English language toggle

## Dependencies

- Stage 1 must be complete: `packages/domain` types are the input shape for all listing components
- Stage 0 must be complete: quality workflow in place
- Stage 3 can begin in parallel with Stage 2 (per master plan §6 dependency note: "3 can overlap 2") — but listing-detail field rendering must wait for the Stage 1 schema to be stable

## Acceptance criteria (sketch)

- `packages/ui` builds cleanly with TypeScript strict mode; no circular dependencies with `packages/domain`
- All components render without error in both Thai and English locale; language toggle in the gallery works
- Listing card, gallery, and detail field set accept a `Listing` type from `packages/domain` directly — no local type redefinitions
- Map component renders a pin at a given lat/lng without crashing; tile provider and attribution correct
- Component gallery page starts with `npm run gallery` (or equivalent) and shows all components
- All components have unit tests (React Testing Library) covering key states and edge cases
- No adapter imports (no LINE SDK, no AWS SDK, no DB imports) in `packages/ui`

## Open questions (resolve when fleshing this spec)

- **i18n library choice**: a lightweight custom hook, `react-i18next`, `next-intl`, or similar? Must be compatible with both Astro islands (SSR) and the LIFF mini-app (SPA); server-component compatibility matters for Stage 4
- **Design token definition format**: Tailwind config theme extension only, or CSS custom properties exposed as primitives for non-Tailwind consumers? Choice affects how the mini-app (Stage 5) consumes the tokens
- **Component gallery tool**: Storybook proper, or a lighter custom gallery page? Storybook adds maintenance overhead; a simpler static page may suffice at this scale — the fleshed spec should weigh the trade-off
- **Map library**: Leaflet, MapLibre GL JS, or a hosted Maps SDK (Google, Longdo for Thailand)? Thailand tile coverage, license cost, and bundle size all factor in
- **shadcn/ui integration model**: copy-paste (shadcn default) or a build-step wrapper? Copy-paste means UI package owns the component source; wrapper means shadcn updates are easier but adds a build layer
- **Tailwind sharing between packages**: Astro (Stage 4) and the mini-app (Stage 5) both need to include `packages/ui` in their Tailwind content paths — exact config pattern should be defined once here, not re-solved per consumer

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), Playwright smoke (if user-facing), docs updated.

Stage-3-specific review notes:
- The spec auditor verifies that every component accepts types from `packages/domain` without local redefinition — type drift between the UI layer and the domain layer is a recurring failure mode
- The simplicity critic is the primary reviewer here: a shared UI library is a prime over-engineering target; challenge every abstraction, every prop, every context provider; the minimum that serves Stage 4 and Stage 5 wins
- Stage gate Playwright smoke is minimal (the gallery page loads, all component sections render, language toggle works) — full user-flow smoke tests are in Stage 4 and Stage 5

## Iteration log

| Date | What changed | Why |
|---|---|---|
| (empty — filled during flesh-out and build) |
