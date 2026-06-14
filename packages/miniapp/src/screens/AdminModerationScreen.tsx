/**
 * The `/admin/moderation` ADMIN MODERATION QUEUE (Stage 6, D-S6-5/7). Lists the PENDING gate-failed
 * listings (`GET /admin/moderation`) → record an approve/reject decision on each (`POST /admin/
 * moderation/{id}`) → the row resolves.
 *
 * SERVER-AUTHORITATIVE: server-gated (a non-admin's GET 404s → the shared scaffold's calm "no access"
 * state). A stale/double decision is a 409 → a calm "already decided" note.
 *
 * LEGAL-02 / S6-11 (queued): "approve" RECORDS the review outcome — it does NOT publish the listing
 * (nothing in the publish/public-query path reads moderation status yet). The intro copy says so
 * explicitly so an admin never reads "approve" as "now live".
 */
import type { Translator } from "@line-robot/ui";
import { useApp } from "../app/context.ts";
import {
  AdminQueueScreen,
  outcomeLabel,
  ResolveButtons,
  ResolvedNote,
  useRowResolve,
} from "../components/AdminQueue.tsx";
import type { ModerationItemDto } from "../lib/types.ts";

export function AdminModerationScreen() {
  const { api, t } = useApp();
  return (
    <AdminQueueScreen<ModerationItemDto>
      title={t("adminMod.title")}
      intro={
        <p className="m-0 font-body-th text-sm text-text-2 leading-relaxed">
          {t("adminMod.intro")}
        </p>
      }
      emptyLabel={t("adminMod.empty")}
      loadingLabel={t("admin.loading")}
      fetcher={() => api.adminModeration()}
      keyOf={(m) => m.id}
      deps={[]}
      renderRow={(item, tr) => <ModerationRow item={item} t={tr} />}
    />
  );
}

/** One gate-failed listing row: the headline + the failure reason, plus the approve/reject control.
 * Once resolved (success / 409) it shows a calm green ✓ note; a transient error keeps the buttons and
 * surfaces a red inline message. Resolving hits `POST /admin/moderation/{id}` and RECORDS the decision
 * (LEGAL-02 — it does not publish). */
function ModerationRow({ item, t }: { item: ModerationItemDto; t: Translator }) {
  const { api } = useApp();
  const { busy, outcome, error, resolve } = useRowResolve(
    (decision) => api.adminResolveModeration(item.id, decision),
    t("adminMod.error"),
  );
  const headline = item.headline.trim() !== "" ? item.headline : item.listingId;

  return (
    <div className="grid gap-2.5 rounded-md border border-border bg-surface px-3 py-3 shadow-xs">
      <div className="grid gap-1">
        <span className="font-body-th font-semibold text-base text-text leading-relaxed">
          {headline}
        </span>
        <span className="font-body-th text-sm text-text-2 leading-relaxed">
          {t("adminMod.reason")}:{" "}
          {item.reason && item.reason.trim() !== "" ? item.reason : t("adminMod.noReason")}
        </span>
      </div>
      {outcome === null ? (
        <div className="grid gap-1.5">
          <ResolveButtons
            t={t}
            busy={busy}
            approveLabel={t("adminMod.approve")}
            rejectLabel={t("adminMod.reject")}
            onResolve={resolve}
          />
          {/* LEGAL-02: approve records the review, it does NOT publish — say so where the admin decides. */}
          <p className="m-0 font-body-th text-xs text-text-disabled leading-relaxed">
            {t("adminMod.approveNote")}
          </p>
          {error !== null && (
            <p
              className="m-0 font-body-th text-danger text-xs leading-relaxed"
              role="alert"
              data-resolve-error
            >
              {error}
            </p>
          )}
        </div>
      ) : (
        <ResolvedNote label={outcomeLabel(outcome, t, "adminMod")} />
      )}
    </div>
  );
}
