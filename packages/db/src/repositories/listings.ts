import type {
  Amenity,
  ContentLang,
  DealType,
  FurnishingStatus,
  Listing,
  ListingMandate,
  ListingType,
  MediaKind,
  PropertyType,
  SaleCondition,
  Urgency,
} from "@line-robot/domain";
import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import {
  listingAmenities,
  listingCondo,
  listingContent,
  listingEvents,
  listingMedia,
  listingNotes,
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

/** The one PostGIS "within `radiusM` metres of (lon, lat)" predicate — shared by `findListingsNear`
 * and the public `searchPublicListings` radius branch so the spatial logic lives in one place.
 * `geography` args make `radiusM` metres (SRID 4326); the spatial GiST index gates the scan. */
const withinRadius = (lon: number, lat: number, radiusM: number) =>
  sql`ST_DWithin(${listings.geom}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography, ${radiusM})`;

/** PostGIS radius search: listings within `radiusM` metres of (lon, lat). Low-level primitive —
 * it does NOT apply the LEGAL-02 publish-consent gate, so it must never back a public read. The
 * public website uses `searchPublicListings({ near })`, which layers consent + projection + order. */
export async function findListingsNear(
  db: Db,
  lon: number,
  lat: number,
  radiusM: number,
): Promise<ListingRow[]> {
  return db
    .select()
    .from(listings)
    .where(withinRadius(lon, lat, radiusM));
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

/** CONV-08: geographic radius search (the map/geolocation fast-follow over list-first browse).
 * Listings within `radiusM` metres of (lon, lat); composes with the structured/text filters and
 * orders the result set by ascending distance. PostGIS `ST_DWithin`/`ST_Distance` on the geography
 * column (metres, SRID 4326) — the same primitive the dedup blocker uses. */
export interface GeoNear {
  lat: number;
  lon: number;
  radiusM: number;
}

/** 4.3 contextual price bracket: THB bounds (`min` inclusive, `max` exclusive; `max` null =
 * open-ended). The bracket applies to the asking price (`listing.price_thb`) on a sale / no-deal
 * search and to the monthly rent (`listing_rental.monthly_rent`) on a rent search — `dealType`
 * selects the column. A null price never matches a bracket (SQL `>=` against null is not true). */
export interface PriceBandFilter {
  min: number;
  max: number | null;
}

/** Result order for the public browse. `newest` (default) or asking-price / monthly-rent order —
 * the price column follows the deal context like the price bracket does. A radius search stays
 * nearest-first unless a sort is given explicitly. */
export type PublicSort = "newest" | "price_asc" | "price_desc";

export interface PublicSearch {
  lang: "th" | "en";
  sort?: PublicSort;
  /** Minimum bedrooms (COMP: the bedrooms facet every Thai portal ships). */
  minBedrooms?: number;
  dealType?: DealType;
  propertyType?: PropertyType;
  province?: string;
  /** MKT-04 district-level filter (composes with `province`). */
  amphoe?: string;
  /** DIST-01/COMP-05: provenance facet (e.g. `npa` = bank-owned stock). */
  listingType?: ListingType;
  /** COMP-06: new-vs-resale facet. */
  saleCondition?: SaleCondition;
  /** Free-text query over landmark + content (trigram-indexed ILIKE). */
  text?: string;
  /** 4.3 price bracket — applied to `price_thb` (sale / no deal) or `monthly_rent` (rent). */
  priceBand?: PriceBandFilter;
  /** CONV-08 radius search: restrict to listings within `radiusM` of (lon, lat), nearest first. */
  near?: GeoNear;
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
  /** CONV-08: metres from the search point on a radius search, rounded; null on a non-radius search.
   * The card formats this into a short distance line (e.g. "ห่าง 2.1 กม."). */
  distanceM: number | null;
  /** Latitude (SRID 4326), null when the listing has no geom — feeds the results map pins. */
  lat: number | null;
  /** Longitude (SRID 4326), null when the listing has no geom. */
  lon: number | null;
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

const latSql = sql<number | null>`ST_Y(${listings.geom}::geometry)`;
const lonSql = sql<number | null>`ST_X(${listings.geom}::geometry)`;

// 4.3: the price-bracket predicate over a price expression (asking price or monthly rent). `min`
// inclusive, `max` exclusive; an open-ended bracket (`max` null) drops the upper bound. A NULL
// price column never satisfies `>= min` (SQL three-valued logic), so unpriced listings are
// excluded from every bracket — correct: a listing with no stated price isn't "under ฿1M".
const priceBandPredicate = (priceExpr: ReturnType<typeof sql>, band: PriceBandFilter) =>
  band.max === null
    ? sql`${priceExpr} >= ${band.min}`
    : sql`${priceExpr} >= ${band.min} and ${priceExpr} < ${band.max}`;

/** Browse/search for the public website: consented listings only (LEGAL-02). Newest first, unless a
 * radius (`near`) is given — then nearest first (CONV-08). All filters AND-compose with the radius. */
export async function searchPublicListings(
  db: Db,
  q: PublicSearch,
): Promise<{ rows: PublicCardRow[]; total: number; page: number }> {
  const conditions = [publiclyVisible];
  if (q.dealType) conditions.push(eq(listings.dealType, q.dealType));
  if (q.propertyType) conditions.push(eq(listings.propertyType, q.propertyType));
  if (q.province) conditions.push(eq(listings.province, q.province));
  if (q.amphoe) conditions.push(eq(listings.amphoe, q.amphoe));
  if (q.minBedrooms !== undefined && q.minBedrooms > 0) {
    conditions.push(sql`${listings.bedrooms} >= ${q.minBedrooms}`);
  }
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
  // 4.3: the contextual price bracket — rent filters the monthly rent (the satellite, via the same
  // `monthlyRentSql` subquery the projection uses; its `::int` cast is harmless for a `>=`/`<`
  // comparison), sale and the "no deal type chosen" case filter the asking price column. The caller
  // (the website) only ever builds a rent bracket alongside `dealType: "rent"`, so the column always
  // matches the bracket.
  if (q.priceBand) {
    const priceExpr = q.dealType === "rent" ? monthlyRentSql : sql`${listings.priceThb}`;
    conditions.push(priceBandPredicate(priceExpr, q.priceBand));
  }
  // CONV-08: radius constraint (the shared `withinRadius` predicate) + the distance expression
  // (metres) reused by the projection + ORDER BY. The spatial GiST index gates the result set,
  // then ST_Distance ranks it. Numbers are bound as parameters (never string-interpolated).
  const searchPoint =
    q.near && sql`ST_SetSRID(ST_MakePoint(${q.near.lon}, ${q.near.lat}), 4326)::geography`;
  const distanceSql = searchPoint
    ? sql<number | null>`round(ST_Distance(${listings.geom}, ${searchPoint})::numeric)::int`
    : sql<number | null>`null`;
  if (q.near) {
    conditions.push(withinRadius(q.near.lon, q.near.lat, q.near.radiusM));
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

  // Explicit price sort wins; else nearest-first on a radius search (the natural order for "near
  // me"); else newest-first. Unpriced rows sink to the end of a price sort. The price expression
  // follows the deal context (monthly rent for rent searches), like the bracket filter above.
  const sortPriceExpr = q.dealType === "rent" ? monthlyRentSql : sql`${listings.priceThb}`;
  const order =
    q.sort === "price_asc"
      ? [sql`${sortPriceExpr} asc nulls last`, desc(listings.id)]
      : q.sort === "price_desc"
        ? [sql`${sortPriceExpr} desc nulls last`, desc(listings.id)]
        : q.near
          ? [sql`${distanceSql} asc`, desc(listings.id)]
          : [desc(listings.createdAt), desc(listings.id)];

  const rows = await db
    .select({
      listing: listings,
      headline: localizedContent("headline", q.lang),
      photoCount: photoCountSql,
      monthlyRent: monthlyRentSql,
      posterName: posterNameSql,
      heroThumbKey: heroThumbKeySql,
      distanceM: distanceSql,
      lat: latSql,
      lon: lonSql,
    })
    .from(listings)
    .where(where)
    .orderBy(...order)
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
      lat: latSql,
      lon: lonSql,
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

/** Public-catalog facets for the home page: total stock, per-property-type counts (the "browse by
 * type" tiles) and the busiest districts (the "popular areas" chips). One LEGAL-02-gated pass each —
 * consented listings only, so the numbers match what a visitor can actually open. */
export interface PublicFacets {
  total: number;
  byPropertyType: Array<{ propertyType: PropertyType; count: number }>;
  /** Busiest province+amphoe pairs, most listings first (capped — chips, not a directory). */
  byArea: Array<{ province: string; amphoe: string | null; count: number }>;
}

export async function publicListingFacets(db: Db, areaLimit = 12): Promise<PublicFacets> {
  const countSql = sql<number>`count(*)::int`;
  const [byPropertyType, areas] = await Promise.all([
    db
      .select({ propertyType: listings.propertyType, count: countSql })
      .from(listings)
      .where(publiclyVisible)
      .groupBy(listings.propertyType)
      .orderBy(sql`count(*) desc`, listings.propertyType),
    db
      .select({ province: listings.province, amphoe: listings.amphoe, count: countSql })
      .from(listings)
      .where(and(publiclyVisible, sql`${listings.province} is not null`))
      .groupBy(listings.province, listings.amphoe)
      .orderBy(sql`count(*) desc`, listings.province, listings.amphoe)
      .limit(areaLimit),
  ]);
  const total = byPropertyType.reduce((n, row) => n + row.count, 0);
  return {
    total,
    byPropertyType,
    byArea: areas.map((a) => ({
      province: a.province as string,
      amphoe: a.amphoe,
      count: a.count,
    })),
  };
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

/**
 * Patch listing columns (free-text edit / merge). No-op on an empty patch; always bumps updatedAt.
 * CAUTION: this does NOT allowlist or validate fields — it writes whatever `patch` it is handed.
 * Callers must allowlist + sanitize (the api's `handleEdit` enforces EDITABLE_*_FIELDS + non-negativity).
 */
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

/** Stage 6 (D10/D-S6-6): set a listing's urgency flag (the claimant marks a quick-sale). The matched
 * Flex push to vetted users is the bot sweep's job (INC-B4) — this only persists the flag. Typed to
 * the `urgency` enum so a bad value can't be written; bumps `updated_at` like the other field writes. */
export async function setListingUrgency(db: Db, id: string, urgency: Urgency): Promise<void> {
  await db.update(listings).set({ urgency, updatedAt: sql`now()` }).where(eq(listings.id, id));
}

/** Stage 6 (D-S6-4 release-to-other-groups): set a listing's `listing_mandate`. The poster's
 * "release to other groups" decision drops the `group_exclusive` mandate to `open` so the listing is
 * no longer pinned to its source group (the membership gate still controls visibility — no per-target
 * plumbing v1). Typed to the `listing_mandate` enum; bumps `updated_at` like the other field writes. */
export async function setListingMandate(
  db: Db,
  id: string,
  mandate: ListingMandate,
): Promise<void> {
  await db
    .update(listings)
    .set({ listingMandate: mandate, updatedAt: sql`now()` })
    .where(eq(listings.id, id));
}

// ---------------------------------------------------------------------------
// Stage 6 (D10/D-S6-6) — the quick-quote Flex push (INC-B4, bot sweep side). A claimant flags a
// listing `urgency='quick_sale'`; the dealflow sweep scans the un-pushed quick-sale set, matches the
// approved-vetted candidates (matchVettedUsers in @line-robot/domain), and Flex-pushes each match a
// deep link to the quote screen — exactly once, guarded by `quick_sale_pushed_at` (mirrors the
// `claim_invited_at` one-shot guard). The matching `amountThb` is the asking price for a sale and the
// monthly rent for a rent listing — the same column convention as the public search's price bracket.
// ---------------------------------------------------------------------------

/** A quick-sale listing the dealflow sweep should push: the facts `matchVettedUsers` needs (province,
 * type, dealType, the matching amount) plus the id + a title for the Flex card. `amountThb` is the
 * asking price (sale) or the monthly rent (rent). Only rows with a non-null matching amount + province
 * are returned (a price-less / province-less listing can't be price-band/province matched). */
export interface QuickSaleCandidate {
  listingId: string;
  province: string;
  propertyType: PropertyType;
  dealType: DealType;
  amountThb: number;
  /** The th headline for the push card, or '' when there's no th content row. */
  headline: string;
}

/**
 * Mark a listing's quick-quote Flex push as sent (the one-shot `quick_sale_pushed_at` guard, mirroring
 * `markClaimInvited`). Sets the timestamp only while it is still NULL, so a re-sweep can't re-push;
 * returns true iff THIS call set it (`firstPush`). The conditional UPDATE is the lock — Postgres
 * serialises it per row, so of two overlapping sweeps exactly one wins the push.
 */
export async function markQuickSalePushed(db: Db, listingId: string, at: Date): Promise<boolean> {
  const updated = await db
    .update(listings)
    .set({ quickSalePushedAt: at })
    .where(and(eq(listings.id, listingId), sql`${listings.quickSalePushedAt} is null`))
    .returning({ id: listings.id });
  return updated.length === 1;
}

/**
 * The quick-sale listings still awaiting their Flex push: `urgency='quick_sale'`, `quick_sale_pushed_at
 * IS NULL`, with a non-null province and a non-null matching amount (a price-less listing can't be
 * price-band matched, so it's excluded — the sweep also defends in code). The matching amount is the
 * asking price for a sale and the monthly rent (from the `listing_rental` satellite) for a rent listing.
 */
export async function listQuickSaleUnpushed(db: Db): Promise<QuickSaleCandidate[]> {
  // A `bigint` (priceThb / monthlyRent) comes back from pg as a STRING — the `case` expression isn't
  // covered by drizzle's `mode: "number"` coercion, so it's typed string|null here and Number()-coerced
  // below (NULL → null preserved). Casting to `::int` would silently overflow a >2.1B THB price.
  const amountThb = sql<
    string | null
  >`case when ${listings.dealType} = 'rent' then ${listingRental.monthlyRent} else ${listings.priceThb} end`;
  const rows = await db
    .select({
      listingId: listings.id,
      province: listings.province,
      propertyType: listings.propertyType,
      dealType: listings.dealType,
      amountThb,
      // th headline for the push card; correlated subquery so a content-less listing still surfaces.
      headline: sql<string | null>`(
        select c.headline from ${listingContent} c
        where c.listing_id = ${listings.id} and c.lang = 'th' limit 1)`,
    })
    .from(listings)
    .leftJoin(listingRental, eq(listingRental.listingId, listings.id))
    .where(
      and(
        eq(listings.urgency, "quick_sale"),
        sql`${listings.quickSalePushedAt} is null`,
        sql`${listings.province} is not null`,
      ),
    );
  // Keep only rows with a non-null matching amount + province (the price-band/province match needs both).
  const out: QuickSaleCandidate[] = [];
  for (const r of rows) {
    if (r.amountThb === null || r.province === null) continue;
    out.push({
      listingId: r.listingId,
      province: r.province,
      propertyType: r.propertyType,
      dealType: r.dealType,
      amountThb: Number(r.amountThb),
      headline: r.headline ?? "",
    });
  }
  return out;
}

/** Delete a listing and every satellite that has a no-cascade FK to it, in one transaction. Scope =
 * bot-managed listings (pipeline-extracted). `listing_note` (Stage 5 per-user CRM) is deleted here
 * because a listing can accrue notes independently of being claimed, so the bot's delete must not
 * FK-violate on it.
 *
 * NOTE: `saved_listing`, `viewing`, and `publish_consent` also FK to `listing` (no-cascade). They are
 * NOT populated for the pipeline-extracted listings this path deletes, so they're intentionally
 * omitted — but any future delete path that can run after a listing is saved/booked/published MUST add
 * the matching deletes here (or the transaction will FK-violate). */
export async function deleteListingCascade(db: Db, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(listingEvents).where(eq(listingEvents.listingId, id));
    await tx.delete(listingNotes).where(eq(listingNotes.listingId, id));
    await tx.delete(listingMedia).where(eq(listingMedia.listingId, id));
    await tx.delete(listingContent).where(eq(listingContent.listingId, id));
    await tx.delete(listingAmenities).where(eq(listingAmenities.listingId, id));
    await tx.delete(listingCondo).where(eq(listingCondo.listingId, id));
    await tx.delete(listingRental).where(eq(listingRental.listingId, id));
    await tx.delete(priceHistory).where(eq(priceHistory.listingId, id));
    await tx.delete(listings).where(eq(listings.id, id));
  });
}
