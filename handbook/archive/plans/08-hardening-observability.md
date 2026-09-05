# 08 — Hardening, Observability & LLM Seam

**Goal:** make the system operable long-term and document the path to the next (LLM) phase.
**Prerequisite:** Stage 07 (prod live). Ongoing / iterative.

## Work items

### 1. Dashboards & cost
- `aws.cloudwatch.Dashboard`: Lambda invocations/errors/duration/concurrency, SQS depth + DLQ,
  DynamoDB consumed capacity, S3 object count/size.
- Quick cost review: confirm spend is effectively within free tier (Lambda + SQS + DynamoDB
  on-demand + S3); note any surprises.

### 2. Docs & runbook
- `README.md`: what the bot does, architecture diagram, how to build/test/deploy each stack.
- **Runbook**: deploy, rollback (alias repoint), how to drain/replay the DLQ, where logs live,
  how to rotate the LINE channel secret/access token (update SSM via `pulumi config set --secret`
  → `pulumi up`).
- **ADRs** for the locked decisions in `00-overview.md` (async, DynamoDB+S3, library stack,
  Pulumi Cloud, region).

### 3. Test/quality hardening
- Raise/confirm coverage thresholds; add contract tests for adapters; add a forged-signature and
  malformed-body regression test set.
- Run `/security-review` over the diff; address findings (IAM scope, secret handling, public
  Function URL posture).

### 4. Document the LLM seam (next phase prep)
- Write `docs/adding-a-handler.md`: to add the LLM bot, implement a new `MessageHandler` in
  `packages/bot/src/core/handlers/`, register it in `HandlerRegistry`, and use
  `MessageRepository.findRecent(ref, limit)` for conversation context. **No infra change** for a
  same-shape handler; only add resources (e.g. model access / vector store) when the LLM work
  actually needs them.
- Note future considerations: per-conversation context window size, LINE **loading indicator**
  (`docs/.../messaging-api/use-loading-indicator/index.md`) and **push** fallback for
  slow LLM responses, and possible streaming/partial replies.

## Quality gate (must pass)
- Dashboard live; README + runbook + ADRs committed; security review actioned; LLM-seam doc written.

## Done criteria
System is documented, observable, and ready to grow into the LLM phase without re-architecting.

## References
- `docs/.../messaging-api/{use-loading-indicator,sending-messages}/index.md`
- `00-overview.md` (decisions, architecture, seam).
