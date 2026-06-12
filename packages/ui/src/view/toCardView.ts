import type { Listing } from "@line-robot/domain";

/**
 * The ONE adaptation point between the domain entity and card rendering
 * (D3.8): derives display strings, never redefines domain fields. Kept thin —
 * if Stage 1 fields move, this is the only file that changes.
 */
export interface CardView {
  id: string;
  /** Per-locale headline from listing_content. */
  headline: string;
  /** Hero photo URL (presigned/CDN), already resolved by the caller. */
  heroUrl: string | null;
  photoCount: number;
  locationLine: string;
  /** "3 นอน · 2 น้ำ · 180 ตร.ม." style spec line, pre-localized. */
  specLine: string;
  updatedAtIso: string;
}

export interface CardViewInput {
  listing: Listing;
  headline: string;
  heroUrl: string | null;
  photoCount: number;
  /** Localized fragments the caller's translator produced (bedrooms/bathrooms). */
  bedroomsLabel?: string;
  bathroomsLabel?: string;
}

export function toCardView(input: CardViewInput): CardView {
  const { listing } = input;
  const locationLine = [listing.landmark, listing.tambon, listing.amphoe]
    .filter((part): part is string => part !== null && part !== "")
    .join(" · ");
  const specs: string[] = [];
  if (input.bedroomsLabel) specs.push(input.bedroomsLabel);
  if (input.bathroomsLabel) specs.push(input.bathroomsLabel);
  if (listing.floorAreaSqm !== null) specs.push(`${listing.floorAreaSqm} ตร.ม.`);
  else if (listing.landSqm !== null) specs.push(`${listing.landSqm} ตร.ม.`);
  return {
    id: listing.id,
    headline: input.headline,
    heroUrl: input.heroUrl,
    photoCount: input.photoCount,
    locationLine,
    specLine: specs.join(" · "),
    updatedAtIso: listing.updatedAt.toISOString(),
  };
}
