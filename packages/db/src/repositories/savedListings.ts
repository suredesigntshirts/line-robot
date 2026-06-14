import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { listingMedia, listings, savedListings } from "../schema.ts";

// Stage 5 (D13) — the "saved listings" relation a user builds from browse/search. The
// `saved_listing_unique` index makes (listing, user) at-most-once, so `saveListing` is idempotent via
// `onConflictDoNothing` (tapping save twice is a no-op, not an error).

/** The hero thumb for a card: the lowest hero_index photo (kind=photo) that has a 640px derivative,
 * else NULL. The `"listing".id` literal correlation matches repositories/listings.ts — drizzle renders
 * `listings.id` UNQUALIFIED inside a projection subquery, and listing_media has its own `id` column
 * that would otherwise capture the reference. */
const heroThumbKeySql = sql<string | null>`(
  select m.thumb_key from ${listingMedia} m
  where m.listing_id = "listing".id and m.kind = 'photo' and m.thumb_key is not null
  order by m.hero_index asc nulls last, m.id asc limit 1)`;

/** A saved listing as the mini-app "Saved" screen renders it: the listing row plus its hero thumb key
 * (the API presigns it). `savedAt` orders the list newest-first. */
export interface SavedListingCard {
  listing: typeof listings.$inferSelect;
  savedAt: Date;
  heroThumbKey: string | null;
}

/** Save a listing for a user (idempotent — a duplicate save is silently ignored). */
export async function saveListing(db: Db, listingId: string, userId: string): Promise<void> {
  await db.insert(savedListings).values({ listingId, userId }).onConflictDoNothing();
}

/** Un-save a listing for a user (no-op when it wasn't saved). */
export async function unsaveListing(db: Db, listingId: string, userId: string): Promise<void> {
  await db
    .delete(savedListings)
    .where(and(eq(savedListings.listingId, listingId), eq(savedListings.userId, userId)));
}

/** The user's saved listings, newest-save first, each with its hero thumb key (for the card image). */
export async function listSavedListingsForUser(
  db: Db,
  userId: string,
): Promise<SavedListingCard[]> {
  return db
    .select({
      listing: listings,
      savedAt: savedListings.createdAt,
      heroThumbKey: heroThumbKeySql,
    })
    .from(savedListings)
    .innerJoin(listings, eq(savedListings.listingId, listings.id))
    .where(eq(savedListings.userId, userId))
    .orderBy(desc(savedListings.createdAt));
}
