import { and, desc, eq } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { listingNotes } from "../schema.ts";

// Stage 5 (D13) — per-user follow-up notes on a listing (a private CRM scratchpad). Append-only in
// Stage 5: a user adds notes and reads back their own; there is no edit/delete surface. Every read is
// scoped to the writing user, so one user never sees another's notes (the listing may be shared, the
// notes are not).

export type ListingNoteRow = typeof listingNotes.$inferSelect;

/** Append a note to a listing for a user; returns the inserted row (so the UI can render it without a
 * re-fetch). */
export async function addListingNote(
  db: Db,
  listingId: string,
  userId: string,
  body: string,
): Promise<ListingNoteRow> {
  const [created] = await db.insert(listingNotes).values({ listingId, userId, body }).returning();
  if (!created) throw new Error("listing note insert returned no row");
  return created;
}

/** The caller's OWN notes on one listing, newest first. Scoped to (listing, user) — never returns
 * another user's notes. */
export async function listNotesForUserListing(
  db: Db,
  listingId: string,
  userId: string,
): Promise<ListingNoteRow[]> {
  return db
    .select()
    .from(listingNotes)
    .where(and(eq(listingNotes.listingId, listingId), eq(listingNotes.userId, userId)))
    .orderBy(desc(listingNotes.createdAt));
}
