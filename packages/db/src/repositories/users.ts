import type { ApprovalStatus, RoleKind } from "@line-robot/domain";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { brokerPreferences, roles, userIdentities, users } from "../schema.ts";

export type NewUser = typeof users.$inferInsert;
export type NewUserIdentity = typeof userIdentities.$inferInsert;
export type NewRole = typeof roles.$inferInsert;
export type UserRow = typeof users.$inferSelect;
export type RoleRow = typeof roles.$inferSelect;

/** D-S1-6: the first verified identity creates the canonical user. */
export async function createUserWithIdentity(
  db: Db,
  user: NewUser,
  identity: Omit<NewUserIdentity, "userId">,
): Promise<UserRow> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(users).values(user).returning();
    if (!created) throw new Error("user insert returned no row");
    await tx.insert(userIdentities).values({ ...identity, userId: created.id });
    return created;
  });
}

export async function addRole(db: Db, role: NewRole): Promise<void> {
  await db.insert(roles).values(role);
}

/** The outcome of a broker/investor role application: a fresh PENDING row was created, or the user
 * already had a live (pending/approved) role of that kind so nothing was inserted. */
export interface RoleApplicationResult {
  /** False when an existing live role short-circuited the insert (the re-application guard). */
  created: boolean;
  /** The applicant's resulting standing for that kind (the existing or the new row's status). */
  status: ApprovalStatus;
}

/**
 * Apply for a broker/investor role, ATOMICALLY (D-S6-6, fixes D + E). One transaction so a partial
 * failure can never leave a pending role with no matching-preferences row:
 *  1. Re-application guard (D): if the user ALREADY has a `pending` or `approved` role of this kind,
 *     do NOT insert a duplicate — return the existing status. (A previously `rejected` application
 *     does NOT block re-applying — the user may have fixed whatever was wrong.)
 *  2. Otherwise insert a fresh `pending` role AND upsert the preferences in the SAME transaction.
 * Preferences are upserted even on the no-insert path? No — on the guarded short-circuit we leave the
 * existing prefs untouched (the dedicated edit path owns preference changes); a re-apply that's a
 * no-op should not silently rewrite them.
 */
export async function applyForRole(
  db: Db,
  userId: string,
  kind: "broker" | "investor",
  prefs: { provinces: string[]; propertyTypes: string[]; priceBandIds: string[] },
): Promise<RoleApplicationResult> {
  return db.transaction(async (tx) => {
    const live = await tx
      .select({ approvalStatus: roles.approvalStatus })
      .from(roles)
      .where(
        and(
          eq(roles.userId, userId),
          eq(roles.kind, kind),
          inArray(roles.approvalStatus, ["pending", "approved"]),
        ),
      );
    const existing = live[0];
    if (existing) return { created: false, status: existing.approvalStatus };

    await tx.insert(roles).values({ userId, kind, approvalStatus: "pending" });
    await tx
      .insert(brokerPreferences)
      .values({
        userId,
        provinces: prefs.provinces,
        propertyTypes: prefs.propertyTypes,
        priceBandIds: prefs.priceBandIds,
      })
      .onConflictDoUpdate({
        target: brokerPreferences.userId,
        set: {
          provinces: prefs.provinces,
          propertyTypes: prefs.propertyTypes,
          priceBandIds: prefs.priceBandIds,
          updatedAt: sql`now()`,
        },
      });
    return { created: true, status: "pending" };
  });
}

export async function findUserByIdentity(
  db: Db,
  provider: NewUserIdentity["provider"],
  providerSubject: string,
): Promise<UserRow | undefined> {
  const rows = await db
    .select({ user: users })
    .from(userIdentities)
    .innerJoin(users, eq(userIdentities.userId, users.id))
    .where(
      and(
        eq(userIdentities.provider, provider),
        eq(userIdentities.providerSubject, providerSubject),
      ),
    );
  return rows.find(() => true)?.user;
}

/**
 * Find-or-create the canonical user for a `(provider, subject)` identity, race-safely. The shared
 * lookup-then-create the API handler (LIFF id-token → user) and the ingest sweep (conversation
 * pseudo-owner + real senders) all need: a hit returns the existing user; a miss creates one. Two
 * concurrent first requests for the same subject both miss and both try to create — the
 * `user_identity_provider_subject` unique index lets at most one win; the loser's insert throws, so we
 * re-read and return the winner instead of surfacing the error. (A lost race may leave an orphaned
 * `user` row with no identity — harmless: it's unreachable by any identity lookup; an orphan sweep is a
 * later cleanup, not a correctness issue.) A genuine failure (not a lost-create race) re-throws.
 */
export async function findOrCreateUserByIdentity(
  db: Db,
  provider: NewUserIdentity["provider"],
  providerSubject: string,
  displayName: string,
): Promise<UserRow> {
  const existing = await findUserByIdentity(db, provider, providerSubject);
  if (existing) return existing;
  try {
    return await createUserWithIdentity(
      db,
      { displayName },
      { provider, providerSubject, verifiedAt: new Date() },
    );
  } catch (error) {
    const winner = await findUserByIdentity(db, provider, providerSubject);
    if (winner) return winner;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Stage 6 — role / vetting (D9, D-S6-5/6/8). Broker/investor roles are
// admin-approved; the `admin` role itself is the server-enforced gate for the
// vetting + moderation actions. `reviewed_by`/`reviewed_at` (migration 0009)
// record who decided and when.
// ---------------------------------------------------------------------------

/** All of a user's roles (every kind + its approvalStatus) — the server-side gate reads this to
 * decide `requireRole('admin')`/`requireVetted` (an approved broker/investor). Ordered by `id` for a
 * STABLE, deterministic result (the `role` table has no `created_at` and `id` is a random UUID, so
 * `id` is not chronological — but it IS a total order, which is all the gate / "current application"
 * read needs: the same rows always come back in the same sequence). */
export async function getUserRoles(db: Db, userId: string): Promise<RoleRow[]> {
  return db.select().from(roles).where(eq(roles.userId, userId)).orderBy(asc(roles.id));
}

/**
 * The caller's "current" broker/investor role application, deterministically (D-S6-6). A user can
 * accrue several broker/investor rows over time (e.g. a rejected application then a fresh one); this
 * surfaces the most RELEVANT standing — an `approved` role first, then a `pending` one, then a
 * `rejected` one — with `id` as the final tiebreaker so the result never flaps between reads. Returns
 * undefined when the user has never applied. (The re-application guard in `applyForRole` keeps at most
 * one live pending/approved role per kind, so in practice this resolves to a single clear status.)
 */
export async function getLatestRoleApplication(
  db: Db,
  userId: string,
): Promise<RoleRow | undefined> {
  const rows = await db
    .select()
    .from(roles)
    .where(and(eq(roles.userId, userId), inArray(roles.kind, ["broker", "investor"])))
    .orderBy(
      // approved (0) < pending (1) < rejected/other (2) so the strongest standing sorts first.
      sql`case ${roles.approvalStatus} when 'approved' then 0 when 'pending' then 1 else 2 end`,
      asc(roles.id),
    );
  return rows[0];
}

/** A role application joined to the applicant's display name — the admin vetting queue. */
export interface RoleApplication {
  roleId: string;
  userId: string;
  displayName: string;
  kind: RoleKind;
  approvalStatus: ApprovalStatus;
}

/** The vetting queue: role rows at `status` (default 'pending'), with the applicant's display name. */
export async function listRoleApplications(
  db: Db,
  status: ApprovalStatus = "pending",
): Promise<RoleApplication[]> {
  return db
    .select({
      roleId: roles.id,
      userId: roles.userId,
      displayName: users.displayName,
      kind: roles.kind,
      approvalStatus: roles.approvalStatus,
    })
    .from(roles)
    .innerJoin(users, eq(roles.userId, users.id))
    .where(eq(roles.approvalStatus, status));
}

/** The outcome of an admin vetting decision: a real transition, an already-decided no-op (so the
 * caller can 409 a stale/double request), or no such role (404). */
export type RoleApprovalResult =
  | { outcome: "updated"; row: RoleRow }
  | { outcome: "already_decided"; row: RoleRow }
  | { outcome: "not_found" };

/**
 * Vet a role: transition it to approved/rejected and stamp the reviewing admin + the time. The UPDATE
 * is guarded `WHERE approval_status = 'pending'` (a TERMINAL-STATE guard) so a stale or double admin
 * request can NEVER silently flip an already-decided role (approved → rejected, or re-stamp a new
 * reviewer). When the guarded UPDATE touches no row we read the role back to distinguish "already
 * decided" (it exists but isn't pending → 409) from "no such role" (404).
 */
export async function setRoleApproval(
  db: Db,
  roleId: string,
  status: "approved" | "rejected",
  reviewedBy: string,
): Promise<RoleApprovalResult> {
  const [updated] = await db
    .update(roles)
    .set({ approvalStatus: status, reviewedBy, reviewedAt: sql`now()` })
    .where(and(eq(roles.id, roleId), eq(roles.approvalStatus, "pending")))
    .returning();
  if (updated) return { outcome: "updated", row: updated };
  const [existing] = await db.select().from(roles).where(eq(roles.id, roleId));
  return existing ? { outcome: "already_decided", row: existing } : { outcome: "not_found" };
}

/** An approved-vetted user + their stated quick-quote preferences (their `broker_preference` row, or
 * all-empty "any" when they haven't set one). The `matchVettedUsers` candidate set. */
export interface VettedCandidate {
  /** The canonical user UUID (dedup key + logging) — NOT a LINE push target. */
  userId: string;
  /** The user's LINE provider subject — the push `to` target for the quick-quote DM. */
  lineUserId: string;
  kind: RoleKind;
  provinces: string[];
  propertyTypes: string[];
  priceBandIds: string[];
}

/**
 * Every APPROVED broker/investor user with their matching preferences (D-S6-6), DEDUPED to at most
 * one row per `userId`. This is the ONLY source of the quick-quote recipient set — it filters to
 * `approval_status = 'approved'` and `kind IN (broker, investor)` SERVER-SIDE, so a push can never
 * reach an unvetted user (the spec-auditor invariant). A user with no preference row yet matches
 * everything ("any" on all axes).
 *
 * Dedup: `role` has no `(user_id, kind)` unique constraint, so a user approved as BOTH broker AND
 * investor would otherwise return two identical-prefs rows (the `broker_preference` left join is
 * keyed by `user_id`, so both rows carry the same prefs) — and INC-B2's quick-quote push would
 * notify that user twice for one listing. We keep the first row per `user_id`; `kind` is the first
 * approved role we see (the matching logic never reads `kind` — it's informational), and the prefs
 * are identical across the duplicate rows, so which row we keep doesn't change the recipient set.
 *
 * The INNER JOIN to `user_identities` (provider 'line') resolves each vetted user's LINE provider
 * subject (`lineUserId`) — the actual push `to` target. The join is the filter: a vetted user with
 * no LINE identity is not push-targetable (and in practice every vetted broker has one from LIFF
 * auth), so they're correctly excluded from the recipient set. `userId` (the pg UUID) is kept ONLY
 * for dedup/logging — pushing it as the LINE `to` would 400 (it's not a LINE id).
 */
export async function listApprovedVettedUsers(db: Db): Promise<VettedCandidate[]> {
  const rows = await db
    .select({
      userId: roles.userId,
      lineUserId: userIdentities.providerSubject,
      kind: roles.kind,
      provinces: brokerPreferences.provinces,
      propertyTypes: brokerPreferences.propertyTypes,
      priceBandIds: brokerPreferences.priceBandIds,
    })
    .from(roles)
    .innerJoin(
      userIdentities,
      and(eq(userIdentities.userId, roles.userId), eq(userIdentities.provider, "line")),
    )
    .leftJoin(brokerPreferences, eq(brokerPreferences.userId, roles.userId))
    .where(and(eq(roles.approvalStatus, "approved"), inArray(roles.kind, ["broker", "investor"])));

  const byUser = new Map<string, VettedCandidate>();
  for (const r of rows) {
    if (byUser.has(r.userId)) continue; // a user approved under two roles → keep the first
    byUser.set(r.userId, {
      userId: r.userId,
      lineUserId: r.lineUserId,
      kind: r.kind,
      provinces: r.provinces ?? [],
      propertyTypes: r.propertyTypes ?? [],
      priceBandIds: r.priceBandIds ?? [],
    });
  }
  return [...byUser.values()];
}
