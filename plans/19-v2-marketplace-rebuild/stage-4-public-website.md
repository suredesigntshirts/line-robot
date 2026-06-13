# Stage 4 — Public Website

**Spec status: FLESHED (sprint-01 extension, 2026-06-13).** Approval basis: the founder's live
sprint-extension ruling ("work on the other stages until 8:30am … I approve this", charter
§Sprint extension). Open questions are resolved below with **defensible defaults** — every one is
cheap to reverse and is flagged for founder review in the morning. Items needing founder action
(domain D19, LINE console, OAuth verification, deploy) are parked, not guessed.

## Purpose

Delivers the first public-facing product milestone: an SEO-optimized Astro 6 SSR website on AWS Lambda + CloudFront where anonymous users can browse and search public listings, authenticated users can save and submit listings, and the platform is discoverable via search engines. This is the stage that makes the marketplace real to the public and to search engines — none of the prior stages were user-visible. Corresponds to master plan §2 points 3–4, D3, D5, D12, D14, D19, D20.

## Scope

**In:**
- `packages/website` — Astro 6 SSR using the AWS Lambda adapter; deployed behind CloudFront
- Browse page: paginated listing grid, filter/facet sidebar (using Stage 3 components)
- Search: Postgres FTS (full-text search) + PostGIS radius/bbox search; no OpenSearch
- Listing detail page: full field set, image gallery, map, contact/interest CTA
- SEO: `<meta>` tags, Open Graph, JSON-LD structured data (RealEstateListing schema), XML sitemaps, canonical URLs, Thai + English (hreflang)
- LINE Login authentication (primary — LIFF token not applicable here; use LINE Login web flow)
- Email/Google OAuth authentication (secondary auth methods)
- Account-linking UX: link a LINE identity to an email/Google account (schema landed in Stage 1; UX built here)
- Owner submission form: structured web form → pipeline extract → confirm in mini-app or on-site (D12 "both" path)
- Domain registration, Route 53 hosted zone, ACM certificate (manual step; blocks LINE Login config and public launch)
- Pulumi resources: Lambda@Edge or Lambda function URL for SSR, CloudFront distribution, Route 53 records, ACM cert

**Out (explicitly):**
- LIFF / mini-app surfaces (Stage 5)
- Group exclusivity or admin vetting screens (Stage 6)
- AVM price estimates on listing detail (Stage 7 — placeholder UI acceptable, showing "estimate coming soon")
- Claim/publish opt-in flow (Stage 5 — the website detail page can show a listing but claim is mini-app)
- LINE Login for the mini-app (Stage 5 — LIFF always uses LIFF token; website LINE Login is a different flow)

## Key deliverables

1. `packages/website` Astro 6 SSR project, monorepo-integrated, deploying via Pulumi
2. Browse page with filter/facet UI and pagination
3. Postgres FTS + PostGIS search endpoint (via `packages/api` or direct SSR server functions)
4. Listing detail page (SEO-optimized, structured data)
5. XML sitemap generation (auto-updating from Postgres)
6. LINE Login web OAuth flow (access token → user session → account record in Postgres)
7. Email + Google OAuth flow
8. Account-linking flow (LINE ↔ email/Google)
9. Owner submission form (Step 1 of D12 web path; hands off to pipeline)
10. Domain registered; Route 53 + ACM wired via Pulumi; LINE Login redirect URI configured in LINE console
11. CloudFront distribution with appropriate cache rules (static assets long-TTL; SSR pages short/no-cache or ISR)

## Dependencies

- Stage 1 must be complete: Postgres schema + `packages/db` required
- Stage 2 must be complete: listings must exist in Postgres (pipeline writes them); an empty DB makes the website meaningless
- Stage 3 must be complete: all browse/detail UI components come from `packages/ui`
- **Domain name must be decided** (D19 — TBD) before LINE Login redirect URIs can be registered and before public launch; this is the known late-stage manual blocker (master plan §8)
- LINE console: LINE Login channel configuration (redirect URI, consent screen) — manual step, requires domain
- AWS: ACM certificate validation (DNS validation via Route 53, can be partially automated via Pulumi)

## Acceptance criteria (sketch)

- Anonymous user can browse listings, filter by property type/price/location, and view listing detail on the public domain
- Google "Rich Results Test" returns valid RealEstateListing structured data on listing detail pages
- Sitemap URL returns valid XML; at least one listing URL is present
- LINE Login: tapping "Sign in with LINE" on the website completes the OAuth flow and creates/links a user record in Postgres
- Email/Google OAuth: same flow, same outcome
- Account-linking: a user signed in via LINE can link an email address; subsequent email login recognizes the same user record
- Owner submission form: submitting a listing routes it into the extraction pipeline; user receives confirmation
- Lighthouse performance score ≥ 85 on listing detail page (mobile, on a seeded dataset)
- Thai and English pages both render correctly; hreflang tags are present and point to each other
- Stage gate Playwright smoke: browse → filter → listing detail → LINE Login → save listing (happy path, Thai + English)

## Open questions — RESOLVED (sprint-01 extension defaults; founder review in the morning)

- **Domain name** (D19): **STAYS PARKED — founder decision.** The build is domain-agnostic behind
  one config value (`siteUrl`, Pulumi config; defaults to the CloudFront domain). Everything that
  hard-requires the domain (LINE Login redirect URI, ACM cert, CloudFront alias, public sitemap
  URL) is coded to read the config and listed as founder console/registration steps.
- **Session model → stateless signed cookie** (HMAC-signed payload `{userId, exp}` in an
  httpOnly/Secure/SameSite=Lax cookie; secret = Pulumi config secret). Rationale: Lambda SSR has
  no sticky state; a Postgres sessions table costs a DB round-trip per request and is a table only
  this feature reads (anti-over-eng rule 4); revocation isn't needed until an admin-ban flow
  exists (noted as the trigger to revisit). No third-party session lib (rule 5).
- ~~**Astro adapter specifics**~~ **RESOLVED by spike (DF-2, 2026-06-12)**: hand-rolled ~140-line Lambda shim over the official `@astrojs/node` adapter, deployed via our own Pulumi — no SST, no third-party deploy coupling. Working reference code + gotchas in `spikes/astro-ssr-pulumi/FINDINGS.md`. Two hard constraints for this stage: (a) CloudFront MUST front the Lambda — an account guardrail blocks public Function URLs (403 at edge); (b) esbuild output layout must be `dist-lambda/server/index.mjs` with a sibling `client/` dir (the Node adapter walks up from `import.meta.url` for a `server/` segment)
- **URL scheme → `/properties/{id}`** (stable opaque id; canonical). Matches the plan-17 LINE deep
  links and keeps sitemap/share/dedup trivial. Keyword slugs in the URL are a marginal SEO factor
  vs title/JSON-LD; revisit with real search-console data. A trailing slug segment, if ever added,
  301s to canonical.
- **Thai search → `pg_trgm` trigram matching** on title+description (GIN index), combined with the
  structured filters (type/price/province) that do most of the discriminating work, + PostGIS
  radius/bbox. No custom Thai dictionary tonight — the trigram approach is already proven in this
  repo by the dedup blocker (D2.6). Proper Thai FTS (e.g. a tokenizing dictionary) is a measured
  follow-up if trigram relevance disappoints on real data.
- **Submission handoff → async.** Form submit writes a pending submission + returns a "processing"
  confirmation; the pipeline picks it up on its existing sweep cadence (≤2 min). Sync would make
  the user wait through a 30s–2min LLM pipeline inside one Lambda invocation — bad UX and a
  timeout risk. The confirmation page auto-refreshes its status row.
- **Auth tonight → LINE Login web flow only, code-complete behind config** (channel id/secret =
  Pulumi config; redirect URI = `{siteUrl}/auth/line/callback`). **Email/Google OAuth parked** —
  Google requires app verification review (founder-owned, multi-day); building a second provider
  before the first is configured violates rule 1's spirit. The account-linking schema from Stage 1
  is consumed by LINE Login user creation; the linking UX ships with the second provider.

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), Playwright smoke (if user-facing), docs updated.

Stage-4-specific review notes:
- Playwright smoke covers the full browse → filter → detail → sign-in → save-listing flow in both Thai and English; any broken flow at the stage gate blocks sign-off
- The spec auditor pays special attention to auth: verify that account-linking cannot accidentally merge two distinct users; session fixation and CSRF protections are present
- The correctness reviewer checks SEO completeness: every listing detail page must have canonical, OG, and JSON-LD; any missing tag is a defect; sitemap must include all active public listings

## Build order (sprint-01 extension — unattended increments)

Each increment panel-reviewed and committed separately; `main` stays shippable after each. Deploy
is founder-gated, so infra lands as code + `pulumi preview` evidence only.

1. **S4-I1 scaffold**: `packages/website` (Astro 6 SSR, node adapter middleware mode, Lambda shim +
   bundler copied from the spike, in-process test harness proving per-request SSR).
2. **S4-I2 browse**: paginated grid + filters (Stage 3 components), reads via `packages/db`
   repositories, th/en locales.
3. **S4-I3 detail + SEO**: full field set, JSON-LD RealEstateListing, OG, canonical, hreflang.
4. **S4-I4 search**: trigram + structured filters + PostGIS radius in `packages/db` repo fn.
5. **S4-I5 sitemap**: XML from Postgres, `siteUrl`-relative.
6. **S4-I6 infra**: CloudFront + S3 assets + SSR Lambda (mirrors `infra/src/miniapp.ts`), preview
   only.
7. **S4-I7 (stretch) LINE Login**: web OAuth flow + signed-cookie session + saved listings.
8. **S4-I8 (stretch) submission form**: async handoff into the pipeline.

Parked for founder: domain (D19) + ACM + Route 53; LINE Login console config; Google OAuth
verification; `pulumi up`; Lighthouse/Playwright runs against the live domain (local Playwright
smoke still runs at the gate).

## Iteration log

| Date | What changed | Why |
|---|---|---|
| 2026-06-12 | Adapter question resolved pre-flesh-out: Pulumi-wired `@astrojs/node` + hand-rolled Lambda shim (spike-proven); CloudFront-fronting now a hard constraint | DF-2 spike verdict (spikes/astro-ssr-pulumi/FINDINGS.md) |
| 2026-06-13 | SKELETON→FLESHED under the sprint-01 extension; defaults: signed-cookie session, `/properties/{id}` URLs, pg_trgm Thai search, async submission, LINE-Login-only auth; email/Google + domain-dependent items parked | Founder approved working Stage 4 unattended ("I approve this. Commit it to plans"); defaults chosen to be cheap to reverse and are flagged for morning review |
| 2026-06-13 | S4-I1 pulled small parts of S4-I3 forward: Base layout ships canonical/OG/hreflang, th/en i18n routing, plus a `/healthz` probe (smoke-asserted) | Spec-auditor finding: layout meta is load-bearing for every later page; building the layout twice would be churn. Logged per the deviations rule |
| 2026-06-13 | S4-I1 shim diverges from the spike by a writeHead header capture | Astro responds via `writeHead(status, headers)`, which Node hides from `getHeaders()` — without the capture, content-type/set-cookie are dropped. Found by the SSR smoke, verified by correctness review |
| 2026-06-13 | S4-I2 deviations: card `heroUrl` is null until S4-I6 wires the media CDN path; filters are a hydrated island that navigates with full-page URLs (single-select per group); card links target `/properties/{id}` which 404s until S4-I3; `province` filter exists in the repo fn but has no UI until S4-I4; seed consents 2-of-3 listings, never deed-blocked sales (FIELD-03); out-of-range pages clamp to the last page | Panel findings (spec auditor + correctness); all are forward references to spec'd increments landing tonight or in S4-I6, none change product behavior at the stage gate |
| 2026-06-13 | S4-I6 deviations: `siteUrl` is a BUILD-time env (`SITE_URL`) rather than the spec's "Pulumi config defaulting to the CloudFront domain" — Astro bakes `site` at build, and the CF domain doesn't exist before the first up (chicken/egg); first deploy serves placeholder canonical URLs until the one-time rebuild in MORNING.md. SSR origin uses authType NONE behind CloudFront — the account guardrail MAY also 403 CloudFront's anonymous fetch (spike left it open); OAC-lambda fallback documented in MORNING.md. Preview verified +20/~3/−2 with 0 replaces; both immovable URLs among the 57 unchanged | Panel findings; deploy itself stays founder-gated |
| 2026-06-13 | S4-I4 deviations: **PostGIS radius search deferred** — `findListingsNear` (Stage 1) is the repo-level capability, but exposing radius needs a map/geolocation UI that has no design yet; **price-range filter deferred** — sale prices live on `listing.price_thb` and rents on `listing_rental.monthly_rent`, so one slider over both needs a product ruling (founder); text search matches content in ANY language (cross-script queries are common — intended); `project_name` is in the match but un-indexed; the OR+EXISTS query shape seq-scans at today's scale (GIN indexes pay off only after a future index-friendly restructure — comment in schema.ts) | Panel findings; radius + price are the remaining S4-I4 scope and stay on the stage-gate checklist, not silently dropped |
| 2026-06-13 | S4-I3+I5 deviations after panel + /alignment-review: gallery, map and `og:image` deferred to S4-I6 (media CDN); LINE CTA (CONV-06) wired but renders only when `LINE_OA_URL` is configured (founder: set the OA link); detail shows deed (with COPY-04 restricted-transfer warning), land units, floor area, beds/baths, flood disclosure (FIELD-07), tenure/leaseYears, project — facing/road/zone/condo/rental-subtable rows wait for a dedicated fields increment; amenities fetch dropped (was dead data); land units stay Thai on the en page (TH-03 ruling); sitemap caps at 10k newest (sitemap-index revisit logged) and en URLs appear as alternates not `<loc>` entries; th-fallback content under `lang="en"` unfixed (minor TH-08) | Alignment review found CONV-06/LEGAL-06/COPY-07/FIELD-07/TH-03/COPY-06/COPY-04 violations — all fixed this increment (LEGAL-06 notice on browse+detail, localized 404 page, retry action on the error state, poster name on cards, land-units-first cards); stored-XSS in the JSON-LD injection fixed + regression-tested. **Founder queue:** schema gaps the register wants that S4 cannot improvise — NPA/`listing_type` marker (DIST-01/MKT-11) and a new-vs-resale field (COMP-06); also DF-3 Accept-Language soft redirect + TECH-11 transition:persist deferred |
| 2026-06-14 | **4.1 image rendering shipped** (`727bfc2`) — closed the ORPHANED deferral: card hero, zero-JS detail gallery, `og:image`, JSON-LD `image[]`; SSR-time presign of `derivatives/*` thumbs; IAM scoped least-privilege. Deployed + verified live. | Caught by the BACKLOG rollup as the un-shipped Stage 4 deliverable; built before the gate so the gate reconciles it |
| 2026-06-14 | **4.10 — Stage 4 stage gate run (verdict below).** Three gate-found fixes (TECH-06 token theme un-applied; LEGAL-07 foreign-ownership disclaimer; LOW retry-link); TH-10 refuted as a founder-blessed tradeoff; og:image-expiry + poster-name-data logged. | Stage gate |
| 2026-06-14 | **4.8 — dedicated detail-fields render shipped + deployed + verified.** The deferred facing/road/zone + condo + rental-subtable fields now render on the detail page (projection-only through `getPublicListingDetail`→`PublicListingDetail`; reused `FieldList`/`AccordionSection`; omit-when-absent; th+en compile-bound labels; MKT-03 monthly framing; collapsed "subtle meta" altitude per the founder direction). Condo floor/building/unit turned out to be a **4.7 schema gap** (no column) — logged, not built. increment-review + /alignment-review PASS (zero violations). | Resolves the S4-I3 deferral "facing/road/zone/condo/rental-subtable rows wait for a dedicated fields increment" (this increment) |

## Stage gate (run 2026-06-14 — CONDITIONAL-PASS; 3 gate-found fixes deployed + verified)

The Stage 4 public website was built across **S4-I1…S4-I6** (sprint-01 extension, 2026-06-13),
deployed live with the Stage 1 RDS deploy, then had its one orphaned deliverable (**4.1 image
rendering**) shipped 2026-06-14 — but was never formally gated (the spec had no gate section; that
gap is what let 4.1 hide). This is that gate: the master-plan §5.3 heavy full-diff review of the
whole Stage 4 cluster, architecture-conformance, the eval disposition, a Playwright smoke on the
live site, and a design-bearing /alignment-review. **Stage 4 diff under review: `23a7c19..HEAD`**
(8 commits `cad7da1`→`727bfc2`, ~1.8k lines, purely additive: `packages/website/**`,
`infra/src/website.ts`, `infra/src/staticSite.ts`).

**Method (master plan §5.3):** four fresh-context read-only reviewers that did not write the Stage 4
code — a **spec auditor** (full diff vs the 11 Key deliverables + S4-I1…S4-I8), an **architecture-
conformance auditor** (hexagonal boundaries / db public-API usage / file-size watchlist / anti-over-
eng), a **correctness reviewer** (SSR error paths, i18n/hreflang/canonical, sitemap, the 4.1 presign/
null handling, XSS), and a **/alignment-review** pass over the public-website surface against the
heuristic register. Findings were skeptic-adjudicated; confirmed ones fixed, false positives refuted
with evidence.

### Checklist

- [x] **High-effort full-diff review** of the Stage 4 cluster (browse, search, detail, SEO, sitemap,
  i18n, 4.1 images). Spec auditor: **reconciliation clean — zero untracked orphans, zero scope creep**
  (the lone "extra," `infra/src/staticSite.ts`, is a refactor extracting `listSiteFiles` out of
  `miniapp.ts`, which now imports it). The pre-existing orphan (4.1 image rendering) is now shipped.
- [x] **Architecture conformance — CLEAN.** Every cross-package import in `packages/website/src/**`
  resolves to a PUBLIC barrel (`@line-robot/db`, `@line-robot/domain`, `@line-robot/ui`); the website
  `package.json` declares no `@line-robot/bot`/`pipeline` dep, so it is structurally incapable of
  reaching their internals; it never deep-imports `db/src/schema.ts`. No premature abstraction; the
  `lib/media.ts` presign duplication (vs the bot's port-implementing `S3MediaUrlSigner` class) is
  justified under anti-over-eng rules 1/3 (two different shapes, ~5 shared SDK lines). IAM
  least-privilege confirmed (`s3:GetObject` scoped to `${archive}/derivatives/*`).
- [x] **File-size watchlist.** Website package all small/cohesive (largest `DetailPage.astro` 164).
  `db/src/repositories/listings.ts` is now **458** lines (was 429 at the Stage 2 gate; +29 from 4.1) —
  re-audited: a flat list of 18 thin single-aggregate functions + 8 type aliases, no god-object, matches
  the package's own "one file per aggregate" rule → **KEEP, no split**. (4.1's gallery presign lives in
  the website's `media.ts`, not here, which is why it barely grew.)
- [x] **Eval — N/A for this UI stage** (reasoned). `npm run eval` is the **Stage 2 pipeline** scorecard
  (62 synthetic extraction cases); there is no website/Stage-4 eval and one was NOT invented (a UI stage
  has no model-output eval — its quality gates are the Playwright smoke + alignment review). Ran the
  pipeline oracle smoke once as a regression sanity: **62/0, baseline unregressed** (Stage 4 didn't touch
  the pipeline). D21 advisory.
- [x] **Playwright smoke on the live CloudFront site** (HEADED real Chrome, th-TH / Asia-Bangkok, mobile
  390×844, human pacing — per root CLAUDE.md). All critical flows PASS — see results below.
- [x] **/alignment-review** (design-bearing) over cards/detail/search/copy/i18n vs the register —
  3 violations found, adjudicated below (2 fixed, 1 refuted as a founder-blessed tradeoff).
- [x] **Shipped-vs-spec reconciled + deferral list authoritative** (below). Every one of the 11 Key
  deliverables + S4-I1…S4-I8 is SHIPPED or tracked in BACKLOG 4.2–4.10 / parked by the spec as
  founder-gated. No new orphan.
- [x] **Docs updated** — this section; BACKLOG 4.10 → done + Stage 4 → gated; root `CLAUDE.md` gained a
  token-fallback note (the TECH-06 gotcha).

### Confirmed fixes (gate-found, deployed + verified) — commit `6cadc48`

- **TECH-06 (HIGH, live-verified): the entire token theme was not applied on the website.** `theme.css`
  declares its base tokens inside Tailwind v4's `@theme {}`; Tailwind compiles that to `:root` custom
  properties — but **the website runs no Tailwind** and imports `theme.css` as raw CSS, so a browser
  **discards the unrecognised `@theme {}` block**. Live computed styles confirmed every `var(--token)`
  resolved empty: `body` font = **Times New Roman** (not Sarabun), `--spacing-4`/`--text-2xl`/`--color-bg`
  all empty, badges/CTA uncoloured, `main` padding `0px`. (The site looked "okay" only because inline
  literal styles — `aspect-ratio`, `max-width: 72rem` — still applied.) This also subsumes the alignment
  reviewer's narrower TECH-06 (no OKLCH→RGB fallback for old Thai-Android WebViews). **Fix:**
  `emit-fallbacks.mjs` now restates the full `@theme` base set as a plain `:root {}` (colours hex-first
  with an `@supports (color: oklch)` upgrade; non-colours verbatim; shadow ink → `rgba()`); `fallbacks.css`
  is exported from `@line-robot/ui` and imported in `Base.astro` after `theme.css` (the gallery already
  followed this `import theme.css; import fallbacks.css` pattern). **Verified live:** computed `--color-bg`/
  `-primary-600`/`-spacing-4`/`-font-body-th` now resolve, `body` font = Sarabun, badges + LINE-green CTA
  + trust-blue links render; old WebViews get the hex baseline.
- **LEGAL-07 (alignment, ship-blocking): no foreign-ownership disclaimer on the detail page.** Detail
  rendered `tenure`/`leasehold` as bare field rows with no foreign-eligibility caveat. **Fix:** a
  non-dismissible bilingual notice (`legal.foreignOwnership`, th + en — foreigners can't own land; condos
  capped at 49% foreign quota; verify with a legal professional) on every detail page. Verified live (th +
  en). Per-unit foreign-*quota* display (FIELD-05) stays deferred to BACKLOG 4.8.
- **LOW (correctness): the DB-error retry link dropped the query string** (`HomePage.astro` used
  `Astro.url.pathname`) — now `…pathname + Astro.url.search`, so retry after a transient DB error keeps the
  user's filters.
- Plus `is:inline` on the JSON-LD `<script>` (cleared the only typecheck hint).

typecheck + Biome lint + full suite green (**484 tests**). Deployed via a **targeted** `pulumi up`
(website-ssr fn+alias + the 2 changed assets) = **2 created / 2 updated / 2 deleted / 83 unchanged**, no
destructive/security/data-loss diff (the unrelated processor/sweep/reminder/read-api `~code` churn — pure
rebuild-hash noise; those Lambdas import neither `@line-robot/ui` nor the website — was intentionally NOT
deployed). website-ssr logs: **0 errors / 0 AccessDenied / 0 500s** post-deploy.

### Refuted / logged (not fixed, with reason)

- **TH-10 (Thai compound-phrase SEO slugs) — REFUTED as gate-blocking.** Opaque `/properties/{id}` URLs
  are an **explicit, founder-approved design decision** (this spec, "URL scheme": "stable opaque id;
  canonical. Matches the plan-17 LINE deep links and keeps sitemap/share/dedup trivial. Keyword slugs are
  a marginal SEO factor vs title/JSON-LD; revisit with real search-console data."). The H1/title/JSON-LD
  all carry the Thai phrase, so pages are Thai-indexable. Per the /alignment-review rule, a rebuttal that
  amounts to disagreeing with the research goes to the founder, not the code. **Logged → BACKLOG 4.9** with
  its "revisit with search-console data" trigger; not changed (a slug change would break plan-17 deep links
  for a marginal gain).
- **og:image presign expires after 1h (MED, correctness) — logged, not gate-blocking.** A social crawler
  that lazily re-fetches the stored presigned URL >1h after scraping would lose the share-preview image.
  Real but intermittent (most crawlers store the bytes at scrape time). The fix is a deliberate tradeoff
  (7-day SigV4 presign, or serve thumbs via a public CloudFront `/img/*` behaviour off `derivatives/*` so
  OG needs no presign) that deserves its own increment. **Logged → BACKLOG 4.9** as an advisory follow-up.
- **`is:inline`/SSR shim `next`-fallback, Host-header not forwarded, count-vs-strip mismatch, ILIKE
  trailing-backslash, hreflang reciprocity, all XSS vectors, presign null paths, pagination clamp** — all
  **checked and cleared** by the correctness reviewer (refuted with evidence; the single `set:html` is the
  JSON-LD, escaped; everything else auto-escaped).

### Data / cosmetic observations (non-blocking, for the founder)

- **Poster name on the 5 real listings' cards shows `group#C08357…`** (the group pseudo-user's
  `display_name` = the raw group key). TH-03 is satisfied schema-wise (a name renders), but it surfaces an
  internal key, not a human/agent name. This is a **data/ingestion** matter (the group pseudo-user's
  display name), not website code — the website faithfully renders `display_name`. Founder/data follow-up
  (the 15 synthetic listings show proper names). **Logged → BACKLOG.**
- **`/favicon.ico` 404** (the site ships no favicon) — one console 404, cosmetic. **Logged → BACKLOG 4.9.**

### Reconciled shipped-vs-deferred (the authoritative Stage 4 ledger)

**SHIPPED + live-verified:** Astro 6 SSR site (#1), browse + filters + pagination (#2), structured-filter
+ pg_trgm Thai search (#3 partial), detail page + JSON-LD/OG/canonical/hreflang (#4), sitemap from
Postgres (#5), CloudFront cache rules (#11); **4.1 image rendering** (card hero, zero-JS gallery,
og:image, JSON-LD image[]). Acceptance criteria proven live: JSON-LD = valid `RealEstateListing`
(name/description/image[]/offers/address/geo), sitemap = 21 urls incl. 20 listings + reciprocal hreflang
alternates, th↔/en/ reciprocal canonical/hreflang (no `/en/en/` bug), 404 on junk id (not 500), filter
counts exact (condo 6 / land 2 / rent 3 / sale 17 / no-match 0).

**Deferred-and-tracked (required-before-"Stage 4 done"? — NO; all genuinely deferred):**
- 4.2 radius/map search (S4-I4) · 4.3 price-range filter (founder sale-vs-rent ruling) · 4.4 **LINE Login
  (S4-I7, founder-gated: needs the real domain D19 — also the gate-smoke's sign-in dependency, correctly
  un-runnable at this gate)** · 4.5 owner submission form (S4-I8 stretch) · 4.6 email/Google OAuth + linking
  (Google needs app-verification) · 4.7 schema gaps NPA/`listing_type` (DIST-01/MKT-11) + new-vs-resale
  (COMP-06) — founder go-ahead · 4.8 detail sub-fields (facing/road/zone/condo/rental rows) + FIELD-05
  per-unit foreign quota · 4.9 minor SEO/perf tail (now also: TH-10 slugs, og:image expiry, favicon,
  Accept-Language redirect, TECH-11 transition:persist, sitemap 10k cap, GIN-index).
- Domain/ACM/Route 53 (#10) — founder D19.

No deliverable is both un-shipped and untracked. The auth trio (#6–#8) + submission (#9) are deferred by
the spec's own "Open questions" behind the founder domain decision, not gate-blocking.

### Eval scorecard (advisory — D21)

**N/A for this UI stage.** `npm run eval` is the Stage 2 pipeline extraction scorecard, not a website eval;
no Stage-4 eval exists and none was invented (a public website has no model-output to score — its quality
gates are the Playwright smoke + the alignment review, both run above). Regression sanity: the pipeline
oracle smoke ran 62/0 with the baseline unregressed (Stage 4 touches no pipeline code).

### Playwright smoke (live `https://d15dpmhcgtrf1r.cloudfront.net/`, HEADED real Chrome, th-TH/Asia-Bangkok, mobile)

| Flow | Result |
|---|---|
| Homepage loads + cards render | PASS — 20 cards, 5 real presigned hero photos, LEGAL-06 notice, filter chips |
| Filter type=condo/land, deal=rent/sale | PASS — counts exactly 6 / 2 / 3 / 17 (match DB) |
| Interactive filter chip (hydration) | PASS — clicking คอนโด → `?type=condo`, 6 cards |
| No-match search | PASS — 0 cards, empty state |
| Detail (with photo) | PASS — 13 gallery imgs, og:image = presigned hero (HTTP 200), JSON-LD RealEstateListing + image + offer, LINE CTA → `@685kqtou`, canonical/hreflang correct |
| Detail (thumb-less) | PASS — 0 imgs, 0 broken `src=""`, branded-default og (HTTP 200 png), no JSON-LD image |
| th ↔ /en/ language paths | PASS — en title translated, `lang="en"`, reciprocal hreflang, no double-prefix |
| 404 (junk id) | PASS — HTTP 404 (not 500), localized Thai page + home link |
| Sitemap | PASS — HTTP 200 xml, 21 url + 20 listings + 42 hreflang alternates |
| Token theme (post-fix) | PASS — computed tokens resolve, body font = Sarabun, badges/CTA themed |
| LINE Login (4.4) sign-in → save | **GATED-AROUND** — not built (founder-gated, needs domain); recorded deferred, not gate-blocking |

### Alignment review (design-bearing) — heuristic register

Four context groups evaluated (Listing card & detail UI / Search & discovery / Typography·i18n·copy /
Architecture & frontend) + P1–P8. **Result: VIOLATIONS (3), adjudicated.** Passes: CONV-03/04/05/06/09,
TH-03/06/07/08/09/11/12/13/14, COPY-02/03/04/06/07/09/10/11, COMP-04/14, MKT-03/04, TECH-01/02/05/07/08/10/13,
B3, P1/P2/P3/P5/P6/P7. N-a (deferred/wrong-stage, tracked): TH-04 (verification badge un-wired), TH-05,
DIST-01/02 + P8 (no distressed data path — no `listing_type` field, BACKLOG 4.7), COMP-05/06, MKT-09/10/12,
COPY-08, TECH-03/09/11/12. **Violations:** LEGAL-07 (foreign disclaimer — **FIXED**), TECH-06 (token
fallback — **FIXED**), TH-10 (opaque slugs — **refuted as founder-blessed tradeoff**, logged). LEGAL-06
placement (results-level + detail, not per-card) confirmed as the logged founder judgment call, not a
violation.

### Retro

The gate did its job. The full-diff review + live computed-style probing caught **TECH-06** — the entire
token theme silently not applying on the website (serif font, no spacing/colour) — which every per-increment
review and the unit/smoke tests structurally missed: the tests assert markup and SSR behaviour, not
*rendered* computed CSS, and the `@theme {}`/no-Tailwind mismatch only manifests in a real browser. That,
plus **LEGAL-07** (a legal disclaimer the S4-I3 alignment pass overlooked while fixing its siblings), is
exactly the class of gap a stage gate exists to catch. Architecture stayed clean through the whole cluster
(public-API-only boundaries, no premature abstraction, least-privilege IAM, the single-aggregate repository
holding at 458 lines). The deferred tail (4.2–4.9) and the founder-gated 4.4 are expected, tracked, and not
ship-blocking. **Verdict: CONDITIONAL-PASS** — Stage 4 is gated; the three confirmed fixes are deployed and
verified live; the tail is the explicit follow-up list in BACKLOG 4.2–4.9, with LINE Login (4.4) + the real
domain (D19) the founder-owned items, and the og:image-expiry + poster-name-data observations logged for the
founder. The public website build is correct, themed, and live.
