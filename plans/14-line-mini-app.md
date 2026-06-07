# Plan 14 — LINE MINI App (LIFF) read-only catalog viewer

## Context

Today, "display our data" means **Flex carousels inside the chat** (`core/handlers/views.ts`):
capped at 12 cards (`MAX_CARDS`), fixed label/value rows, every tap spawns a new message, and
photos open one at a time via an image-carousel message. A broker can't scroll a long list, filter,
see a property on a real map, or browse a full photo gallery.

A **LIFF app** (LINE Front-end Framework — a web SPA that runs in a webview inside LINE) gives us a
scrollable, filterable, full-screen UI over the **same catalog**, opened from the rich menu or a
flex button, with **no separate login** (LINE identity is automatic in the webview).

A "LINE MINI App" is a LIFF app with extra branding + a 1–2 week LY Corp verification that only buys
public Home-tab / search discoverability. We do **not** need that — an **unverified MINI App ships
immediately, no review**, which is exactly what the existing channel is
(`docs/.../line-mini-app/develop/develop-overview/index.md` line 60).

**v1 scope is locked to browse-only** (decided with the user): **List → Detail → Gallery → Map**,
read-only. No writes, no LLM, no `chat_message.write`. Editing stays in chat (the plan-11
reply-to-update flow). Share-to-client and in-app edit are explicitly deferred (Increment D, not in
this plan).

This is almost entirely **additive**: a new read-only Lambda + static SPA hosting + a new LINE
channel. The existing bot path (ingest/processor/sweep/reminder) is untouched.

### The one load-bearing fact

Inside the webview, `liff.getIDToken()` → our API → LINE's
`POST https://api.line.me/oauth2/v2.1/verify` (id_token + client_id) → returns `sub`
(`docs/.../liff/using-user-profile/index.md` lines 38–41,
`docs/.../line-login/verify-id-token/index.md` lines 115–146). **That `sub` is the exact same `U…`
id we already key `recordMembership` / `listPropertiesForUser(userId)` on**
(`adapters/dynamodb/catalogRepository.ts:697`, `core/domain/conversation.ts` `senderUserId`). So the
whole auth-to-data path is:

```
liff.getIDToken() → POST /oauth2/v2.1/verify → sub → listPropertiesForUser(sub) → presign photos → JSON
```

We already own the access model (`USER# → CONV# → PROP#` edges) and every accessor
(`listPropertiesForUser`, `getProperty`, `listPropertyEvents`) plus the S3 presigner
(`adapters/s3/mediaUrlSigner.ts`). **The mini app is a new read *view*, not new data plumbing.**

### The channel already exists (and is the right type)

The MINI App channel is **already created** — see `LINE.md` at the repo root (gitignored,
`.gitignore:17`). It's the standard LINE MINI App **three internal channels**
(`develop-overview` lines 116–126):

| Internal channel | ID (from `LINE.md`) | Use |
|---|---|---|
| Developing | `2010316764` | dev / staging — what we build + test against now |
| Review | `2010316765` | LY Corp's review sandbox (only if we ever verify) |
| Published | `2010316767` | live, after verification (deferred) |

Per `develop-overview` line 60, the channel is **usable immediately as an unverified MINI App** — no
review gate for our internal brokers. A MINI App *is* a LIFF app with extra requirements
(`develop-overview` line 112), so everything LIFF in this plan applies directly; **we do not create
a separate LINE Login channel.**

### ⚠️ Same-provider rule (cited — now a sanity check, not a blocker)

LINE user ids are **unique per provider** (`develop-overview` lines 78–84, identical to the LIFF
`getting-started` warning): *"A LINE user … is given a different user ID for each provider … you
can't move the channel to another provider later."* The id-token `sub` equals our stored `U…` ids
**only if this MINI App channel sits under the same provider as the Messaging API (bot) channel**
(Channel ID `2010315419`). The user has confirmed it's the same account; the residual is a
30-second console check (the provider name shown on both channels matches) — and a one-time
empirical confirm by decoding the first real id-token's `aud` (see Manual setup).

---

## Decisions (resolved)

- **Channel** → **reuse the existing MINI App channel's Developing internal channel**
  (`2010316764`) for staging — already created, unverified, no review (`develop-overview` lines
  60, 116–126). No new channel. (Published `2010316767` is for the deferred verified launch.)
- **Auth token** → **ID token** (`liff.getIDToken()`), verified server-side via
  `POST /oauth2/v2.1/verify` with `client_id = <MINI App Developing channel id>` (`2010315419` is
  the *bot* channel — do not use it; the `aud` is the channel that opened the LIFF)
  (`verify-id-token` lines 115–146). *Not* the access token: the access token requires an extra
  `GET /v2/profile` round-trip and is **revoked when the LIFF app closes**
  (`developing-liff-apps` lines 772–789, `using-user-profile` line 48). The ID token gives us a
  clean stateless verify that yields `sub` directly. **No MINI App secret is needed** — the verify
  endpoint takes the (public) `client_id`, not the channel secret, and LIFF id-tokens are ES256
  signed against LINE's public JWKS.
- **Scope** → **`openid` only** for v1 (required for `getIDToken()`/`getDecodedIDToken()` —
  `registering-liff-apps` line 43, `developing-liff-apps` lines 517–523). `profile` (display
  name/avatar) is deferred; `chat_message.write` is **not** requested (no in-app send in v1). Scopes
  are editable later in the console without re-registering (`developing-liff-apps` line 521).
- **Size** → **`Full`** (`registering-liff-apps` line 41). Best for a browse app and keeps the door
  open for LIFF-to-LIFF / scan later (both need Full — `opening-liff-app` lines 134–146).
- **SDK delivery** → **npm `@line/liff`, version pinned** (`developing-liff-apps` lines 63–119; type
  defs included). We bundle a SPA anyway, so npm beats the CDN script tag. (CDN fixed path is the
  fallback if we ever ship a no-build page.)
- **Hosting** → self-hosted SPA, **HTTPS mandatory, no `#` fragment routing**
  (`registering-liff-apps` line 42: *"URL scheme must be https. URL fragments can't be specified"*).
  Use the **History API** for client routing (`developing-liff-apps` lines 261–281). Host on **S3 +
  CloudFront (OAC)** in the same Pulumi stack; set the **Developing internal channel's Endpoint URL
  = the CloudFront domain root** (`https://dxxxx.cloudfront.net/`) via the **Web app settings** tab
  (`develop-overview` line 148 — each internal channel has its own Endpoint URL, so dev and
  published can point at different hosting). The default `*.cloudfront.net` cert satisfies HTTPS —
  **no custom domain needed for v1.** Optional: LINE MINI App **basic auth** on the Developing
  Endpoint URL locks the webview down pre-release (`develop-overview` lines 142–159).
- **`liff.init()` placement** → SPA entry must be **at or below the Endpoint URL**
  (`developing-liff-apps` lines 227–255). With Endpoint URL = CloudFront root, all routes qualify.
  Do **not** mutate the URL (no `history.pushState`, no redirect) **until the `liff.init()` promise
  resolves** (`developing-liff-apps` lines 261–281).
- **Deep-link to a property** → `https://liff.line.me/{liffId}/p/{propertyId}`. The path after the
  LIFF ID is delivered to the SPA via the **`liff.state`** query param on the primary redirect, then
  merged into the secondary redirect URL (`opening-liff-app` lines 79–106, `developing-liff-apps`
  lines 145–157). The SPA reads its own path **after** `liff.init()` resolves and routes to the
  detail view.
- **Read API transport** → a **new `read-api` Lambda + Function URL** (mirrors the ingest Lambda's
  Function URL — `infra/index.ts:400`; simplest, no API Gateway). `authType: NONE` (public URL),
  **security is the in-handler id-token verification** — identical posture to ingest, whose security
  is the `x-line-signature` check (`infra/index.ts:398-403`). A **`cors` block** on the Function URL
  allows the CloudFront origin + `Authorization` header + `GET`.
- **Backend verification** → call LINE's **Verify ID token endpoint** rather than verifying the JWT
  signature ourselves (`verify-id-token` lines 115–119 endorse the endpoint). Validate `aud ==` the
  MINI App Developing channel id and `exp` not passed; `sub` = userId.
- **`/properties/{id}` authorization** → never trust a raw id. The handler computes the caller's
  **allowed id set** (`listUserConversations(sub)` → `listConversationProperties` per conv) and
  **404s if the requested id isn't in it**, then `getProperty`. Reuses existing repo methods; no new
  method. (Prevents enumerating any property by id.)
- **Photos** → **presign-on-read** in the `/properties/{id}` response (reuse `S3MediaUrlSigner`, 6h
  TTL — `adapters/s3/mediaUrlSigner.ts:8`). List responses presign only the hero.
- **New config** → `LIFF_CHANNEL_ID` = the MINI App **Developing** channel id (`2010316764`) — the
  `aud` to validate. **Plain config, not a secret** — a channel id is public. Pulumi config
  `liffChannelId`, added to `commonEnv`. The **LIFF ID** is also public and baked into the SPA
  build. **Confirm the exact `aud` empirically** by decoding the first real id-token in staging
  (it should equal `2010316764`); if a different value appears, set `liffChannelId` to match it.

---

## Increment A — read-only JSON API (backend; needs `pulumi up`)

A new Lambda behind a Function URL that turns a LIFF id-token into the caller's listings as JSON,
with presigned photo URLs. Reuses `DynamoCatalogRepository` + `S3MediaUrlSigner` unchanged.

**Routes** (all require `Authorization: Bearer <idToken>`):

| Method/path | Returns |
|---|---|
| `GET /me/properties` | `[{ propertyId, title, status, statusBadge, price, area, heroUrl? }]` — the caller's listings (`listPropertiesForUser(sub)`), hero presigned |
| `GET /properties/{id}` | full property DTO + `photos:[{url,kind,label}]` (all presigned) + `mapsUri` + `lat/long` — 404 if not in caller's set |
| `GET /me/upcoming` | `[{ propertyId, propertyTitle, dueAt, title }]` — caller's due follow-ups |

| File | Change |
|---|---|
| `core/ports/lineTokenVerifier.ts` (NEW) | Port: `verifyIdToken(idToken: string): Promise<{ userId: string } \| null>`. Keeps the handler testable with a fake. |
| `adapters/line/lineTokenVerifier.ts` (NEW) | `LineIdTokenVerifier` implementing the port: `POST https://api.line.me/oauth2/v2.1/verify` with `id_token` + `client_id=<liffChannelId>` (form-encoded). On 200, validate `aud === liffChannelId` and `exp*1000 > now`; return `{ userId: payload.sub }`. On non-200 / bad aud / expired → `null`. Inject the channel id + a `clock`. |
| `core/handlers/catalogDto.ts` (NEW) | Pure `Property → JSON DTO` mappers (`toListDto`, `toDetailDto`) reusing `propertyTitle`, `formatPrice`, `mapsUri` (already exported from `views.ts`) + `area`/`statusBadge` (export these two from `views.ts`). No IO — unit-testable. |
| `core/handlers/views.ts` | Export `area` and `statusBadge` (currently private) so the DTO module reuses one source of truth for area string + status badge. |
| `app/readApiHandler.ts` (NEW) | Provider-agnostic handler. Deps: `{ catalog, signer, verifier, logger, clock }`. Steps: extract Bearer token → `verifier.verifyIdToken` → `401` if null; route on method+path; build DTOs; presign hero (list) / all photos (detail); enforce `/properties/{id}` membership (→`404`); JSON + CORS headers. Unknown route → `404`. Errors → `500` (logged, no leakage). |
| `lambda/read-api.ts` (NEW) | `buildDeps` (cold-start singleton like the others): `DynamoCatalogRepository(doc, CATALOG_TABLE)`, `S3MediaUrlSigner(s3, ARCHIVE_BUCKET)`, `LineIdTokenVerifier(LIFF_CHANNEL_ID)`, `PowertoolsLoggerAdapter`. Export `handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2>` delegating to `readApiHandler`. |
| `adapters/config/config.ts` | Add `LIFF_CHANNEL_ID: z.string().min(1).optional()` to `EnvSchema`; the read-api asserts it's present at cold start (like `CATALOG_TABLE` in `processor.ts:37`). |
| `esbuild.config.mjs` | Add a 5th `build({...})`: `entryPoints: ["src/lambda/read-api.ts"], outfile: "dist/read-api/index.mjs"`. |
| `infra/index.ts` | (1) `readApiRole` — **read-only**: `dynamodb:Query`+`GetItem` on `catalogTable.arn` + `…/index/*`; `s3:GetObject` on `archiveBucket.arn/*`; `AWSLambdaBasicExecutionRole`. **No SSM, no writes, no SQS, no Anthropic** (token verify is an outbound HTTPS call with the public `client_id` — no AWS creds, no MINI App secret). (2) `LIFF_CHANNEL_ID` added to `commonEnv` (from a new `config.require("liffChannelId")` — plain, not secret; set to `2010316764` for staging). (3) `readApiLogGroup` + `readApiFn` (Node22 arm64, `dist/read-api`, timeout 10, mem 256) + `read-api-alias`. (4) `readApiUrl = new aws.lambda.FunctionUrl(...)` with `authorizationType: "NONE"` and a `cors` block (`allowOrigins: [<cloudfront domain>]`, `allowMethods: ["GET"]`, `allowHeaders: ["authorization"]`). (5) Output `readApiUrl.functionUrl`. |

**Tests (A):**
- `lineTokenVerifier.test.ts` — fake `fetch`: valid (aud match, unexpired) → `{userId}`; aud mismatch
  → null; expired → null; non-200 → null; malformed JSON → null.
- `readApiHandler.test.ts` — fake catalog + fake signer + fake verifier: missing/invalid token →
  401; `/me/properties` → list DTOs with presigned hero; `/properties/{id}` owned → full DTO +
  presigned gallery; `/properties/{id}` **not owned → 404** (the security case); unknown route →
  404; CORS headers present on every response; signer failure on one photo doesn't 500 the request
  (mirror the swallow-and-filter behavior in `catalogAssistant`).
- `catalogDto.test.ts` — DTO field mapping (price/area/status badge/mapsUri present-only).

---

## Increment B — the SPA (frontend; new package + static hosting; needs `pulumi up`)

A small static SPA. New workspace package so it builds/tests independently of the Lambda bundle.

| File | Change |
|---|---|
| `packages/miniapp/` (NEW workspace) | Vite + TypeScript (React or Preact — small bundle). Deps: `@line/liff` (pinned). Build → static `dist/` (hashed assets + `index.html`). |
| `packages/miniapp/src/liff.ts` | `await liff.init({ liffId: import.meta.env.VITE_LIFF_ID })`; **after** it resolves, read `location.pathname` and route. `getIdToken()` helper. Guard: if `!liff.isInClient() && !liff.isLoggedIn()` → `liff.login()` (`developing-liff-apps` lines 357–382). |
| `packages/miniapp/src/api.ts` | `fetch(READ_API_URL + path, { headers: { Authorization: 'Bearer ' + idToken } })`. `VITE_READ_API_URL` baked at build. |
| `packages/miniapp/src/routes` | `/` List, `/p/:id` Detail+Gallery+Map. History-API router (no hash). On boot, also honor a `liff.state`-derived path so deep links land on `/p/:id`. |
| **List screen** | Cards from `/me/properties`: hero, title, status badge, price, area. Client-side filter chips (status / type / area) + search box (reuse the road/area idea behind `listingsOnRoad`) + sort (price / recency). Unlimited scroll — no 12-card cap. |
| **Detail screen** | All fields from `/properties/{id}` incl. the **chanote/title-deed block** (deed/parcel/survey/map-sheet/land-office/owner/encumbrances/confidence), saved/updated stamps, inline photo strip, **"🗺 Open in Maps"** button using the DTO's `mapsUri`. |
| **Gallery** | All photos, full-screen swipe + pinch-zoom, grouped property → chanote → other with labels (the order the API already returns). |
| **Map** | In-app pin via **Leaflet + OpenStreetMap tiles** (no API key) when `lat/long` present; "Open in Maps" deep-link for navigation. (Avoids a Google Maps Embed API key in v1 — sub-decision, revisit if OSM tiles are unacceptable.) |
| `infra/index.ts` | Site `aws.s3.BucketV2` (private, PAB on); `aws.cloudfront.Distribution` with **OAC** to the bucket, `defaultRootObject: "index.html"`, and a **custom-error-response** mapping 403/404 → `/index.html` (200) so client-side routes resolve. Upload `packages/miniapp/dist` (Pulumi `BucketObjectv2` per file, or a synced asset). Output the CloudFront domain. |
| `esbuild.config.mjs` / root build | The miniapp builds with Vite (its own `build` script picked up by `npm run build --workspaces`). Lambda esbuild is unchanged except the read-api entry from Increment A. |

**A bootstrap ordering note:** the LIFF Endpoint URL = the CloudFront domain, and the SPA needs
`VITE_READ_API_URL` (the read-api Function URL) + `VITE_LIFF_ID`. So: deploy A + the CloudFront/S3
**shell** first to learn the CloudFront domain + Function URL, register the LIFF app to get the LIFF
ID, then rebuild the SPA with those values and re-upload. Documented in Verification.

**Tests (B):** unit where it pays — `liff.state`/path decode, the filter/sort/search predicates,
DTO→view rendering. The end-to-end open-in-LINE path is manual (LIFF can't run in CI).

---

## Increment C — wire entry points (data-plane LINE API; no infra diff)

| File | Change |
|---|---|
| `adapters/line/richMenu.ts` | Add a **"Catalog"** tab whose area uses a **`uri` action → the LIFF URL** (`{ type: "uri", uri: "https://liff.line.me/{liffId}", label }`) instead of a postback. (Rich-menu areas support `uri` actions.) Either replace one of the four tabs or widen to five — TBD with the user. |
| `scripts/setup-rich-menu.ts` | Accept the LIFF URL (env/arg) since it's only known after LIFF registration. |
| `core/handlers/views.ts` (optional) | Add an **"Open in app"** `uri` action on `propertyCard`/`propertyDetail` deep-linking `…/p/{propertyId}` (lets a chat card jump straight into the app). Optional for v1. |

Re-installing the menu is a **data-plane LINE API call, not Pulumi** (per `CLAUDE.md` → Rich menu):
rebuild, then `node packages/bot/dist/scripts/setup-rich-menu.mjs <image>` (idempotent; deletes the
prior `line-robot-main`). Needs the LINE channel access token (the CLAUDE.md recipe).

---

## Manual setup (LINE Developers Console — one-time, in order)

The MINI App channel already exists (`LINE.md`), so this is configuration, not creation.

1. **Sanity-check the provider.** Open the MINI App channel and the Messaging API channel
   (`2010315419`) in the console and confirm they show the **same provider** (`develop-overview`
   78–84; can't be moved later). User has confirmed same account — this is the 30-second visual
   check.
2. **Configure the Developing internal channel** (MINI App channel → **Web app settings**, the
   *Developing* tab): set **Endpoint URL = the CloudFront domain** (from Increment B), **Size
   `Full`**, **Scope `openid`** (`develop-overview` 148; `registering-liff-apps` 41–43). Optionally
   set basic auth here to lock the staging webview (`develop-overview` 142–159).
3. **Note the LIFF ID / LIFF URL** for the MINI App (Web app settings). The app opens at
   `https://miniapp.line.me/{liffId}` or `https://liff.line.me/{liffId}`
   (`opening-liff-app` 65–66).
4. **Set config:** Pulumi `liffChannelId = 2010316764` (the `aud` we validate); `VITE_LIFF_ID = <the
   LIFF ID>` for the SPA build.
5. **Confirm `aud`:** decode the first real id-token in staging and check `aud === 2010316764`; if
   it differs, set `liffChannelId` to the observed value. (One-time certainty check.)
6. (Deferred) For a public launch: submit the **Review** channel for verification, then point the
   **Published** channel (`2010316767`) Endpoint URL at production hosting and switch
   `liffChannelId` to the published id (`submission-guide`).

---

## Verification

- **Unit / lint / typecheck:** `npm run test`, `npm run lint`, `npm run typecheck` (new verifier,
  handler, DTO, SPA predicate tests green).
- **Integration:** existing DynamoDB-Local suite still green (no schema change). Optionally a
  round-trip asserting `/properties/{id}` membership enforcement against a seeded table.
- **Deploy order:**
  1. `npm run build` (esbuild now emits `dist/read-api`) → `cd infra && pulumi up`. Expect
     **additive only**: read-api role+log group+fn+alias+Function URL, site bucket, CloudFront. No
     diff to existing tables/lambdas/roles.
  2. Configure the Developing internal channel's Endpoint URL = CloudFront domain (Manual setup 2);
     capture the LIFF ID.
  3. Set `liffChannelId = 2010316764`; rebuild the SPA with `VITE_LIFF_ID` + `VITE_READ_API_URL`;
     re-upload assets (`pulumi up`).
  4. Wire entry points (Increment C) + re-run the rich-menu script.
- **Manual E2E in LINE:** open the LIFF URL from a chat / the rich menu → **List shows only the
  caller's listings**; tap → Detail + chanote block + Gallery (full-screen) + map pin + Open in Maps
  deep-link; deep-link `…/p/{id}` lands on the right property; a **second LINE user sees only their
  own** listings (access model holds); calling the API **without a token → 401**; requesting a
  **property id you don't own → 404**.
- **Security review:** Function URL is public but every route requires a valid id-token whose `aud`
  equals the MINI App Developing channel id (`verify-id-token`); cross-user fetch is blocked by the membership
  check; the read-api role has **no write / no secret / no SQS** access.

## Risks / things to confirm

- **Provider mismatch** — would silently break `sub → userId`, and is unfixable later. The user
  confirms the MINI App is on the same account; reduced to the 30-second console check + the
  empirical `aud` decode (Manual setup 1, 5).
- **Wrong `aud`/`client_id`** — verification rejects every token if `liffChannelId` doesn't match
  the channel that issued the id-token. Staging should be the Developing id `2010316764`; confirm by
  decoding (Manual setup 5). Switching to the Published channel later means switching this value.
- **`listPropertiesForUser` is O(convs × props) with sequential `getProperty`**
  (`catalogRepository.ts:697-705`). Fine for a broker's volume in v1; a `BatchGetItem` pass is the
  obvious later optimization (ties to the deferred Batch API in plan 10).
- **Detail-route authorization** must check membership, not just `getProperty(id)` — otherwise any
  property is enumerable by id. Enforced in the handler (Decisions).
- **Map without an API key** — Leaflet + OSM tiles avoid a Google key; if tile usage/branding is
  unacceptable, swap to Google Maps Embed (needs a key in SSM + the SPA). Revisit.
- **CloudFront cert / domain** — v1 uses the default `*.cloudfront.net` cert (HTTPS satisfied); a
  custom domain + ACM is a later cosmetic step. Endpoint URL = the cloudfront.net domain.
- **Token-verify latency** — one outbound call to `api.line.me` per request. Optional: cache the
  verified `sub` by id-token hash for a short TTL to cut repeats.
- **LIFF lifecycle** — Full size; no `#` routing; don't touch the URL before `liff.init()` resolves
  (`developing-liff-apps` 261–281); access token revoked on close is irrelevant since we use the ID
  token per request.

## Notes

- **No new tables, GSIs, secrets, or LINE channels** (the MINI App channel already exists). New: 1
  read-only Lambda + role + Function URL, 1 S3 site bucket + CloudFront (OAC), 1 public config var
  (`liffChannelId`), 1 new frontend workspace (`packages/miniapp`).
- **Bot path untouched**; read-only; no LLM; smallest blast radius.
- Deferred to a future increment (not this plan): **share-to-client** (`shareTargetPicker` +
  `chat_message.write`), **in-app edit** (reuse the plan-11 extractor), **Service Message API**
  (`reference/line-mini-app` — server-side "new listing" / confirmation messages, a MINI-App-only
  push channel), **verified MINI App** (submit the Review channel) for public Home/search
  discoverability, **custom path** + OGP for shareable rich previews.

---

## Implementation status (2026-06-07)

**Increments A, B, C are implemented, tested, and the backend + hosting are DEPLOYED to staging.**
All additive — `pulumi preview` was `12 to create, 46 unchanged`; the bot path (ingest/processor/
sweep/reminder) is byte-identical (their `dist/` was not rebuilt, so `LIFF_CHANNEL_ID` was added to
the read-api function env only, not the shared `commonEnv`).

| Piece | State |
|---|---|
| **Inc A — read-api** (`core/ports/lineTokenVerifier.ts`, `adapters/line/lineTokenVerifier.ts`, `core/handlers/catalogDto.ts`, `app/readApiHandler.ts`, `lambda/read-api.ts`, `views.ts` exports, `config.ts`, `esbuild.config.mjs`) | ✅ built + deployed; 27 unit tests |
| **Inc A/B — infra** (read-api role/loggroup/fn/alias/Function-URL + S3 site + CloudFront OAC + bucket policy + per-file uploads, `infra/index.ts`) | ✅ deployed |
| **Inc B — SPA** (`packages/miniapp` — Vite + Preact + `@line/liff` + Leaflet/OSM; List/Detail/Gallery/Map; history-API routing; `liff.state` deep links) | ✅ built + uploaded; 19 unit tests. Functional in LINE only after the LIFF ID is set (below) |
| **Inc C — rich menu** (`richMenu.ts` optional Catalog `uri` tab + `setup-rich-menu.ts` `LIFF_URL`) | ✅ code + 3 tests. Install is a data-plane step in the handoff |

Gates: `npm run lint` ✅, `npm run typecheck` ✅ (bot+miniapp+infra), `npm run test` ✅ (215 bot + 19
miniapp). The deploy policy gained CloudFront perms (`infra/deploy-user-policy.json` → v8 via the
`default`/tea-admin profile). Pulumi `liffChannelId = 2010316764` is set.

### Live staging values (Pulumi outputs)

```
mini-app (LIFF Endpoint URL) : https://d15tyvvqffrn4a.cloudfront.net/
read-api Function URL        : https://tmweeedm2t5nu4p3eyzywous6a0iwpia.lambda-url.ap-southeast-1.on.aws/
site bucket                  : linerobot-staging-miniapp-20260607143557030500000001
```

Verified post-deploy: read-api `→ 401` with no/invalid token (the auth gate); CloudFront serves the
SPA at `/` (200) and resolves deep links (`/p/abc-123 → 200` via the 403/404→`index.html` rule); the
read-api IAM role is read-only (`dynamodb:Query`+`GetItem`, `s3:GetObject` — no write/secret/SQS).
The SPA is currently built with the read-api URL baked in but **no LIFF ID**, so inside LINE it shows
the "open from inside LINE" fallback until the steps below are done.

### Remaining (one-time, in the LINE Developers Console — needs the user)

1. **Provider sanity check** — open the MINI App channel (`2010316764`) and the Messaging API channel
   (`2010315419`); confirm both show the **same provider** (id-token `sub` == our stored `U…` ids
   only if so; can't be changed later). User has confirmed same account.
2. **Web app settings → Developing tab:** set **Endpoint URL = `https://d15tyvvqffrn4a.cloudfront.net/`**,
   **Size = Full**, **Scope = `openid`**. (Optional: basic auth to lock staging.)
3. **Copy the LIFF ID** shown there (format `2010316764-xxxxxxxx`; the LIFF URL is
   `https://liff.line.me/<liffId>`).
4. **Rebuild the SPA with the LIFF ID + re-upload** (build ONLY the miniapp so the bot Lambdas stay
   untouched):
   ```bash
   cd packages/miniapp
   VITE_READ_API_URL="https://tmweeedm2t5nu4p3eyzywous6a0iwpia.lambda-url.ap-southeast-1.on.aws" \
   VITE_LIFF_ID="<liffId>" npm run build
   cd ../../infra
   export PATH="$HOME/.pulumi/bin:$PATH"; export AWS_PROFILE=line-robot
   export PULUMI_CONFIG_PASSPHRASE="$(cat ~/.line-robot-pulumi-passphrase)"
   pulumi up                 # uploads the new dist (4 hashed objects); additive
   ```
5. **Confirm `aud`** — open the LIFF URL once in LINE, then check the read-api log
   (`/aws/lambda/linerobot-staging-read-api`); decode the id-token's `aud` and confirm it equals
   `2010316764`. If it differs, `pulumi config set liffChannelId <value>` and `pulumi up`.
6. **Install the rich-menu Catalog tab** (data-plane, not Pulumi):
   ```bash
   export LINE_CHANNEL_ACCESS_TOKEN="$(cd infra && pulumi config get channelAccessToken)"
   export LIFF_URL="https://liff.line.me/<liffId>"
   npm --prefix packages/bot run build      # or just rebuild dist/scripts/setup-rich-menu.mjs
   node packages/bot/dist/scripts/setup-rich-menu.mjs <menu-image.(png|jpeg)>
   ```

**Open UX decision (Inc C):** the Catalog tab is added as a **5th tab before Help** (least
disruptive — keeps the existing four). Say the word to instead replace Help/Search or reorder.
