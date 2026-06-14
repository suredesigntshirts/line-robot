/**
 * Deterministic fixtures mirroring the frozen packages/api contract — the ONE source of truth, reused
 * by the unit/component tests AND the e2e harness's mock (so the tests + the rendered SPA can't drift).
 * Named single fixtures (one per lifecycle state) — referenced by NAME, never by index, so access stays
 * type-safe under noUncheckedIndexedAccess.
 *
 * Image URLs are built from {@link API_ORIGIN} so the e2e harness can intercept them via Playwright
 * `page.route(`${API_ORIGIN}/**`)`; the unit tests don't fetch them (they only assert <img> presence).
 */
import type { ApiClient } from "../src/lib/api.ts";
import type {
  InterestFlagDto,
  ListingCardDto,
  ListingDetailDto,
  NoteDto,
  QuoteDto,
  ViewingDto,
  ViewingsDto,
} from "../src/lib/types.ts";

/** The api origin the e2e build is pinned to (vite.config.ts `define`); all api + image URLs hit it. */
export const API_ORIGIN = "https://e2e.api.local";
const img = (name: string): string => `${API_ORIGIN}/img/${name}.jpg`;

/** Under-offer sale (reserved), has a hero photo. */
export const LISTING_OFFER: ListingCardDto = {
  id: "11111111-1111-1111-1111-111111111111",
  dealType: "sale",
  propertyType: "house",
  priceThb: 4_800_000,
  monthlyRent: null,
  saleStage: "reserved",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "สันกำแพง",
  heroUrl: img("a"),
  isPublished: true,
};

/** Live sale (available + published), no hero photo (placeholder glyph path). */
export const LISTING_ACTIVE: ListingCardDto = {
  id: "22222222-2222-2222-2222-222222222222",
  dealType: "sale",
  propertyType: "house",
  priceThb: 1_200_000,
  monthlyRent: null,
  saleStage: "available",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "สันทราย",
  isPublished: true,
};

/** Live RENT listing — its rent is on `monthlyRent` (priceThb is null, as the api returns for a rental).
 * The card must show ฿13,000 / ค่าเช่า/เดือน, NOT "—" (review finding #1). */
export const LISTING_RENT: ListingCardDto = {
  id: "33333333-3333-3333-3333-333333333333",
  dealType: "rent",
  propertyType: "condo",
  priceThb: null,
  monthlyRent: 13_000,
  saleStage: "available",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "เมืองเชียงใหม่",
  heroUrl: img("c"),
  isPublished: true,
};

/** Draft (claimed, not published). */
export const LISTING_DRAFT: ListingCardDto = {
  id: "44444444-4444-4444-4444-444444444444",
  dealType: "sale",
  propertyType: "land",
  priceThb: 3_200_000,
  monthlyRent: null,
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
  monthlyRent: null,
  saleStage: "transferred",
  rentalStatus: "available",
  province: "เชียงใหม่",
  amphoe: "สันทราย",
  isPublished: true,
};

/** The full spread (offer, active, rent, draft, sold) — for stats + lifecycle tests AND the e2e
 * my-listings render (so the e2e card-count + the rent-price case stay honest vs the unit tests). */
export const MY_LISTINGS: ListingCardDto[] = [
  LISTING_OFFER,
  LISTING_ACTIVE,
  LISTING_RENT,
  LISTING_DRAFT,
  LISTING_SOLD,
];

/** A full detail for LISTING_OFFER — with photos, rooms, location, coordinates, description. */
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
  isSaved: false,
  // ≥5 distinct photos (distinct `url`s) so the gallery's count chip + thumbnail navigation are
  // meaningfully exercised (each thumb resolves a different hero src).
  photos: [
    { url: img("a"), kind: "photo", isThumb: true },
    { url: img("a2"), kind: "photo", isThumb: true },
    { url: img("a3"), kind: "photo", isThumb: true },
    { url: img("a4"), kind: "photo", isThumb: true },
    { url: img("a5"), kind: "photo", isThumb: true },
    { url: img("a6"), kind: "photo", isThumb: true },
  ],
};

// --- Per-user CRM fixtures (Stage 5, Build D — D13) -------------------------

/** The user's saved listings (`GET /me/saved`) — card DTOs with a `savedAt` (newest first). Reuses two
 * of the my-listings cards so the saved render is a real, distinct set the test counts. */
export const SAVED: ListingCardDto[] = [
  { ...LISTING_ACTIVE, savedAt: "2026-06-12T09:00:00.000Z" },
  { ...LISTING_RENT, savedAt: "2026-06-10T09:00:00.000Z" },
];

/** Two upcoming + one past viewing (`GET /me/viewings`). `scheduledAt` is an ISO string (the api
 * serializes the DB Date). The listing on each is a slim card DTO. */
const viewing = (
  viewingId: string,
  scheduledAt: string,
  status: ViewingDto["status"],
  listing: ListingCardDto,
): ViewingDto => ({ viewingId, scheduledAt, status, listing });

export const VIEWINGS: ViewingsDto = {
  upcoming: [
    viewing("v-1", "2026-06-20T03:00:00.000Z", "confirmed", LISTING_OFFER),
    viewing("v-2", "2026-06-22T07:30:00.000Z", "requested", LISTING_ACTIVE),
  ],
  past: [viewing("v-3", "2026-06-01T06:00:00.000Z", "done", LISTING_SOLD)],
};

/** The caller's own notes on a listing (`GET /properties/{id}/notes`, newest first). */
export const NOTES: NoteDto[] = [
  {
    id: "n-1",
    body: "โทรถามเจ้าของเรื่องราคา ต่อรองได้อีก 200,000",
    createdAt: "2026-06-11T04:00:00.000Z",
  },
  { id: "n-2", body: "ทำเลดี ใกล้ตลาด เดินทางสะดวก", createdAt: "2026-06-09T08:30:00.000Z" },
];

// --- Stage 6 dealflow fixtures (interest flags / quotes — the OWNER's detail sections) --------------

/** Interest flags on a listing (`GET /properties/{id}/interest`, the owner's "ผู้สนใจ" list, newest
 * first). Two flaggers so the static style spec renders a populated list (the Thai display names are
 * measured for TH-07). */
export const INTEREST_FLAGS: InterestFlagDto[] = [
  { userId: "u-flag-1", displayName: "สมาชิกกลุ่ม สนใจซื้อ", createdAt: "2026-06-13T05:00:00.000Z" },
  { userId: "u-flag-2", displayName: "ผู้สนใจรายที่สอง", createdAt: "2026-06-12T03:30:00.000Z" },
];

/** Submitted quotes on a listing (`GET /properties/{id}/quotes`, the owner's "ข้อเสนอ" list, newest
 * first). One with a discount + terms note, one bare — so both render paths are exercised + measured. */
export const QUOTES: QuoteDto[] = [
  {
    quoteId: "q-1",
    brokerUserId: "b-1",
    amountThb: 4_500_000,
    discountVsMarket: 6,
    termsNote: "ชำระเงินสด ปิดการขายภายใน 30 วัน",
    status: "submitted",
    createdAt: "2026-06-14T06:00:00.000Z",
  },
  {
    quoteId: "q-2",
    brokerUserId: "b-2",
    amountThb: 4_300_000,
    discountVsMarket: null,
    termsNote: null,
    status: "submitted",
    createdAt: "2026-06-13T09:00:00.000Z",
  },
];

/** A complete fixture {@link ApiClient} (the injection seam — no LIFF, no network). Every method has a
 * sensible default returning the fixtures above; pass `over` to spy on / override any of them. Shared by
 * the router, claim, and CRM component tests so they don't each re-stub the whole client. */
export function makeFixtureApi(over: Partial<ApiClient> = {}): ApiClient {
  return {
    myListings: async () => structuredClone(MY_LISTINGS),
    listing: async () => structuredClone(DETAIL),
    claim: async () => ({ status: "claimed" }),
    publish: async () => ({ status: "published" }),
    keepPrivate: async () => ({ status: "group_private" }),
    saved: async () => structuredClone(SAVED),
    save: async () => ({ status: "saved" }),
    unsave: async () => ({ status: "unsaved" }),
    viewings: async () => structuredClone(VIEWINGS),
    createViewing: async (_id, scheduledAt) => ({
      viewingId: "v-new",
      scheduledAt,
      status: "requested",
    }),
    notes: async () => structuredClone(NOTES),
    addNote: async (_id, body) => ({ id: "n-new", body, createdAt: "2026-06-14T10:00:00.000Z" }),
    editListing: async () => ({ status: "updated" }),
    // Stage 6 dealflow (interest / quick-sale / quotes) — empty/idempotent defaults; specs override.
    flagInterest: async () => ({ status: "flagged" }),
    interest: async () => [],
    quickSale: async () => ({ status: "quick_sale" }),
    submitQuote: async () => ({ quoteId: "q-new" }),
    quotes: async () => [],
    ...over,
  };
}
