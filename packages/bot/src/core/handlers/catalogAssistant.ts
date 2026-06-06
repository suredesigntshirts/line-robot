/**
 * The catalog assistant's interactive behaviour, independent of how it was triggered. Both the
 * {@link ./commandHandler} (typed text) and the {@link ./postbackRouter} (button/quick-reply taps)
 * are thin parsers that delegate here, so the retrieval + merge logic lives — and is tested — once.
 */
import type { Property, PropertyUpsert } from "../domain/catalog.js";
import type { OutboundMessage } from "../domain/message.js";
import type { CatalogRepository } from "../ports/catalog.js";
import type { Clock } from "../ports/runtime.js";
import {
  helpMessage,
  listingsMessage,
  propertyDetail,
  propertyTitle,
  searchPromptMessage,
  upcomingEmptyMessage,
} from "./views.js";

/** Most-recently-active first, so the freshest listings lead the carousel. */
function byActivityDesc(a: Property, b: Property): number {
  return (b.lastActivityAt ?? b.updatedAt ?? 0) - (a.lastActivityAt ?? a.updatedAt ?? 0);
}

/** Does any of the property's address/area/project fields contain `query` (case-insensitive)? */
function matchesQuery(property: Property, query: string): boolean {
  const needle = query.toLowerCase();
  const haystack = [
    property.normalizedAddress,
    property.projectName,
    property.district,
    property.subdistrict,
    property.province,
    ...(property.rawAddresses ?? []),
  ];
  return haystack.some((field) => field?.toLowerCase().includes(needle));
}

export class CatalogAssistant {
  constructor(
    private readonly catalog: CatalogRepository,
    private readonly clock: Clock,
  ) {}

  /** "Show my listings" — read-access follows the user across every chat they're a member of. */
  async myListings(userId: string): Promise<OutboundMessage[]> {
    const properties = (await this.catalog.listPropertiesForUser(userId)).sort(byActivityDesc);
    return [
      listingsMessage(properties, {
        altText: "Your listings",
        emptyText:
          "You don't have any saved listings yet. Chat about a property and I'll catalog it.",
      }),
    ];
  }

  /** Filter the user's listings to those on a given road/area. */
  async listingsOnRoad(userId: string, query: string): Promise<OutboundMessage[]> {
    const properties = (await this.catalog.listPropertiesForUser(userId))
      .filter((p) => matchesQuery(p, query))
      .sort(byActivityDesc);
    return [
      listingsMessage(properties, {
        altText: `Listings on ${query}`,
        emptyText: `No listings matching “${query}” yet.`,
      }),
    ];
  }

  upcoming(): OutboundMessage[] {
    return [upcomingEmptyMessage()];
  }

  help(): OutboundMessage[] {
    return [helpMessage()];
  }

  searchPrompt(): OutboundMessage[] {
    return [searchPromptMessage()];
  }

  async viewProperty(propertyId: string): Promise<OutboundMessage[]> {
    const property = await this.catalog.getProperty(propertyId);
    if (property === null) {
      return [{ type: "text", text: "I couldn't find that listing — it may have been merged." }];
    }
    return [propertyDetail(property)];
  }

  /**
   * Resolve the ambiguous-merge confirmation: fold a just-created property (`fromId`) into an
   * existing one (`intoId`). The new property is only linked in this one conversation (the sweep
   * created it here), so we re-point the edge locally and delete it — no inverse index needed.
   */
  async mergeNewInto(
    conversationKey: string,
    fromId: string,
    intoId: string,
  ): Promise<OutboundMessage[]> {
    const [from, into] = await Promise.all([
      this.catalog.getProperty(fromId),
      this.catalog.getProperty(intoId),
    ]);
    if (into === null) {
      return [{ type: "text", text: "I couldn't find the listing to merge into." }];
    }
    if (from === null) {
      // Already merged/removed (e.g. a double-tap) — nothing to do, just confirm the target.
      return [{ type: "text", text: `Already merged into ${propertyTitle(into)}.` }];
    }

    const now = this.clock.now();
    // Overlay the new extraction's known fields onto the existing property (set-if-present, so
    // `into`'s other fields and its origin/createdAt are preserved).
    const merged: PropertyUpsert = {
      propertyId: intoId,
      normalizedAddress: from.normalizedAddress,
      rawAddresses: from.rawAddresses,
      projectName: from.projectName,
      lat: from.lat,
      long: from.long,
      district: from.district,
      subdistrict: from.subdistrict,
      province: from.province,
      propertyType: from.propertyType,
      status: from.status,
      askingPrice: from.askingPrice,
      currency: from.currency,
      tags: from.tags,
      updatedAt: now,
      lastActivityAt: now,
    };
    await this.catalog.upsertProperty(merged);
    await this.catalog.linkConversationProperty(conversationKey, intoId, now);
    await this.catalog.unlinkConversationProperty(conversationKey, fromId);
    await this.catalog.deleteProperty(fromId);

    return [{ type: "text", text: `✅ Merged into ${propertyTitle(into)}.` }];
  }

  /** Keep a confirmation-flagged property as its own listing (a no-op acknowledgement). */
  keepSeparate(): OutboundMessage[] {
    return [{ type: "text", text: "👍 Keeping it as a separate listing." }];
  }
}
