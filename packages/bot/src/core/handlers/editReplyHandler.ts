/**
 * Turns a plain-text reply that follows a property "Details" view into an immediate, targeted edit
 * of that listing. {@link ./catalogAssistant.CatalogAssistant.viewProperty} arms an edit context
 * (last-viewed property + when); this handler — registered AFTER the {@link ./commandHandler} in the
 * {@link ./registry} composite chain, so typed commands always win — runs a scoped Claude extraction
 * with the viewed property as the sole candidate. If the model resolves the reply to an update of
 * that property, we apply it (set-if-present) and confirm the diff; otherwise we clear the context
 * and return nothing, letting the message fall through to the normal debounced ingestion sweep.
 */
import type { PropertyUpsert } from "../domain/catalog.js";
import { conversationKey } from "../domain/conversation.js";
import { parseGeoLinks, parseMapUrls } from "../domain/geo.js";
import type { IncomingMessage, OutboundMessage } from "../domain/message.js";
import type { CatalogRepository } from "../ports/catalog.js";
import type { PropertyExtractor } from "../ports/extraction.js";
import type { MessageHandler } from "../ports/messageHandler.js";
import type { Clock } from "../ports/runtime.js";
import { editConfirmationMessage } from "./views.js";

/** How long after viewing a property a plain-text reply is still treated as an edit to it. */
const EDIT_TTL_MS = 15 * 60_000;

function nullToUndef<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}
/** Extraction uses sentinels for absent values (`""` text, `[]` list); map them to undefined so a
 * set-if-present upsert never clobbers a stored value. Numbers keep `null` → use nullToUndef. */
function emptyToUndef(value: string): string | undefined {
  return value === "" ? undefined : value;
}
function listToUndef(value: readonly string[]): string[] | undefined {
  return value.length > 0 ? [...value] : undefined;
}

export class EditReplyHandler implements MessageHandler {
  constructor(
    private readonly catalog: CatalogRepository,
    private readonly extractor: PropertyExtractor,
    private readonly clock: Clock,
  ) {}

  async handle(message: IncomingMessage): Promise<OutboundMessage[]> {
    const text = message.text?.trim();
    if (text === undefined || text === "") {
      return [];
    }
    const convKey = conversationKey(message.ref);
    const context = await this.catalog.getEditContext(convKey);
    if (context === null) {
      return [];
    }
    // Expired arm (the user moved on) → drop it and let the sweep handle the message.
    if (this.clock.now() - context.armedAt > EDIT_TTL_MS) {
      await this.catalog.clearEdit(convKey);
      return [];
    }
    const before = await this.catalog.getProperty(context.propertyId);
    if (before === null) {
      await this.catalog.clearEdit(convKey); // listing gone (merged/deleted)
      return [];
    }

    // Scoped extraction: offer ONLY the viewed property as a candidate so the model decides
    // "edit this listing" vs "something else". geoHints let a pasted map link move the pin. The hint
    // disambiguates common edit phrasing (so "update the name" doesn't land on the street address).
    const editText =
      "[The user is editing the property they just viewed — apply the change to THAT listing. " +
      'Its "name"/"called" means the project name; "address" means the street address.]\n' +
      text;
    const result = await this.extractor.extract({
      conversationKey: convKey,
      text: editText,
      media: [],
      geoHints: parseGeoLinks(text).map((g) => ({ lat: g.lat, long: g.long })),
      candidates: [
        {
          propertyId: before.propertyId,
          normalizedAddress: before.normalizedAddress,
          projectName: before.projectName,
          lat: before.lat,
          long: before.long,
        },
      ],
    });

    // Act only when the model resolved the reply to an UPDATE of the viewed property. A new
    // property / no properties / a null result all fall through to the normal sweep (no false edit).
    const edit = result?.properties.find((p) => p.existingPropertyId === before.propertyId);
    if (edit === undefined) {
      await this.catalog.clearEdit(convKey);
      return [];
    }

    const now = this.clock.now();
    const mapUrl = parseMapUrls(text)[0];
    const upsert: PropertyUpsert = {
      propertyId: before.propertyId,
      normalizedAddress: emptyToUndef(edit.normalizedAddress),
      rawAddresses: emptyToUndef(edit.rawAddress) ? [edit.rawAddress] : undefined,
      projectName: emptyToUndef(edit.projectName),
      lat: nullToUndef(edit.lat),
      long: nullToUndef(edit.long),
      district: emptyToUndef(edit.district),
      subdistrict: emptyToUndef(edit.subdistrict),
      province: emptyToUndef(edit.province),
      propertyType: emptyToUndef(edit.propertyType),
      status: emptyToUndef(edit.status),
      askingPrice: nullToUndef(edit.askingPrice),
      currency: emptyToUndef(edit.currency),
      tags: listToUndef(edit.tags),
      bedrooms: nullToUndef(edit.bedrooms),
      bathrooms: nullToUndef(edit.bathrooms),
      usableAreaSqm: nullToUndef(edit.usableAreaSqm),
      landArea: emptyToUndef(edit.landArea),
      floors: nullToUndef(edit.floors),
      furnishing: emptyToUndef(edit.furnishing),
      notes: emptyToUndef(edit.notes),
      listingType: emptyToUndef(edit.listingType),
      rentPrice: nullToUndef(edit.rentPrice),
      contact: emptyToUndef(edit.contact),
      source: emptyToUndef(edit.source),
      ...(mapUrl !== undefined ? { mapUrl } : {}),
      updatedAt: now,
      lastActivityAt: now,
    };
    await this.catalog.upsertProperty(upsert);
    // Keep the context armed (refresh the timer) rather than clearing it, so an immediate follow-up
    // ("no, the project name" / "revert that") keeps targeting this listing. It's overwritten when a
    // different listing is viewed, and expires on the TTL.
    await this.catalog.armEdit(convKey, before.propertyId, now);

    const after = (await this.catalog.getProperty(before.propertyId)) ?? before;
    return [editConfirmationMessage(before, after)];
  }
}
