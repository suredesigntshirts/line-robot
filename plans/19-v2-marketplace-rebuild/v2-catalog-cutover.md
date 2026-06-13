# v2 Catalog Cutover — full launch of v2 on website + mini-app, retire v1

**Spec status: FLESHED + DECISIONS RESOLVED (2026-06-13). BUILD AWAITS FOUNDER CONFIRMATION.**
Founder ruling 2026-06-13: *"We don't need to maintain our v1 pipeline and want to fully migrate to
v2 — whatever gets us to wrap up cleanly. Launch the v2 pipeline on the website and mini-app on AWS,
then move forward."* All open decisions below are now resolved to that end (recorded in §Decisions).
One decision remains for the founder: whether the small image/classify/OCR increment ships *in* the
launch or as a fast-follow (§Decision E).

## Goal

The public **website** already reads the v2 Postgres catalog (live). This cutover brings the **bot
in-chat commands** and the **LINE MINI App** onto v2 as well, flips ingestion (`PIPELINE_V2=on`) so
real LINE listings flow into Postgres, and **retires the v1 DynamoDB catalog** (writes stop; the
table is abandoned per D2, not migrated). End state: one catalog (Postgres), three read surfaces
(website, mini-app, in-chat), one writer (the v2 `runPipeline` sweep).

## The problem being closed

Two catalogs exist: **v1 DynamoDB** (written by the sweep when `PIPELINE_V2=off`; read by the bot
processor's in-chat commands and the read-api / MINI App) and **v2 Postgres** (written by
`runPipeline` when on; read by the website). Flipping the writer alone is a *hard cutover* (no
dual-write) and would strand the DynamoDB readers. This spec moves those readers to Postgres so the
flip is coherent.

## Decisions (resolved 2026-06-13)

- **A — `Property` ⇆ `listing` model mapping → `jsonb listing_crm` sidecar.** The bot `Property`
  (CRM-lead shape: `status`, `tags`, `source`, `originConversationKey`, full `chanote` OCR struct)
  carries fields the marketplace `listing` doesn't model. Store those bot-only fields in a `jsonb
  listing_crm` column on `listing` so the projection round-trips losslessly and the marketplace
  columns stay clean. A proper CRM model is deferred.
- **B — single-owner model.** A v2 `listing.owner_user_id` is the origin conversation's Postgres
  user (matches `runPipeline`'s `ensureOwner`). Cross-chat read fan-out still works via DynamoDB
  membership → owner-conversation lookup. No conv→property edge table.
- **C — no backfill (honors D2).** The 17 v1 listings are disposable; they are NOT migrated. v1 goes
  stale and is abandoned. (Founder confirmed v1 need not be maintained.)
- **D — the MINI App migrates NOW, not in Stage 5 (supersedes the earlier deferral).** Investigation
  showed the read-api needs **no adapter of its own**: it calls five `PropertyStore` methods
  (`getProperty`, `listConversationProperties`, `listPropertiesForUser`, `listPropertyEvents`,
  `addEvent`) — all already built for the processor's `PostgresPropertyStore` — plus one
  `ConversationStore` method (`listUserConversations`, stays DynamoDB). Repointing it is a
  **composite-wiring + `DATABASE_URL`** change (Path A below). The **Preact SPA stays byte-identical**
  (it speaks the shared DTO contract, produced purely from a bot `Property`). So Stage 5's React
  rebuild is decoupled: this cutover does the **data** migration; Stage 5 remains the optional **UI**
  rebuild, later and non-blocking.
- **E — OPEN (founder): v2-lite image/classify/OCR — ship in the launch or fast-follow?** See
  §"Image fidelity" + §Decision E. Recommendation: **ship it in the launch** (small + proven).

## Scope

**In:**
- `PostgresPropertyStore` — Postgres impl of the `PropertyStore` slice of the bot `CatalogRepository`
  (`packages/bot/src/core/ports/catalog.ts`), with the `Property ⇆ listing` projection (Decision A).
- New `listing_event` Postgres table (no v2 home today) + `findDueEvents`/`markEventNotified` so the
  reminder sweep and the mini-app booking flow (plan 17 R4) work on Postgres.
- Composite catalog wiring for the **processor**, **reminder**, and **read-api** Lambdas:
  `{ ...dynamoConversationStore, ...postgresPropertyStore }`; give all three `DATABASE_URL` + the RDS
  pool (`packages/db/src/pool.ts`, CA path already works). No handler signatures change.
- **Path A mini-app**: one `buildDeps()` line in `packages/bot/src/lambda/read-api.ts` (swap the
  catalog source) — SPA, Function URL, CORS, DTOs all unchanged.
- The `PIPELINE_V2=on` flip + retirement of the v1 catalog **write** paths (the table is abandoned).
- **(Decision E, recommended in-scope)** wire image derivatives + classify + chanote OCR into the v2
  sweep port (sharp-on-Lambda mechanics proven — `spikes/sharp-lambda-packaging/FINDINGS.md`).
- Layer-1 hardening (§Hardening) — boot-time asserts, real-RDS gate, observability.

**Out:**
- Stage 5's **React UI rebuild** of the mini-app (separate, later — the *data* migration is here).
- Marketplace lifecycle UX, claim/publish, exclusivity, groups (Stages 5/6).
- `ConversationStore` (tracker/debounce/claim/watermark, edit context, membership, memory) — stays
  DynamoDB per the spine audit / D1, unchanged.
- Backfilling v1 → v2 (Decision C).

## Design

**Port split.** `CatalogRepository = ConversationStore & PropertyStore`. ConversationStore stays
DynamoDB; PropertyStore becomes `PostgresPropertyStore`. Every catalog consumer (processor, reminder,
read-api) gets a composite of the two — no handler changes (they already depend on the merged port).

**PropertyStore → Postgres (the moved methods):** `upsertProperty`, `getProperty`, `deleteProperty`,
`linkConversationProperty`/`unlinkConversationProperty`/`listConversationProperties` (owner-by-
conversation, Decision B), `listPropertiesForUser` (hybrid: DynamoDB membership → conversation keys
→ Postgres users `(line,key)` → `listing WHERE owner_user_id = ANY(...)`), and the event methods
(`addEvent`, `listPropertyEvents`, `deletePropertyEvents`, `findDueEvents`, `markEventNotified`).

**Mini-app Path A (why the SPA is untouched):** the read-api builds its response DTOs purely from a
bot `Property` via `toListDto`/`toDetailDto`; the SPA consumes only that DTO contract. As long as
`PostgresPropertyStore` returns a well-formed `Property` (the Decision-A sidecar makes the projection
lossless, incl. `photos` from `listing_media` s3Keys, presigned at read time — derivative-agnostic),
the DTO bytes are identical and the Preact SPA needs zero changes.

## Schema gaps (additive migrations)

1. **`listing_event`**: `id`, `listing_id` (FK), `due_at timestamptz`, `title text`,
   `notify_conversation_key text`, `notified_at timestamptz`, `created_at timestamptz`. **Partial
   index** `WHERE notified_at IS NULL` (the v2 analogue of the sparse GSI2). Migration hand-fix rules
   per `packages/db/CLAUDE.md`.
2. **`ON DELETE CASCADE`** on the `listing_*` child FKs (none cascade today) so delete/merge is one
   statement.
3. **`jsonb listing_crm`** column on `listing` (Decision A).
4. Verify/add `listing(owner_user_id)` index for the per-conversation / per-user reads.

## Image fidelity (Decision E detail)

v2-lite (`pipelineV2Sweep.ts`) currently hard-codes every photo `kind:"property"` and skips the
vision pass, so vs v1 it drops: **image classification** (deed/floorplan images leak into galleries),
**chanote OCR** (no deed fields from images → FIELD-02/03 deed checks + deed-exact dedup can't fire
on image evidence). Note: **images still render** — both v1 and v2 store/serve original S3 keys; the
website shows only a photo-count badge, and the mini-app presign path is derivative-agnostic. So this
is a *data-quality* gap, not a rendering break. The pipeline core already has the classify+OCR path
built and **gated on a `vision` derivative being present** (`packages/pipeline/src/run.ts`); the
sharp-on-Lambda packaging is **proven** (`spikes/sharp-lambda-packaging/FINDINGS.md`). So closing the
gap is a **small, wire-only increment** (produce the derivative, populate `PipelinePhoto.vision`,
pass the 640px thumb) — not new step logic. **Recommendation (Decision E): include it in the launch**
so v2 is a true replacement for v1, not a downgrade. Defer only if a same-day soft launch is wanted.

## Increments (ordered; flip + reader-wiring ship in ONE deploy window)

1. **`listing_event` table + Postgres event store** (`@line-robot/db`) + the `listing_crm` and
   `ON DELETE CASCADE` migrations. Tested against Docker Postgres AND once against staging RDS
   (§Hardening). No behavior change yet.
2. **`PostgresPropertyStore`** with the `Property ⇆ listing` projection. Re-run the existing
   in-memory port **contract tests** against the Postgres impl; one pass against **staging RDS**.
3. **(Decision E, recommended)** image derivatives + classify + chanote OCR wired into the v2 sweep
   port (apply the sharp recipe scoped to `dist/sweep`).
4. **Composite wiring + infra**: processor, reminder, and read-api get the composite catalog +
   `DATABASE_URL` (fail-fast if absent — §Hardening). Path A's one read-api `buildDeps()` line.
5. **Flip + retire v1 writes**, in the **same deploy window** as #4: `pulumi config set pipelineV2
   on` + `pulumi up`; delete the v1 catalog write paths + `claudeExtractor.ts` + its 16-union test.
6. **Post-flip verification + observability live** (§Verification).

## Hardening (Layer-1 — addresses the deploy-fragility root cause)

- **Boot-time fail-fast**: processor, reminder, read-api must throw on missing `DATABASE_URL` (the
  sweep already does — `"PIPELINE_V2=on requires DATABASE_URL"`). No silent fallback to a broken
  state — this is the class that bit us twice (env-less SPA, SITE_URL placeholder).
- **Real-RDS gate, not just Docker/fakes**: the `PostgresPropertyStore` contract suite must run once
  against **staging RDS** before the flip (the TLS bug slipped through precisely because tests use
  fakes/Docker). We have the harness now.
- **Observability**: a CloudWatch alarm on the sweep error rate, and a one-command post-flip
  invariant check ("writer catalog == reader catalog; a v2 listing is visible in website + mini-app +
  in-chat"). The v1/v2 divergence was only caught by eyeballing — make it observable.

## Verification

- **Pre-flip (staging RDS)**: PropertyStore contract tests green on RDS; a live `runPipeline` sweep
  writes a listing and the processor + read-api read it back projected to `Property`; a follow-up
  round-trips through `listing_event` and the reminder due-query finds it. With Decision E: a deployed
  cold-start resize smoke (the one thing the sharp spike couldn't prove on an x86 host).
- **Post-flip**: send a test listing via LINE → v2 sweep writes Postgres → it appears on the
  **website**, in **My Listings** in the mini-app, and in the **in-chat** command → book a viewing →
  reminder fires. Then a controlled cleanup.

## Rollback (forward-only)

Per Decision C the founder is **not maintaining v1**, so rollback is forward-only: `pipelineV2=off`
exists as an emergency stop, but listings written to Postgres during the v2 window are NOT
back-migrated to DynamoDB (accepted — staging, low volume). To keep even the emergency stop coherent,
ship the reader-wiring (inc 4) and the flip (inc 5) in the **same deploy** so there's never a window
where the writer and readers point at different catalogs (no split-brain).

## Risk register

- **Split-brain**: never half-deploy inc 4/5 — same window. (Mitigated by sequencing.)
- **Connection budget (D-S1-4)**: processor (SQS-driven, can spike) + reminder + read-api become
  Postgres clients on top of website-ssr + sweep. Recheck concurrency × `pool.max` (=2) against
  t4g.micro's ~85 `max_connections` before the flip; size reserved concurrency / pool accordingly.
- **Data-quality regression if Decision E deferred**: no deed OCR / unfiltered galleries on new
  listings until the (small) increment lands. Recommend shipping E in the launch.
- **v1 abandonment is irreversible-ish** (Decision C): once writes stop and the window passes, v1
  data is stale; acceptable per the founder ruling.

## Founder manual actions (the only steps not automatable)

The permission classifier blocks unattended `pulumi up`, so the founder runs (or grants
`Bash(bash scripts/deploy-staging.sh)` via `/permissions`):
1. `npm run build` then the deploy `pulumi up` (provisions/updates Lambdas) — already done for the
   current stack; re-run after the cutover increments land.
2. The flip: `cd infra && pulumi config set pipelineV2 on && pulumi up` — in the same window as the
   reader-wiring deploy.
3. **No LINE console change** (channels, LIFF URLs, webhook, R3 consent all unchanged), **no
   rich-menu change** (the Catalog tab's LIFF URL is unchanged), **no IAM policy change** (VPC lookup
   already passes `defaultVpcId` as config). LINE.md needs no edits and is correctly gitignored.
