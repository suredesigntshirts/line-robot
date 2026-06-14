/**
 * The my-listings interactive controls (Stage 5): a rounded SEARCH PILL + the lifecycle FILTER CHIPS
 * row (each chip a coloured dot + label). Mock-faithful to `.search-box`/`.chip` in
 * explore-stage5-2-mylistings.html + direction-a-baania-clean.html. Both are REAL working controls —
 * MyListingsScreen owns the state and filters the loaded list through `passesLifecycleFilter` +
 * `matchesQuery` (display.ts, unit-tested); these components are presentation + event wiring only.
 * `data-th-content` marks the Thai chrome so the TH-07 line-height net measures it.
 */
import type { Translator } from "@line-robot/ui";
import type { LifecycleFilter } from "../lib/display.ts";

/** Each lifecycle chip: its bucket id, label key, and the dot colour (matches the mock's `.chip-dot`).
 * "ทั้งหมด" (all) carries no dot. Static so Tailwind's scanner keeps the colour classes literally. */
const CHIPS: ReadonlyArray<{
  id: LifecycleFilter;
  labelKey:
    | "filter.all"
    | "crm.filterActive"
    | "crm.filterOffer"
    | "crm.filterDraft"
    | "crm.filterClosed";
  dot?: string;
}> = [
  { id: "all", labelKey: "filter.all" },
  { id: "active", labelKey: "crm.filterActive", dot: "bg-[var(--color-success)]" },
  { id: "offer", labelKey: "crm.filterOffer", dot: "bg-[var(--badge-reserved-text)]" },
  { id: "draft", labelKey: "crm.filterDraft", dot: "bg-text-disabled" },
  { id: "closed", labelKey: "crm.filterClosed", dot: "bg-[var(--color-danger)]" },
];

/** The rounded search pill — a real client-side filter over the loaded listings (by headline/location).
 * Controlled input; the screen owns the query string. A clear (✕) button shows when there's a query. */
export function SearchPill({
  t,
  value,
  onChange,
}: {
  t: Translator;
  value: string;
  onChange: (q: string) => void;
}) {
  return (
    <div className="px-3.5 pt-3" lang="th" data-th-content>
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 shadow-xs">
        <span aria-hidden="true" className="text-text-disabled text-sm">
          🔍
        </span>
        <input
          type="search"
          data-search-input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t("crm.searchLabel")}
          placeholder={t("crm.searchPlaceholder")}
          lang="th"
          className="min-w-0 flex-1 bg-transparent font-body-th text-sm text-text leading-relaxed outline-none placeholder:text-text-disabled"
        />
        {value !== "" && (
          <button
            type="button"
            data-search-clear
            onClick={() => onChange("")}
            aria-label={t("crm.searchClear")}
            className="shrink-0 text-text-disabled text-sm leading-none"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/** The horizontally-scrollable lifecycle filter chip row. Tapping a chip selects that bucket (the
 * active one fills primary); the screen narrows the rendered cards to the matching set. */
export function FilterChips({
  t,
  active,
  onSelect,
}: {
  t: Translator;
  active: LifecycleFilter;
  onSelect: (f: LifecycleFilter) => void;
}) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto px-3.5 pt-2.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      lang="th"
      data-th-content
      data-filter-chips
    >
      {CHIPS.map((chip) => {
        const isActive = chip.id === active;
        return (
          <button
            key={chip.id}
            type="button"
            data-filter-chip={chip.id}
            aria-pressed={isActive}
            // The active chip is filled (white-on-primary) — mark it so the WCAG-AA contrast net
            // (assertCtaContrast) covers it in both light + dark projects.
            {...(isActive ? { "data-cta-solid": "" } : {})}
            onClick={() => onSelect(chip.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 font-body-th text-xs leading-relaxed transition-colors ${
              isActive
                ? "border-primary-500 bg-primary-500 font-semibold text-surface"
                : "border-border-2 bg-surface text-text-2"
            }`}
          >
            {chip.dot && (
              <span
                aria-hidden="true"
                className={`size-[7px] shrink-0 rounded-full ${isActive ? "bg-surface" : chip.dot}`}
              />
            )}
            {t(chip.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
