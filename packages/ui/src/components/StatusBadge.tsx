import type { Listing } from "@line-robot/domain";
import type { Translator } from "../i18n/index.ts";
import { Badge, type BadgeKind } from "./Badge.tsx";

interface StatusBadgeProps {
  listing: Pick<
    Listing,
    | "dealType"
    | "saleStage"
    | "rentalStatus"
    | "urgency"
    | "titleDeedType"
    | "postedByRole"
    | "listingType"
  >;
  /** TH-04: shown when the poster's identity is admin-verified. */
  verified?: boolean;
  t: Translator;
}

/**
 * The badge row — derives status/urgency/owner/deed/provenance badges from
 * domain fields (D3.8). `verified` (TH-04) is an EXTERNAL signal the caller
 * supplies; the NPA/auction provenance label (DIST-01) is derived from
 * `listing.listingType` — a CALM category highlight, never danger-red (the
 * honest DIST-02 caveats live as contextual disclosure text on the detail
 * page, not in this badge).
 */
export function StatusBadge({ listing, verified = false, t }: StatusBadgeProps) {
  const badges: Array<{ kind: BadgeKind; label: string }> = [];

  if (listing.saleStage === "reserved" || listing.saleStage === "under_contract") {
    badges.push({ kind: "reserved", label: t("badge.reserved") });
  } else if (listing.dealType === "rent") {
    badges.push({ kind: "available", label: t("badge.forRent") });
  } else {
    badges.push({ kind: "available", label: t("badge.forSale") });
  }
  // DIST-01: NPA/auction stock wears its source label, never merged silently into "for sale".
  // Calm category colour (badge.npa token) — the caveats are disclosed in text, not coloured here.
  if (listing.listingType === "npa") badges.push({ kind: "npa", label: t("badge.npa") });
  else if (listing.listingType === "auction")
    badges.push({ kind: "npa", label: t("badge.auction") });
  // COPY-05: urgency is a badge, never headline text.
  if (listing.urgency === "quick_sale") badges.push({ kind: "urgent", label: t("badge.urgent") });
  // COPY-10: owner-direct is a trust signal.
  if (listing.postedByRole === "owner")
    badges.push({ kind: "owner", label: t("badge.ownerDirect") });
  if (verified) badges.push({ kind: "verified", label: t("badge.verified") });
  // FIELD-02: unknown deed wears its warning (amber nudge — verify before deposit), never red,
  // never the NPA category colour.
  if (listing.titleDeedType === "unknown") {
    badges.push({ kind: "warn", label: t("badge.deedUnverified") });
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
