# 15 — Deferred: domain type-safety + naming + schema-shape cleanups

> **STATUS: TODO Later — deferred, do NOT start without an explicit decision.**
> Recorded 2026-06-08. These are higher-risk type/naming/schema-shape refactors that were
> **deliberately excluded** from the `cleanup-strategize` sprint (units 01–09) because several of
> them touch the **Anthropic strict-structured-output extraction schema**, whose ≤16-nullable/union
> hard limit has already caused one full extraction outage (plan 13). This is a "what / why / blast
> radius / risk / approach" document, not a build order. Pick it up only after the 9-unit sprint
> lands and only with a conscious decision to spend the schema-risk budget.

This document captures the type-safety + naming + schema-shape work that the code-quality audit
surfaced (`plans/cleanup/00-master-plan.md`, `plans/cleanup/09-epoch-design-debt.md`) but that we
**chose not to do now**. It is grounded in those reports' exact finding numbers and file paths so a
developer can execute it later without re-deriving the context.

---

## ⚠️ The one risk that dominates this whole plan: the 16-union extraction-schema limit

Our extraction uses Anthropic **strict structured output** (`messages.parse` + `output_config.format`
/ `zodOutputFormat`). That mode **caps a schema at 16 parameters with union types** — every
`.nullable()` / `.optional()` / `anyOf` node counts, **including nested-object fields**. Exceed it and
the API returns a **hard `400 invalid_request_error` on EVERY extraction call** ("Schemas contains
too many parameters with union types … limit: 16 parameters with unions").

- This already caused a **full extraction outage** once: plan 12 added 11 `.nullable()` fields →
  27 nullables → every sweep + edit call 400'd, **zero successful extractions for 24h** (fixed in
  plan 13 inc 1, `ea12c4f`, by switching text/array fields to required-with-sentinel). See
  `plans/13-chanote-ocr-and-image-pipeline.md` and `/home/user/src/line-robot/CLAUDE.md`.
- **It is NOT caught by our unit tests** — they use a *fake* extractor, so the real-API limit is only
  ever exercised in production. The only guard is a **schema-serialisation regression test**
  (`packages/bot/test/unit/claudeExtractor.test.ts`, `describe("ExtractionSchema — Anthropic
  16-union-parameter limit (REGRESSION GUARD)")`, ~line 114) that serialises the output schema with
  `z.toJSONSchema`, counts `anyOf`/`["…","null"]` nodes via `countUnionParams`, and asserts the count
  stays `≤ 16`. **It must stay green for every change in this plan that touches the schema.**
- Current spend is **~8 unions** — all numeric fields (`lat`, `long`, `askingPrice`, `rentPrice`,
  `bedrooms`, `bathrooms`, `usableAreaSqm`, `floors`), which have no clean sentinel. That leaves
  roughly **8 slots of headroom** — small, and any of the refactors below can eat it fast if done
  naively.

**Project rule (from CLAUDE.md, restated because it governs every schema change here):** prefer
required-with-sentinel over nullable (`""` for absent strings, `[]` for absent arrays — strict mode
already forces every key present); reserve `.nullable()` for numbers; and to add many fields, **group
them into a SINGLE nullable nested object (1 union for the group, inner fields required) rather than N
nullable scalars.**

---

## Why this is deferred / sequencing

These items are deferred **until after the `cleanup-strategize` sprint (units 01–09) lands**, for two
reasons:

1. **They depend on the sprint's consolidation existing first.** Several of these refactors are far
   cheaper once there is *one* edit point instead of two or three. In particular:
   - **Item 1 (Property nesting)** should follow **sprint unit 01** (the single
     `ExtractedProperty → PropertyUpsert` mapping in `core/handlers/propertyMapping.ts` +
     `core/domain/sentinel.ts`, master-plan **P1 #2**). Today the upsert mapping is duplicated across
     `app/ingestionSweep.ts` and `core/handlers/editReplyHandler.ts` (epoch debt D-F / "two diverging
     30-field upsert blocks"). Restructuring `Property` into value objects before that mapping is
     unified means editing the same block two or three times under union-limit risk. After unit 01,
     there is one mapper to change.
   - **Item 2 (`status` narrowing)** is cleaner once unit 01 centralises where status is written, and
     it composes with the **shared types package (sprint unit, master-plan P2 #13)** — a narrowed
     `Status` union is exactly the kind of type that should live in the shared package so the miniapp
     (`packages/miniapp/src/lib/predicates.ts`, `ui.tsx`, `api.ts`) consumes the same closed set.
   - **Item 3 (naming/typing)** partially overlaps the sprint's domain-naming units; do the renames
     after the sprint's file moves settle so you rename once against a stable tree.

2. **Risk concentration.** Items 1 and 2 directly touch the extraction Zod schema. Doing them during
   the sprint would mix schema-risk changes into a sprint that was explicitly scoped to *avoid* them.
   Keep them as a separate, consciously-decided follow-up so the schema risk is isolated and
   reviewable on its own.

**Suggested order when this is picked up:** Item 3 naming/typing pieces that DON'T touch the schema
first (they are low-risk warm-up and reduce churn), then Item 2 (`status`), then Item 1 (Property
nesting — the largest blast radius, save for last when the mapper is unified and you have a clear
union budget).

---

## Item 1 — Nest `Property`'s ~27 flat optionals into value objects

Master-plan reference: **P2 #16** (promote timestamps to required + write-only `PropertyUpsert`).
Epoch reference: **Epoch B legacy debt — "`Property` is a flat bag of 27+ optionals"**
(`plans/cleanup/09-epoch-design-debt.md`).

### What
Replace the flat `Property` interface (32 `readonly` fields in
`packages/bot/src/core/domain/catalog.ts`, lines ~55–106) with grouped value objects, e.g.
`PropertyLocation` (`normalizedAddress`, `rawAddresses`, `lat`, `long`, `district`, `subdistrict`,
`province`), `CommercialTerms` (`status`, `askingPrice`, `rentPrice`, `currency`, …), and
`PhysicalDetail` (`bedrooms`, `bathrooms`, `usableAreaSqm`, `landArea`, `floors`, `propertyType`, …).
The existing nested `chanote` group (added in plan 13) is the precedent to follow.

### Why it matters
Every field added across epochs C–H was appended as a top-level optional, so the read `Property` type
gives almost no structural guarantee, the `toProperty` mapper
(`packages/bot/src/adapters/dynamodb/catalogRepository.ts`, ~line 246) is now 28+ unchecked field
assignments with no exhaustiveness check, and the upsert blocks restate the whole shape. Grouping
makes related fields cohesive, gives the mapper a smaller surface, and (per epoch B) "would have cost
the same Zod budget as today's sentinels."

### Blast radius (concrete)
- `packages/bot/src/core/domain/catalog.ts` — `Property` interface + `PropertyUpsert` derived type
  (line ~107).
- `packages/bot/src/adapters/dynamodb/catalogRepository.ts` — `toProperty` mapper (~line 246) AND the
  upsert attribute writes; the ElectroDB item shape / attribute schema (`status: { type: "string" }`
  ~line 50 and siblings).
- The unified upsert mapper from sprint unit 01: `packages/bot/src/core/handlers/propertyMapping.ts`
  (and, if the sprint has not landed, the two current copies in `app/ingestionSweep.ts` +
  `core/handlers/editReplyHandler.ts`).
- **`packages/bot/src/adapters/anthropic/claudeExtractor.ts`** — `ExtractedPropertySchema` and the
  `SYSTEM_PROMPT` field descriptions (schema-risk surface — see Risks).
- `packages/bot/src/core/ports/extraction.ts` — `ExtractedProperty` interface (lines ~80–114) if the
  extraction DTO is nested to mirror the domain.
- View/DTO read sites: `core/handlers/views.ts`, `core/handlers/catalogDto.ts`,
  `core/handlers/catalogAssistant.ts`, and the miniapp (`packages/miniapp/src/*`) if the read DTO
  shape changes.

### Risks
- **DIRECTLY hits the 16-union limit.** If the extraction schema is nested to mirror the domain, every
  new nullable nested-object wrapper spends a union. With ~8 unions of headroom, careless nesting
  (e.g. three nullable group objects = 3 unions, plus any nullable scalars inside) can approach or
  blow the cap → **hard 400 on every extraction call**.
- The schema regression test (`claudeExtractor.test.ts`) must stay green; and remember it is the
  ONLY guard — unit tests with the fake extractor will pass even at 17 unions.
- DynamoDB stored items are flat today. Decide whether to nest the *stored* attributes (migration /
  blank-slate implications) or keep storage flat and nest only the in-memory domain type (mapper
  flattens/unflattens). The latter is lower-risk given the catalog has been wiped before (plan 13 inc
  6 "blank-slate wipe").

### Suggested approach
- **Do this AFTER sprint unit 01** so there is a single `extractedToBaseUpsert` mapper to update.
- For the extraction schema specifically: if you must group fields there, **use a SINGLE `.nullable()`
  nested object per group (1 union for the whole group, inner fields required-with-sentinel)** —
  exactly the chanote pattern — never N nullable scalars. Keep numeric leaves as the only `.nullable()`
  inside. Re-run the regression test and confirm the union count after every grouping.
- Prefer **nesting the domain type only**, keeping DynamoDB storage flat, with the mapper translating
  between them — this contains the blast radius to the type + mapper and avoids a data migration.
- Land alongside **P2 #16**: promote `createdAt`/`updatedAt`/`lastActivityAt` to **required** on the
  read `Property` (they are always present on a stored row) and keep them optional only on the
  write-only `PropertyUpsert` — see Item 3 for the typing split.

### Rough effort
Large — **1.5–2 days**, dominated by the schema/mapper/view fan-out and careful union-budget
verification.

---

## Item 2 — Narrow `status: string` to a closed union type

Master-plan reference: **P3 #28** (introduce narrow union types for closed-vocabulary fields).
Epoch reference: **Epoch B legacy debt — "`status` typed as bare `string`"**.

### What
Change `Property.status` from `readonly status?: string`
(`packages/bot/src/core/domain/catalog.ts` line ~69) to the documented closed lifecycle union. The
8-value vocabulary already exists in code as the keys of `STATUS_EMOJI`
(`packages/bot/src/core/handlers/views.ts`, ~line 107) and in the field's own doc comment:

```
lead → researching → visited → negotiating → offer → under-contract → closed → dropped
```

Define `export type PropertyStatus = "lead" | "researching" | "visited" | "negotiating" | "offer" |
"under-contract" | "closed" | "dropped"` and use it for the field.

### Why it matters
Today extraction can write any arbitrary string and it is stored and rendered unchecked
(`statusBadge` falls back to a `"•"` bullet for unknown values). A closed union gives compile-time
enforcement at every write site and makes the badge map exhaustive.

### Blast radius (concrete)
- `packages/bot/src/core/domain/catalog.ts` — the field type (+ likely `PropertyStatus` lives in the
  shared types package once P2 #13 lands).
- `packages/bot/src/core/handlers/views.ts` — `STATUS_EMOJI` (`Record<PropertyStatus, string>`),
  `statusBadge` (~line 120), card subtitle (~line 71).
- `packages/bot/src/core/handlers/catalogDto.ts` and `catalogAssistant.ts` — status read/render.
- `packages/bot/src/adapters/dynamodb/catalogRepository.ts` — `toProperty` (`status: item.status`,
  ~line 259); note the **separate** `ConversationTracker.status` ("IDLE"/"INGESTING"/"FAILED",
  ~lines 372–378) is a DIFFERENT field — do not conflate them.
- **`packages/bot/src/adapters/anthropic/claudeExtractor.ts`** — `ExtractedPropertySchema.status` and
  the prompt that tells the model which value to emit (schema-risk surface).
- `packages/bot/src/core/handlers/editReplyHandler.ts` and `app/ingestionSweep.ts` — status write
  paths (or the unified mapper after unit 01).
- Miniapp: `packages/miniapp/src/lib/predicates.ts`, `ui.tsx`, `api.ts` (status filter/display).

### Risks
- **Schema-risk surface.** If you encode the closed set as a Zod **enum**, it is NOT a union/nullable
  in the strict-output sense and should NOT add to the 16 count — but **verify with the regression
  test**, because the field stays required-with-`""`-sentinel today (`""` = absent). If you make it
  `z.enum([...]).nullable()` you spend a union; don't — keep `""` as the sentinel (an enum that
  includes `""` or a required enum, decided so the absent case stays a sentinel, not a nullable).
- The model can return values outside the closed set. Decide handling at the boundary: clamp/normalise
  unknown strings to a safe default in the mapper, or keep the schema as an enum so the API itself
  constrains output. Do not let a stray value crash the read path.

### Suggested approach
- Define `PropertyStatus` once (shared types package if P2 #13 has landed; otherwise
  `core/domain/catalog.ts`).
- Keep the extraction schema field as **required-with-`""`-sentinel**, expressed as a Zod enum over
  the 8 values plus the empty sentinel, so it **costs zero additional unions**. Run the regression
  test to confirm the count is unchanged.
- Make `STATUS_EMOJI` a `Record<PropertyStatus, string>` so adding/removing a status is a compile
  error if the map is not updated.

### Rough effort
Medium — **0.5 day** (the vocabulary already exists; the work is threading the type and the boundary
normalisation).

---

## Item 3 — Domain naming + typing cleanups

Master-plan references: **P2 #14** (Geo rename + shared `GeoCoord`), **P2 #15** (move
`ConversationTracker`, add `IngestionStatus`), **P2 #16** (required timestamps + write-only
`PropertyUpsert`), **P2 #17** (`nowIso: string` → `nowMs: number`), **P3 #27** (`PropertyEvent` →
`FollowUp`). Epoch reference: **Theme E** in `00-master-plan.md`.

These are several small, mostly-mechanical changes. They are grouped because they share a theme
(domain naming/typing hygiene) and none individually warrants its own item. **Most do NOT touch the
extraction schema** — do those first as low-risk warm-up.

### 3a. Unify Geo field naming + shared `GeoCoord` (P2 #14)
- **What:** `GeoLocation` (`packages/bot/src/core/domain/message.ts`, lines 16–21) uses
  `latitude`/`longitude`; every other coordinate-bearing type uses `lat`/`long`
  (`ExtractionGeoHint` in `core/ports/extraction.ts` lines 42–45, `ExtractionCandidate`,
  `Property.lat/long`, `catalogDto.ts`, etc. — a 5:1 ratio). Rename `GeoLocation.latitude/longitude`
  → `lat/long` and collapse `ExtractionGeoHint` (and any `ParsedGeo`-shaped object) into a shared
  `GeoCoord = { lat: number; long: number }`.
- **Blast radius:** `core/domain/message.ts`, `adapters/line/webhookParser.ts` (lines ~40–41 map
  `content.latitude`/`longitude`), `core/ports/extraction.ts`, and any geo read site.
- **Risk:** low — no schema impact; pure rename. Mind the LINE SDK side: the webhook payload uses
  `latitude`/`longitude`, so the rename is on OUR domain type, with the adapter doing the mapping.

### 3b. Move `ConversationTracker` + named `IngestionStatus` (P2 #15)
- **What:** `ConversationTracker` (`core/domain/catalog.ts`, line ~131) is an
  ingestion-infrastructure concern living in the catalog domain file. Move it to a new
  `packages/bot/src/core/domain/ingestion.ts`, and extract its inline status union
  (`"IDLE" | "INGESTING" | "FAILED"`, line ~139) into a named
  `export type IngestionStatus = "IDLE" | "INGESTING" | "FAILED"`.
- **Blast radius:** `core/domain/catalog.ts`, the new `ingestion.ts`, `app/ingestionSweep.ts`,
  `adapters/dynamodb/catalogRepository.ts` (the tracker mapping ~lines 372–378), `core/ports/catalog.ts`.
- **Risk:** low — no schema impact; import-path churn only. **Note:** this `IngestionStatus` is
  unrelated to Item 2's `PropertyStatus`; keep them distinct.

### 3c. `nowIso: string` → `nowMs: number` (P2 #17)
- **What:** `findPendingConversations` and `findDueEvents`
  (`packages/bot/src/core/ports/catalog.ts`, lines ~26 and ~133) take `nowIso: string`, while every
  other time param in the same interface is epoch-ms (`nowMs: number`, e.g. lines ~38, ~108, ~140).
  Change both to `nowMs: number` and move the `toISOString()` conversion into the DynamoDB adapter.
- **Blast radius:** `core/ports/catalog.ts`, `adapters/dynamodb/catalogRepository.ts` (the two query
  implementations + their GSI sort-key formatting), and the callers in `app/ingestionSweep.ts` /
  the reminder sweep that currently pass an ISO string.
- **Risk:** low — no schema impact. The two GSI queries (GSI1 `PENDING`, GSI2 `DUE`) format a sort
  key; ensure the adapter still produces the same comparable string after moving the conversion
  inward (the stored sort keys are ISO/lexicographic). Verify with the integration test against
  DynamoDB Local.

### 3d. Required timestamps + write-only `PropertyUpsert` (P2 #16)
- **What:** `createdAt`/`updatedAt`/`lastActivityAt` (`core/domain/catalog.ts`, lines ~100–102) are
  optional on `Property` but are always present on a stored row. Promote them to **required** on the
  read `Property`, and keep them optional only on the write-only `PropertyUpsert` (line ~107).
- **Blast radius:** `core/domain/catalog.ts`, `adapters/dynamodb/catalogRepository.ts` (`toProperty`
  must guarantee them), view/DTO read sites.
- **Risk:** low–medium — no schema impact, but composes with Item 1 (do them together when nesting
  `Property`). Confirm `toProperty` always populates the three before treating them as non-optional.

### 3e. `PropertyEvent` → `FollowUp` (P3 #27)
- **What:** Rename `PropertyEvent` (`core/domain/catalog.ts`, line ~116) to `FollowUp` (or
  `CalendarEvent`) to remove the cognitive collision with `InboundEvent` in the same domain area.
  Cascade to `addEvent`, `listPropertyEvents`, `findDueEvents`, `markEventNotified` in
  `core/ports/catalog.ts`.
- **Blast radius:** `core/domain/catalog.ts`, `core/ports/catalog.ts`, the DynamoDB adapter's event
  mapping, the reminder sweep, the postback handler that creates follow-ups (`setfollowup`).
- **Risk:** low — pure rename; no schema impact. Largest churn of the 3x items but mechanical.

### Rough effort (Item 3 total)
Small–medium — **0.5–1 day** for all five sub-items combined (3a/3b/3c/3e are quick renames/moves;
3d is best folded into Item 1).

---

## Risk register

| Risk | Affected items | Severity | Mitigation |
|---|---|---|---|
| **Exceeding the Anthropic 16-nullable/union schema limit** → hard `400` on EVERY extraction call (full outage, as in plan 12 → 27 nullables) | Item 1 (Property nesting in `ExtractedPropertySchema`); Item 2 if `status` made nullable | **Critical** | Group fields into ONE `.nullable()` nested object per group (1 union, inner fields required-with-sentinel); use `""`/`[]` sentinels not `.nullable()`; encode `status` as a Zod **enum** (not nullable). Keep the regression test green; check the union count after every schema edit. Headroom today is ~8 unions (current spend ~8 numeric). |
| **Schema change not caught by unit tests** — tests use a *fake* extractor, so a too-many-unions schema only fails against the **real API in production** | Items 1, 2 (any `claudeExtractor.ts` schema edit) | **High** | The `claudeExtractor.test.ts` serialisation regression test (`countUnionParams` ≤16) is the ONLY automated guard — it MUST stay green. After any schema change, deploy and watch the first live sweep for a successful extraction (no 400) before considering it done. |
| DynamoDB stored-item shape diverges from a newly-nested domain type (migration) | Item 1 | Medium | Nest the **domain type only**; keep DynamoDB storage flat with the mapper translating; or rely on the existing blank-slate posture (catalog was wiped in plan 13 inc 6). No live data migration. |
| Model emits a status outside the closed set | Item 2 | Medium | Constrain via Zod enum at the boundary and/or normalise unknown values to a safe default in the mapper; never let a stray value crash the read path. |
| GSI sort-key formatting changes when moving `toISOString()` into the adapter | Item 3c | Medium | Keep the adapter producing the same lexicographically-comparable ISO key; cover with the DynamoDB-Local integration test before/after. |
| Rename/move churn breaks imports across bot + miniapp | Items 1, 2, 3a–3e | Low | Do renames after the sprint's file moves settle; rely on `tsc` + the full unit/integration suite; share narrowed types via the P2 #13 shared package so the miniapp can't drift. |
| Doing Item 1 before the upsert mapping is unified → editing the same block 2–3× under union-limit risk | Item 1 | Medium | Sequence Item 1 strictly after sprint unit 01 (`propertyMapping.ts` + `sentinel.ts`, P1 #2). |

---

## Done-when (acceptance checklist)

- [ ] **Prerequisite:** `cleanup-strategize` sprint units 01–09 have landed; in particular unit 01
      (single `extractedToBaseUpsert` mapping) exists, and ideally the P2 #13 shared types package.
- [ ] **Item 1:** `Property` (and `PropertyUpsert`) use grouped value objects; `toProperty` and the
      unified upsert mapper compile against the new shape; the extraction schema (if nested) uses
      one `.nullable()` object per group.
- [ ] **Item 2:** `Property.status` is the closed `PropertyStatus` union; `STATUS_EMOJI` is a
      `Record<PropertyStatus, string>`; the extraction schema constrains status to the closed set via
      a Zod enum (no added union); miniapp status code consumes the same type.
- [ ] **Item 3:** `GeoLocation` uses `lat`/`long` with a shared `GeoCoord`; `ConversationTracker` +
      `IngestionStatus` live in `core/domain/ingestion.ts`; `findPendingConversations`/`findDueEvents`
      take `nowMs: number`; read-`Property` timestamps are required with a write-only `PropertyUpsert`;
      `PropertyEvent` renamed to `FollowUp` with cascaded port/handler renames.
- [ ] **Schema guard green:** `claudeExtractor.test.ts` 16-union regression test passes; the printed
      union count is recorded and is ≤ 16 (and the assertion that numeric nullables ≥ 8 still holds).
- [ ] `npm run test`, `npm --prefix packages/bot run test:integration`, `npm run lint`,
      `npm run typecheck` all pass.
- [ ] **Live verification after any extraction-schema change:** deploy code-only (`pulumi up`) and
      confirm the next ingestion sweep extracts at least one property with **no 400** before marking
      the schema-touching items done.
