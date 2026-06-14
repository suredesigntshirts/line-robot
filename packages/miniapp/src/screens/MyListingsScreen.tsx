/**
 * The `/` home = MY-LISTINGS screen (D13). The authenticated owner's claimed listings, fetched from
 * `GET /me/listings`, with a stats summary + the CRM tab bar. Mock: explore-stage5-2-mylistings.html.
 * Public browse lives on the website (out of scope); this is the authenticated CRM/claim surface.
 *
 * Tabs: ประกาศของฉัน (this screen) is the only one Build B wires; บันทึกไว้ / นัดดูทรัพย์ are ADDITIVE
 * (Build C/D) — selecting them shows the ComingSoon panel (no premature route/fetch).
 */
import { Screen } from "@line-robot/ui";
import { useState } from "react";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { ComingSoon } from "../components/ComingSoon.tsx";
import { type CrmTab, Header } from "../components/Header.tsx";
import { MyListingCard } from "../components/MyListingCard.tsx";
import { EmptyListings, ErrorView, Loading } from "../components/States.tsx";
import { computeStats, StatsStrip } from "../components/StatsStrip.tsx";
import { ApiError } from "../lib/api.ts";
import { detailPath } from "../lib/deeplink.ts";

export function MyListingsScreen() {
  const { api, t, locale, navigate } = useApp();
  const [tab, setTab] = useState<CrmTab>("listings");
  const { state, reload } = useAsync(() => api.myListings(), []);

  return (
    <Screen lang={locale}>
      <Header t={t} active={tab} onSelect={setTab} />

      {tab !== "listings" ? (
        <ComingSoon t={t} />
      ) : state.status === "loading" ? (
        <Loading label={t("crm.loading")} />
      ) : state.status === "error" ? (
        <ErrorView
          t={t}
          status={state.error instanceof ApiError ? state.error.status : undefined}
          onRetry={reload}
        />
      ) : (
        // Ready: the stats strip (one computeStats call) over either the empty state or the cards.
        <>
          <StatsStrip stats={computeStats(state.data)} t={t} />
          {state.data.length === 0 ? (
            <EmptyListings t={t} />
          ) : (
            <ul className="grid list-none gap-2.5 p-0">
              {state.data.map((listing) => (
                <li key={listing.id}>
                  <MyListingCard
                    listing={listing}
                    t={t}
                    onOpen={() => navigate(detailPath(listing.id))}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Screen>
  );
}
