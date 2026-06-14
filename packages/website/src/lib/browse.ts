import type { DealType, ListingType, PropertyType, SaleCondition } from "@line-robot/domain";
import { dealType, listingType, propertyType, saleCondition } from "@line-robot/domain";

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
  const rawPage = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    ...(deal.success ? { dealType: deal.data } : {}),
    ...(ptype.success ? { propertyType: ptype.data } : {}),
    // `normal`/`unknown` are the non-filtered defaults — never a filter value, so drop them.
    ...(ltype.success && ltype.data !== "normal" ? { listingType: ltype.data } : {}),
    ...(cond.success && cond.data !== "unknown" ? { saleCondition: cond.data } : {}),
    ...(province !== "" ? { province } : {}),
    ...(text !== "" ? { text } : {}),
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
