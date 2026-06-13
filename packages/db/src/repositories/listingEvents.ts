import { and, asc, eq, isNull, lte } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { listingEvents } from "../schema.ts";

// Bot follow-up reminders (the `listing_event` table). The reminder sweep's at-most-once primitive:
// see the table comment in schema.ts. These mirror the v1 DynamoDB PropertyEvent operations so the
// bot's Postgres PropertyStore can round-trip the same domain type after the catalog cutover.

export type ListingEventRow = typeof listingEvents.$inferSelect;
export type NewListingEvent = typeof listingEvents.$inferInsert;

export async function insertListingEvent(db: Db, event: NewListingEvent): Promise<void> {
  await db.insert(listingEvents).values(event);
}

export async function listEventsByListing(db: Db, listingId: string): Promise<ListingEventRow[]> {
  return db.select().from(listingEvents).where(eq(listingEvents.listingId, listingId));
}

export async function deleteEventsByListing(db: Db, listingId: string): Promise<void> {
  await db.delete(listingEvents).where(eq(listingEvents.listingId, listingId));
}

/** Un-notified events due at/before `now`, soonest first — the reminder sweep's work list. Served by
 * the `listing_event_due` partial index (notified rows are not in the index). */
export async function findDueListingEvents(
  db: Db,
  now: Date,
  limit: number,
): Promise<ListingEventRow[]> {
  return db
    .select()
    .from(listingEvents)
    .where(and(isNull(listingEvents.notifiedAt), lte(listingEvents.dueAt, now)))
    .orderBy(asc(listingEvents.dueAt))
    .limit(limit);
}

/**
 * Atomically claim an event for notification: stamp `notified_at` only if it is still null. Returns
 * `true` iff this worker won the claim — Postgres serialises the conditional UPDATE per row, so of
 * two overlapping sweeps exactly one matches the `notified_at IS NULL` predicate and gets the row
 * back. Winning is the licence to push exactly one reminder (mirrors the v1 conditional write).
 */
export async function claimListingEventNotified(
  db: Db,
  eventId: string,
  notifiedAt: Date,
): Promise<boolean> {
  const claimed = await db
    .update(listingEvents)
    .set({ notifiedAt })
    .where(and(eq(listingEvents.id, eventId), isNull(listingEvents.notifiedAt)))
    .returning({ id: listingEvents.id });
  return claimed.length === 1;
}
