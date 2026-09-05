# CLAUDE.md — line-robot

Project-specific guidance for Claude. (The global `~/.claude/CLAUDE.md` also applies.)

## Browser automation — always run headed, as a real user

When capturing or auditing external websites (playwright-cli or any browser tooling): **always run HEADED (not headless) with a current standard Chrome user-agent, realistic viewport, locale `th-TH` / timezone Asia/Bangkok for Thai sites, and human pacing** (load homepage, wait, then navigate deeper). We are on a residential IP; headless mode + bot UA is what gets blocked — headed-as-real-user got us past walls (DDproperty et al.) that hard-blocked headless runs. Never attempt to solve CAPTCHAs yourself; for hard walls (Cloudflare JS challenge, DataDome) open the page headed and ask the user to clear it — it takes them seconds.

**Scope — our own app is the exception.** The headed-real-user rule above is ONLY for third-party sites behind anti-bot walls. Testing **our own website** (the plan-20 e2e/visual suite — `npm run test:e2e`, local build OR a deployed URL) runs **HEADLESS** for determinism and speed; CloudFront won't bot-wall us. Don't apply the headed rule to our own app, local or deployed.

**Reusable cleared session:** `playwright-cli -s=manual … --persistent` has a persistent Chrome profile with founder-cleared Cloudflare (ddproperty.com) + DataDome (idealista.com) cookies; saved state also at `.playwright-cli/clearance-state.json` (gitignored — NEVER commit cookies). Reuse via `-s=manual` or `state-load` before re-asking the founder. Headed flag: `playwright-cli open <url> --browser=chrome --persistent --headed`. Gotchas: `mousewheel` may not scroll (use `eval` `window.scrollTo`); the CLI's echoed Page Title can be stale after `goto` — verify with `eval document.title`.

## V2 rebuild — plan & product research

The v2 marketplace rebuild is governed by `plans/19-v2-marketplace-rebuild.md` (master plan,
decision register D1–D25) with per-stage specs in `plans/19-v2-marketplace-rebuild/`. **No stage is
built before its spec is fleshed and the user approves.**

Product/market research artifacts live in `handbook/research/` (a1–c1). The **heuristic register** —
the numbered, falsifiable rules every design-bearing change is reviewed against — is
`handbook/research/00-product-principles.md`. When reviewing or building UI, copy, schema, or flows,
load the register and check the applicable heuristic IDs. (A `/alignment-review` skill that does
this mechanically is a Stage 0 deliverable.)

## Quality system (Stage 0 onward)

Review cadence (canonical: master plan §5.3):

- **Every change (free, non-negotiable):** `npm run typecheck`, `npm run lint` (Biome), `npm run test`, coverage threshold. **For frontend changes (`packages/website`, `packages/ui`):** also `npm run test:e2e -w @line-robot/website` (plan 20) — the Playwright suite renders the REAL built artifact in a browser and asserts computed styles (the TECH-06 net), island hydration, and visual baselines. This is the layer that catches an unstyled/theme-not-applying regression; SSR-string smokes are blind to it.
- **For model-facing changes (real-API validation, non-negotiable):** any change to what the LLM sees or returns — prompts, the extraction/segmentation/dedup/gate logic, schemas, model tiers — must be validated against the **real Anthropic API**, not just the oracle/`FakeStepLlm` fakes: run `EVAL_LLM=anthropic npm run eval` and/or the real-model integration tests (`packages/pipeline/test/integration/*.e2e.test.ts`, Docker + real Anthropic), **do enough runs to confirm the behavior is actually correct, and iterate until it works.** Live API costs cents — far cheaper than shipping a silent correctness regression. The fakes/oracle pass green by construction while real-model bugs hide underneath (two CRITICAL merge/geo defects sat under green fakes until the real model exposed them). **"Advisory (D21)" means run-and-judge, never skip:** a red eval never auto-blocks the commit (the human judges), but skipping the live run to save cost is not the intent — run it, read the delta, regenerate `eval-baseline.json` once the new behavior is confirmed correct.
- **Every increment (PR-sized unit):** run `/increment-review` — three fresh-context reviewers that did not write the code (spec auditor vs the stage spec; correctness via the installed `/code-review` skill; simplicity critic vs the rules below), then a skeptic verifies bespoke findings before anything is acted on; judgment calls surface to the founder. Design-bearing increments (UI, copy, schema, flows) also run `/alignment-review` against the heuristic register. **Frontend/visual increments also run `/frontend-review`** — it renders the real production artifact and asserts computed styles + a style-only diff against the chosen mockup (never source-assumed styling — that is how the unstyled site passed review).
- **Every stage gate:** high-effort review of the stage's full diff; architecture-conformance check (hexagonal boundaries, no adapter imports in core, file-size watchlist); eval scorecard vs baseline; **for user-facing stages, `/frontend-review` + the `npm run test:e2e` suite (real-browser, not SSR-string smokes)** on critical user flows; docs and `CLAUDE.md` updated.

**Anti-over-engineering rules** (canonical copy — the simplicity critic loads these at review time; findings carry the same weight as bugs):

1. No interface until the second implementation exists.
2. Ports only at real seams (LLM, DB, LINE).
3. No one-caller abstractions.
4. No config nobody sets.
5. The deliverable is code a human developer reads without a guide.

Tooling: `/increment-review` (`.claude/skills/increment-review/`), `/alignment-review` (`.claude/skills/alignment-review/`), `/frontend-review` (`.claude/skills/frontend-review/` — perceptual + e2e gate; runs the plan-20 Playwright suite), `npm run eval` (scorecard, **advisory only — D21**: regressions are reported, never blocking; the founder judges). Alignment register: `handbook/research/00-product-principles.md`. Frontend e2e/visual: `plans/20-frontend-visual-e2e-testing.md`.

## Anthropic usage budget (long autonomous runs)

`~/.claude/check-usage.sh` prints the subscription rate-limit windows (5h + 7d — same data as
`/usage`, server-side authoritative). Check it roughly hourly during long autonomous runs; **never
poll more often than every 5 minutes** (the endpoint 429s).

Thresholds and mode switches (5h window):

- **At 85%:** stop starting new build increments. Wrap current work to a clean committed state.
- **Above 85%:** switch to waiting mode. Only run simple, low-token cleanup tasks delegated to
  sub-agents on **smaller models (haiku/sonnet)** — use the ready-made prompts in
  `.claude/low-token-cleanups.md`. Stay within ~10% more usage while waiting (these cleanups must
  be cheap).
- **At 95%: hard stop** — sleep until the window resets, then resume main work.

**Log each reading + mode switch in `SPRINT-LOG.md`** when a sprint is active (timestamp, % used,
current mode).

## v2 data layer (Stage 1)

- **Postgres (RDS `linerobot-staging-pg`)** is the v2 catalog store; DynamoDB stays for ingestion
  plumbing only (messages, idempotency, debounce state). Connection string: Pulumi output
  `dbConnectionString` (secret) / password in config secret `dbPassword`.
- **Staging connectivity posture (D-S1-2):** publicly accessible + TLS forced at the engine
  (`rds.force_ssl=1`) + 44-char generated secret. **Production hardening (pre-launch task): move to
  private subnets + VPC endpoints/NAT, restrict the SG.** Lambdas connect directly — the single
  `pg.Pool` (max 2) lives in `packages/db/src/pool.ts`; keep Lambda concurrency × 2 well under
  t4g.micro's ~85 max_connections.
- `npm run db:seed` — load synthetic fixtures (24+ listings, 3 groups, role spread) into
  `DATABASE_URL`. `npm run test:integration -w @line-robot/db` / `-w @line-robot/pipeline` — Docker
  `postgis/postgis` suites (harness: `@line-robot/db/testing`).
- Schema changes: edit zod enums in `packages/domain` first, then `packages/db/src/schema.ts`, then
  `npm run generate -w @line-robot/db` — and read `packages/db/CLAUDE.md` for the migration
  hand-fixes (geography quoting, postgis extension).
- **Dedup thresholds (Stage 2, D2.6)** live in `packages/pipeline/src/dedup/config.ts` —
  env-overridable (`DEDUP_GEOHASH_PRECISION` 6, `DEDUP_GEO_RADIUS_M` 1000,
  `DEDUP_TRIGRAM_THRESHOLD` 0.55, `DEDUP_JACCARD_THRESHOLD` 0.50, `DEDUP_BLOCK_CAP` 8). Defaults
  are validated by the synthetic dup-pair tests (P/R ≥ 0.90); retune via the eval scorecard, never
  by hand in prod.
- `npm run eval` — pipeline scorecard over 62 synthetic cases. `EVAL_LLM=oracle` (default) is a
  harness smoke; `EVAL_LLM=anthropic` + `ANTHROPIC_API_KEY` runs the real model baseline (D21
  advisory, always exits 0).

## v2 public website (Stage 4, polished 2026-09)

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
- **Deferred:** LINE Login / accounts (needs the real domain, D19), owner submission form, larger photo
  derivatives for the lightbox (thumbs are 640px), Thai-slug URLs.

## v2 MINI App (Stage 5)

`packages/miniapp` — **React 19 SPA on `@line-robot/ui`** (Tailwind v4 + owned shadcn + shared `@theme` +
oklch/old-Android fallback — TECH-06 matters MORE here: LIFF renders in LINE's in-app WebView). Replaces the
retired Preact SPA. Routes (shape-frozen for plan-17 deep links + rich-menu): `/` my-listings home, `/p/{id}`
detail; additive `/claim/{id}`, `/edit/{id}`. The LIFF SDK is isolated to `src/lib/liff.ts`; the SPA talks to
the backend **HTTP-only** (no api/db internal imports). i18n strings live in `@line-robot/ui/src/i18n/{th,en}.ts`.
**Frontend gate:** `npm run test:e2e -w @line-robot/miniapp` runs **TWO suites**: (1) the static gate
(`e2e/`, plan-20 net ported — real built SPA, mocked LIFF + `page.route` api, computed-style invariants
`assertThemeApplies`/`assertThaiBodyLineHeight`/`assertCtaContrast`/`assertColorScheme` + **interaction-driven
functional tests** that DRIVE clicks/swipes/typing and assert the outcome — gallery nav/count/lightbox, tabs,
filter/search, claim flow); (2) the **real-backend round-trip suite** (`e2e-api/`, `playwright.realapi.config.ts`,
port 4331) — boots Docker-PG + the real `packages/api` `handleApi` + a stub LIFF verifier + fake-S3, seeds
groups/membership/listings, and proves claim→publish/keep-private/409 + save/viewing/note/edit PERSIST via
re-fetch (not optimistic UI). `npm run test:e2e:api` runs just the real-backend suite (needs Docker). The
discipline: **a feature isn't "done" because it renders — a biting interaction-driven test must prove it WORKS
(break the feature → the test goes red).** `assertThaiBodyLineHeight` measures the card-as-button body text
(incl. the LEGAL-06 disclaimer) — don't blanket-exempt a `[data-listing-card]` button. Never inline-style
objects / bespoke CSS.

`packages/api` — the mini-app's **HTTP backend** (Lambda behind a Function URL, `infra/src/api.ts`, parallel
to the v1 read-api). LIFF id-token auth (ported v1 verifier; `aud` = the MINI App channel). Endpoints:
my-listings, detail, claim, publish/keep-private, owner PATCH-edit, saved (save/unsave), viewings (list/create),
notes. Reads the catalog via the **`@line-robot/db` PUBLIC barrel only** (the injectable `Repo` port — no deep
imports); **no `@line/liff` SDK anywhere in api**. Scoped IAM (`s3:GetObject` on the archive for gallery
presign). The SPA's `VITE_API_URL` = the api Function URL (Pulumi output `miniAppApiUrlOutput`), baked at build.

- **Claim/publish (D7 — the only public path).** Pipeline gate-pass → the bot sweep DMs the poster a
  `/claim/{id}` deep link (once, prospective, `claim_invited_at`-guarded; skipped for 1:1/group-less listings).
  Claim = optimistic lock (`UPDATE … WHERE claimed_by_user_id IS NULL`); concurrent loser → 409. **Publish =
  `grantPublishConsent`** (the website's `publiclyVisible` consent gate — appears on the public site within a
  refresh); **keep-group-private = withdraw consent** (`publish_consent.deletion_requested_at`, NOT a visibility
  column), copy "เฉพาะสมาชิกกลุ่มเดิม".
- **Source-group membership (launch-critical).** The claim gate (`isGroupMember`) needs the poster in Postgres
  `group_membership`. The live sweep (`pipelineV2Sweep.ts`) now `findOrCreateGroupByLineGroupId` + threads
  `sourceGroupId` into the pipeline + `upsertMembership` for every batch sender — so real posters can claim (was
  seed-only before; `source_group_id` was always NULL).
- **CRM (D13):** saved, viewings (+book via native `datetime-local`), per-listing notes, owner edit surface
  (`/edit/{id}`, claimant-only PATCH — **NOT edit-by-reply**, retired per A3a). Schema: claim columns +
  `listing_note` table (migration `0008`); per-caller `isSaved` on the detail DTO. Server-side validation
  (non-negativity, future-time) backs the client guards.
- **Edit-by-reply RETIRED (A3a); DF-6 descoped.** Founder taste calls queued in
  `handbook/design/skill-hardening/FOUNDER-QUEUE.md` (S5-*).
- **v1 retired/parked:** the Preact SPA is gone (grep-proven); a route-compat unit test
  (`packages/miniapp/test/route-compat.test.ts`) asserts every bot-emitted miniapp path resolves in the new
  router; the v1 read-api parallel-runs (deletion = Stage 6 deliverable #12).
- **Deploy:** `npm run build` bundles `packages/api/dist/api` + the miniapp SPA; `pulumi up` creates the api
  Lambda/Function-URL/role. Migration `0008` must be applied to staging RDS (`npm run db:migrate -w @line-robot/db`)
  and `VITE_API_URL` set to the api Function URL before the SPA build that ships.

## Deploying (Pulumi → AWS staging)

Pulumi state is on a **local file backend** (`file://~`); secrets use a **passphrase** provider.

- Pulumi binary lives at `~/.pulumi/bin` (not on `PATH` by default).
- **Passphrase is stored in `~/.line-robot-pulumi-passphrase`** — `chmod 600`, OUTSIDE the repo.
  The user does **not** memorize it; it lives only in that file. To recover/view it:
  `cat ~/.line-robot-pulumi-passphrase`. **Never copy the value into the repo** (not even a
  gitignored `.env`) — one copy in that out-of-repo 0600 file is the safest place for it.
- Full deploy:
  ```bash
  export PATH="$HOME/.pulumi/bin:$PATH"
  export AWS_PROFILE=line-robot
  export PULUMI_CONFIG_PASSPHRASE="$(cat ~/.line-robot-pulumi-passphrase)"
  npm run build              # bundle Lambdas — infra points at packages/bot/dist/*
  cd infra && pulumi up      # review diff, then "yes"
  ```

**After a meaningful deploy (post-deploy verification).** For any deploy that ships a large chunk of
work or touches the website, run the **deployed** frontend gate against the live site — it catches
infra-boundary bugs local testing structurally can't (CloudFront content-types/caching, the scoped
S3-presign IAM role, the real Lambda env, RDS connectivity, redirects/headers):
`E2E_BASE_URL=https://<cloudfront-domain> npm run test:e2e:deployed -w @line-robot/website`, then run
`/frontend-review <that-url>` for the visual design-review pass. (Same data-driven specs as local —
they discover whatever's published live.) A red invariant here = the deploy is broken or behind.

## AWS identities (shared account 259543826733, region ap-southeast-1)

- **`line-robot`** profile — the scoped deploy + runtime identity (`linerobot-*` ARNs only). Also
  granted staging-only data-plane **read** (DynamoDB GetItem/Query/Scan, S3, CloudWatch Logs) for
  verifying deploys/tests.
- **`default`** profile = `tea-admin` (account admin) — only needed to edit the deploy policy
  itself: `infra/deploy-user-policy.json` → `aws iam create-policy-version --profile default`
  (IAM caps a policy at 5 versions; prune the oldest non-default first).

## Tests

- `npm run test` — unit (vitest).
- `npm --prefix packages/bot run test:integration` — integration against DynamoDB Local (needs docker).
- `npm run lint` / `npm run typecheck` before committing.

## Rich menu (one-time, after deploy)

The persistent nav menu (My Listings / Upcoming / Search / Help) is a **data-plane LINE API call,
not Pulumi infra**. Its shape lives in `packages/bot/src/adapters/line/richMenu.ts`; the tappable
tabs fire the same postbacks the processor's `PostbackRouter` handles. To (re)install it:

```bash
export LINE_CHANNEL_ACCESS_TOKEN="$(cd infra && pulumi config get channelAccessToken)"
npm --prefix packages/bot run build   # bundles dist/scripts/setup-rich-menu.mjs
node packages/bot/dist/scripts/setup-rich-menu.mjs <menu-image.(png|jpeg)>
```

The image is a **2500×843 PNG/JPEG ≤1MB** the user supplies; its visuals are cosmetic (the four tap
zones are defined by bounds, not the picture). The script is idempotent — it deletes any prior menu
named `line-robot-main` before creating + setting the new one as default.

## MINI App deep-chat integration (plan 17) — one-time steps

Deeper chat ↔ MINI App loop on the **unverified** channel (no verification needed). Manual steps:

- **Deep links on the detail card (R1):** set the MINI App base URL so the bot can put an "Open in
  Catalog" button on the Flex detail card: `cd infra && pulumi config set miniappUrl
  https://miniapp.line.me/<liffId>` (e.g. `…/2010316767-rdtwc5y3`). Optional — unset just omits the
  button. Wired into the processor env as `MINIAPP_URL`.
- **Share a listing (R3):** `liff.shareTargetPicker` requires a **one-time per-channel consent** —
  LINE console → the MINI App/LIFF channel → **LIFF tab** → agree to **"Agreement Regarding Use of
  Information"**. No new LIFF scope, no verification. (Recipients who share no conversation with the
  sender see the card's self-contained summary but can't open the full listing — membership gate.)
- **Book a viewing (R4):** adds `POST /properties/{id}/viewings` to the read-api (membership-gated,
  creates a follow-up event whose reminder goes to the caller's own 1:1 chat). The read-api role now
  also has `dynamodb:PutItem` and its Function URL CORS allows `POST` — both land via `pulumi up`.
  Rebuild the SPA (`npm run build`) so the new Detail-screen booking/share UI ships.

Current build plan: `plans/17-miniapp-deep-chat-integration.md`.
