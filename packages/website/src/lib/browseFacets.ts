import { listingType, propertyType, saleCondition } from "@line-robot/domain";
import type { MessageKey, Translator } from "@line-robot/ui";
import {
  BEDROOM_OPTIONS,
  type BrowseQuery,
  browseQueryString,
  findPriceBand,
  priceBandsFor,
  SORT_OPTIONS,
} from "./browse.ts";

/**
 * The ONE facet model every browse filter UI renders from (sidebar chips, quick rail + sheet,
 * toolbar selects). A group = a URL param + its options + the current value. UIs decide only HOW to
 * present it: as links (`hrefFor`) or as form inputs (`param`/`value`). Single-select per group.
 */
export interface FacetOption {
  value: string;
  label: string;
}
export interface FacetGroup {
  id: "deal" | "price" | "type" | "beds" | "cond" | "ltype" | "province";
  /** URL search param carrying this facet. */
  param: string;
  label: string;
  options: FacetOption[];
  /** Currently selected option value, if any. */
  value?: string;
  /** Shown as a quick filter in the rail variant (the rest live behind "more filters"). */
  primary: boolean;
}

export function facetGroups(query: BrowseQuery, t: Translator, provinces: string[]): FacetGroup[] {
  const groups: FacetGroup[] = [
    {
      id: "deal",
      param: "deal",
      label: t("filter.dealType"),
      options: [
        { value: "sale", label: t("badge.forSale") },
        { value: "rent", label: t("badge.forRent") },
      ],
      value: query.dealType,
      primary: true,
    },
    {
      id: "price",
      param: "price",
      label: query.dealType === "rent" ? t("filter.rentRange") : t("filter.priceRange"),
      options: priceBandsFor(query.dealType).map((b) => ({ value: b.id, label: t(b.labelKey) })),
      value: query.priceBand?.id,
      primary: true,
    },
    {
      id: "type",
      param: "type",
      label: t("filter.propertyType"),
      options: propertyType.options.map((v) => ({
        value: v,
        label: t(`ptype.${v}` as MessageKey),
      })),
      value: query.propertyType,
      primary: true,
    },
    {
      id: "beds",
      param: "beds",
      label: t("browse.beds"),
      options: BEDROOM_OPTIONS.map((n) => ({
        value: String(n),
        label: t("browse.bedsMin", { n }),
      })),
      value: query.minBedrooms === undefined ? undefined : String(query.minBedrooms),
      primary: true,
    },
    {
      id: "cond",
      param: "cond",
      label: t("filter.newVsResale"),
      options: saleCondition.options
        .filter((v) => v !== "unknown")
        .map((v) => ({ value: v, label: t(`condition.${v}` as MessageKey) })),
      value: query.saleCondition,
      primary: false,
    },
    {
      id: "ltype",
      param: "ltype",
      label: t("filter.npa"),
      options: listingType.options
        .filter((v) => v !== "normal")
        .map((v) => ({ value: v, label: t(`listingType.${v}` as MessageKey) })),
      value: query.listingType,
      primary: false,
    },
  ];
  if (provinces.length > 1) {
    groups.push({
      id: "province",
      param: "province",
      label: t("filter.province"),
      options: provinces.map((p) => ({ value: p, label: p })),
      value: query.province,
      primary: false,
    });
  }
  return groups;
}

/** Price bands for BOTH deal contexts (the sheet renders both and shows the one matching the deal). */
export function priceOptionsByDeal(t: Translator): Record<"sale" | "rent", FacetOption[]> {
  return {
    sale: priceBandsFor("sale").map((b) => ({ value: b.id, label: t(b.labelKey) })),
    rent: priceBandsFor("rent").map((b) => ({ value: b.id, label: t(b.labelKey) })),
  };
}

/** Sort options as a facet-like list (label per option). */
export function sortOptions(t: Translator): FacetOption[] {
  const labels: Record<(typeof SORT_OPTIONS)[number], string> = {
    newest: t("sort.newest"),
    price_asc: t("sort.priceAsc"),
    price_desc: t("sort.priceDesc"),
  };
  return SORT_OPTIONS.map((v) => ({ value: v, label: labels[v] }));
}

/** The current query as URLSearchParams (page dropped — every facet change restarts at page 1). */
function baseParams(query: BrowseQuery): URLSearchParams {
  const params = new URLSearchParams(browseQueryString({ ...query, page: 1 }));
  params.delete("page");
  return params;
}

/** Browse URL with ONE facet set (or cleared when `value` is undefined). Changing the deal drops the
 * price bracket (a sale band cannot apply to rent); changing the province drops the district. */
export function hrefFor(
  browseHref: string,
  query: BrowseQuery,
  param: string,
  value: string | undefined,
): string {
  const params = baseParams(query);
  if (value === undefined || value === "") params.delete(param);
  else params.set(param, value);
  if (param === "deal") params.delete("price");
  if (param === "province") params.delete("area");
  // Defensive: a price id must exist in the band set of the resulting deal context.
  const deal = params.get("deal");
  const price = params.get("price");
  if (
    price &&
    !findPriceBand(deal === "rent" ? "rent" : deal === "sale" ? "sale" : undefined, price)
  ) {
    params.delete("price");
  }
  const qs = params.toString();
  return qs === "" ? browseHref : `${browseHref}?${qs}`;
}

/** Hidden inputs so a GET form keeps every active param except the ones it edits itself. */
export function hiddenInputs(query: BrowseQuery, except: string[]): Array<[string, string]> {
  const params = baseParams(query);
  for (const p of except) params.delete(p);
  return [...params];
}

/** Number of active facets (for the "Filters (n)" badge). */
export function activeFacetCount(query: BrowseQuery): number {
  return [
    query.dealType,
    query.priceBand,
    query.propertyType,
    query.minBedrooms,
    query.saleCondition,
    query.listingType,
    query.province,
    query.amphoe,
    query.text,
  ].filter((v) => v !== undefined && v !== "").length;
}
