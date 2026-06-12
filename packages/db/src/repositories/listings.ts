import type { Listing } from "@line-robot/domain";
import { eq, sql } from "drizzle-orm";
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
