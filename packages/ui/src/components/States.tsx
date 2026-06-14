import type { ReactNode } from "react";
import type { Translator } from "../i18n/index.ts";

const BOX = "grid justify-items-center gap-2 px-4 py-12 text-center font-body-th text-text";

interface StateProps {
  t: Translator;
  /** Optional action the host renders (e.g. a clear-filters button). */
  action?: ReactNode;
}

/** The one primary-action button treatment (direction-a btn-primary, smaller). A class, not an inline
 * style object — shared by the website FilterBar + ErrorState. */
export const primaryButtonClass =
  "inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-primary-500 px-4 py-2 font-body-th text-base text-white transition-colors hover:bg-primary-600";

/** COPY-07: what happened + why + what to do next — never a bare "no results". Direction-a: a calm
 * centred state with a muted icon, not an error. */
export function EmptyState({ t, action }: StateProps) {
  return (
    <div className={BOX} data-state="empty">
      <span className="text-primary-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <div className="font-heading-th font-semibold text-md">{t("empty.title")}</div>
      <div className="text-base text-text-2">{t("empty.why")}</div>
      <div className="text-sm text-text-2">{t("empty.next")}</div>
      {action}
    </div>
  );
}

export function ErrorState({
  t,
  onRetry,
  action,
}: {
  t: Translator;
  onRetry?: () => void;
  /** COPY-07 "next" for non-hydrated SSR hosts that can't pass onRetry (e.g. a reload link). */
  action?: ReactNode;
}) {
  return (
    <div className={BOX} data-state="error">
      <div className="font-heading-th font-semibold text-md">{t("error.title")}</div>
      <div className="text-base text-text-2">{t("error.why")}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={primaryButtonClass}>
          {t("error.retry")}
        </button>
      )}
      {!onRetry && action}
    </div>
  );
}
