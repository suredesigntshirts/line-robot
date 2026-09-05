# Plan 24 — Repo context cleanup (handoff for a fresh session)

**Status: PROPOSAL, not started.** Written 2026-09-05 at the end of the website-polish session,
before clearing context. Execute in a new session, top to bottom. Nothing here touches code.

## 0. The problem, stated once

The code is in good shape (typecheck, lint, 184 e2e, smokes all green; site deployed). The
*context* is not: a new session meets 6 overlapping status files, a 240-line CLAUDE.md that is
half process ritual and half ops runbook, 24 numbered plans whose headers say "pending approval"
while their bodies say "shipped", a 1,181-line memory file, 30 cached vendor-doc folders, and a
LINE bot subsystem that is parked but nowhere says so. Every one of those is a place a session can
read something false and act on it.

## 1. First principles (why the layout below looks the way it does)

1. **One entry point, short, current, and it points — it does not restate.** `CLAUDE.md` is what
   every session reads first. It must fit in one screen of attention and link to the one canonical
   home of each topic. Anything copied into it is a second copy that will drift.
2. **Three kinds of document, never mixed in one file:**
   - **State** — what is true *now* (what is live, what is in progress, what is next, what is
     undecided). Exactly one file. Dated. Rewritten, not appended.
   - **Procedure** — how to do a thing (deploy, run locally, migrate, test). Runbooks. Rarely change.
   - **History** — what happened (sprint logs, retros, old plans, audits). Append-only, archived,
     never consulted for "what is true now".
   Most of the current confusion is history dressed as state (MORNING.md, BLOCKERS.md, plan
   headers) and procedure buried inside the entry point.
3. **Plans are ephemeral; decisions are durable.** A plan is either *the* active plan or archived
   with its outcome. Its lasting output is a decision, which goes in a decision log, and a change
   to STATUS. Twenty-four live-looking plans is the sprawl itself.
4. **Status carries a "verified on" date and an owner of truth.** If two files disagree, the one
   with the later verified-on date wins; so there should be only one.
5. **Package-local gotchas live next to the code** (`packages/*/CLAUDE.md`), root-level docs never
   repeat them.
6. **Claude's memory directory (outside the repo) holds preferences and hard-won gotchas only,
   never status.** A new machine or teammate never sees it, so anything a session *needs* must be
   in the repo.
7. **Process machinery proportionate to the team.** One founder building a website needs
   typecheck + lint + unit + the Playwright gate. Multi-agent review skills, budget-pacing
   protocols and overnight-run charters were built for a different mode; keep them only if they
   will actually be invoked, and label them opt-in.
8. **Parked subsystems are declared parked in one place**, with what still runs in AWS and what it
   costs, so nobody "finishes" work on them by accident.
9. **Boring, predictable names.** `STATUS.md`, `DECISIONS.md`, `handbook/runbooks/`, `handbook/archive/`.
   A session should guess the path before searching.
10. **Acceptance test for the cleanup itself:** open a *fresh* session and ask "what is this repo,
    what is live, and what is next?" It must answer correctly from CLAUDE.md + STATUS.md in at most
    two file reads, with no contradiction. If it needs SPRINT-LOG or a plan body, the cleanup failed.

## 2. Target layout

```
CLAUDE.md                      ≤ 80 lines. Identity (1 para) · direction (3 lines) · map of where
                               things live · the commands · non-negotiable rules · pointers.
README.md                      NEW. Human-facing: what the product is, stack, how to run it.
STATUS.md                      NEW, the ONLY live status. Sections: Live now · In progress ·
                               Next · Parked · Open decisions. "Verified on: <date>" at the top.
DECISIONS.md                   NEW. ADR-style log distilled from plan 19 D1–D26, plan 21, the
                               founder rulings in the research register (DF-1…8) and the S5/S6
                               queue. One line each: id · date · decision · status (active/
                               superseded) · pointer. Decisions the pivot overturns get marked.
docs/                          RESERVED for the /documentation-downloader vendor-doc cache ONLY
                               (the skill and ~/.claude/CLAUDE.md hardwire docs/ + docs/llms.txt).
                               Keep only what the stack uses: astro, tailwind, shadcn, drizzle,
                               postgres, postgis, node-postgres, pulumi, aws, line, anthropic, node.
                               Delete bun/cockroach/turso/neon/netlify/cloudflare/effect/expo/
                               sqlite/nile/microsoft/pub.dev caches; regenerate docs/llms.txt.
                               NOTHING project-authored lives here after the move.
handbook/                      NEW — everything this project writes about itself.
  runbooks/                    Extracted from CLAUDE.md, one file each:
    local-dev.md               (dev:staging, e2e server, offline build)
    deploy.md                  (Pulumi, passphrase, website-only build rule, post-deploy gate)
    testing.md                 (what each suite proves; the adhoc review-shot helper)
    migrations.md              (drizzle + the hand-fixes; staging apply)
    aws-identities.md          (profiles, policy versions)
    line-bot.md                (rich menu, MINI App console steps — parked, kept for revival)
  product/
    vision.md                  Plan 19 §2 + the pivot paragraph (website-first; LINE bot parked)
  research/                    git mv from docs/research (register + a1–c1 artifacts + assets).
                               Freeze every header to "Frozen <date>; register live".
  design/                      git mv from docs/design (mockups, renders, tokens, moodboard).
  archive/
    2026-06-sprint/            SPRINT-LOG.md, MORNING.md, BLOCKERS.md, BACKLOG.md (moved verbatim)
    plans/                     plans 00–23 + plans/cleanup/ + design/skill-hardening/, moved
                               verbatim, plus README.md: "plan · what it was · outcome · superseded by"
    spikes/                    the two FINDINGS.md only (drop the checked-in spike app + its
                               269 MB untracked node_modules)
plans/
  README.md                    "One active plan at a time. Archived plans → handbook/archive/plans."
  25-website-next.md           The next thing being built (write when known). Nothing else.
packages/*/CLAUDE.md           keep db's; add website's (variants, facets, theme rules) by moving
                               the website section out of root CLAUDE.md.
.claude/
  skills/                      decision below (§4). Whatever stays gets a one-line "when to use".
  workflows/                   archive (they generated the June cleanup dossier; job done).
  low-token-cleanups.md        delete (budget-pacing artefact).
```

Root files to move or delete: `KHAIFAK.md` → `handbook/research/khai-fak-sources.md`;
`WEBSITES.md` → fold into `handbook/research/a5-competitor-teardown.md` sources or delete;
`line-mini-app-qr*.png` → `handbook/archive/`; `LINE.md` (gitignored plaintext credentials) → the
values already live in Pulumi config; delete the file and add `LINE.example.md` with blanks.

## 3. Execution order (safe, reversible)

1. `git tag pre-context-cleanup` and commit nothing else until step 2 is done.
2. **Write the new truth first**, sourced from today's state: `STATUS.md`, `DECISIONS.md`,
   `README.md`. Use: root CLAUDE.md (website + data-layer sections are current),
   `plans/23-ingestion-pipeline-audit/IMPLEMENTATION-STATUS.md` (bot pipeline: A1/A2/C/D done,
   B not started, U-D2 built but not deployed), the AWS inventory below, the open-decisions list
   in §5. Verified-on date = the day you run this.
3. **Archive history** by `git mv` (never edit archived bodies): the 4 status files, plans 00–23,
   `plans/cleanup/`, `docs/design/skill-hardening/`, spikes. Write `handbook/archive/plans/README.md`
   (outcome table) — this is the only new prose about old plans.
4. **Extract runbooks** from CLAUDE.md, then rewrite CLAUDE.md to ≤ 80 lines that point at them.
   Move the website section to `packages/website/CLAUDE.md`.
5. **Freeze research headers** (`handbook/research/*`, `00-product-principles.md`): one header line
   each, no body edits. Fix `handbook/design/design-direction.md` is already reconciled — verify.
6. **Memory dir** (`~/.claude/projects/-home-user-src-line-robot/memory/`): rewrite `MEMORY.md`
   to ≤ 8 lines that point at `STATUS.md`; keep `pulumi-backend.md`, `aws-environment.md`,
   `user-aws-familiarity.md`, the 16-nullable-params gotcha (extract from `deploy-status.md`
   lines ~995–1001 into `gotchas.md`); delete `deploy-status.md`, `sprint-01-overnight-outcome.md`,
   `v2-redesign-direction.md`, `frontend-architecture-conformance.md`,
   `quality-loop-perceptually-blind.md` (their durable lessons are already rules in the repo).
7. **Skills/workflows** per the decision in §4.
8. **Vendor doc caches** (`docs/`): delete the unused folders; regenerate `docs/llms.txt`; confirm
   `docs/` now contains only vendor domains + `llms.txt`.
9. Run the acceptance test in §1.10 in a fresh session. Fix whatever it trips on.
10. Commit in small, named commits (`docs(context): …`); push.

## 4. Decisions needed before executing (recommendation in bold)

| # | Decision | Recommendation |
|---|---|---|
| 1 | Listing supply now that the bot is parked | **Owner/agent submission form on the website that re-uses the extraction pipeline** (text + photos → structured listing → review → publish). The pipeline is the most valuable code in the repo. |
| 2 | Bot + mini-app AWS resources | **Keep RDS + website; leave bot Lambdas deployed but declare them PARKED in STATUS.md** (they cost ~nothing idle; tearing down is a Pulumi change to make when the form exists). Unpublish the seed listings on staging. |
| 3 | Archive vs delete history | **Archive plans/logs under `handbook/archive/` with an outcome index; delete the memory files and vendor caches** (git history keeps everything). |
| 4 | Review process | **Keep the free gate (typecheck, lint, unit, e2e) + `/frontend-review` as an opt-in design pass. Archive `/increment-review`, `/alignment-review`, the workflows, the budget protocol.** Re-adopt if a second developer or agent fleet appears. |
| 5 | Brand name | Still "ทรัพย์ดี / Sapdee" placeholder — decide, then one edit in `packages/ui/src/i18n`. |
| 6 | Legal copy | Privacy/terms were drafted by the model (retention periods, response times, hosting); **review before any real users**; entity name/address are blank. |

## 5. Facts a fresh session must not have to rediscover (seed for STATUS.md)

- **Live:** website https://d15dpmhcgtrf1r.cloudfront.net/ (th `/`, en `/en/`), Astro 6 SSR on
  Lambda + CloudFront, Postgres RDS `linerobot-staging-pg` (t4g.micro, public, TLS). Deployed
  2026-09-05, HEAD `7fda50b`+. Deployed e2e: 184 passed / 4 skipped.
- **Also running (parked):** 6 bot/api/read-api/mini-app Lambdas last deployed 2026-06-15 (the
  plan-23 U-D2 bot code and migration 0011's consumer are built but NOT deployed; migration 0011
  itself IS applied — needed by the website bundle). Mini-app at d15tyvvqffrn4a.cloudfront.net.
- **Data:** 20 public listings = 5 real + 15 seed. Real listings' hero photos are sometimes
  chanote scans / map screenshots — a pipeline hero-selection issue, not a website one.
- **Website structure:** see `packages/website` section of CLAUDE.md (pages, variants, tokens,
  tests). UI variants: `?ui=browse:b|c`, sticky cookie, `?ui=reset`.
- **Undeployed anywhere:** nothing on the website side. Bot side: plan 23 Group B (image stage
  rewrite) never started; Group D go-live gated.
- **Process debt in `.claude/`:** 3 skills, 5 workflow scripts, a budget-pacing note — see §4 #4.

## 6. Out of scope for the cleanup session

Code changes of any kind; the listing-supply feature (decision #1 → its own plan `25-…`);
unpublishing seed data (a data change — do it deliberately, separately); brand/legal decisions.
