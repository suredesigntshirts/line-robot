import type { ViewingStatus } from "@line-robot/domain";
import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { listingMedia, listings, viewings } from "../schema.ts";

// Stage 5 (D13) — marketplace VIEWING requests with a status lifecycle (requested → confirmed → done
// / cancelled). This is the CRM record the "Viewings" screen renders.
//
// DISTINCT from the bot's `listing_event` (repositories/listingEvents.ts): a `listing_event` is the
// at-most-once REMINDER primitive (due_at → push once → stamp notified_at), how the plan-17 "book a
// viewing" 1:1-chat reminder works. A `viewing` is the relationship/CRM record — who wants to see
// what, when, and where it is in its lifecycle. The two are complementary: creating a `viewing` from
// the mini-app records the request; the bot may separately schedule a `listing_event` reminder. Stage
// 5 writes the `viewing` (the proper CRM home); wiring a reminder off it is a follow-up, not in scope.

export type NewViewing = typeof viewings.$inferInsert;
export type ViewingRow = typeof viewings.$inferSelect;

/** The hero thumb for a viewing card (lowest hero_index photo with a derivative, else NULL). Same
 * `"listing".id` literal-correlation rule as the other projection subqueries (see savedListings.ts). */
const heroThumbKeySql = sql<string | null>`(
  select m.thumb_key from ${listingMedia} m
  where m.listing_id = "listing".id and m.kind = 'photo' and m.thumb_key is not null
  order by m.hero_index asc nulls last, m.id asc limit 1)`;

/** A viewing as the mini-app "Viewings" screen renders it: the viewing row joined to its listing +
 * hero thumb. The screen splits these into upcoming (scheduledAt >= now) and past by `scheduledAt`. */
export interface ViewingCard {
  viewing: ViewingRow;
  listing: typeof listings.$inferSelect;
  heroThumbKey: string | null;
}

/** Create a viewing request on a listing for a user; returns the inserted row. */
export async function createViewing(
  db: Db,
  listingId: string,
  requestedByUserId: string,
  scheduledAt: Date,
): Promise<ViewingRow> {
  const [created] = await db
    .insert(viewings)
    .values({ listingId, requestedByUserId, scheduledAt })
    .returning();
  if (!created) throw new Error("viewing insert returned no row");
  return created;
}

/** A user's viewings split into upcoming (scheduled at/after `now`, soonest first) and past (before
 * `now`, most-recent first) — the two sections the screen renders. Cancelled viewings stay in the
 * list (the user still sees their history); the UI styles them by status. */
export async function listViewingsForUser(
  db: Db,
  userId: string,
  now: Date,
): Promise<{ upcoming: ViewingCard[]; past: ViewingCard[] }> {
  const [upcoming, past] = await Promise.all([
    db
      .select({ viewing: viewings, listing: listings, heroThumbKey: heroThumbKeySql })
      .from(viewings)
      .innerJoin(listings, eq(viewings.listingId, listings.id))
      .where(and(eq(viewings.requestedByUserId, userId), gte(viewings.scheduledAt, now)))
      .orderBy(asc(viewings.scheduledAt)),
    db
      .select({ viewing: viewings, listing: listings, heroThumbKey: heroThumbKeySql })
      .from(viewings)
      .innerJoin(listings, eq(viewings.listingId, listings.id))
      .where(and(eq(viewings.requestedByUserId, userId), lt(viewings.scheduledAt, now)))
      .orderBy(desc(viewings.scheduledAt)),
  ]);
  return { upcoming, past };
}

/** Move a viewing through its lifecycle (confirm / mark done / cancel). Scoped to the requester so a
 * user can only mutate their own viewings; returns true iff a row matched (false = not theirs / gone). */
export async function updateViewingStatus(
  db: Db,
  viewingId: string,
  userId: string,
  status: ViewingStatus,
): Promise<boolean> {
  const updated = await db
    .update(viewings)
    .set({ status })
    .where(and(eq(viewings.id, viewingId), eq(viewings.requestedByUserId, userId)))
    .returning({ id: viewings.id });
  return updated.length === 1;
}
