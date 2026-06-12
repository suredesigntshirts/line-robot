import type { Db } from "../pool.js";
import { groupMemberships, groups } from "../schema.js";

export type NewGroup = typeof groups.$inferInsert;
export type NewGroupMembership = typeof groupMemberships.$inferInsert;
export type GroupRow = typeof groups.$inferSelect;

export async function createGroup(db: Db, group: NewGroup): Promise<GroupRow> {
  const [created] = await db.insert(groups).values(group).returning();
  if (!created) throw new Error("group insert returned no row");
  return created;
}

export async function addMembership(db: Db, membership: NewGroupMembership): Promise<void> {
  await db.insert(groupMemberships).values(membership);
}
