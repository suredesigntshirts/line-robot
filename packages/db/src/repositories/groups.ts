import { eq } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { groupMemberships, groups, listings } from "../schema.ts";

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

/**
 * Find-or-create the Postgres `group` for a LINE group id, returning its row (Stage 5, Build C). The
 * live ingest path needs this so a freshly-discovered source group is materialised before any listing
 * references it — `listing.source_group_id` must be non-NULL for the mini-app claim gate (a NULL group
 * can never be group-claimed). Idempotent + concurrency-safe: an `ON CONFLICT (line_group_id) DO
 * NOTHING` insert races at most one winner; a 0-row insert means a concurrent sweep already created it,
 * so we read it back. The display `name` is only set on first create (the group's own name flows in
 * later via Stage 6 group management); a re-call never overwrites it.
 */
export async function findOrCreateGroupByLineGroupId(
  db: Db,
  lineGroupId: string,
  name?: string,
): Promise<GroupRow> {
  const [inserted] = await db
    .insert(groups)
    .values({ lineGroupId, name: name ?? lineGroupId })
    .onConflictDoNothing({ target: groups.lineGroupId })
    .returning();
  if (inserted) return inserted;
  // The insert was a no-op (a concurrent sweep won the race) — read the existing row.
  const [existing] = await db.select().from(groups).where(eq(groups.lineGroupId, lineGroupId));
  if (!existing) throw new Error(`group upsert found no row for lineGroupId=${lineGroupId}`);
  return existing;
}

/**
 * Record a `(group, user)` membership edge, idempotently (Stage 5, Build C). The live ingest path
 * writes one of these per distinct message sender so the mini-app claim gate (`isGroupMember`) admits
 * real posters. `addMembership`'s plain insert throws on the `(group_id, user_id)` unique index when
 * the edge already exists; `onConflictDoNothing` makes a re-sweep a safe no-op. NOT a replacement for
 * `addMembership` (the seed wants the throw-on-dup) — a distinct fn for the at-least-once ingest path.
 */
export async function upsertMembership(db: Db, membership: NewGroupMembership): Promise<void> {
  await db
    .insert(groupMemberships)
    .values(membership)
    .onConflictDoNothing({ target: [groupMemberships.groupId, groupMemberships.userId] });
}

/** The per-group exclusivity window (days) for a listing's source group (Stage 6, D-S6-1) — the value
 * an `extend` bumps `expires_at` by. Undefined when the listing doesn't exist or has no source group
 * (a 1:1-sourced listing); the caller falls back to the system default (7). */
export async function getExclusivityWindowDays(
  db: Db,
  listingId: string,
): Promise<number | undefined> {
  const [row] = await db
    .select({ windowDays: groups.exclusivityWindowDays })
    .from(listings)
    .innerJoin(groups, eq(groups.id, listings.sourceGroupId))
    .where(eq(listings.id, listingId));
  return row?.windowDays;
}
