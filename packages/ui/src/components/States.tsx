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
// text-surface (NOT text-white): the filled bg (primary-500) flips LIGHTER in dark mode, so the text
// must flip with it — surface is white in light (white-on-dark-blue) and dark in dark (dark-on-light-
// blue), keeping WCAG-AA contrast in BOTH modes (white-on-light-blue fails AA — see assertCtaContrast).
// hover dims via opacity (changing the bg shade would re-break the dark-mode pairing). `leading-relaxed`
// (≥1.6) so a Thai-label button satisfies the TH-07 line-height net wherever it's reused (the mini-app
// retry CTA carries Thai body text).
export const primaryButtonClass =
  "inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-primary-500 px-4 py-2 font-body-th text-base text-surface leading-relaxed transition-opacity hover:opacity-90";

/** COPY-07: what happened + why + what to do next — never a bare "no results". Direction-a: a calm
 * centred state with a muted icon, not an error. */
export function EmptyState({ t, action }: StateProps) {
  return (
    <div className={BOX} data-state="empty" data-th-content>
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
      <div className="font-heading-th font-semibold text-md leading-normal">{t("empty.title")}</div>
      {/* TH-06/07: Thai body lines carry leading-relaxed (≥1.6) — text-* utilities pin line-height. */}
      <div className="text-base text-text-2 leading-relaxed">{t("empty.why")}</div>
      <div className="text-sm text-text-2 leading-relaxed">{t("empty.next")}</div>
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
    <div className={BOX} data-state="error" data-th-content>
      <div className="font-heading-th font-semibold text-md leading-normal">{t("error.title")}</div>
      <div className="text-base text-text-2 leading-relaxed">{t("error.why")}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={primaryButtonClass}>
          {t("error.retry")}
        </button>
      )}
      {!onRetry && action}
    </div>
  );
}
