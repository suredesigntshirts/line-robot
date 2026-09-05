
export const meta = {
  name: 'cleanup-analysis',
  description: 'Fan-out read-only code audit across all layers — findings written to plans/cleanup/, then consolidated',
  phases: [
    { title: 'Analyze', detail: 'Parallel per-area review: domain, handlers, app/lambda, adapters, miniapp, infra, tests, cross-cutting' },
    { title: 'Synthesize', detail: 'Consolidate all findings into a master prioritized cleanup plan' },
  ],
}

const ROOT = '/home/user/src/line-robot'
const OUT = `${ROOT}/plans/cleanup`

const PREAMBLE = `You are performing a READ-ONLY code quality audit for a LINE messaging bot + real estate listing catalog (TypeScript/Node.js AWS Lambdas + React LIFF mini-app, Pulumi infra on AWS).

The intended architecture is hexagonal (ports-and-adapters): core domain knows nothing about infra, adapters implement ports, app/ layer orchestrates use cases, lambda/ are thin entry points. This was the intent — your job is to find where reality diverged.

GOAL: Find slop, inelegance, unnecessary complexity, duplication, naming inconsistencies, architectural violations, over-engineering, under-engineering, and anything a senior developer would rewrite. Be specific and concrete. Every finding must cite an exact file and line number where possible.

CRITICAL: DO NOT edit any source file. Your ONLY write is to your findings output file.`

const FORMAT = `Write your output to the specified file using exactly this structure:

# [Area Name] — Code Quality Findings

## Summary
2–4 sentences: overall quality signal, biggest concerns, and one thing done well.

## Findings

### [F01] Descriptive title
**Severity:** high | medium | low
**File:** packages/…/file.ts:NN
**Issue:** What is wrong and why it matters to the codebase.
**Suggestion:** Concrete, actionable fix — name the refactor, the pattern, or the specific change.

(repeat — number sequentially F01, F02, …)

## Cross-cutting patterns
Patterns observed across multiple files within this area (not per-file issues).`

// ─── 8 parallel analysis agents ───────────────────────────────────────────

const areas = [
  {
    out: `${OUT}/01-domain-ports.md`,
    label: 'domain + ports',
    prompt: `${PREAMBLE}

## Your scope: Core domain models + Port interfaces

Read every file listed below before writing findings. Use the Read tool for each file path.

Files (all under packages/bot/src/):
  core/domain/catalog.ts
  core/domain/conversation.ts
  core/domain/datetime.ts
  core/domain/events.ts
  core/domain/geo.ts
  core/domain/message.ts
  core/ports/catalog.ts
  core/ports/extraction.ts
  core/ports/lineContent.ts
  core/ports/lineGateway.ts
  core/ports/lineTokenVerifier.ts
  core/ports/mediaReader.ts
  core/ports/mediaUrlSigner.ts
  core/ports/messageHandler.ts
  core/ports/persistence.ts
  core/ports/postbackRouter.ts
  core/ports/runtime.ts

Look specifically for:
- Types duplicated between domain and ports
- Port interfaces that are too granular (too many tiny single-method interfaces) or too coarse
- Domain types that contain infra-specific concerns (AWS, LINE, DynamoDB)
- Inconsistent naming conventions (property naming, file naming, type naming)
- Unnecessary or confusing abstractions in domain types
- Any exported symbol that appears to be unused across the codebase
- Missing or overly permissive types (e.g. 'any', wide unions where a narrower type would do)

${FORMAT}

Write output to: ${OUT}/01-domain-ports.md`
  },

  {
    out: `${OUT}/02-handlers.md`,
    label: 'core handlers',
    prompt: `${PREAMBLE}

## Your scope: Core handlers (business logic layer)

Read every file listed below before writing findings.

Files (all under packages/bot/src/core/handlers/):
  catalogAssistant.ts
  catalogDto.ts
  commandHandler.ts
  commands.ts
  editReplyHandler.ts
  postbackRouter.ts
  registry.ts
  views.ts

Also read the corresponding test files for context on intent:
  test/unit/catalogAssistant.test.ts
  test/unit/catalogDto.test.ts
  test/unit/commandHandler.test.ts
  test/unit/commands.test.ts
  test/unit/editReplyHandler.test.ts
  test/unit/postbackRouter.test.ts
  test/unit/registry.test.ts
  test/unit/views.test.ts

All paths relative to: packages/bot/

Look specifically for:
- God objects / handler classes doing too much
- Logic that belongs in domain but lives in a handler
- LINE message construction logic (Flex messages etc.) that is hard to read or maintain
- Duplicated reply/message construction patterns across handlers
- Overly defensive code or unnecessary guard clauses
- Handler registration patterns — is the registry pattern actually necessary or is it overhead?
- catalogDto.ts — is this a real DTO layer or just a type alias layer?
- views.ts — quality of the LINE Flex message construction; readability; nesting depth

${FORMAT}

Write output to: ${OUT}/02-handlers.md`
  },

  {
    out: `${OUT}/03-app-lambda.md`,
    label: 'app + lambda entry points',
    prompt: `${PREAMBLE}

## Your scope: App orchestration layer + Lambda entry points

Read every file before writing findings.

Files:
  packages/bot/src/app/eventProcessor.ts
  packages/bot/src/app/ingestHandler.ts
  packages/bot/src/app/ingestionSweep.ts
  packages/bot/src/app/readApiHandler.ts
  packages/bot/src/app/reminderSweep.ts
  packages/bot/src/lambda/ingest.ts
  packages/bot/src/lambda/processor.ts
  packages/bot/src/lambda/read-api.ts
  packages/bot/src/lambda/reminder.ts
  packages/bot/src/lambda/sweep.ts
  packages/bot/src/lib/idempotency.ts
  packages/bot/src/lib/logger.ts

Also read corresponding tests for context:
  packages/bot/test/unit/eventProcessor.test.ts
  packages/bot/test/unit/ingestHandler.test.ts
  packages/bot/test/unit/ingestionSweep.test.ts
  packages/bot/test/unit/readApiHandler.test.ts
  packages/bot/test/unit/reminderSweep.test.ts

Look specifically for:
- Lambda handlers doing too much (should be thin wiring only)
- app/ handlers leaking Lambda/AWS concerns (event shapes, response objects)
- Duplication between the sweep files (ingestionSweep vs reminderSweep)
- Dependency injection approach — is it clean? Consistent across Lambdas?
- Error handling — consistent? Too verbose? Too silent?
- idempotency.ts — is the abstraction well-designed?
- logger.ts — is the logging approach consistent and useful?
- Any orchestration logic that should be simpler

${FORMAT}

Write output to: ${OUT}/03-app-lambda.md`
  },

  {
    out: `${OUT}/04-adapters-ai-storage.md`,
    label: 'adapters: AI + DynamoDB',
    prompt: `${PREAMBLE}

## Your scope: Anthropic/AI extraction adapter + DynamoDB repositories

Read every file before writing findings.

Files:
  packages/bot/src/adapters/anthropic/claudeExtractor.ts
  packages/bot/src/adapters/dynamodb/catalogRepository.ts
  packages/bot/src/adapters/dynamodb/messageRepository.ts

Also read CLAUDE.md in the anthropic adapter for important constraint context:
  packages/bot/src/adapters/anthropic/CLAUDE.md

And these tests:
  packages/bot/test/unit/claudeExtractor.test.ts
  packages/bot/test/integration/catalog.integration.test.ts
  packages/bot/test/integration/dynamodb.integration.test.ts

Look specifically for:
- claudeExtractor.ts: Zod schema design — are types well-named? Is the nullable budget (≤16 union params) being used wisely? Is the prompt engineering clean and readable?
- DynamoDB repositories: single-table design cleanliness — are access patterns well-encapsulated? Are there raw DynamoDB attribute types leaking into domain types?
- Query construction — is it readable? Duplicated across the two repositories?
- Repository interfaces: do the implementations match what the ports require?
- Error handling in DynamoDB calls
- Any magic strings (table names, attribute names, index names) that should be constants
- Mapper functions (DynamoDB item ↔ domain type) — clean? Defensive? Correct?

${FORMAT}

Write output to: ${OUT}/04-adapters-ai-storage.md`
  },

  {
    out: `${OUT}/05-adapters-line-infra.md`,
    label: 'adapters: LINE + S3/SQS/config',
    prompt: `${PREAMBLE}

## Your scope: LINE adapter + supporting infrastructure adapters

Read every file before writing findings.

Files:
  packages/bot/src/adapters/line/lineGateway.ts
  packages/bot/src/adapters/line/lineTokenVerifier.ts
  packages/bot/src/adapters/line/richMenu.ts
  packages/bot/src/adapters/line/signatureVerifier.ts
  packages/bot/src/adapters/line/webhookParser.ts
  packages/bot/src/adapters/queue/sqsPublisher.ts
  packages/bot/src/adapters/s3/mediaUrlSigner.ts
  packages/bot/src/adapters/s3/rawArchive.ts
  packages/bot/src/adapters/config/config.ts
  packages/bot/scripts/setup-rich-menu.ts

Also read tests:
  packages/bot/test/unit/lineGateway.test.ts
  packages/bot/test/unit/lineTokenVerifier.test.ts
  packages/bot/test/unit/richMenu.test.ts
  packages/bot/test/unit/signatureVerifier.test.ts
  packages/bot/test/unit/webhookParser.test.ts
  packages/bot/test/unit/rawArchive.test.ts

Look specifically for:
- webhookParser.ts — parse logic quality; how it maps LINE events to domain types
- lineGateway.ts — API call abstraction quality; is it well-typed?
- richMenu.ts — hard to read? Magic numbers for bounds? 
- config.ts — is configuration management clean? Any env var reading happening outside config?
- signatureVerifier.ts — security-critical; is it correct and well-tested?
- SQS adapter — clean interface? Tight coupling to AWS SDK shapes?
- S3 adapters — are they too thin (pass-through wrappers) or appropriate abstractions?
- Duplication between S3 adapters (mediaUrlSigner vs rawArchive)

${FORMAT}

Write output to: ${OUT}/05-adapters-line-infra.md`
  },

  {
    out: `${OUT}/06-miniapp.md`,
    label: 'miniapp (React/LIFF)',
    prompt: `${PREAMBLE}

## Your scope: LINE MINI App (React + LIFF)

Read every file before writing findings.

Files:
  packages/miniapp/src/App.tsx
  packages/miniapp/src/main.tsx
  packages/miniapp/src/liff.ts
  packages/miniapp/src/api.ts
  packages/miniapp/src/types.ts
  packages/miniapp/src/ui.tsx
  packages/miniapp/src/screens/List.tsx
  packages/miniapp/src/screens/Detail.tsx
  packages/miniapp/src/components/Gallery.tsx
  packages/miniapp/src/components/MapPin.tsx
  packages/miniapp/src/lib/deeplink.ts
  packages/miniapp/src/lib/format.ts
  packages/miniapp/src/lib/predicates.ts
  packages/miniapp/src/styles.css
  packages/miniapp/test/deeplink.test.ts
  packages/miniapp/test/predicates.test.ts

Look specifically for:
- Component composition — are components well-sized or doing too much?
- types.ts — is the type shared with the bot package or duplicated? Should it be?
- api.ts — API client design quality; error handling; type safety
- liff.ts — LIFF SDK wrapper quality
- ui.tsx — is this a component library? Well-structured?
- Styling approach — inline styles vs CSS vs utility classes; consistent?
- State management — is it appropriate for the app's complexity?
- Loading/error states — handled consistently?
- Accessibility — any obvious issues?
- predicates.ts — is filtering logic clean and well-tested?
- format.ts — formatting functions quality and coverage

${FORMAT}

Write output to: ${OUT}/06-miniapp.md`
  },

  {
    out: `${OUT}/07-infra-build.md`,
    label: 'infra + build config',
    prompt: `${PREAMBLE}

## Your scope: Pulumi infrastructure + build/config files

Read every file before writing findings.

Files:
  infra/index.ts
  package.json
  packages/bot/package.json
  packages/miniapp/package.json
  packages/bot/tsconfig.json
  packages/miniapp/tsconfig.json
  packages/bot/vitest.config.ts
  packages/miniapp/vitest.config.ts
  packages/miniapp/vite.config.ts

Also run: cat /home/user/src/line-robot/package.json to see workspace setup.

Look specifically for:
- infra/index.ts — is Pulumi code clean and readable? Are resources well-named? Any hardcoded values that should be config?
- Resource organization in infra — is it a single file or broken up? Should it be?
- Dependency management — any obviously wrong or missing dependencies?
- Build scripts — are they clean and consistent across packages?
- TypeScript configs — strict mode? Appropriate paths aliases? Consistent across packages?
- Workspace setup — clean? Any packages that could share more?
- Test config — vitest setup consistent between packages?
- Any dev dependencies in the wrong place (prod vs dev)

${FORMAT}

Write output to: ${OUT}/07-infra-build.md`
  },

  {
    out: `${OUT}/08-cross-cutting.md`,
    label: 'cross-cutting concerns',
    prompt: `${PREAMBLE}

## Your scope: Cross-cutting architectural concerns (whole codebase)

You are looking at the ENTIRE codebase holistically, not a specific layer. Your job is to find patterns that span layers.

Run these shell commands to gather data (use the Bash tool):
  find /home/user/src/line-robot/packages/bot/src -name "*.ts" | xargs grep -l "import.*from" | head -30
  grep -r "console\." /home/user/src/line-robot/packages/bot/src --include="*.ts" -l
  grep -r "any" /home/user/src/line-robot/packages/bot/src --include="*.ts" -n | grep -v "//.*any" | head -40
  grep -r "TODO\|FIXME\|HACK\|XXX" /home/user/src/line-robot/packages --include="*.ts" -n
  grep -r "throw\|catch\|Error" /home/user/src/line-robot/packages/bot/src --include="*.ts" -n | head -50

Also read these files for architectural context:
  packages/bot/src/adapters/config/config.ts
  packages/bot/src/lib/logger.ts
  packages/bot/src/lib/idempotency.ts

Look specifically for:
- Import direction violations (domain importing from adapters?)
- Types that are duplicated between packages/bot and packages/miniapp
- Error handling consistency — is there a pattern or chaos?
- Logging — consistent use of the logger? console.log leaking in?
- Any use of 'any' or broad 'unknown' that could be narrowed
- TODOs/FIXMEs that represent real debt
- Naming consistency across layers (same concept, different names?)
- Dead exports — things exported but never imported anywhere
- Circular dependencies (run: npx madge --circular packages/bot/src if available, or reason from imports)

${FORMAT}

Write output to: ${OUT}/08-cross-cutting.md`
  },
]

// ─── Phase 1: parallel analysis ────────────────────────────────────────────
phase('Analyze')
log(`Launching ${areas.length} parallel analysis agents across all codebase layers…`)
await parallel(areas.map(a => () => agent(a.prompt, { label: a.label, phase: 'Analyze' })))
log('All area findings written. Starting synthesis…')

// ─── Phase 2: synthesize ───────────────────────────────────────────────────
phase('Synthesize')
await agent(`${PREAMBLE}

## Your task: Synthesize all per-area findings into a master cleanup plan

Read all 8 finding files:
  ${OUT}/01-domain-ports.md
  ${OUT}/02-handlers.md
  ${OUT}/03-app-lambda.md
  ${OUT}/04-adapters-ai-storage.md
  ${OUT}/05-adapters-line-infra.md
  ${OUT}/06-miniapp.md
  ${OUT}/07-infra-build.md
  ${OUT}/08-cross-cutting.md

Your job:
1. Deduplicate findings that were reported by multiple agents.
2. Identify themes — groups of related findings that should be tackled together.
3. Identify which findings are actually the SAME underlying problem seen from different layers.
4. Assign a final priority (P1 = do first, P2 = soon, P3 = nice to have).
5. Write a master cleanup plan that a developer can use to execute the cleanup sprint.

P1 criteria: architectural violations, duplication that actively hurts development velocity, confusing code that will cause bugs.
P2 criteria: code smells, naming inconsistencies, over-engineering.
P3 criteria: style preferences, minor simplifications.

Write to: ${OUT}/00-master-plan.md using this structure:

# Master Cleanup Plan

## Executive summary
3–5 sentences on the overall state of the codebase and the biggest opportunities.

## Themes
Group findings into named themes (e.g. "DynamoDB mapper duplication", "Too-thin abstraction layers", "Inconsistent error handling"). Each theme gets a paragraph.

## Priority queue

### P1 — Do first (architecture + velocity blockers)
| # | Theme | File(s) | Summary | Est. effort |
|---|-------|---------|---------|-------------|

### P2 — Soon (code smells + naming)
| # | Theme | File(s) | Summary | Est. effort |
|---|-------|---------|---------|-------------|

### P3 — Nice to have
| # | Theme | File(s) | Summary | Est. effort |
|---|-------|---------|---------|-------------|

## Execution order
Which P1s should be done first and why (some will unblock others).

## What NOT to touch
List things that look fine and should be left alone during the cleanup sprint.
`, { label: 'master plan', phase: 'Synthesize' })

log(`Done. Master plan at ${OUT}/00-master-plan.md`)
