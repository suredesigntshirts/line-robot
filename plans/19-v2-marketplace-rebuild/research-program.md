# Pre-build Research Program

**Status: APPROVED scope, not yet started.** Runs before/alongside Stage 0; the capstone gates the Stage 1 flesh-out (schema) and Stage 3 (design language). Settled with the user 2026-06-12.

## Purpose

Front-load the Thai-market, user-psychology, and technology knowledge that Stages 1/3/4/6/7 would otherwise guess at — encoded as **falsifiable heuristics** that review agents check mechanically, not as reading material. Desk research de-risks direction; true PMF signal comes from the user's real LINE groups, so every artifact also surfaces "what desk research cannot answer — ask the market."

## Artifacts (→ `docs/research/`)

| ID | Artifact | Gates | Researcher |
|---|---|---|---|
| A1 | Thai RE transaction mechanics & broker culture (incl. LINE-group dealflow etiquette, co-agency, commissions, transfer process) | Quick-sale flow, group/exclusivity mechanics, trust design | Opus |
| A2 | Market landscape, Northern lens (segments, CNX supply/demand, rentals, price-data sources) | AVM expectations, search facets, launch content | Sonnet-high |
| A3 | Distressed assets: bank NPAs, LED auctions, investor sourcing, discount norms | Quick-sale/quote product; Stage 7 data sources | Sonnet-high |
| A4 | Listing field canon (field matrix across Thai sites + land-office data: rai/ngan/wah, title types, foreign quota, fees, flood history, orientation, zoning…) | **Stage 1 schema** — highest-ROI artifact | Sonnet-high |
| A5 | Competitor teardown (DDproperty, LivingInsider, FazWaz, Baania, Kaidee, Hipflat + FB/LINE groups as real incumbent) — **live browsing required**: screenshots + real field extraction via browser tooling; Thai-language review mining | Positioning, UX decisions, mood-board input | Sonnet-high + browser |
| A6 | Legal & regulatory — **scoped down**: we are testing with a small user group and will disclose; deliverable now = short disclosure/consent checklist for the test phase + parked register of full PDPA/compliance work for later | Bot join/consent messaging; later compliance backlog | Sonnet-high |
| B1 | Thai web behavior & design patterns 2026 (mobile/LINE-centricity, login prefs, trust signals, density, Thai typography incl. line-breaking, Thai SEO) | Stage 3 design system, Stage 4 auth/SEO | Opus |
| B2 | RE browsing psychology & conversion (photo-first, map/list, price psychology, contact friction, progressive disclosure, lead capture) | Stage 3–5 flows, conversion heuristics | Opus |
| B3 | Bilingual copy canon (Thai tone/register for a marketplace, listing language, CTA phrasing, microcopy, Thai/English layout implications) | All Stage 3 i18n strings | Sonnet-high |
| C1 | Frontend stack canon — Astro 6 / Tailwind / shadcn / React islands patterns. **Hard requirement: verify actual live versions at research time and cache version-matched docs via documentation-downloader.** Dev follows within ~a week → no refresh checkpoint needed | Stages 3–4 code patterns | Sonnet-high |
| 00 | **Capstone: `docs/research/00-product-principles.md`** — cross-cutting principles; consolidated heuristic register (deduped, ~40–60 numbered rules with IDs by domain: TH-, CONV-, COPY-, FIELD-, TECH-…); assumption/risk register; **explicit flags where findings contradict settled decisions D1–D25** for user re-decision | Everything; loaded by /alignment-review | **Fable (orchestrator), not a sub-agent** |

## Rules for every artifact

1. **Gates a named decision** — research questions that change nothing in plan 19 are cut from the brief.
2. **Thought-leader-first**: researcher identifies the 3–5 highest-signal voices in the domain (vetted from scratch; credibility justified by track record/depth/recency, not popularity), then distills. Critic re-judges source quality.
3. **Thai-language sources required** for Track A/B (Pantip, Thai app-store reviews, Thai UX/marketing writing) — English-only sourcing on Thai-user questions is rejected at review.
4. **Format contract**: Findings (cited, dated) → Implications for us (mapped to plan-19 stages/decisions) → **Heuristics** (numbered, falsifiable) → Anti-patterns → Verified vs plausible-but-unverified → "Ask the market" items → Sources.
5. **Honesty**: unverifiable cultural claims are labeled, not laundered into facts.

## Process

1. **Briefs** — orchestrator writes one brief per artifact (questions, gated decisions, format, sourcing rules).
2. **Research wave** — agents per the table above (two waves of ~5).
3. **Adversarial review** — one Opus critic per artifact, four lenses: alignment (product-specific, not generic?), evidence (real, current, Thai-sourced?), actionability (heuristics falsifiable?), contradictions (vs other artifacts and vs plan 19). Findings skeptic-verified; revision round by the original researcher.
4. **Capstone synthesis** — orchestrator (Fable) writes 00-product-principles; decision conflicts surfaced to the user.
5. **User review & iteration** — artifacts freeze after approval.

## Integration with the quality system

- **Two-skill split (confirmed)**: `/increment-review` = code correctness/simplicity/spec (unchanged). **`/alignment-review` (new, also built in Stage 0)** = judges screens/flows/copy/schema against the heuristic register by ID (pass / violation / n-a). Runs on design-bearing increments and user-facing stage gates.
- Heuristic register referenced from repo `CLAUDE.md`; the register is the living interface between this research and every future review.

## Follow-on (separate effort, after these artifacts)

**Design mood board**: collect visual references (Thai RE sites from the A5 screenshots, modern Thai consumer apps, international benchmarks), extract type/density/color/card-anatomy patterns, produce a design-direction doc + candidate tokens feeding Stage 3. Deliberately after B1/B2/A5 so the board has criteria, not vibes.
