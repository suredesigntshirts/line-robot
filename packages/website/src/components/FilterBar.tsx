import { dealType, propertyType } from "@line-robot/domain";
import {
  createTranslator,
  type FilterGroup,
  primaryButtonStyle,
  SearchFilters,
  type UiLocale,
} from "@line-robot/ui";
import { useState } from "react";
import type { BrowseQuery } from "../lib/browse.ts";
import { browseQueryString } from "../lib/browse.ts";

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
    ...(query.propertyType ? [`type:${query.propertyType}`] : []),
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
    const province = pick("province");
    const target: BrowseQuery = {
      ...(deal.success ? { dealType: deal.data } : {}),
      ...(ptype.success ? { propertyType: ptype.data } : {}),
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
