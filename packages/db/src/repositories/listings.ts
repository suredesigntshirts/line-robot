import type { DealType, Listing, PropertyType } from "@line-robot/domain";
import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import {
  listingAmenities,
  listingCondo,
  listingContent,
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

/** Browse/search for the public website: consented listings only (LEGAL-02), newest first. */
export async function searchPublicListings(
  db: Db,
  q: PublicSearch,
): Promise<{ rows: PublicCardRow[]; total: number; page: number }> {
  const conditions = [publiclyVisible];
  if (q.dealType) conditions.push(eq(listings.dealType, q.dealType));
  if (q.propertyType) conditions.push(eq(listings.propertyType, q.propertyType));
  if (q.province) conditions.push(eq(listings.province, q.province));
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
    })
    .from(listings)
    .where(where)
    .orderBy(desc(listings.createdAt), desc(listings.id))
    .limit(pageSize)
    .offset(offset);

  return { rows, total, page };
}

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
  return row;
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
