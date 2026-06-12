import type { CSSProperties, ReactNode } from "react";

/** One name per register concept (COPY-04/05/10, DIST-01, TH-04) → badge token pair. */
export type BadgeKind = "available" | "reserved" | "urgent" | "verified" | "owner" | "npa";

const styleFor = (kind: BadgeKind): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--spacing-1)",
  padding: "var(--spacing-1) var(--spacing-2)",
  borderRadius: "var(--radius-full)",
  background: `var(--badge-${kind})`,
  color: `var(--badge-${kind}-text)`,
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-body)",
  fontFamily: "var(--font-body-th)",
  whiteSpace: "nowrap",
});

export function Badge({ kind, children }: { kind: BadgeKind; children: ReactNode }) {
  return (
    <span data-badge={kind} style={styleFor(kind)}>
      {children}
    </span>
  );
}
