# STATUS — verified on 2026-09-05

(One file. Rewrite it, never append. If anything elsewhere disagrees, this wins.)

## Direction

Website-first Thai property marketplace (Northern Thailand). The LINE bot/mini-app that seeded the
catalog is PARKED (still deployed, not being developed). Next product step: listing supply for the
website (decision D27 in `DECISIONS.md`).

## Live

- Website https://d15dpmhcgtrf1r.cloudfront.net/ (th `/`, en `/en/`; browse lives at `/properties`) — Astro 6 SSR, Lambda + CloudFront;
  deployed 2026-09-05, commit `7fda50b`; deployed e2e 184 passed / 4 skipped.
- Postgres RDS `linerobot-staging-pg` (t4g.micro, public + TLS), migrations 0000–0011 applied.
- One environment: the Pulumi stack `staging` is the only stack (production was never stood up; the
  plan-07 prod rollout did not happen). The live website runs on it.
- Catalog: 20 public listings = 5 real + 15 seed rows published by `db:seed` (it creates more rows than
  it publishes; seed still public — see Next #2).

## Parked (last deployed 2026-06-15; code untouched since 2026-06-16; two crons still fire)

- Bot Lambdas ingest/processor/sweep/reminder, read-api, miniapp-api; mini-app SPA at
  https://d15tyvvqffrn4a.cloudfront.net/. The deployed build includes **Stage 6 groups & dealflow**
  (exclusivity windows, roles/vetting, interest / quick-sale / quotes, admin moderation queue —
  `packages/api` + `db` + `miniapp`, migrations 0009–0010), stage-gated PASS-WITH-CONDITIONS 2026-06-15.
- Still running: the sweep (EventBridge `rate(2 minutes)`) and reminder (`rate(15 minutes)`) schedules
  fire continuously (last sweep log 2026-09-05 14:06 UTC). No inbound LINE traffic since 2026-06-17
  04:21 UTC (last ingest/processor log), so no extraction and no Anthropic spend — the invocations are
  idle. Disabling the two rules is a Pulumi change (Open decisions #6).
- Plan-23 U-D2 bot code (DM-claimable listings, commit `103eae9`, 2026-06-16) is built but NOT deployed
  (founder go-live; migration 0011 it needs IS applied). Plan-23 Group B (image-stage rewrite) never started.
- Revival notes: `handbook/runbooks/line-bot.md`. History: `handbook/archive/plans/README.md`.

## In progress

- nothing (as of the verified date)

## Next

1. D27 listing-supply form for the website (own plan; re-uses the extraction pipeline).
2. Unpublish the 15 seed listings on staging (a deliberate data change on staging — the founder triggers it; never do it unprompted).
3. Pick a browse filter variant (`a`/`b`/`c` via `?ui=`; `a` is the default today).
4. Brand name (placeholder "ทรัพย์ดี / Sapdee").
5. Legal copy review (privacy/terms are model-drafted; entity name/address blank).
6. Larger photo derivatives for the lightbox (thumbs are 640px); presigned photo URLs live 1h, so a cached
   `og:image` link can go stale.
7. Deferred website items: LINE Login / accounts (needs the real domain, D19), Thai-slug URLs.

## Deferred (survivors of the archived 2026-06 backlog — not scheduled)

- Owner submission form (BACKLOG 4.5 / stage-4 S4-I8: async handoff into the pipeline, the D12 web
  path) — the prior art for D27.
- LINE Login on the web (4.4); email/Google OAuth + account-linking UX (4.6; schema exists since Stage 1).
- Moderation block-wiring (S6-11): approving a `moderation_item` does not yet gate or publish a listing —
  publish consent is the only visibility gate. Matters once the website is the write path (D27).
- Batch cron wiring (A4d): the Anthropic Batch transport is built (`packages/pipeline/src/batch`) but
  the live sweep is not routed through it.
- Eval Tier A: real anonymised golden set + LLM-judge scorers (A7 / 0.2).
- Data: the 5 real listings' group pseudo-user `display_name` is the raw group key (4.11); the website
  hides it (D30) but ingest still writes it.

Sources: `handbook/archive/2026-06-sprint/BACKLOG.md`, `handbook/archive/skill-hardening/FOUNDER-QUEUE.md`
(their OPEN rows are not live tracking — this section and Open decisions are).

## Open decisions

Defaults taken in plan 24 §0 (2026-09-05, `handbook/archive/plans/24-context-cleanup.md`) — the founder may overturn any of them:

1. **Listing supply** after the bot pivot → website submission form re-using the extraction pipeline
   (D27, *planned*, own plan later).
2. **Bot / mini-app AWS resources** → stay deployed, declared PARKED here. No teardown until the
   form exists.
3. **History** → archived under `handbook/archive/`; unused vendor caches deleted; session memory
   pruned to preferences + gotchas.
4. **Review machinery** → free gate + Playwright e2e + `/frontend-review` (opt-in, founder-invoked — a
   session cannot call it). Multi-agent
   review skills and budget protocol archived.
5. **Brand** stays the placeholder "ทรัพย์ดี / Sapdee"; **legal copy** stays "draft — review before
   real users". Neither is solved.
6. **Bot schedules** — the sweep/reminder EventBridge rules still fire every 2 / 15 minutes on a parked
   system. Disable them (a Pulumi change) or accept the idle invocations.

Under review in `DECISIONS.md` (the supply decision may change them): **D5** (LINE Login primary)
and **D7** (poster opt-in is the only path to public).

## How to work here

`CLAUDE.md` → `handbook/runbooks/`. Free gate: `npm run lint` · `npm run typecheck` · `npm run test` ·
`npm run test:e2e -w @line-robot/website`.
