/**
 * Pure client-side filter / sort / search over the List screen's items (no LIFF/DOM imports, so
 * unit-testable). The List shows ALL of the caller's listings — no 12-card cap — and narrows them
 * locally with filter chips (status / type / area), a free-text box (the server-built `search`
 * haystack), and a sort selector.
 */
import type { PropertyListItem } from "@line-robot/shared";

export interface Filters {
  readonly status?: string;
  readonly propertyType?: string;
  readonly area?: string;
  readonly query?: string;
}

export type SortKey = "recency" | "price-asc" | "price-desc";

/** Keep items matching every active filter; an empty/absent filter matches everything. The query
 * matches the server's lowercased `search` haystack OR the visible title. */
export function applyFilters(
  items: readonly PropertyListItem[],
  filters: Filters,
): PropertyListItem[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  return items.filter((item) => {
    if (filters.status !== undefined && item.status !== filters.status) {
      return false;
    }
    if (filters.propertyType !== undefined && item.propertyType !== filters.propertyType) {
      return false;
    }
    if (filters.area !== undefined && item.area !== filters.area) {
      return false;
    }
    if (query !== "") {
      const haystack = `${item.search} ${item.title.toLowerCase()}`;
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

/** Sort a copy of the items. Recency uses `updatedAt` desc; price sorts push missing prices to the
 * end (asc) / start-as-lowest (desc) so unpriced listings never lead a price sort. */
export function sortItems(items: readonly PropertyListItem[], key: SortKey): PropertyListItem[] {
  const copy = [...items];
  switch (key) {
    case "price-asc":
      return copy.sort(
        (a, b) => priceOr(a, Number.POSITIVE_INFINITY) - priceOr(b, Number.POSITIVE_INFINITY),
      );
    case "price-desc":
      return copy.sort(
        (a, b) => priceOr(b, Number.NEGATIVE_INFINITY) - priceOr(a, Number.NEGATIVE_INFINITY),
      );
    default:
      return copy.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }
}

function priceOr(item: PropertyListItem, fallback: number): number {
  return item.priceValue ?? fallback;
}

/** Distinct, sorted values of a chip field across the items (drops absent values). Drives the chip
 * rows so we only offer filters that actually narrow the current set. */
export function distinctValues(
  items: readonly PropertyListItem[],
  key: "status" | "propertyType" | "area",
): string[] {
  const seen = new Set<string>();
  for (const item of items) {
    const value = item[key];
    if (typeof value === "string" && value !== "") {
      seen.add(value);
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}
