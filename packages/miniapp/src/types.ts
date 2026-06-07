/**
 * DTO shapes returned by the read-api Lambda. These mirror `catalogDto.ts` in the bot package —
 * the API is the contract, so keep these in sync if the server DTOs change. All optional fields are
 * omitted from the JSON when absent (the server strips them), so every `?` is genuinely "may be
 * missing", and the UI renders present-only.
 */

/** A listing as shown in the scrollable List screen (`GET /me/properties`). */
export interface PropertyListItem {
  readonly propertyId: string;
  readonly title: string;
  readonly status?: string;
  readonly statusBadge?: string;
  readonly price?: string;
  readonly priceValue?: number;
  readonly currency?: string;
  readonly propertyType?: string;
  readonly listingType?: string;
  readonly area?: string;
  readonly updatedAt?: number;
  readonly search: string;
  readonly heroUrl?: string;
}

/** A presigned photo in a detail response, in `property → chanote → other` order. */
export interface Photo {
  readonly url: string;
  readonly kind: string;
  readonly label?: string;
}

/** Title-deed (chanote) block, OCR'd from the deed image — every field optional. */
export interface Chanote {
  readonly titleType?: string;
  readonly deedNumber?: string;
  readonly landNumber?: string;
  readonly surveyPage?: string;
  readonly mapSheet?: string;
  readonly landOffice?: string;
  readonly province?: string;
  readonly district?: string;
  readonly subdistrict?: string;
  readonly landArea?: string;
  readonly ownerName?: string;
  readonly encumbrances?: readonly string[];
  readonly confidenceNote?: string;
}

/** A listing's full detail (`GET /properties/{id}`). */
export interface PropertyDetail {
  readonly propertyId: string;
  readonly title: string;
  readonly status?: string;
  readonly statusBadge?: string;
  readonly price?: string;
  readonly rent?: string;
  readonly currency?: string;
  readonly propertyType?: string;
  readonly listingType?: string;
  readonly bedrooms?: number;
  readonly bathrooms?: number;
  readonly usableAreaSqm?: number;
  readonly landArea?: string;
  readonly floors?: number;
  readonly furnishing?: string;
  readonly projectName?: string;
  readonly address?: string;
  readonly area?: string;
  readonly contact?: string;
  readonly source?: string;
  readonly tags?: readonly string[];
  readonly notes?: string;
  readonly chanote?: Chanote;
  readonly lat?: number;
  readonly long?: number;
  readonly mapsUri?: string;
  readonly createdAt?: number;
  readonly updatedAt?: number;
  readonly photos: readonly Photo[];
}

/** One due follow-up (`GET /me/upcoming`). */
export interface UpcomingItem {
  readonly propertyId: string;
  readonly propertyTitle: string;
  readonly dueAt: number;
  readonly title?: string;
}
