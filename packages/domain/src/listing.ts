import type {
  DealType,
  ExtractionSource,
  FacingDirection,
  ListingMandate,
  PropertyType,
  RentalStatus,
  RoadType,
  RoleKind,
  SaleStage,
  TitleDeedType,
  TransactionType,
  Urgency,
} from "./enums.js";

/**
 * The canonical listing entity. Storage (drizzle row in @line-robot/db) must
 * remain structurally assignable to this — there is a compile-time check in
 * packages/db. UI and pipeline consume THIS type, never a redefinition (D3.8).
 */
export interface Listing {
  id: string;
  ownerUserId: string;
  sourceGroupId: string | null;
  dealType: DealType;
  saleStage: SaleStage | null;
  rentalStatus: RentalStatus | null;
  titleDeedType: TitleDeedType;
  deedNo: string | null;
  tenure: string | null;
  leaseYears: number | null;
  propertyType: PropertyType;
  priceThb: number | null;
  priceNegotiable: boolean;
  urgency: Urgency;
  transactionType: TransactionType;
  redemptionPeriodYears: number | null;
  province: string | null;
  amphoe: string | null;
  tambon: string | null;
  landmark: string | null;
  projectName: string | null;
  addressDetail: string | null;
  landRai: number | null;
  landNgan: number | null;
  landWah: number | null;
  landSqm: number | null;
  floorAreaSqm: number | null;
  pricePerSqm: number | null;
  pricePerWah: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  facingDirection: FacingDirection | null;
  landShape: string | null;
  roadAccessM: number | null;
  roadType: RoadType | null;
  floodHistory: boolean | null;
  floodRiskZone: string | null;
  cityPlanZoneColor: string | null;
  listingMandate: ListingMandate;
  exclusivityExpiresAt: Date | null;
  postedByRole: RoleKind | null;
  extractionSource: ExtractionSource;
  createdAt: Date;
  updatedAt: Date;
}
