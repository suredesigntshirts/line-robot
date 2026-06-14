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
  /** CONV-08 distance from the search point on a radius search, pre-localized; "" otherwise. */
  distanceLine: string;
  updatedAtIso: string;
}

export interface CardViewInput {
  listing: Listing;
  headline: string;
  heroUrl: string | null;
  photoCount: number;
  /** Localized fragments the caller's translator produced; "" = not applicable. */
  bedroomsLabel: string;
  bathroomsLabel: string;
  /** COMP-06 new-vs-resale, pre-localized; "" when unstated (omitted from the spec line). */
  conditionLabel?: string;
  /** CONV-08 distance-from-search-point, pre-localized (e.g. "2.1 กม."); shown on a radius search,
   * undefined/"" otherwise. Search context, not a listing attribute — the caller supplies the text. */
  distanceLabel?: string;
}

export function toCardView(input: CardViewInput): CardView {
  const { listing } = input;
  const locationLine = [listing.landmark, listing.tambon, listing.amphoe]
    .filter((part): part is string => part !== null && part !== "")
    .join(" · ");
  const specs: string[] = [];
  if (input.bedroomsLabel !== "") specs.push(input.bedroomsLabel);
  if (input.bathroomsLabel !== "") specs.push(input.bathroomsLabel);
  // COPY-06/FIELD-09: land is rai/ngan/wah FIRST (zero parts suppressed); built space is ตร.ม.
  const landParts: string[] = [];
  if (listing.landRai) landParts.push(`${listing.landRai} ไร่`);
  if (listing.landNgan) landParts.push(`${listing.landNgan} งาน`);
  if (listing.landWah) landParts.push(`${listing.landWah} ตร.ว.`);
  if (listing.propertyType === "land" && landParts.length > 0) {
    specs.push(landParts.join(" "));
  } else if (listing.floorAreaSqm !== null) {
    specs.push(`${listing.floorAreaSqm} ตร.ม.`);
  } else if (landParts.length > 0) {
    specs.push(landParts.join(" "));
  } else if (listing.landSqm !== null) {
    specs.push(`${listing.landSqm} ตร.ม.`);
  }
  // COMP-06: new-vs-resale is subtle card meta — trails the physical specs, omitted when unstated.
  if (input.conditionLabel) specs.push(input.conditionLabel);
  return {
    id: listing.id,
    headline: input.headline,
    heroUrl: input.heroUrl,
    photoCount: input.photoCount,
    locationLine,
    specLine: specs.join(" · "),
    distanceLine: input.distanceLabel ?? "",
    updatedAtIso: listing.updatedAt.toISOString(),
  };
}
