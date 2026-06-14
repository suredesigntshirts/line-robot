/**
 * The SAVED tab panel (D13). The listings the authenticated user saved, from `GET /me/saved`, rendered
 * with the same `MyListingCard` the my-listings tab uses (the saved DTO is the same slim card shape +
 * `savedAt`). Loading / empty / error states (COPY-07). Lives inside the MyListingsScreen shell (the
 * Header + tab bar are owned there) — it's a tab panel, not its own route.
 */
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { MyListingCard } from "../components/MyListingCard.tsx";
import { ErrorView, Loading, SavedEmpty } from "../components/States.tsx";
import { apiStatus } from "../lib/api.ts";
import { detailPath } from "../lib/deeplink.ts";

export function SavedPanel() {
  const { api, t, navigate } = useApp();
  const { state, reload } = useAsync(() => api.saved(), []);

  if (state.status === "loading") return <Loading label={t("saved.loading")} />;
  if (state.status === "error") {
    return <ErrorView t={t} status={apiStatus(state.error)} onRetry={reload} />;
  }
  if (state.data.length === 0) return <SavedEmpty t={t} />;

  return (
    <ul className="grid list-none gap-2.5 p-0" data-saved-list>
      {state.data.map((listing) => (
        <li key={listing.id}>
          <MyListingCard listing={listing} t={t} onOpen={() => navigate(detailPath(listing.id))} />
        </li>
      ))}
    </ul>
  );
}
