/**
 * The VIEWINGS tab panel (D13). The authenticated user's viewings from `GET /me/viewings`, split into
 * two sections — กำลังจะถึง (upcoming) / ดูแล้ว (past) — authored to explore-stage5-3-viewings.html.
 * Each row is a `ViewingCard` (date bubble + listing + scheduled time + status). A section is omitted
 * when empty; when BOTH are empty the empty state shows. Lives inside the MyListingsScreen shell.
 */
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { ErrorView, Loading, ViewingsEmpty } from "../components/States.tsx";
import { ViewingCard } from "../components/ViewingCard.tsx";
import { ApiError } from "../lib/api.ts";
import { detailPath } from "../lib/deeplink.ts";
import type { ViewingDto } from "../lib/types.ts";

export function ViewingsPanel() {
  const { api, t, locale, navigate } = useApp();
  const { state, reload } = useAsync(() => api.viewings(), []);

  if (state.status === "loading") return <Loading label={t("viewing.loading")} />;
  if (state.status === "error") {
    return (
      <ErrorView
        t={t}
        status={state.error instanceof ApiError ? state.error.status : undefined}
        onRetry={reload}
      />
    );
  }

  const { upcoming, past } = state.data;
  if (upcoming.length === 0 && past.length === 0) return <ViewingsEmpty t={t} />;

  const section = (
    titleKey: "viewing.upcomingHead" | "viewing.pastHead",
    rows: readonly ViewingDto[],
    isPast: boolean,
  ) =>
    rows.length === 0 ? null : (
      <section className="grid gap-0" data-viewings-section={isPast ? "past" : "upcoming"}>
        <div
          className="flex items-baseline justify-between px-1 pt-2 pb-1"
          lang="th"
          data-th-content
        >
          {/* Section title — a heading-font label with the mock's amber underline accent. */}
          <h2 className="m-0 inline-block border-warn border-b-2 pb-0.5 font-heading-th font-bold text-sm text-text leading-normal">
            {t(titleKey)}
          </h2>
          <span className="font-body-th text-text-disabled text-xs leading-relaxed">
            {t("viewing.count", { count: rows.length })}
          </span>
        </div>
        <div className="grid">
          {rows.map((v) => (
            <ViewingCard
              key={v.viewingId}
              viewing={v}
              t={t}
              locale={locale}
              isPast={isPast}
              onOpen={() => navigate(detailPath(v.listing.id))}
            />
          ))}
        </div>
      </section>
    );

  return (
    <div className="grid gap-3 px-1">
      {section("viewing.upcomingHead", upcoming, false)}
      {section("viewing.pastHead", past, true)}
    </div>
  );
}
