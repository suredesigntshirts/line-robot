import { desc, eq } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { interestFlags, users } from "../schema.ts";

// Stage 6 (D-S6-3) — interest flags: a non-binding "I'm interested" signal a group member raises on
// a listing within its exclusivity window. Visible to the poster + admin; no priority/queue, no
// obligation, and it does NOT block the poster releasing early. One flag per (listing, user) — the
// `interest_flag_unique` index makes a re-flag idempotent.

export type InterestFlagRow = typeof interestFlags.$inferSelect;

/** Raise an interest flag, idempotently (a re-flag by the same user is a no-op via the unique index). */
export async function createInterestFlag(db: Db, listingId: string, userId: string): Promise<void> {
  await db
    .insert(interestFlags)
    .values({ listingId, userId })
    .onConflictDoNothing({ target: [interestFlags.listingId, interestFlags.userId] });
}

/** A flag with the flagging user's display name. */
export interface InterestFlagWithUser {
  id: string;
  userId: string;
  displayName: string;
  createdAt: Date;
}

/** All flags on a listing for the poster/admin view — newest first, with the flagger's display name. */
export async function listInterestFlags(
  db: Db,
  listingId: string,
): Promise<InterestFlagWithUser[]> {
  return db
    .select({
      id: interestFlags.id,
      userId: interestFlags.userId,
      displayName: users.displayName,
      createdAt: interestFlags.createdAt,
    })
    .from(interestFlags)
    .innerJoin(users, eq(interestFlags.userId, users.id))
    .where(eq(interestFlags.listingId, listingId))
    .orderBy(desc(interestFlags.createdAt));
}
