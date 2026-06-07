export const meta = {
  name: 'cleanup-strategize',
  description: 'Per change-unit: Explore maps blast radius -> Opus writes a self-contained implementation spec; then a reconcile pass resolves conflicts',
  phases: [
    { title: 'Map', detail: 'Explore agent maps the full blast radius of each change-unit (Sonnet)' },
    { title: 'Strategy', detail: 'Opus agent verifies + writes a self-contained implementation artifact per change-unit' },
    { title: 'Reconcile', detail: 'Opus agent finds conflicts, auto-fixes mechanical ones, escalates design forks, writes the ordered queue' },
  ],
}

const ROOT = '/home/user/src/line-robot'
const RESEARCH = `${ROOT}/plans/cleanup`            // the existing findings reports
const OUT = `${ROOT}/plans/cleanup/changes`          // where strategy artifacts go

// Project verification commands (from CLAUDE.md) — every artifact must cite these.
const VERIFY = `npm run typecheck   # tsc across workspaces
npm run lint        # biome
npm run test        # vitest unit
npm --prefix packages/bot run test:integration   # DynamoDB Local (needs docker) — only if the change touches persistence`

// ── Hard constraint every agent must respect ───────────────────────────────
const GUARDRAILS = `## Non-negotiable project constraints (DO NOT REGRESS)
- Anthropic strict structured output caps the extraction schema at **16 nullable/union params total**.
  Prefer required-with-sentinel ("" / []) over .nullable(); reserve .nullable() for numbers.
  There is a regression test asserting <=16 unions — any schema touch must keep it green.
  (See ${ROOT}/CLAUDE.md and packages/bot/src/adapters/anthropic/CLAUDE.md.)
- Hexagonal layering is the target: core/domain knows nothing about infra; adapters implement
  core/ports; app/ orchestrates; lambda/ are thin wiring. Fixes must move code TOWARD this, never away.
- Keep functionality behaviourally identical unless the change-unit explicitly fixes a named bug.
- This is a READ-ONLY analysis of source. You may run read-only inspection commands (grep, git,
  npm run typecheck to observe the baseline) but you MUST NOT edit, create, or delete any source
  file. Your ONLY write to the repo is your single artifact markdown file.`

// ───────────────────────────────────────────────────────────────────────────
// CHANGE-UNITS
// The 5 mandatory refactors come straight from plans/cleanup/09-epoch-design-debt.md
// ("Highest-leverage refactors"). Units 06-09 are curated additions I selected from the
// research files for architecture / data-integrity / good-pattern value. Edit this list
// freely before launch — add/remove units or retarget files.
// ───────────────────────────────────────────────────────────────────────────
const units = [
  {
    id: '01', slug: 'domain-sentinel-and-property-mapping', mandatory: true,
    title: 'Extract sentinel helpers + a single ExtractedProperty->Upsert mapping',
    files: [
      'packages/bot/src/app/ingestionSweep.ts',
      'packages/bot/src/core/handlers/editReplyHandler.ts',
      'packages/bot/src/adapters/anthropic/claudeExtractor.ts',
      '(new) packages/bot/src/core/domain/sentinel.ts',
      '(new) packages/bot/src/core/handlers/propertyMapping.ts',
    ],
    goal: 'nullToUndef / emptyToUndef / listToUndef exist in 3 files and the ~30-field ExtractedProperty->PropertyUpsert mapping exists in 2 diverging copies. Create one home for each so a schema change is a single edit.',
    refs: ['09-epoch-design-debt.md (refactor #1; patterns #1, #6)', '00-master-plan.md (P1 #2; Theme A)', '04-adapters-ai-storage.md', '02-handlers.md', '03-app-lambda.md'],
  },
  {
    id: '02', slug: 'hexagonal-port-boundaries', mandatory: true,
    title: 'Close the 3 app->adapter boundary violations (WebhookParser, SignatureVerifier, HttpRequest/Response ports) + validate parseRawEvent',
    files: [
      'packages/bot/src/app/eventProcessor.ts',
      'packages/bot/src/app/ingestHandler.ts',
      'packages/bot/src/app/readApiHandler.ts',
      'packages/bot/src/adapters/line/webhookParser.ts',
      'packages/bot/src/core/ports/ (new port interfaces)',
      'packages/bot/src/lambda/ingest.ts',
      'packages/bot/src/lambda/read-api.ts',
    ],
    goal: 'eventProcessor imports parseRawEvent + isPermanentLineError from adapters; ingestHandler types its dep as the concrete SignatureVerifier + imports a LINE SDK constant; readApiHandler passes raw APIGatewayProxyEventV2/V2 through its internals. Define ports, move AWS/LINE type mapping to lambda/. Also add structural validation (Zod/guard) to parseRawEvent (currently a blind cast, zero tests) and unit-test it.',
    refs: ['09-epoch-design-debt.md (refactor #2; pattern #2; legacy "Epoch A")', '00-master-plan.md (P1 #5,#6,#7,#10; Theme B)', '03-app-lambda.md', '05-adapters-line-infra.md', '08-cross-cutting.md'],
  },
  {
    id: '03', slug: 'shared-catalog-domain-helpers', mandatory: true,
    title: 'Extract shared catalog logic (photo ordering, upcoming rows, search haystack) into core/domain',
    files: [
      'packages/bot/src/core/handlers/catalogAssistant.ts',
      'packages/bot/src/core/handlers/catalogDto.ts',
      'packages/bot/src/app/readApiHandler.ts',
      '(new) packages/bot/src/core/domain/photos.ts (or catalog helpers)',
    ],
    goal: 'PHOTO_KIND_ORDER / orderedPhotos / heroPhotoKey, the activity-sort comparator, collectUpcomingRows, and searchableText() are each duplicated across the handler and app/dto layers. Extract the pure logic into core/domain so both the chat path and the read-API share one authoritative copy (compile-time, not comment-enforced).',
    refs: ['09-epoch-design-debt.md (refactor #3; pattern #1)', '00-master-plan.md (P1 #1,#3,#4; Theme A)', '02-handlers.md', '06-miniapp.md (photo-order parity)'],
  },
  {
    id: '04', slug: 'shared-types-package', mandatory: true,
    title: 'Create packages/shared for cross-package DTOs / tz constants; kill the miniapp type mirror',
    files: [
      'packages/miniapp/src/types.ts',
      'packages/bot/src/core/handlers/catalogDto.ts',
      'packages/miniapp/src/lib/format.ts',
      'packages/bot/src/core/domain/datetime.ts',
      '(new) packages/shared/ workspace OR TS project references',
      'package.json (workspaces)',
    ],
    goal: 'miniapp/src/types.ts is a hand-maintained copy of the bot DTOs ("keep these in sync"); Bangkok tz offset + MONTHS are also duplicated. Introduce one shared source both packages import so drift becomes a compile error. Decide: new packages/shared workspace vs TS project references (escalate if non-obvious).',
    refs: ['09-epoch-design-debt.md (refactor #4; pattern #1)', '00-master-plan.md (P2 #13; Theme D)', '06-miniapp.md', '07-infra-build.md'],
  },
  {
    id: '05', slug: 'ingestionsweep-decomp-and-memory-bug', mandatory: true,
    title: 'Decompose ingestionSweep.ts (848 lines) + fix the two-pass `memory` omission bug',
    files: [
      'packages/bot/src/app/ingestionSweep.ts',
      'packages/bot/src/core/handlers/views.ts',
      '(new) packages/bot/src/app/ingestionMedia.ts (or similar)',
      '(maybe) packages/bot/src/core/utils/concurrency.ts',
    ],
    goal: 'ingestionSweep mixes sweep orchestration, the two-pass pipeline, media classification, transcript building, chanote/photo merging, and view building in one 848-line file. Extract buildConfirmation -> views.ts, transcript/media helpers -> ingestionMedia.ts, mapWithConcurrency -> utils. SEPARATELY: epoch-G review claims `memory` is omitted from the per-property ExtractionRequest in the two-pass loop, silently degrading multi-property extraction — VERIFY against the current code, and if real, prescribe the one-line fix as a clearly-marked bug fix.',
    refs: ['09-epoch-design-debt.md (refactor #5; epoch G D01 bug)', '00-master-plan.md (P1 #8; Theme C)', 'epoch-G-plan13.md', '03-app-lambda.md'],
  },
  {
    id: '06', slug: 'messagerepo-casing-data-integrity', mandatory: false,
    title: 'Add casing:"none" to the ElectroDB message entity (silent GROUP-ID lowercasing)',
    files: ['packages/bot/src/adapters/dynamodb/messageRepository.ts'],
    goal: 'The ElectroDB entity omits casing:"none", so LINE GROUP IDs (which contain uppercase) are silently lowercased on write — a latent key-mismatch / data-access bug. Prescribe the fix AND a safe rollout: a scan to detect whether any mixed-case keys already exist before applying (the change is trivially safe only if none do).',
    refs: ['00-master-plan.md (P1 #9; Theme H)', '04-adapters-ai-storage.md', '08-cross-cutting.md'],
  },
  {
    id: '07', slug: 'split-catalog-repository', mandatory: false,
    title: 'Split the 25-method CatalogRepository god-port into focused stores',
    files: [
      'packages/bot/src/core/ports/catalog.ts',
      'packages/bot/src/adapters/dynamodb/catalogRepository.ts',
      'consumers across core/handlers and app/ (all injection sites)',
    ],
    goal: 'CatalogRepository exposes 25 methods across ~5 unrelated concerns (conversation-ingestion, property, membership, follow-up). Split the PORT into focused interfaces (e.g. ConversationIngestionStore, PropertyStore, MembershipStore, FollowUpStore); the single DynamoDB adapter implements all. Interacts with unit 02 (port boundaries) — note the ordering dependency. This is the largest unit; if a full split is too invasive, prescribe a staged path.',
    refs: ['00-master-plan.md (P2 #12; Theme C)', '01-domain-ports.md', '04-adapters-ai-storage.md'],
  },
  {
    id: '08', slug: 'lambda-cold-start-boilerplate', mandatory: false,
    title: 'Unify the 5 Lambda cold-start patterns (lazySingleton + SYSTEM_CLOCK) + per-lambda env schema',
    files: [
      'packages/bot/src/lambda/ingest.ts',
      'packages/bot/src/lambda/processor.ts',
      'packages/bot/src/lambda/read-api.ts',
      'packages/bot/src/lambda/reminder.ts',
      'packages/bot/src/lambda/sweep.ts',
      'packages/bot/src/adapters/config/config.ts',
      '(new) packages/bot/src/lib/ helper(s)',
    ],
    goal: 'SYSTEM_CLOCK is redefined identically in 4 Lambdas; the lazy-singleton memoisation (`depsPromise ??= buildDeps()`) is rewritten 5 times with inconsistent naming. Extract a lazySingleton<T> helper + one shared clock. Optionally split the shared EnvSchema so the read-only read-api Lambda stops carrying env vars it has no IAM permission to use. Establish the cold-start pattern we copy going forward.',
    refs: ['00-master-plan.md (P2 #18,#19; Theme F; legacy "Epoch A")', '03-app-lambda.md', '07-infra-build.md'],
  },
  {
    id: '09', slug: 'error-logging-boundary-pattern', mandatory: false,
    title: 'Make handler-boundary error handling consistent (log-then-return, no silent swallow)',
    files: [
      'packages/bot/src/core/handlers/catalogAssistant.ts (heroUrls / presign)',
      'packages/bot/src/core/handlers/catalogDto.ts (presignPhotos)',
      'packages/bot/src/app/readApiHandler.ts (presign chain)',
      'packages/bot/src/lib/logger.ts',
    ],
    goal: 'Presigned-URL failures are caught and turned into null with no log in 3 places ("mirrors heroUrls"), so bad photos vanish silently. The correct log-then-return pattern already exists in the media-collection path. Define one helper / convention and apply it at every handler boundary so failures are observable. Behaviour-preserving except that failures now emit a warn.',
    refs: ['09-epoch-design-debt.md (pattern #5)', '00-master-plan.md (Theme G)', '02-handlers.md', '03-app-lambda.md'],
  },
]

// ── Schemas ────────────────────────────────────────────────────────────────
const BLAST_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    files: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: {
        path: { type: 'string' },
        role: { type: 'string', enum: ['create', 'modify', 'delete', 'context-only'] },
        why: { type: 'string' },
      }, required: ['path', 'role', 'why'] } },
    symbols: { type: 'array', items: { type: 'string' }, description: 'symbol definitions involved (function/type/const names + file)' },
    callSites: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { location: { type: 'string' }, description: { type: 'string' } },
      required: ['location', 'description'] }, description: 'every place that imports/uses the symbols being moved or changed' },
    tests: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { path: { type: 'string' }, action: { type: 'string', enum: ['add', 'update', 'none'] }, note: { type: 'string' } },
      required: ['path', 'action', 'note'] } },
    docsAndConstraints: { type: 'array', items: { type: 'string' }, description: 'CLAUDE.md / md / schema-limit concerns this change must respect' },
    risks: { type: 'array', items: { type: 'string' } },
    coverageNotes: { type: 'string', description: 'how you searched and why you believe the blast radius is complete' },
  },
  required: ['files', 'symbols', 'callSites', 'tests', 'docsAndConstraints', 'risks', 'coverageNotes'],
}

const SUMMARY_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    id: { type: 'string' },
    slug: { type: 'string' },
    title: { type: 'string' },
    status: { type: 'string', enum: ['ready', 'needs-decision'] },
    artifactPath: { type: 'string' },
    filesCreated: { type: 'array', items: { type: 'string' } },
    filesModified: { type: 'array', items: { type: 'string' } },
    filesDeleted: { type: 'array', items: { type: 'string' } },
    newExports: { type: 'array', items: { type: 'string' }, description: 'new public symbols/signatures other units might collide with' },
    dependsOn: { type: 'array', items: { type: 'string' }, description: 'slugs of units that should land before this one' },
    conflictsLikelyWith: { type: 'array', items: { type: 'string' }, description: 'slugs that touch the same files/symbols' },
    openQuestions: { type: 'array', items: { type: 'string' }, description: 'genuine design forks to escalate (empty if none)' },
    effortEstimate: { type: 'string' },
  },
  required: ['id', 'slug', 'title', 'status', 'artifactPath', 'filesCreated', 'filesModified', 'filesDeleted', 'newExports', 'dependsOn', 'conflictsLikelyWith', 'openQuestions', 'effortEstimate'],
}

// ── Prompt builders ────────────────────────────────────────────────────────
const explorePrompt = (u) => `You are mapping the COMPLETE blast radius of one planned refactor so a strategist can write a safe, total implementation spec. Read-only.

${GUARDRAILS}

## Change-unit ${u.id}: ${u.title}
**Goal:** ${u.goal}
**Likely files:** ${u.files.join(', ')}

## Your job
Find EVERY place this change ripples to. Be exhaustive — the strategist trusts your map.
1. Read each likely file. Identify the exact symbols (functions/types/consts) that will move, change, or be created.
2. For each symbol, find ALL call-sites and imports across packages/bot AND packages/miniapp AND infra (grep the whole repo; do not assume one package). Record file:line.
3. Find every test that exercises the touched code (and gaps where none exist).
4. Note any CLAUDE.md / schema-limit / layering constraint the change must respect.
5. State plainly how you searched and why the radius is complete (or where you're unsure).

Search widely (multiple naming conventions, re-exports, string references). Missing a call-site is the worst outcome.

Return the structured blast map.`

const strategyPrompt = (u, blast) => `You are an experienced engineer writing a self-contained implementation spec for ONE refactor. A Sonnet agent will later execute it ONE AT A TIME with minimal additional thinking, so it must be complete, concrete, and unambiguous. Use careful, exhaustive reasoning — treat this as a high-effort task.

${GUARDRAILS}

## Change-unit ${u.id}: ${u.title}
**Goal:** ${u.goal}
**Research sources to read for context (under ${RESEARCH}/):** ${u.refs.join(' ; ')}

## Blast-radius map from the Explore scout (verify it; close any gaps yourself with Read/grep)
${blast ? JSON.stringify(blast, null, 2) : '(scout returned nothing — do your own thorough exploration before writing)'}

## Process
1. Read the relevant research sections above and the actual current source for every file in the blast map.
2. VERIFY the blast radius is complete — do your own grep/Read to confirm call-sites; expand it if the scout missed anything. If the unit names a suspected bug, confirm it against the real code before prescribing a fix.
3. Decide the cleanest target design that moves the code toward the hexagonal ideal and is a pattern we'd happily copy going forward. If there's a genuine design fork (more than one defensible architecture), DO NOT silently pick — capture it in "Open questions / decisions" and set status "needs-decision".
4. Write ONE artifact to ${OUT}/${u.id}-${u.slug}.md, then return the structured summary.

## Artifact format (write EXACTLY these sections)
\`\`\`
# ${u.id} — ${u.title}

## Goal & rationale
(2-4 sentences: what & why. Link the source findings.)

## Blast radius
- **Files created:** ...
- **Files modified:** ... (with the symbols/regions touched)
- **Files deleted:** ...
- **All call-sites to update:** bullet list of file:line — every one.
- **Tests touched:** add/update, with paths.

## Current code
(The relevant current snippets being changed — enough to orient the implementer. Use fenced blocks with file paths.)

## Target design
(The new module signatures / interfaces / shapes, exact. Show the concrete after-code. Name every new export.)

## Step-by-step implementation
(Ordered, mechanical steps. Each step: file, what to change, the exact code. An implementer should not have to make design decisions here.)

## Tests
(Exact tests to add/update and the behaviour they pin. Functionality stays identical unless a named bug fix is called out — mark bug fixes explicitly.)

## Verification
\`\`\`
${VERIFY}
\`\`\`
(State which subset applies and the expected result.)

## Dependencies & ordering
(Which other change-units must land first, and why. Which files this shares with other units.)

## Risk & rollback
(What could break; how to back out. Call out any Anthropic 16-union / layering risk explicitly.)

## Open questions / decisions  (only if status = needs-decision)
(Each genuine design fork, with the options and your recommendation.)
\`\`\`

Then return the structured summary (artifactPath = the file you wrote).`

// ───────────────────────────────────────────────────────────────────────────
// PHASE 1+2 — pipeline: Map (Explore, Sonnet) -> Strategy (Opus). No barrier:
// each unit advances to Strategy as soon as its own map is done.
// ───────────────────────────────────────────────────────────────────────────
log(`Strategizing ${units.length} change-units (${units.filter(u => u.mandatory).length} mandatory + ${units.filter(u => !u.mandatory).length} curated additions)…`)

const summaries = (await pipeline(
  units,
  (u) => agent(explorePrompt(u), { agentType: 'Explore', model: 'sonnet', schema: BLAST_SCHEMA, label: `map:${u.slug}`, phase: 'Map' }),
  (blast, u) => agent(strategyPrompt(u, blast), { model: 'opus', schema: SUMMARY_SCHEMA, label: `strategy:${u.slug}`, phase: 'Strategy' }),
)).filter(Boolean)

log(`${summaries.length}/${units.length} artifacts written. Reconciling…`)

// ───────────────────────────────────────────────────────────────────────────
// PHASE 3 — Reconcile (Opus). Auto-fix mechanical conflicts by EDITING artifacts;
// escalate genuine design forks into the queue doc. Writes 00-implementation-queue.md.
// ───────────────────────────────────────────────────────────────────────────
phase('Reconcile')
await agent(`You are reconciling a set of independently-written refactor specs into one clean, conflict-free, ordered implementation plan. Use careful, exhaustive reasoning.

${GUARDRAILS}

## Inputs
1. The per-unit summaries (JSON):
${JSON.stringify(summaries, null, 2)}

2. The full artifacts — READ every one under ${OUT}/ (files ${units.map(u => `${u.id}-${u.slug}.md`).join(', ')}).

## Your job
1. Build a conflict matrix across all artifacts:
   - **Shared-file conflicts:** two artifacts editing the same file/region.
   - **Competing new modules:** two artifacts proposing the same new module or helper with different names/signatures.
   - **Ordering dependencies:** X must land before Y (e.g. port split before consumers).
   - **Constraint collisions:** anything that risks the Anthropic 16-union limit or re-breaks layering.
2. **Resolve SIMPLE / mechanical conflicts yourself by EDITING the artifacts** so they're mutually consistent — unify a helper name/signature to one agreed shape (update every artifact that references it), assign non-overlapping edit regions, and add explicit "rebase on <unit>" notes. Keep each artifact self-contained after editing.
3. **ESCALATE hard conflicts — genuine design forks where two valid architectures collide, or where resolving requires a product/architecture decision.** Do NOT edit those; record them for the user to decide.
4. Write ${OUT}/00-implementation-queue.md:

\`\`\`
# Implementation Queue — cleanup sprint

## Ordered sequence
(The order a single Sonnet agent should execute the units, one at a time. Numbered. Each line: unit id+title, one-line why-here, and its hard dependencies.)

## Dependency graph
(Which units block which. ASCII or bullet tree.)

## Conflicts auto-resolved
(Each mechanical conflict you fixed, which artifacts you edited, and the unified decision — e.g. "sentinel helpers live in core/domain/sentinel.ts; units 01 & 05 both import from there".)

## ⚠️ Decisions needed (escalated)
(Each genuine design fork: the competing options, the artifacts affected, and your recommendation. The user resolves these before those units are implemented.)

## Ready-to-implement checklist
(Per unit: ready ✅ / blocked-on-decision ⛔, with the blocker.)
\`\`\`

Be concrete: cite unit ids and file paths throughout. After editing artifacts, they must still each be a complete standalone spec.`, { model: 'opus', label: 'reconcile', phase: 'Reconcile' })

log(`Done. Review ${OUT}/00-implementation-queue.md, resolve any escalated decisions, then implement units one at a time.`)
