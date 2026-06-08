/**
 * The read-API JSON contract, shared by the bot (producer: `readApiHandler` maps Property → these)
 * and the miniapp (consumer). One source of truth so the two packages cannot drift — a field added
 * here is a compile error in any consumer that doesn't handle it. No runtime code, no IO.
 */

/** Structured data OCR'd from a Thai land title-deed (chanote / นส.3ก / etc.), captured by the bot's
 * per-image classifier (plan 13) and rendered as its own Details section. Every field is optional —
 * keep whatever was legible, omit the rest. */
export interface Chanote {
  /** chanote (Nor Sor 4 Jor) | nor-sor-3-gor | nor-sor-3 | sor-por-kor | other (best guess by the
   * document's content/layout, NOT the Garuda colour or file type). */
  readonly titleType?: string;
  /** Title-deed number (เลขที่โฉนด). */
  readonly deedNumber?: string;
  /** Land/parcel number (เลขที่ดิน). */
  readonly landNumber?: string;
  /** Survey page (หน้าสำรวจ). */
  readonly surveyPage?: string;
  /** Map-sheet / ระวาง number. */
  readonly mapSheet?: string;
  /** Issuing Land Office (สำนักงานที่ดิน). */
  readonly landOffice?: string;
  /** Location as printed on the deed (also used to backfill the property's own location). */
  readonly province?: string;
  readonly district?: string;
  readonly subdistrict?: string;
  /** Area as written, in Thai units (e.g. "1 rai 2 ngan 30 wah"). */
  readonly landArea?: string;
  /** Registered owner name(s). */
  readonly ownerName?: string;
  /** Encumbrances from the reverse side: mortgages, leases, usufructs, servitudes. */
  readonly encumbrances?: readonly string[];
  /** A note when text was not fully legible / low-confidence reads, so a human can double-check. */
  readonly confidenceNote?: string;
}

/** One presigned photo in a detail response, in `property → chanote → other` order. */
export interface PhotoDto {
  readonly url: string;
  readonly kind: string;
  readonly label?: string;
}

/** A listing as shown in the scrollable List screen (`GET /me/properties`). */
export interface PropertyListDto {
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
  /** Lowercased searchable haystack the free-text box matches. */
  readonly search: string;
  /** Presigned hero image (attached by the handler when the listing has a photo). */
  readonly heroUrl?: string;
}

/** A listing's full detail (`GET /properties/{id}`). */
export interface PropertyDetailDto {
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
  readonly photos: readonly PhotoDto[];
}

/** One due follow-up (`GET /me/upcoming`). */
export interface UpcomingItem {
  readonly propertyId: string;
  readonly propertyTitle: string;
  readonly dueAt: number;
  readonly title?: string;
}

/** Body of `POST /properties/{id}/viewings` — book a viewing/follow-up from the MINI App. */
export interface BookViewingRequest {
  /** Bangkok-local `YYYY-MM-DDTHH:mm` (a `<input type="datetime-local">` value), interpreted the same
   * way the chat datetime-picker is. */
  readonly datetimeLocal: string;
  /** Optional note shown in the reminder (defaults to "Viewing" server-side). */
  readonly title?: string;
}

/** Success response of `POST /properties/{id}/viewings`. */
export interface BookViewingResponse {
  readonly eventId: string;
  /** The resolved due instant (epoch ms), echoed so the client can render its confirmation. */
  readonly dueAt: number;
}

/** Miniapp-side aliases (historical names) — the SPA imports these; same shapes as the *Dto names. */
export type PropertyListItem = PropertyListDto;
export type PropertyDetail = PropertyDetailDto;
export type Photo = PhotoDto;
