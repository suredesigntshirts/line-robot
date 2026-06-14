import type { ContentLang, MediaKind } from "@line-robot/domain";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import {
  groupMemberships,
  listingContent,
  listingMedia,
  listingRental,
  listings,
  publishConsents,
  savedListings,
} from "../schema.ts";

// Stage 5 (D7) — the claim/publish opt-in lifecycle and the "My listings" portal read.
//
// CLAIM is an optimistic lock on `listing.claimed_by_user_id`: the pipeline writes every listing with
// a pseudo-user `owner_user_id`, and a real LINE user claims ownership through the mini-app. The claim
// UPDATE matches only WHERE `claimed_by_user_id IS NULL`, so Postgres serialises two concurrent claims
// per row and exactly one wins — the loser gets `already_claimed` (mirrors the `claimListingEventNotified`
// conditional-write pattern in repositories/listingEvents.ts). The same user re-claiming is idempotent.
//
// PUBLISH is consent-driven (LEGAL-02): a listing is publicly visible iff a `publish_consent` row
// exists without a `deletion_requested_at`. So `publishListing` = grant consent (the website's gate
// surfaces it within a refresh); `keepListingPrivate` = the inverse — revoke any active consent so the
// listing falls back to group-private (the DEFAULT state of an unconsented listing). Keep-private needs
// NO extra column: absence-of-consent already IS group-private; the only thing to record is pulling a
// previously-published listing back, which the existing LEGAL-10 deletion-request timestamp expresses.

/** Outcome of an optimistic claim. `claimed` = this call won the lock; `already_yours` = the caller
 * already holds it (idempotent re-claim); `already_claimed` = another user holds it (the loser's
 * message); `not_found` = no such listing. */
export type ClaimResult = "claimed" | "already_yours" | "already_claimed" | "not_found";

/**
 * Optimistically claim a listing for a user. The conditional UPDATE (`WHERE claimed_by_user_id IS
 * NULL`) is the lock: of two overlapping claims exactly one matches the predicate and gets the row
 * back. On a 0-row update we read the current holder to disambiguate the outcome (already-yours vs
 * taken vs gone) — a cheap second read only on the contended/idempotent path.
 */
export async function claimListing(
  db: Db,
  listingId: string,
  userId: string,
): Promise<ClaimResult> {
  const won = await db
    .update(listings)
    .set({ claimedByUserId: userId, claimedAt: sql`now()`, updatedAt: sql`now()` })
    .where(and(eq(listings.id, listingId), isNull(listings.claimedByUserId)))
    .returning({ id: listings.id });
  if (won.length === 1) return "claimed";

  const [current] = await db
    .select({ claimedByUserId: listings.claimedByUserId })
    .from(listings)
    .where(eq(listings.id, listingId));
  if (!current) return "not_found";
  return current.claimedByUserId === userId ? "already_yours" : "already_claimed";
}

/**
 * Publish a claimed listing: grant publish consent (LEGAL-02) so the public website surfaces it. The
 * consent insert is the only public-visibility signal — there's no status column to flip. Idempotent
 * enough for the UI: a second publish just records a second consent row (both gate-pass; harmless).
 */
export async function publishListing(
  db: Db,
  listingId: string,
  userId: string,
  consentVersion: string,
): Promise<void> {
  await db.insert(publishConsents).values({
    listingId,
    userId,
    consentVersion,
    consentTimestamp: sql`now()`,
  });
}

/**
 * Keep a listing group-private: the inverse of publish. Revokes any ACTIVE publish consent (stamps
 * `deletion_requested_at`, the LEGAL-10 mechanism the public gate already honours), pulling a
 * previously-published listing back to source-group-only visibility. A never-published listing has no
 * active consent, so this is a no-op there — which is correct: group-private is already the default.
 */
export async function keepListingPrivate(db: Db, listingId: string): Promise<void> {
  await db
    .update(publishConsents)
    .set({ deletionRequestedAt: sql`now()` })
    .where(
      and(eq(publishConsents.listingId, listingId), isNull(publishConsents.deletionRequestedAt)),
    );
}

/** A row of the "My listings" portal: the listing the caller has claimed, its lifecycle status, its
 * publish state, its hero thumb (the API presigns it), and — for a RENT listing — its monthly rent
 * (which lives on the `listing_rental` satellite, NOT on `listing.price_thb`). */
export interface MyListingCard {
  listing: typeof listings.$inferSelect;
  /** True iff an active publish consent exists (LEGAL-02) — the listing is on the public website. */
  isPublished: boolean;
  heroThumbKey: string | null;
  /** Monthly rent from `listing_rental.monthly_rent`, or NULL for a sale (its asking price rides on
   * `listing.price_thb`). The card needs this so a rental shows its rent, not the empty `priceThb`. */
  monthlyRent: number | null;
}

const heroThumbKeySql = sql<string | null>`(
  select m.thumb_key from ${listingMedia} m
  where m.listing_id = "listing".id and m.kind = 'photo' and m.thumb_key is not null
  order by m.hero_index asc nulls last, m.id asc limit 1)`;

// Monthly rent from the rental satellite (same correlated-subquery pattern as repositories/listings.ts'
// `monthlyRentSql`). The outer correlation MUST be the literal `"listing".id` (drizzle renders
// `${listings.id}` unqualified inside a projection subquery — same gotcha as heroThumbKey/isPublished).
const monthlyRentSql = sql<
  number | null
>`(select r.monthly_rent::int from ${listingRental} r where r.listing_id = "listing".id)`;

// Active-consent existence (LEGAL-02): an unrevoked publish_consent row. Surfaced as the "published"
// badge on the My-listings card. The outer correlation MUST be the literal `"listing".id` — drizzle
// renders `${listings.id}` UNQUALIFIED inside a projection subquery, where it would capture
// `publish_consent`'s own `id` column instead of the outer listing (same gotcha as the heroThumbKey /
// localizedContent subqueries in repositories/listings.ts).
const isPublishedSql = sql<boolean>`exists (
  select 1 from ${publishConsents} pc
  where pc.listing_id = "listing".id and pc.deletion_requested_at is null)`;

/**
 * The "My listings" portal read: every listing the user has CLAIMED, newest-created first, with its
 * lifecycle status (the `saleStage`/`rentalStatus` columns ride on the listing row) and whether it's
 * currently published. Scoped to `claimed_by_user_id` — the pipeline's pseudo-`owner_user_id` is NOT a
 * claim, so unclaimed pipeline rows never appear here.
 */
export async function listMyListings(db: Db, userId: string): Promise<MyListingCard[]> {
  return db
    .select({
      listing: listings,
      isPublished: isPublishedSql,
      heroThumbKey: heroThumbKeySql,
      monthlyRent: monthlyRentSql,
    })
    .from(listings)
    .where(eq(listings.claimedByUserId, userId))
    .orderBy(desc(listings.createdAt));
}

/** Mark a listing's claim DM as sent (the one-shot `claim_invited_at` guard). Sets the timestamp only
 * when it's still NULL, so a re-trigger can't re-send; returns true iff this call set it. */
export async function markClaimInvited(db: Db, listingId: string, at: Date): Promise<boolean> {
  const updated = await db
    .update(listings)
    .set({ claimInvitedAt: at })
    .where(and(eq(listings.id, listingId), isNull(listings.claimInvitedAt)))
    .returning({ id: listings.id });
  return updated.length === 1;
}

/** True iff the user is a member of the given group. The mini-app detail authz uses this to admit a
 * source-group member to a group-private listing (the exclusivity model). NULL group → always false. */
export async function isGroupMember(
  db: Db,
  groupId: string | null,
  userId: string,
): Promise<boolean> {
  if (groupId === null) return false;
  const rows = await db
    .select({ id: groupMemberships.id })
    .from(groupMemberships)
    .where(and(eq(groupMemberships.groupId, groupId), eq(groupMemberships.userId, userId)))
    .limit(1);
  return rows.length === 1;
}

/** The mini-app detail read: one listing with its authz facts (claimant + source group), lifecycle
 * (on the row), gallery photo keys in hero order, content, monthly rent, and whether the CALLER has
 * saved it. The API presigns the `s3Key`s and gates on
 * `claimedByUserId === caller OR isGroupMember(sourceGroupId, caller)`. */
export interface PortalListingDetail {
  listing: typeof listings.$inferSelect;
  lat: number | null;
  lon: number | null;
  monthlyRent: number | null;
  /** True iff the calling user has saved this listing — so the detail's bookmark renders its real
   * persisted state on every revisit (not always "unsaved"). */
  isSaved: boolean;
  /** Photos in hero order; `thumbKey` is the 640px derivative (NULL until re-derived) — the API
   * presigns `thumbKey ?? s3Key`. Kind lets the UI separate the chanote/floorplan from the gallery. */
  media: Array<{
    s3Key: string;
    thumbKey: string | null;
    kind: MediaKind;
    heroIndex: number | null;
  }>;
  content: Array<{ lang: ContentLang; headline: string; description: string }>;
}

/** Full detail read for the mini-app (no consent gate — the API applies its own claimant/group gate).
 * `callerUserId` is the verified caller, used only to compute `isSaved` (a correlated EXISTS over
 * `saved_listing`). Undefined when the listing doesn't exist. */
export async function getPortalListingDetail(
  db: Db,
  id: string,
  callerUserId: string,
): Promise<PortalListingDetail | undefined> {
  const [row] = await db
    .select({
      listing: listings,
      lat: sql<number | null>`ST_Y(${listings.geom}::geometry)`,
      lon: sql<number | null>`ST_X(${listings.geom}::geometry)`,
      // Per-caller saved state. The outer correlation MUST be the literal `"listing".id` — drizzle
      // renders `${listings.id}` UNQUALIFIED inside a projection subquery, where it would bind to
      // `saved_listing`'s own `id` column instead of the outer listing (same gotcha as the heroThumbKey /
      // isPublished subqueries above). `callerUserId` binds as a parameter.
      isSaved: sql<boolean>`exists (
        select 1 from ${savedListings} s
        where s.listing_id = "listing".id and s.user_id = ${callerUserId})`,
    })
    .from(listings)
    .where(eq(listings.id, id));
  if (!row) return undefined;
  const [rental, media, content] = await Promise.all([
    db.select().from(listingRental).where(eq(listingRental.listingId, id)),
    db
      .select()
      .from(listingMedia)
      .where(eq(listingMedia.listingId, id))
      .orderBy(sql`${listingMedia.heroIndex} asc nulls last`, listingMedia.id),
    db.select().from(listingContent).where(eq(listingContent.listingId, id)),
  ]);
  return {
    listing: row.listing,
    lat: row.lat,
    lon: row.lon,
    monthlyRent: rental[0]?.monthlyRent ?? null,
    isSaved: row.isSaved,
    media: media.map((m) => ({
      s3Key: m.s3Key,
      thumbKey: m.thumbKey,
      kind: m.kind,
      heroIndex: m.heroIndex,
    })),
    content: content.map((c) => ({
      lang: c.lang,
      headline: c.headline,
      description: c.description,
    })),
  };
}
