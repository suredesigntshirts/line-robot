# Stage 2 — Extraction Pipeline v2

**Spec status: FLESHED — pending founder approval.** (Lifecycle: skeleton → fleshed spec → approval → build with increment reviews → stage gate → retro.)

## Purpose

Replace the v1 single-big-schema extractor (`packages/bot/src/adapters/anthropic/claudeExtractor.ts`) with a multi-step pipeline that permanently dissolves the 16-union cap (each step has its own small schema), is evaluated per-step against a **synthetic-first** scorecard, and activates the three cost levers v1 left inert (Batch API, prompt caching, image downscaling). Output lands in Postgres via `packages/db`, not the v1 DynamoDB catalog. Implements master plan §4.3 + decisions D11/D14/D15/D16, and DF-6 (iterative completion loop), FIELD-02/03/11, COPY-05/12 from `docs/research/00-product-principles.md`.

---

## Decisions (each with rationale)

**D2.1 — Synthetic-first evals; Tier A deferred indefinitely.** Founder ruling: ground truth comes *by construction* from the Stage 1 generator (a ground-truth spec → chaos profile → transcript; expected extraction is known). The scorecard baselines on synthetic only. We reserve a `goldenSet/tierA/` slot + a `source: "tierA" | "synthetic"` case field so hand-verified real chats can be added later with zero refactor, but **nothing tonight depends on founder labeling**. This also resolves the anonymization-scrub open question: deferred with the Tier A work (no real chats enter the repo this stage).

**D2.2 — Per-step model assignment (quality-first, D16).** Initial assignments, justified by step difficulty; the scorecard later justifies downgrades.
| Step | Model | Why |
|---|---|---|
| Classify+OCR (vision) | `claude-haiku-4-5` | High volume (1 call/image); chanote OCR is the only hard part and escalates to Sonnet on `lowConfidence`. |
| Segment | `claude-sonnet-4-6` | Splitting multi-property dumps + photo attribution is the error-prone step; cheap relative to a wrong split cascading. |
| Extract (per segment) | `claude-sonnet-4-6` → `claude-opus-4-8` on `lowConfidence` | Quality-first; Sonnet handles the body, Opus re-reads conflicting figures / ambiguous deeds. |
| Dedup verify | `claude-haiku-4-5` | Only runs on a ≤8 blocked candidate set; a yes/no same-property judgment. |
| Translate | `claude-haiku-4-5` | Constrained th↔en of already-structured fields; cheap, cacheable glossary prefix. |
| Quality gate | `claude-sonnet-4-6` | Produces the DF-6 missing/weak-fields contract that drives bot DMs — worth the spend. |
Model IDs are current per cached `docs/llms.txt` (Haiku 4.5 $1/$5, Sonnet 4.6 $3/$15, Opus 4.8 $5/$25 per MTok). Adaptive thinking only on Sonnet/Opus; Haiku rejects `effort`/`thinking`.

**D2.3 — Hybrid sync/batch routing (D15).** A single `mode: "sync" | "batch"` flag on the pipeline entry. **Passive sweep → Batch API** (`client.messages.batches.*`, 50% cost, typically <1h, 24h max). **Interactive paths (DM edit, web-form, claim-confirm) → sync** (`messages.parse`). Routing lives in the bot wiring, not the pipeline core — the pipeline exposes both a sync executor and a batch request-builder/result-parser over the *same* step contracts (one code path, two transports). Per the §8 master-plan risk, batch latency forces the group confirmation copy below.

**D2.4 — Batch-pending UX copy.** On a passive sweep that enqueues a batch, the bot does **not** stay silent. It posts once to the group:
> 🔎 กำลังอ่านรายการของคุณอยู่ — เดี๋ยวสรุปให้ภายในไม่เกิน 1 ชม. / Got it — reading your listings now. I'll post a summary here within the hour.

On batch completion the normal confirmation (DF-6 loop or the listing summary) fires. Copy lives in `packages/bot` i18n strings (`pipeline.batchPending.{th,en}`), not the pipeline package. Honest about the ≤1h window; no fake "instant".

**D2.5 — Cutover: deploy over the existing stack; URLs are immovable.** The webhook ingest Function URL and the CloudFront LIFF endpoint **cannot change** (LINE console pins them). So pipeline v2 ships as **new code inside the existing lambdas**: the sweep lambda's `extractAndApply` calls `packages/pipeline` and writes to Postgres; DynamoDB stays for ingestion plumbing only (raw messages, idempotency, conversation tracker/debounce). The v1 catalog DynamoDB table is **left in place, read-only** (no new writes, no deletes) and removed in a later cleanup stage. Cutover is a **hard switch at end-of-stage behind a `PIPELINE_V2` env flag** (default off until the integration test + first scorecard pass green in staging; then flip). `claudeExtractor.ts` and the 16-union regression test are deleted only once the flag is on in staging and Postgres writes are verified.

**D2.6 — Dedup blocking thresholds (tunable config).** Defaults, all in `packages/pipeline/src/dedup/config.ts`, overridable by env:
- Geohash proximity: precision-6 cell (~1.2 km) center+8 neighbours; then Haversine filter at **radius ≤ 1.0 km**.
- Deed/parcel exact match → score 1.0 (definitive, skips geo/text).
- Trigram (Dice) similarity on normalized address ≥ **0.55**; token-set Jaccard ≥ **0.50** as the admin/text block when no coords.
- Block cap: top-**8** candidates to LLM verify.
These are validated by synthetic dup pairs (D2.9), not guessed in prod (the open item plan-18 flagged). Keys are deed → geo → admin/text, never text alone (DEAL-09).

**D2.7 — Image derivatives: exactly two sizes.** Pipeline downscales **before any vision call**.
- **Vision derivative**: long edge **1568 px**, JPEG q80 — the pre-4.7 vision tile sweet spot; caps image tokens (~1600 vs ~4784 at full res) with no accuracy loss for property/chanote classification at our quality bar.
- **Web thumb**: long edge **640 px**, JPEG q70 — card carousel / LIFF detail.
Original is archived in S3 (already done by v1 webhook). Two sizes only — no responsive ladder; revisit if the web design needs it. Stored under `s3://…/derivatives/{propertyId}/{photoId}-{vision|thumb}.jpg`.

**D2.8 — Enum validation everywhere (hard-block + extraction rules).** All controlled vocabularies are `z.enum` in the step schemas, validated in-process (not free strings):
- **FIELD-02/03**: deed `titleType` is an enum; the **5 non-transferable types** (ส.ป.ก./ภ.บ.ท.5/น.ส.2/ส.ท.ก./ส.ค.1) **hard-block a *sale* listing at the gate** (rentals exempt). Unknown deed → gate flags "deed unverified", doesn't publish.
- **COPY-05**: `ขายด่วน`/urgent → `urgentBadge: boolean`, **stripped from the title** (badge, not headline text).
- **COPY-12**: emoji stripped from `title`/`price`/`area` fields (post-extraction normalizer in `packages/domain`).
- **FIELD-11**: seller assertions (e.g. "fully furnished", "foreign-quota available") map to enums **as-claimed** — the pipeline never re-judges truth; provenance/verification is a separate UI concern (LEGAL-06).

**D2.9 — Translate step: th↔en at write time, per-language rows.** Listing content (`title`, `description`, `notes`, locality labels) is translated into the *other* shipped language and stored as per-language rows (Stage-1 schema: `listing_content(listing_id, lang, …)`). Numeric/enum/geo fields are language-neutral and not translated. Model `claude-haiku-4-5` with a cached glossary prefix (B3 ~30-term table). **Per-listing cost estimate**: ~1.2k input + ~0.6k output tokens one direction ≈ **$0.004/listing** at Haiku rates (batch halves it to ~$0.002). Negligible; runs in the same batch as extraction on the passive path.

---

## Pipeline step contracts

Each step = a pure function (or a thin port for the LLM/S3 seam), independently testable, **no step imports another step's internals**. Shared cached system prefix per step (≥4096 tokens for Haiku/Opus, ≥2048 for Sonnet — pad the taxonomy/glossary to clear the minimum, verify via `usage.cache_read_input_tokens>0`). All log `{step, model, inputTokens, outputTokens, cacheReadTokens, estCostUsd, mode}` (the cost log, D requirement).

1. **classify+ocr** — in: `{ derivative: VisionImage }` → out: `{ kind: "property"|"chanote"|"other", label, chanote?, ocrText }`. Vision on the **1568px derivative**, never the original. Fail: returns `null` → image stored as plain property photo (v1 behavior, kept).
2. **segment** — in: `{ transcript, mediaMarkers, geoHints, candidates }` → out: `{ segments: [{ label, imageIndices, mapIndex, existingPropertyId, ambiguous, ambiguousWith }] }`. Fail: `null` → single-segment fallback over the whole transcript.
3. **extract** (per segment) — in: `{ transcript, focus, geoHints, candidates }` → out: `ExtractedListing` (enums per D2.8; Thai-unit normalized: rai/ngan/wah triple + computed sqm). Ladder Sonnet→Opus on `lowConfidence`. Fail: `null` → segment dropped, logged, gate notified.
4. **dedup** — in: `{ extracted, blockPool }` → deterministic block (D2.6) → out: `{ decision: "new"|"merge", intoId?, score, reasons }`; LLM verify only on the ≤8 survivors. Fail: defaults to **"new"** (never silently merge — a false merge is the user-visible defect).
5. **translate** — in: `{ listingContent, fromLang }` → out: `{ lang, title, description, notes }` for the other shipped language. Fail: skip the target-lang row, gate flags "translation pending" (non-blocking).
6. **gate** — in: `{ extracted, photos, deedType, listingType }` → out: **`GateResult { pass: boolean, missing: WeakField[], blockers: Blocker[] }`** where `WeakField = { field, severity: "required"|"important", promptKey }` and `Blocker` carries the hard FIELD-03 deed reason. This is the **DF-6 bot feedback contract** (below). Fail: treat as `pass:false` with a generic "needs review" → moderation queue (D11).

### DF-6 completion loop (gate → bot)

The gate emits the structured `missing/weak` list; **`packages/bot` owns the conversation**. On `pass:false` with no hard blocker, the bot DMs the poster requesting the missing **important fields AND photos** (no hard photo-count block — CONV-01 nudge mode), one concise ask at a time, re-running the gate on each reply until `pass:true`. Hard `blockers` (non-transferable deed on a sale) stop publish and explain why. The loop is iterative and field-agnostic (generalizes CONV-01 to all gate fields). Contract: pipeline returns data; bot renders/escalates — pipeline imports no LINE adapter.

---

## Increments

Each: spec-auditor + correctness + simplicity-critic review (master plan §5.3). Files under `packages/pipeline/` unless noted.

1. **Pipeline scaffold + cost log + step ports.** `src/{ports,steps,cost}.ts`, the 6 step interfaces, `CostLog`. Accept: `npm run test` green; cost log shape unit-tested. Review focus: no premature abstraction — ports only at LLM/S3/DB seams.
2. **Image derivatives.** `src/media/derivatives.ts` (sharp); S3 upload of 1568/640 variants; classify+ocr reads the 1568. Accept: derivative sizes asserted; vision call receives derivative not original. Review: 2 sizes only, no ladder.
3. **classify+ocr + segment + extract steps** (sync executor first). Enum schemas (D2.8), Thai-unit normalizer in `packages/domain`. Accept: each step unit-tested with a fake LLM; enum hard-block + emoji-strip + ขายด่วน-badge covered. Review: schemas small, FIELD-11 no-re-judge honored.
4. **Dedup (block→verify).** `src/dedup/{normalize,score,candidateFinder,config}.ts` (absorbs plan-18 Phase 1). Accept: synthetic dup pairs → precision & recall ≥ **0.90**; deed-exact beats geo beats text; default-to-new on verify failure. Review: thresholds in config, tested not guessed.
5. **Translate + gate + DF-6 contract.** `src/{translate,gate}.ts`; `GateResult` type in `packages/domain`. Accept: gate emits structured missing/weak list; FIELD-03 deed blocker on sale; translation writes per-lang rows. Review: gate→bot contract has no LINE import.
6. **Postgres write path.** Wire steps → `packages/db` upserts (listing + per-lang content + photos + dedup merge). Accept: **integration test** sweep→pipeline→Postgres round-trip (DynamoDB Local + Postgres test instance). Review: writes idempotent on re-sweep.
7. **Batch transport.** `src/batch/{build,collect}.ts` over the same step contracts; bot wiring routes sweep→batch, interactive→sync; batch-pending copy (D2.4). Accept: a sweep using batch mode completes; cost log shows 50% batch pricing; cache-hit logged on ≥1 step. Review: routing is one flag, no elaborate transport abstraction.
8. **Eval harness + synthetic golden set + baseline.** `src/eval/` runner (bespoke TS, not promptfoo); per-field deterministic scoring (exact enums/numbers w/ tolerance, fuzzy free-text), separate segmentation + dedup scores; `goldenSet/{synthetic,tierA(empty)}/`. Accept: **`npm run eval` produces a scorecard over N≥50 synthetic cases**, zero crashes; baseline committed. Review: Tier A slot wired but empty; advisory-only (D21).
9. **Cutover.** Flip `PIPELINE_V2` in staging; verify Postgres writes + first scorecard; delete `claudeExtractor.ts` + 16-union test; v1 catalog table left read-only. Accept: no import of the old extractor survives; staging green. Review: nothing still writes the v1 catalog.

---

## Cutover plan

1. Ship increments 1–8 behind `PIPELINE_V2=off` — v1 keeps running, v1 catalog still written.
2. In staging, flip `PIPELINE_V2=on`: sweep lambda calls `packages/pipeline`, writes Postgres (catalog), DynamoDB still carries messages/idempotency/tracker.
3. Verify: integration test green; `npm run eval` scorecard committed; a real staging sweep lands a listing in Postgres with per-lang rows + derivatives.
4. Flip prod. The webhook Function URL and CloudFront LIFF endpoint are untouched (immovable). 
5. Delete `claudeExtractor.ts`, its schema test, and the v1 catalog **write** paths. The v1 catalog **table** stays (read-only) — deleted in a later cleanup stage, not here.

> **Gap this plan originally missed (found 2026-06-13): the catalog READERS.** Steps 1–5 scope the
> *writer* only. But the bot processor's in-chat commands AND the read-api / MINI App still READ the
> v1 DynamoDB catalog, so once the writer flips they serve a frozen catalog. Repointing them is a
> **post-flip follow-up, not a flip blocker** (the flip is reversible; do it first per MORNING.md §3).
> When done: build a Postgres `PropertyStore` (the `PropertyStore` slice of `core/ports/catalog.ts`;
> the `ConversationStore` slice — tracker/membership/memory — stays DynamoDB), then repoint the
> read-api with one `read-api.ts` `buildDeps()` line + `DATABASE_URL` — the Preact MINI App SPA is
> **unchanged** (it only speaks the shared `Property`→DTO contract). Needs a new **`listing_event`**
> Postgres table (the `viewing` table does NOT cover follow-up reminders — no `notify_conversation_key`/
> `notified_at`, no write path). Verified by adversarial sub-agent review 2026-06-13.

## Stage gate checklist

- [ ] `npm run eval` produces a synthetic scorecard (N≥50); baseline committed; segmentation property-count ≥90%, dedup P/R ≥90% (advisory thresholds, founder confirms).
- [ ] Batch path completes a real staging sweep; cost log shows batch (50%) pricing + ≥1 confirmed cache hit (`cache_read_input_tokens>0`).
- [ ] Integration test: sweep → pipeline → Postgres round-trip (DynamoDB Local + Postgres) green.
- [ ] FIELD-03 hard-block, COPY-05 badge, COPY-12 emoji strip, FIELD-11 no-re-judge each have a passing case.
- [ ] DF-6 loop: gate emits structured missing/weak list; bot DM iterates to pass (demoed).
- [ ] No surviving import of `claudeExtractor.ts`; v1 catalog table is read-only.
- [ ] High-effort full-diff review; hexagonal conformance (no adapter imports in pipeline core); docs/CLAUDE.md updated (drop the 16-union rule once the old extractor is gone).

## Open questions from the spine audit (stage-0-spine-audit.md, D24)

Resolve during build (each is increment-sized or folds into an existing increment):

- **Q-SA1 (SQS algebra):** re-derive visibility timeout (currently 180s = 6× the v1 processor's
  30s), `maxReceiveCount` (5), and event-source batch size (10) from v2's worst-case sweep/pipeline
  latencies and the Postgres connection budget — Lambda concurrency × per-invocation pool must stay
  comfortably under db.t4g.micro's ~85 max_connections. Make the inequality an explicit acceptance
  check in the cutover increment.
- **Q-SA2 (sweep orchestration):** `extractAndApply` (ingestionSweep.ts:235–326) is replaced
  wholesale by the six-step pipeline call; the conversation-level retry-cap/FAILED algebra
  (ingestionSweep.ts:200–212) must become per-step failure semantics with partial success (some
  segments land, others to moderation). Decide the Batch-completion trigger: keep the 2-min poll
  that skips INGESTING conversations, or add a completion push. (Default: keep the poll — simplest
  thing that works; revisit if batch volume makes it wasteful.)
- **Q-SA3 (archive port):** extend the `RawArchive` port with the image-derivatives contract (D2.7
  two sizes) when the derivatives increment lands; keep a scrub-on-export seam in mind for future
  Tier A fixtures (no work now — D2.1 defers it).

## Risks

- **Batch latency** (≤1h, 24h worst case) — mitigated by D2.4 copy; sync path unaffected.
- **Cache below minimum** — pad each step prefix past 4096 (Haiku/Opus) / 2048 (Sonnet); verify with `cache_read_input_tokens`, don't assume.
- **Dedup false-merge** — defaults-to-new on any verify failure; synthetic pairs gate precision.
- **Synthetic-only evals miss real-world distribution** — accepted (founder); Tier A slot mitigates later at zero cost now.
- **Postgres + DynamoDB dual-write window** — none: catalog writes go *only* to Postgres post-flip; DynamoDB is plumbing-only. No dual-write to reconcile.

## Iteration log

| Date | What changed | Why |
|---|---|---|
| 2026-06-13 | Sprint-01 build: increments 1–8 CODE-COMPLETE (panel-reviewed, 95 tests). Amendments: (a) `deed_no` added to `listing` via migration 0002 — D2.6 deed-exact needs a stored deed number; the Stage 1 schema lacked it. (b) Eval scores segment/extract/dedup; classify/translate/gate stay n/a until image fixtures + judge scoring (follow-up). (c) Eval has an `EVAL_LLM=oracle` harness-smoke mode; the committed baseline awaits a real-model run (BLOCKERS B2). (d) Increment 7's live acceptance (real batch sweep, confirmed cache hit) and ALL of increment 9 (PIPELINE_V2 bot wiring, staging flip, claudeExtractor deletion) are parked behind the deploy blocker — also note sharp-on-Lambda packaging is an open deploy-engineering item for the sweep bundle. (e) Gate model-fail with empty missing routes to needs_review so the DF-6 loop can't dead-end. | Build + increment reviews |
| 2026-06-12 | Skeleton → fleshed spec | All open questions resolved per founder rulings (synthetic-first evals, DF-6 loop, hybrid batch, deploy-over-stack cutover, 2 image sizes, enum hard-blocks, th↔en translate). Built unattended; pending founder approval. |
