/** Deterministic fixtures mirroring the frozen packages/api contract — reused by the unit/component
 * tests AND the e2e harness's mock (one source of truth so the tests + the rendered SPA agree). */
import type { ListingCardDto, ListingDetailDto } from "../src/lib/types.ts";

// Named single fixtures (one per lifecycle state) — tests reference these by NAME, never by index, so
// access stays type-safe under noUncheckedIndexedAccess. `MY_LISTINGS` composes them for spread tests.

/** Under-offer sale (reserved), has a hero photo. */
export const LISTING_OFFER: ListingCardDto = {
  id: "11111111-1111-1111-1111-111111111111",
  dealType: "sale",
  propertyType: "house",
  priceThb: 4_800_000,
  saleStage: "reserved",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "สันกำแพง",
  heroUrl: "https://example.test/derivatives/a/01.jpg",
  isPublished: true,
};

/** Live sale (available + published), no hero photo (placeholder glyph path). */
export const LISTING_ACTIVE: ListingCardDto = {
  id: "22222222-2222-2222-2222-222222222222",
  dealType: "sale",
  propertyType: "house",
  priceThb: 1_200_000,
  saleStage: "available",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "สันทราย",
  isPublished: true,
};

/** Live rental (available rent). */
export const LISTING_RENT: ListingCardDto = {
  id: "33333333-3333-3333-3333-333333333333",
  dealType: "rent",
  propertyType: "condo",
  priceThb: null,
  saleStage: "available",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "เมืองเชียงใหม่",
  heroUrl: "https://example.test/derivatives/c/01.jpg",
  isPublished: true,
};

/** Draft (claimed, not published). */
export const LISTING_DRAFT: ListingCardDto = {
  id: "44444444-4444-4444-4444-444444444444",
  dealType: "sale",
  propertyType: "land",
  priceThb: 3_200_000,
  saleStage: "available",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "แม่ริม",
  isPublished: false,
};

/** Sold (transferred). */
export const LISTING_SOLD: ListingCardDto = {
  id: "55555555-5555-5555-5555-555555555555",
  dealType: "sale",
  propertyType: "commercial",
  priceThb: 13_800_000,
  saleStage: "transferred",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "สันทราย",
  isPublished: true,
};

/** The full spread (offer, active, rent, draft, sold) — for stats + lifecycle-classification tests. */
export const MY_LISTINGS: ListingCardDto[] = [
  LISTING_OFFER,
  LISTING_ACTIVE,
  LISTING_RENT,
  LISTING_DRAFT,
  LISTING_SOLD,
];

/** A full detail for the first listing — with photos, rooms, location, coordinates, description. */
export const DETAIL: ListingDetailDto = {
  id: "11111111-1111-1111-1111-111111111111",
  dealType: "sale",
  propertyType: "house",
  priceThb: 4_800_000,
  monthlyRent: null,
  saleStage: "reserved",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "สันกำแพง",
  tambon: "ต้นเปา",
  landmark: "ใกล้บ่อสร้าง",
  projectName: "บ้านสวนบ่อสร้าง",
  bedrooms: 3,
  bathrooms: 2,
  lat: 18.7953,
  lon: 98.9525,
  headline: "ขายหอพักย่านบ่อสร้าง 14 ห้อง ต้นเปา สันกำแพง",
  description: "หอพัก 14 ห้อง ทำเลดี ใกล้แหล่งชุมชนบ่อสร้าง เหมาะสำหรับนักลงทุน",
  sourceGroupId: "C0835",
  claimedByUserId: "user-1",
  isClaimedByMe: true,
  photos: [
    { url: "https://example.test/derivatives/a/01.jpg", kind: "photo", isThumb: true },
    { url: "https://example.test/derivatives/a/02.jpg", kind: "photo", isThumb: true },
  ],
};
