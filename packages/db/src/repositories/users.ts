import type { ApprovalStatus, RoleKind } from "@line-robot/domain";
import { and, eq, inArray, sql } from "drizzle-orm";
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
 * decide `requireRole('admin')`/`requireVetted` (an approved broker/investor). */
export async function getUserRoles(db: Db, userId: string): Promise<RoleRow[]> {
  return db.select().from(roles).where(eq(roles.userId, userId));
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

/** Vet a role: transition it to approved/rejected and stamp the reviewing admin + the time. Returns
 * the updated row, or undefined if no such role exists. */
export async function setRoleApproval(
  db: Db,
  roleId: string,
  status: "approved" | "rejected",
  reviewedBy: string,
): Promise<RoleRow | undefined> {
  const [updated] = await db
    .update(roles)
    .set({ approvalStatus: status, reviewedBy, reviewedAt: sql`now()` })
    .where(eq(roles.id, roleId))
    .returning();
  return updated;
}

/** An approved-vetted user + their stated quick-quote preferences (their `broker_preference` row, or
 * all-empty "any" when they haven't set one). The `matchVettedUsers` candidate set. */
export interface VettedCandidate {
  userId: string;
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
 */
export async function listApprovedVettedUsers(db: Db): Promise<VettedCandidate[]> {
  const rows = await db
    .select({
      userId: roles.userId,
      kind: roles.kind,
      provinces: brokerPreferences.provinces,
      propertyTypes: brokerPreferences.propertyTypes,
      priceBandIds: brokerPreferences.priceBandIds,
    })
    .from(roles)
    .leftJoin(brokerPreferences, eq(brokerPreferences.userId, roles.userId))
    .where(and(eq(roles.approvalStatus, "approved"), inArray(roles.kind, ["broker", "investor"])));

  const byUser = new Map<string, VettedCandidate>();
  for (const r of rows) {
    if (byUser.has(r.userId)) continue; // a user approved under two roles → keep the first
    byUser.set(r.userId, {
      userId: r.userId,
      kind: r.kind,
      provinces: r.provinces ?? [],
      propertyTypes: r.propertyTypes ?? [],
      priceBandIds: r.priceBandIds ?? [],
    });
  }
  return [...byUser.values()];
}
