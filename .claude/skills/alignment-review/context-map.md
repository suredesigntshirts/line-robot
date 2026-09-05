# Context map — changed surface → register context groups

The register (`handbook/research/00-product-principles.md` §4) groups its heuristics into eight contexts. Pick every group a surface touches; when in doubt, include it (an n-a verdict is cheap; a skipped violation is not). **The register's own §4 headings are the authority for which IDs belong to each group** — this map deliberately does not duplicate the ID lists (a hand-maintained mirror drifts; the first audit of this file already caught misassignments).

| Context group (register §4 heading) | Typical surfaces |
|---|---|
| **Schema & data model** | migrations, drizzle schema, domain types/enums, repository contracts, DTOs |
| **Extraction pipeline & quality gate** | pipeline steps, prompts, step schemas, gate logic, dedup, derivatives |
| **Listing card & detail UI** | ListingCard, Detail screens, galleries, badges, CTA bars, price display |
| **Search & discovery** | search UI, filters, facets, SEO routes/slugs, sitemaps, list/map views |
| **Typography, i18n & copy** | fonts, type scale, i18n catalogs, any user-facing string, romanization |
| **Bot, consent & groups** | bot messages, group-join flow, opt-in/publish, DM loops, co-agent flow |
| **Dealflow & distressed** | quick-sale flows, quotes, NPA/auction display, AVM display, market-data ingestion |
| **Architecture & frontend** | Astro pages/islands, hydration, tokens/theme.css, shadcn usage, state, structured data |

Surface heuristics that always apply when their artifact type appears anywhere in the diff:
- Any Thai-visible text → **Typography, i18n & copy**.
- Any new/changed table or enum → **Schema & data model**.
- Any prompt or LLM schema → **Extraction pipeline & quality gate**.
- Any public page → **Search & discovery** (SEO rules) + **Architecture & frontend**.

**Verified 2026-06-14 (plan 21, the direction-a frontend rebuild):** every design surface touched —
shared listing cards, the website chrome (header/search/section/footer), filter chips, the detail page,
and the empty/404 states — routed cleanly to the EXISTING groups (Listing card & detail UI; Search &
discovery; Typography, i18n & copy; Architecture & frontend). The NPA/distressed TREATMENT on a card or
detail is judged via DIST-01/02 inside **Listing card & detail UI** (the **Dealflow & distressed** group
is for the Stage-6/7 quote/AVM/market-data flows, not card display). No group was missing; no edit needed.
