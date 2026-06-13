import {
  type BotListingRead,
  claimListingEventNotified,
  type Db,
  deleteEventsByListing,
  deleteListingCascade,
  ewktPoint,
  findDueListingEvents,
  findUserByIdentity,
  getListingForBot,
  insertListingEvent,
  type ListingEventRow,
  listEventsByListing,
  listListingIdsByOwner,
  type NewListing,
  type NewListingEvent,
  updateListingFields,
  updateRentalMonthlyRent,
} from "@line-robot/db";
import { dealType, type FurnishingStatus, type MediaKind, propertyType } from "@line-robot/domain";
import type {
  PhotoKind,
  Property,
  PropertyEvent,
  PropertyPhoto,
  PropertyUpsert,
} from "../../core/domain/catalog.js";
import type { PropertyStore } from "../../core/ports/catalog.js";

// ---------------------------------------------------------------------------
// The bot's PropertyStore backed by the v2 Postgres catalog (the catalog cutover — the bot now reads
// the same listings the website + pipeline write, instead of the frozen v1 DynamoDB catalog). Reads
// map `listing` (+satellites) → the bot `Property`; writes patch the listing columns. The
// conversation→property edge is implicit in the single-owner model, so link/unlink are no-ops and
// `listConversationProperties` resolves the owner. Follow-up events live in `listing_event`. The
// DynamoDB `ConversationStore` (tracker/membership/memory) is unchanged — they are paired by the
// CompositeCatalogRepository.
// ---------------------------------------------------------------------------

const PHOTO_KIND_BY_MEDIA: Record<MediaKind, PhotoKind> = {
  photo: "property",
  chanote: "chanote",
  floorplan: "other",
  render: "other",
};

const FURNISHING_LABEL: Record<FurnishingStatus, string> = {
  fully: "fully furnished",
  partly: "partly furnished",
  unfurnished: "unfurnished",
};

/** The bot's free-text land-area string from the structured rai/ngan/wah columns (zeros omitted). */
function landAreaString(
  rai: number | null,
  ngan: number | null,
  wah: number | null,
): string | undefined {
  const parts: string[] = [];
  if (rai) parts.push(`${rai} rai`);
  if (ngan) parts.push(`${ngan} ngan`);
  if (wah) parts.push(`${wah} wah`);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/**
 * Map a Postgres listing (+satellites) to the bot's `Property` view. `Property` fields with no
 * structured home in the v2 schema (contact, source, mapUrl, floors, originConversationKey) are
 * simply absent — the bot card omits them. Photos order by `heroIndex` (hero first). `notes` is the
 * primary-language description; `tags` are the amenities (the card's catch-all detail).
 */
export function listingReadToProperty(read: BotListingRead): Property {
  const l = read.listing;
  const isRent = l.dealType === "rent";
  const primary = read.content.find((c) => c.lang === "th") ?? read.content[0];
  const photos: PropertyPhoto[] = read.media
    .slice()
    .sort(
      (a, b) => (a.heroIndex ?? Number.MAX_SAFE_INTEGER) - (b.heroIndex ?? Number.MAX_SAFE_INTEGER),
    )
    .map((m) => ({ s3Key: m.s3Key, kind: PHOTO_KIND_BY_MEDIA[m.kind] }));
  const updatedAtMs = l.updatedAt.getTime();
  return {
    propertyId: l.id,
    projectName: l.projectName ?? undefined,
    normalizedAddress: l.addressDetail ?? l.landmark ?? undefined,
    rawAddresses: l.landmark ? [l.landmark] : undefined,
    province: l.province ?? undefined,
    district: l.amphoe ?? undefined,
    subdistrict: l.tambon ?? undefined,
    lat: read.lat ?? undefined,
    long: read.lon ?? undefined,
    propertyType: l.propertyType,
    listingType: l.dealType,
    status: (isRent ? l.rentalStatus : l.saleStage) ?? undefined,
    askingPrice: isRent ? undefined : (l.priceThb ?? undefined),
    rentPrice: isRent ? (read.monthlyRent ?? undefined) : undefined,
    currency: l.priceThb !== null || read.monthlyRent !== null ? "THB" : undefined,
    bedrooms: l.bedrooms ?? undefined,
    bathrooms: l.bathrooms ?? undefined,
    usableAreaSqm: l.floorAreaSqm ?? undefined,
    landArea: landAreaString(l.landRai, l.landNgan, l.landWah),
    furnishing: read.furnishingStatus ? FURNISHING_LABEL[read.furnishingStatus] : undefined,
    notes: primary?.description || undefined,
    tags: read.amenities.length > 0 ? read.amenities : undefined,
    chanote: l.deedNo
      ? {
          deedNumber: l.deedNo,
          ...(l.titleDeedType !== "unknown" ? { titleType: l.titleDeedType } : {}),
        }
      : undefined,
    photos: photos.length > 0 ? photos : undefined,
    createdAt: l.createdAt.getTime(),
    updatedAt: updatedAtMs,
    lastActivityAt: updatedAtMs,
  };
}

export interface ListingPatch {
  listing: Partial<NewListing>;
  monthlyRent?: number;
}

/**
 * Map a partial `PropertyUpsert` (free-text edit / merge) to a Postgres listing update. Only fields
 * with a structured column are written; enum fields are coerced and dropped when the free-text value
 * isn't a valid member, so a stray edit can never fail the write. `status` is intentionally NOT
 * mapped — the bot's lead vocab and the v2 saleStage/rentalStatus enums don't correspond.
 */
export function propertyUpsertToListingPatch(input: PropertyUpsert): ListingPatch {
  const listing: Partial<NewListing> = {};
  if (input.projectName !== undefined) listing.projectName = input.projectName;
  if (input.province !== undefined) listing.province = input.province;
  if (input.district !== undefined) listing.amphoe = input.district;
  if (input.subdistrict !== undefined) listing.tambon = input.subdistrict;
  if (input.bedrooms !== undefined) listing.bedrooms = input.bedrooms;
  if (input.bathrooms !== undefined) listing.bathrooms = input.bathrooms;
  if (input.usableAreaSqm !== undefined) listing.floorAreaSqm = input.usableAreaSqm;
  if (input.askingPrice !== undefined) listing.priceThb = input.askingPrice;
  if (input.lat !== undefined && input.long !== undefined) {
    listing.geom = ewktPoint(input.long, input.lat);
  }
  const pt = propertyType.safeParse(input.propertyType);
  if (pt.success) listing.propertyType = pt.data;
  const dt = dealType.safeParse(input.listingType);
  if (dt.success) listing.dealType = dt.data;

  const patch: ListingPatch = { listing };
  if (input.rentPrice !== undefined) patch.monthlyRent = input.rentPrice;
  return patch;
}

function toPropertyEvent(row: ListingEventRow): PropertyEvent {
  return {
    eventId: row.id,
    propertyId: row.listingId,
    dueAt: row.dueAt.getTime(),
    title: row.title ?? undefined,
    notifyConversationKey: row.notifyConversationKey,
    notifiedAt: row.notifiedAt?.getTime() ?? undefined,
    createdAt: row.createdAt.getTime(),
  };
}

function toNewListingEvent(event: PropertyEvent): NewListingEvent {
  return {
    id: event.eventId,
    listingId: event.propertyId,
    dueAt: new Date(event.dueAt),
    title: event.title ?? null,
    notifyConversationKey: event.notifyConversationKey,
    notifiedAt: event.notifiedAt !== undefined ? new Date(event.notifiedAt) : null,
  };
}

export class PostgresPropertyStore implements PropertyStore {
  constructor(private readonly db: Db) {}

  // --- Properties + Conv→Property edges ---

  async upsertProperty(input: PropertyUpsert): Promise<void> {
    const { listing, monthlyRent } = propertyUpsertToListingPatch(input);
    await updateListingFields(this.db, input.propertyId, listing);
    if (monthlyRent !== undefined) {
      await updateRentalMonthlyRent(this.db, input.propertyId, monthlyRent);
    }
  }

  async getProperty(propertyId: string): Promise<Property | null> {
    const read = await getListingForBot(this.db, propertyId);
    return read ? listingReadToProperty(read) : null;
  }

  async deleteProperty(propertyId: string): Promise<void> {
    await deleteListingCascade(this.db, propertyId);
  }

  async linkConversationProperty(): Promise<void> {
    // Single-owner v2 model: a listing's conversation scope IS its owner (the conversation's
    // pseudo-user, set at extraction time) — there is no separate edge to upsert. Merge and delete
    // both preserve/remove the owner correctly, so `listConversationProperties` stays accurate.
  }

  async unlinkConversationProperty(): Promise<void> {
    // No-op — see linkConversationProperty (the merge flow deletes the merged-away listing outright).
  }

  async listConversationProperties(conversationKey: string): Promise<string[]> {
    const owner = await findUserByIdentity(this.db, "line", conversationKey);
    return owner ? listListingIdsByOwner(this.db, owner.id) : [];
  }

  // --- Property events (calendar / reminders) ---

  async addEvent(event: PropertyEvent): Promise<void> {
    await insertListingEvent(this.db, toNewListingEvent(event));
  }

  async listPropertyEvents(propertyId: string): Promise<PropertyEvent[]> {
    const rows = await listEventsByListing(this.db, propertyId);
    return rows.map(toPropertyEvent);
  }

  async deletePropertyEvents(propertyId: string): Promise<void> {
    await deleteEventsByListing(this.db, propertyId);
  }

  async findDueEvents(nowIso: string, limit: number): Promise<PropertyEvent[]> {
    const rows = await findDueListingEvents(this.db, new Date(nowIso), limit);
    return rows.map(toPropertyEvent);
  }

  async markEventNotified(event: PropertyEvent, nowMs: number): Promise<boolean> {
    return claimListingEventNotified(this.db, event.eventId, new Date(nowMs));
  }
}
