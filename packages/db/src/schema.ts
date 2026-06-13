import {
  amenity,
  approvalStatus,
  contentGeneratedBy,
  contentLang,
  dealType,
  extractionSource,
  facingDirection,
  furnishingStatus,
  identityProvider,
  listingMandate,
  marketDataSource,
  mediaKind,
  mergeRequestStatus,
  moderationStatus,
  moderationTargetType,
  priceChangeReason,
  propertyType,
  quotaBucket,
  releaseState,
  rentalStatus,
  roadType,
  roleKind,
  saleStage,
  tenure,
  titleDeedType,
  transactionType,
  urgency,
  utilityRateType,
  viewingStatus,
} from "@line-robot/domain";
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  boolean,
  customType,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Drizzle schema — mirrors the Stage 1 spec entity table 1:1. The zod enums in
// @line-robot/domain are the source of truth; the pgEnum definitions below are
// generated from their .options so the two can never drift.
// ---------------------------------------------------------------------------

/**
 * Bridge a zod enum's options to pgEnum WITHOUT widening to string — rows then
 * infer the literal unions, which is what lets the storage row satisfy the
 * domain `Listing` entity (compile-time drift guard in repositories/listings).
 */
function pgEnumFrom<T extends string>(name: string, zodEnum: { options: readonly T[] }) {
  return pgEnum(name, zodEnum.options as [T, ...T[]]);
}

export const dealTypePg = pgEnumFrom("deal_type", dealType);
export const saleStagePg = pgEnumFrom("sale_stage", saleStage);
export const rentalStatusPg = pgEnumFrom("rental_status", rentalStatus);
export const titleDeedTypePg = pgEnumFrom("title_deed_type", titleDeedType);
export const tenurePg = pgEnumFrom("tenure", tenure);
export const quotaBucketPg = pgEnumFrom("quota_bucket", quotaBucket);
export const propertyTypePg = pgEnumFrom("property_type", propertyType);
export const urgencyPg = pgEnumFrom("urgency", urgency);
export const transactionTypePg = pgEnumFrom("transaction_type", transactionType);
export const roleKindPg = pgEnumFrom("role_kind", roleKind);
export const approvalStatusPg = pgEnumFrom("approval_status", approvalStatus);
export const identityProviderPg = pgEnumFrom("identity_provider", identityProvider);
export const listingMandatePg = pgEnumFrom("listing_mandate", listingMandate);
export const extractionSourcePg = pgEnumFrom("extraction_source", extractionSource);
export const furnishingStatusPg = pgEnumFrom("furnishing_status", furnishingStatus);
export const utilityRateTypePg = pgEnumFrom("utility_rate_type", utilityRateType);
export const facingDirectionPg = pgEnumFrom("facing_direction", facingDirection);
export const roadTypePg = pgEnumFrom("road_type", roadType);
export const mediaKindPg = pgEnumFrom("media_kind", mediaKind);
export const contentLangPg = pgEnumFrom("content_lang", contentLang);
export const contentGeneratedByPg = pgEnumFrom("content_generated_by", contentGeneratedBy);
export const releaseStatePg = pgEnumFrom("release_state", releaseState);
export const moderationStatusPg = pgEnumFrom("moderation_status", moderationStatus);
export const moderationTargetTypePg = pgEnumFrom("moderation_target_type", moderationTargetType);
export const mergeRequestStatusPg = pgEnumFrom("merge_request_status", mergeRequestStatus);
export const viewingStatusPg = pgEnumFrom("viewing_status", viewingStatus);
export const priceChangeReasonPg = pgEnumFrom("price_change_reason", priceChangeReason);
export const marketDataSourcePg = pgEnumFrom("market_data_source", marketDataSource);
export const amenityPg = pgEnumFrom("amenity", amenity);

/**
 * PostGIS geography(Point,4326) — drizzle has no built-in geography type.
 * Values cross the wire as EWKT (`SRID=4326;POINT(lon lat)`); reads return
 * PostGIS's hex EWKB, which callers don't parse — spatial queries happen in
 * SQL (ST_DWithin etc.), not in JS.
 */
export const geographyPoint = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography(Point,4326)";
  },
});

/** `SRID=4326;POINT(lon lat)` EWKT helper for writes. */
export function ewktPoint(lon: number, lat: number): string {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    throw new Error(`ewktPoint requires finite coordinates, got (${lon}, ${lat})`);
  }
  return `SRID=4326;POINT(${lon} ${lat})`;
}

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// --- users & identity -------------------------------------------------------

export const users = pgTable("user", {
  id: id(),
  displayName: text("display_name").notNull(),
  // Circular user↔role reference: nullable, set after the role exists.
  primaryRoleId: uuid("primary_role_id").references((): AnyPgColumn => roles.id),
  createdAt: createdAt(),
});

export const userIdentities = pgTable(
  "user_identity",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    provider: identityProviderPg("provider").notNull(),
    providerSubject: text("provider_subject").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    contactValue: text("contact_value"),
  },
  (t) => [uniqueIndex("user_identity_provider_subject").on(t.provider, t.providerSubject)],
);

export const accountMergeRequests = pgTable("account_merge_request", {
  id: id(),
  userIdA: uuid("user_id_a")
    .notNull()
    .references(() => users.id),
  userIdB: uuid("user_id_b")
    .notNull()
    .references(() => users.id),
  reason: text("reason").notNull(),
  status: mergeRequestStatusPg("status").notNull().default("open"),
  createdAt: createdAt(),
  resolvedBy: uuid("resolved_by").references(() => users.id),
});

export const roles = pgTable("role", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  kind: roleKindPg("kind").notNull(),
  approvalStatus: approvalStatusPg("approval_status").notNull().default("none"),
});

// --- groups ------------------------------------------------------------------

export const groups = pgTable("group", {
  id: id(),
  lineGroupId: text("line_group_id").unique(),
  name: text("name").notNull(),
  exclusivityWindowDays: integer("exclusivity_window_days").notNull().default(7),
  createdAt: createdAt(),
});

export const groupMemberships = pgTable(
  "group_membership",
  {
    id: id(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    roleInGroup: text("role_in_group"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("group_membership_unique").on(t.groupId, t.userId)],
);

// --- listings ----------------------------------------------------------------

export const listings = pgTable(
  "listing",
  {
    id: id(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id),
    sourceGroupId: uuid("source_group_id").references(() => groups.id),
    dealType: dealTypePg("deal_type").notNull(),
    saleStage: saleStagePg("sale_stage"), // sale only (DF-4)
    rentalStatus: rentalStatusPg("rental_status"), // rent only
    titleDeedType: titleDeedTypePg("title_deed_type").notNull().default("unknown"), // FIELD-02
    // From chanote OCR (stage-2); the strongest dedup key (D2.6 deed-exact).
    deedNo: text("deed_no"),
    tenure: tenurePg("tenure"),
    leaseYears: integer("lease_years"), // DEAL-12/FIELD-03
    propertyType: propertyTypePg("property_type").notNull(),
    priceThb: bigint("price_thb", { mode: "number" }),
    priceNegotiable: boolean("price_negotiable").notNull().default(false),
    urgency: urgencyPg("urgency").notNull().default("normal"), // DIST-03/11
    transactionType: transactionTypePg("transaction_type").notNull().default("normal"), // DIST-06
    redemptionPeriodYears: integer("redemption_period_years"), // khai_fak only
    province: text("province"),
    amphoe: text("amphoe"),
    tambon: text("tambon"), // FIELD-13: separate admin levels
    landmark: text("landmark"), // FIELD-06: CNX needs a landmark/soi reference
    projectName: text("project_name"),
    addressDetail: text("address_detail"),
    geom: geographyPoint("geom"),
    landRai: integer("land_rai"),
    landNgan: integer("land_ngan"),
    landWah: doublePrecision("land_wah"), // FIELD-01: rai/ngan/wah
    landSqm: doublePrecision("land_sqm"), // computed: rai*1600 + ngan*400 + wah*4
    floorAreaSqm: doublePrecision("floor_area_sqm"), // FIELD-09
    pricePerSqm: doublePrecision("price_per_sqm"), // FIELD-10 (computed)
    pricePerWah: doublePrecision("price_per_wah"),
    bedrooms: smallint("bedrooms"),
    bathrooms: smallint("bathrooms"),
    facingDirection: facingDirectionPg("facing_direction"), // F-08; FIELD-11 no re-judging
    landShape: text("land_shape"),
    roadAccessM: doublePrecision("road_access_m"),
    roadType: roadTypePg("road_type"),
    floodHistory: boolean("flood_history"), // FIELD-07: seller-disclosed, unverified
    floodRiskZone: text("flood_risk_zone"),
    cityPlanZoneColor: text("city_plan_zone_color"), // F-11
    listingMandate: listingMandatePg("listing_mandate").notNull().default("group_exclusive"), // DEAL-07
    exclusivityExpiresAt: timestamp("exclusivity_expires_at", { withTimezone: true }),
    postedByRole: roleKindPg("posted_by_role"), // DEAL-10
    extractionSource: extractionSourcePg("extraction_source").notNull().default("auto"), // LEGAL-06
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // pg_trgm GIN for the public-site text search (S4-I4): one index per column the search
  // ILIKEs — landmark + project_name here, headline + description on listing_content. With all
  // four covered the planner CAN bitmap-scan each arm once the catalog is large enough to make an
  // index cheaper than a seq scan; at small staging volume it still prefers a seq scan, which is
  // correct (scanning a handful of rows costs less than any index probe). The extension itself is
  // hand-added to the migration (see packages/db/CLAUDE.md).
  (t) => [
    index("listing_landmark_trgm").using("gin", sql`${t.landmark} gin_trgm_ops`),
    index("listing_project_name_trgm").using("gin", sql`${t.projectName} gin_trgm_ops`),
  ],
);

export const listingCondo = pgTable("listing_condo", {
  listingId: uuid("listing_id")
    .primaryKey()
    .references(() => listings.id),
  camFeePerSqmMonth: doublePrecision("cam_fee_per_sqm_month"), // FIELD-04
  sinkingFundPerSqm: doublePrecision("sinking_fund_per_sqm"),
  foreignQuotaAvailable: boolean("foreign_quota_available"),
  projectForeignQuotaPct: doublePrecision("project_foreign_quota_pct"),
  quotaBucket: quotaBucketPg("quota_bucket"), // FIELD-05 / F-03 independent axis
});

export const listingRental = pgTable("listing_rental", {
  listingId: uuid("listing_id")
    .primaryKey()
    .references(() => listings.id),
  monthlyRent: bigint("monthly_rent", { mode: "number" }),
  depositMonths: smallint("deposit_months").notNull().default(2), // F-09: >3 flags non-compliant
  advanceMonths: smallint("advance_months").notNull().default(1),
  minLeaseMonths: smallint("min_lease_months").notNull().default(12),
  petsAllowed: boolean("pets_allowed"),
  furnishingStatus: furnishingStatusPg("furnishing_status"), // FIELD-12
  furnishingNotes: text("furnishing_notes"),
  utilityRateType: utilityRateTypePg("utility_rate_type").notNull().default("unknown"), // FIELD-08
});

export const listingFees = pgTable("listing_fees", {
  listingId: uuid("listing_id")
    .primaryKey()
    .references(() => listings.id),
  commissionPct: doublePrecision("commission_pct"), // DEAL-14/DF-7 defaults applied in domain
  feeSplitNote: text("fee_split_note"), // DEAL-03/04
});

export const listingContent = pgTable(
  "listing_content",
  {
    id: id(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    lang: contentLangPg("lang").notNull(), // D-S1-8: rows per language, never a JSON blob
    headline: text("headline").notNull(),
    description: text("description").notNull(),
    generatedBy: contentGeneratedByPg("generated_by").notNull(), // D14/D8
  },
  (t) => [
    uniqueIndex("listing_content_lang").on(t.listingId, t.lang),
    index("listing_content_headline_trgm").using("gin", sql`${t.headline} gin_trgm_ops`),
    index("listing_content_description_trgm").using("gin", sql`${t.description} gin_trgm_ops`),
  ],
);

export const listingAmenities = pgTable(
  "listing_amenity",
  {
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    amenity: amenityPg("amenity").notNull(),
  },
  (t) => [uniqueIndex("listing_amenity_unique").on(t.listingId, t.amenity)],
);

export const listingMedia = pgTable("listing_media", {
  id: id(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  s3Key: text("s3_key").notNull(), // the archived ORIGINAL
  // 640px web derivative (D2.7), written by the sweep once sharp runs; null for v2-lite rows that
  // predate the derivative wiring. The public website serves this; the bot presigns the original.
  thumbKey: text("thumb_key"),
  kind: mediaKindPg("kind").notNull(),
  heroIndex: integer("hero_index"),
  isRender: boolean("is_render").notNull().default(false), // P4 label
});

export const listingExclusivity = pgTable("listing_exclusivity", {
  listingId: uuid("listing_id")
    .primaryKey()
    .references(() => listings.id),
  windowOpenedAt: timestamp("window_opened_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  releaseState: releaseStatePg("release_state").notNull().default("held"), // D8; behaviour Stage 6
});

// --- engagement --------------------------------------------------------------

export const interestFlags = pgTable(
  "interest_flag",
  {
    id: id(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("interest_flag_unique").on(t.listingId, t.userId)],
);

export const savedListings = pgTable(
  "saved_listing",
  {
    id: id(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("saved_listing_unique").on(t.listingId, t.userId)],
);

export const viewings = pgTable("viewing", {
  id: id(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  requestedByUserId: uuid("requested_by_user_id")
    .notNull()
    .references(() => users.id),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  status: viewingStatusPg("status").notNull().default("requested"),
});

// Bot follow-up reminders — the at-most-once calendar primitive behind "📅 Follow-up" and the
// mini-app "Book a viewing". DISTINCT from `viewing` above (a marketplace viewing request with a
// status lifecycle): an event is due at `dueAt`, pushed once to `notifyConversationKey`, then
// stamped `notifiedAt` (which drops it out of the sweep's due-query). It mirrors the v1 DynamoDB
// PropertyEvent (sparse GSI2) so the bot's PropertyStore round-trips unchanged after the catalog
// cutover. `id` is the caller-supplied eventId (randomUUID), not generated here.
export const listingEvents = pgTable(
  "listing_event",
  {
    id: uuid("id").primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    title: text("title"),
    notifyConversationKey: text("notify_conversation_key").notNull(),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  // Sparse "due + un-notified" partial index — the reminder sweep's only query (`due_at <= now AND
  // notified_at IS NULL`). Mirrors the v1 sparse GSI2: notified rows fall out of the index entirely.
  (t) => [index("listing_event_due").on(t.dueAt).where(sql`${t.notifiedAt} is null`)],
);

export const quotes = pgTable("quote", {
  id: id(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  brokerUserId: uuid("broker_user_id")
    .notNull()
    .references(() => users.id),
  amountThb: bigint("amount_thb", { mode: "number" }).notNull(),
  discountVsMarket: doublePrecision("discount_vs_market"),
  termsNote: text("terms_note"),
  status: text("status"),
  createdAt: createdAt(), // DEAL-13/D10; feeds AVM
});

export const priceHistory = pgTable("price_history", {
  id: id(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  priceThb: bigint("price_thb", { mode: "number" }).notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  reason: priceChangeReasonPg("reason").notNull(),
});

export const coAgentAgreements = pgTable("co_agent_agreement", {
  id: id(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  holderUserId: uuid("holder_user_id")
    .notNull()
    .references(() => users.id),
  coAgentUserId: uuid("co_agent_user_id")
    .notNull()
    .references(() => users.id),
  splitPct: doublePrecision("split_pct").notNull().default(50), // DEAL-05/06
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
});

export const publishConsents = pgTable("publish_consent", {
  id: id(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  consentVersion: text("consent_version").notNull(), // LEGAL-02: never null on public
  consentTimestamp: timestamp("consent_timestamp", { withTimezone: true }).notNull(),
  deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }), // LEGAL-10
});

export const moderationItems = pgTable("moderation_item", {
  id: id(),
  targetType: moderationTargetTypePg("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  status: moderationStatusPg("status").notNull().default("pending"), // D11
  reason: text("reason"),
  createdAt: createdAt(),
});

// --- Stage 7 placeholder -------------------------------------------------------

export const marketData = pgTable("market_data", {
  id: id(),
  source: marketDataSourcePg("source").notNull(),
  province: text("province"),
  amphoe: text("amphoe"),
  tambon: text("tambon"),
  geom: geographyPoint("geom"),
  priceThb: bigint("price_thb", { mode: "number" }),
  areaSqm: doublePrecision("area_sqm"),
  deedNo: text("deed_no"),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
});
