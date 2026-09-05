# Plan 23 — Group D: 1:1 DM vs Group — unify the model ("DM = group of one") — Research + Plan (RPI)
> Status: R+P COMPLETE · Source: plans/23-ingestion-pipeline-audit.md (Group D) · Phase: Research+Plan ONLY (no implementation)

## 1. Problem & scope

The 2026-06-15 incident was a **1:1 DM dump** (`user#U810f7671d201fe7ce3ec2ef49ab8d16a`, 76 messages
→ 5 listings, 1 survivor `4b194544`). That makes DM-handling load-bearing: "people will just dump a
bunch of listings to the line bot" is the primary ingestion path (founder §0). Founder item 6 frames
this as an **exploration**, not a decided build: *"Ideally we mostly keep a similar pipeline for both
DMs and groups… If we made DMs a 'user of 1 group' could we expand this. For now, just explore this
path and explain the differences."*

Scope (Group D): explore unifying the DM and group models; verify/refute the audit's divergence map;
map the branch points a "DM = group of one" change would touch; survey best practice; offer options;
recommend a direction; write an (unexecuted) implementation plan. **No code/schema/infra/config edits
in this phase** — the sole artifact is this file.

Two things must be kept separate throughout:
- What the **incident REQUIRES**: the DM dump's surviving listing (and future DM dumps) must be
  **claimable / usable by the human who sent it**. Today it is NOT (proven below).
- What full **unification ADDS**: collapsing the DM/group special-casing into one code path, making
  DM listings first-class for claim + (a dormant-today) exclusivity. This is optional polish, not the
  fix the incident demands.

Cross-group note: **E10 (write idempotency keys)** surfaces where the claim/sweep path can re-run;
flagged in §7, not designed here. Group A (dedup) is the reason only 1 of 5 survived — out of scope.

---

## 2. Research findings

### 2.1 Root cause(s) / current state — with evidence (file:line)

**The pipeline is identical for DM and group; the ONLY divergence is `source_group_id` (NULL for DM).**
CONFIRMED.

- The pipeline run is the same code regardless of conversation kind — `createPipelineV2Port.run`
  (`packages/bot/src/app/pipelineV2Sweep.ts:168-273`) calls the same `runPipeline(...)`
  (line 242-249) for both; the only kind-dependent value threaded in is `sourceGroupId`
  (line 245), computed by `populateGroupMembership` (line 236-241).
- `populateGroupMembership` (`pipelineV2Sweep.ts:141-166`) returns `undefined` for a `user#…` key
  (via `lineGroupIdFromKey`, line 147-148 + 127-132) → `sourceGroupId = undefined` → `runPipeline`
  writes `source_group_id = NULL` (`packages/pipeline/src/run.ts:136`, `input.sourceGroupId`).
- `owner_user_id` IS set for both — but it is a **conversation pseudo-user**, not the real human:
  `findOrCreateUserByIdentity(deps.db, "line", conversationKey, conversationKey)`
  (`pipelineV2Sweep.ts:227-232`) then `ownerUserId: owner.id` (`run.ts:135`). The subject is the
  FULL conversation key string (incl. the `user#` prefix), NOT the bare LINE user id.
- `claimed_by_user_id` is NULL until a real user claims via the API (`run.ts` never sets it;
  `claimListing` is the only writer, `packages/db/src/repositories/portal.ts:40-58`).

**STAGING GROUND TRUTH (read-only, never mutated).** Incident survivor row:
```
id            = 4b194544-d4a8-4c45-a229-83fea11d72e8
source_group_id    = NULL          ← DM-sourced, exactly as predicted
owner_user_id      = 220d5b48-…    ← set (the pseudo-user)
claimed_by_user_id = NULL          ← unclaimed
claim_invited_at   = NULL          ← no claim DM was ever sent (the DM-skip guard)
province           = เชียงใหม่
```
Catalog distribution: `source_group_id IS NULL` → **6 rows** (real DM-sourced); non-NULL → 24 (seed).
So a backfill of existing DM listings touches ~6 real rows.

**The pseudo-user/real-user split is sharper than the audit notes.** Two distinct pg users exist for
the same human:
- `220d5b48-…` identity subject `user#U810f7671d201fe7ce3ec2ef49ab8d16a` — the pseudo-`owner_user_id`.
- `4fc4264b-…` identity subject `U810f7671d201fe7ce3ec2ef49ab8d16a` (bare id) — what the **LIFF
  id-token resolves to** (the api's `resolveUser`, `packages/api/src/handler.ts:202-213`) and what
  `populateGroupMembership` would write as a member (`pipelineV2Sweep.ts:157` resolves the bare
  `senderUserId`). So even `owner_user_id` is NOT the claimant's real identity — relevant to any
  "owner can self-claim" idea (§3 Option 1).

**Each downstream consequence of NULL `source_group_id` — verified:**

| Consequence | Verified at | Verdict |
|---|---|---|
| Claim-invite DM **skipped** for DM | `pipelineV2Sweep.ts:303` (`sourceGroupId === undefined` → return; also test 497-513) | CONFIRMED (and incident row's `claim_invited_at` IS NULL) |
| `isGroupMember(null)` ⇒ false ⇒ no group-claim path | `portal.ts:160-165` (`if (groupId === null) return false`) | CONFIRMED |
| Claim gate 404 for a NULL-group listing | `handler.ts:331-334` (member check → `if (!member) return 404`) | CONFIRMED — **the DM dump is un-claimable by ANYONE today** |
| View/notes/viewings authz: DM listing visible only to its claimant | `handler.ts:220-233` (`authorizedListing`: claimant OR `isGroupMember(sourceGroupId,…)`); detail/notes/viewings call it (290-291, 468, 492, 507) | CONFIRMED — but since the DM listing is unclaimable, in practice it is visible to NO ONE in the mini-app today |
| Exclusivity/lapse INNER JOIN excludes NULL-group | `exclusivity.ts:133` (`.innerJoin(groups, eq(groups.id, listings.sourceGroupId))`) | CONFIRMED (a NULL FK drops from an inner join) |
| Per-group window config N/A for DM → default 7 | `groups.ts:62-72` (`getExclusivityWindowDays` inner-joins groups; undefined → caller defaults 7) | CONFIRMED |
| Quick-quote dealflow INCLUDES DM listings (not group-gated) | `listings.ts:654-696` (`listQuickSaleUnpushed` filters `urgency`, `pushed_at`, `province` — **no source_group_id filter**) | CONFIRMED |
| Public website group-agnostic (publish-consent driven) | `listings.ts:247-250` (`publiclyVisible`) + `searchPublicListings` 290-316 (no group filter) | CONFIRMED |

**CORRECTION TO THE AUDIT (material).** The audit's "deepest issue" says *"exclusivity windows are
group-keyed and opened at ingest."* The **first half is true** (the lapse query inner-joins groups),
but **the second half is false in production**: `openExclusivityWindow`
(`exclusivity.ts:58-67`) has **NO production caller** — grep across `packages/` + `infra/` finds it
only in tests/seed. Staging confirms it: **`select count(*) from listing_exclusivity` = 0** (zero
rows, for DM AND group listings alike). The whole exclusivity/lapse machinery
(`listLapsedExclusivity` → `dealflowSweep.runLapsePrompts`, `dealflowSweep.ts:86-100`) is **dormant**:
it iterates an empty set. Consequence for Group D: the "DM listings never get exclusivity" gap is
**moot today** — *nothing* gets an exclusivity window. The lapse-DM target is in any case the
**claimant's** LINE id, not the owner (`exclusivity.ts:134-137` inner-joins `claimed_by_user_id`;
DM'd at `dealflowSweep.ts:106`), so a never-claimed DM listing would have no lapse target regardless.

Everything else the audit tabulates is accurate.

### 2.2 Verified code-path map (the 5 branch points + any missed)

The audit names 5 branch points a "DM = group of one" change would touch. Verified line numbers (the
audit was close; exact):

1. `lineGroupIdFromKey(conversationKey)` — `pipelineV2Sweep.ts:127-132` (audit said ~132 ✓). Returns
   `undefined` for `user#…`. The decision point for "is there a source group".
2. The `populateGroupMembership` call + its early `return undefined` — call at
   `pipelineV2Sweep.ts:236-241`; the `undefined` is produced inside at line **148** (audit said the
   call 236-241 ✓; the actual undefined is line 148).
3. `sendClaimInvites` guard — `pipelineV2Sweep.ts:303` (`sourceGroupId === undefined` → return)
   (audit ✓).
4. `isGroupMember` NULL check — `portal.ts:165` (`if (groupId === null) return false`) (audit ✓).
5. Exclusivity INNER JOIN — `exclusivity.ts:132-133` (audit said ~132-133 ✓).

**Branch points the audit MISSED (grep `sourceGroupId|source_group_id|isGroupMember`):**

6. **The claim authz gate itself** — `handler.ts:331-334` (`handleClaim`). This is a SEPARATE NULL
   path from `isGroupMember`'s own guard: even if `isGroupMember(null,…)` returned true, the gate's
   intent ("only a source-group member may claim") would need rethinking for a group-of-one. The
   audit folds this into "claim gate" but it is its own edit site.
7. **`getExclusivityWindowDays`** — `groups.ts:62-72`. A second inner-join-on-groups (besides
   `listLapsedExclusivity`) that excludes NULL-group listings. If DM listings ever get windows, this
   is a 6th DB edit site. (Dormant today.)
8. **`populateGroupMembership` writes memberships for SENDERS, but `owner_user_id` is the pseudo-user**
   (`pipelineV2Sweep.ts:151-158` vs 227-232). For a group, the real sender IS membered, so claim
   works. For "DM = group of one", the synthetic group must be membered by the **real DM peer's bare
   id** (`4fc4264b`-style), NOT the pseudo-`owner_user_id` (`220d5b48`-style) — otherwise the claim
   gate still 404s the human. This is the *non-obvious* correctness requirement, not captured in the
   audit's "auto-member the peer" one-liner.
9. **Seed already models the analog** — `packages/pipeline/src/seed/seed.ts:78-95`: every seed owner
   is membered into a group and that group is the listing's `source_group_id` (line 80-81, 95). The
   "owner is a member of their listing's source group" invariant the unification needs **already
   exists in seed** — useful as the shape to mirror.
10. **Public/CRM read paths are already group-agnostic or claimant-scoped** (`listMyListings`
    `portal.ts:134-145` scopes to `claimed_by_user_id`; saved/notes/viewings are per-caller). They
    need **no change** under either option — confirming the blast radius is the *claim-admission* edge,
    not the read surface.

**Characterizing the deepest issue (corrected).** It is NOT "exclusivity windows opened at ingest"
(none are). It is the **claim-admission identity gap**: a DM dump's owner is a pseudo-user, and there
is no membership edge for the real human, so `isGroupMember(NULL,…)` → 404 makes the dump unclaimable.
The minimum fix is *an admission path for the DM sender to their own DM listings*. A "group of one"
is one way to express that; a targeted NULL-group rule is another.

### 2.3 Data / replay evidence

- Incident survivor `4b194544`: `source_group_id = NULL`, `claimed_by_user_id = NULL`,
  `claim_invited_at = NULL` (queried read-only). → **un-claimable today** (gate 404s on NULL group).
- 6 real DM-sourced listings (NULL group) in staging; 24 grouped (all seed). Backfill scope ≈ 6 rows.
- `listing_exclusivity` row count = **0** → exclusivity is dormant for everything (the audit's
  ingest-opens-windows premise is empirically false).
- Two pg users for the incident human: pseudo (`user#U810…` subject) and real (`U810…` subject). The
  claim gate keys on the **real** one (LIFF id-token).
- 3 seed groups all have `line_group_id = NULL` (seed didn't set it) → the column is nullable and a
  synthetic group with NULL/synthetic `line_group_id` is schema-compatible.

(No paid LLM/API calls were made. No staging writes.)

### 2.4 Best-practice survey (with cited sources)

The question — *should a single entity be modeled as a degenerate case of a collection?* — is the
classic **Special Case / Null Object** family, and its inverse (collapse the special case INTO the
general path). Mapping the literature onto our schema:

- **Martin Fowler, "Introduce Special Case" / "Special Case" (PoEAA).** The win of collapsing
  special-casing is realized only when the special case shares *most* behavior with the general case,
  so the conditional checks become "simple calls." Applies here: DM and group already share the entire
  pipeline; the ONLY divergence is `source_group_id`. That is a strong signal a unified path could pay
  off — BUT Fowler also warns the Special Case object must be a *true* substitute (it must satisfy the
  same invariants). A synthetic group-of-one must satisfy the group invariants the rest of the code
  assumes (a real `groups` row, a membership edge for the human, a `line_group_id` that doesn't
  collide). Sources:
  [Introduce Special Case](https://refactoring.com/catalog/introduceSpecialCase.html),
  [Special Case (PoEAA)](https://martinfowler.com/eaaCatalog/specialCase.html).
- **Null Object as a special case of Special Case** (Fowler): replace a NULL with an object that
  answers uniformly. Our `source_group_id IS NULL` is exactly a sentinel; the group-of-one is the
  Null-Object move (give DM a real, if synthetic, group so `isGroupMember`/joins "just work"). Source:
  [Null Object refactoring](https://qualitycoding.org/refactor-null-object-pattern/).
- **Sentinel-NULL vs Null-Object trade-off** (general consensus across the refactoring literature,
  e.g. [Special Case pattern](https://codinghelmet.com/articles/reduce-cyclomatic-complexity-special-case)):
  NULL-as-sentinel is cheapest when the special case appears at **one or two** call sites and the
  branch is trivial; the Null-Object/degenerate-collection refactor pays off when the NULL check is
  **scattered and load-bearing** (and especially when forgetting it is a correctness/security bug).
  In our code the NULL-group check is *load-bearing for a security gate* (claim/authz) but appears at
  only **2 hot sites** (`isGroupMember` + the claim gate) plus 2 dormant join sites — i.e. squarely in
  the "could go either way" middle, which is why this is an exploration, not an obvious refactor.
- **Tenant-of-one / single-tenant-as-multi-tenant** (industry pattern, same shape): SaaS systems
  routinely model "personal workspace" as "a team with one member" so one authorization/sharing code
  path serves both, avoiding a parallel "no-team" branch that drifts and grows security holes. The
  caution every write-up repeats: the synthetic singleton must be created **eagerly and consistently**
  (at the entity's birth), or you trade a NULL check for a "missing synthetic parent" bug. For us:
  the synthetic group must be created in the SAME at-least-once-safe step that already does
  `findOrCreateGroupByLineGroupId` + `upsertMembership` — we already own that idempotent machinery
  (`groups.ts:28-57`), which lowers Option 2's cost.

**Net read of the literature:** our situation is the canonical "collapse special-casing" candidate
*structurally* (one divergent field, shared everything else), but the NULL check is currently
contained (2 hot sites) and the deepest behaviors it gates (exclusivity) are dormant — so the
anti-over-engineering rules ("no abstraction nobody needs yet", "smallest thing that works") pull
toward fixing the *specific* gap first and deferring full unification until a second forcing function
appears.

---

## 3. Solution options

### Option 1 — Keep DM special-cased; make a DM dump self-claimable by its sender (targeted NULL-group fix)
**Approach.** Leave `source_group_id` NULL for DMs. Add ONE admission path: a DM listing may be
claimed (and thereafter read/edited) **by the LINE user whose DM it came from**. Mechanically: when a
DM batch is swept, record the real DM peer as the listing's claim-eligible party. Cheapest concrete
shape: in the DM branch, set `claimed_by_user_id` is NOT auto-set (a claim must stay an explicit human
act), but admit the DM peer at the gate — e.g. stamp a `claim_invited_at` and DM the peer a
`/claim/{id}` deep link (the existing claim card), and teach the claim gate that "the DM peer of a
NULL-group listing may claim it." The DM-peer identity is available in the sweep (the bare
`senderUserId`); persist the eligible claimant (a nullable `dm_claimant_user_id` column, or reuse the
already-resolved real-user id). The gate becomes: member-of-source-group OR (`source_group_id IS NULL`
AND caller == the listing's DM-eligible user).

**Trade-offs.** Effort: **low–medium** (1 sweep edit, 1 gate edit, maybe 1 column + backfill of 6
rows). Risk/blast-radius: **low** — touches only the claim-admission edge; read/public/CRM paths
unchanged; no change to exclusivity/dealflow. Data-integrity: low (no synthetic rows). Who-can-see:
*tighter than groups* — a DM listing is private to its sender until published, which matches "I dumped
this to seed MY account." Alignment: strong with D7 (claim = explicit human act; publish = separate
consent) and with anti-over-engineering (no new abstraction; the special case stays a thin, named
rule). Why-not: keeps two code paths (the founder's instinct was to collapse them); doesn't make DM
listings eligible for exclusivity (but that's dormant anyway).

### Option 2 — Synthetic "group of one": auto-create a singleton group per DM user + auto-member them
**Approach.** In the DM branch, instead of `return undefined`, `findOrCreate` a synthetic group keyed
to the DM user (e.g. `line_group_id = "dm#<lineUserId>"` or NULL with a `kind='personal'` marker),
member the real DM peer into it, and thread its id as `sourceGroupId`. The existing group machinery
then "just works": `isGroupMember` admits the peer, the claim gate passes, exclusivity joins succeed,
per-group window applies. `lineGroupIdFromKey` and the `populateGroupMembership` early-return collapse
into the general path; `sendClaimInvites` no longer needs its NULL-group skip.

**Trade-offs.** Effort: **medium–high** (sweep edit + a "synthetic group" concept + a decision on the
`line_group_id` collision/uniqueness + backfill creating 6 synthetic groups & memberships + flipping
the two DM-no-group tests + new "group of one" tests). Risk/blast-radius: **medium–high** — it
**activates** behaviors that were dormant for DM listings (exclusivity windows would now join; quick-
quote already includes them; the group-of-one becomes a real `groups` row visible to any future
group-management surface). Data-integrity: a synthetic group must never collide with a real LINE
group id; `groups.line_group_id` is `.unique()` so a `dm#…` namespace is required, or NULL +
a discriminator. Who-can-see: a "group of one" has exactly one member, so it behaves like Option 1 at
the authz layer **today** — but if group management ever lets users add members, a personal group
could accidentally widen visibility (a footgun). Alignment: matches the founder's instinct and is the
clean "Null Object" refactor; but it adds a concept (synthetic group) that **nothing else needs yet**
— tension with rule 1 ("no interface/abstraction until the second implementation") and rule 4 ("no
config nobody sets"). Why-not now: the dormant exclusivity machinery means the "upside" (DM listings
get exclusivity) buys nothing today; we'd pay the abstraction cost up front for a benefit that
materializes only after exclusivity is actually opened at ingest.

### Option 3 — Thin abstraction at the real seam: an `OwnershipScope` resolved once, NULL handled inside
**Approach.** Don't fork at every call site and don't invent a synthetic group; introduce ONE small
domain function — `resolveClaimAdmission(listing, caller)` — that encapsulates "may this caller claim
/ read this listing", with the group path and the DM-peer path both expressed inside it. The sweep
keeps writing NULL group; the gate calls the one resolver. This is Option 1's behavior, packaged as a
single named seam so a future third case (e.g. room, or open-mandate) has one place to grow.

**Trade-offs.** Effort: **low–medium** (one new pure fn + wire two call sites). Risk: low. Alignment:
**borderline** with anti-over-engineering rule 1 ("no interface until the second implementation
exists") and rule 3 ("no one-caller abstractions") — there'd be ~2 callers (claim gate + detail
authz), so it's defensible, but it's an abstraction created in anticipation. Why-not: only worth it if
we believe a third admission case is imminent; otherwise it's Option 1 with extra ceremony.

### Option 4 — Do-nothing / defer (explicitly), document the gap
**Approach.** Accept that DM dumps are currently un-claimable in the mini-app; treat DM as a
write-only ingestion channel for now (listings exist, are dedup'd, can be published only via a future
admin path). Park unification behind a real forcing function.
**Trade-offs.** Effort: zero. Risk: the incident's actual failure (a human dumped listings to "seed
their account" and can't then USE them) remains — **this directly contradicts the founder's core
framing** that this is the standard path. Why-not: leaves the incident half-addressed. Acceptable ONLY
if Group A (data loss) is judged the sole must-fix and claimability is consciously deferred.

---

## 4. Recommended direction (+ rationale)

**Recommend Option 1 (targeted self-claimable DM fix) for the incident-required work, and treat full
unification (Option 2) as an explicitly-deferred exploration gated on a real forcing function.**

Rationale:
- **What the incident requires is narrow:** the DM dump must become claimable/usable by its sender.
  Option 1 delivers exactly that with the smallest, lowest-risk change, and keeps DM listings *more*
  private (sender-only until published), which matches "seed MY account."
- **The audit's headline upside for Option 2 (DM listings get exclusivity) is hollow today** —
  staging has zero `listing_exclusivity` rows and there is no production opener, so unification would
  pay an abstraction cost now for a benefit that can't fire until exclusivity-at-ingest is built
  (which is itself an unbuilt, separate decision).
- **Anti-over-engineering rules point to Option 1:** no synthetic-group concept "nobody else needs
  yet" (rule 1/4), no one-caller abstraction (rule 3), and the deliverable is code a developer reads
  without a guide (rule 5) — a single named "DM peer may claim their own NULL-group listing" rule is
  more legible than a phantom group that exists only to satisfy a join.
- **Option 2 stays the right end-state IF** (a) exclusivity-at-ingest gets built and we want DM
  listings to participate, OR (b) a second special case (rooms, open-mandate cross-group) appears and
  the NULL-group branches start multiplying. At that point the "collapse into one path" refactor earns
  its keep and Option 1's gate rule is a clean stepping-stone (it already isolates the admission
  decision). The founder framed item 6 as "explore + explain," and the honest answer is: *the model
  CAN be unified, the schema already supports it (nullable `line_group_id`, seed already models
  owner-as-member), but the payoff is deferred — so do the minimal claimable fix now and decide
  unification when exclusivity-at-ingest forces it.*

This is a legitimate "recommend further exploration + name the founder decision" outcome, per the
prompt — see §6.

---

## 5. Implementation plan (NOT executed — for a later phase)

For the **recommended Option 1**. Domain-enum-first per `packages/db/CLAUDE.md`; nothing here is run now.

**Steps & files (file:line):**
1. **Persist the DM-claim-eligible user.** Options, cheapest first:
   - (1a) No new column: at the gate, admit `caller == listing.owner_user_id`'s *real* identity. ✗
     Rejected — `owner_user_id` is the **pseudo-user** (subject `user#…`), not the LIFF-resolved real
     user; they are different pg rows (proven §2.3). The gate would never match.
   - (1b) **New nullable column `listing.dm_claimant_user_id`** (FK → `user.id`), set ONLY on the DM
     branch to the real DM peer's pg user (the bare-id identity). Add the column in
     `packages/db/src/schema.ts:219-300` (the `listing` table). Schema-change order: this column has
     no enum, so it is a plain `ALTER TABLE ADD COLUMN` — still go through `npm run generate -w
     @line-robot/db` and hand-fix per `packages/db/CLAUDE.md` (geography quoting if drizzle re-emits
     it; postgis extension already present). New migration `0011_*`.
2. **Set it in the DM branch of the sweep.** `pipelineV2Sweep.ts` — in `createPipelineV2Port.run`
   (~236-249), when `sourceGroupId === undefined` and there's exactly one real sender, resolve that
   sender to a pg user (the SAME `findOrCreateUserByIdentity(db, "line", <bareLineUserId>, …)` that
   `populateGroupMembership` uses, line 157) and pass it through to `runPipeline` so
   `persistNewListing` (`run.ts:99-173`) writes `dmClaimantUserId`. Add `dmClaimantUserId?: string` to
   `PipelineInput` (`run.ts:50-60`) and to `createListing`'s listing object (`run.ts:133-162`).
   (Keep `owner_user_id` as the pseudo-user — unchanged, per D7.)
3. **Send the claim invite for DM listings.** `sendClaimInvites` (`pipelineV2Sweep.ts:292-340`):
   relax the `sourceGroupId === undefined` early-return (line 303) so a DM listing with a resolved DM
   claimant + gateway + miniappUrl DOES get its one-shot claim DM (target = the DM peer, which for a
   DM IS `senderUserId(batch[0].ref)`). The `markClaimInvited` guard (line 315) already makes it
   one-shot; the claim card + deep link are unchanged.
4. **Admit the DM claimant at the gate.** Two call sites:
   - `handler.ts:331-334` (`handleClaim`): after the `isGroupMember` check fails, also admit when
     `detail.listing.sourceGroupId === null && detail.listing.dmClaimantUserId === userId`.
   - `handler.ts:220-233` (`authorizedListing`, used by detail/notes/viewings): same OR-clause so the
     DM claimant can read their listing pre-claim. Add `dmClaimantUserId` to `PortalListingDetail`'s
     `listing` (it rides on `typeof listings.$inferSelect` once the column exists — no DTO change
     beyond exposing it where needed). Keep `requireClaimant` (edit/publish) keyed on
     `claimedByUserId` (post-claim) — unchanged.
   - Update the `Repo` port shape if a new accessor is needed (likely none — `getPortalListingDetail`
     already returns the full listing row, `portal.ts:200-248`).
5. **Backfill the 6 existing NULL-group DM rows.** A one-shot data step (NOT a schema migration body):
   for each `source_group_id IS NULL` listing, set `dm_claimant_user_id` to the real (bare-id)
   identity derived from the pseudo-owner's subject (strip the `user#` prefix → look up the bare-id
   user). Document this as a maintenance script under the migration notes; it is idempotent.

**Tests + eval cases:**
- **Flip the DM-no-group behavior tests** (they encode the OLD contract):
  - `packages/bot/test/unit/pipelineV2Sweep.test.ts:375-383` — today asserts a DM touches no
    group/membership AND `sourceGroupId` undefined. KEEP the no-group part, but ADD: a DM resolves +
    threads the DM claimant id.
  - `pipelineV2Sweep.test.ts:497-513` — today asserts a DM listing gets NO claim DM. FLIP: a DM
    listing with a resolved claimant + gateway + miniappUrl now DOES get exactly one claim DM, to the
    DM peer.
- **New unit tests:**
  - `packages/api/test/unit/handler.test.ts` — a NULL-group listing: the DM claimant can claim
    (200) + read detail (200); a different user gets 404 (ids non-enumerable); after claim, the gate
    behaves as the normal claimant path.
  - `packages/db` repo test for `dmClaimantUserId` round-trip (create → read).
- **Real-backend round-trip** (`packages/miniapp/e2e-api/`): seed a NULL-group listing with a DM
  claimant, prove claim→publish/keep-private persists via re-fetch (the existing claim suite, extended
  with a DM-sourced fixture in `e2e-api/seed.mjs:159`).
- **Eval cases (Group C harness):** add ONE archetype to `packages/pipeline/src/eval/cases.ts` — a
  **1:1 DM dump** transcript (the incident shape) whose `ExpectedOutcome` is N distinct listings, each
  group-less but DM-claimable. (This also doubles as the Group A "N distinct, 0 merges" archetype the
  audit asked for — coordinate with Group A, do not duplicate.) Advisory only per D21.

**Migrations/backfill:** one new migration `0011_*` adding `listing.dm_claimant_user_id` (nullable FK).
Domain-enum-first is N/A (no enum); still run `npm run generate -w @line-robot/db` and hand-fix per
`packages/db/CLAUDE.md`. Apply to staging RDS via `npm run db:migrate -w @line-robot/db`. The 6-row
backfill runs after the migration.

**Rollout / flags:** the change is additive and low-risk; no feature flag strictly required. If
desired, gate the DM claim-DM send behind the existing `miniappUrl` presence (already the de-facto
switch, `pipelineV2Sweep.ts:303`) — absent URL → no DM, same as today. The gate-admission change is
safe to ship unflagged (it only ADMITS the legitimate sender; it never widens to others).

**Verification (project review cadence):** `npm run typecheck`, `npm run lint`, `npm run test`,
coverage; `npm run test:integration -w @line-robot/db` (the new column) and
`-w @line-robot/bot` (the sweep); `npm run test:e2e:api -w @line-robot/miniapp` (Docker real-backend
claim round-trip). This is a schema + authz + flows increment → run `/increment-review` (spec auditor
vs this plan, correctness, simplicity critic) and `/alignment-review` (claim/publish + LEGAL-02 +
privacy heuristics in `docs/research/00-product-principles.md`). Not a visual change → no
`/frontend-review` needed. `npm run eval` for the new DM archetype (advisory, D21).

---

## 6. Open questions / founder decisions

1. **Should a DM dump be self-claimable by its sender?** (Recommended: YES — it's what the incident
   requires.) If NO, the incident is only half-fixed (Option 4).
2. **Do DM listings get exclusivity windows?** Today **nothing** does (zero `listing_exclusivity`
   rows; no production opener). This decision is really *"should exclusivity-at-ingest be built at
   all, and if so does it cover DM?"* — a Stage-6 dealflow decision larger than Group D. Recommend:
   **defer**; revisit only when exclusivity-at-ingest is on the roadmap.
3. **Who is the lapse-DM target for a DM listing?** Moot until (2). If exclusivity is built, the
   current target is the **claimant's** LINE id (`exclusivity.ts:134-137`); a DM listing claimed by
   its sender would then DM that sender — consistent. No new decision needed beyond (2).
4. **Full unification now or later (Option 2)?** Recommend later, gated on either exclusivity-at-
   ingest OR a second NULL-group special case (rooms / open-mandate). The schema already supports it
   (nullable `line_group_id`; seed models owner-as-member), so the door stays open.
5. **Synthetic group namespace (only if Option 2 is chosen):** `line_group_id = "dm#<id>"` vs NULL +
   a `kind` discriminator. The `.unique()` constraint forbids many NULLs colliding only by accident
   (Postgres allows multiple NULLs), but a real `dm#…` value is cleaner if group-management ever lists
   groups. Defer with Option 2.

---

## 7. Cross-group dependencies (flag, don't resolve)

- **E10 — write idempotency keys (cross-group, overlaps Group A/B):** the DM claim path and the sweep
  both re-run at-least-once. `markClaimInvited` (`portal.ts:149-156`) and `claimListing`'s conditional
  UPDATE (`portal.ts:40-58`) are already idempotent via WHERE-guards; the NEW `dm_claimant_user_id`
  write must be **set-once / idempotent on re-sweep** (mirror the existing guards). This is the E10
  pattern — flagged, not designed here.
- **Group A (dedup):** the reason only 1 of 5 incident listings survived is the dedup merge bug, NOT
  Group D. Group D makes the survivor (and future survivors) *claimable*; it does not recover the 4
  lost listings — that's Group A's fix. The proposed DM-dump eval archetype overlaps Group A's "N
  distinct, 0 merges" archetype — coordinate, don't duplicate.
- **Group C (eval/replay):** the DM eval archetype above feeds the golden-set/replay work; the replay
  export utility is Group C's deliverable.
- **Stage-6 dealflow (exclusivity-at-ingest):** open question 2 depends on a decision that lives
  outside this audit entirely.

---

## 8. Out of scope / deferred

- Building exclusivity-at-ingest (opening windows for ANY listing) — not Group D; dormant today.
- Full DM/group unification via synthetic group-of-one (Option 2) — deferred until a forcing function
  (see §6.4); door kept open by the schema.
- Recovering the 4 merged-away incident listings — Group A.
- `room#…` conversations — the same NULL-group analysis applies, but no incident/room evidence exists;
  the Option 1 gate rule can extend to rooms later without new structure.
- Backfilling the synthetic-group namespace / group-management visibility of personal groups — only
  relevant under Option 2.
- Any change to read/public/CRM surfaces — confirmed group-agnostic or claimant-scoped already (§2.2
  item 10); no work needed.

<!-- RPI: R+P COMPLETE -->
