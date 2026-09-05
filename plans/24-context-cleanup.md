# Plan 24 — Repo context cleanup (executable spec)

**Status: READY TO EXECUTE.** Written 2026-09-05 at the end of the website-polish session. This is
a docs-and-layout reorganisation. **It changes no product code.** Paste `plans/24-context-cleanup-prompt.md`
into a fresh session to run it.

---

## 0. Read this first

**Scope.** Make this repo legible to a fresh session: one entry point, one status file, one
decision log, runbooks separate from history, history archived and labelled, the vendor-doc cache
kept pure, the session-memory directory truthful, process machinery cut to what a solo founder uses.

**Guardrails (hard).**
- No edits under `packages/`, `infra/`, or `spikes/` except the path/comment rewrites listed in §3
  step 3 and the new `packages/website/CLAUDE.md`. No deploys. No database or AWS mutations.
- Archive by `git mv` only. Never edit the body of an archived file; only the index README is new prose.
- Never delete: `LINE.md` (gitignored credentials), `.env`, `infra/Pulumi.*.yaml`, anything under
  `packages/website/test/fixtures`.
- Every step is its own commit with the message given. Stop and ask only if a guardrail blocks you.
- The rituals in the CURRENT root `CLAUDE.md` (increment-review, alignment-review, budget polling,
  real-API eval) do **not** apply to this task. Free gate only: `npm run lint`, `npm run typecheck`.

**Decisions taken (defaults — the founder edits this block before running if they disagree).**
1. Listing supply after the bot pivot → a website submission form re-using the extraction pipeline
   (its own plan later; NOT built here). Record in DECISIONS as D27, status *planned*.
2. Bot / mini-app AWS resources → stay deployed, declared **PARKED** in STATUS. No teardown now.
3. History → **archive** under `handbook/archive/` (plans, sprint logs, hardening logs, spike findings).
   Session-memory files and unused vendor caches → **delete** (git / re-fetch cover them).
4. Review machinery → keep the free gate + Playwright e2e + `/frontend-review` (opt-in). Archive
   `/increment-review`, `/alignment-review`, the `.claude/workflows/*` scripts, the budget protocol.
5. Brand stays the placeholder "ทรัพย์ดี / Sapdee"; legal copy stays "draft — review before real
   users". Both recorded as open decisions in STATUS, not solved here.

## 1. Principles (the why, one line each)

1. One entry point that points, never restates.
2. State / procedure / history are three document kinds; never mix them in one file.
3. Plans are ephemeral; decisions are durable; status is dated and rewritten, not appended.
4. Package gotchas live next to the code.
5. Session memory (outside the repo) holds preferences + gotchas only, never status.
6. Process proportionate to the team.
7. Parked subsystems are declared parked in one place, with what still runs.
8. Boring names a session can guess: `STATUS.md`, `DECISIONS.md`, `handbook/runbooks/`.
9. `docs/` is reserved for the `/documentation-downloader` vendor cache (`docs/llms.txt` is
   hardwired in that skill and in `~/.claude/CLAUDE.md`). Project-authored docs live in `handbook/`.
10. Acceptance test: a fresh session answers "what is this repo, what is live, what is next?"
    correctly from `CLAUDE.md` + `STATUS.md`, two reads, no contradiction.

## 2. Target layout

```
CLAUDE.md                 ≤ 80 lines (§4.4)
README.md                 NEW (§4.3)
STATUS.md                 NEW, the only live status (§4.1)
DECISIONS.md              NEW, decision log (§4.2)
LINE.example.md           NEW, blank template; LINE.md stays gitignored and untouched
handbook/
  runbooks/{local-dev,deploy,testing,migrations,aws-identities,line-bot}.md   (§4.5)
  product/vision.md                                                            (§4.6)
  research/               git mv docs/research   (headers frozen, §3 step 5)
  design/                 git mv docs/design      (skill-hardening/ moves on to archive)
  archive/
    README.md             one paragraph: "history; do not treat as current"
    2026-06-sprint/       SPRINT-LOG.md MORNING.md BLOCKERS.md BACKLOG.md KHAIFAK.md WEBSITES.md line-mini-app-qr*.png
    plans/                plans/00–23 (files + subdirs) + plans/cleanup/ + README.md outcome table (§4.7)
    skill-hardening/      from docs/design/skill-hardening
    spikes/               spikes/*/FINDINGS.md only
    claude/               .claude/skills/{increment-review,alignment-review}, .claude/workflows/, .claude/low-token-cleanups.md
docs/                     vendor caches for the stack only + llms.txt (§3 step 8)
plans/
  README.md               "One active plan at a time; archived plans → handbook/archive/plans."
  24-context-cleanup.md   (this file — moved to the archive as the final commit)
packages/website/CLAUDE.md   NEW: the website section lifted out of root CLAUDE.md
packages/db/CLAUDE.md        keep as is
.claude/skills/frontend-review/   keep;  .claude/skills/… others archived;  settings.json keep
```

## 3. Execution order (each step = one commit; message in quotes)

0. `git status` must be clean at HEAD ≥ `39716ea`. `git tag pre-context-cleanup`.
1. **Write the new truth first** — `STATUS.md`, `DECISIONS.md`, `README.md` per §4.1–4.3.
   *"docs(context): STATUS, DECISIONS, README — the single sources of truth"*
2. **`handbook/`** — `git mv docs/research handbook/research`, `git mv docs/design handbook/design`,
   then `git mv handbook/design/skill-hardening handbook/archive/skill-hardening`.
   *"docs(context): move project docs out of the vendor cache into handbook/"*
3. **Rewrite references.** `grep -rn 'docs/research\|docs/design' --include='*.md' --include='*.ts' --include='*.tsx' --include='*.astro' --include='*.mjs' . | grep -v node_modules | grep -v '^./handbook/archive/'`
   and replace `docs/research` → `handbook/research`, `docs/design` → `handbook/design` in every
   hit that is NOT under `handbook/archive/` (archived bodies keep their old paths). Known code hits
   are comments/strings only: `packages/ui/src/i18n/th.ts`, `packages/website/src/lib/browse.ts`,
   `packages/website/e2e/capture.spec.ts`, `.claude/skills/*/`. Re-run the grep → 0 hits outside the
   archive. Then `npm run lint && npm run typecheck`.
   *"docs(context): repoint research/design references to handbook/"*
4. **Archive history** — `git mv` the root status files + KHAIFAK/WEBSITES/QR PNGs to
   `handbook/archive/2026-06-sprint/`; `plans/00-*.md … 23-*.md`, their subdirs, and `plans/cleanup/`
   to `handbook/archive/plans/`; `spikes/*/FINDINGS.md` to `handbook/archive/spikes/` then
   `git rm -r spikes` (drop the checked-in spike app; its untracked node_modules just gets deleted);
   write `handbook/archive/README.md` and `handbook/archive/plans/README.md` (§4.7);
   write `plans/README.md`.
   *"docs(context): archive 2026-06 sprint logs, plans 00–23, spikes"*
5. **Freeze research headers** — in each `handbook/research/*.md` (incl. `00-product-principles.md`)
   replace the first `**Status: …**` line with `**Status: FROZEN 2026-09 — reference material; the
   heuristic register (§4 of 00-product-principles.md) is the live design checklist.**` Body untouched.
   *"docs(context): freeze research artifact headers"*
6. **Runbooks + product** — write `handbook/runbooks/*.md` and `handbook/product/vision.md` per
   §4.5–4.6, lifting text from the current root `CLAUDE.md`, `packages/db/CLAUDE.md` (keep that file),
   and plan 19 §2. *"docs(context): runbooks + product vision extracted from CLAUDE.md"*
7. **CLAUDE.md** — write `packages/website/CLAUDE.md` (the current "v2 public website" section,
   verbatim, minus the deferred-tail bullet which goes to STATUS), then rewrite root `CLAUDE.md` per
   §4.4 (≤ 80 lines; `wc -l` proves it). *"docs(context): CLAUDE.md is an 80-line map; website rules move to packages/website"*
8. **Vendor cache** — under `docs/` delete: `bun.sh/ bun.sh.md cockroachlabs.com/ developers.cloudflare.com/
   docs.netlify.com/ docs.turso.tech/ effect-ts.github.io/ effect.website/ expo.dev.md learn.microsoft.com/
   neon.com/ neon.com.md sqlite.org/ thenile.dev/ thenile.dev.md pub.dev/ github.com/`
   (github.com holds only drizzle-studio-expo + neon serverless notes; pub.dev is Dart — neither used).
   Remove their `## <domain>` sections from `docs/llms.txt`. If the downloader skill's
   `scripts/compare-docs.js` is available, run it to validate the index. `docs/` must then contain
   only stack domains + `llms.txt`. *"docs(context): prune vendor doc caches to the stack in use"*
9. **`.claude/`** — `git mv .claude/skills/increment-review .claude/skills/alignment-review .claude/workflows .claude/low-token-cleanups.md handbook/archive/claude/`.
   Keep `frontend-review` and `settings.json`. In `frontend-review/SKILL.md`, if it references the
   archived skills or `docs/design`, fix the references (step 3 may have done `docs/design`).
   *"docs(context): archive multi-agent review skills and workflows; keep frontend-review"*
10. **Session memory** (`~/.claude/projects/-home-user-src-line-robot/memory/`, outside git):
    extract the "16 nullable structured-output params" incident (deploy-status.md ≈ lines 995–1001)
    into `gotchas.md` (≤ 15 lines); delete `deploy-status.md`, `sprint-01-overnight-outcome.md`,
    `v2-redesign-direction.md`, `frontend-architecture-conformance.md`,
    `quality-loop-perceptually-blind.md`, `cleanup-patterns.md`, `usage-monitoring.md`,
    `numbered-plans.md`; keep `pulumi-backend.md`, `aws-environment.md`, `user-aws-familiarity.md`;
    rewrite `MEMORY.md` to ≤ 8 lines: one line per kept file + "Live status: STATUS.md in the repo".
    No commit (not in git) — note it in the final report.
11. **Verify** (§5). Fix what fails. Then `git mv plans/24-context-cleanup.md plans/24-context-cleanup-prompt.md handbook/archive/plans/`
    and add the row to the outcome table. *"docs(context): plan 24 done — archived"*
12. `git push`.

## 4. New files — required content

### 4.1 `STATUS.md`
```
# STATUS — verified on <YYYY-MM-DD>
(One file. Rewrite it, never append. If anything elsewhere disagrees, this wins.)
## Direction
Website-first Thai property marketplace (Northern Thailand). The LINE bot/mini-app that seeded the
catalog is PARKED (still deployed, not being developed). Next product step: listing supply for the
website (decision D27).
## Live
- Website https://d15dpmhcgtrf1r.cloudfront.net/ (th /, en /en/) — Astro 6 SSR, Lambda+CloudFront;
  deployed <date>, HEAD <sha>; deployed e2e 184 passed / 4 skipped.
- Postgres RDS linerobot-staging-pg (t4g.micro, public+TLS), migrations 0000–0011 applied.
- Catalog: 20 public listings = 5 real + 15 seed (seed still published — see Open decisions).
## Parked (deployed, untouched since 2026-06-15)
- Bot Lambdas ingest/processor/sweep/reminder, read-api, miniapp-api; mini-app SPA at
  https://d15tyvvqffrn4a.cloudfront.net/. Plan-23 U-D2 bot code is built but NOT deployed (needs
  the founder go-live; migration 0011 it needs IS applied). Plan-23 Group B never started.
## In progress
- nothing (as of the verified date)
## Next
1. D27 listing-supply form (own plan). 2. Unpublish seed listings. 3. Pick a browse filter variant
   (a/b/c, ?ui=). 4. Brand name. 5. Legal copy review. 6. Larger photo derivatives for the lightbox.
## Open decisions
(the five from plan 24 §0 + D5/D7 "under review" from DECISIONS)
## How to work here
CLAUDE.md → handbook/runbooks/. Free gate: npm run lint · typecheck · test · test:e2e -w @line-robot/website.
```

### 4.2 `DECISIONS.md`
Table: `id · date · decision · status (active | superseded by … | under review) · source`.
Rows: D1–D26 from `handbook/archive/plans/19-v2-marketplace-rebuild.md` §3 (copy the one-line
gist, not the rationale); DF-1…DF-8 from `handbook/research/00-product-principles.md` §3;
the plan-21 rulings (Direction A tokens, Pulumi adapter supersedes TECH-12); the 2026-09 rulings:
D27 website-first / bot parked, D28 UI template variants via `?ui=`, D29 brand placeholder,
D30 poster pseudo-ids never rendered. Mark **D5** (LINE Login primary) and **D7** (poster opt-in is
the only public path) *under review* — the supply decision may change them. Everything else active.

### 4.3 `README.md`
≤ 60 lines, human-facing: one-paragraph product description (from plan 19 §2 + pivot), stack
(Astro 6 SSR · React islands · Tailwind v4 + shadcn · Postgres/PostGIS · Pulumi/AWS ·
Anthropic pipeline · LINE bot parked), monorepo map (one line per package), quick start
(`npm i`, `npm run dev:staging -w @line-robot/website`, `npm run test:e2e -w @line-robot/website`),
links to STATUS, DECISIONS, handbook/runbooks.

### 4.4 Root `CLAUDE.md` (≤ 80 lines) — exact sections, in order
1. **What this is** (3 lines) + **Direction** (2 lines, points at STATUS.md).
2. **Where things live** (a 10-line map: STATUS, DECISIONS, handbook/*, docs/ = vendor cache via
   `/documentation-downloader`, plans/ = one active plan, packages/*, infra/).
3. **Commands** (typecheck, lint, test, test:e2e, dev:staging, build, deploy → runbook link).
4. **Rules** (≤ 10 bullets): docs-first for external APIs (global rule); no adapter imports in
   core / db public barrel only; Tailwind utilities + tokens, never inline styles; every frontend
   change runs the Playwright gate; model-facing changes need real-API validation; migrations via
   drizzle + `packages/db/CLAUDE.md`; website-only builds when deploying the website; never commit
   secrets (`LINE.md`, `.env`); Thai copy rules live in the register.
5. **Gotchas** (≤ 6 bullets, one line each, link to runbooks for detail).
6. **Package guides**: `packages/website/CLAUDE.md`, `packages/db/CLAUDE.md`.
Nothing about budgets, overnight runs, review panels, or LINE console steps.

### 4.5 `handbook/runbooks/`
- `local-dev.md` — dev:staging (what it connects to), the offline e2e server, ports, Docker note.
- `deploy.md` — the Pulumi block from CLAUDE.md, passphrase file rule, **website-only build rule
  and why** (undeployed plan-23 bot code), preview must be website-only, post-deploy gate
  (`test:e2e:deployed`), the Sept-2026 migration-0011 note.
- `testing.md` — what each suite proves (unit, db integration, website e2e projects and specs,
  the smokes, the review gallery, `e2e/adhoc/shoot.mjs`).
- `migrations.md` — from `packages/db/CLAUDE.md` + the staging apply command (keep db's file too).
- `aws-identities.md` — the profiles/policy section from CLAUDE.md.
- `line-bot.md` — rich menu + MINI App console steps + plan-17 manual steps, headed
  "PARKED subsystem — kept for revival".

### 4.6 `handbook/product/vision.md`
Plan 19 §2 (six points) verbatim, then a dated "2026-09 pivot" paragraph: website first, bot
parked, why (bot quality/effort vs. the website being the user-facing asset), what carries over
(catalog, pipeline, tokens, e2e discipline).

### 4.7 `handbook/archive/plans/README.md` — outcome table (fill from these facts)
| plans | what | outcome |
|---|---|---|
| 00–08 | v1 LINE echo bot → staging/prod rollout, hardening | built + deployed June 6–7 2026 |
| 09–13 | v1 catalog assistant, GSI3, richer details, listing depth, chanote OCR | built; plan 12 caused the 16-nullable-params outage, fixed in 13 |
| 14, 17 | v1 LIFF mini-app + deep-chat integration | built; retired by v2 Stage 5 |
| 15, 16, cleanup/ | domain type-safety, pattern consolidation, cleanup dossier | 16 + dossier executed June 8; 15 deferred |
| 18 | geo dedup design | absorbed into v2 Stage 2 |
| 19 (+stages) | v2 marketplace rebuild | Stages 0–6 built and gated; 7 skeleton; superseded by the 2026-09 website-first pivot (decisions live in DECISIONS.md) |
| 20 | frontend visual e2e | built; lives in packages/website/e2e |
| 21 | Tailwind v4 + shadcn conformance, Direction A | built |
| 22 | instruction-surface cleanup | never executed; superseded by 24 |
| 23 | ingestion pipeline audit | Groups A, C, D built (D not deployed); B not started; parked with the bot |
| 24 | context cleanup | executed <date> |

## 5. Verification (all must pass before step 11)

```
wc -l CLAUDE.md                                   # ≤ 80
ls *.md                                           # CLAUDE.md DECISIONS.md LINE.example.md README.md STATUS.md (LINE.md untracked)
ls docs | grep -vE '^(llms.txt|account.line.biz|api.pulumi.com|developers.line.biz|docs.astro.build|docs.aws.amazon.com|liff-playground.netlify.app.md|miniapp.line.me|node-postgres.com|nodejs.org|orm.drizzle.team|orm.drizzle.team.md|platform.claude.com|postgis.net|postgresql.org|pulumi.com|tailwindcss.com|terms2.line.me|ui.shadcn.com)$'   # empty
ls plans                                          # README.md only (after step 11)
grep -rn 'docs/research\|docs/design' --include='*.md' --include='*.ts' --include='*.tsx' --include='*.astro' --include='*.mjs' . | grep -v node_modules | grep -v '^./handbook/archive/'   # empty
grep -rln 'SPRINT-LOG\|MORNING.md\|BLOCKERS.md\|BACKLOG.md\|increment-review\|alignment-review\|check-usage' CLAUDE.md README.md STATUS.md handbook/runbooks packages/*/CLAUDE.md .claude/skills   # empty
npm run lint && npm run typecheck && npm run test -w @line-robot/website -w @line-robot/ui   # green
ls ~/.claude/projects/-home-user-src-line-robot/memory/   # MEMORY.md aws-environment.md gotchas.md pulumi-backend.md user-aws-familiarity.md
```
Then the acceptance test: read ONLY `CLAUDE.md` and `STATUS.md` and write, in the final report,
the answers to "what is this repo / what is live / what is next / what is parked / where are the
deploy steps". If any answer needed another file, fix the two files, not the answer.

## 6. Final report format
1. Commits made (sha · message). 2. Verification output (the commands above, pass/fail).
3. The acceptance-test answers. 4. Memory-dir changes (not in git). 5. Anything skipped and why.
