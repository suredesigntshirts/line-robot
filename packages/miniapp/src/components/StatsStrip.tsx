/**
 * The my-listings summary strip (mock `.stats-strip`): a FIVE-stat count strip —
 * total / live / under-offer / draft / closed — derived from the fetched listings (S5-5: matches the
 * mock's 5 tiles, where the old strip had 4). Code-driven (counts come from the data, never
 * hardcoded). Tailwind utilities + shared tokens; the Thai stat labels are catalog strings; each
 * tile's count is tinted to its lifecycle tone (matches the mock's coloured counts).
 */
import type { Translator } from "@line-robot/ui";
import { lifecycleFilterBucket, lifecycleKind } from "../lib/display.ts";
import type { ListingCardDto } from "../lib/types.ts";

export interface ListingStats {
  total: number;
  /** Live = published & available (lifecycle `active`). */
  active: number;
  /** Under-offer = reserved / under-contract (lifecycle `offer`). */
  offer: number;
  draft: number;
  /** Closed = sold + rented + withdrawn (lifecycle-terminal). */
  closed: number;
}

/** Derive the five headline counts from the listings (pure — unit-tested). Tallies via the SINGLE
 * `lifecycleFilterBucket` source of truth (display.ts) so the stats tiles and the filter chips can't
 * desync (the four non-total tiles ARE the four chip buckets). `total = listings.length`. */
export function computeStats(listings: readonly ListingCardDto[]): ListingStats {
  const tally = { active: 0, offer: 0, draft: 0, closed: 0 };
  for (const l of listings) {
    tally[lifecycleFilterBucket(lifecycleKind(l))] += 1;
  }
  return { total: listings.length, ...tally };
}

export function StatsStrip({ stats, t }: { stats: ListingStats; t: Translator }) {
  const items: ReadonlyArray<{
    count: number;
    labelKey:
      | "crm.statTotal"
      | "crm.statActive"
      | "crm.statOffer"
      | "crm.statDraft"
      | "crm.statClosed";
    tone: string;
  }> = [
    { count: stats.total, labelKey: "crm.statTotal", tone: "text-primary-600" },
    { count: stats.active, labelKey: "crm.statActive", tone: "text-[var(--color-success)]" },
    { count: stats.offer, labelKey: "crm.statOffer", tone: "text-[var(--badge-reserved-text)]" },
    { count: stats.draft, labelKey: "crm.statDraft", tone: "text-text-disabled" },
    { count: stats.closed, labelKey: "crm.statClosed", tone: "text-[var(--color-danger)]" },
  ];
  return (
    <div
      className="flex border-primary-100 border-b bg-primary-50 px-3 py-2.5"
      lang="th"
      data-th-content
      data-stats-strip
    >
      {items.map((item, i) => (
        <div
          key={item.labelKey}
          data-stat={item.labelKey}
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
