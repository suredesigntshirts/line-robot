/**
 * Catalog domain — the real-estate assistant's durable state. These types are provider-agnostic;
 * the DynamoDB adapter ({@link ../adapters/dynamodb/catalogRepository}) maps them onto the
 * single-table layout. See `plans/09-realestate-catalog-assistant.md` for the access model.
 */

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
  readonly createdAt?: number;
  readonly updatedAt?: number;
  readonly lastActivityAt?: number;
}

/** Fields accepted when upserting a property. `propertyId` identifies the row; everything else is
 * merged (set-if-present), so partial extractions accumulate without clobbering prior fields. */
export type PropertyUpsert = { readonly propertyId: string } & Partial<
  Omit<Property, "propertyId">
>;

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
