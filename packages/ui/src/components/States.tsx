import type { CSSProperties, ReactNode } from "react";
import type { Translator } from "../i18n/index.ts";

const box = {
  display: "grid",
  gap: "var(--spacing-2)",
  justifyItems: "center",
  textAlign: "center" as const,
  padding: "var(--spacing-10) var(--spacing-4)",
  fontFamily: "var(--font-body-th)",
  lineHeight: "var(--leading-body)",
  color: "var(--color-text)",
};

interface StateProps {
  t: Translator;
  /** Optional action the host renders (e.g. a clear-filters button). */
  action?: ReactNode;
}

/** The one primary-action button style (second copy appeared in the website FilterBar). */
export const primaryButtonStyle: CSSProperties = {
  padding: "var(--spacing-2) var(--spacing-4)",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "var(--color-primary-500)",
  color: "var(--color-surface)",
  fontSize: "var(--text-base)",
  fontFamily: "var(--font-body-th)",
  cursor: "pointer",
};

/** COPY-07: what happened + why + what to do next — never a bare "no results". */
export function EmptyState({ t, action }: StateProps) {
  return (
    <div style={box} data-state="empty">
      <div
        style={{
          fontSize: "var(--text-md)",
          fontWeight: 600,
          fontFamily: "var(--font-heading-th)",
        }}
      >
        {t("empty.title")}
      </div>
      <div style={{ fontSize: "var(--text-base)", color: "var(--color-text-2)" }}>
        {t("empty.why")}
      </div>
      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
        {t("empty.next")}
      </div>
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
    <div style={box} data-state="error">
      <div
        style={{
          fontSize: "var(--text-md)",
          fontWeight: 600,
          fontFamily: "var(--font-heading-th)",
        }}
      >
        {t("error.title")}
      </div>
      <div style={{ fontSize: "var(--text-base)", color: "var(--color-text-2)" }}>
        {t("error.why")}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} style={primaryButtonStyle}>
          {t("error.retry")}
        </button>
      )}
      {!onRetry && action}
    </div>
  );
}
