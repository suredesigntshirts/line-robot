/**
 * The catalog assistant's interactive behaviour, independent of how it was triggered. Both the
 * {@link ./commandHandler} (typed text) and the {@link ./postbackRouter} (button/quick-reply taps)
 * are thin parsers that delegate here, so the retrieval + merge logic lives — and is tested — once.
 */
import { randomUUID } from "node:crypto";
import type { Property, PropertyUpsert } from "../domain/catalog.js";
import { formatDueDate, parseBangkokLocal } from "../domain/datetime.js";
import type { OutboundMessage } from "../domain/message.js";
import type { CatalogRepository } from "../ports/catalog.js";
import type { MediaUrlSigner } from "../ports/mediaUrlSigner.js";
import type { Clock } from "../ports/runtime.js";
import {
  helpMessage,
  listingsMessage,
  propertyDetail,
  propertyTitle,
  searchPromptMessage,
  type UpcomingFollowUp,
  upcomingMessage,
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
  private readonly newId: () => string;

  constructor(
    private readonly catalog: CatalogRepository,
    private readonly clock: Clock,
    newId?: () => string,
    private readonly signer?: MediaUrlSigner,
  ) {
    this.newId = newId ?? randomUUID;
  }

  /** "Show my listings" — read-access follows the user across every chat they're a member of. */
  async myListings(userId: string): Promise<OutboundMessage[]> {
    const properties = (await this.catalog.listPropertiesForUser(userId)).sort(byActivityDesc);
    return [
      listingsMessage(properties, {
        altText: "Your listings",
        emptyText:
          "You don't have any saved listings yet. Chat about a property and I'll catalog it.",
        heroUrls: await this.heroUrls(properties),
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
        heroUrls: await this.heroUrls(properties),
      }),
    ];
  }

  /** Presign a hero image (first photo) for each property that has one. No signer → no heroes; a
   * presign failure for one property is swallowed so it never breaks the whole listing. */
  private async heroUrls(properties: readonly Property[]): Promise<Map<string, string>> {
    const signer = this.signer;
    if (signer === undefined) {
      return new Map();
    }
    const entries = await Promise.all(
      properties.map(async (property): Promise<readonly [string, string] | null> => {
        const key = property.photos?.[0];
        if (key === undefined) {
          return null;
        }
        try {
          return [property.propertyId, await signer.presignGet(key)] as const;
        } catch {
          return null;
        }
      }),
    );
    return new Map(entries.filter((e): e is readonly [string, string] => e !== null));
  }

  /** "Upcoming" — the user's outstanding follow-ups across every listing they can see, soonest
   * first. Notified events drop out (their reminder already fired). */
  async upcoming(userId: string): Promise<OutboundMessage[]> {
    const properties = await this.catalog.listPropertiesForUser(userId);
    const rows: UpcomingFollowUp[] = [];
    await Promise.all(
      properties.map(async (property) => {
        const events = await this.catalog.listPropertyEvents(property.propertyId);
        for (const event of events) {
          if (event.notifiedAt === undefined) {
            rows.push({
              propertyId: property.propertyId,
              propertyTitle: propertyTitle(property),
              dueAt: event.dueAt,
              title: event.title,
            });
          }
        }
      }),
    );
    rows.sort((a, b) => a.dueAt - b.dueAt);
    return [upcomingMessage(rows)];
  }

  /**
   * Set a follow-up reminder on a property from the datetime-picker tap. The picked value is
   * Bangkok-local (LINE sends no timezone). The reminder is pushed to the conversation it was set
   * in. Rejects a past time so the sweep doesn't fire an instant, confusing reminder.
   */
  async setFollowUp(
    conversationKey: string,
    propertyId: string,
    datetimeLocal: string,
  ): Promise<OutboundMessage[]> {
    const property = await this.catalog.getProperty(propertyId);
    if (property === null) {
      return [{ type: "text", text: "I couldn't find that listing to set a follow-up on." }];
    }
    const dueAt = parseBangkokLocal(datetimeLocal);
    if (dueAt === null) {
      return [{ type: "text", text: "That follow-up time didn't look valid — please try again." }];
    }
    const now = this.clock.now();
    if (dueAt <= now) {
      return [{ type: "text", text: "That time has already passed — pick a future time." }];
    }
    await this.catalog.addEvent({
      eventId: this.newId(),
      propertyId,
      dueAt,
      notifyConversationKey: conversationKey,
      createdAt: now,
    });
    return [
      {
        type: "text",
        text: `📅 Follow-up set for ${formatDueDate(dueAt)} on ${propertyTitle(property)}. I'll remind you here.`,
      },
    ];
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
