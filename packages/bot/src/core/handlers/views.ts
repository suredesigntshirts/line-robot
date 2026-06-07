/**
 * Pure rendering of catalog data into provider-agnostic {@link OutboundMessage}s — Flex carousels,
 * property cards, detail text, and the quick-reply confirmation chips. No IO and no LINE specifics
 * (the Flex JSON is built later in the gateway), so every shape here is unit-testable in isolation.
 */
import type { Property } from "../domain/catalog.js";
import { formatDueDate } from "../domain/datetime.js";
import type {
  OutboundMessage,
  PropertyCard,
  PropertyCardRow,
  QuickReply,
} from "../domain/message.js";
import { ACTIONS, encodePostback } from "./commands.js";

const MAX_CARDS = 12; // LINE carousel cap (mirrored in the gateway; we also note when we truncate).
const MAX_MERGE_CHOICES = 3; // keep the confirmation quick-reply row short
const MAX_UPCOMING_CHIPS = 13; // LINE quick-reply cap (gateway also enforces this)

/** A property's display title: clean address, else project name, else a short id. */
export function propertyTitle(property: Property): string {
  return (
    property.normalizedAddress ??
    property.projectName ??
    `Property ${property.propertyId.slice(0, 8)}`
  );
}

/** "฿2,300,000" for THB, else "2,300,000 USD". Undefined price → undefined (row omitted). */
export function formatPrice(price?: number, currency?: string): string | undefined {
  if (price === undefined) {
    return undefined;
  }
  const amount = price.toLocaleString("en-US");
  const ccy = currency ?? "THB";
  return ccy === "THB" ? `฿${amount}` : `${amount} ${ccy}`;
}

function area(property: Property): string | undefined {
  const parts = [property.subdistrict, property.district, property.province].filter(
    (p): p is string => p !== undefined && p !== "",
  );
  return parts.length > 0 ? parts.join(", ") : undefined;
}

/** A single property "card" for a carousel: title, status subtitle, a few rows, a Details button. */
export function propertyCard(property: Property): PropertyCard {
  const rows: PropertyCardRow[] = [];
  const price = formatPrice(property.askingPrice, property.currency);
  if (price !== undefined) {
    rows.push({ label: "Price", value: price });
  }
  if (property.propertyType !== undefined) {
    rows.push({ label: "Type", value: property.propertyType });
  }
  const where = area(property);
  if (where !== undefined) {
    rows.push({ label: "Area", value: where });
  }
  return {
    title: propertyTitle(property),
    ...(property.status !== undefined ? { subtitle: property.status } : {}),
    rows,
    actions: [
      { label: "Details", data: encodePostback(ACTIONS.view, { id: property.propertyId }) },
      {
        label: "📅 Follow-up",
        data: encodePostback(ACTIONS.setFollowUp, { id: property.propertyId }),
        mode: "datetime",
      },
    ],
  };
}

/** Render a set of listings as a Flex carousel, or a friendly empty-state when there are none. */
export function listingsMessage(
  properties: readonly Property[],
  opts: { emptyText?: string; altText?: string } = {},
): OutboundMessage {
  if (properties.length === 0) {
    return { type: "text", text: opts.emptyText ?? "You don't have any saved listings yet." };
  }
  const shown = properties.slice(0, MAX_CARDS);
  const more = properties.length - shown.length;
  const altText =
    (opts.altText ?? `${properties.length} listing${properties.length === 1 ? "" : "s"}`) +
    (more > 0 ? ` (showing ${shown.length})` : "");
  return { type: "flex", altText, cards: shown.map(propertyCard) };
}

/** A one-message text detail of a single property. */
export function propertyDetail(property: Property): OutboundMessage {
  const lines = [`📍 ${propertyTitle(property)}`];
  const price = formatPrice(property.askingPrice, property.currency);
  if (price !== undefined) {
    lines.push(`Price: ${price}`);
  }
  if (property.propertyType !== undefined) {
    lines.push(`Type: ${property.propertyType}`);
  }
  if (property.status !== undefined) {
    lines.push(`Status: ${property.status}`);
  }
  const where = area(property);
  if (where !== undefined) {
    lines.push(`Area: ${where}`);
  }
  if (property.tags !== undefined && property.tags.length > 0) {
    lines.push(`Tags: ${property.tags.join(", ")}`);
  }
  return { type: "text", text: lines.join("\n") };
}

export function helpMessage(): OutboundMessage {
  return {
    type: "text",
    text: [
      "I quietly catalog the properties you discuss here. Try:",
      "• My Listings — your saved properties",
      "• on <road> — listings on a road/area (e.g. “on Sukhumvit”)",
      "• Upcoming — follow-ups due soon",
      "Or just chat about a property and I'll save it for you.",
    ].join("\n"),
  };
}

export function searchPromptMessage(): OutboundMessage {
  return {
    type: "text",
    text: "What road or area? Reply e.g. “on Thonglor” and I'll show matching listings.",
  };
}

export function upcomingEmptyMessage(): OutboundMessage {
  return {
    type: "text",
    text: "No upcoming follow-ups. Open a listing and tap 📅 Follow-up to set a reminder.",
  };
}

/** One due follow-up, resolved to display strings for the "Upcoming" list. */
export interface UpcomingFollowUp {
  readonly propertyId: string;
  readonly propertyTitle: string;
  readonly dueAt: number;
  readonly title?: string;
}

/** Render the user's upcoming follow-ups as a dated list, with a "View" chip per distinct property
 * (so a row stays tappable). Falls back to the empty-state when there are none. */
export function upcomingMessage(items: readonly UpcomingFollowUp[]): OutboundMessage {
  if (items.length === 0) {
    return upcomingEmptyMessage();
  }
  const lines = ["⏰ Upcoming follow-ups:"];
  for (const item of items) {
    lines.push(
      `• ${formatDueDate(item.dueAt)} — ${item.title ?? "Follow-up"} · ${item.propertyTitle}`,
    );
  }

  const seen = new Set<string>();
  const chips: QuickReply[] = [];
  for (const item of items) {
    if (seen.has(item.propertyId) || chips.length >= MAX_UPCOMING_CHIPS) {
      continue;
    }
    seen.add(item.propertyId);
    chips.push({
      label: `View ${item.propertyTitle}`,
      data: encodePostback(ACTIONS.view, { id: item.propertyId }),
    });
  }
  return { type: "text", text: lines.join("\n"), quickReplies: chips };
}

/** The push reminder sent when a follow-up falls due, with a chip to open the listing. */
export function reminderMessage(
  propertyId: string,
  propertyTitle: string,
  dueAt: number,
  title?: string,
): OutboundMessage {
  return {
    type: "text",
    text: `⏰ Follow-up due: ${title ?? "Follow-up"}\n📍 ${propertyTitle} · ${formatDueDate(dueAt)}`,
    quickReplies: [
      { label: "View listing", data: encodePostback(ACTIONS.view, { id: propertyId }) },
    ],
  };
}

/** A short label for a merge-candidate property/candidate (for the quick-reply chip). */
function choiceLabel(label: string): string {
  return `Merge → ${label}`;
}

/**
 * Quick-reply chips for the ambiguous-merge confirmation: one "Merge → <existing>" per candidate
 * (capped) plus a "Keep separate". Tapping fires a {@link ACTIONS.merge}/{@link ACTIONS.keep}
 * postback that the {@link ./postbackRouter} resolves.
 */
export function mergePromptQuickReplies(
  newPropertyId: string,
  candidates: readonly { id: string; label: string }[],
): QuickReply[] {
  const chips: QuickReply[] = candidates.slice(0, MAX_MERGE_CHOICES).map((c) => ({
    label: choiceLabel(c.label),
    data: encodePostback(ACTIONS.merge, { from: newPropertyId, into: c.id }),
  }));
  chips.push({ label: "Keep separate", data: encodePostback(ACTIONS.keep, { id: newPropertyId }) });
  return chips;
}
