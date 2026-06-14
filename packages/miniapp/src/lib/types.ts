/**
 * The mini-app's view of the FROZEN packages/api JSON contract (Build A). One source of truth on the
 * client so the screens + api client can't drift from what the handler returns. These mirror the
 * exact response shapes of `GET /me/listings` and `GET /properties/{id}` (see
 * packages/api/src/handler.ts → toCardDto / handleDetail). Enum-typed fields reuse @line-robot/domain
 * so a schema change there is a compile error here. No runtime code, no IO.
 *
 * NOTE: these are intentionally SLIM — the API card DTO carries only the columns the list screen
 * renders, NOT the full domain `Listing` the website's shared `ListingCard` expects. That gap is why
 * the mini-app authors its own card/detail in Tailwind (see components/) rather than reusing the
 * domain-entity-driven shared components.
 */
import type { DealType, PropertyType, RentalStatus, SaleStage } from "@line-robot/domain";

/** A card row from `GET /me/listings` (also the shape inside saved/viewings, Build D). */
export interface ListingCardDto {
  readonly id: string;
  readonly dealType: DealType;
  readonly propertyType: PropertyType;
  /** Asking price for a SALE (null for a rental — its rent is on `monthlyRent`). */
  readonly priceThb: number | null;
  /** Monthly rent for a RENT listing, from the rental satellite (null for a sale). The card needs
   * this so the owner sees their rent instead of an empty "—". */
  readonly monthlyRent: number | null;
  readonly saleStage: SaleStage;
  readonly rentalStatus: RentalStatus;
  readonly province: string | null;
  readonly amphoe: string | null;
  /** Presigned hero thumb (attached by the handler when the listing has a photo). */
  readonly heroUrl?: string;
  /** Whether this listing is publicly published (my-listings only). */
  readonly isPublished?: boolean;
  /** ISO-8601 timestamp the listing was saved (`GET /me/saved` cards only). Orders newest-first. */
  readonly savedAt?: string;
}

/** A viewing lifecycle status (`GET /me/viewings`). Mirrors @line-robot/domain `viewingStatus`. */
export type ViewingStatusDto = "requested" | "confirmed" | "done" | "cancelled";

/** One viewing from `GET /me/viewings` (in the `upcoming`/`past` arrays). `scheduledAt` is an ISO-8601
 * string (the api serializes the DB `Date`); `listing` is the slim card DTO. */
export interface ViewingDto {
  readonly viewingId: string;
  readonly scheduledAt: string;
  readonly status: ViewingStatusDto;
  readonly listing: ListingCardDto;
}

/** `GET /me/viewings` → the two sections the screen renders (upcoming + past). */
export interface ViewingsDto {
  readonly upcoming: readonly ViewingDto[];
  readonly past: readonly ViewingDto[];
}

/** A per-user follow-up note on a listing (`GET /properties/{id}/notes` — the caller's own only). */
export interface NoteDto {
  readonly id: string;
  readonly body: string;
  /** ISO-8601 timestamp the note was created (the api serializes the DB `Date`). */
  readonly createdAt: string;
}

/** The owner-editable fields of a claimed listing (`PATCH /properties/{id}`). Every field is optional —
 * the api applies only the keys present (the allowlist mirrors the server's EDITABLE_*_FIELDS). String
 * fields trim server-side; `monthlyRent` is applied only to a rent listing (claimant-only, enforced
 * server-side → a non-claimant PATCH is `404 not_found`). */
export interface ListingPatch {
  readonly landmark?: string;
  readonly projectName?: string;
  readonly addressDetail?: string;
  readonly province?: string;
  readonly amphoe?: string;
  readonly tambon?: string;
  readonly priceThb?: number;
  readonly bedrooms?: number;
  readonly bathrooms?: number;
  readonly monthlyRent?: number;
}

/** One presigned photo in a detail response. `kind` is the media kind (photo/chanote/…). */
export interface PhotoDto {
  readonly url: string;
  readonly kind: string;
  readonly isThumb: boolean;
}

/** A listing's full detail from `GET /properties/{id}`. */
export interface ListingDetailDto {
  readonly id: string;
  readonly dealType: DealType;
  readonly propertyType: PropertyType;
  readonly priceThb: number | null;
  readonly monthlyRent: number | null;
  readonly saleStage: SaleStage;
  readonly rentalStatus: RentalStatus;
  readonly province: string | null;
  readonly amphoe: string | null;
  readonly tambon: string | null;
  readonly landmark: string | null;
  readonly projectName: string | null;
  readonly bedrooms: number | null;
  readonly bathrooms: number | null;
  readonly lat: number | null;
  readonly lon: number | null;
  readonly headline: string;
  readonly description: string;
  readonly sourceGroupId: string | null;
  readonly claimedByUserId: string | null;
  readonly isClaimedByMe: boolean;
  /** Whether the CALLER has saved this listing — seeds the detail's bookmark so a saved listing renders
   * "saved" on every revisit (computed per-caller by the api). */
  readonly isSaved: boolean;
  readonly photos: readonly PhotoDto[];
}
