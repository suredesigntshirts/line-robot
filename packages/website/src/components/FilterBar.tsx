import { dealType, propertyType } from "@line-robot/domain";
import { createTranslator, type FilterGroup, SearchFilters, type UiLocale } from "@line-robot/ui";
import type { BrowseQuery } from "../lib/browse.ts";
import { browseQueryString } from "../lib/browse.ts";

interface FilterBarProps {
  query: BrowseQuery;
  locale: UiLocale;
  basePath: string;
}

/**
 * Client island: wraps the stateless SearchFilters (D3.9 — host owns querying) and
 * navigates on toggle. Single-select per group; chip ids are "<group>:<value>".
 */
export function FilterBar({ query, locale, basePath }: FilterBarProps) {
  const t = createTranslator(locale);
  const groups: FilterGroup[] = [
    {
      id: "deal",
      label: t("filter.dealType"),
      chips: dealType.options.map((v) => ({
        id: `deal:${v}`,
        label: t(v === "sale" ? "badge.forSale" : "badge.forRent"),
      })),
    },
    {
      id: "type",
      label: t("filter.propertyType"),
      chips: propertyType.options.map((v) => ({ id: `type:${v}`, label: t(`ptype.${v}`) })),
    },
  ];

  const value = [
    ...(query.dealType ? [`deal:${query.dealType}`] : []),
    ...(query.propertyType ? [`type:${query.propertyType}`] : []),
  ];

  const navigate = (next: string[]) => {
    // Last toggle wins inside a group (single-select); page resets on any change.
    const pick = (group: "deal" | "type") => {
      const inGroup = next.filter((id) => id.startsWith(`${group}:`));
      const previous = value.filter((id) => id.startsWith(`${group}:`));
      const fresh = inGroup.filter((id) => !previous.includes(id));
      return (fresh[0] ?? inGroup[0])?.slice(group.length + 1);
    };
    const deal = dealType.safeParse(pick("deal"));
    const ptype = propertyType.safeParse(pick("type"));
    const target: BrowseQuery = {
      ...(deal.success ? { dealType: deal.data } : {}),
      ...(ptype.success ? { propertyType: ptype.data } : {}),
      page: 1,
    };
    window.location.assign(`${basePath}/${browseQueryString(target)}`);
  };

  return <SearchFilters groups={groups} value={value} onChange={navigate} t={t} />;
}
