import type {
  Amenity,
  ContentLang,
  DealType,
  FurnishingStatus,
  Listing,
  ListingType,
  MediaKind,
  PropertyType,
  SaleCondition,
} from "@line-robot/domain";
import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import {
  listingAmenities,
  listingCondo,
  listingContent,
  listingEvents,
  listingMedia,
  listingRental,
  listings,
  moderationItems,
  priceHistory,
  publishConsents,
} from "../schema.ts";

export type NewListing = typeof listings.$inferInsert;
export type ListingRow = typeof listings.$inferSelect;

// D3.8 drift guard: the storage row must satisfy the canonical domain entity.
// If this line errors, the schema and @line-robot/domain Listing diverged —
// fix the domain type (or the schema), never redefine Listing downstream.
const _listingRowSatisfiesDomain: Listing = {} as ListingRow;
void _listingRowSatisfiesDomain;
export type NewListingContent = typeof listingContent.$inferInsert;
export type NewListingCondo = typeof listingCondo.$inferInsert;
export type NewListingRental = typeof listingRental.$inferInsert;
export type NewListingMedia = typeof listingMedia.$inferInsert;
export type NewListingAmenity = typeof listingAmenities.$inferInsert;

export interface ListingAggregate {
  listing: NewListing;
  content: Array<Omit<NewListingContent, "listingId">>;
  condo?: Omit<NewListingCondo, "listingId">;
  rental?: Omit<NewListingRental, "listingId">;
  media?: Array<Omit<NewListingMedia, "listingId">>;
  amenities?: Array<NewListingAmenity["amenity"]>;
}

/** Insert a listing with its 1:1/1:N satellites in one transaction; records the opening price. */
export async function createListing(db: Db, agg: ListingAggregate): Promise<ListingRow> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(listings).values(agg.listing).returning();
    if (!created) throw new Error("listing insert returned no row");
    const listingId = created.id;
    if (agg.content.length > 0) {
      await tx.insert(listingContent).values(agg.content.map((c) => ({ ...c, listingId })));
    }
    if (agg.condo) await tx.insert(listingCondo).values({ ...agg.condo, listingId });
    if (agg.rental) await tx.insert(listingRental).values({ ...agg.rental, listingId });
    if (agg.media && agg.media.length > 0) {
      await tx.insert(listingMedia).values(agg.media.map((m) => ({ ...m, listingId })));
    }
    if (agg.amenities && agg.amenities.length > 0) {
      await tx
        .insert(listingAmenities)
        .values(agg.amenities.map((amenity) => ({ amenity, listingId })));
    }
    if (created.priceThb !== null) {
      await tx
        .insert(priceHistory)
        .values({ listingId, priceThb: created.priceThb, reason: "new" });
    }
    return created;
  });
}

export async function getListing(db: Db, id: string): Promise<ListingRow | undefined> {
  const rows = await db.select().from(listings).where(eq(listings.id, id));
  return rows[0];
}

export async function listListings(db: Db, limit = 50): Promise<ListingRow[]> {
  return db.select().from(listings).limit(limit);
}

export async function getContent(db: Db, listingId: string) {
  return db.select().from(listingContent).where(eq(listingContent.listingId, listingId));
}

/** PostGIS radius search: listings within `radiusM` metres of (lon, lat). */
export async function findListingsNear(
  db: Db,
  lon: number,
  lat: number,
  radiusM: number,
): Promise<ListingRow[]> {
  return db
    .select()
    .from(listings)
    .where(
      sql`ST_DWithin(${listings.geom}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography, ${radiusM})`,
    );
}

/** Dedup block pool row (stage-2 D2.6): coordinates unpacked from PostGIS. */
export interface DedupPoolRow {
  id: string;
  deedNo: string | null;
  lat: number | null;
  lon: number | null;
  landmark: string | null;
  tambon: string | null;
  amphoe: string | null;
  province: string | null;
  propertyType: string;
  priceThb: number | null;
}

export async function listDedupPool(db: Db, limit = 500): Promise<DedupPoolRow[]> {
  return db
    .select({
      id: listings.id,
      deedNo: listings.deedNo,
      lat: sql<number | null>`ST_Y(${listings.geom}::geometry)`,
      lon: sql<number | null>`ST_X(${listings.geom}::geometry)`,
      landmark: listings.landmark,
      tambon: listings.tambon,
      amphoe: listings.amphoe,
      province: listings.province,
      propertyType: listings.propertyType,
      priceThb: listings.priceThb,
    })
    .from(listings)
    .limit(limit);
}

/** D11: queue a target for human review. */
export async function createModerationItem(
  db: Db,
  targetType: "listing" | "merge_request",
  targetId: string,
  reason: string,
): Promise<void> {
  await db.insert(moderationItems).values({ targetType, targetId, reason });
}

/** Price change with audit trail (price_history). */
export async function changePrice(
  db: Db,
  listingId: string,
  priceThb: number,
  reason: "reduced" | "corrected",
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(listings)
      .set({ priceThb, updatedAt: sql`now()` })
      .where(eq(listings.id, listingId));
    await tx.insert(priceHistory).values({ listingId, priceThb, reason });
  });
}

/** LEGAL-02: a listing is publicly visible ONLY while a consent row exists without a deletion request. */
export async function grantPublishConsent(
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

export interface PublicSearch {
  lang: "th" | "en";
  dealType?: DealType;
  propertyType?: PropertyType;
  province?: string;
  /** DIST-01/COMP-05: provenance facet (e.g. `npa` = bank-owned stock). */
  listingType?: ListingType;
  /** COMP-06: new-vs-resale facet. */
  saleCondition?: SaleCondition;
  /** Free-text query over landmark + content (trigram-indexed ILIKE). */
  text?: string;
  /** 1-based. */
  page?: number;
  pageSize?: number;
}

export interface PublicCardRow {
  listing: ListingRow;
  /** Requested-lang headline, th fallback (en content may not exist yet). */
  headline: string;
  photoCount: number;
  monthlyRent: number | null;
  /** TH-03: the human trust signal on every card. */
  posterName: string;
  /** S3 key of the hero photo's 640px thumb (CONV-02 hero order), or null when no photo has a
   * derivative yet — the website presigns this at render time. v2-lite rows predate the thumb. */
  heroThumbKey: string | null;
}

const publiclyVisible = sql`exists (
  select 1 from ${publishConsents} pc
  where pc.listing_id = ${listings.id} and pc.deletion_requested_at is null
)`;

// Requested-lang listing_content column with th fallback (en rows may not exist yet).
// NOTE: the outer correlation is written as "listing".id LITERALLY — drizzle renders
// ${listings.id} UNQUALIFIED inside projection subqueries, and listing_content /
// listing_media have their own id columns that would capture the reference.
const localizedContent = (
  column: "headline" | "description",
  lang: "th" | "en",
) => sql<string>`coalesce(
  (select c.${sql.raw(column)} from ${listingContent} c where c.listing_id = "listing".id and c.lang = ${lang} limit 1),
  (select c.${sql.raw(column)} from ${listingContent} c where c.listing_id = "listing".id and c.lang = 'th' limit 1),
  '')`;
const photoCountSql = sql<number>`(select count(*)::int from ${listingMedia} m where m.listing_id = "listing".id and m.kind = 'photo')`;
const monthlyRentSql = sql<
  number | null
>`(select r.monthly_rent::int from ${listingRental} r where r.listing_id = "listing".id)`;
const posterNameSql = sql<string>`coalesce((select u.display_name from "user" u where u.id = ${listings.ownerUserId}), '')`;
// Hero thumb (CONV-02): the lowest-hero_index photo that actually has a 640px derivative. NULL when
// the listing has no photo or none have been re-derived yet (v2-lite). Same "listing".id literal
// correlation gotcha as localizedContent — listing_media has its own id column.
const heroThumbKeySql = sql<string | null>`(
  select m.thumb_key from ${listingMedia} m
  where m.listing_id = "listing".id and m.kind = 'photo' and m.thumb_key is not null
  order by m.hero_index asc nulls last, m.id asc limit 1)`;

/** Browse/search for the public website: consented listings only (LEGAL-02), newest first. */
export async function searchPublicListings(
  db: Db,
  q: PublicSearch,
): Promise<{ rows: PublicCardRow[]; total: number; page: number }> {
  const conditions = [publiclyVisible];
  if (q.dealType) conditions.push(eq(listings.dealType, q.dealType));
  if (q.propertyType) conditions.push(eq(listings.propertyType, q.propertyType));
  if (q.province) conditions.push(eq(listings.province, q.province));
  if (q.listingType) conditions.push(eq(listings.listingType, q.listingType));
  if (q.saleCondition) conditions.push(eq(listings.saleCondition, q.saleCondition));
  if (q.text && q.text.trim() !== "") {
    // Escape ILIKE metacharacters — user text must never act as a wildcard.
    const pattern = `%${q.text.trim().replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
    conditions.push(sql`(${listings.landmark} ilike ${pattern}
      or ${listings.projectName} ilike ${pattern}
      or exists (select 1 from ${listingContent} c where c.listing_id = ${listings.id}
        and (c.headline ilike ${pattern} or c.description ilike ${pattern})))`);
  }
  const where = and(...conditions);

  const pageSize = q.pageSize ?? 24;

  const [counted] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(listings)
    .where(where);
  const total = counted?.total ?? 0;
  // Clamp out-of-range deep links to the last real page instead of a dead-end empty page.
  const lastPage = Math.max(Math.ceil(total / pageSize), 1);
  const page = Math.min(Math.max(q.page ?? 1, 1), lastPage);
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select({
      listing: listings,
      headline: localizedContent("headline", q.lang),
      photoCount: photoCountSql,
      monthlyRent: monthlyRentSql,
      posterName: posterNameSql,
      heroThumbKey: heroThumbKeySql,
    })
    .from(listings)
    .where(where)
    .orderBy(desc(listings.createdAt), desc(listings.id))
    .limit(pageSize)
    .offset(offset);

  return { rows, total, page };
}

/** The `listing_condo` satellite a public detail page renders (FIELD-04/05), or null when absent. */
export type PublicCondoDetail = Pick<
  typeof listingCondo.$inferSelect,
  | "camFeePerSqmMonth"
  | "sinkingFundPerSqm"
  | "foreignQuotaAvailable"
  | "projectForeignQuotaPct"
  | "quotaBucket"
>;

/** The `listing_rental` satellite a public detail page renders (DEAL-11/FIELD-08/12), or null when
 * absent. `monthlyRent` stays on the parent DTO (it frames the price); this is the rest of the lease. */
export type PublicRentalDetail = Pick<
  typeof listingRental.$inferSelect,
  | "depositMonths"
  | "advanceMonths"
  | "minLeaseMonths"
  | "petsAllowed"
  | "furnishingStatus"
  | "furnishingNotes"
  | "utilityRateType"
>;

export interface PublicListingDetail {
  listing: ListingRow;
  /** Requested-lang content with th fallback. */
  headline: string;
  description: string;
  photoCount: number;
  monthlyRent: number | null;
  posterName: string;
  lat: number | null;
  lon: number | null;
  /** Photo thumbs for the gallery, in hero order (CONV-02/03) — only photos with a 640px derivative.
   * Empty until the listing's images have been re-derived (v2-lite rows have none). */
  photos: Array<{ thumbKey: string }>;
  /** Condo-specific lease/quota fields (FIELD-04/05); null for non-condos / condos without the row. */
  condo: PublicCondoDetail | null;
  /** Rental lease terms beyond the monthly rent (DEAL-11/FIELD-08/12); null for non-rentals. */
  rental: PublicRentalDetail | null;
}

/** Detail fetch for the public website — same LEGAL-02 gate as search; undefined = not public. */
export async function getPublicListingDetail(
  db: Db,
  id: string,
  lang: "th" | "en",
): Promise<PublicListingDetail | undefined> {
  const [row] = await db
    .select({
      listing: listings,
      headline: localizedContent("headline", lang),
      description: localizedContent("description", lang),
      photoCount: photoCountSql,
      monthlyRent: monthlyRentSql,
      posterName: posterNameSql,
      lat: sql<number | null>`ST_Y(${listings.geom}::geometry)`,
      lon: sql<number | null>`ST_X(${listings.geom}::geometry)`,
    })
    .from(listings)
    .where(and(eq(listings.id, id), publiclyVisible));
  if (!row) return undefined;
  // The LEGAL-02 gate above already gated the listing, so these are unguarded child fetches (like
  // getListingForBot). The gallery (CONV-03) = photo thumbs in hero order, derivative-bearing only;
  // the condo/rental satellites carry the dedicated detail fields (4.8).
  const [media, condoRows, rentalRows] = await Promise.all([
    db
      .select({ thumbKey: listingMedia.thumbKey })
      .from(listingMedia)
      .where(
        and(
          eq(listingMedia.listingId, id),
          eq(listingMedia.kind, "photo"),
          sql`${listingMedia.thumbKey} is not null`,
        ),
      )
      .orderBy(sql`${listingMedia.heroIndex} asc nulls last`, listingMedia.id),
    db
      .select({
        camFeePerSqmMonth: listingCondo.camFeePerSqmMonth,
        sinkingFundPerSqm: listingCondo.sinkingFundPerSqm,
        foreignQuotaAvailable: listingCondo.foreignQuotaAvailable,
        projectForeignQuotaPct: listingCondo.projectForeignQuotaPct,
        quotaBucket: listingCondo.quotaBucket,
      })
      .from(listingCondo)
      .where(eq(listingCondo.listingId, id)),
    db
      .select({
        depositMonths: listingRental.depositMonths,
        advanceMonths: listingRental.advanceMonths,
        minLeaseMonths: listingRental.minLeaseMonths,
        petsAllowed: listingRental.petsAllowed,
        furnishingStatus: listingRental.furnishingStatus,
        furnishingNotes: listingRental.furnishingNotes,
        utilityRateType: listingRental.utilityRateType,
      })
      .from(listingRental)
      .where(eq(listingRental.listingId, id)),
  ]);
  const photos = media.map((m) => ({ thumbKey: m.thumbKey as string }));
  return { ...row, photos, condo: condoRows[0] ?? null, rental: rentalRows[0] ?? null };
}

/** Sitemap feed: ids + lastmod of every publicly visible listing (LEGAL-02 gate). */
export async function listPublicListingIds(
  db: Db,
): Promise<Array<{ id: string; updatedAt: Date }>> {
  return (
    db
      .select({ id: listings.id, updatedAt: listings.updatedAt })
      .from(listings)
      .where(publiclyVisible)
      .orderBy(desc(listings.createdAt))
      // Sitemap protocol caps a file at 50k URLs; cap at 10k and revisit with a
      // sitemap index when the catalog approaches it (newest listings win meanwhile).
      .limit(10_000)
  );
}

/** Distinct provinces with publicly visible stock — feeds the browse filter chips. */
export async function listPublicProvinces(db: Db): Promise<string[]> {
  const rows = await db
    .selectDistinct({ province: listings.province })
    .from(listings)
    .where(and(publiclyVisible, sql`${listings.province} is not null`))
    .orderBy(listings.province);
  return rows.map((r) => r.province).filter((p): p is string => p !== null);
}

// ---------------------------------------------------------------------------
// Bot catalog reads/writes — the slice the LINE bot's Postgres `PropertyStore`
// maps onto its `Property` domain type after the v2 catalog cutover (the bot
// reads the same listings the website and pipeline write). Kept here because
// they operate on the listing aggregate; the listing↔Property mapping itself
// lives in the bot adapter (Property is a bot type, not a db type).
// ---------------------------------------------------------------------------

/** A listing plus the satellite rows the bot's `Property` view needs, with geom unpacked to lat/lon
 * (the bot never parses PostGIS EWKB). `null` satellites = absent. */
export interface BotListingRead {
  listing: ListingRow;
  lat: number | null;
  lon: number | null;
  monthlyRent: number | null;
  furnishingStatus: FurnishingStatus | null;
  media: Array<{ s3Key: string; kind: MediaKind; heroIndex: number | null }>;
  content: Array<{ lang: ContentLang; headline: string; description: string }>;
  amenities: Amenity[];
}

/** Full read of one listing for the bot, or undefined if it doesn't exist. */
export async function getListingForBot(db: Db, id: string): Promise<BotListingRead | undefined> {
  const [row] = await db
    .select({
      listing: listings,
      lat: sql<number | null>`ST_Y(${listings.geom}::geometry)`,
      lon: sql<number | null>`ST_X(${listings.geom}::geometry)`,
    })
    .from(listings)
    .where(eq(listings.id, id));
  if (!row) return undefined;
  const [rental, media, content, amenities] = await Promise.all([
    db.select().from(listingRental).where(eq(listingRental.listingId, id)),
    db.select().from(listingMedia).where(eq(listingMedia.listingId, id)),
    db.select().from(listingContent).where(eq(listingContent.listingId, id)),
    db.select().from(listingAmenities).where(eq(listingAmenities.listingId, id)),
  ]);
  return {
    listing: row.listing,
    lat: row.lat,
    lon: row.lon,
    monthlyRent: rental[0]?.monthlyRent ?? null,
    furnishingStatus: rental[0]?.furnishingStatus ?? null,
    media: media.map((m) => ({ s3Key: m.s3Key, kind: m.kind, heroIndex: m.heroIndex })),
    content: content.map((c) => ({
      lang: c.lang,
      headline: c.headline,
      description: c.description,
    })),
    amenities: amenities.map((a) => a.amenity),
  };
}

/** Listing ids owned by a user — the bot scopes "this conversation's properties" by owner (the
 * single-owner v2 model: a conversation's pseudo-user owns the listings extracted from it). */
export async function listListingIdsByOwner(db: Db, ownerUserId: string): Promise<string[]> {
  const rows = await db
    .select({ id: listings.id })
    .from(listings)
    .where(eq(listings.ownerUserId, ownerUserId));
  return rows.map((r) => r.id);
}

/** Patch listing columns (free-text edit / merge). No-op on an empty patch; always bumps updatedAt. */
export async function updateListingFields(
  db: Db,
  id: string,
  patch: Partial<NewListing>,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  await db
    .update(listings)
    .set({ ...patch, updatedAt: sql`now()` })
    .where(eq(listings.id, id));
}

/** Set a rent listing's monthly rent (the rent edit path), only if a rental satellite exists. */
export async function updateRentalMonthlyRent(
  db: Db,
  id: string,
  monthlyRent: number,
): Promise<void> {
  await db.update(listingRental).set({ monthlyRent }).where(eq(listingRental.listingId, id));
}

/** Delete a listing and every satellite `createListing` can write, plus its follow-up events, in one
 * transaction (the FKs are no-cascade). Scope = bot-managed listings (pipeline-extracted, not yet
 * published / engaged); Stage 5/6 engagement tables aren't populated for these and aren't touched. */
export async function deleteListingCascade(db: Db, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(listingEvents).where(eq(listingEvents.listingId, id));
    await tx.delete(listingMedia).where(eq(listingMedia.listingId, id));
    await tx.delete(listingContent).where(eq(listingContent.listingId, id));
    await tx.delete(listingAmenities).where(eq(listingAmenities.listingId, id));
    await tx.delete(listingCondo).where(eq(listingCondo.listingId, id));
    await tx.delete(listingRental).where(eq(listingRental.listingId, id));
    await tx.delete(priceHistory).where(eq(priceHistory.listingId, id));
    await tx.delete(listings).where(eq(listings.id, id));
  });
}
