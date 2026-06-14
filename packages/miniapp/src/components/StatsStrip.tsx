/**
 * The my-listings summary strip (mock `.stats-strip`): total / live / draft / closed counts derived
 * from the fetched listings. Code-driven (counts come from the data, never hardcoded). Tailwind
 * utilities + shared tokens; the Thai stat labels are catalog strings.
 */
import type { Translator } from "@line-robot/ui";
import { lifecycleKind } from "../lib/display.ts";
import type { ListingCardDto } from "../lib/types.ts";

export interface ListingStats {
  total: number;
  active: number;
  draft: number;
  closed: number;
}

/** Derive the headline counts from the listings (pure — unit-tested). `closed` = sold + rented +
 * withdrawn (lifecycle-terminal). */
export function computeStats(listings: readonly ListingCardDto[]): ListingStats {
  let active = 0;
  let draft = 0;
  let closed = 0;
  for (const l of listings) {
    const kind = lifecycleKind(l);
    if (kind === "active" || kind === "offer") active += 1;
    else if (kind === "draft") draft += 1;
    else closed += 1; // sold / rented / withdrawn
  }
  return { total: listings.length, active, draft, closed };
}

export function StatsStrip({ stats, t }: { stats: ListingStats; t: Translator }) {
  const items: ReadonlyArray<{
    count: number;
    labelKey: "crm.statTotal" | "crm.statActive" | "crm.statDraft" | "crm.statClosed";
    tone: string;
  }> = [
    { count: stats.total, labelKey: "crm.statTotal", tone: "text-primary-600" },
    { count: stats.active, labelKey: "crm.statActive", tone: "text-[var(--color-success)]" },
    { count: stats.draft, labelKey: "crm.statDraft", tone: "text-text-disabled" },
    { count: stats.closed, labelKey: "crm.statClosed", tone: "text-[var(--color-danger)]" },
  ];
  return (
    <div
      className="flex border-primary-100 border-b bg-primary-50 px-4 py-2.5"
      lang="th"
      data-th-content
    >
      {items.map((item, i) => (
        <div
          key={item.labelKey}
          className={`flex flex-1 flex-col items-center gap-0.5 ${
            i > 0 ? "border-primary-100 border-l" : ""
          }`}
        >
          <div className={`font-latin font-bold text-lg leading-none ${item.tone}`}>
            {item.count}
          </div>
          <div className="text-center text-primary-500 text-xs leading-relaxed">
            {t(item.labelKey)}
          </div>
        </div>
      ))}
    </div>
  );
}
