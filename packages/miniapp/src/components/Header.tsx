/**
 * The CRM app header + tab bar (D13: my listings / saved / viewings). Mock-faithful to `.app-header` +
 * `.tab-bar` in explore-stage5-2-mylistings.html, authored in Tailwind utilities. The header now
 * carries the Stage-5 identity chrome (S5-5): the "ทรัพย์ดี" wordmark, the viewer's avatar (LIFF
 * `pictureUrl`, or an initial-based fallback), and the display name (all real LIFF profile fields that
 * resolve in production). A source-group label returns in Stage 6 with real group data. The three tabs
 * are the D13 owner surfaces; tapping one swaps the panel beneath (MyListingsScreen owns the switch —
 * these are tabs, not routes). `data-th-content` marks the Thai chrome so the TH-07 line-height net
 * measures it.
 */
import type { Translator } from "@line-robot/ui";
import type { LiffProfile } from "../lib/liff.ts";

export type CrmTab = "listings" | "saved" | "viewings";

const TABS: ReadonlyArray<{
  id: CrmTab;
  labelKey: "tab.myListings" | "tab.saved" | "tab.viewings";
}> = [
  { id: "listings", labelKey: "tab.myListings" },
  { id: "saved", labelKey: "tab.saved" },
  { id: "viewings", labelKey: "tab.viewings" },
];

/** The identity avatar: the LIFF profile picture when granted, else an initial-based fallback on a
 * token surface (never a broken/empty box). The fallback initial is the first grapheme of the name. */
function Avatar({ profile }: { profile?: LiffProfile }) {
  const name = profile?.displayName ?? "";
  const initial = [...name][0] ?? "?";
  if (profile?.pictureUrl) {
    return (
      <img
        src={profile.pictureUrl}
        alt={name}
        data-identity-avatar
        className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
      />
    );
  }
  return (
    <span
      data-identity-avatar
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 font-heading-th font-bold text-primary-600 text-sm"
    >
      {initial}
    </span>
  );
}

export function Header({
  t,
  active,
  onSelect,
  profile,
}: {
  t: Translator;
  active: CrmTab;
  onSelect: (tab: CrmTab) => void;
  profile?: LiffProfile;
}) {
  return (
    <header className="border-border border-b bg-surface shadow-xs" lang="th" data-th-content>
      {/* Identity row: wordmark + avatar + name (S5-5). */}
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2.5">
        <Avatar profile={profile} />
        <div className="min-w-0 flex-1">
          <div className="font-heading-th font-bold text-base text-text leading-snug">
            {profile?.displayName ?? t("app.accountTitle")}
          </div>
        </div>
        {/* Brand wordmark (FQ-4: working name "ทรัพย์ดี" until a brand is settled). */}
        <span
          data-wordmark
          className="shrink-0 font-heading-th font-bold text-base text-primary-600 leading-none"
        >
          {t("app.wordmark")}
        </span>
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
