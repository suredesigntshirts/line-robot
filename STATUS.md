# STATUS — verified on 2026-09-05

(One file. Rewrite it, never append. If anything elsewhere disagrees, this wins.)

## Direction

Website-first Thai property marketplace (Northern Thailand). The LINE bot/mini-app that seeded the
catalog is PARKED (still deployed, not being developed). Next product step: listing supply for the
website (decision D27 in `DECISIONS.md`).

## Live

- Website https://d15dpmhcgtrf1r.cloudfront.net/ (th `/`, en `/en/`) — Astro 6 SSR, Lambda + CloudFront;
  deployed 2026-09-05, HEAD `7fda50b`; deployed e2e 184 passed / 4 skipped.
- Postgres RDS `linerobot-staging-pg` (t4g.micro, public + TLS), migrations 0000–0011 applied.
- Catalog: 20 public listings = 5 real + 15 seed (seed still published — see Open decisions).

## Parked (deployed, untouched since 2026-06-15)

- Bot Lambdas ingest/processor/sweep/reminder, read-api, miniapp-api; mini-app SPA at
  https://d15tyvvqffrn4a.cloudfront.net/. Plan-23 U-D2 bot code (DM-claimable listings) is built
  but NOT deployed (needs the founder go-live; migration 0011 it needs IS applied). Plan-23 Group B
  (image-stage rewrite) never started.
- Revival notes: `handbook/runbooks/line-bot.md`. History: `handbook/archive/plans/README.md`.

## In progress

- nothing (as of the verified date)

## Next

1. D27 listing-supply form for the website (own plan; re-uses the extraction pipeline).
2. Unpublish the 15 seed listings on staging (a deliberate data change — do it separately).
3. Pick a browse filter variant (`a`/`b`/`c` via `?ui=`; `a` is the default today).
4. Brand name (placeholder "ทรัพย์ดี / Sapdee").
5. Legal copy review (privacy/terms are model-drafted; entity name/address blank).
6. Larger photo derivatives for the lightbox (thumbs are 640px).

## Open decisions

Defaults taken in plan 24 §0 (2026-09-05) — the founder may overturn any of them:

1. **Listing supply** after the bot pivot → website submission form re-using the extraction pipeline
   (D27, *planned*, own plan later).
2. **Bot / mini-app AWS resources** → stay deployed, declared PARKED here. No teardown until the
   form exists.
3. **History** → archived under `handbook/archive/`; session memory + unused vendor caches deleted.
4. **Review machinery** → free gate + Playwright e2e + `/frontend-review` (opt-in). Multi-agent
   review skills and budget protocol archived.
5. **Brand** stays the placeholder "ทรัพย์ดี / Sapdee"; **legal copy** stays "draft — review before
   real users". Neither is solved.

Under review in `DECISIONS.md` (the supply decision may change them): **D5** (LINE Login primary)
and **D7** (poster opt-in is the only path to public).

## How to work here

`CLAUDE.md` → `handbook/runbooks/`. Free gate: `npm run lint` · `npm run typecheck` · `npm run test` ·
`npm run test:e2e -w @line-robot/website`.
