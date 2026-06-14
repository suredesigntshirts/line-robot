/**
 * Loading / empty / error states for the mini-app screens. Authored in Tailwind utilities reading the
 * shared tokens. COPY-07 (what + why + next) on the empty/error states. The body text carries
 * `data-th-content` so the TH-07 line-height invariant (≥1.6) bites on it; the retry CTA carries
 * `data-cta-solid` so the WCAG-AA contrast invariant bites on it.
 */
import { primaryButtonClass, type Translator } from "@line-robot/ui";
import { HouseIcon } from "./icons.tsx";

const BOX = "grid justify-items-center gap-2 px-4 py-12 text-center font-body-th text-text";

/** A calm full-screen spinner (theme-coloured ring). aria-live so SR users hear it. */
export function Loading({ label }: { label: string }) {
  return (
    <div className={BOX} role="status" aria-live="polite" data-th-content>
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-3 border-border border-t-primary-500"
      />
      <span className="text-base text-text-2 leading-relaxed">{label}</span>
    </div>
  );
}

export function EmptyListings({ t }: { t: Translator }) {
  return (
    <div className={BOX} data-state="empty" data-th-content>
      <span className="text-primary-300">
        <HouseIcon size={40} />
      </span>
      <div className="font-heading-th font-semibold text-md leading-normal">
        {t("crm.emptyTitle")}
      </div>
      <div className="text-base text-text-2 leading-relaxed">{t("crm.emptyWhy")}</div>
      <div className="text-sm text-text-2 leading-relaxed">{t("crm.emptyNext")}</div>
    </div>
  );
}

/** The error state. `status` distinguishes 401 (re-open in LINE) / 404 (not yours/gone) / other. */
export function ErrorView({
  t,
  status,
  onRetry,
}: {
  t: Translator;
  status?: number;
  onRetry?: () => void;
}) {
  const why =
    status === 401 ? t("crm.authError") : status === 404 ? t("crm.notFound") : t("error.why");
  return (
    <div className={BOX} data-state="error" data-th-content>
      <div className="font-heading-th font-semibold text-md leading-normal">{t("error.title")}</div>
      <div className="text-base text-text-2 leading-relaxed">{why}</div>
      {onRetry && (
        <button type="button" data-cta-solid onClick={onRetry} className={primaryButtonClass}>
          {t("error.retry")}
        </button>
      )}
    </div>
  );
}
