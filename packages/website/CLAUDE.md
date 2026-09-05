# CLAUDE.md — packages/website (the public site)

Package-local rules and map. Live status is `STATUS.md`; runbooks are `handbook/runbooks/`.

`packages/website` — Astro 6 SSR (Lambda + CloudFront), **live at https://d15dpmhcgtrf1r.cloudfront.net/**
(th `/` + `/en/`). Reads the catalog via the `@line-robot/db` PUBLIC barrel only (repository fns) —
never another package's adapters/internals.

- **Pages.** `/` marketing home (hero search, browse-by-type, latest, why, how-it-works, popular
  districts — `HomePage.astro`); `/properties` browse with SSR **link** filters (`BrowsePage.astro` +
  `browse/FilterPanel.astro`, zero client JS; the only islands are geolocation `NearMe` + Leaflet
  `ResultsMap`); `/properties/{id}` detail (`DetailPage.astro` + `detail/Gallery.astro` lightbox, sticky
  contact panel / phone CTA bar, map, similar listings); `/about` `/how-it-works` `/privacy` `/terms`
  from the markdown **content collection** (`src/content/pages/{th,en}/*.md`, rendered by
  `StaticPage.astro` via `[page].astro`); `/contact`; designed 404; `robots.txt` + `sitemap.xml`.
  Site chrome lives in `components/site/` (Header with mobile sheet, Footer, ThemeToggle, Icon set,
  SectionHeading); brand/locale/nav constants in `lib/site.ts`; card mapping in `lib/cards.ts`.
- **Brand.** The working wordmark is "ทรัพย์ดี" / "Sapdee" (FOUNDER-QUEUE FQ-4 — no final name). It is
  read from the i18n catalog (`site.name`) everywhere, so a rename is one edit in
  `packages/ui/src/i18n/{th,en}.ts`.
- **UI template variants (A/B + design exploration).** `?ui=b` (site-wide) or `?ui=browse:b,home:c`
  (page-scoped) picks an alternative template; the middleware stores the spec in the sticky `ui`
  cookie, pages resolve theirs with `variantFor(page, Astro.locals.ui)` (`lib/variants.ts` is the
  registry of what exists), `<html data-ui>` carries it, `?ui=reset` clears. An explicit `?ui=`
  request shows a switcher chip; cookie-assigned visitors never see it. Browse variants: `a` sidebar
  link-chips (default), `b` quick-filter rail + bottom-sheet form, `c` native-select toolbar — all
  rendered from ONE facet model (`lib/browseFacets.ts`), all zero-React (links / GET forms).
- **Theme toggle.** `<html data-theme="light|dark">` = explicit choice (localStorage, applied pre-paint
  by the inline script in `Base.astro`); no attribute = follow the OS (theme.css media block). The
  `dark:` variant in `global.css` keys on the same attribute; prefer flipping tokens over `dark:`.
- **Design tokens & theming (Direction A "Baania-clean" trust-blue).** The website **runs Tailwind v4**
  (`@tailwindcss/vite`); CSS entry `src/styles/global.css` (theme → Preflight → base rules →
  `.prose-site` + `.container-site` components). `@line-robot/ui/theme.css` is **THE single token
  source**; `--color-brand-*` are the NON-flipping deep blues for hero/CTA bands. `fallbacks.css` is
  the oklch→hex fallback for old Thai-Android WebViews — regenerate with
  `npm run tokens:fallbacks -w @line-robot/ui` after editing tokens. shadcn primitives are owned code
  in `packages/ui/src/components/ui/`, themed via the `@theme inline` alias layer.
- **Photos: SSR-time presign of `derivatives/*` thumbs** (`src/lib/media.ts`; SSR HTML is no-cache so
  presigned URLs never stale-cache; bucket stays private). The SSR role has `s3:GetObject` scoped to
  `${archive}/derivatives/*` only. `og:image` = the hero thumb; presigns expire 1h (BACKLOG 4.9).
- **SEO**: canonical/OG/hreflang(+x-default) in `Base.astro`; JSON-LD `Organization`+`WebSite`
  (site-wide) and `RealEstateListing`+`BreadcrumbList` (detail), XSS-safe via `safeJsonLdScript`;
  sitemap from Postgres + static pages; filtered browse pages are `noindex`. URL scheme is opaque
  `/properties/{id}`. `SITE_URL` overrides the canonical origin at build (defaults to staging CloudFront).
- **Tests.** `npm run test:e2e -w @line-robot/website` = real build + seeded Docker PG + fake S3, four
  projects (desktop/mobile × light/dark): style invariants (`theme.spec`), render invariants
  (`flows.spec`), chrome interactions incl. theme-toggle persistence + mobile nav (`site-chrome.spec`),
  detail lightbox/copy-link/CTA bar (`detail.spec`), static pages + 404 + robots (`pages.spec`),
  journeys, and a review-capture gallery. Ad-hoc review shots: `e2e/adhoc/shoot.mjs` (see its README).
