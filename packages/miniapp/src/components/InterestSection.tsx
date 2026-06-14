/**
 * Interest flags on the detail screen (Stage 6, D-S6-3). Two forms keyed on ownership:
 *   - NON-owner group MEMBER (`!isClaimedByMe`): a "สนใจประกาศนี้" action → `POST /properties/{id}/interest`
 *     → an optimistic "flagged" state (the flag is idempotent + non-binding — no obligation, no priority).
 *   - The OWNER (`isClaimedByMe`): a "ผู้สนใจ (N)" section listing who flagged (`GET /properties/{id}/interest`,
 *     newest-first). A plain member never sees this list (server-gated to claimant/admin).
 *
 * Markers: `data-th-content` (the TH-07 Thai line-height net measures the body text) + `data-cta-solid`
 * on the solid flag button (the WCAG-AA contrast net measures it, light AND dark).
 */
import { primaryButtonClass, type Translator } from "@line-robot/ui";
import { useState } from "react";
import { useAsync } from "../app/useAsync.ts";
import type { ApiClient } from "../lib/api.ts";
import { fullDateTime } from "../lib/display.ts";

/** The member-facing flag action: a single solid CTA that flips to a calm "noted" state on success. */
function FlagInterest({ id, api, t }: { id: string; api: ApiClient; t: Translator }) {
  const [flagged, setFlagged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function flag(): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      await api.flagInterest(id);
      setFlagged(true); // optimistic: the POST is idempotent + non-binding (D-S6-3)
    } catch {
      // Any failure (a 404 = not a member, ids stay non-enumerable; or a transient error) shows the
      // generic "temporary problem" copy — the flag is non-binding, so there's nothing more specific.
      setError(t("error.why"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-1.5" data-interest-flag={id} lang="th" data-th-content>
      {flagged ? (
        <div
          className="grid gap-1 rounded-md border border-success bg-success-bg px-3 py-2.5"
          data-interest-flagged
        >
          <span className="font-body-th font-semibold text-base text-text leading-relaxed">
            ✓ {t("interest.flagged")}
          </span>
          <span className="font-body-th text-sm text-text-2 leading-relaxed">
            {t("interest.flaggedNote")}
          </span>
        </div>
      ) : (
        <>
          <button
            type="button"
            data-cta-solid
            data-flag-interest
            disabled={busy}
            onClick={flag}
            className={`${primaryButtonClass} gap-2 disabled:opacity-60`}
          >
            {busy ? t("interest.flagging") : `♡ ${t("interest.flagCta")}`}
          </button>
          {error !== null && (
            <p className="m-0 font-body-th text-danger text-sm leading-relaxed" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}

/** The owner-facing list: who flagged interest (newest-first), with the flagger's name + when. */
function InterestList({
  id,
  api,
  t,
  locale,
}: {
  id: string;
  api: ApiClient;
  t: Translator;
  locale: "th" | "en";
}) {
  const { state } = useAsync(() => api.interest(id), [id]);
  const flags = state.status === "ready" ? state.data : [];

  return (
    <section className="grid gap-2" data-interest-list lang="th" data-th-content>
      <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
        {t("interest.ownerHead", { count: flags.length })}
      </h2>
      {state.status === "loading" ? (
        <p className="m-0 font-body-th text-sm text-text-disabled leading-relaxed">
          {t("interest.loading")}
        </p>
      ) : flags.length === 0 ? (
        <p
          className="m-0 font-body-th text-sm text-text-disabled leading-relaxed"
          data-interest-empty
        >
          {t("interest.empty")}
        </p>
      ) : (
        <ul className="grid list-none gap-2 p-0">
          {flags.map((f) => (
            <li
              key={f.userId}
              data-interest-card
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2.5 shadow-xs"
            >
              <span className="font-body-th text-base text-text leading-relaxed">
                {f.displayName}
              </span>
              <span className="font-body-th text-text-disabled text-xs leading-relaxed">
                {t("interest.flaggedAt", { date: fullDateTime(f.createdAt, locale) })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Pick the form: the owner sees the interested-members list; a member sees the flag action. */
export function InterestSection({
  id,
  isOwner,
  api,
  t,
  locale,
}: {
  id: string;
  isOwner: boolean;
  api: ApiClient;
  t: Translator;
  locale: "th" | "en";
}) {
  return isOwner ? (
    <InterestList id={id} api={api} t={t} locale={locale} />
  ) : (
    <FlagInterest id={id} api={api} t={t} />
  );
}
