/**
 * The `/admin/vetting` ADMIN VETTING QUEUE (Stage 6, D-S6-5/8). Lists the PENDING broker/investor role
 * applications (`GET /admin/role-applications`) → approve/reject each (`POST /admin/role-applications/
 * {roleId}`) → the row resolves.
 *
 * SERVER-AUTHORITATIVE: the route is server-gated (a non-admin's GET 404s). The shared {@link
 * AdminQueueScreen} renders the calm "no access" state on a 404/403 — the UI never asserts the caller's
 * own admin-ness. A stale/double decision the server already resolved is a 409 → a calm "already
 * decided" note (the prior decision STANDS).
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
import type { AdminRoleApplicationDto, ApplyRoleKind } from "../lib/types.ts";

export function AdminVettingScreen() {
  const { api, t } = useApp();
  return (
    <AdminQueueScreen<AdminRoleApplicationDto>
      title={t("adminVetting.title")}
      emptyLabel={t("adminVetting.empty")}
      loadingLabel={t("admin.loading")}
      fetcher={() => api.adminRoleApplications()}
      keyOf={(a) => a.roleId}
      deps={[]}
      renderRow={(app, tr) => <VettingRow app={app} t={tr} />}
    />
  );
}

/** The localized role-kind label for a queue row. */
function kindLabel(kind: ApplyRoleKind, t: Translator): string {
  return kind === "investor" ? t("adminVetting.kindInvestor") : t("adminVetting.kindBroker");
}

/** One application row: the applicant + the kind, plus the approve/reject control. Once resolved
 * (success / 409) it shows a calm green ✓ note; a transient error keeps the buttons and surfaces a red
 * inline message (so the admin can retry). The resolve call hits `POST /admin/role-applications/{roleId}`. */
function VettingRow({ app, t }: { app: AdminRoleApplicationDto; t: Translator }) {
  const { api } = useApp();
  const { busy, outcome, error, resolve } = useRowResolve(
    (decision) => api.adminVetRole(app.roleId, decision),
    t("adminVetting.error"),
  );

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-3 shadow-xs">
      <div className="grid min-w-0 gap-0.5">
        <span className="truncate font-body-th font-semibold text-base text-text leading-relaxed">
          {app.displayName}
        </span>
        <span className="font-body-th text-sm text-text-2 leading-relaxed">
          {kindLabel(app.kind, t)}
        </span>
      </div>
      {outcome === null ? (
        <div className="grid justify-items-end gap-1.5">
          <ResolveButtons
            t={t}
            busy={busy}
            approveLabel={t("adminVetting.approve")}
            rejectLabel={t("adminVetting.reject")}
            onResolve={resolve}
          />
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
        <ResolvedNote label={outcomeLabel(outcome, t, "adminVetting")} />
      )}
    </div>
  );
}
