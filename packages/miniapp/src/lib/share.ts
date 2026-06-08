/**
 * Build the LINE Flex bubble a user shares from the detail screen ({@link ../screens/Detail}) via the
 * share target picker. Pure (no LIFF/DOM), so it's unit-testable.
 *
 * The card is deliberately **self-contained** — title, status, price, and a type/area line are shown
 * inline — because a recipient who shares no conversation with the sender can't pass the read-api's
 * membership gate to open the full listing. The "View listing" button deep-links those who *can* (the
 * sender, group members) straight to the listing; everyone else still sees the essentials. Photos are
 * omitted on purpose: the detail's image URLs are short-lived presigned S3 GETs that would 403 once a
 * shared card is opened later.
 */
import type { PropertyDetail } from "@line-robot/shared";
import type { ShareMessage } from "../liff.js";

/** A non-empty `Type · Area`-style line from whichever facts are present (or undefined → omitted). */
function summaryLine(p: PropertyDetail): string | undefined {
  const parts = [p.propertyType, p.area].filter((s): s is string => s !== undefined && s !== "");
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function buildShareFlex(p: PropertyDetail, deepLinkUrl: string): ShareMessage {
  const headline = p.price ?? p.rent;
  const summary = summaryLine(p);

  // Body lines, in order, skipping anything absent.
  const bodyContents: Array<Record<string, unknown>> = [
    { type: "text", text: p.title, weight: "bold", size: "lg", wrap: true },
  ];
  if (p.statusBadge !== undefined && p.statusBadge !== "") {
    bodyContents.push({
      type: "text",
      text: p.statusBadge,
      size: "sm",
      color: "#8C8C8C",
      wrap: true,
    });
  }
  if (headline !== undefined) {
    bodyContents.push({
      type: "text",
      text: headline,
      weight: "bold",
      size: "xl",
      color: "#1DB446",
      wrap: true,
      margin: "sm",
    });
  }
  if (summary !== undefined) {
    bodyContents.push({ type: "text", text: summary, size: "sm", color: "#555555", wrap: true });
  }

  const bubble = {
    type: "bubble",
    body: { type: "box", layout: "vertical", spacing: "sm", contents: bodyContents },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          height: "sm",
          action: { type: "uri", label: "View listing", uri: deepLinkUrl },
        },
      ],
    },
  };

  // The hand-built bubble is a valid Flex message; cast once to the SDK's strict union (matching its
  // exact box/text literal types by hand is needlessly brittle). The shape is covered by share.test.
  return { type: "flex", altText: `📍 ${p.title}`, contents: bubble } as unknown as ShareMessage;
}
