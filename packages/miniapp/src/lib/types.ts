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

/** A card row from `GET /me/listings` (also the shape inside saved/viewings later, Build D). */
export interface ListingCardDto {
  readonly id: string;
  readonly dealType: DealType;
  readonly propertyType: PropertyType;
  readonly priceThb: number | null;
  readonly saleStage: SaleStage;
  readonly rentalStatus: RentalStatus;
  readonly province: string | null;
  readonly amphoe: string | null;
  /** Presigned hero thumb (attached by the handler when the listing has a photo). */
  readonly heroUrl?: string;
  /** Whether this listing is publicly published (my-listings only). */
  readonly isPublished?: boolean;
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
  readonly photos: readonly PhotoDto[];
}
