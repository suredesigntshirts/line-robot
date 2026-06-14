import type { ReactNode } from "react";

/** One name per register concept (COPY-04/05/10, DIST-01/02, FIELD-02, TH-04) → badge token pair.
 * `npa` is the CALM distressed-category highlight (DIST-01); `warn` is the amber FIELD-02
 * deed-unverified nudge — kept distinct so the NPA category never wears a warning colour. */
export type BadgeKind = "available" | "reserved" | "urgent" | "verified" | "owner" | "npa" | "warn";

// Direction-a `.badge`: a small rounded pill, bg+text from the paired --badge-* tokens. Tailwind
// needs STATIC class strings to compile, so each kind maps to a literal arbitrary-value class (no
// dynamic `bg-[var(--badge-${kind})]` — that wouldn't be scanned). The tokens flip in dark mode.
const KIND_CLASS: Record<BadgeKind, string> = {
  available: "bg-[var(--badge-available)] text-[var(--badge-available-text)]",
  reserved: "bg-[var(--badge-reserved)] text-[var(--badge-reserved-text)]",
  urgent: "bg-[var(--badge-urgent)] text-[var(--badge-urgent-text)]",
  verified: "bg-[var(--badge-verified)] text-[var(--badge-verified-text)]",
  owner: "bg-[var(--badge-owner)] text-[var(--badge-owner-text)]",
  npa: "bg-[var(--badge-npa)] text-[var(--badge-npa-text)]",
  warn: "bg-[var(--badge-warn)] text-[var(--badge-warn-text)]",
};

export function Badge({ kind, children }: { kind: BadgeKind; children: ReactNode }) {
  return (
    <span
      data-badge={kind}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-px font-body-th font-semibold text-xs ${KIND_CLASS[kind]}`}
    >
      {children}
    </span>
  );
}
