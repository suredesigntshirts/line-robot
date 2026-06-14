import type { DealType, ListingType, PropertyType, SaleCondition } from "@line-robot/domain";
import { dealType, listingType, propertyType, saleCondition } from "@line-robot/domain";
import type { MessageKey } from "@line-robot/ui";

/** CONV-08 radius search: a centre point + a radius from the fixed allow-list. */
export interface GeoQuery {
  lat: number;
  lng: number;
  /** Metres — one of {@link RADIUS_OPTIONS_M}. */
  radiusM: number;
}

/** Selectable radii (metres): 1 / 3 / 5 / 10 km. The default the near-me control fills is 3 km —
 * a Chiang Mai neighbourhood is ~2-3 km across (MKT-04 district granularity), so it returns a
 * useful set without sprawling province-wide. Any `radius` not in this list is rejected (clamped). */
export const RADIUS_OPTIONS_M = [1000, 3000, 5000, 10000] as const;
export const DEFAULT_RADIUS_M = 3000;

/** A predefined price bracket: a stable id (carried in the URL), a label key, and the THB bounds.
 * `min` is inclusive, `max` exclusive (open-ended at the top when `max` is null). 4.3: one
 * contextual control whose bracket SET switches by deal context — sale brackets filter the
 * asking price (`listing.price_thb`), rent brackets the monthly rent (`listing_rental.monthly_rent`). */
export interface PriceBand {
  id: string;
  /** i18n catalog key for the chip label — a real `MessageKey` so the label always resolves. */
  labelKey: MessageKey;
  /** Inclusive lower bound, THB. */
  min: number;
  /** Exclusive upper bound, THB; null = open-ended (no ceiling). */
  max: number | null;
}

/** SALE asking-price brackets (`listing.price_thb`, THB), keyed to the real North-Thai bands in
 * docs/research/a2-market-landscape-north.md: the §3 Implications tick marks ฿1M/3M/5M/10M/20M
 * (line 129), the ฿2–9M "80% of purchases" corridor + ฿4.5M median (Finding 6), and the MKT-12
 * ฿3–5M sweet spot (line 170). Boundaries are the research tick marks, not invented round numbers. */
export const SALE_PRICE_BANDS: readonly PriceBand[] = [
  { id: "s0", labelKey: "price.saleUnder1m", min: 0, max: 1_000_000 },
  { id: "s1", labelKey: "price.sale1to3m", min: 1_000_000, max: 3_000_000 },
  // MKT-12 sweet spot (Thai domestic + Bangkok second-home + entry foreign all compete here).
  { id: "s2", labelKey: "price.sale3to5m", min: 3_000_000, max: 5_000_000 },
  { id: "s3", labelKey: "price.sale5to10m", min: 5_000_000, max: 10_000_000 },
  { id: "s4", labelKey: "price.sale10to20m", min: 10_000_000, max: 20_000_000 },
  { id: "s5", labelKey: "price.saleOver20m", min: 20_000_000, max: null },
] as const;

/** RENT monthly-rent brackets (`listing_rental.monthly_rent`, THB/mo), keyed to the real North-Thai
 * furnished-rent bands in a2-market-landscape-north.md Finding 11 (lines 57-62): studio ฿7–12k,
 * 1-bed ฿10–18k, 2-bed ฿16–35k, family houses ฿20–45k/mo. The bracket edges are the published band
 * bounds: ฿10k (1-bed floor) / ฿18k (1-bed ceiling) / ฿35k (2-bed ceiling). So `r0` (<฿10k) is the
 * studio range, `r1` (฿10–18k) the 1-bed range, `r2` (฿18–35k) spans the upper 2-bed range, and
 * `r3` (>฿35k) the family-house / premium tail. */
export const RENT_PRICE_BANDS: readonly PriceBand[] = [
  { id: "r0", labelKey: "price.rentUnder10k", min: 0, max: 10_000 },
  { id: "r1", labelKey: "price.rent10to18k", min: 10_000, max: 18_000 },
  { id: "r2", labelKey: "price.rent18to35k", min: 18_000, max: 35_000 },
  { id: "r3", labelKey: "price.rentOver35k", min: 35_000, max: null },
] as const;

/** The bracket set in effect for a deal context. Rent shows the monthly-rent brackets; sale AND the
 * "no deal type chosen yet" case both show the asking-price brackets — sale is the dominant Thai
 * path (MKT-01/MKT-12 frame the market in total purchase price), and a price bracket with no deal
 * context honestly filters `price_thb` (the asking price), never conflating sale and rent. */
export function priceBandsFor(deal: DealType | undefined): readonly PriceBand[] {
  return deal === "rent" ? RENT_PRICE_BANDS : SALE_PRICE_BANDS;
}

/** Look up a bracket by id within a deal context (so a `price=r1` can't apply under a sale search). */
export function findPriceBand(
  deal: DealType | undefined,
  id: string | null,
): PriceBand | undefined {
  if (id === null) return undefined;
  return priceBandsFor(deal).find((b) => b.id === id);
}

export interface BrowseQuery {
  dealType?: DealType;
  propertyType?: PropertyType;
  province?: string;
  /** DIST-01/COMP-05: provenance facet (npa | auction). `normal` is not a filter value. */
  listingType?: ListingType;
  /** COMP-06: new-vs-resale facet (new | resale). `unknown` is not a filter value. */
  saleCondition?: SaleCondition;
  /** Free-text search (trimmed, capped — the repo escapes ILIKE metachars). */
  text?: string;
  /** 4.3 contextual price bracket — resolved against the deal context's band set
   * ({@link SALE_PRICE_BANDS} for sale / no-deal, {@link RENT_PRICE_BANDS} for rent). */
  priceBand?: PriceBand;
  /** CONV-08 radius search around a point; present only when lat+lng both parse. */
  near?: GeoQuery;
  page: number;
}

/** Parse a finite number from a param, or null. Rejects NaN/Infinity (and thus injection text). */
function finiteParam(raw: string | null): number | null {
  if (raw === null || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Snap a requested radius to the nearest allowed option (defends a hand-edited `radius=`). */
function normalizeRadius(raw: string | null): number {
  const n = finiteParam(raw);
  if (n === null) return DEFAULT_RADIUS_M;
  return RADIUS_OPTIONS_M.reduce((best, opt) =>
    Math.abs(opt - n) < Math.abs(best - n) ? opt : best,
  );
}

/** Valid WGS84 bounds — a search point outside them is nonsense (dropped, not clamped). */
function parseNear(params: URLSearchParams): GeoQuery | undefined {
  const lat = finiteParam(params.get("lat"));
  const lng = finiteParam(params.get("lng"));
  if (lat === null || lng === null) return undefined;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
  return { lat, lng, radiusM: normalizeRadius(params.get("radius")) };
}

/** Parse browse filters from URL search params; unknown values are dropped, page clamps to ≥1. */
export function parseBrowseQuery(params: URLSearchParams): BrowseQuery {
  const deal = dealType.safeParse(params.get("deal"));
  const ptype = propertyType.safeParse(params.get("type"));
  const ltype = listingType.safeParse(params.get("ltype"));
  const cond = saleCondition.safeParse(params.get("cond"));
  const province = (params.get("province") ?? "").trim().slice(0, 60);
  const text = (params.get("q") ?? "").trim().slice(0, 100);
  const near = parseNear(params);
  // 4.3: the price bracket is resolved within the deal context — a `price=r1` (rent band) under a
  // sale (or no-deal) search finds no match and is dropped, so a hand-edited URL can never apply a
  // rent bracket to the asking-price column or vice-versa.
  const priceBand = findPriceBand(deal.success ? deal.data : undefined, params.get("price"));
  const rawPage = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    ...(deal.success ? { dealType: deal.data } : {}),
    ...(ptype.success ? { propertyType: ptype.data } : {}),
    // `normal`/`unknown` are the non-filtered defaults — never a filter value, so drop them.
    ...(ltype.success && ltype.data !== "normal" ? { listingType: ltype.data } : {}),
    ...(cond.success && cond.data !== "unknown" ? { saleCondition: cond.data } : {}),
    ...(province !== "" ? { province } : {}),
    ...(text !== "" ? { text } : {}),
    ...(priceBand ? { priceBand } : {}),
    ...(near ? { near } : {}),
    page: Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1,
  };
}

/** Serialize back to a query string ("" when everything is default). */
export function browseQueryString(q: BrowseQuery): string {
  const params = new URLSearchParams();
  if (q.dealType) params.set("deal", q.dealType);
  if (q.propertyType) params.set("type", q.propertyType);
  if (q.listingType) params.set("ltype", q.listingType);
  if (q.saleCondition) params.set("cond", q.saleCondition);
  if (q.province) params.set("province", q.province);
  if (q.text) params.set("q", q.text);
  if (q.priceBand) params.set("price", q.priceBand.id);
  if (q.near) {
    // Trim coordinate precision to ~11 m (5 dp) — enough for a search centre, and a shorter,
    // less-fingerprintable shareable URL than raw GPS precision.
    params.set("lat", q.near.lat.toFixed(5));
    params.set("lng", q.near.lng.toFixed(5));
    params.set("radius", String(q.near.radiusM));
  }
  if (q.page > 1) params.set("page", String(q.page));
  const s = params.toString();
  return s === "" ? "" : `?${s}`;
}
