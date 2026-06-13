import type { DealType, ListingType, PropertyType, SaleCondition } from "@line-robot/domain";
import { dealType, listingType, propertyType, saleCondition } from "@line-robot/domain";

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
  page: number;
}

/** Parse browse filters from URL search params; unknown values are dropped, page clamps to ≥1. */
export function parseBrowseQuery(params: URLSearchParams): BrowseQuery {
  const deal = dealType.safeParse(params.get("deal"));
  const ptype = propertyType.safeParse(params.get("type"));
  const ltype = listingType.safeParse(params.get("ltype"));
  const cond = saleCondition.safeParse(params.get("cond"));
  const province = (params.get("province") ?? "").trim().slice(0, 60);
  const text = (params.get("q") ?? "").trim().slice(0, 100);
  const rawPage = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    ...(deal.success ? { dealType: deal.data } : {}),
    ...(ptype.success ? { propertyType: ptype.data } : {}),
    // `normal`/`unknown` are the non-filtered defaults — never a filter value, so drop them.
    ...(ltype.success && ltype.data !== "normal" ? { listingType: ltype.data } : {}),
    ...(cond.success && cond.data !== "unknown" ? { saleCondition: cond.data } : {}),
    ...(province !== "" ? { province } : {}),
    ...(text !== "" ? { text } : {}),
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
  if (q.page > 1) params.set("page", String(q.page));
  const s = params.toString();
  return s === "" ? "" : `?${s}`;
}
