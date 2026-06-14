import { dealType, listingType, propertyType, saleCondition } from "@line-robot/domain";
import {
  createTranslator,
  type FilterGroup,
  primaryButtonStyle,
  SearchFilters,
  type UiLocale,
} from "@line-robot/ui";
import { useState } from "react";
import type { BrowseQuery } from "../lib/browse.ts";
import { browseQueryString, findPriceBand, priceBandsFor } from "../lib/browse.ts";

interface FilterBarProps {
  query: BrowseQuery;
  locale: UiLocale;
  basePath: string;
  /** Distinct provinces with public stock (server-provided). */
  provinces: string[];
}

/**
 * Client island: free-text search + the stateless SearchFilters chips (D3.9 —
 * host owns querying); navigates on change. Single-select per group; chip ids
 * are "<group>:<value>".
 */
export function FilterBar({ query, locale, basePath, provinces }: FilterBarProps) {
  const t = createTranslator(locale);
  const [text, setText] = useState(query.text ?? "");

  // 4.3 CONTEXTUAL price control: one bracket group whose chips switch with the selected deal —
  // sale/no-deal shows the asking-price bands, rent shows the monthly-rent bands (priceBandsFor).
  // The bands come from the real North-Thai market (a2-market-landscape-north.md), not round demo
  // brackets. The rent group reads "/เดือน" so the relabel is honest — sale price vs monthly rent
  // is never conflated (MKT-03). Single-select like every other group.
  const priceBands = priceBandsFor(query.dealType);
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
      id: "price",
      label: query.dealType === "rent" ? t("filter.rentRange") : t("filter.priceRange"),
      chips: priceBands.map((b) => ({ id: `price:${b.id}`, label: t(b.labelKey) })),
    },
    {
      id: "type",
      label: t("filter.propertyType"),
      chips: propertyType.options.map((v) => ({ id: `type:${v}`, label: t(`ptype.${v}`) })),
    },
    {
      // COMP-06: new-vs-resale, a first-class facet (only the meaningful members, not `unknown`).
      id: "cond",
      label: t("filter.newVsResale"),
      chips: saleCondition.options
        .filter((v) => v !== "unknown")
        .map((v) => ({ id: `cond:${v}`, label: t(`condition.${v}`) })),
    },
    {
      // DIST-01/COMP-05: provenance facet — bank-owned (NPA) / court-auction stock (not `normal`).
      id: "ltype",
      label: t("filter.npa"),
      chips: listingType.options
        .filter((v) => v !== "normal")
        .map((v) => ({ id: `ltype:${v}`, label: t(`listingType.${v}`) })),
    },
    ...(provinces.length > 1
      ? [
          {
            id: "province",
            label: t("filter.province"),
            chips: provinces.map((p) => ({ id: `province:${p}`, label: p })),
          },
        ]
      : []),
  ];

  const value = [
    ...(query.dealType ? [`deal:${query.dealType}`] : []),
    ...(query.priceBand ? [`price:${query.priceBand.id}`] : []),
    ...(query.propertyType ? [`type:${query.propertyType}`] : []),
    ...(query.saleCondition ? [`cond:${query.saleCondition}`] : []),
    ...(query.listingType ? [`ltype:${query.listingType}`] : []),
    ...(query.province ? [`province:${query.province}`] : []),
  ];

  const navigate = (next: string[]) => {
    // Last toggle wins inside a group (single-select); page resets on any change.
    const pick = (group: string) => {
      const inGroup = next.filter((id) => id.startsWith(`${group}:`));
      const previous = value.filter((id) => id.startsWith(`${group}:`));
      const fresh = inGroup.filter((id) => !previous.includes(id));
      return (fresh[0] ?? inGroup[0])?.slice(group.length + 1);
    };
    const deal = dealType.safeParse(pick("deal"));
    const ptype = propertyType.safeParse(pick("type"));
    const cond = saleCondition.safeParse(pick("cond"));
    const ltype = listingType.safeParse(pick("ltype"));
    const province = pick("province");
    const nextDeal = deal.success ? deal.data : undefined;
    // 4.3: resolve the price bracket against the NEW deal context — switching Buy↔Rent drops a
    // bracket that doesn't exist in the new band set (a sale id won't resolve under rent), so the
    // single contextual control can never carry a sale bracket into a rent search or vice-versa.
    const priceBand = findPriceBand(nextDeal, pick("price") ?? null);
    const target: BrowseQuery = {
      ...(nextDeal ? { dealType: nextDeal } : {}),
      ...(priceBand ? { priceBand } : {}),
      ...(ptype.success ? { propertyType: ptype.data } : {}),
      ...(cond.success && cond.data !== "unknown" ? { saleCondition: cond.data } : {}),
      ...(ltype.success && ltype.data !== "normal" ? { listingType: ltype.data } : {}),
      ...(province ? { province } : {}),
      ...(text.trim() !== "" ? { text: text.trim() } : {}),
      page: 1,
    };
    window.location.assign(`${basePath}/${browseQueryString(target)}`);
  };

  return (
    <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(value); // same selection; picks up the typed text
        }}
        style={{ display: "flex", gap: "var(--spacing-2)" }}
      >
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("filter.searchPlaceholder")}
          maxLength={100}
          lang={locale}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "var(--spacing-2) var(--spacing-3)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-2)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            fontSize: "var(--text-base)",
            fontFamily: "var(--font-body-th)",
          }}
        />
        <button type="submit" style={primaryButtonStyle}>
          {t("filter.search")}
        </button>
      </form>
      <SearchFilters groups={groups} value={value} onChange={navigate} t={t} />
    </div>
  );
}
