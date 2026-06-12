import type { Listing } from "@line-robot/domain";
import type { Translator } from "../i18n/index.ts";
import { Badge, type BadgeKind } from "./Badge.tsx";

interface StatusBadgeProps {
  listing: Pick<
    Listing,
    "dealType" | "saleStage" | "rentalStatus" | "urgency" | "titleDeedType" | "postedByRole"
  >;
  /** TH-04: shown when the poster's identity is admin-verified. */
  verified?: boolean;
  /** DIST-01: bank NPA stock is labelled, never disguised. */
  npa?: boolean;
  t: Translator;
}

/** The badge row for a listing — derives every badge from domain fields (D3.8). */
export function StatusBadge({ listing, verified = false, npa = false, t }: StatusBadgeProps) {
  const badges: Array<{ kind: BadgeKind; label: string }> = [];

  if (listing.saleStage === "reserved" || listing.saleStage === "under_contract") {
    badges.push({ kind: "reserved", label: t("badge.reserved") });
  } else if (listing.dealType === "rent") {
    badges.push({ kind: "available", label: t("badge.forRent") });
  } else {
    badges.push({ kind: "available", label: t("badge.forSale") });
  }
  // COPY-05: urgency is a badge, never headline text.
  if (listing.urgency === "quick_sale") badges.push({ kind: "urgent", label: t("badge.urgent") });
  // COPY-10: owner-direct is a trust signal.
  if (listing.postedByRole === "owner")
    badges.push({ kind: "owner", label: t("badge.ownerDirect") });
  if (verified) badges.push({ kind: "verified", label: t("badge.verified") });
  if (npa) badges.push({ kind: "npa", label: t("badge.npa") });
  // FIELD-02: unknown deed wears its warning, never silently publishes clean.
  if (listing.titleDeedType === "unknown") {
    badges.push({ kind: "npa", label: t("badge.deedUnverified") });
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-1)" }}>
      {badges.map((b) => (
        <Badge key={`${b.kind}-${b.label}`} kind={b.kind}>
          {b.label}
        </Badge>
      ))}
    </div>
  );
}
