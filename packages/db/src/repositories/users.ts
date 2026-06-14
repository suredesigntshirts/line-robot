import { and, eq } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { roles, userIdentities, users } from "../schema.ts";

export type NewUser = typeof users.$inferInsert;
export type NewUserIdentity = typeof userIdentities.$inferInsert;
export type NewRole = typeof roles.$inferInsert;
export type UserRow = typeof users.$inferSelect;

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
