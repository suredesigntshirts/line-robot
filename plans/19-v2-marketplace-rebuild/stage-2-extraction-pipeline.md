# Stage 2 — Extraction Pipeline v2

**Spec status: SKELETON.** This document is fleshed into a full spec, iterated with the user, and approved before any code for this stage is written. (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

## Purpose

Replaces the v1 single-big-schema extractor with a six-step pipeline that permanently dissolves the 16-union-cap constraint, enables per-step evaluation, and activates all three cost levers (Batch API, prompt caching, image downscaling) that were unused in v1. Also establishes the eval harness and golden set — the first real quality scorecard — and writes extraction results into Postgres rather than the v1 DynamoDB catalog table. Corresponds to master plan §4.3, §5.1, §5.2, and decisions D11, D15, D16.

## Scope

**In:**
- Six-step pipeline replacing `packages/bot/src/adapters/anthropic/claudeExtractor.ts`:
  1. **Classify & preprocess** — image downscaling to derivatives before any vision call; image classification (property photo / chanote / other) and OCR on derivatives (as today, hardened)
  2. **Segment** — split conversation batch into individual property mentions; hardened from v1
  3. **Extract** — per-segment structured extraction; validated zod enums (not free strings); Thai-unit normalization; small focused schemas (no 16-union cap)
  4. **Dedup** — deterministic blocking first (deed number, geohash proximity, normalized-address/trigram similarity → small candidate set), LLM verify only on survivors; absorbs plan 18 design
  5. **Translate** — write-time LLM translation of listing content into other shipped language(s); stored per-language in Postgres (schema from Stage 1)
  6. **Quality gate** — completeness/spam/duplicate screen before any public visibility; failures → moderation queue (D11)
- Hybrid sync/batch (D15): sweep/passive path uses Anthropic Batch API; interactive edit path (bot DM → confirm) is synchronous
- Prompt caching made real: shared cached prefix above the minimum token threshold for each step
- Per-call cost logging: every LLM call logs model, tokens, estimated cost to a structured log
- Image derivative storage in S3 (downscaled variants for vision calls and web delivery)
- Eval harness: thin bespoke TS runner (not promptfoo); per-field deterministic scoring; separate scores for segmentation, extraction accuracy, dedup precision/recall
- Golden set: Tier A (real anonymized archived chats, hand-verified) + Tier B (synthetic, from Stage 1 generator); baseline scorecard committed to repo; `npm run eval` now produces real results
- Writes to Postgres via `packages/db` (replaces v1 DynamoDB catalog writes)
- v1 extractor cutover plan: defined and executed here — point where v1 catalog write path is switched off
- Dedup pairs from synthetic generator (generated duplicates-with-variation for labeled match/no-match pairs)

**Out (explicitly):**
- UI components (Stage 3)
- Auth or LIFF changes (Stage 4/5)
- Land-office data ingestion (Stage 7)
- The eval runner scaffold itself — that stub was Stage 0; this stage populates it with real cases

## Key deliverables

1. `packages/pipeline/` with the six-step pipeline, each step independently testable
2. Anthropic Batch API integration on the sweep path; synchronous path on the interactive path
3. Prompt-caching wrappers with verified cache-hit logging (confirms caching is actually active, not inert as in v1)
4. Image derivative pipeline: S3 upload of downscaled variants + classification/OCR on derivatives
5. Per-call cost log (format defined; visible in CloudWatch)
6. Eval golden set: Tier A anonymized + Tier B synthetic cases committed to repo
7. `npm run eval` producing a real scored report with pass/fail per case and aggregate scorecard
8. Scorecard baseline committed (first real baseline; subsequent runs compare against it)
9. v1 extractor retired (file deleted or clearly marked deprecated); Postgres is the sole catalog write path
10. Integration test covering a full sweep → pipeline → Postgres write round-trip against DynamoDB Local + a Postgres test instance

## Dependencies

- Stage 1 must be complete: Postgres schema + `packages/db` + `packages/domain` + synthetic generator all required
- Stage 0 must be complete: quality workflow in place
- Anthropic Batch API access confirmed (existing API key should suffice — verify during flesh-out)
- Real archived LINE chat transcripts must be collected and anonymized before Tier A eval cases can be committed (manual step; scrub procedure defined in this spec)

## Acceptance criteria (sketch)

- `npm run eval` runs against the committed golden set and prints a per-field scorecard; zero crashes on any Tier A or Tier B case
- Segmentation score: property count correct on ≥90% of golden cases (baseline to be hardened when fleshed)
- Extraction score: threshold TBD at flesh-out time based on initial golden set run; committed baseline then anchors regressions
- Dedup: precision and recall on labeled pairs both ≥90% (threshold to be confirmed at flesh-out)
- Batch API path: a sweep invocation using the batch mode completes without error; cost log shows batch pricing
- Prompt caching: cache-hit rate logged; at least one step shows confirmed cache hits in staging (not just configured)
- v1 extractor: no import of the old single-schema extractor survives in production code paths
- 16-union cap: the old regression test (≤16 unions on the whole schema) passes trivially because the new multi-step schemas never approach the limit; test is retained as documentation but its threshold becomes meaningless

## Open questions (resolve when fleshing this spec)

- **Anonymization scrub procedure**: exact steps to strip LINE user IDs, display names, phone numbers, and location data from archived chats before they enter the repo-committed Tier A golden set — who does it, what tooling, how is completeness verified?
- **Per-step model selection**: which model for each of the six steps? Master plan D16 says "quality first, optimize later using scorecard data" — the fleshed spec should define initial model assignments and the criteria by which the scorecard will justify downgrading a step to a cheaper model
- **Batch API confirmation-message UX**: passive path results can take up to 1h (master plan §8 risk); what message does the bot send to the group when extraction is queued vs when it completes? Where does this UX live (bot package, pipeline package)?
- **When does v1 catalog write path switch off?** Is there a flag/feature toggle, or is it a hard cutover at the end of this stage? What happens to live groups during the transition?
- **Dedup blocking criteria precision**: geohash proximity threshold (what radius?), trigram similarity threshold for address normalization — these are tunable parameters; where do they live and how are they tested?
- **Image derivative sizes**: what downscaled resolutions are generated? One size for vision calls, one for web thumbnails, or more? Affects S3 cost and pipeline complexity
- **Translate step model and cost**: full translation of every listing field at write time — what is the estimated per-listing cost? Is caching applicable to translation prompts?

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), Playwright smoke (if user-facing), docs updated.

Stage-2-specific review notes:
- The spec auditor verifies that each of the six pipeline steps is independently testable and that no step imports another step's internals — the pipeline must be a chain of pure functions or clearly bounded adapters
- The correctness reviewer pays special attention to the dedup layer: a false negative (duplicate allowed through) is a user-visible defect; test coverage for the edge cases (same listing re-posted days apart, minor price edit, photo set reordered) must be demonstrated
- The simplicity critic scrutinizes the hybrid sync/batch routing: the simplest correct routing switch wins; no elaborate abstraction before there are real operational reasons
- Stage gate is the first eval scorecard check against a real baseline; the user reviews the scores and sets the "acceptable" threshold before any further stages begin

## Iteration log

| Date | What changed | Why |
|---|---|---|
| (empty — filled during flesh-out and build) |
