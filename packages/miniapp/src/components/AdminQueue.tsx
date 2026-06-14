/**
 * Shared scaffold for the two Stage-6 admin queues (vetting + moderation, D-S6-5). Both are: load a
 * SERVER-GATED list → render rows → approve/reject each → the row resolves out of the queue. The two
 * differ only in the row's content + the resolve call, so the load/gate/empty/error/row-resolution
 * machinery lives here ONCE (a second caller exists → the abstraction is justified, rule 1).
 *
 * SERVER-AUTHORITATIVE ACCESS (the spec invariant, D-S6-5): the UI NEVER asserts the caller's own
 * admin-ness. The admin routes are server-gated — a non-admin's GET returns 404 (and 403 is treated the
 * same). On either, this renders a CALM "no access" state. The queue DATA is only ever rendered when
 * the server actually returned it (an admin), so a member never sees another admin's queue.
 *
 * Authored in Tailwind utilities over the shared `@theme` tokens — NO inline styles. Markers for the
 * frontend gate: `data-th-content` (TH-07) on the Thai body; the resolve CTAs carry `data-cta-solid`.
 */
import { type MessageKey, primaryButtonClass, Screen, type Translator } from "@line-robot/ui";
import type { ReactNode } from "react";
import { useState } from "react";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { BOX, ErrorView, Loading } from "../components/States.tsx";
import { ApiError, apiStatus } from "../lib/api.ts";
import type { AdminDecision } from "../lib/types.ts";

/** The calm, server-authoritative "no access" state — shown when the admin GET 404s/403s (a non-admin).
 * The UI never asserted the user's admin-ness; the SERVER did, and this is its negative answer. Reuses
 * the shared centred `BOX` layout (no re-spelling of the State chrome). */
function NoAccess({ t }: { t: Translator }) {
  return (
    <div className={BOX} data-state="no-access" data-th-content>
      <span aria-hidden="true" className="text-4xl opacity-40">
        🔒
      </span>
      <div className="font-heading-th font-semibold text-md leading-normal">
        {t("admin.noAccessTitle")}
      </div>
      <div className="text-base text-text-2 leading-relaxed">{t("admin.noAccessBody")}</div>
    </div>
  );
}

/** The two-button resolve control on a queue row: approve (the shared solid CTA) + reject (outline
 * danger). `busy` disables both while a decision is in flight; `onResolve` carries the chosen decision.
 * The approve CTA rides the shared `primaryButtonClass` (the contrast-tested base) + small-size
 * overrides — so it stays on the same treatment as the other solid CTAs (InterestSection/QuickSale). */
export function ResolveButtons({
  t,
  busy,
  approveLabel,
  rejectLabel,
  onResolve,
}: {
  t: Translator;
  busy: boolean;
  approveLabel: string;
  rejectLabel: string;
  onResolve: (decision: AdminDecision) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        data-cta-solid
        data-resolve="approved"
        disabled={busy}
        onClick={() => onResolve("approved")}
        className={`${primaryButtonClass} gap-1 px-3 py-2 font-semibold text-sm disabled:opacity-60`}
      >
        {busy ? t("admin.working") : approveLabel}
      </button>
      <button
        type="button"
        data-resolve="rejected"
        disabled={busy}
        onClick={() => onResolve("rejected")}
        className="inline-flex items-center justify-center gap-1 rounded-md border border-danger bg-surface px-3 py-2 font-body-th font-semibold text-sm text-danger leading-relaxed transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {rejectLabel}
      </button>
    </div>
  );
}

/** A row whose resolve outcome was recorded — a calm terminal note (approved/rejected/already-decided).
 * ONLY rendered for a SUCCESS/already-decided outcome (a green ✓); a transient error does NOT resolve
 * the row (it keeps the buttons + shows a red inline error). Kept in place (not removed) so the admin
 * sees the action took effect; a refresh clears the queue. */
export function ResolvedNote({ label }: { label: string }) {
  return (
    <span className="font-body-th font-semibold text-sm text-success leading-relaxed" data-resolved>
      ✓ {label}
    </span>
  );
}

/** The generic admin-queue screen. Loads `fetcher()` (server-gated); a 404/403 → the no-access state.
 * `renderRow` draws each item with whatever resolve control it needs; the title/intro/empty copy + the
 * loading label are passed in. The list is keyed by `keyOf` so a resolved row can update in place. */
export function AdminQueueScreen<T>({
  title,
  intro,
  emptyLabel,
  loadingLabel,
  fetcher,
  keyOf,
  renderRow,
  deps,
}: {
  title: string;
  intro?: ReactNode;
  emptyLabel: string;
  loadingLabel: string;
  fetcher: () => Promise<T[]>;
  keyOf: (item: T) => string;
  renderRow: (item: T, t: Translator) => ReactNode;
  deps: readonly unknown[];
}) {
  const { locale, t } = useApp();
  const { state, reload } = useAsync(fetcher, deps);

  return (
    <Screen lang={locale}>
      {state.status === "loading" ? (
        <Loading label={loadingLabel} />
      ) : state.status === "error" ? (
        // 404 (a non-admin: the route is server-gated) OR 403 → the calm no-access state. Any OTHER
        // error (a transient 5xx / network) reuses the shared ErrorView retry path (still no data leak).
        isAccessDenied(state.error) ? (
          <NoAccess t={t} />
        ) : (
          <ErrorView t={t} onRetry={reload} />
        )
      ) : (
        <article className="grid gap-4" data-admin-queue lang="th" data-th-content>
          <header className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <h1 className="m-0 font-heading-th font-bold text-lg text-text leading-snug">
                {title}
              </h1>
              {intro}
            </div>
            <button
              type="button"
              data-admin-refresh
              onClick={reload}
              className="shrink-0 rounded-md border border-border bg-surface px-3 py-1.5 font-body-th text-sm text-text-2 leading-relaxed transition-opacity hover:opacity-90"
            >
              ↻ {t("admin.refresh")}
            </button>
          </header>

          {state.data.length === 0 ? (
            <p
              className="m-0 px-1 py-8 text-center font-body-th text-base text-text-disabled leading-relaxed"
              data-admin-empty
            >
              {emptyLabel}
            </p>
          ) : (
            <ul className="grid list-none gap-3 p-0">
              {state.data.map((item) => (
                <li key={keyOf(item)} data-admin-row={keyOf(item)}>
                  {renderRow(item, t)}
                </li>
              ))}
            </ul>
          )}
        </article>
      )}
    </Screen>
  );
}

/** A 404/403 from the admin GET means the caller isn't an admin (the route is server-gated) — the
 * server is authoritative, so the UI shows the no-access state for exactly these statuses. */
function isAccessDenied(error: unknown): boolean {
  const status = apiStatus(error);
  return status === 404 || status === 403;
}

/** The TERMINAL outcome of resolving one row — a decision the SERVER recorded, or "already_decided"
 * (a 409: another admin decided it; the prior decision stands). All three resolve the row to a green
 * ✓ note. A transient error (500/network) is NOT in this union — it leaves the row's buttons in place
 * + surfaces a red inline error, so the admin can retry. */
export type RowOutcome = AdminDecision | "already_decided";

/** Map a row outcome to its localized terminal label, parameterized by the screen's namespace prefix
 * (`adminVetting`/`adminMod`) so both screens share ONE switch (they only differ by the prefix). */
export function outcomeLabel(
  outcome: RowOutcome,
  t: Translator,
  ns: "adminVetting" | "adminMod",
): string {
  switch (outcome) {
    case "approved":
      return t(`${ns}.approved` as MessageKey);
    case "rejected":
      return t(`${ns}.rejected` as MessageKey);
    default:
      return t(`${ns}.alreadyDecided` as MessageKey);
  }
}

/** A single row's resolve lifecycle. Each row owns its own (busy + outcome + a transient error) so one
 * resolving row doesn't disable the others. SUCCESS / 409 → a terminal {@link RowOutcome} (the row
 * resolves to a ✓ note). A transient error (non-409) leaves `outcome` NULL (the buttons stay) and sets
 * `error` to a localized message (rendered red) so the admin can retry — never a green "✓ failed". */
export function useRowResolve(
  call: (decision: AdminDecision) => Promise<unknown>,
  errorLabel: string,
) {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<RowOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resolve(decision: AdminDecision): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await call(decision);
      setOutcome(decision); // the server recorded the decision → the row resolves
    } catch (err) {
      // A 409 (already-decided) is a TERMINAL outcome — the prior decision stands, so the row resolves
      // calmly. Any OTHER throw (500 / network) is transient: keep the buttons, show a red inline error.
      if (err instanceof ApiError && err.status === 409) setOutcome("already_decided");
      else setError(errorLabel);
    } finally {
      setBusy(false);
    }
  }
  return { busy, outcome, error, resolve };
}
