/**
 * Pure rendering of catalog data into provider-agnostic {@link OutboundMessage}s — Flex carousels,
 * property cards, detail text, and the quick-reply confirmation chips. No IO and no LINE specifics
 * (the Flex JSON is built later in the gateway), so every shape here is unit-testable in isolation.
 */
import type { Chanote, Property } from "../domain/catalog.js";
import { formatDueDate, formatShortDate } from "../domain/datetime.js";
import { LINE_MAX_CAROUSEL_BUBBLES, LINE_MAX_QUICK_REPLIES } from "../domain/lineLimits.js";
import type {
  CardAction,
  OutboundMessage,
  PropertyCard,
  PropertyCardRow,
  QuickReply,
} from "../domain/message.js";
import { ACTIONS, encodePostback } from "./commands.js";

const MAX_MERGE_CHOICES = 3; // keep the confirmation quick-reply row short

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

/** "Subdistrict, District, Province" from the present location parts, or undefined when none.
 * Exported so the mini-app DTO mapper ({@link ./catalogDto}) reuses the same area string. */
export function area(property: Property): string | undefined {
  const parts = [property.subdistrict, property.district, property.province].filter(
    (p): p is string => p !== undefined && p !== "",
  );
  return parts.length > 0 ? parts.join(", ") : undefined;
}

/** Join the present, non-empty parts with " · ", or undefined when none remain (so the row is
 * omitted). Lets a card row degrade gracefully when only some of its parts are known. */
function joinDot(parts: ReadonlyArray<string | undefined>): string | undefined {
  const kept = parts.filter((p): p is string => p !== undefined && p !== "");
  return kept.length > 0 ? kept.join(" · ") : undefined;
}

/**
 * A single property "card" for a carousel: a best (hero) image, a status *badge* subtitle (emoji +
 * label, so it doesn't read like a field row), a few compact teaser rows, and a single "Open in
 * Catalog" deep link — full details, photos and follow-up now live in the MINI App, so the carousel
 * just teases and hands off. When no catalog base URL is configured it falls back to the in-chat
 * Details postback so the card still does something. Every row is omitted when its data is absent.
 */
export function propertyCard(
  property: Property,
  heroImageUrl?: string,
  catalogBaseUrl?: string,
): PropertyCard {
  const rows: PropertyCardRow[] = [];
  // Type · for sale/rent
  pushRow(rows, "Type", joinDot([property.propertyType, property.listingType]));
  // Floors · beds · baths
  pushRow(
    rows,
    "Layout",
    joinDot([
      property.floors !== undefined ? `${property.floors} floors` : undefined,
      property.bedrooms !== undefined ? `${property.bedrooms} bed` : undefined,
      property.bathrooms !== undefined ? `${property.bathrooms} bath` : undefined,
    ]),
  );
  pushRow(rows, "Land", property.landArea);
  pushRow(rows, "Deed no.", property.chanote?.deedNumber);
  pushRow(rows, "Notes", property.notes);

  const catalogUrl = catalogDeepLink(catalogBaseUrl, property.propertyId);
  const actions: CardAction[] =
    catalogUrl !== undefined
      ? [{ label: "🔎 Open in Catalog", data: "", mode: "uri", uri: catalogUrl }]
      : [{ label: "Details", data: encodePostback(ACTIONS.view, { id: property.propertyId }) }];

  const badge = statusBadge(property.status);
  return {
    title: propertyTitle(property),
    ...(badge !== undefined ? { subtitle: badge } : {}),
    ...(heroImageUrl !== undefined ? { heroImageUrl } : {}),
    rows,
    actions,
  };
}

/** Render a set of listings as a Flex carousel, or a friendly empty-state when there are none.
 * `heroUrls` maps a property id to a presigned hero-image URL (resolved by the caller). */
export function listingsMessage(
  properties: readonly Property[],
  opts: {
    emptyText?: string;
    altText?: string;
    heroUrls?: ReadonlyMap<string, string>;
    /** MINI App base URL — when set each card leads with an "Open in Catalog" deep link. */
    catalogBaseUrl?: string;
  } = {},
): OutboundMessage {
  if (properties.length === 0) {
    return { type: "text", text: opts.emptyText ?? "You don't have any saved listings yet." };
  }
  const shown = properties.slice(0, LINE_MAX_CAROUSEL_BUBBLES);
  const more = properties.length - shown.length;
  const altText =
    (opts.altText ?? `${properties.length} listing${properties.length === 1 ? "" : "s"}`) +
    (more > 0 ? ` (showing ${shown.length})` : "");
  return {
    type: "flex",
    altText,
    cards: shown.map((p) => propertyCard(p, opts.heroUrls?.get(p.propertyId), opts.catalogBaseUrl)),
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

/** "🟡 Negotiating" — the status with a leading emoji badge and a capitalized label. Exported so the
 * mini-app DTO mapper ({@link ./catalogDto}) renders the same badge as the Flex cards. */
export function statusBadge(status?: string): string | undefined {
  if (status === undefined || status === "") {
    return undefined;
  }
  const emoji = STATUS_EMOJI[status] ?? "•";
  return `${emoji} ${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

/**
 * The best "Open in Maps" link for a property, in preference order: the **original Google-Maps link
 * the user shared** (the truest representation of the spot), then reconstructed coordinates, then a
 * search by the best address/area string. Undefined when we have none — the button is then omitted.
 */
export function mapsUri(property: Property): string | undefined {
  if (property.mapUrl !== undefined && property.mapUrl !== "") {
    return property.mapUrl;
  }
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

/** The MINI App deep link to a property's detail screen (`{base}/p/{id}`), or undefined when no base
 * URL is configured. The webview's router resolves `/p/{id}` (directly or via `liff.state`), so this
 * opens straight to the listing. Trailing slashes on the base are trimmed so we never emit `//p/`. */
export function catalogDeepLink(
  baseUrl: string | undefined,
  propertyId: string,
): string | undefined {
  if (baseUrl === undefined || baseUrl === "") {
    return undefined;
  }
  return `${baseUrl.replace(/\/+$/, "")}/p/${encodeURIComponent(propertyId)}`;
}

/** Push `{label, value}` only when `value` is a non-empty string (keeps the detail card to fields we
 * actually have — nulls are simply omitted). */
function pushRow(rows: PropertyCardRow[], label: string, value?: string): void {
  if (value !== undefined && value !== "") {
    rows.push({ label, value });
  }
}

/** Append the title-deed identifiers from a chanote scan (location/area are surfaced as the normal
 * rows). Each row is omitted when absent. */
function pushChanoteRows(rows: PropertyCardRow[], chanote?: Chanote): void {
  if (chanote === undefined) {
    return;
  }
  pushRow(rows, "Title deed", chanote.titleType);
  pushRow(rows, "Deed no.", chanote.deedNumber);
  pushRow(rows, "Parcel no.", chanote.landNumber);
  pushRow(rows, "Survey page", chanote.surveyPage);
  pushRow(rows, "Map sheet", chanote.mapSheet);
  pushRow(rows, "Land office", chanote.landOffice);
  pushRow(rows, "Owner", chanote.ownerName);
  pushRow(
    rows,
    "Encumbrances",
    chanote.encumbrances !== undefined && chanote.encumbrances.length > 0
      ? chanote.encumbrances.join("; ")
      : undefined,
  );
  // The legibility/confidence note is developer-facing noise on the card — dropped here. (The MINI
  // App keeps it, but tucked inside a collapsed disclosure in the Title-deed section.)
}

/**
 * A rich, single-bubble Flex detail of one property: hero photo, status badge, prominent price,
 * full location (project / address / area), tags, a "reply to update" hint + saved/updated dates,
 * and footer actions (Open in Catalog · Open in Maps · Photos · Follow-up). The caller resolves
 * `heroImageUrl` and `photoCount` (presigning happens in the assistant); the Photos button shows only
 * with ≥2 photos, and the "Open in Catalog" deep link only when `catalogBaseUrl` is configured.
 */
export function propertyDetail(
  property: Property,
  opts: { heroImageUrl?: string; photoCount?: number; catalogBaseUrl?: string } = {},
): OutboundMessage {
  const title = propertyTitle(property);
  const sale = formatPrice(property.askingPrice, property.currency);
  const rent =
    property.rentPrice !== undefined
      ? `${formatPrice(property.rentPrice, property.currency)}/mo`
      : undefined;

  // Every field we hold, rendered as "Label: value" — nulls omitted (pushRow drops empties).
  const rows: PropertyCardRow[] = [];
  pushRow(rows, "Type", property.propertyType);
  pushRow(rows, "For", property.listingType);
  const bedBath = [
    property.bedrooms !== undefined ? `${property.bedrooms} bed` : undefined,
    property.bathrooms !== undefined ? `${property.bathrooms} bath` : undefined,
  ]
    .filter((s): s is string => s !== undefined)
    .join(" · ");
  pushRow(rows, "Rooms", bedBath);
  pushRow(
    rows,
    "Usable area",
    property.usableAreaSqm !== undefined ? `${property.usableAreaSqm} sqm` : undefined,
  );
  pushRow(rows, "Land", property.landArea);
  pushRow(rows, "Floors", property.floors !== undefined ? String(property.floors) : undefined);
  pushRow(rows, "Furnishing", property.furnishing);
  // Rent as a row only when there's ALSO a sale price (else rent is the headline below).
  pushRow(rows, "Rent", sale !== undefined ? rent : undefined);
  // Surface the *other* identifier rather than repeating the heading: propertyTitle prefers the
  // address then the project, so show whichever the title didn't already use.
  pushRow(rows, "Project", property.projectName !== title ? property.projectName : undefined);
  pushRow(
    rows,
    "Address",
    property.normalizedAddress !== title ? property.normalizedAddress : undefined,
  );
  pushRow(rows, "Area", area(property));
  pushRow(rows, "Contact", property.contact);
  pushRow(
    rows,
    "Tags",
    property.tags !== undefined && property.tags.length > 0 ? property.tags.join(", ") : undefined,
  );
  pushRow(rows, "Notes", property.notes);
  // Title-deed (chanote) section — its location/area already backfilled the rows above, so show only
  // the deed-specific identifiers + encumbrances + any legibility caveat.
  pushChanoteRows(rows, property.chanote);

  const notes = ['💬 Reply to update — e.g. "price 4.5M" or "now sold"'];
  const stamps = [
    property.createdAt !== undefined ? `Saved ${formatShortDate(property.createdAt)}` : undefined,
    property.updatedAt !== undefined ? `Updated ${formatShortDate(property.updatedAt)}` : undefined,
  ].filter((s): s is string => s !== undefined);
  if (stamps.length > 0) {
    notes.push(stamps.join(" · "));
  }

  const actions: CardAction[] = [];
  // The richest action leads: jump straight to this listing in the MINI App (full gallery, in-app
  // map, booking). Only when a base URL is configured (else the in-chat buttons below stand alone).
  const catalogUrl = catalogDeepLink(opts.catalogBaseUrl, property.propertyId);
  if (catalogUrl !== undefined) {
    actions.push({ label: "🔎 Open in Catalog", data: "", mode: "uri", uri: catalogUrl });
  }
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
  actions.push({
    label: "🗑 Delete",
    data: encodePostback(ACTIONS.delete, { id: property.propertyId }),
  });

  const badge = statusBadge(property.status);
  const headline = sale ?? rent; // sale price leads; a pure rental shows its monthly rent
  const card: PropertyCard = {
    title,
    ...(badge !== undefined ? { subtitle: badge } : {}),
    ...(headline !== undefined ? { headline } : {}),
    ...(opts.heroImageUrl !== undefined ? { heroImageUrl: opts.heroImageUrl } : {}),
    rows,
    notes,
    actions,
  };
  return { type: "flex", altText: `📍 ${title}`, cards: [card] };
}

/** Render (presigned) image urls as a swipeable gallery of full-width image bubbles.
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

/** A property as a flat map of display strings (present fields only) — the shared basis for the
 * edit diff. Numbers are formatted the same way the detail card shows them. */
function displayFields(p: Property): Record<string, string | undefined> {
  const num = (n?: number): string | undefined => (n !== undefined ? String(n) : undefined);
  return {
    Price: formatPrice(p.askingPrice, p.currency),
    Rent: p.rentPrice !== undefined ? `${formatPrice(p.rentPrice, p.currency)}/mo` : undefined,
    Status: p.status,
    Type: p.propertyType,
    For: p.listingType,
    Beds: num(p.bedrooms),
    Baths: num(p.bathrooms),
    "Usable area": p.usableAreaSqm !== undefined ? `${p.usableAreaSqm} sqm` : undefined,
    Land: p.landArea,
    Floors: num(p.floors),
    Furnishing: p.furnishing,
    Project: p.projectName,
    Address: p.normalizedAddress,
    Area: area(p),
    Contact: p.contact,
    Source: p.source,
    Notes: p.notes,
    Tags: p.tags !== undefined && p.tags.length > 0 ? p.tags.join(", ") : undefined,
  };
}

/**
 * A short confirmation of what a free-text edit changed on a property, old→new. Diffs every display
 * field (plus coordinates/map link) and lists only what actually changed; an empty diff (the reply
 * matched but moved nothing) says so plainly.
 */
export function editConfirmationMessage(before: Property, after: Property): OutboundMessage {
  const changes: string[] = [];
  const a = displayFields(after);
  const b = displayFields(before);
  for (const label of Object.keys(a)) {
    const av = a[label];
    const bv = b[label];
    if (av !== undefined && av !== bv) {
      changes.push(bv !== undefined ? `${label} ${av} (was ${bv})` : `${label} ${av}`);
    }
  }
  // Coordinates / shared map link don't have a tidy display string — note them as a change.
  if (
    (after.lat !== before.lat || after.long !== before.long) &&
    after.lat !== undefined &&
    after.long !== undefined
  ) {
    changes.push("Location updated");
  }
  if (after.mapUrl !== undefined && after.mapUrl !== before.mapUrl) {
    changes.push("Map link updated");
  }

  const title = propertyTitle(after);
  if (changes.length === 0) {
    return { type: "text", text: `Nothing changed on ${title}.` };
  }
  return { type: "text", text: `✏️ Updated ${title}:\n• ${changes.join("\n• ")}` };
}

/** The destructive-delete confirmation: a "Yes, delete" chip (fires {@link ACTIONS.deleteConfirm})
 * and a "Cancel" chip that simply re-opens the listing's detail. */
export function deletePromptMessage(property: Property): OutboundMessage {
  return {
    type: "text",
    text: `Delete “${propertyTitle(property)}”? This removes the listing and its follow-ups — it can't be undone.`,
    quickReplies: [
      {
        label: "🗑 Yes, delete",
        data: encodePostback(ACTIONS.deleteConfirm, { id: property.propertyId }),
      },
      { label: "Cancel", data: encodePostback(ACTIONS.view, { id: property.propertyId }) },
    ],
  };
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
    if (seen.has(item.propertyId) || chips.length >= LINE_MAX_QUICK_REPLIES) {
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

/** A merge candidate offered in the ambiguous-confirmation quick reply. */
export interface MergeTarget {
  readonly id: string;
  readonly label: string;
}

/** One property the sweep wrote, for the push confirmation. */
export interface AppliedProperty {
  readonly propertyId: string;
  readonly isNew: boolean;
  readonly ambiguous: boolean;
  readonly label: string;
  /** For an ambiguous (create-new) property: the conversation's existing properties offered as
   * merge targets in the confirmation quick reply. */
  readonly mergeTargets?: readonly MergeTarget[];
}

/**
 * "✅ Saved 2 properties: 123 Sukhumvit (new), Thonglor plot (updated)". An ambiguous create-new is
 * tagged "new — please confirm" and, when there are existing properties to merge into, the message
 * carries quick-reply chips ("Merge → <existing>" / "Keep separate") that the postback router
 * resolves. LINE only shows one message's quick replies, so we attach the *first* ambiguous
 * property's offer; any others stay flagged in the text (the safe create-new default).
 */
export function buildConfirmation(applied: AppliedProperty[]): OutboundMessage {
  const noun = applied.length === 1 ? "property" : "properties";
  const items = applied
    .map((a) => {
      const tag = a.ambiguous ? "new — please confirm" : a.isNew ? "new" : "updated";
      return `${a.label} (${tag})`;
    })
    .join(", ");
  const text = `✅ Saved ${applied.length} ${noun}: ${items}`;

  const toConfirm = applied.find((a) => a.mergeTargets !== undefined && a.mergeTargets.length > 0);
  if (toConfirm?.mergeTargets !== undefined) {
    return {
      type: "text",
      text,
      quickReplies: mergePromptQuickReplies(toConfirm.propertyId, [...toConfirm.mergeTargets]),
    };
  }
  return { type: "text", text };
}
