import { z } from "zod";

// ---------------------------------------------------------------------------
// Marketplace enums — the single source of truth (D-S1 zod-first). Postgres
// enums in @line-robot/db mirror these; the extraction pipeline and UI import
// from here. Register/canon references in comments.
// ---------------------------------------------------------------------------

export const dealType = z.enum(["sale", "rent"]);
export type DealType = z.infer<typeof dealType>;

/** DF-4 / DEAL-11: Thai 3-stage close (มัดจำ → จะซื้อจะขาย → โอน) on top of available. */
export const saleStage = z.enum(["available", "reserved", "under_contract", "transferred"]);
export type SaleStage = z.infer<typeof saleStage>;

/** Rentals skip the sale ceremony (DF-4). */
export const rentalStatus = z.enum(["available", "rented", "withdrawn"]);
export type RentalStatus = z.infer<typeof rentalStatus>;

/** FIELD-02 / F-02 canon: 11 values; `unknown` blocks public publication until resolved. */
export const titleDeedType = z.enum([
  "chanote", // โฉนดที่ดิน / น.ส.4จ — full ownership
  "ns3g", // น.ส.3ก
  "ns3k", // น.ส.3ข
  "ns3", // น.ส.3
  "spk", // ส.ป.ก. — agricultural reform, no sale
  "pbt5", // ภบท.5 — tax receipt only, no sale
  "ns2", // น.ส.2 — temporary occupation, no sale
  "stg", // ส.ท.ก. — forest-zone right, no sale
  "sk1", // ส.ค.1 — possession notification, no sale
  "other",
  "unknown",
]);
export type TitleDeedType = z.infer<typeof titleDeedType>;

/** FIELD-03: these deed types cannot legally transfer by sale — hard quality-gate block. */
export const NO_SALE_DEED_TYPES: ReadonlySet<TitleDeedType> = new Set([
  "spk",
  "pbt5",
  "ns2",
  "stg",
  "sk1",
]);

/** F-03 canon: tenure and quota bucket are independent axes (DEAL-12/FIELD-03,05). */
export const tenure = z.enum(["freehold", "leasehold"]);
export type Tenure = z.infer<typeof tenure>;

export const quotaBucket = z.enum(["foreign_quota", "thai_quota"]);
export type QuotaBucket = z.infer<typeof quotaBucket>;

export const propertyType = z.enum(["land", "house", "townhouse", "condo", "commercial", "other"]);
export type PropertyType = z.infer<typeof propertyType>;

/** DIST-03/DIST-11: one urgency field; quick-sale is a flag on the listing, not a separate market. */
export const urgency = z.enum(["normal", "quick_sale", "price_reduced"]);
export type Urgency = z.infer<typeof urgency>;

/** DIST-06: ขายฝาก (sale with right of redemption) is a distinct transaction type. */
export const transactionType = z.enum(["normal", "khai_fak"]);
export type TransactionType = z.infer<typeof transactionType>;

export const roleKind = z.enum(["broker", "investor", "owner", "visitor"]);
export type RoleKind = z.infer<typeof roleKind>;

/** D9: broker/investor roles are admin-approved. */
export const approvalStatus = z.enum(["none", "pending", "approved"]);
export type ApprovalStatus = z.infer<typeof approvalStatus>;

export const identityProvider = z.enum(["line", "email", "google"]);
export type IdentityProvider = z.infer<typeof identityProvider>;

/** DEAL-07: group-exclusive window before a listing may go open/public. */
export const listingMandate = z.enum(["group_exclusive", "open"]);
export type ListingMandate = z.infer<typeof listingMandate>;

/** LEGAL-06: auto-extracted content is labelled until the poster confirms it. */
export const extractionSource = z.enum(["auto", "poster_confirmed"]);
export type ExtractionSource = z.infer<typeof extractionSource>;

/** FIELD-12 */
export const furnishingStatus = z.enum(["fully", "partly", "unfurnished"]);
export type FurnishingStatus = z.infer<typeof furnishingStatus>;

/** F-09 canon; legally significant since Sep 2025 OCPB regs (FIELD-08). */
export const utilityRateType = z.enum(["government", "landlord_rate", "included", "unknown"]);
export type UtilityRateType = z.infer<typeof utilityRateType>;

/** F-08 canon. */
export const facingDirection = z.enum(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);
export type FacingDirection = z.infer<typeof facingDirection>;

/** F-10 canon: road_type=none gets a warning badge. */
export const roadType = z.enum(["public", "private_easement", "none"]);
export type RoadType = z.infer<typeof roadType>;

export const mediaKind = z.enum(["photo", "chanote", "floorplan", "render"]);
export type MediaKind = z.infer<typeof mediaKind>;

/** D14/D8: per-language content rows record whether a human or the pipeline wrote them. */
export const contentLang = z.enum(["th", "en"]);
export type ContentLang = z.infer<typeof contentLang>;

export const contentGeneratedBy = z.enum(["human", "llm"]);
export type ContentGeneratedBy = z.infer<typeof contentGeneratedBy>;

/** D8: exclusivity release lifecycle (behaviour lands in Stage 6; types now). */
export const releaseState = z.enum(["held", "releasable", "released"]);
export type ReleaseState = z.infer<typeof releaseState>;

export const moderationStatus = z.enum(["pending", "approved", "rejected"]);
export type ModerationStatus = z.infer<typeof moderationStatus>;

export const moderationTargetType = z.enum(["listing", "merge_request"]);
export type ModerationTargetType = z.infer<typeof moderationTargetType>;

export const mergeRequestStatus = z.enum(["open", "resolved", "rejected"]);
export type MergeRequestStatus = z.infer<typeof mergeRequestStatus>;

export const viewingStatus = z.enum(["requested", "confirmed", "done", "cancelled"]);
export type ViewingStatus = z.infer<typeof viewingStatus>;

export const priceChangeReason = z.enum(["new", "reduced", "corrected"]);
export type PriceChangeReason = z.infer<typeof priceChangeReason>;

/** Stage 7 placeholder (market_data.source). */
export const marketDataSource = z.enum(["led", "treasury", "asking"]);
export type MarketDataSource = z.infer<typeof marketDataSource>;

/** A4 amenity canon — canonical checkbox set across Thai portals (no register ID; artifact body). */
export const amenity = z.enum([
  "swimming_pool",
  "private_pool",
  "fitness",
  "parking",
  "covered_parking",
  "security_24h",
  "cctv",
  "keycard_access",
  "playground",
  "coworking",
  "rooftop",
  "clubhouse",
  "garden",
  "servant_quarters",
  "pets_allowed_area",
]);
export type Amenity = z.infer<typeof amenity>;
