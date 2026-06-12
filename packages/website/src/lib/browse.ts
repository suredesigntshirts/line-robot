import type { DealType, PropertyType } from "@line-robot/domain";
import { dealType, propertyType } from "@line-robot/domain";

export interface BrowseQuery {
  dealType?: DealType;
  propertyType?: PropertyType;
  page: number;
}

/** Parse browse filters from URL search params; unknown values are dropped, page clamps to ≥1. */
export function parseBrowseQuery(params: URLSearchParams): BrowseQuery {
  const deal = dealType.safeParse(params.get("deal"));
  const ptype = propertyType.safeParse(params.get("type"));
  const rawPage = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    ...(deal.success ? { dealType: deal.data } : {}),
    ...(ptype.success ? { propertyType: ptype.data } : {}),
    page: Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1,
  };
}

/** Serialize back to a query string ("" when everything is default). */
export function browseQueryString(q: BrowseQuery): string {
  const params = new URLSearchParams();
  if (q.dealType) params.set("deal", q.dealType);
  if (q.propertyType) params.set("type", q.propertyType);
  if (q.page > 1) params.set("page", String(q.page));
  const s = params.toString();
  return s === "" ? "" : `?${s}`;
}
