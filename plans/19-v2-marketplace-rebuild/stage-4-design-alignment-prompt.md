# Task (Prompt 2 of 2): Implement the `direction-a` mock design across ALL website pages

> **Run-this-prompt artifact.** Rewritten 2026-06-14. Drives **Phase 2 + 3** of
> `plans/21-frontend-architecture-conformance.md` (APPROVED). Assumes ZERO memory of the planning session.
> **PREREQUISITE: Prompt 1 (`plans/21-frontend-architecture-conformance-prompt.md`) must be done first** —
> the Tailwind v4 + shadcn foundation must already be in place and committed. If the website doesn't yet run
> Tailwind / have shadcn initialized, STOP and run Prompt 1 first.

## Mission
The website is now on the proper Tailwind + shadcn foundation but still wears the old plain styling. **Author
every page to match the `direction-a` mock** (`docs/design/mockups/direction-a-baania-clean.html`, "Baania-
clean" trust-blue Thai portal) using **Tailwind utilities / shadcn — replacing the inline-style objects as you
go** (the "no inline-style objects" end state is reached in THIS prompt). Match the mock's *styling and
treatment*; content stays driven by the real schema ("steal the styling, ignore the data").

## Step 0 — Rebuild context (read first, in order)
1. **`plans/21-frontend-architecture-conformance.md`** — THE plan (you are doing Phase 2 + 3). Authoritative.
2. **`docs/design/mockups/direction-a-baania-clean.html`** — the visual target. Phone-framed = match the
   *treatment* responsively (desktop grid + mobile), NOT an app-only layout. Component CSS ≈ lines 326–690
   (`.app-header`, `.search-box`, `.chip`/`.chip.active`/`.chip.soft-active`, `.listing-card`, `.card-photo`
   + `.card-photo-icon` gradient placeholder, `.deal-pill`, `.photo-count`, `.card-badges`/`.badge-*`,
   `.card-price-label`/`.card-price`, `.card-specs`+`.spec-dot`, `.card-location`, `.section-header`).
3. **`docs/design/mockups/README.md`** — "steal the styling, ignore the data."
4. `docs/design/design-direction.md` — founder taste brief (trust-blue, Sarabun body / Noto headings, dark mode).
5. `docs/research/00-product-principles.md` — heuristic register (`/alignment-review`). `docs/research/c1-frontend-stack-canon.md`
   — keep within canon (Tailwind utilities/shadcn; static = zero JS, TECH-01; don't SPA-ify, AP-1).
6. `plans/20-frontend-visual-e2e-testing.md` + `.claude/skills/frontend-review/SKILL.md` — the gate
   (mode A invariants + mode B design-vs-direction; deployed mode after deploy).

### Facts already established (don't re-investigate)
- Foundation is in place (Prompt 1): Tailwind v4 runs, shared `@theme` is the token source, shadcn is owned
  code, oklch/old-Android fallback intact. You now have hover/focus/responsive/pseudo states available.
- **Cards live in shared `@line-robot/ui`** (`ListingCard`, `CardGrid` in `Layout.tsx`, `EmptyState` in
  `States.tsx`, `Badge`, `PriceDisplay`, `StatusBadge`, `toCardView`) — authoring them serves the Stage-5
  mini-app too. Verify in the REAL website artifact, not the `ui` Tailwind gallery (the gallery masked the
  original bug).
- Content/island/i18n/JSON-LD all conform — change STYLING only, not data/fields/sections.

## Scope — implement the mock across ALL pages
Pages: **home/browse (th + en), detail (th + en), empty / zero-result, 404**, plus the shared `@line-robot/ui`
components. Five passes, highest leverage first:
1. **Shared cards (`packages/ui`)** — gradient + camera-icon photo placeholder (kills blank cards), deal-pill
   overlay (ขาย / ให้เช่า), price-label + bold price hierarchy, spec dots, **hover lift**, designed `EmptyState`.
2. **Website chrome (`Base.astro`, `HomePage.astro`)** — sticky trust-blue app-header + brand wordmark + search;
   results bar (count + sort) + section header with accent underline; footer polish.
3. **Filter bar (`FilterBar.tsx`)** — chip treatment (active fill / soft-active), dividers, mobile horizontal scroll.
4. **Detail (`DetailPage.astro`)** — photo-count overlay, refined spec table, stronger price hierarchy, yield
   where data exists.
5. **Empty / zero-result + 404** to the mock's register.

## Development loop (per pass)
1. **Render target + current state.** Serve the mock over http (`file://` blocked): `cd docs/design/mockups &&
   python3 -m http.server 8799 &`, screenshot `http://localhost:8799/direction-a-baania-clean.html`. Also shoot
   the current build. (Our own app: headless localhost is fine; the "always headed" rule is for external sites.)
2. **Author the pass in Tailwind utilities / shadcn** — replacing the inline-style objects. Tokens only (no raw
   hex/px); proper hover/focus/responsive states.
3. **Free gates (every change):** `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e -w
   @line-robot/website`. Mode-A invariants stay green.
4. **Visual gate — `/frontend-review` (local):** mode A (hard invariants) + mode B (gallery → fresh `Explore`
   sub-agent judges vs `direction-a` + heuristics + taste brief, surfacing divergences as **open questions for
   the founder, not self-adjudicated**). **Iterate this pass until the design review reads "aligned" and the
   founder agrees.**
5. **Per-increment review:** `/increment-review` + `/alignment-review`; architecture-conformance check (no
   inline-style objects left in the touched files, one `@theme`, islands minimal). Address findings.
6. **Commit** (conventional + numbered). Update `BACKLOG.md` / `SPRINT-LOG.md`. Next pass.

## After all passes (Phase 3)
- **Deploy to staging** (Pulumi, per CLAUDE.md: passphrase from `~/.line-robot-pulumi-passphrase`, `npm run
  build`, `cd infra && pulumi up`).
- **Verify on real infra:** `E2E_BASE_URL=https://d15dpmhcgtrf1r.cloudfront.net npm run test:e2e:deployed -w
  @line-robot/website` + a mode-B deployed design review.
- **Founder blesses = design lock-in** → re-enable pixel-regression baselines (deferred during flux).
- **Re-gate Stage 4** (CONDITIONAL-PASS → PASS); update `deploy-status` memory; **add the component-authoring
  heuristic** ("utilities/shadcn, never inline-style objects") to `c1` + the register.
- **Amend `plans/19-v2-marketplace-rebuild/stage-5-miniapp-rebuild.md`**: bind `direction-a` + `/frontend-review`
  as its visual gate; note it inherits the conformant `packages/ui`.

## Guardrails (hard rules)
- **Style only.** Never change content, fields, sections, copy, or data — schema-driven. A field the mock shows
  that we don't (or vice-versa) is NOT in scope.
- **Tailwind utilities / shadcn only** — no inline-style objects, no raw hex/px, one `@theme` (AP-3).
- **Stay responsive** (desktop grid + mobile); don't ship a mobile-only app layout; don't SPA-ify (AP-1);
  static = zero JS (TECH-01).
- **NPA/distressed stays calm violet** (founder ruling). Surface mock↔render divergences to the founder; never
  auto-"fix" to red.
- **Keep mode-A invariants green every step**; keep the oklch/old-Android fallback intact.
- **No pixel baselines during flux** — re-enable only at Phase 3 lock-in. Don't clobber the plan-20 harness.
- Anti-over-engineering (CLAUDE.md): no abstraction for a single caller; code a human reads without a guide.

## Done criteria
- Every page reads like `direction-a` (founder-confirmed via mode B), th/en × light/dark × mobile/desktop; no
  inline-style objects remain. Free gates + `/increment-review` + `/alignment-review` + `/frontend-review`
  passed/surfaced.
- Deployed + verified (deployed mode); Stage 4 re-gated PASS; pixel baselines re-enabled; c1 + register +
  Stage 5 spec updated.

## Key paths & commands
- Website: `packages/website/src/{layouts/Base.astro, components/{HomePage,DetailPage,FilterBar,BrowseResults}.*, pages/404.astro}`
- Shared UI: `packages/ui/src/components/{ListingCard,Layout,States,Badge,PriceDisplay,StatusBadge}.tsx`,
  `packages/ui/src/view/toCardView.ts`, `packages/ui/theme.css`
- Visual target: `docs/design/mockups/direction-a-baania-clean.html` (serve over http) · `docs/design/mockups/README.md`
- Plan: `plans/21-frontend-architecture-conformance.md` · Prompt 1 (prerequisite): `plans/21-frontend-architecture-conformance-prompt.md`
- Gates: `/frontend-review` (local + deployed), `/increment-review`, `/alignment-review`; `npm run test:e2e -w @line-robot/website`
- Live URL: `https://d15dpmhcgtrf1r.cloudfront.net/`
