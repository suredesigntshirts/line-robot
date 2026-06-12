# 00 — Product Principles & Heuristic Register

**Status: DRAFT — pending founder review.** Synthesized 2026-06-12 by the orchestrator from the 10 research artifacts in this directory (each researched → adversarially critiqued → revised; see each artifact's "Review response" section for the audit trail). After founder review and iteration, this document freezes and becomes the register the `/alignment-review` skill loads.

**How to use:** Reviewers judging a screen, flow, copy, schema, or pipeline change load §4 (the register), pick the contexts that apply, and verify each heuristic by ID — pass / violation / not-applicable. Full rationale and citations live in the source artifact for each prefix. §3 lists conflicts that need founder decisions before the affected stage is fleshed. §5 is the field-validation backlog.

---

## 1. Product principles (cross-cutting)

These emerged independently across multiple artifacts; they outrank individual heuristics.

- **P1 — LINE is the rail, not a channel.** 85%+ of Thai internet users are on LINE; every Thai portal's contact hierarchy is LINE → phone → (never) email form; broker dealflow already lives in LINE groups. Auth, contact, alerts, and dealflow all default to LINE. *(A1, A5, B1, B2)*
- **P2 — Provenance is the moat.** Every Thai portal's #1 complaint cluster is fake/duplicate/stale listings and agents masquerading as owners. We uniquely know the source group, the poster's identity, and the opt-in record at ingest time. Never strip provenance; surface it (owner/agent badge, freshness stamp, verification badge, dedup gate). *(A1, A5, B2)*
- **P3 — Thai-unit and Thai-language precision signals competence.** Rai/ngan/tarang-wah triples, correct deed-type enums with transfer-restriction warnings, looped Thai body type, ICU line-breaking, canonical romanization. Getting these wrong marks the product as foreign-built. *(A4, B1, B3)*
- **P4 — Honesty-by-default beats polish.** Prices are "asking / ราคาเสนอขาย", fee math is an editable labeled estimate, flood/smoke-season risk is disclosed (seller-attributed), Treasury appraisals never masquerade as market value, render photos are labeled. Portals suppress these; we differentiate by not suppressing. *(A1, A2, A4, B2)*
- **P5 — Capture the primary channel, publish to the secondary.** Brokers' real dealflow is group chat; portals are secondary marketing. We ingest where the work already happens (zero workflow change, zero listing fee vs DDproperty's ฿10k–260k/yr) and give back a shareable public SEO URL. *(A5)*
- **P6 — Privacy-by-default + opt-in publish has no Thai analog.** It is our structural differentiator AND our PDPA compliance story — the same mechanic serves both. Never weaken it for growth. *(A5, A6)*
- **P7 — Progressive disclosure with deliberate exceptions.** Above the fold: hero, price, key specs, location, LINE CTA. Everything else collapses — except the title-deed/chanote section, which stays expanded for trust. *(B2; matches the existing v1 UI decision)*
- **P8 — Distressed supply is a structural tailwind, handled with care.** Foreclosures at multi-decade highs through 2026; urgency signals (ขายด่วน) are the highest-conversion investor signals — but NPA/auction listings carry mandatory risk caveats, and discount expectations differ by channel. *(A3)*

## 2. Findings that most shape the product

1. **The 7-day exclusivity window may be our invention.** Neither A1 nor A5 found evidence of a time-based "poster owns it for N days" social norm in Thai broker groups. The mechanic may still be *good* — but it's an innovation to validate, not a digitization of existing etiquette. The single most load-bearing unvalidated assumption (§5.1).
2. **Co-agency ("รับโค", 50/50 or 60/40 splits) is the cooperation primitive** — and its #1 documented failure is verbal, unenforced splits. A recorded both-parties-acknowledged split is a real wedge (DEAL-05/06).
3. **Dedup must key on deed number / geo / image hash, not text** — open mandates mean the same property circulates via many agents at different prices; text-matching alone fails (DEAL-09, COMP-07, CONV-15).
4. **Five deed types cannot legally be sold** (ส.ป.ก., ภ.บ.ท.5, น.ส.2, ส.ท.ก., ส.ค.1) yet circulate in broker chats — the quality gate must hard-block sale listings on them (FIELD-03).
5. **Chiang Mai is a severe buyer's market** (66% launch collapse, 57-month absorption) with rentals growing as mortgages contract (70% rejection sub-฿3M) — rental and distressed flows matter as much as sale at launch (A2, A3).
6. **Buyers expect double-digit negotiation** (Pantip targets 25–27% off asking; sellers pad "เผื่อต่อ") — price framing must never imply finality (CONV-09).
7. **Demanded-by-survey search facets**: new-vs-resale (80%), pet-friendly (53%), NPA (51%), furnishing (75–80% of renters need furnished) — these are schema fields, not tags (COMP-05/06, MKT-02).
8. **LED open data (CKAN API) is the only legally clean distressed-data pipeline**; bank-NPA scraping is prohibited by ToS — partnership or manual curation only (DIST-07/08).
9. **PDPA enforcement is live** (฿21.5M fines 2025, proactive monitoring); the bot's group-join disclosure and opt-in record are compliance load-bearing, not nice-to-have (LEGAL-01..13).
10. **District-level granularity is mandatory** — Chiang Mai condo prices span 8× by neighborhood; province-level data is useless for search or AVM (MKT-04).

## 3. Decision flags — RULED by founder 2026-06-12 (DF-2 pending spike)

Research that contradicted or extended settled decisions (D1–D25), with the founder's rulings.

| # | Flag | Affects | **Ruling** |
|---|---|---|---|
| DF-1 | **Exclusivity window (D8) is unvalidated** — possibly our invention, not a Thai norm. | Stage 6 | **RULED: keep the mechanic; validate with §5.1 questions in real groups *before* Stage 6 flesh-out; window length/semantics group-configurable from day one.** |
| DF-2 | **`astro-sst` (TECH-12) vs D3 "all-AWS via Pulumi"** — not a hard conflict, but a one-deploy-story vs two-tools tradeoff. | Stage 4 | **RULED (by live spike, 2026-06-12): Pulumi-wired, no SST.** A ~140-line Lambda shim over the official `@astrojs/node` adapter deploys via our own Pulumi (Astro 6.4.6 / node adapter 10.1.4 / nodejs22.x arm64); local + AWS deploy proofs passed. Caveats for Stage 4: an account guardrail blocks public Function URLs → CloudFront must front the Lambda (planned anyway); bundling requires the `dist-lambda/server/index.mjs` + sibling `client/` layout. Evidence + reference code: `spikes/astro-ssr-pulumi/FINDINGS.md`. **TECH-12 is superseded accordingly.** |
| DF-3 | **Default locale**: TH-14 says Thai-default; TECH-04 deferred URL `defaultLocale`. | Stages 3–4 | **RULED: `defaultLocale: th`** (Thai clean URLs, `/en/` prefix, Accept-Language soft redirect on first visit). |
| DF-4 | **Listing lifecycle (D13) refined** by DEAL-01/02. | Stage 1 schema | **RULED: adopt the Thai 3-stage close** — `saleStage` {available, reserved, under_contract, transferred}; no auto-release while reserved; rentals keep a simpler lifecycle. |
| DF-5 | **External data ingestion (D17) constraints** (DIST-07/08, MKT-07). | Stage 7 | **RULED: LED CKAN first; pipelines must be PLUGGABLE; seed-scale ingestion only at start (enough to verify the pipeline works, not bulk).** Light-touch collection where data is openly/easily accessible; bank-NPA portals stay no-scrape (ToS) — partnership or manual curation; check Baania licensing before AVM dependence. |
| DF-6 | **Photo floor enforcement mode** (CONV-01). | Stage 2 gate | **RULED: nudge-and-iterate** — the bot keeps asking the poster for missing important fields AND photos until the quality gate is satisfied; no hard photo-count block. Generalizes CONV-01 into an iterative listing-completion loop (applies to all gate-relevant fields, not photos alone). |
| DF-7 | **Fee/commission math display** (DEAL-03/04/14). | Stages 4–6 | **RULED: build the schema fields in Stage 1; gate the user-facing display behind §5.11 broker validation.** |
| DF-8 | **Burmese (မြန်မာ)** as a future language. | Backlog | **RULED: don't plan for it.** Revisit only if Myanmar-buyer traffic shows up in analytics; D14's design-for-N keeps the door open at zero cost. |

## 4. Heuristic register

134 heuristics across 10 artifacts. Grouped by **review context** — a reviewer loads the contexts their diff touches. One-line gists only; the source artifact (by prefix) is authoritative. **Canonical merges** below resolve cross-artifact duplicates: cite the canonical ID.

### Canonical merges (one rule, many sightings)
- **LINE-first contact CTA** → canonical **CONV-06** (≡ DEAL-08, TH-02, COMP-01): LINE chat primary, phone secondary, email form never primary.
- **Dedup keys on deed/geo/image, never text alone** → canonical **DEAL-09** (≡ COMP-07, CONV-15).
- **Listing freshness visible + auto-expiry** → canonical **CONV-11** (≡ COMP-03, MKT-05).
- **Owner-direct ("เจ้าของขายเอง") provenance badge, neutral not ranked** → canonical **COPY-10** (≡ COMP-02, DEAL-10).
- **Foreign-eligibility surfaced per listing** → canonical **FIELD-05** (≡ MKT-08, DEAL-12).
- **Furnishing = 3-tier enum + notes, required for rentals** → canonical **FIELD-12** (≡ MKT-02, COMP-11).
- **Asking-price framing, never final** → canonical **CONV-09** (≡ MKT-01 display rule, COPY-11 badge).

### Context: Schema & data model (Stage 1 review)
DEAL-01 saleStage enum mirrors Thai close · DEAL-07 listingMandate + exclusivityExpiresAt, group-exclusive default · DEAL-09 ★dedup keys · DEAL-10 postedByRole, owner-direct first-class · DEAL-11 rental deposit/advance/minLease + cash-up-front · DEAL-12 tenure {freehold, leasehold}+leaseYears+foreign flags · DEAL-14 commission defaults 3% sale / 1-month rent, editable · MKT-01 total-THB price primary, per-sqm derived · MKT-04 province+amphoe+tambon separate fields · MKT-11 listing_type incl. foreclosure/short_sale · MKT-13 Burmese in l10n backlog · DIST-03 urgency_indicator from ขายด่วน etc. · DIST-06 khai_fak transaction type + redemption period · FIELD-01 land = rai/ngan/wah triple + computed sqm · FIELD-02 deed type validated enum, unknown blocks publish · FIELD-04 condo CAM fee + sinking fund for completeness · FIELD-05 ★foreign quota per-unit · FIELD-09 built-space sqm only, never Thai land units · FIELD-10 price-per-area computed never entered, correct basis · FIELD-12 ★furnishing enum+notes · FIELD-13 location fields never concatenated · LEGAL-02 publishConsentTimestamp/Version never null on public · LEGAL-10 deletionRequestedAt + auto-unpublish · CONV-02 heroPhotoIndex, exterior default · CONV-11 ★freshness + expiry

### Context: Extraction pipeline & quality gate (Stage 2 review)
FIELD-03 hard-block sale on 5 non-transferable deed types · FIELD-11 map seller assertions to enums, never re-judge · COPY-01 headline formula [verb][type][location][1 differentiator] · COPY-05 ขายด่วน → boolean badge, stripped from title · COPY-12 no emoji in title/price/area fields · DIST-03 urgency extraction · CONV-13 reject third-party watermarks/AI-fakery · CONV-15 dup re-post with different contact/price caught pre-publish · CONV-01 photo floor (warn+nudge mode until DF-6 resolves) · LEGAL-06 extractionSource auto|poster_confirmed flag

### Context: Listing card & detail UI (Stages 3–5 review)
CONV-04 above-fold = hero/price/specs/pin/CTA only · CONV-05 accordions; chanote section stays expanded · CONV-06 ★LINE CTA · CONV-03 thumbnail strips with count, never dots-only · CONV-09 ★asking-price framing + negotiable flag · TH-03 human trust signal on every card · TH-04 our verification badge (no DBD dependency) · TH-05 renders labeled · COPY-04 deed-type badge + restricted-transfer warning · COPY-06 land area Thai-units-first display, zero-units suppressed · COPY-10 ★owner-direct badge · COPY-11 ต่อรองได้ canonical negotiable badge · DIST-01 NPA/auction source labels · DIST-02 LED listings: 3 visible risk caveats · LEGAL-06 "poster-provided, verify independently" visible on cards · LEGAL-07 foreign-ownership legal disclaimer, non-dismissible · MKT-03 rentals monthly-rate framing · MKT-09 nomad/expat cards lead with neighborhood lifestyle · MKT-10 smoke-season honesty

### Context: Search & discovery (Stage 4 review)
COMP-05 NPA + pet-friendly filters exist · COMP-06 new-vs-resale first-class filter · CONV-08 list-first MVP, map fast-follow (lat/lng on schema regardless) · MKT-04 district-level filtering · MKT-12 ฿3–5M tier default-sort attention · TH-10 Thai compound-phrase SEO slugs/H1 · COMP-04 public SEO-indexed listing URL, no login wall

### Context: Typography, i18n & copy (Stages 3–5 review)
TH-06 looped Thai face for body text · TH-07 Thai line-height ≥1.6 · TH-08 lang="th" + ICU breaking, never break-all · TH-13 loopless allowed for headings only · TH-14 Thai default for Thai users (see DF-3) · COPY-02 buttons = bare verbs, no particles (grep i18n catalog) · COPY-03 +20% width budget for Thai strings · COPY-07 errors = what+why+next, never vague · COPY-08 canonical romanization table for place names · COPY-09 description lead = price/sub-district/bedrooms · B3 glossary table = source of truth for ~30 core terms

### Context: Bot, consent & groups (Stages 2, 5, 6 review)
LEGAL-01 group-join disclosure (bilingual, 6 elements, before extraction) · LEGAL-03 /delete handled + logged · LEGAL-04 privacy notice with 9 PDPA items at stable URL · LEGAL-05 withdrawal via same channel, 90-day statutory / 30-day policy · LEGAL-08 named Data Contact · LEGAL-09 leave-event stops extraction same invocation · LEGAL-11 opt-out explicitly consequence-free · LEGAL-12 Singapore-hosting disclosure · LEGAL-13 breach runbook (72h) · CONV-07 instant auto-ack on contact · CONV-12 publish requires authenticated identity + opt-in record · CONV-14 owner opt-in mandatory pre-public · DEAL-02 no auto-release while reserved/under-contract · DEAL-05 co-agent option with structured split · DEAL-06 split recorded as both-party acknowledgment · DEAL-13 quick-sale captures below-market signal, native labels

### Context: Dealflow & distressed (Stages 6–7 review)
DIST-04 quote flow shows discount-to-close tradeoff (curve TBD §5.7) · DIST-05 NPA referral routes to bank, lead-magnet not revenue · DIST-07 LED CKAN = first data pipeline · DIST-08 no NPA scraping; partnership/manual only · DIST-09 NPA source filter; native ingest preferred over link-out · DIST-10 discount expectations per channel, never conflated · DIST-11 seller-urgency 3-tier selector · DIST-12 NPA-specialist broker archetype/badge · MKT-06 Treasury appraisal never shown as market value · MKT-07 AVM v1 = Baania API + Treasury CSV + asking trends (licensing check, DF-5)

### Context: Architecture & frontend (Stages 3–4 review)
TECH-01 static pages = zero client JS · TECH-02 islands only for browser APIs/mutations · TECH-03 server:defer for per-user content, shell CDN-cacheable · TECH-04 hreflang via getAbsoluteLocaleUrl, locale default per DF-3 · TECH-05 RealEstateListing JSON-LD (no rich-result expectation) · TECH-06 tokens once in packages/ui theme.css; OKLCH needs RGB fallback (Thai Android) · TECH-07 shadcn owned code, diff in CI, override via tokens only · TECH-08 no React context across islands · TECH-09 TanStack Query only for optimistic mutations · TECH-10 nodejs22.x pinned · TECH-11 transition:persist on filter panel · TECH-12 adapter choice (see DF-2) · TECH-13 JSON-LD server-rendered, never an island · TH-09 mobile-first, all flows at 360–390px · TH-11 clean cards on landing; density OK on results/detail · TH-12 brand = trust-blue/green family (mood-board input) · COMP-14 mobile-first non-negotiable

## 5. Assumption register — validate in your LINE groups

Prioritized; each maps to the heuristics it confirms or kills. Full question phrasing in each artifact's "Ask the market" section.

1. **Does any time-based posting-exclusivity norm exist in real groups?** (existential for D8/DEAL-07/COMP-15 — see DF-1)
2. **Photo-count median in real Chiang Mai group posts** (sets CONV-01 block vs warn — DF-6)
3. **Co-agent splits: how agreed/enforced today; who's been burned** (DEAL-05/06 design)
4. **Poaching etiquette: what happens socially; group removal?** (trust/penalty design)
5. **Default locale + Thai-slug vs opaque listing URLs** (DF-3, TECH-04, C1-Q3)
6. **Quick-sale demand: do investors want owner-submitted distressed deals, or is bank NPA enough?** (de-risks Stage 6/7 scope)
7. **Discount-to-close curve: actual %-off vs weeks-to-close datapoints** (DIST-04/10 calibration)
8. **Beta users' Android/LINE WebView vintage** (TECH-06 OKLCH fallback, C1-Q5 view transitions)
9. **Staleness tolerance: when is a listing "old" — 7/30/90 days?** (CONV-11 expiry N)
10. **PDPA welcome-message reaction: normal, bureaucratic, or alarming?** (LEGAL-01 copy tone, A6-Q2)
11. **Fee/commission math: do brokers want it shown or kept vague?** (DF-7)
12. **Verified-badge appetite: do vetted brokers want visibility?** (TH-04 prominence)
13. **Portal-vs-group closings split for real brokers** (validates P5 positioning)
14. **Watermark norm: do brokers expect their branding on photos?** (CONV-13 carve-out)
15. **Looped vs loopless readability quick A/B with 5–10 brokers** (TH-06)

## 6. Maintenance

- Artifacts freeze after founder review; substantive market changes get appended dated addenda, not silent edits.
- New heuristics enter via the same pipeline (research → critique → revise) or directly from validated §5 answers; this register is regenerated when source artifacts change.
- `/alignment-review` (Stage 0) loads this file; the repo `CLAUDE.md` points here.
- Known weakest evidence (carried from artifact Confidence sections): in-group etiquette (A1), nomad counts/yields (A2), discount-to-close timing (A3), CNX-specific CAM fees (A4), DDproperty CTA order (A5, Cloudflare-blocked), auth-abandonment ranking (B1), map-vs-list split (B2), particle rule single-source (B3), astro-sst+Astro-6 compat untested (C1). Treat these as defaults-to-test, not facts.
