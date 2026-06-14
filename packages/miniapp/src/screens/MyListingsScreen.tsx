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
import { useState } from "react";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { type CrmTab, Header } from "../components/Header.tsx";
import { MyListingCard } from "../components/MyListingCard.tsx";
import { EmptyListings, ErrorView, Loading } from "../components/States.tsx";
import { computeStats, StatsStrip } from "../components/StatsStrip.tsx";
import { apiStatus } from "../lib/api.ts";
import { detailPath, editPath } from "../lib/deeplink.ts";
import { SavedPanel } from "./SavedPanel.tsx";
import { ViewingsPanel } from "./ViewingsPanel.tsx";

export function MyListingsScreen() {
  const { locale, t } = useApp();
  const [tab, setTab] = useState<CrmTab>("listings");

  return (
    <Screen lang={locale}>
      <Header t={t} active={tab} onSelect={setTab} />
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

/** The listings tab: the stats strip over the owner's claimed listings (or the empty state). Each card
 * opens the detail; an inline "edit" affordance opens the mini-app edit surface (`/edit/{id}`) — every
 * my-listing is the caller's own (the api scopes `/me/listings` to the claimant). */
function ListingsPanel() {
  const { api, t, navigate } = useApp();
  const { state, reload } = useAsync(() => api.myListings(), []);

  if (state.status === "loading") return <Loading label={t("crm.loading")} />;
  if (state.status === "error") {
    return <ErrorView t={t} status={apiStatus(state.error)} onRetry={reload} />;
  }

  return (
    <>
      <StatsStrip stats={computeStats(state.data)} t={t} />
      {state.data.length === 0 ? (
        <EmptyListings t={t} />
      ) : (
        <ul className="grid list-none gap-2.5 p-0">
          {state.data.map((listing) => (
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
