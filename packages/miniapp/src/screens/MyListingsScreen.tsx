/**
 * The `/` home = the CRM SHELL (D13). Owns the account header + the three-tab bar (ประกาศของฉัน /
 * บันทึกไว้ / นัดดูทรัพย์) and switches the panel beneath it. Mock: explore-stage5-2-mylistings.html
 * (+ explore-stage5-3-viewings.html for the viewings tab). Public browse lives on the website (out of
 * scope); this is the authenticated CRM/claim surface.
 *
 * Tabs are PANELS, not routes (the rich-menu/Flex deep links only ever target `/` and `/p/{id}`): the
 * listings tab renders the my-listings cards + stats; saved + viewings render their own fetch-backed
 * panels (Build D). Selecting a tab swaps the panel; the deep-linked frozen shapes are untouched.
 */
import { Screen } from "@line-robot/ui";
import { useMemo, useState } from "react";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { type CrmTab, Header } from "../components/Header.tsx";
import { MyListingCard } from "../components/MyListingCard.tsx";
import { FilterChips, SearchPill } from "../components/MyListingsControls.tsx";
import { EmptyListings, ErrorView, Loading } from "../components/States.tsx";
import { computeStats, StatsStrip } from "../components/StatsStrip.tsx";
import { apiStatus } from "../lib/api.ts";
import { detailPath, editPath } from "../lib/deeplink.ts";
import { type LifecycleFilter, matchesQuery, passesLifecycleFilter } from "../lib/display.ts";
import { SavedPanel } from "./SavedPanel.tsx";
import { ViewingsPanel } from "./ViewingsPanel.tsx";

export function MyListingsScreen() {
  const { locale, t, profile } = useApp();
  const [tab, setTab] = useState<CrmTab>("listings");

  return (
    <Screen lang={locale}>
      <Header t={t} active={tab} onSelect={setTab} profile={profile} />
      {tab === "saved" ? (
        <SavedPanel />
      ) : tab === "viewings" ? (
        <ViewingsPanel />
      ) : (
        <ListingsPanel />
      )}
    </Screen>
  );
}

/** The listings tab: the stats strip + the WORKING controls (search pill + lifecycle filter chips)
 * over the owner's claimed listings (or the empty state). The chips/search filter the loaded list
 * client-side (a real control, not decoration — `passesLifecycleFilter`/`matchesQuery`, unit-tested).
 * Each card opens the detail; an inline "edit" affordance opens the mini-app edit surface (`/edit/{id}`)
 * — every my-listing is the caller's own (the api scopes `/me/listings` to the claimant). */
function ListingsPanel() {
  const { api, t, navigate } = useApp();
  const { state, reload } = useAsync(() => api.myListings(), []);
  const [filter, setFilter] = useState<LifecycleFilter>("all");
  const [query, setQuery] = useState("");

  // ONE post-guard list value, used for the stats, the empty-check, AND the filter source — so the
  // stats source and the filter source can't desync. `[]` until the fetch is ready (the memo runs
  // unconditionally above the early returns per the hook rules; the early returns gate the render).
  const data = state.status === "ready" ? state.data : [];
  // The visible set = the loaded listings narrowed by the active chip + the search query. Memoized so
  // it only recomputes when the data/filter/query change. Stats stay over the FULL set (the strip is a
  // total summary, independent of the current filter).
  const visible = useMemo(
    () => data.filter((l) => passesLifecycleFilter(l, filter) && matchesQuery(l, query, t)),
    [data, filter, query, t],
  );

  if (state.status === "loading") return <Loading label={t("crm.loading")} />;
  if (state.status === "error") {
    return <ErrorView t={t} status={apiStatus(state.error)} onRetry={reload} />;
  }

  if (data.length === 0) return <EmptyListings t={t} />;

  return (
    <>
      <StatsStrip stats={computeStats(data)} t={t} />
      {/* Section header (mock `.section-heading` — bold heading + an accent underline). */}
      <div
        className="px-3.5 pt-3 font-heading-th font-bold text-sm text-text leading-normal"
        lang="th"
        data-th-content
        data-section-header
      >
        <span className="inline-block border-warn border-b-2 pb-0.5">
          {t("crm.sectionListings")}
        </span>
      </div>
      <SearchPill t={t} value={query} onChange={setQuery} />
      <FilterChips t={t} active={filter} onSelect={setFilter} />

      {visible.length === 0 ? (
        // Filtered/searched a non-empty list down to nothing — distinct from the no-listings state.
        <div
          className="grid justify-items-center gap-1 px-4 py-10 text-center font-body-th text-text"
          lang="th"
          data-th-content
          data-state="no-match"
        >
          <div className="font-heading-th font-semibold text-base leading-normal">
            {t("crm.noMatchTitle")}
          </div>
          <div className="text-sm text-text-2 leading-relaxed">{t("crm.noMatchNext")}</div>
        </div>
      ) : (
        <ul className="grid list-none gap-2.5 p-3.5 pt-2.5" data-listings-list>
          {visible.map((listing) => (
            <li key={listing.id} className="grid gap-1">
              <MyListingCard
                listing={listing}
                t={t}
                onOpen={() => navigate(detailPath(listing.id))}
              />
              {/* Owner edit entry → the mini-app edit surface (NOT edit-by-reply, A3a). */}
              <button
                type="button"
                data-edit-listing={listing.id}
                onClick={() => navigate(editPath(listing.id))}
                className="justify-self-end rounded-md border border-border bg-surface px-3 py-1 font-body-th font-semibold text-primary-600 text-xs leading-relaxed"
                lang="th"
              >
                {t("edit.cta")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
