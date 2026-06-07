/**
 * Catalog domain — the real-estate assistant's durable state. These types are provider-agnostic;
 * the DynamoDB adapter ({@link ../adapters/dynamodb/catalogRepository}) maps them onto the
 * single-table layout. See `plans/09-realestate-catalog-assistant.md` for the access model.
 */

/** How a stored image was classified by the per-image OCR pass (plan 13). The gallery shows all
 * three the same on LINE but ordered property → chanote → other. */
export type PhotoKind = "property" | "chanote" | "other";

/** One stored image (S3 key) with its classified kind. Replaces the bare `string[]` of S3 keys. */
export interface PropertyPhoto {
  readonly s3Key: string;
  readonly kind: PhotoKind;
}

/** Structured data OCR'd from a Thai land title-deed (chanote / นส.3ก / etc.). Captured by the
 * per-image classifier (plan 13) and attached to the property; rendered as its own Details section.
 * Every field is optional — keep whatever was legible, omit the rest. */
export interface Chanote {
  /** chanote (Nor Sor 4 Jor) | nor-sor-3-gor | nor-sor-3 | sor-por-kor | other (best guess by the
   * document's content/layout, NOT the Garuda colour or file type). */
  readonly titleType?: string;
  /** Title-deed number (เลขที่โฉนด). */
  readonly deedNumber?: string;
  /** Land/parcel number (เลขที่ดิน). */
  readonly landNumber?: string;
  /** Survey page (หน้าสำรวจ). */
  readonly surveyPage?: string;
  /** Map-sheet / ระวาง number. */
  readonly mapSheet?: string;
  /** Issuing Land Office (สำนักงานที่ดิน). */
  readonly landOffice?: string;
  /** Location as printed on the deed (also used to backfill the property's own location). */
  readonly province?: string;
  readonly district?: string;
  readonly subdistrict?: string;
  /** Area as written, in Thai units (e.g. "1 rai 2 ngan 30 wah"). */
  readonly landArea?: string;
  /** Registered owner name(s). */
  readonly ownerName?: string;
  /** Encumbrances from the reverse side: mortgages, leases, usufructs, servitudes. */
  readonly encumbrances?: readonly string[];
  /** A note when text was not fully legible / low-confidence reads, so a human can double-check. */
  readonly confidenceNote?: string;
}

/** A catalogued property. Slice 1 models the identity/location/commercial core that the access
 * patterns and near-term extraction need; the richer legal/physical fields are added alongside
 * the extraction schema (they share a shape). Absent values are simply omitted. */
export interface Property {
  readonly propertyId: string;
  /** The conversation this property was first created in (write-scope origin). */
  readonly originConversationKey?: string;
  readonly normalizedAddress?: string;
  readonly rawAddresses?: readonly string[];
  readonly projectName?: string;
  readonly lat?: number;
  readonly long?: number;
  readonly district?: string;
  readonly subdistrict?: string;
  readonly province?: string;
  readonly propertyType?: string;
  /** lead → researching → visited → negotiating → offer → under-contract → closed → dropped. */
  readonly status?: string;
  readonly askingPrice?: number;
  readonly currency?: string;
  readonly tags?: readonly string[];
  // --- Physical / commercial detail (extracted when mentioned; absent when not) ---
  readonly bedrooms?: number;
  readonly bathrooms?: number;
  readonly usableAreaSqm?: number;
  /** Land size as written, in Thai units where relevant (e.g. "1 rai 2 ngan"). */
  readonly landArea?: string;
  readonly floors?: number;
  /** unfurnished | partly furnished | fully furnished (best guess). */
  readonly furnishing?: string;
  /** Free-form description / notes about the property. */
  readonly notes?: string;
  /** "sale" | "rent" (best guess). */
  readonly listingType?: string;
  /** Monthly rent when this is a rental (askingPrice stays the sale price). */
  readonly rentPrice?: number;
  /** Owner/agent contact as written. */
  readonly contact?: string;
  /** Where the lead came from (person, group, listing site). */
  readonly source?: string;
  /** The original Google-Maps link shared in chat — preferred over reconstructed coordinates. */
  readonly mapUrl?: string;
  /** Structured title-deed data OCR'd from a chanote image/PDF in the chat (plan 13). */
  readonly chanote?: Chanote;
  /** Images captured for this property, each labelled with its kind (plan 13). The hero is the first
   * `property` photo (falling back to any). Legacy rows stored a bare `string[]`; {@link
   * ../adapters/dynamodb/catalogRepository} migrates those on read to `kind:"property"`. */
  readonly photos?: readonly PropertyPhoto[];
  readonly createdAt?: number;
  readonly updatedAt?: number;
  readonly lastActivityAt?: number;
}

/** Fields accepted when upserting a property. `propertyId` identifies the row; everything else is
 * merged (set-if-present), so partial extractions accumulate without clobbering prior fields. */
export type PropertyUpsert = { readonly propertyId: string } & Partial<
  Omit<Property, "propertyId">
>;

/**
 * A calendar follow-up attached to a property (P2). Fires a single push reminder to
 * `notifyConversationKey` at `dueAt`. `notifiedAt` is stamped once the reminder is pushed — which
 * also clears the sparse GSI2 keys, so a notified event drops out of the reminder sweep's due-query.
 */
export interface PropertyEvent {
  readonly eventId: string;
  readonly propertyId: string;
  /** Epoch ms the follow-up is due. */
  readonly dueAt: number;
  /** Short label, e.g. "Site visit"; rendered as a generic "Follow-up" when absent. */
  readonly title?: string;
  /** The conversation the reminder is pushed to (where the follow-up was set). */
  readonly notifyConversationKey: string;
  /** Epoch ms the reminder was pushed; absent until then. */
  readonly notifiedAt?: number;
  readonly createdAt?: number;
}

/** The lifecycle/ingestion state of one conversation. Drives the debounced ingestion sweep. */
export interface ConversationTracker {
  readonly conversationKey: string;
  /** Epoch ms of the most recent inbound message (always advanced on each inbound). */
  readonly lastInboundAt: number;
  /** Ingest watermark: epoch ms of the newest message included in the last successful ingest. */
  readonly lastIngestedAt: number;
  readonly status: "IDLE" | "INGESTING";
  /** ISO8601 of when the current un-ingested streak began; present iff the conversation has
   * pending work (mirrors the sparse GSI1 sort key). Cleared on successful ingest. */
  readonly pendingSince?: string;
  /** Epoch ms of the current sweep claim, if any (the lock for at-most-one-worker). */
  readonly claimedAt?: number;
}
