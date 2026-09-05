
export const meta = {
  name: 'cleanup-commit-review',
  description: 'Review design quality of each feature epoch as a diff — find slop introduced at each increment',
  phases: [
    { title: 'Diff review', detail: 'Parallel per-epoch diff analysis (8 epochs from initial commit to HEAD)' },
    { title: 'Synthesize', detail: 'Consolidate epoch-level findings into design debt summary' },
  ],
}

const ROOT = '/home/user/src/line-robot'
const OUT = `${ROOT}/plans/cleanup`

const PREAMBLE = `You are performing a READ-ONLY design quality review of a feature epoch in a LINE messaging bot + real estate catalog (TypeScript/Node.js AWS Lambdas + React LIFF mini-app).

The codebase uses hexagonal architecture (ports-and-adapters): core domain knows nothing about infra, adapters implement ports, app/ orchestrates, lambda/ are thin entry points.

Your job: review the diff for this epoch and find DESIGN PROBLEMS introduced by these changes. The question is not "what does the code look like now" but "what shortcuts and design smells were introduced when this feature was added?"

CRITICAL: DO NOT edit any source file. Only write your output file.`

const FORMAT = `Write your output using this structure:

# [Epoch Name] — Design Review

## Epoch summary
What was built in this epoch. 2–3 sentences.

## Design concerns introduced

### [D01] Short descriptive title
**Severity:** high | medium | low
**File(s):** packages/…/file.ts:NN (as changed in this epoch)
**What was introduced:** Describe the specific pattern or code that was added.
**Why it's a problem:** The architectural or quality concern.
**Better approach:** Concrete alternative — be specific.

(repeat for each concern, numbered D01, D02, …)

## What was done well
1–3 things in this epoch that were actually clean or well-designed.

## Patterns
Any recurring shortcuts or patterns visible across this epoch's diff.`

const epochs = [
  {
    name: 'Foundation (Stages 1-5)',
    range: 'ae0debb..80046d3',
    out: `${OUT}/epoch-A-foundation.md`,
    label: 'epoch A: foundation',
    context: 'This epoch built the entire foundation: npm workspaces + toolchain scaffold, core domain + LINE adapter, persistence (DynamoDB + S3), Lambda composition, and Pulumi infra.'
  },
  {
    name: 'Infrastructure & Staging Setup',
    range: '80046d3..acd8b27',
    out: `${OUT}/epoch-B-infra-staging.md`,
    label: 'epoch B: infra staging',
    context: 'This epoch covers AWS deploy identity bootstrap, LINE signing key setup, Lambda context/idempotency registration, staging stack init, and various infra hardening commits before the catalog feature began.'
  },
  {
    name: 'Catalog Assistant P1 (slices 1-5 + ingestion + reminders)',
    range: 'acd8b27..2190711',
    out: `${OUT}/epoch-C-catalog-p1.md`,
    label: 'epoch C: catalog P1',
    context: 'This epoch built the core catalog feature: data layer, command handler, rich menu, Flex/quick-reply outbound, postback routing, ambiguous merge flow, Claude extraction in the ingestion sweep, and the reminder calendar. The bulk of the product was built here.'
  },
  {
    name: 'Extraction Refinement + Hero Photos',
    range: '2190711..e80d2d0',
    out: `${OUT}/epoch-D-extraction-photos.md`,
    label: 'epoch D: extraction + photos',
    context: 'This epoch added per-conversation memory docs to extraction, a Haiku→Sonnet→Opus escalation ladder for low confidence, targeted merge hints + caching TTL + usage logging, and hero photos on property cards via presigned S3 URLs.'
  },
  {
    name: 'Richer Details + Edit Flow (Plans 11)',
    range: 'e80d2d0..d6d7e0e',
    out: `${OUT}/epoch-E-plan11.md`,
    label: 'epoch E: plan 11',
    context: 'Plan 11: rich Flex card, Maps button, photo gallery for listing detail view, and reply-to-update free-text edit flow for the last-viewed listing.'
  },
  {
    name: 'Plan 12 — Listing Depth & Fixes',
    range: 'd6d7e0e..cd80bb7',
    out: `${OUT}/epoch-F-plan12.md`,
    label: 'epoch F: plan 12',
    context: 'Plan 12: bounded Haiku-only extractor for edits + 2-min debounce, photo gallery accumulation, original map link + delete, Opus drop from extraction ladder, surface tags on summary cards.'
  },
  {
    name: 'Plan 13 — Chanote OCR + Image Pipeline',
    range: 'cd80bb7..89695f2',
    out: `${OUT}/epoch-G-plan13.md`,
    label: 'epoch G: plan 13',
    context: 'Plan 13: Fix extraction outage (nullable limit exceeded → sentinel values), Chanote OCR + per-image classify pipeline + labelled photos, two-pass extraction (segment→per-property), and resilience (abandon stuck conversations + drop permanently-failed events).'
  },
  {
    name: 'Plan 14 — LINE MINI App',
    range: '89695f2..HEAD',
    out: `${OUT}/epoch-H-plan14.md`,
    label: 'epoch H: plan 14',
    context: 'Plan 14: LIFF SPA (React read-only catalog viewer), read-api Lambda, CloudFront distribution, and Catalog tab added to rich menu.'
  },
]

const buildPrompt = (epoch) => `${PREAMBLE}

## Epoch: ${epoch.name}
${epoch.context}

## Your process

Step 1 — Get the diff overview:
Run: git -C ${ROOT} diff --stat ${epoch.range}
This shows which files changed and how much.

Step 2 — Review the full diff:
Run: git -C ${ROOT} diff ${epoch.range}
If the output is very long (>500 lines), focus on the most architecturally significant files. Use:
  git -C ${ROOT} diff --name-only ${epoch.range}
to list files, then:
  git -C ${ROOT} diff ${epoch.range} -- <specific-file>
to drill into individual files that look most interesting.

Step 3 — Read the current state of 2-3 key files from this epoch if needed for context:
Use the Read tool on specific files at ${ROOT}/packages/bot/src/... or ${ROOT}/packages/miniapp/src/...

Step 4 — Write your findings.

Look specifically for:
- Architectural shortcuts taken under time pressure (vibing/moving fast)
- Logic that was added to the wrong layer
- New abstractions that are premature or under-engineered
- Duplication of existing patterns rather than reuse
- Types that should live somewhere else
- Test coverage gaps for new behavior (check if tests were added alongside code)
- Error handling added inconsistently or forgotten
- Any "I'll fix this later" patterns (TODO, magic literals, overly specific naming)

${FORMAT}

Write output to: ${epoch.out}`

phase('Diff review')
log(`Launching ${epochs.length} parallel epoch diff-review agents…`)
await parallel(epochs.map(e => () => agent(buildPrompt(e), { label: e.label, phase: 'Diff review' })))
log('All epoch findings written. Starting synthesis…')

phase('Synthesize')
await agent(`${PREAMBLE}

## Your task: Synthesize epoch-level design debt findings

Read all 8 epoch finding files:
${epochs.map(e => `  ${e.out}`).join('\n')}

Also read the static analysis master plan (from the parallel code scan):
  ${OUT}/00-master-plan.md (may or may not exist yet — skip gracefully if not found)

Your job:
1. Identify design problems that were INTRODUCED early and NEVER cleaned up (seeded in epoch A/B/C, still present today).
2. Find patterns that recur across multiple epochs — the same shortcuts taken repeatedly.
3. Identify the highest-leverage refactors: changes that would clean up problems introduced across many epochs.
4. Note which epochs were the cleanest and which introduced the most debt.

Write to: ${OUT}/09-epoch-design-debt.md using this structure:

# Epoch Design Debt Analysis

## Executive summary
Which epochs were the cleanest? Which introduced the most debt? 3–5 sentences.

## Recurring patterns across epochs
Shortcuts or anti-patterns that appear in 3+ epochs — these are the systemic habits to break.

## Legacy debt (introduced early, never addressed)
Problems seeded in epochs A–C that compound over time.

## Highest-leverage refactors
3–5 specific refactors (with files) that would address the most cross-epoch issues.

## Epoch scorecard
| Epoch | Name | Design quality | Key debt introduced |
|-------|------|----------------|---------------------|

`, { label: 'epoch synthesis', phase: 'Synthesize' })

log(`Done. Epoch design debt report at ${OUT}/09-epoch-design-debt.md`)
