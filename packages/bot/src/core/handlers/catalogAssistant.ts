/**
 * The catalog assistant's interactive behaviour, independent of how it was triggered. Both the
 * {@link ./commandHandler} (typed text) and the {@link ./postbackRouter} (button/quick-reply taps)
 * are thin parsers that delegate here, so the retrieval + merge logic lives — and is tested — once.
 */
import { randomUUID } from "node:crypto";
import {
  byActivityDesc,
  type Property,
  type PropertyUpsert,
  searchableText,
} from "../domain/catalog.js";
import { formatDueDate, parseBangkokLocal } from "../domain/datetime.js";
import type { OutboundMessage } from "../domain/message.js";
import { heroPhotoKey, orderedPhotos } from "../domain/photos.js";
import type { CatalogRepository } from "../ports/catalog.js";
import type { MediaUrlSigner } from "../ports/mediaUrlSigner.js";
import type { Clock, Logger } from "../ports/runtime.js";
import {
  deletePromptMessage,
  helpMessage,
  imageCarouselMessage,
  listingsMessage,
  propertyDetail,
  propertyTitle,
  searchPromptMessage,
  type UpcomingFollowUp,
  upcomingMessage,
} from "./views.js";

export class CatalogAssistant {
  private readonly newId: () => string;

  constructor(
    private readonly catalog: CatalogRepository,
    private readonly clock: Clock,
    newId?: () => string,
    private readonly signer?: MediaUrlSigner,
    private readonly logger?: Logger,
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
    const needle = query.toLowerCase();
    const properties = (await this.catalog.listPropertiesForUser(userId))
      .filter((p) => searchableText(p).includes(needle))
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
        const key = heroPhotoKey(property.photos);
        if (key === undefined) {
          return null;
        }
        try {
          return [property.propertyId, await signer.presignGet(key)] as const;
        } catch (error) {
          this.logger?.warn("catalog: hero presign failed; dropping photo", {
            propertyId: property.propertyId,
            s3Key: key,
            error: String(error),
          });
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

  async viewProperty(propertyId: string, conversationKey?: string): Promise<OutboundMessage[]> {
    const property = await this.catalog.getProperty(propertyId);
    if (property === null) {
      return [{ type: "text", text: "I couldn't find that listing — it may have been merged." }];
    }
    // Arm a short-lived edit context so the user's next plain-text reply targets THIS listing
    // ({@link ./editReplyHandler}). Only when we know the conversation (a tap carries the ref).
    if (conversationKey !== undefined) {
      await this.catalog.armEdit(conversationKey, propertyId, this.clock.now());
    }
    // Presign every photo so the detail's hero and its "Photos (N)" count reflect what we can
    // actually show (no signer / all presigns failed → no hero, no Photos button).
    const photos = await this.presignPhotos(property);
    return [propertyDetail(property, { heroImageUrl: photos[0], photoCount: photos.length })];
  }

  /** Ask to confirm deleting a property (the 🗑 Delete button). */
  async deletePrompt(propertyId: string): Promise<OutboundMessage[]> {
    const property = await this.catalog.getProperty(propertyId);
    if (property === null) {
      return [{ type: "text", text: "I couldn't find that listing — it may already be gone." }];
    }
    return [deletePromptMessage(property)];
  }

  /** Fully delete a property: its events, its META row, and this conversation's edge. Edges in other
   * conversations are filtered out at read time (a missing property resolves to null). */
  async deleteListing(conversationKey: string, propertyId: string): Promise<OutboundMessage[]> {
    const property = await this.catalog.getProperty(propertyId);
    if (property === null) {
      return [{ type: "text", text: "That listing is already gone." }];
    }
    const title = propertyTitle(property);
    await this.catalog.deletePropertyEvents(propertyId);
    await this.catalog.unlinkConversationProperty(conversationKey, propertyId);
    await this.catalog.deleteProperty(propertyId);
    await this.catalog.clearEdit(conversationKey); // don't leave a deleted listing armed for edits
    return [{ type: "text", text: `🗑 Deleted “${title}”.` }];
  }

  /** The full photo gallery for a property, as a swipeable image carousel (the "Photos" button). */
  async showPhotos(propertyId: string): Promise<OutboundMessage[]> {
    const property = await this.catalog.getProperty(propertyId);
    if (property === null) {
      return [{ type: "text", text: "I couldn't find that listing — it may have been merged." }];
    }
    const photos = await this.presignPhotos(property);
    return [imageCarouselMessage(photos, `Photos · ${propertyTitle(property)}`)];
  }

  /** Presign every photo of one property (in order), dropping any that fail or when there's no
   * signer — so one bad key never breaks the gallery. Mirrors {@link heroUrls} for a single listing. */
  private async presignPhotos(property: Property): Promise<string[]> {
    const signer = this.signer;
    if (signer === undefined) {
      return [];
    }
    // Ordered property → chanote → other so the gallery groups by kind.
    const keys = orderedPhotos(property.photos).map((p) => p.s3Key);
    const urls = await Promise.all(
      keys.map(async (key): Promise<string | null> => {
        try {
          return await signer.presignGet(key);
        } catch (error) {
          this.logger?.warn("catalog: gallery presign failed; dropping photo", {
            propertyId: property.propertyId,
            s3Key: key,
            error: String(error),
          });
          return null;
        }
      }),
    );
    return urls.filter((u): u is string => u !== null);
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
