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
