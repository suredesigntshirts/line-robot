# Implementation Queue — cleanup sprint

Reconciliation of the nine independently-written change-unit specs in this folder
(`01`–`09`) into one ordered, conflict-free plan. Built by a read-only analysis pass over all nine
artifacts plus the live source (baseline `npm run typecheck` is **green**). Each artifact was edited
in place to add a "Reconcile-pass note (queue 00)" header and to unify the few cross-unit decisions;
every artifact remains a complete standalone spec.

A single Sonnet agent should implement the units **one at a time, in the order below**, running
`npm run typecheck && npm run lint && npm run test` after each unit (plus
`npm --prefix packages/bot run test:integration` after unit 06, which is the only persistence change).

---

## Ordered sequence

1. **06 — messageRepo casing:"none" (GROUP-ID data integrity).** No shared files with any other unit
   (`messageRepository.ts` + two integration tests only). Deploy-urgent: the longer it waits, the more
   likely a pre-existing group row turns the trivially-safe fix into a migration. **Hard deps:** none.
   Gate: run the pre-deploy DynamoDB scan before `pulumi up`.

2. **01 — sentinel helpers + `extractedToBaseUpsert` mapping.** Foundational: creates the canonical
   `core/domain/sentinel.ts` home and the single property-mapping function. Must precede unit 05
   (both edit `ingestionSweep.ts`). Pure refactor, behaviour-identical. **Hard deps:** none.

3. **08 — Lambda cold-start unification (`lazySingleton` + `SYSTEM_CLOCK`) + read-api env schema.**
   Independent, purely structural. Sequenced **before unit 02** so 02's `toHttpRequest`/handler-signature
   edits rebase onto the unified cold-start skeleton. Includes the coordinated `infra/index.ts`
   read-api scoped-env change (ship code + infra together). **Hard deps:** none.

4. **02 — hexagonal port boundaries (WebhookParser / SignatureVerifier / HttpRequest+Response) +
   `parseRawEvent` validation.** Removes the 3 app→adapter violations and defines the new ports.
   **Hard prerequisite for unit 07.** Land after 08 (shares the lambda entry points). Includes the
   one named bug fix (`parseRawEvent` blind cast → Zod-validated). **Hard deps:** none (but precedes 07).

5. **05 — decompose `ingestionSweep.ts` + two-pass `memory` bug fix.** Splits the 848-line file
   (media pipeline → `app/ingestionMedia.ts`, `mapWithConcurrency` → `core/utils/concurrency.ts`,
   `buildConfirmation` → `core/handlers/views.ts`) and fixes the pass-2 `memory` omission.
   **Must follow unit 01** (sentinel helpers already extracted; `applyProperty` already collapsed).
   **Hard deps:** 01 (sequential, same file).

6. **04 — `packages/shared` for cross-package DTOs / tz constants; kill the miniapp type mirror.**
   New source-only workspace package; both `bot` and `miniapp` import it. Sequenced **before unit 03**
   because both edit `catalogDto.ts` / `core/domain/catalog.ts` (disjoint regions; 04 first keeps 03's
   hunks clean). Requires `npm install` after scaffolding, before editing consumers. **Hard deps:** none.

7. **09 — consistent handler-boundary error logging (log-then-return at the 3 presign sites).** Adds
   `logger?` to `CatalogAssistant`/`HandlerDeps` and threads `logger` through `readApiHandler`'s
   `presign*`. Sequenced **after 02** (different region of `readApiHandler.ts`) and **before 03** (which
   later swaps the photo helpers those `presign*` call and must preserve the new `warn` lines).
   **Hard deps:** none (ordering preference only).

8. **03 — shared catalog domain helpers (photo ordering, search haystack, activity sort).** Extracts
   `core/domain/photos.ts` + three `catalog.ts` query helpers; de-dupes chat vs read-API. Lands **after
   04** (catalogDto/catalog.ts) and **after 09** (catalogAssistant/readApiHandler photo regions).
   **D1 RESOLVED — Option A locked in (user-confirmed 2026-06-08): ship only the three fork-free
   extractions; `collectUpcomingRows` is deferred to a future change-unit.** **Hard deps:** none (ordering only).

9. **07 — split the CatalogRepository god-port into six focused stores.** Pure type refactor: six
   interfaces + intersection alias in the existing `core/ports/catalog.ts`; narrow each injection site.
   Sequenced **last** so its one-line import/field narrowings in `eventProcessor.ts`,
   `ingestionSweep.ts`, `readApiHandler.ts`, `catalogAssistant.ts`, `editReplyHandler.ts` rebase onto
   the final import blocks left by 02/03/04/05/09. **Hard deps: 02 (must land first).**

---

## Dependency graph

```
06  (independent, deploy-urgent) ───────────────────────────────────────────── standalone

01 (sentinel home) ──► 05 (ingestionSweep decomp)        [hard: same file, 01 first]

08 (lambda skeleton) ──► 02 (port boundaries) ──► 07 (port split)
                                 │                   ▲
                                 │   hard dep ───────┘  (02 defines ports 07 consumes)
                                 │
                                 └─ shares readApiHandler seam with 03/04/09 (region-disjoint)

04 (shared pkg) ──► 03 (domain helpers)                  [soft: catalogDto/catalog.ts, 04 first]
09 (logger boundary) ──► 03 (domain helpers)             [soft: catalogAssistant/readApiHandler photo regions, 09 first]

readApiHandler.ts recommended textual order:  02 ──► 04 ──► 09 ──► 03 ──► 07
ingestionSweep.ts  recommended textual order:  01 ──► 05 ──► 07
```

Hard edges (must hold):
- **01 → 05** (both rewrite `ingestionSweep.ts` import block + `applyProperty`; 01 owns the sentinels).
- **02 → 07** (07 hard-depends on 02 per its own spec; 02's boundary fixes narrow the injection points).

Strong-preference edges (avoid merge pain; not correctness-critical):
- **08 → 02** (lambda cold-start skeleton before the transport-seam rewrite).
- **04 → 03** (`catalogDto.ts` / `catalog.ts` DTO move before the helper extraction).
- **09 → 03** (presign `catch`/`logger` plumbing before the photo-helper relocation).
- **02/03/04/05/09 → 07** (07's type-only narrowings rebase onto everyone else's final import blocks).

Fully independent (could be parallelised in principle, but the queue runs serial): **06**, and **08**
(other than the 08→02 preference).

---

## Conflicts auto-resolved (artifacts edited to agree)

1. **Port-file layout fork (07 ⊗ 02) — RESOLVED to "single `core/ports/catalog.ts`" (Option A).**
   Unit 07's only `needs-decision` was whether to keep one catalog port file or split into a
   `core/ports/catalog/` directory with a barrel — a choice it deferred to unit 02. Verified against
   source: ports are **flat files today, no barrels**, and unit 02 adds three *new flat* port files
   (`webhookParser.ts`, `signatureVerifier.ts`, `httpGateway.ts`) — it does **not** introduce a
   directory. So Option A stands. **Edited:** `07-*.md` (Open Question 1 marked RESOLVED + a top
   reconcile note; status moves from blocked-on-layout to "ready, gated on 02"); `02-*.md` (top note
   confirms flat files and the 02→07 dependency).

2. **Sentinel helpers' ownership + land order (01 ⊗ 05) — RESOLVED to "01 first; 05 does not touch
   them".** Both units edit `ingestionSweep.ts`. Unit 05's draft said "leave the sentinel helpers
   here (owned by P1 #2)", but after unit 01 lands those helpers are **deleted and replaced by imports
   from `core/domain/sentinel.ts`** — so the "leave them here" instruction was stale. **Edited:**
   `01-*.md` (top note: 01 is first, 05 follows, sequential not parallel); `05-*.md` (top note + the
   "Stays in place" paragraph + the Dependencies section all rewritten to "01 first; leave 01's
   *imports* alone, do not re-add local copies; `applyProperty`'s upsert is already collapsed").

3. **`readApiHandler.ts` return-type drift (03 ⊗ 02).** Unit 03's "after-code" showed
   `handleMyProperties` returning the pre-02 `APIGatewayProxyResultV2`, which contradicts unit 02's
   retype to `Promise<HttpResponse>`. **Edited:** `03-*.md` added a rebase note — this unit changes
   only the body (`.sort(byActivityDesc)`) and the photo-helper imports, never the return type; keep
   whatever seam type unit 02 left in place.

4. **`catalogDto.ts` / `catalog.ts` shared edits (04 ⊗ 03) — land order pinned 04 → 03.** Unit 04 moves
   the DTO *interfaces* to `@line-robot/shared` and keeps the file-private `searchText`; unit 03 then
   deletes `searchText` (→ domain `searchableText`) and appends three helpers to `catalog.ts`. Disjoint
   hunks, but order matters for clean rebasing. **Edited:** `04-*.md` and `03-*.md` top notes both pin
   **04 before 03** and describe the disjoint regions; 03 keeps its existing (correct) decision to
   **leave `catalogDto.ts` L108 `updatedAt` unchanged** (avoids the `updatedAt: 0` leak — see that
   unit's Open Question 2, which is settled, not a fork).

5. **`catalogAssistant.ts` + `readApiHandler.ts` photo `catch` regions (09 ⊗ 03) — land order pinned
   09 → 03.** Unit 09 adds `logger?.warn(...)` into the `heroUrls`/`presignPhotos` catch bodies and
   threads `logger` through `presign*`; unit 03 relocates the `orderedPhotos`/`heroPhotoKey` helpers
   those sites call. **Edited:** `09-*.md` and `03-*.md` top notes pin **09 before 03** and state that
   03 must **preserve** the `warn`/`logger` plumbing when it swaps the helper imports. (Both artifacts
   already anticipated this; the notes make the order non-optional.)

6. **`readApiHandler.ts` five-way overlap (02/03/04/07/09) — region map + textual order pinned.** The
   file is touched by five units in **different regions**: 02 = request/response seam
   (`json`/`bearerToken`/`handle*`); 04 = inline `rows` → shared `UpcomingItem`; 09 = `logger` on
   `presign*`; 03 = delete duplicate photo helpers + swap recency comparator; 07 = narrow
   `ReadApiDeps.catalog` type (one import + one field + one `Pick`). **Edited:** notes in 02/03/04/07/09
   converge on the order **02 → 04 → 09 → 03 → 07**, each rebasing its import block onto the prior.

7. **`processor.ts` three-way overlap (02/08/09) — confirmed region-disjoint.** 08 = cold-start wrapper
   + `SYSTEM_CLOCK` import; 02 = `parser: new LineWebhookParser()` in the EventProcessor deps; 09 =
   `logger` key in the two handler-factory literals. **Edited:** 08's and 09's top notes (and 02's
   existing note) record the disjoint regions and the 08→02 preference. No code-level conflict.

8. **No competing new modules.** Verified there are no two units proposing the same new file/helper
   with different names or signatures. The new homes are unique and non-overlapping:
   `core/domain/sentinel.ts` (01), `core/handlers/propertyMapping.ts` (01),
   `core/ports/{webhookParser,signatureVerifier,httpGateway}.ts` (02), `core/domain/photos.ts` (03),
   `packages/shared/*` (04), `core/utils/concurrency.ts` + `app/ingestionMedia.ts` (05),
   `lib/{clock,lazySingleton}.ts` (08). `buildConfirmation`/`AppliedProperty`/`MergeTarget` (05) and
   the `byActivityDesc`/`searchableText`/`activityTimestamp` helpers (03) each have exactly one
   producing unit.

---

## ✅ Decisions — all resolved

### D1 — `collectUpcomingRows` placement (unit 03) — ✅ RESOLVED: Option A (user-confirmed 2026-06-08)

> **Decision locked in: Option A — defer `collectUpcomingRows` entirely.** Unit 03 ships only the three
> fork-free extractions (photos / sort / search) and does **not** cover master-plan P1 #3. The upcoming
> fan-out stays duplicated for now and is tracked as a separate future change-unit, to be specced and
> sequenced after the boundary work (02/07) settles whether `app/` may legally share a `core/handlers`
> helper. Unit 03 is therefore **ready to implement**. The full fork analysis is retained below for the
> record.

**The fork.** The duplicated "upcoming follow-ups" fan-out exists in two layers
(`catalogAssistant.upcoming` vs `readApiHandler.handleUpcoming`). Extracting it to a shared
`collectUpcomingRows(catalog, userId): Promise<UpcomingFollowUp[]>` is master-plan P1 #3, but it
**cannot** land in `core/domain` cleanly: the helper needs `CatalogRepository` (a `core/ports` type)
and `propertyTitle` + `UpcomingFollowUp` (both in `core/handlers/views.ts`), and **no `core/domain`
file imports `core/ports` or `core/handlers` today** (verified). So it forces an architectural choice:

- **Option A — defer entirely (unit 03's recommendation, and the reconcile pass's).** Ship the three
  fork-free extractions (photos / sort / search) now; leave the upcoming fan-out duplicated; track
  `collectUpcomingRows` as its own future change-unit, sequenced after the boundary work (02/07)
  settles whether `app/` may legally share a `core/handlers` helper. Lowest risk; keeps unit 03 purely
  additive to `core/domain` with zero new cross-layer dependency.
- **Option B — extract to a new `core/handlers/upcoming.ts`.** `catalogAssistant` imports it directly;
  but `readApiHandler` (in `app/`) importing a `core/handlers` helper is itself the boundary smell that
  unit 02/master-plan Theme B is trying to remove — trades duplication for a layering import a later
  unit must unwind.
- **Option C — hoist `UpcomingFollowUp` + `propertyTitle` to `core/domain` and add a domain→ports
  exception, then put `collectUpcomingRows` in domain.** Largest blast radius; establishes a new
  domain-imports-ports precedent; out of scope for a single mechanical unit.

**Recommendation was Option A (defer) — now CONFIRMED by the user (2026-06-08).** Unit 03 implements the
three extractions only and does **not** cover master-plan P1 #3. `collectUpcomingRows` becomes a new,
separately specced unit appended after 07 when the boundary work settles.

> No other genuine design forks were found. Every remaining cross-unit interaction is mechanical and
> has been auto-resolved above. The other previously-`needs-decision` item — unit 07's port-file
> layout — was resolvable from the source (flat files, no barrel) and is now closed (auto-resolved #1).

---

## Ready-to-implement checklist

| Unit | Title | Status | Blocker / gating note |
|---|---|---|---|
| **06** | messageRepo `casing:"none"` | ✅ ready | None. Run the pre-deploy DynamoDB scan gate; integration test needs docker. |
| **01** | sentinel + property mapping | ✅ ready | None. Land before 05. |
| **08** | lambda cold-start + read-api env | ✅ ready | None. Ship code + `infra/index.ts` read-api env together. Land before 02. |
| **02** | hexagonal port boundaries | ✅ ready | None. Land after 08; is the hard prerequisite for 07. |
| **05** | ingestionSweep decomp + memory fix | ✅ ready | Land **after 01** (hard, same file). |
| **04** | `packages/shared` DTOs/tz | ✅ ready | None. `npm install` after scaffolding, before editing consumers. Land before 03. |
| **09** | error-logging boundary | ✅ ready | None. Land after 02, before 03. |
| **03** | shared catalog domain helpers | ✅ ready | **D1 resolved — Option A (defer `collectUpcomingRows`).** Implement the three core extractions (photos/sort/search) only; do not cover P1 #3. Land after 04 + 09. |
| **07** | split CatalogRepository port | ✅ ready | Layout fork resolved (Option A). Hard dep: **02 must land first.** Land last (after 02/03/04/05/09 so type-only narrowings rebase cleanly). |

**Net:** all 9 units are ready to implement in the order above — **D1 is resolved (Option A: defer
`collectUpcomingRows`), so unit 03 is unblocked.** No unit risks the Anthropic ≤16-union
extraction-schema limit — verified per artifact (none touch `claudeExtractor.ts`'s
`output_config.format` Zod schemas; the union-count regression test stays green throughout).
