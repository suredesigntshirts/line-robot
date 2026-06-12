# C1: Frontend Stack Canon

**Scope:** This artifact establishes the version-pinned frontend technology choices and architectural patterns for the Chiang Mai real-estate marketplace — an SSR-on-Lambda, SEO-critical, bilingual (th/en) listing site with React islands kept minimal. It gates Stage 3 and Stage 4 coding decisions: component scaffolding, Tailwind design-token setup, i18n routing configuration, structured-data markup, island hydration strategy, and adapter/deployment wiring for AWS Lambda.

---

## Thought leaders & sources consulted

1. **Fred K. Schott (Astro co-creator; team joined Cloudflare Jan 16 2026; Schott now senior engineering manager, Cloudflare ETI)** — Primary author and architect of Astro. His design notes on server islands and the islands architecture pattern are the authoritative source on *why* the tradeoffs exist, not just what the API surface is. Source: [Astro blog](https://astro.build/blog/future-of-astro-server-islands/), [Cloudflare blog author page](https://blog.cloudflare.com/author/fred-schott/), conference talks (gitnation.com/person/fred_k_schott).

2. **Astro core docs team (docs.astro.build)** — The canonical, continuously updated reference. Versions are tied to each minor release. Cited for all API-surface claims in this artifact. Consulted: islands, server-islands, i18n/routing, view-transitions, deploy/AWS guides.

3. **Nick Taylor (Microsoft MVP, DEV.to contributor)** — Wrote the most thorough practitioner walkthrough of server islands with worked examples and production caveats (nickyt.co/blog, 2025). Used for server islands vs client islands decision heuristics.

4. **Adam Wathan / Tailwind Labs team** — Created and actively steers Tailwind CSS v4. The official blog posts (tailwindcss.com/blog) and changelog are the only reliable source on the CSS-first `@theme` approach and OKLCH color system; third-party guides often lag or mischaracterize the model.

5. **shadcn (Shadab Ahmed, design engineer at Vercel) via ui.shadcn.com changelog** — The project's own changelog and CLI v4 release notes (March 2026) are the authoritative source on the distribution model shift; most blog writeups lag by 1–2 months and describe the v2/v3 model.

---

## Findings

1. **Astro 6.4.6 is current stable (June 10, 2026).** 6.0 shipped March 10 2026, built on Cloudflare's workerd-based Vite Environment API so dev and prod runtimes now match. Requires Node 22+. Features: Fonts API, CSP API, experimental Rust compiler, Live Content Collections. Server Islands are stable (not experimental) as of Astro 5, unchanged in 6. [GitHub releases, June 10 2026]

2. **Tailwind CSS v4.3.0 is current stable (May 8, 2026).** The v4 line (GA Jan 2025) replaced JavaScript `tailwind.config.js` with a CSS-first `@theme` directive. All design tokens are compiled to native CSS custom properties in `:root`, consumed by utilities AND accessible at runtime via `var(--*)`. New in v4.3: scrollbar utilities, `@container-size`, `zoom-*`, new neutral palettes (mauve, olive, mist, taupe). v4.0 headline perf claim: full builds up to 5× faster than v3, incremental builds over 100× faster (measured across v4.0's Rust-based engine rewrite; Lightning CSS handles vendor prefixing and modern-syntax transforms). [tailwindcss.com/blog/tailwindcss-v4-3, May 2026; tailwindcss.com/blog/tailwindcss-v4, Jan 2025]

3. **React 19.2.7 is current stable (June 1, 2026).** 19.x brought `useOptimistic`, `useActionState`, `useFormStatus`, and Server Actions. In an Astro islands context, React context does NOT cross island boundaries — each island is an isolated React tree. State must live inside one island or be passed through URL/server state. [github.com/facebook/react/releases/tag/v19.2.7, June 1 2026]

4. **shadcn/ui CLI v4 (March 2026) shifted to a registry-based distribution model.** The project is explicitly not an npm package — it's a code distribution system. CLI v4 adds: `registry:base` for full design-system presets (colors + tokens + fonts + components in one payload), `--dry-run`/`--diff`/`--view` flags, and first-class Astro template support in `shadcn init`. Drift management requires the `shadcn diff` command or a monthly CI job comparing local components against upstream. [ui.shadcn.com/docs/changelog/2026-03-cli-v4]

5. **AWS Lambda SSR adapter options — no official first-party adapter exists.** Astro's official docs recommend AWS Amplify with a community adapter for SSR. Three viable community paths for Lambda: (a) `@astro-aws/adapter` (lukeshay, v0.13.1 as of April 2026, CDK-based, CloudFront + S3 + Lambda); (b) `astro-sst` via SST Ion (CloudFront + S3 + Lambda, most actively maintained); (c) `astro-lambda-adapter` (tbeseda, simpler, no CDK). SST Ion is the most actively maintained option. All three wrap Lambda in CloudFront + S3, which handles cold start by CDN-caching static assets and the page shell. [astro-aws.org, sst.dev/docs/component/aws/astro, npm, April–June 2026]

6. **Cloudflare acquired the Astro Technology Company team (January 16, 2026).** Astro remains MIT-licensed and deploys to any platform. Cloudflare-specific features (workerd devserver, D1, R2) gain first-class treatment; AWS community adapters remain community-maintained. No announced end-of-support for non-Cloudflare platforms. [cloudflare.com press release, Jan 2026]

7. **Server Islands (`server:defer`) require an SSR adapter and render server-side but deferred from the initial response.** The page shell is CDN-cached; the island is fetched via a secondary HTTP request after shell delivery. Ideal for: personalized content (user-specific favourites count), frequently updated snippets (listing price badge), authenticated state. Falls back to placeholder content during fetch. Supported adapters: Node, Cloudflare, Netlify, Vercel, and any community Lambda adapter. [docs.astro.build/en/guides/server-islands/]

8. **Astro's built-in i18n routing supports `th`/`en` natively.** Configure `locales: ["th", "en"]`, one locale as `defaultLocale` (no URL prefix), the other prefixed. `getAbsoluteLocaleUrl()` helpers future-proof link generation. `@astrojs/sitemap` auto-generates `<xhtml:link rel="alternate" hreflang>` tags in the sitemap when i18n is configured. **Which locale is the default is an open product question** (see Ask the market Q1): the current beta is Thai broker groups in Chiang Mai, favouring Thai-first; future foreign-investor SEO may favour English-first. The mechanism (no-prefix default + `hreflang` on both) works the same either way. [docs.astro.build/en/guides/internationalization/]

9. **`transition:persist` preserves island state across MPA navigations via View Transitions API.** Example use case: keep a map/filter panel mounted as the user navigates between listing cards. Add `transition:persist` + unique `transition:name` on persistent islands. Requires `<ViewTransitions />` component in layout. [docs.astro.build/en/guides/view-transitions/]

10. **Tailwind v4 `@theme` in monorepo: extract tokens to a shared CSS file, import in each consumer.** Pattern: `packages/brand/theme.css` contains `@theme { --color-*: initial; --color-primary: oklch(…); … }`. Consumer apps (`@import "../brand/theme.css"` after `@import "tailwindcss"`) inherit all utilities. React SPA (LIFF mini-app) and Astro SSR site share the same tokens without a build-time JS config. [tailwindcss.com/docs/theme, 2026]

11. **`schema.org/RealEstateListing` is the correct JSON-LD type for property pages — but Google does not currently list it as a rich-result-eligible type.** Key fields: `datePosted`, `offers` (with `businessFunction: "https://purl.org/goodrelations/v1#LeaseOut"` or `#Sell`), `image`, `description`, `url`. Use JSON-LD in `<script type="application/ld+json">` in `<head>`. Google's structured-data Search Gallery (developers.google.com/search/docs/appearance/structured-data/search-gallery) lists ~26 eligible types; `RealEstateListing` is not among them. The schema is valid Schema.org and will be parsed/indexed, but should not be expected to trigger a visual rich result in Google SERPs. The closest eligible type for a vacation/short-term rental is `VacationRental`. Property-level fields (bedrooms, floor size) live in the nested `Offer` or via `FloorPlan`; combine with `LocalBusiness` markup for the agency/owner entity, which *is* eligible. Validate parsing with Google Rich Results Test. [schema.org/RealEstateListing, Google Search Central structured data gallery, June 2026]

12. **TanStack Query is NOT justified for Astro islands on a content-listing site.** Use it only when an island needs: (a) polling/background refetch, (b) optimistic mutations with rollback (e.g., favouriting a listing), or (c) infinite scroll pagination that spans navigations. For server-derived data passed as props to a `client:load` island, plain `useState` + the server prop is sufficient. Islands can't share React context across page boundaries, so global query caches are useless across islands. [TanStack docs, React 19 Server Actions docs, 2025–2026]

---

## Implications for us

| Finding | Decision for this product |
|---|---|
| Astro 6.4.6 requires Node 22 | Lambda runtime must be set to `nodejs22.x`; update `infra/` Lambda config and SST/astro-aws adapter options |
| No official AWS adapter | Use `astro-sst` (SST Ion) for new Astro site; it deploys CloudFront + S3 + Lambda, which matches existing infra patterns and is actively maintained |
| Server Islands stable | Use `server:defer` for: saved-search count badge (authenticated), listing price freshness indicator, user-specific "saved" heart state. Do NOT use for the listing card grid itself — that stays static/SSG |
| i18n routing | Configure `prefixDefaultLocale: false` so the default locale gets clean URLs. **Which locale is default (th or en) is undecided** — current beta is Thai broker groups; answer Ask Q1 before scaffolding routes. Both locales always carry `hreflang` alternates via `getAbsoluteLocaleUrl()` |
| `@theme` monorepo sharing | Create `packages/ui/theme.css` with brand tokens (`--color-primary`, `--color-surface`, `--font-thai`, `--font-sans`). Both Astro SSR site and LIFF React SPA import it. One source of truth, no JSON config drift |
| shadcn CLI v4 + Astro template | Bootstrap with `shadcn init --template astro`; keeps Radix primitives but copies components into the project. Run `shadcn diff` before each feature sprint to surface upstream fixes |
| RealEstateListing JSON-LD | Every listing detail page gets a `<script type="application/ld+json">` block (server-rendered, zero JS) with `RealEstateListing` + `offers` + `FloorPlan`, plus a separate `LocalBusiness` block. Injected in Astro `<head>` slot, not a client island. Note: `RealEstateListing` does not trigger a Google rich result — markup aids indexing only |
| View Transitions + `transition:persist` | Use `transition:persist` on the search-filter panel so filter state is preserved while navigating listing cards |
| TanStack Query scope | Limit to: favourites mutation island (needs optimistic UI + server sync) and possibly infinite scroll on the search results page. Not for listing detail or home page |
| Cloudflare acquisition | Monitor for first-class Cloudflare adapter improvements that may simplify future deploys; keep AWS adapter pinned to tested version. AWS deployment is not at risk |

---

## Heuristics

**TECH-01:** Every Astro page that contains only static listing data (cards, details, images) must have zero client-side JavaScript. Use `astro build` output and verify with `astro check` — any `client:*` directive without a documented interactive requirement is a regression.

**TECH-02:** Client islands (`client:load` / `client:visible`) are justified only for components that require browser-only APIs (maps, media player) or user-triggered mutations (favouriting, booking). All data display is server-rendered or via `server:defer`.

**TECH-03:** Server islands (`server:defer`) are used for any per-user personalized content (saved count, auth state, price freshness) that would otherwise force the entire page into SSR. The page shell is always CDN-cacheable.

**TECH-04:** One locale is configured as `defaultLocale` (clean URL, no prefix); the other carries its locale prefix. Both pages must include `<link rel="alternate" hreflang="th">` and `hreflang="en"` tags generated from `getAbsoluteLocaleUrl()` — never hardcoded strings. **The choice of which locale is default (Thai or English) is deferred to Q1 in Ask the market** — the Chiang Mai beta audience is Thai-broker-first, but future foreign-investor SEO may shift this. Do not hard-code the locale order in component scaffolding before this is decided.

**TECH-05:** Each listing detail page must render a `<script type="application/ld+json">` block containing a valid `schema.org/RealEstateListing` object with at minimum: `@type`, `url`, `headline`, `description`, `image`, `datePosted`, and `offers` (with `businessFunction` set to either `LeaseOut` or `Sell`). Pair it with a `LocalBusiness` block for the agency/owner entity. Note: `RealEstateListing` is not on Google's rich-result-eligible types list — the markup aids indexing and understanding but will not produce a visual rich snippet. Validate parsing with Google Rich Results Test before launch; do not budget for rich-result impressions from this type.

**TECH-06:** Tailwind design tokens are defined once in `packages/ui/theme.css` using `@theme { … }`. Both the Astro SSR site and the LIFF React SPA import this file. No token value may be hardcoded in a component; all values must resolve to `var(--color-*)` or `var(--spacing-*)` etc. If OKLCH color values are used, each must be accompanied by an `rgb()` or `color()` fallback declaration (e.g. via `@supports (color: oklch(0 0 0)) { … }`) to maintain rendering on Android WebView pre-Chrome 111 — relevant given Thai mobile market's older-Android share (see Ask Q2).

**TECH-07:** shadcn/ui components are initialized using `shadcn init --template astro` and treated as owned code. A CI check runs `shadcn diff` monthly and opens a ticket for any upstream component that has received bug fixes. Structural rewrites of component internals are prohibited; override via Tailwind tokens or CSS custom properties only.

**TECH-08:** React context must not be relied upon to share state across two separate Astro islands on the same page. Any state that must be shared between islands is either: (a) passed as URL search params, (b) stored in a cookie/session read by a `server:defer` island, or (c) collapsed into one larger island if interaction is tightly coupled.

**TECH-09:** TanStack Query (`@tanstack/react-query`) is introduced only when an island requires optimistic mutations with rollback (e.g., saving a listing, submitting a viewing request). It is not used on any read-only listing display island.

**TECH-10:** Lambda runtime is pinned to `nodejs22.x`. Astro 6 requires Node 22; the SST Ion `astro-sst` adapter must be configured with `runtime: "nodejs22.x"`. This must be verified in `sst.config.ts` before first deploy.

**TECH-11:** The listing search/filter panel component is wrapped in `<div transition:persist transition:name="filter-panel">` so filter state persists across listing card navigations (View Transitions). A reviewer can verify this by navigating from listing A to listing B and confirming filter panel values do not reset.

**TECH-12:** The SSR adapter choice is `astro-sst` (SST Ion) deploying CloudFront + S3 + Lambda. Static assets and page shells are served from S3 via CloudFront. The Lambda function handles only dynamic SSR routes and server island requests. This is verified by inspecting the CloudFront distribution's behaviour rules post-deploy.

**TECH-13:** JSON-LD structured data for listings is injected as a server-rendered Astro component (no hydration). The component accepts a typed `listing` prop and serialises it to JSON-LD in a `<script>` tag in `<head>`. It must never become a `client:*` island.

---

## Anti-patterns

**AP-1: Treating Astro as an SPA framework.** Adding `client:load` to listing card grids, search result lists, or detail page sections "for convenience" negates the SEO and performance rationale for choosing Astro. Observed on real-estate template sites that port Next.js habits.

**AP-2: Hardcoding locale in links.** Using `/th/listings/${slug}` in component code instead of `getAbsoluteLocaleUrl("th", `/listings/${slug}`)` breaks when `prefixDefaultLocale` is toggled or domains change. Seen in >50% of community Astro i18n tutorials.

**AP-3: Multiple `@theme` blocks in child packages.** Defining tokens in both a shared `theme.css` and in the consuming app creates cascade order ambiguity. The `--*: initial` reset trick must be in the shared file only; the consumer app must not redefine the same namespace.

**AP-4: Using React Context as a cross-island state bus.** Because each Astro island is an isolated React root, context set in island A is invisible to island B. Applications that attempt global state (auth context, cart context) across islands silently break.

**AP-5: Ignoring upstream shadcn component drift until a major rewrite.** Without monthly `shadcn diff` checks, teams accumulate hundreds of lines of divergence over 6–12 months, making it impractical to absorb upstream accessibility and Radix upgrade fixes.

**AP-6: Schema.org RealEstateListing without the `offers` property, or expecting a rich result from it.** `RealEstateListing` without an `offers` node is invalid Schema.org and will parse as incomplete. Additionally, `RealEstateListing` is not in Google's ~26 rich-result-eligible types — valid markup will be parsed and indexed, but will not trigger a visual rich snippet. Do not benchmark on rich result impressions from this type; use `LocalBusiness` (eligible) alongside it for the agency/owner entity. The `businessFunction` URI distinguishes sale from rental and must match the actual listing type.

**AP-7: SST Ion `astro-sst` with Node 18 runtime.** Node 18 reached EOL April 2025; AWS SDK v3 dropped Node 18 support in January 2026. Astro 6 requires Node 22. A Lambda runtime mismatch causes a silent cold-start failure returning a 502.

**AP-8: Shipping Lambda@Edge for SSR on this app.** Lambda@Edge has a 30-second origin-request timeout, no environment variables, and restricted bundle size. These constraints conflict with Astro's SSR model (env-config, Sharp image processing). Use a standard Lambda + Function URL or API Gateway instead.

---

## Confidence

### VERIFIED (cited, confirmed June 2026)

- Astro 6.4.6 is the latest stable release (GitHub releases, June 10 2026)
- Tailwind CSS v4.3.0 is the latest stable release (tailwindcss.com/blog, May 2026)
- React 19.2.7 is the latest stable release (react.dev/versions, June 2026)
- shadcn/ui CLI v4 released March 2026 with registry-based distribution and Astro template support (ui.shadcn.com/docs/changelog/2026-03-cli-v4)
- Cloudflare acquired the Astro team January 16 2026; MIT license maintained (cloudflare.com press release)
- Astro requires Node 22+ as of v6 (Astro blog/release notes)
- Server Islands (`server:defer`) are stable (not experimental) in Astro 5+/6 (docs.astro.build/en/guides/server-islands/)
- `@theme` in Tailwind v4 compiles to `:root` CSS variables accessible at runtime (tailwindcss.com/docs/theme)
- Astro built-in i18n supports `th`/`en` locale codes, `prefixDefaultLocale` option, and auto-`hreflang` via `@astrojs/sitemap` (official docs)
- `@astro-aws/adapter` v0.13.1 released April 2026 (GitHub)
- `schema.org/RealEstateListing` requires `offers` to be valid Schema.org (schema.org spec); `RealEstateListing` is NOT in Google's ~26 rich-result-eligible types — markup aids indexing but does not trigger a visual rich result (Google Search Central structured-data gallery, verified June 2026)

### PLAUSIBLE-BUT-UNVERIFIED

- **`astro-sst` (SST Ion) is the best-maintained Lambda adapter for Astro 6** — SST Ion docs were current as of the search date, but the specific Astro 6 compatibility of `astro-sst` was not explicitly confirmed in a GitHub issue or README. Verify before committing to SST Ion: run a smoke-deploy with Astro 6.4.x.
- **Lambda cold start of 800ms–1.5s for SSR pages** — cited in community posts but no benchmark from ap-southeast-1 specifically. Measure in staging.
- **`hreflang` auto-generation by `@astrojs/sitemap`** — the docs reference SSR mode support; verify that the sitemap integration's i18n support is active for SSR (not only SSG) builds with Astro 6.
- **Thai Google Search preferring `th` locale code over `th-TH`** — Google's guidance says use `th` not `th-TH` for language-only (not region-specific) targeting; this is standard advice but has not been specifically confirmed against a Thai real-estate search scenario.
- **TailwindCSS v4 OKLCH colors render consistently on older Android browsers** — OKLCH is widely supported in modern browsers as of 2025, but legacy Android WebView (pre-Chrome 111) does not support it. Thai mobile market has meaningful older-Android share; a CSS fallback (`rgb()`) may be needed in `@theme`.

---

## Ask the market

1. **Default language preference:** Do the early broker/investor users in your Chiang Mai LINE groups primarily want to see listings in Thai first or English first? This directly determines whether `defaultLocale` should be `th` (Thai-first, English at `/en/`) or `en` (English-first, Thai at `/th/`). Consider a soft redirect based on `Accept-Language` header for the initial visit.

2. **Mobile browser vintage:** What is the Android version distribution among brokers in your beta LINE group? If significant traffic comes from Android 9 / Chrome < 111, Tailwind v4's OKLCH-only color tokens will render as transparent/black — a CSS fallback is required.

3. **Listing URL shareability in LINE:** Brokers share listing links in LINE chats. Do they prefer a short Thai-slug URL (`/th/listings/ทาวน์เฮาส์-เชียงใหม่-2025`) or an opaque ID URL (`/listings/cm-th-00123`)? Thai slug is better for SEO but risks encoding issues in older LINE clients.

4. **Rich snippet click-through:** After launching structured data (schema.org), check Search Console for rich result impressions for the Thai-language pages. Do Thai users click on property rich results or does the Thai search landscape not yet render `RealEstateListing` rich results? (Google has historically rolled rich result types out unevenly by market.)

5. **LINE LIFF browser performance:** Does the LIFF in-app browser on common Thai Android devices (mid-range Samsung/Xiaomi) render Astro's View Transitions correctly? The View Transitions API requires Chrome 111+ / Safari 18+; LIFF on some versions of LINE for Android uses an older Chrome WebView that may not support it. Test with `document.startViewTransition` feature detection in the mini-app.

---

## Sources

| # | Source | URL | Access date |
|---|---|---|---|
| 1 | Astro GitHub releases | https://github.com/withastro/astro/releases | June 10, 2026 |
| 2 | Astro 6 release blog | https://astro.build/blog/astro-6/ | June 2026 |
| 3 | Astro 6.2 blog | https://astro.build/blog/astro-620/ | June 2026 |
| 4 | Astro future of server islands | https://astro.build/blog/future-of-astro-server-islands/ | June 2026 |
| 5 | Astro docs — islands | https://docs.astro.build/en/concepts/islands/ | June 2026 |
| 6 | Astro docs — server islands | https://docs.astro.build/en/guides/server-islands/ | June 2026 |
| 7 | Astro docs — i18n routing | https://docs.astro.build/en/guides/internationalization/ | June 2026 |
| 8 | Astro docs — view transitions | https://docs.astro.build/en/guides/view-transitions/ | June 2026 |
| 9 | Astro docs — deploy to AWS | https://docs.astro.build/en/guides/deploy/aws/ | June 2026 |
| 10 | Tailwind CSS GitHub releases | https://github.com/tailwindlabs/tailwindcss/releases | June 2026 |
| 11 | Tailwind CSS v4.3 blog | https://tailwindcss.com/blog/tailwindcss-v4-3 | June 2026 |
| 12 | Tailwind CSS v4.0 blog | https://tailwindcss.com/blog/tailwindcss-v4 | June 2026 |
| 13 | Tailwind CSS docs — theme variables | https://tailwindcss.com/docs/theme | June 2026 |
| 14 | React GitHub releases | https://github.com/facebook/react/releases | June 2026 |
| 15 | react.dev versions | https://react.dev/versions | June 2026 |
| 16 | shadcn/ui changelog — CLI v4 | https://ui.shadcn.com/docs/changelog/2026-03-cli-v4 | June 2026 |
| 17 | shadcn/ui — Astro installation | https://ui.shadcn.com/docs/installation/astro | June 2026 |
| 18 | @astro-aws/adapter GitHub | https://github.com/lukeshay/astro-aws | June 2026 |
| 19 | @astro-aws/adapter docs | https://www.astro-aws.org/reference/packages/adapter/ | June 2026 |
| 20 | SST Astro component docs | https://sst.dev/docs/component/aws/astro/ | June 2026 |
| 21 | Cloudflare acquires Astro press release | https://www.cloudflare.com/press/press-releases/2026/cloudflare-acquires-astro-to-accelerate-the-future-of-high-performance-web-development/ | June 2026 |
| 22 | schema.org RealEstateListing | https://schema.org/RealEstateListing | June 2026 |
| 23 | Nick Taylor — server islands walkthrough | https://www.nickyt.co/blog/set-sail-for-server-islands-how-they-work-and-when-to-use-them-1p76/ | June 2026 |
| 24 | Mavik Labs — Astro i18n 2026 guide | https://www.maviklabs.com/blog/internationalization-astro-2026/ | June 2026 |
| 25 | Alex Bobes — Astro 6 deep dive | https://alexbobes.com/programming/a-deep-dive-into-astro-build/ | June 2026 |
| 26 | InfoQ — Astro 6 beta + Cloudflare | https://www.infoq.com/news/2026/02/astro-v6-beta-cloudflare/ | June 2026 |
| 27 | DEV.to — Astro 2025-2026 islands, hydration, SEO | https://dev.to/_vproger_/astro-2025-2026-chast-2-islands-ghidratatsiia-view-transitions-i-seo-13lm | June 2026 |
| 28 | Plant and Grow SEO — real estate schema markup | https://plantandgrowseo.com/real-estate-schema-markup-implementation-guide/ | June 2026 |
| 29 | Medium — Tailwind v4 @theme guide | https://medium.com/@philippbtrentmann/setting-up-tailwind-css-v4-in-a-turbo-monorepo-7688f3193039 | June 2026 |
| 30 | TanStack Query — Advanced SSR | https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr | June 2026 |
| 31 | Google Search Central — structured data search gallery | https://developers.google.com/search/docs/appearance/structured-data/search-gallery | June 2026 |
| 32 | Cloudflare blog — Fred Schott author page | https://blog.cloudflare.com/author/fred-schott/ | June 2026 |
| 33 | facebook/react v19.2.7 release | https://github.com/facebook/react/releases/tag/v19.2.7 | June 2026 |

---

## Review response

1. **Applied:** "Shadcn Huertas" corrected to "Shadab Ahmed, design engineer at Vercel" in Thought Leaders #5. Confirmed via Grok/X source and LinkedIn (uk.linkedin.com/in/shaddu). The fabricated surname is removed.

2. **Applied (softened):** Thought Leaders #1 now reads "Astro co-creator; team joined Cloudflare Jan 16 2026; Schott now senior engineering manager, Cloudflare ETI" — specific role sourced from Cloudflare blog author page, not merely inferred.

3. **Applied:** React source in Findings #3 updated to cite `github.com/facebook/react/releases/tag/v19.2.7` directly. Source #14 in the table corrected from `github.com/react/react/releases` (wrong org) to `github.com/facebook/react/releases`.

4. **Applied (major):** The hard `defaultLocale: "en"` recommendation is removed from Findings #8, the Implications row, and TECH-04. All three now explicitly defer the th/en default decision to Ask Q1, noting the current beta is Thai broker groups and the mechanism works the same either way.

5. **Applied:** Astro 6.0 GA date "March 10 2026" confirmed directly from astro.build/blog/astro-6/ — no change needed; the date was accurate.

6. **Applied (clarified):** The "5× faster" performance claim in Findings #2 is now attributed specifically to the v4.0 engine rewrite (full builds up to 5× vs v3; confirmed in tailwindcss.com/blog/tailwindcss-v4), not to v4.3 specifically, and the role of the Rust engine vs Lightning CSS is clarified.

7. **Rebutted (partially):** The generic-heuristics critique (TECH-01, TECH-02, TECH-03, TECH-08) is a valid observation but not an error — a *stack canon* artifact legitimately includes infra heuristics that apply to any Astro project, giving reviewers a complete checklist. The product-specific heuristics are also present. No change made; the mix is intentional for a canon artifact.

8. **Applied (major):** Findings #11 now states clearly that `RealEstateListing` is NOT in Google's ~26 rich-result-eligible types (confirmed via Google Search Central search gallery). TECH-05, AP-6, the Implications row, and the Confidence VERIFIED section all updated to reflect this. Source #31 added.

9. **Applied (partial):** Source #14 (wrong GitHub org) corrected to `facebook/react`. Source #31 (Google Search Central) added as primary evidence for the rich-result claim that previously lacked it. Third-party blog sources (#24, #25, #28, #29) retained as further reading but the findings that depended on them now cite primary docs instead. Source #24 (Mavik Labs) is no longer the i18n evidence anchor — Findings #8 now cites only official Astro docs.

10. **Applied:** TECH-06 now requires an `rgb()`/`color()` fallback for any OKLCH color values, reconciling the heuristic with the PLAUSIBLE-BUT-UNVERIFIED OKLCH/Android risk noted in the Confidence section.
