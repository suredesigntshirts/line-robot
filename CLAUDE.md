# CLAUDE.md — line-robot

## What this is

Bilingual (th/en) property marketplace for Northern Thailand: a public Astro 6 SSR website over a
Postgres/PostGIS catalog that an LLM extraction pipeline fills. The LINE bot + mini-app that fed the
catalog are PARKED (deployed, not developed). npm-workspaces monorepo, TypeScript, Pulumi on AWS.

**Direction:** website first; the next step is listing supply for the website (D27). What is live,
parked, in progress and next is in `STATUS.md` (dated; it wins over every other file). Read it first.

## Where things live

- `STATUS.md` — the only live status. `DECISIONS.md` — decision log (D1–D30, founder rulings).
- `handbook/runbooks/` — local-dev, deploy, testing, migrations, aws-identities, line-bot (parked).
- `handbook/product/vision.md` — product vision + the 2026-09 pivot.
- `handbook/research/` — frozen research; `00-product-principles.md` §4 is the heuristic register.
- `handbook/design/` — design direction (Direction A trust-blue), mockups (the visual bar), tokens.
- `handbook/archive/` — history only (2026-06 sprint logs, plans 00–24, skill logs, spikes, old skills).
- `docs/` — cached VENDOR documentation via `/documentation-downloader`; index `docs/llms.txt`.
- `plans/` — one active plan at a time (see its README); finished plans move to the archive.
- `packages/` — website · ui · db · domain · shared · pipeline · bot · api · miniapp (map in the root `README.md`).
- `infra/` — Pulumi program (staging); `infra/deploy-user-policy.json` = the deploy identity's policy.

## Commands

```bash
npm run typecheck && npm run lint && npm run test      # free gate — every change
npm run test:e2e -w @line-robot/website                # frontend gate: real build + Playwright (Docker)
npm run dev:staging -w @line-robot/website             # Astro dev (hot reload) against the staging DB
npm run build -w @line-robot/website                   # website-only build (the deploy prerequisite)
```

Deploy: `handbook/runbooks/deploy.md` (Pulumi, passphrase file, website-only rule, post-deploy gate).

## Rules

1. Docs first for any external API/library: check `docs/llms.txt`, fetch what is missing with
   `/documentation-downloader`, read, then implement (global rule — never guess an API).
2. Hexagonal boundaries: no adapter imports in core; every consumer reads the catalog through the
   `@line-robot/db` public barrel only — never another package's internals.
3. Styling = Tailwind utilities + `packages/ui/theme.css` tokens + owned shadcn primitives. Never
   inline `style=` or bespoke CSS; prefer flipping tokens over `dark:` variants.
4. Every frontend change (`packages/website`, `packages/ui`) runs the Playwright gate before it is
   called done — SSR-string smokes are blind to an unstyled page.
5. Model-facing changes (prompts, extraction/segmentation/dedup/gate logic, schemas, model tiers) are
   validated on the real Anthropic API (`EVAL_LLM=anthropic npm run eval`, real-model integration
   tests), not only the fakes. The eval is advisory (D21): run it, read the delta, then judge.
6. Migrations: zod enums in `packages/domain` → `packages/db/src/schema.ts` → `npm run generate -w
   @line-robot/db` → the hand-fixes in `packages/db/CLAUDE.md`; apply per `handbook/runbooks/migrations.md`.
7. Deploying the website: build ONLY `@line-robot/website`; `pulumi preview` must show only `website-*`
   changes. Undeployed, founder-gated bot code sits at HEAD — a root `npm run build` would ship it.
8. Never commit secrets: `LINE.md` (gitignored; template `LINE.example.md`), `.env`, browser cookies.
   The Pulumi passphrase lives only in `~/.line-robot-pulumi-passphrase`.
9. Thai/English copy follows the register (`handbook/research/00-product-principles.md` §4) and lives
   in `packages/ui/src/i18n/{th,en}.ts`; the brand name is the placeholder `site.name` key.

## Gotchas

- `docs/` is the vendor cache, not project docs — project prose goes in `handbook/`.
- Third-party Thai sites: automate HEADED as a real user (th-TH, Asia/Bangkok, human pacing) — our
  own site runs headless. Details in `handbook/runbooks/testing.md`.
- Anthropic strict structured output caps a schema at 16 nullable/union params; exceeding it 400s
  every call (the plan-12 outage). Use sentinels (`""`, `[]`) instead of `.nullable()`.
- RDS TLS: `pg` verifies against the embedded RDS CA (`packages/db/src/rdsCa.ts`); never
  `sslmode=no-verify` / `rejectUnauthorized:false`.
- SSR HTML is no-cache on purpose: photo thumbs are presigned at SSR time (1h) and the bucket stays private.
- Staging schema must be at HEAD before deploying anything built from HEAD (`deploy.md`, 0011 note).

## Package guides

- `packages/website/CLAUDE.md` — pages, UI variants (`?ui=`), theme/tokens, photos, SEO, tests.
- `packages/db/CLAUDE.md` — migration hand-fixes, the single pool, TLS rules.
