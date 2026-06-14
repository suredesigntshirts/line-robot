import type { DealType, PropertyType } from "./enums.ts";

// ---------------------------------------------------------------------------
// Stage 6 (D-S6-6) — the quick-quote matching seam. PURE + swappable: the
// caller (INC-B2) supplies the already-vetted candidates (approved broker /
// investor users + their broker_preference) from the DB; this decides the
// overlap. v1 overlap = province ∩ property-type ∩ price-band; richer ranking
// (weighting/radius/deal-history) is a queued seam swap, not built here.
// ---------------------------------------------------------------------------

/**
 * A predefined price bracket: a stable id, the THB lower bound (inclusive) and upper bound
 * (exclusive; `null` = open-ended at the top). The CANONICAL copy of the Stage-4 North-Thai bands —
 * the website's `SALE_PRICE_BANDS`/`RENT_PRICE_BANDS` (packages/website/src/lib/browse.ts) should
 * converge onto these later (they currently duplicate the same boundaries with i18n label keys).
 */
export interface PriceBand {
  id: string;
  /** Inclusive lower bound, THB. */
  min: number;
  /** Exclusive upper bound, THB; `null` = open-ended (no ceiling). */
  max: number | null;
}

/** SALE asking-price bands — North-Thai tick marks ฿0 / 1M / 3M / 5M / 10M / 20M (a2 market landscape). */
export const SALE_PRICE_BANDS: readonly PriceBand[] = [
  { id: "s0", min: 0, max: 1_000_000 },
  { id: "s1", min: 1_000_000, max: 3_000_000 },
  { id: "s2", min: 3_000_000, max: 5_000_000 },
  { id: "s3", min: 5_000_000, max: 10_000_000 },
  { id: "s4", min: 10_000_000, max: 20_000_000 },
  { id: "s5", min: 20_000_000, max: null },
] as const;

/** RENT monthly-rent bands — ฿0 / 10k / 18k / 35k (a2 furnished-rent bands). */
export const RENT_PRICE_BANDS: readonly PriceBand[] = [
  { id: "r0", min: 0, max: 10_000 },
  { id: "r1", min: 10_000, max: 18_000 },
  { id: "r2", min: 18_000, max: 35_000 },
  { id: "r3", min: 35_000, max: null },
] as const;

export function priceBandsFor(dealType: DealType): readonly PriceBand[] {
  return dealType === "rent" ? RENT_PRICE_BANDS : SALE_PRICE_BANDS;
}

/**
 * The band id an amount falls in (min inclusive, max exclusive; the open-ended top band catches
 * everything above its floor). Throws on a negative amount — a price can't be below the first
 * band's ฿0 floor, so an unmatched amount means a bad input, not a silent miss.
 */
export function priceBandId(dealType: DealType, amountThb: number): string {
  const bands = priceBandsFor(dealType);
  const band = bands.find((b) => amountThb >= b.min && (b.max === null || amountThb < b.max));
  if (!band) {
    throw new Error(`priceBandId: amount ${amountThb} (${dealType}) fell in no band`);
  }
  return band.id;
}

/** The listing facts the match runs against. `amountThb` = the asking price (sale) or monthly rent
 * (rent) — the caller picks the right figure per `dealType`. */
export interface MatchListing {
  province: string;
  propertyType: PropertyType;
  dealType: DealType;
  amountThb: number;
}

/** An approved-vetted user's stated preferences (their `broker_preference` row). An EMPTY/absent
 * array on any axis means "any" (no constraint on that axis). */
export interface MatchCandidate {
  userId: string;
  provinces?: readonly string[];
  propertyTypes?: readonly string[];
  priceBandIds?: readonly string[];
}

/** "Any" iff the preference array is absent or empty; otherwise the listing value must be in it. */
function axisMatches(pref: readonly string[] | undefined, value: string): boolean {
  return pref === undefined || pref.length === 0 || pref.includes(value);
}

/**
 * The matched subset of `candidates` for `listing`: a candidate matches when its province pref,
 * property-type pref, AND price-band pref all overlap the listing (each axis independently "any" when
 * its preference array is empty/absent). The caller has ALREADY filtered to approved-vetted users —
 * this is pure overlap logic, the swappable matching seam. Order is preserved.
 */
export function matchVettedUsers<C extends MatchCandidate>(
  listing: MatchListing,
  candidates: readonly C[],
): C[] {
  const band = priceBandId(listing.dealType, listing.amountThb);
  return candidates.filter(
    (c) =>
      axisMatches(c.provinces, listing.province) &&
      axisMatches(c.propertyTypes, listing.propertyType) &&
      axisMatches(c.priceBandIds, band),
  );
}
