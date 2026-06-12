# Stage 0 — v1-Spine First-Principles Re-Audit (D24)

**Date:** 2026-06-13 (sprint 01). **Method:** one fresh-context read-only agent per kept component
(master plan §7), each answering *"designed from zero for v2, would this differ?"* against the
master plan §3–4 target architecture and the per-stage specs.

**Immovable constraint (Q8), stated and respected in every verdict:** the LINE webhook ingest
**Function URL** and the mini-app **CloudFront domain** (LIFF endpoint) keep working as URLs — LINE
console settings cannot change. Internals behind them are rebuildable; the URL-bearing resources
are never deleted/recreated. No verdict below proposes changing either URL.

## Summary table

| # | Component | Verdict | One-line finding | Absorbing spec |
|---|---|---|---|---|
| 1 | Webhook ingest handler (`lambda/ingest.ts`) | **KEEP** | Thin verify→enqueue→200 pass-through; zero catalog coupling; minimal IAM | — |
| 2 | Signature verify (`adapters/line/signatureVerifier.ts`) | **KEEP** | Timing-safe HMAC via SDK; SSM-sourced secret; clean error paths; 91% covered | — |
| 3 | SQS spine (`adapters/queue/sqsPublisher.ts` + wiring) | **REBUILD (config/algebra only)** | Topology + envelope sound; timeout/retry/batch algebra is v1-sized and breaks under pipeline latencies + Postgres connection limits | stage-2 (open questions Q-SA1) |
| 4 | Event processor (`app/eventProcessor.ts` + `lambda/processor.ts`) | **KEEP** | Textbook hexagonal seam; routing has zero adapter imports; Stage 2 swaps extractor+catalog behind existing ports | — (port contracts noted in stage-2) |
| 5 | Debounce/sweep (`app/ingestionSweep.ts` + `lambda/sweep.ts`) | **REBUILD (orchestration)** | Debounce model (GSI1 readyAt + claim atomicity) survives; `extractAndApply` and the conversation-level retry-cap/FAILED algebra are bound to v1's single-shot extraction | stage-2 (open questions Q-SA2) |
| 6 | Idempotency (`lib/idempotency.ts`) | **KEEP** | Correctly scoped to webhook redelivery on DynamoDB; pipeline-step exactly-once belongs in Postgres write contracts (stage-2 inc. 6), not middleware | — |
| 7 | LINE adapters (gateway, parser, rich menu, token verifier) | **KEEP** (all four) | Mapper-agnostic `PropertyCard` rendering, stateless parsing, pure menu builder, stable LIFF auth; v2 work is new *handler-layer mappers*, not adapter changes | — |
| 8 | S3 raw archive (`adapters/s3/rawArchive.ts`) | **REBUILD (port contract + lifecycle)** | Write path + key scheme sound; port lacks the derivatives contract (D2.7), retention/PII posture unspecified, no export/anonymize path for Tier A | stage-2 (Q-SA3); retention → stage-1 infra notes (Q-SA4) |
| 9 | Pulumi setup + deploy identity (`infra/`) | **KEEP** | Modular program scales additively; URL-bearing resources have stable URNs, no force-new properties; policy already covers RDS/CloudFront growth | — |
| 10 | Test harness patterns (vitest, DynamoDB Local, fakes-at-ports) | **KEEP** | Fakes-at-ports + Docker-container lifecycle generalize directly to Stage 1's Postgres harness; coverage gates core-only by design | — (per-package coverage set per stage) |

**Net:** the spine survives on evidence — its topology, crypto, hexagonal seams, and storage
patterns converge with a from-zero v2 design. Every REBUILD is *scoped*: configuration algebra,
one orchestration method, one port contract. No component is discarded wholesale; no verdict was
"kept silently." (Rows 9–10 were added after the spec auditor flagged that master-plan §7 names
two components beyond Increment 5's own list — coverage is now the full §7 set.)

## Per-component verdicts

### 1. Webhook ingest handler — KEEP

Thin by design: verify HMAC on raw body → archive → batch-enqueue to SQS → 200. Zero references
to catalog entities or extraction; IAM grants only `sqs:SendMessage` + SSM secret read
(infra/src/lambdas.ts:39–43). The `EventPayload { webhookEventId, raw }` envelope is dictated by
LINE's protocol + the spine, not v1 modeling. A from-zero design converges on exactly this. 10s
timeout / 256MB completes in <100ms. Function URL is the immovable resource
(infra/src/lambdas.ts:229–232) and is untouched by every later stage (D2.5: new code ships inside
the existing lambdas).

### 2. Signature verification — KEEP

Wraps `@line/bot-sdk` `validateSignature` (HMAC-SHA256 + `timingSafeEqual` — constant-time by
construction); secret from SSM SecureString with Powertools caching, injected at cold start; invalid
signature → `false` → 403 with no secret leakage (ingestHandler.ts:28–30); verify-ping empty event
arrays return 200 without enqueuing. 91.66% branch coverage. Transport-agnostic
(`string | Buffer`); nothing downstream (Postgres, pipeline) touches it.

### 3. SQS spine — REBUILD (timeout/retry/batch algebra; keep topology + envelope)

Keep: standard (non-FIFO) queue is right (ordering handled by per-conversation debounce/claim, not
the queue); DLQ + `ReportBatchItemFailures` partial-batch handling; minimal JSON envelope.

Rebuild findings (all stage-2-bound):
- **Visibility timeout** 180s = 6× the *processor's* 30s timeout (infra/src/storage.ts:120–129;
  lambdas.ts:235–240). v2's sweep-side pipeline work (multi-step LLM + vision + Postgres writes)
  runs minutes, not seconds; messages would redeliver mid-work and false-fire the DLQ. The timeout
  algebra must be re-derived from v2 worst-case step latencies.
- **maxReceiveCount 5** assumes fast-fail permanent errors; with long processing it amplifies
  redelivery storms. Re-derive with the new timeouts (audit suggestion: lower + alert on slow
  sweeps).
- **Batch size 10** (lambdas.ts:238) × Lambda concurrency × per-invocation Postgres pool must be
  sized against db.t4g.micro's ~85 max_connections. Connection-budget math becomes a stage-1/2
  acceptance criterion, not an afterthought.

### 4. Event processor — KEEP

`eventProcessor.ts` (347 lines) has zero `adapters/*` imports; all effects flow through typed ports
(`ConversationStore`, `PropertyStore`, `MessageRepository`, `PropertyExtractor`, `LineGateway`).
Conversational features (commands, postbacks, edit-by-reply) depend on catalog-query ports, not
extraction, and survive the cutover unchanged. Stage 2 swaps `claudeExtractor` → `packages/pipeline`
and the DynamoDB catalog → Postgres repositories purely in the wiring files
(lambda/processor.ts:34–101). Domain `Property` is a neutral field bag, not a DynamoDB shape.
File-size watchlist: largest files are adapters/views slated for replacement anyway.

### 5. Debounce/sweep — REBUILD (extractAndApply orchestration + retry algebra; keep debounce model)

Keep: quiet-debounce timing in the conversation tracker (GSI1 sparse `readyAt` key,
catalogRepository.ts:60–89), atomic claim (`claimConversation`), watermark against message
re-processing, 2-min EventBridge tick. This mechanism is extraction-agnostic and survives as-is.

Rebuild findings (stage-2-bound):
- `extractAndApply` (ingestionSweep.ts:235–326) is hard-bound to v1's single-shot
  `extractor.extract() → upsert` contract; v2's six-step pipeline (with per-step failure semantics
  and a gate verdict) replaces this method body wholesale.
- The **conversation-level retry cap / FAILED status** (ingestionSweep.ts:200–212;
  catalogRepository.ts:214–228) conflates "attempted extraction" with "attempted all steps"; v2
  needs per-step failure handling and partial success (some segments land, others queue for
  moderation), per the stage-2 gate contract.
- **Batch-mode trigger**: with Batch API latency (≤1h typical), a 2-min poll that skips INGESTING
  conversations is workable but wasteful; stage 2 must decide poll-status vs completion-trigger.

### 6. Idempotency — KEEP

Powertools idempotency on a dedicated DynamoDB table, keyed on `webhookEventId`, Lambda-context
registered so in-progress TTL tracks remaining execution (lambda/processor.ts:92–98;
lib/idempotency.ts:18–38). Correctly scoped to webhook redelivery: SQS redelivery is handled by
visibility timeout + DLQ; sweep safety comes from claim atomicity + watermark. A from-zero v2
design keeps exactly this and puts pipeline-step exactly-once where it belongs — idempotent
Postgres write contracts (stage-2 increment 6) and Batch API request idempotency — rather than
stretching middleware idempotency over pure transformations. DynamoDB stays for plumbing (D2.5);
no Postgres migration of this table.

### 7. LINE adapters — KEEP (gateway, webhook parser, rich menu, token verifier)

- **Gateway** (lineGateway.ts): renders domain `PropertyCard`s (mapper-agnostic); enforces LINE
  limits (13 quick replies, 20-char labels, 12 carousel bubbles via core/domain/lineLimits.ts);
  classifies permanent vs transient LINE errors so SQS isn't thrashed. v2's work is new
  Listing→PropertyCard *mappers* in the handler layer (Stage 3/5), not adapter changes.
- **Webhook parser** (webhookParser.ts:131–164): stateless SDK-event → domain `InboundEvent`
  facade; deliberately loose raw schema (passthrough) for SDK drift tolerance.
- **Rich menu** (richMenu.ts): pure builder over postback vocabulary; idempotent install script;
  LIFF tab URL injected at deploy time.
- **Token verifier** (lineTokenVerifier.ts:34–73): LIFF id-token check via LINE's verify endpoint
  with `aud` + expiry re-checks; Stage 5 keeps LIFF auth unchanged.

No core code imports `@line/bot-sdk` directly — the hexagonal boundary is clean everywhere.

### 8. S3 raw archive — REBUILD (port contract + lifecycle; keep write path + key scheme)

Keep: archives full raw webhook JSON under `raw/{y}/{m}/{d}/{conversationKey}/{eventId}.json` and
media under `conv/{conversationKey}/{messageId}/content.ext` — time-partitioned, conversation-keyed,
derivable without ListObjects (rawArchive.ts:7–11,37,54); private bucket, AES256, versioning,
presigned-URL reads only.

Rebuild findings:
- **Derivatives contract missing** (stage-2 D2.7 needs 1568px vision + 640px thumb variants): the
  `RawArchive` port returns only the original key; Stage 2 extends the port. → stage-2 open question.
- **Retention/PII posture unspecified**: Thai chat data (names, IDs, phone numbers) archived
  indefinitely with only a 30-day IA transition (infra/src/storage.ts:105–115); no retention rule,
  no scrub-on-export path for Tier A golden-set building (deferred by plan 19 line ~192, but the
  storage policy itself should be stated). → stage-1 infra note + stage-2 open question.
- Query-by-date-range for dataset export is prefix-scan only; acceptable for synthetic-first Stage
  2, revisit if the golden set grows.

### 9. Pulumi setup + deploy identity — KEEP

The modular program (infra/src/{naming,iam,storage,lambdas,miniapp}.ts) extends additively: Stage 1
adds `database.ts`, Stage 4 adds a second distribution, both on existing patterns. The two
URL-bearing resources are URN-stable with no force-new properties set (ingest Function URL:
lambdas.ts:179–232; miniapp CloudFront: miniapp.ts:165–214), so config-only changes never replace
them — the immovable constraint is structurally protected, not just policy. The deploy-user policy
already scopes `rds:*` to `linerobot-*` and covers CloudFront (deploy-user-policy.json:19–46,
95–99); growth is scope-count, not structure. Local file backend + passphrase remains right for a
solo founder on one staging stack (no concurrent-state contention); production backend (S3+KMS) is
a noted future step, not now.

### 10. Test harness patterns — KEEP

Hand-written fakes implementing port interfaces (e.g. FakeCatalog, test/fixtures/fakeCatalog.ts)
are the dominant pattern — minimal `vi.mock`, no instrumentation brittleness; integration tests use
a real DynamoDB Local container with health-check retry + per-suite container names
(test/integration/dynamodbLocal.ts:43–81). Stage 1's Docker-Postgres harness (D-S1-11) mirrors this
lifecycle exactly — same pattern, second implementation. Coverage gates core-only at 80%
(vitest.config.ts:7–22) with `all: true` so untested adapter code stays visible; new v2 packages
configure their own thresholds as their code lands (free-check requirement). Carry-forward notes
for v2: keep per-suite container isolation (Postgres too); fakes/stubs implement contracts, never
`vi.fn()` callbacks, including LLM-port stubs in the Stage 2 eval harness. Immovable URLs: n/a.

## Open questions threaded into downstream specs

- **Q-SA1 → stage-2**: re-derive SQS visibility timeout / maxReceiveCount / batch size from v2 step
  latencies and the Postgres connection budget (db.t4g.micro ≈ 85 connections); make the
  concurrency×pool≤budget inequality an acceptance criterion.
  **RESOLVED 2026-06-13 (sprint-01 extension):** the inequality is now executable — `infra/src/naming.ts`
  throws at preview time if Σ(reservedConcurrency × pool) > 60-connection budget; sweep capped at 3
  (rate-2min cron × 180s ⇒ ≤2 natural overlaps), website SSR at 20. SQS algebra documented as
  v2-unchanged: the processor never touches Postgres (interactive v1 path; Stage 5 revisits);
  visibility 6×timeout, maxReceiveCount 5 → DLQ, batchSize 10 + partial-batch reporting stand.
- **Q-SA2 → stage-2**: replace `extractAndApply` orchestration + conversation-level retry cap with
  per-step failure semantics and partial success; decide Batch-completion trigger (poll vs push).
- **Q-SA3 → stage-2**: extend the `RawArchive` port with the image-derivatives contract (D2.7) and
  a scrub-on-export path for future Tier A fixtures.
- **Q-SA4 → stage-1**: state the raw-archive retention policy as infra config (explicit lifecycle
  rule + one-paragraph data-handling statement), even if the chosen retention is "indefinite for
  now".
