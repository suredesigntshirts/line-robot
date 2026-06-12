# Stage 7 — AVM & Market Data

**Spec status: SKELETON.** This document is fleshed into a full spec, iterated with the user, and approved before any code for this stage is written. (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

## Purpose

Adds the automated valuation model (AVM) and public market-data pipeline, completing the product vision's sixth point. Ingests land-office public sales data, combines it with the platform's own listing corpus and broker quotes (from Stage 6), and produces comparable-based market price estimates and time-to-sell projections at various price points. The AVM enriches both the public website listing detail pages and the quick-sale matching logic introduced in Stage 6. Corresponds to master plan §2 point 6 and D17.

## Scope

**In:**
- Land-office sales data ingestion pipeline: fetch/download public dump files, parse, normalize, store in the `market_data` Postgres table (placeholder schema from Stage 1, fully populated here)
- Comparable selection logic: given a subject property, select comparable recent sales from the corpus (own listing history + land-office data) based on location (PostGIS), property type, deed type, and size
- LLM-based comparable analysis: send selected comparables to the LLM for narrative comparable analysis and price-range estimate; result stored per-listing
- Time-to-sell estimate: at various price points relative to the estimate, compute projected time-to-sell (regression over own corpus + land-office data)
- Broker quote integration: quotes collected in Stage 6 are fed into the model as additional signals; quote ingestion into the AVM is defined and wired here
- Market price estimate display: listing detail page on the website and mini-app shows the estimate (range + confidence indicator) once sufficient data exists; fallback message when data is insufficient
- Quick-sale matching refinement: Stage 6's matching uses AVM price estimates to score relevance (upgrade to the matching criteria defined in Stage 6)
- Scheduled pipeline: land-office data refresh on a configurable cadence (monthly/quarterly, depending on source)

**Out (explicitly):**
- Any product features not AVM-related (all built in prior stages)
- Manual land-office data acquisition steps beyond what can be automated (these become documented one-time operational procedures)
- Public API for AVM data (not planned; AVM outputs are internal to the platform for now)

## Key deliverables

1. Land-office data ingestion script: download, parse, normalize, upsert into `market_data` table
2. Scheduled Lambda (or Step Function) for periodic land-office data refresh; wired via Pulumi
3. Comparable selection query (PostGIS + Postgres; tunable radius, type filter, recency window)
4. LLM comparable analysis prompt + structured output (price range, confidence, supporting comps list)
5. Time-to-sell regression model or heuristic (defined in fleshed spec based on corpus analysis)
6. AVM result stored per-listing in Postgres (estimate range, confidence, comparable IDs, generated-at timestamp)
7. Estimate display component in `packages/ui` (range + confidence badge + "based on N comparables" note)
8. Website listing detail page updated to show estimate (or "insufficient data" placeholder)
9. Mini-app listing detail updated to show estimate
10. Quick-sale matching in Stage 6 updated to use AVM price delta as a relevance signal
11. Broker quote → AVM signal pipeline wired

## Dependencies

- Stage 1 must be complete: `market_data` table schema must exist (placeholder in Stage 1; populated here)
- Stage 6 must be complete: broker quotes (the Stage 6 quick-quote flow) are an AVM input signal; quick-sale matching refinement builds on Stage 6's matching logic
- Stage 4 must be complete: website listing detail page is the primary AVM display surface
- Stage 5 must be complete: mini-app listing detail is the secondary display surface
- Land-office data source: public Thai land-office sales dump must be identified, access confirmed, and format documented before this stage can be fleshed — this is a known external dependency (master plan §8)

## Acceptance criteria (sketch)

- Land-office ingestion script runs end-to-end against a real or sample dump without error; `market_data` table is populated with parseable rows
- Given a listing with a known market location and type, the comparable selection query returns at least one comparable from the corpus (seeded data or land-office data)
- AVM estimate is generated and stored for at least one listing in the staging environment
- Listing detail page on the website displays the estimate range and confidence; "insufficient data" fallback displays when no comparables exist
- Time-to-sell estimate is displayed at two price points (e.g., estimated market price and 10% below)
- Scheduled refresh Lambda invokes on the configured cadence and does not fail on a re-run (idempotent upsert)
- Quick-sale matching in Stage 6 updated: a quick-sale listing at a price significantly below AVM estimate scores higher in matching than one at market price

## Open questions (resolve when fleshing this spec)

- **Land-office data source format and cadence**: where exactly is the public Thai land-office (กรมที่ดิน) sales data published? Is it a downloadable bulk file, an API, or scraped from a web portal? What format (CSV, Excel, XML)? How frequently is it updated? This must be answered before the ingestion pipeline can be designed — it is the foundational unknown for Stage 7
- **Land-office data licensing**: is there any use restriction on the public sales data for commercial marketplace use? Confirm before building a system that stores and serves it
- **Minimum corpus before showing estimates**: what is the minimum number of comparables required before showing an estimate rather than "insufficient data"? Too low → misleading estimates; too high → no estimates for a long time. Proposed threshold to be defined at flesh-out
- **Estimate presentation (ranges vs point estimates, confidence display)**: the master plan notes "ranges/confidence" — what does the UI show? A price range (low/high), a single midpoint, a confidence percentage, a star rating? Must be defined with user input
- **LLM comparable analysis cost and caching**: sending N comparables per listing to the LLM at estimate time — what is the per-estimate cost and how frequently is it refreshed? Can prompt caching apply to the system prompt? Is this viable at scale or should it be batch-only?
- **Time-to-sell model**: the master plan mentions "regression over own corpus + land-office data" — at early stage, the own corpus will be small. Is the time-to-sell estimate displayed from day one with wide confidence intervals, or deferred until the corpus reaches a minimum size? Who defines the regression method (statistical, ML, rule-based heuristic)?
- **Broker quote weighting**: how much weight do broker quotes get relative to land-office sales comparables? Quotes are expert opinions but may be strategically skewed; a credibility model may be needed

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), Playwright smoke (if user-facing), docs updated.

Stage-7-specific review notes:
- Playwright smoke covers: listing detail page on the website shows an AVM estimate for a seeded listing; "insufficient data" message appears for a listing with no comparables
- The correctness reviewer scrutinizes the comparable selection query for PostGIS correctness (correct SRID, correct radius units) and the upsert logic for idempotency (re-running the ingestion on the same dump must not create duplicate rows)
- The simplicity critic challenges the LLM comparable analysis: if a statistical model on the corpus produces adequate estimates, an LLM call per estimate may be unnecessary cost and latency — evaluate the simple approach first before committing to LLM-based analysis
- Stage gate is the final stage gate for the v2 rebuild; architecture-conformance check covers the full codebase; eval scorecard check confirms pipeline quality has not regressed during Stages 3–7

## Iteration log

| Date | What changed | Why |
|---|---|---|
| (empty — filled during flesh-out and build) |
