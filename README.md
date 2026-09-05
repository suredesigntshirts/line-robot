# line-robot — Thai property marketplace (Northern Thailand)

A bilingual (Thai / English) real-estate marketplace for Northern Thailand. Listings were seeded by
a LINE bot that sat in broker/owner group chats and extracted structured listings with an LLM
pipeline (Anthropic); posters could claim and publish them through a LINE mini-app. Since
2026-09 the product is **website-first**: the public Astro site is the user-facing asset, the bot
and mini-app are **parked** (deployed, not developed), and the next step is listing supply for the
website (see `STATUS.md` and decision D27 in `DECISIONS.md`).

## Stack

Astro 6 SSR (Lambda + CloudFront) · React 19 islands · Tailwind v4 + owned shadcn primitives ·
Postgres 17 / PostGIS on RDS (drizzle) · Pulumi → AWS ap-southeast-1 · Anthropic extraction
pipeline · LINE Messaging API / LIFF (parked).

## Monorepo map

| path | what |
|---|---|
| `packages/website` | Public site — Astro SSR pages, browse/detail, SEO, theme; the live product |
| `packages/ui` | Shared React components, shadcn primitives, `theme.css` tokens, i18n catalogs (th/en) |
| `packages/db` | drizzle schema, migrations, `pg` pool, repository functions (the public barrel) |
| `packages/domain` | zod types and enums — the vocabulary every package imports |
| `packages/shared` | Small cross-package helpers (datetime, DTOs) |
| `packages/pipeline` | LLM extraction / segmentation / dedup / quality gate + the eval scorecard |
| `packages/bot` | LINE bot Lambdas (ingest, processor, sweep, reminder, read-api) — parked |
| `packages/api` | Mini-app HTTP backend (Lambda Function URL) — parked |
| `packages/miniapp` | LINE mini-app React SPA (LIFF) — parked |
| `infra` | Pulumi program for the whole stack (staging) |
| `handbook/` | Runbooks, product vision, research, design, archive |
| `docs/` | Cached vendor documentation (`/documentation-downloader`), indexed by `docs/llms.txt` |

## Quick start

```bash
npm i
npm run dev:staging -w @line-robot/website     # Astro dev server against the staging DB + photo bucket
npm run test:e2e -w @line-robot/website        # real build + seeded Docker Postgres + Playwright gate
npm run lint && npm run typecheck && npm run test
```

`dev:staging` needs the `line-robot` AWS profile and the Pulumi passphrase file; the e2e gate
needs Docker. Details: `handbook/runbooks/local-dev.md`.

## Where to read next

- `STATUS.md` — what is live, parked, in progress, next (verified-on date at the top).
- `DECISIONS.md` — the decision log (D1–D30, founder rulings).
- `handbook/runbooks/` — local dev, deploy, testing, migrations, AWS identities, LINE bot.
- `handbook/product/vision.md` — the product vision and the 2026-09 pivot.
- `CLAUDE.md` — the map an AI session reads first.
