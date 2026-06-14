/**
 * The CRM app header + tab bar (D13: my listings / saved / viewings). Mock-faithful to `.app-header` +
 * `.tab-bar` in explore-stage5-2-mylistings.html, authored in Tailwind utilities. The three tabs are
 * the D13 owner surfaces; tapping one swaps the panel beneath (MyListingsScreen owns the switch — these
 * are tabs, not routes). `data-th-content` marks the Thai chrome so the TH-07 line-height net measures it.
 */
import type { Translator } from "@line-robot/ui";

export type CrmTab = "listings" | "saved" | "viewings";

const TABS: ReadonlyArray<{
  id: CrmTab;
  labelKey: "tab.myListings" | "tab.saved" | "tab.viewings";
}> = [
  { id: "listings", labelKey: "tab.myListings" },
  { id: "saved", labelKey: "tab.saved" },
  { id: "viewings", labelKey: "tab.viewings" },
];

export function Header({
  t,
  active,
  onSelect,
}: {
  t: Translator;
  active: CrmTab;
  onSelect: (tab: CrmTab) => void;
}) {
  return (
    <header className="border-border border-b bg-surface shadow-xs" lang="th" data-th-content>
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
        <div className="min-w-0 flex-1">
          <div className="font-heading-th font-bold text-base text-text leading-snug">
            {t("app.accountTitle")}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-border border-t" role="tablist">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-tab={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`flex-1 border-b-2 px-1 py-2 font-body-th text-xs leading-relaxed transition-colors ${
                isActive
                  ? "border-primary-500 font-semibold text-primary-500"
                  : "border-transparent text-text-disabled"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>
    </header>
  );
}
