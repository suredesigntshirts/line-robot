# Runbook — LINE bot + mini-app (PARKED subsystem — kept for revival)

**Status: parked since 2026-06-15** (see `STATUS.md`). Everything below still exists in AWS and still
runs; nothing is being developed. Kept so the subsystem can be revived without re-discovery.

## What is deployed

- Bot Lambdas `ingest` / `processor` / `sweep` / `reminder` (`packages/bot`, code in
  `packages/bot/dist/*`), the v1 `read-api`, and the mini-app `api` Lambda (`packages/api`, Function
  URL = Pulumi output `miniAppApiUrlOutput`).
- Mini-app SPA (`packages/miniapp`, React 19 + LIFF) at https://d15tyvvqffrn4a.cloudfront.net/ —
  `VITE_API_URL` (the api Function URL) is baked in at build.
- LINE channels (Messaging API OA, MINI App developing/preview/published, LINE Login): ids, secrets,
  LIFF URLs and endpoint URLs are in the gitignored `LINE.md` (template: `LINE.example.md`); the
  secrets are also in Pulumi config (`channelSecret`, `channelAccessToken`, …).
- `scripts/generate-assertion-key.mjs` generates the LINE assertion-signing key pair (public JWK checked in
  at `infra/assertion-public-key.jwk.json`) — optional token-v2.1 hardening, not wired.
- **Built but NOT deployed:** plan-23 Group D (U-D2, DM-claimable listings, commit `103eae9`). Go-live
  is founder-gated: migration 0011 is already applied; remaining steps are a full `npm run build`,
  `pulumi up`, then verify a 1:1 DM listing gets its claim invite. Plan-23 Group B (image-stage
  rewrite) was never started. History: `handbook/archive/plans/23-ingestion-pipeline-audit/`.

## How the flow works (for orientation)

Bot in a LINE group → sweep batches messages → extraction pipeline (`packages/pipeline`) writes
listings to Postgres, private to the group's mirror → the sweep DMs the poster a `/claim/{id}` deep
link (once; skipped for group-less listings) → claim = optimistic lock (concurrent loser gets 409) →
**publish = `grantPublishConsent`** (appears on the website within a refresh); keep-group-private =
withdraw consent. Claim gate needs the poster in `group_membership` (the sweep upserts every batch
sender). CRM: saved, viewings, notes, owner edit form (`/edit/{id}`, claimant-only PATCH).

## Rich menu (one-time, after a deploy)

The persistent nav menu (My Listings / Upcoming / Search / Help) is a **data-plane LINE API call,
not Pulumi infra**. Its shape lives in `packages/bot/src/adapters/line/richMenu.ts`; the tappable
tabs fire the same postbacks the processor's `PostbackRouter` handles. To (re)install it:

```bash
export LINE_CHANNEL_ACCESS_TOKEN="$(cd infra && pulumi config get channelAccessToken)"
npm --prefix packages/bot run build   # bundles dist/scripts/setup-rich-menu.mjs
node packages/bot/dist/scripts/setup-rich-menu.mjs <menu-image.(png|jpeg)>
```

The image is a **2500×843 PNG/JPEG ≤1MB** (`packages/bot/assets/rich-menu.png`); its visuals are cosmetic (the
tap zones are defined by bounds, not the picture). The script is idempotent — it deletes any prior
menu named `line-robot-main` before creating + setting the new one as default.

## MINI App ↔ chat integration (plan 17) — one-time console steps

Deeper chat ↔ MINI App loop on the **unverified** channel (no verification needed):

- **Deep links on the detail card (R1):** set the MINI App base URL so the bot can put an "Open in
  Catalog" button on the Flex detail card: `cd infra && pulumi config set miniappUrl
  https://miniapp.line.me/<liffId>`. Optional — unset just omits the button. Wired into the processor
  env as `MINIAPP_URL`.
- **Share a listing (R3):** `liff.shareTargetPicker` requires a **one-time per-channel consent** —
  LINE console → the MINI App/LIFF channel → **LIFF tab** → agree to **"Agreement Regarding Use of
  Information"**. Done for the current channel on 2026-06-09.
- **Book a viewing (R4):** `POST /properties/{id}/viewings` on the read-api (membership-gated); the
  read-api role has `dynamodb:PutItem` and its Function URL CORS allows `POST` — both via `pulumi up`.
  Rebuild the SPA (`npm run build`) so the booking/share UI ships.

## Mini-app deploy notes

`npm run build` bundles `packages/api/dist/api` + the SPA; `pulumi up` creates/updates the api
Lambda, Function URL and role. Migration `0008` (claim columns + `listing_note`) and later must be
applied before the SPA build that ships (`migrations.md`). Auth: LIFF id-token verification, `aud` =
the MINI App channel; no `@line/liff` SDK anywhere in `packages/api`.
