/**
 * Pure rendering of catalog data into provider-agnostic {@link OutboundMessage}s — Flex carousels,
 * property cards, detail text, and the quick-reply confirmation chips. No IO and no LINE specifics
 * (the Flex JSON is built later in the gateway), so every shape here is unit-testable in isolation.
 */
import type { Property } from "../domain/catalog.js";
import { formatDueDate, formatShortDate } from "../domain/datetime.js";
import type {
  CardAction,
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

/** A single property "card" for a carousel: title, status subtitle, a few rows, a Details button,
 * and an optional hero image (a presigned URL resolved by the caller). */
export function propertyCard(property: Property, heroImageUrl?: string): PropertyCard {
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
    ...(heroImageUrl !== undefined ? { heroImageUrl } : {}),
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

/** Render a set of listings as a Flex carousel, or a friendly empty-state when there are none.
 * `heroUrls` maps a property id to a presigned hero-image URL (resolved by the caller). */
export function listingsMessage(
  properties: readonly Property[],
  opts: { emptyText?: string; altText?: string; heroUrls?: ReadonlyMap<string, string> } = {},
): OutboundMessage {
  if (properties.length === 0) {
    return { type: "text", text: opts.emptyText ?? "You don't have any saved listings yet." };
  }
  const shown = properties.slice(0, MAX_CARDS);
  const more = properties.length - shown.length;
  const altText =
    (opts.altText ?? `${properties.length} listing${properties.length === 1 ? "" : "s"}`) +
    (more > 0 ? ` (showing ${shown.length})` : "");
  return {
    type: "flex",
    altText,
    cards: shown.map((p) => propertyCard(p, opts.heroUrls?.get(p.propertyId))),
  };
}

/** Per-status emoji "badge" — a provider-agnostic way to make the status read as a chip. */
const STATUS_EMOJI: Record<string, string> = {
  lead: "🔵",
  researching: "🔎",
  visited: "👀",
  negotiating: "🟡",
  offer: "✉️",
  "under-contract": "🟠",
  closed: "🟢",
  dropped: "⚪",
};

/** "🟡 Negotiating" — the status with a leading emoji badge and a capitalized label. */
function statusBadge(status?: string): string | undefined {
  if (status === undefined || status === "") {
    return undefined;
  }
  const emoji = STATUS_EMOJI[status] ?? "•";
  return `${emoji} ${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

/**
 * A Google-Maps deep link for the property: by coordinates when we have them, else by the best
 * address/area string we can build. Undefined when we have neither — the Maps button is then omitted.
 */
export function mapsUri(property: Property): string | undefined {
  if (property.lat !== undefined && property.long !== undefined) {
    return `https://www.google.com/maps/search/?api=1&query=${property.lat},${property.long}`;
  }
  const address =
    property.normalizedAddress ??
    property.rawAddresses?.[0] ??
    area(property) ??
    property.projectName;
  return address === undefined
    ? undefined
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * A rich, single-bubble Flex detail of one property: hero photo, status badge, prominent price,
 * full location (project / address / area), tags, a "reply to update" hint + saved/updated dates,
 * and footer actions (Open in Maps · Photos · Follow-up). The caller resolves `heroImageUrl` and
 * `photoCount` (presigning happens in the assistant); the Photos button shows only with ≥2 photos.
 */
export function propertyDetail(
  property: Property,
  opts: { heroImageUrl?: string; photoCount?: number } = {},
): OutboundMessage {
  const title = propertyTitle(property);

  const rows: PropertyCardRow[] = [];
  if (property.propertyType !== undefined) {
    rows.push({ label: "Type", value: property.propertyType });
  }
  // Surface the *other* identifier rather than repeating the heading: propertyTitle prefers the
  // address then the project, so show whichever the title didn't already use.
  if (property.projectName !== undefined && property.projectName !== title) {
    rows.push({ label: "Project", value: property.projectName });
  }
  if (property.normalizedAddress !== undefined && property.normalizedAddress !== title) {
    rows.push({ label: "Address", value: property.normalizedAddress });
  }
  const where = area(property);
  if (where !== undefined) {
    rows.push({ label: "Area", value: where });
  }
  if (property.tags !== undefined && property.tags.length > 0) {
    rows.push({ label: "Tags", value: property.tags.join(", ") });
  }

  const notes = ['💬 Reply to update — e.g. "price 4.5M" or "now sold"'];
  const stamps = [
    property.createdAt !== undefined ? `Saved ${formatShortDate(property.createdAt)}` : undefined,
    property.updatedAt !== undefined ? `Updated ${formatShortDate(property.updatedAt)}` : undefined,
  ].filter((s): s is string => s !== undefined);
  if (stamps.length > 0) {
    notes.push(stamps.join(" · "));
  }

  const actions: CardAction[] = [];
  const maps = mapsUri(property);
  if (maps !== undefined) {
    actions.push({ label: "🗺 Open in Maps", data: "", mode: "uri", uri: maps });
  }
  const photoCount = opts.photoCount ?? 0;
  if (photoCount >= 2) {
    actions.push({
      label: `🖼 Photos (${photoCount})`,
      data: encodePostback(ACTIONS.photos, { id: property.propertyId }),
    });
  }
  actions.push({
    label: "📅 Follow-up",
    data: encodePostback(ACTIONS.setFollowUp, { id: property.propertyId }),
    mode: "datetime",
  });

  const badge = statusBadge(property.status);
  const price = formatPrice(property.askingPrice, property.currency);
  const card: PropertyCard = {
    title,
    ...(badge !== undefined ? { subtitle: badge } : {}),
    ...(price !== undefined ? { headline: price } : {}),
    ...(opts.heroImageUrl !== undefined ? { heroImageUrl: opts.heroImageUrl } : {}),
    rows,
    notes,
    actions,
  };
  return { type: "flex", altText: `📍 ${title}`, cards: [card] };
}

/** Render (presigned) image urls as a swipeable gallery; each bubble opens its image at full size.
 * Empty list → a friendly text fallback (e.g. a listing with no photos). */
export function imageCarouselMessage(
  imageUrls: readonly string[],
  altText: string,
): OutboundMessage {
  if (imageUrls.length === 0) {
    return { type: "text", text: "No photos saved for this listing yet." };
  }
  return { type: "imageCarousel", altText, imageUrls };
}

/**
 * A short confirmation of what a free-text edit changed on a property, old→new. Only fields that
 * actually changed are listed; an empty diff (the reply matched but moved nothing) says so plainly.
 */
export function editConfirmationMessage(before: Property, after: Property): OutboundMessage {
  const changes: string[] = [];

  const priceBefore = formatPrice(before.askingPrice, before.currency);
  const priceAfter = formatPrice(after.askingPrice, after.currency);
  if (priceAfter !== undefined && priceAfter !== priceBefore) {
    changes.push(
      priceBefore !== undefined
        ? `Price ${priceAfter} (was ${priceBefore})`
        : `Price ${priceAfter}`,
    );
  }
  if (after.status !== undefined && after.status !== before.status) {
    changes.push(
      before.status !== undefined
        ? `Status ${after.status} (was ${before.status})`
        : `Status ${after.status}`,
    );
  }
  if (after.propertyType !== undefined && after.propertyType !== before.propertyType) {
    changes.push(`Type ${after.propertyType}`);
  }
  if (
    after.normalizedAddress !== undefined &&
    after.normalizedAddress !== before.normalizedAddress
  ) {
    changes.push(`Address ${after.normalizedAddress}`);
  }
  if (after.projectName !== undefined && after.projectName !== before.projectName) {
    changes.push(`Project ${after.projectName}`);
  }
  const areaAfter = area(after);
  if (areaAfter !== undefined && areaAfter !== area(before)) {
    changes.push(`Area ${areaAfter}`);
  }
  const tagsAfter = (after.tags ?? []).join(", ");
  if (tagsAfter !== "" && tagsAfter !== (before.tags ?? []).join(", ")) {
    changes.push(`Tags ${tagsAfter}`);
  }
  if (
    after.lat !== undefined &&
    after.long !== undefined &&
    (after.lat !== before.lat || after.long !== before.long)
  ) {
    changes.push("Location updated");
  }

  const title = propertyTitle(after);
  if (changes.length === 0) {
    return { type: "text", text: `Nothing changed on ${title}.` };
  }
  return { type: "text", text: `✏️ Updated ${title}:\n• ${changes.join("\n• ")}` };
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
