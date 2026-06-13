// biome-ignore-all lint/suspicious/noTemplateCurlyInString: ElectroDB key templates are plain
// strings whose `${attr}` placeholders ElectroDB interpolates itself — they must NOT be JS
// template literals.
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, type EntityItem } from "electrodb";
import type {
  Chanote,
  ConversationTracker,
  PhotoKind,
  Property,
  PropertyEvent,
  PropertyPhoto,
} from "../../core/domain/catalog.js";

/** DynamoDB GSI for finding conversations with pending ingestion work (sparse — only the tracker
 * writes `gsi1pk`/`gsi1sk`, and only while it has un-ingested messages). */
export const GSI1 = "gsi1";

/** DynamoDB GSI for finding follow-up events due for a reminder (sparse — a PropertyEvent writes
 * `gsi2pk`/`gsi2sk` on creation, and the reminder sweep clears them once it pushes the reminder). */
export const GSI2 = "gsi2";

/** Constant GSI1 partition key for conversations with pending ingestion work (sweep query:
 * `gsi1pk = GSI1_PENDING_PK AND gsi1sk <= now`). Written by the raw tracker UpdateCommands. */
export const GSI1_PENDING_PK = "PENDING";

/** Constant GSI2 partition key for un-notified due events (sweep query:
 * `gsi2pk = GSI2_DUE_PK AND gsi2sk <= now`); also the event entity's `byDueDate` index template. */
export const GSI2_DUE_PK = "DUE";

/** The `entityType` discriminator stamped on the conversation tracker META item — the one item the
 * raw UpdateCommands write outside ElectroDB (in `touchConversation`). */
export const TRACKER_ENTITY_TYPE = "conversationTracker";

// ---------------------------------------------------------------------------
// ElectroDB entities (simple CRUD/query). `casing: "none"` preserves case-sensitive LINE ids and
// keeps these keys byte-identical to the raw-written tracker keys in the shared CONV# partition.
// ---------------------------------------------------------------------------
export function buildPropertyEntity(client: DynamoDBDocumentClient, table: string) {
  return new Entity(
    {
      model: { entity: "property", version: "1", service: "catalog" },
      attributes: {
        propertyId: { type: "string", required: true },
        originConversationKey: { type: "string" },
        normalizedAddress: { type: "string" },
        rawAddresses: { type: "list", items: { type: "string" } },
        projectName: { type: "string" },
        lat: { type: "number" },
        long: { type: "number" },
        district: { type: "string" },
        subdistrict: { type: "string" },
        province: { type: "string" },
        propertyType: { type: "string" },
        status: { type: "string" },
        askingPrice: { type: "number" },
        currency: { type: "string" },
        tags: { type: "list", items: { type: "string" } },
        bedrooms: { type: "number" },
        bathrooms: { type: "number" },
        usableAreaSqm: { type: "number" },
        landArea: { type: "string" },
        floors: { type: "number" },
        furnishing: { type: "string" },
        notes: { type: "string" },
        listingType: { type: "string" },
        rentPrice: { type: "number" },
        contact: { type: "string" },
        source: { type: "string" },
        mapUrl: { type: "string" },
        chanote: {
          type: "map",
          properties: {
            titleType: { type: "string" },
            deedNumber: { type: "string" },
            landNumber: { type: "string" },
            surveyPage: { type: "string" },
            mapSheet: { type: "string" },
            landOffice: { type: "string" },
            province: { type: "string" },
            district: { type: "string" },
            subdistrict: { type: "string" },
            landArea: { type: "string" },
            ownerName: { type: "string" },
            encumbrances: { type: "list", items: { type: "string" } },
            confidenceNote: { type: "string" },
          },
        },
        photos: {
          type: "list",
          items: {
            type: "map",
            properties: {
              s3Key: { type: "string" },
              kind: { type: "string" },
              label: { type: "string" },
            },
          },
        },
        createdAt: { type: "number" },
        updatedAt: { type: "number" },
        lastActivityAt: { type: "number" },
      },
      indexes: {
        byProperty: {
          pk: {
            field: "pk",
            composite: ["propertyId"],
            template: "PROP#${propertyId}",
            casing: "none",
          },
          sk: { field: "sk", composite: [], template: "META", casing: "none" },
        },
      },
    },
    { client, table },
  );
}

export function buildConvPropertyEntity(client: DynamoDBDocumentClient, table: string) {
  return new Entity(
    {
      model: { entity: "convProperty", version: "1", service: "catalog" },
      attributes: {
        conversationKey: { type: "string", required: true },
        propertyId: { type: "string", required: true },
        updatedAt: { type: "number" },
      },
      indexes: {
        byConversation: {
          pk: {
            field: "pk",
            composite: ["conversationKey"],
            template: "CONV#${conversationKey}",
            casing: "none",
          },
          sk: {
            field: "sk",
            composite: ["propertyId"],
            template: "PROP#${propertyId}",
            casing: "none",
          },
        },
      },
    },
    { client, table },
  );
}

export function buildMembershipEntity(client: DynamoDBDocumentClient, table: string) {
  return new Entity(
    {
      model: { entity: "membership", version: "1", service: "catalog" },
      attributes: {
        userId: { type: "string", required: true },
        conversationKey: { type: "string", required: true },
        lastSeenAt: { type: "number" },
      },
      indexes: {
        byUser: {
          pk: { field: "pk", composite: ["userId"], template: "USER#${userId}", casing: "none" },
          sk: {
            field: "sk",
            composite: ["conversationKey"],
            template: "CONV#${conversationKey}",
            casing: "none",
          },
        },
      },
    },
    { client, table },
  );
}

export function buildEventEntity(client: DynamoDBDocumentClient, table: string) {
  return new Entity(
    {
      model: { entity: "propertyEvent", version: "1", service: "catalog" },
      attributes: {
        eventId: { type: "string", required: true },
        propertyId: { type: "string", required: true },
        // `dueIso` is the ISO form of `dueAt`, kept as an attribute because it composes the keys
        // (DynamoDB keys are strings); the domain works in epoch ms via `dueAt`.
        dueIso: { type: "string", required: true },
        dueAt: { type: "number", required: true },
        title: { type: "string" },
        notifyConversationKey: { type: "string", required: true },
        notifiedAt: { type: "number" },
        createdAt: { type: "number" },
      },
      indexes: {
        byProperty: {
          pk: {
            field: "pk",
            composite: ["propertyId"],
            template: "PROP#${propertyId}",
            casing: "none",
          },
          sk: {
            field: "sk",
            composite: ["dueIso", "eventId"],
            template: "EVT#${dueIso}#${eventId}",
            casing: "none",
          },
        },
        // Sparse "due" index for the reminder sweep. Constant partition + dueIso sort key, so the
        // sweep query is `gsi2pk = "DUE" AND gsi2sk <= now`. The keys are cleared on notify (raw
        // UpdateItem in markEventNotified) so a notified event drops out of the index.
        byDueDate: {
          index: GSI2,
          pk: { field: "gsi2pk", composite: [], template: GSI2_DUE_PK, casing: "none" },
          sk: {
            field: "gsi2sk",
            composite: ["dueIso", "eventId"],
            template: "${dueIso}#${eventId}",
            casing: "none",
          },
        },
      },
    },
    { client, table },
  );
}

export function buildMemoryEntity(client: DynamoDBDocumentClient, table: string) {
  return new Entity(
    {
      model: { entity: "conversationMemory", version: "1", service: "catalog" },
      attributes: {
        conversationKey: { type: "string", required: true },
        content: { type: "string", required: true },
      },
      indexes: {
        byConversation: {
          pk: {
            field: "pk",
            composite: ["conversationKey"],
            template: "CONV#${conversationKey}",
            casing: "none",
          },
          sk: { field: "sk", composite: [], template: "MEMORY", casing: "none" },
        },
      },
    },
    { client, table },
  );
}

type PropertyItem = EntityItem<ReturnType<typeof buildPropertyEntity>>;

export function toProperty(item: PropertyItem): Property {
  return {
    propertyId: item.propertyId,
    originConversationKey: item.originConversationKey,
    normalizedAddress: item.normalizedAddress,
    rawAddresses: item.rawAddresses,
    projectName: item.projectName,
    lat: item.lat,
    long: item.long,
    district: item.district,
    subdistrict: item.subdistrict,
    province: item.province,
    propertyType: item.propertyType,
    status: item.status,
    askingPrice: item.askingPrice,
    currency: item.currency,
    tags: item.tags,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    usableAreaSqm: item.usableAreaSqm,
    landArea: item.landArea,
    floors: item.floors,
    furnishing: item.furnishing,
    notes: item.notes,
    listingType: item.listingType,
    rentPrice: item.rentPrice,
    contact: item.contact,
    source: item.source,
    mapUrl: item.mapUrl,
    chanote: item.chanote,
    photos: toPhotos(item.photos),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastActivityAt: item.lastActivityAt,
  };
}

/** Map stored photos to the domain shape, migrating legacy rows that stored a bare `string[]` of S3
 * keys (pre-plan-13) to labelled `{ s3Key, kind:"property" }`. */
function toPhotos(raw: unknown): PropertyPhoto[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) {
    return undefined;
  }
  return raw.map((p) => {
    if (typeof p === "string") {
      return { s3Key: p, kind: "property" as const };
    }
    const obj = p as { s3Key?: unknown; kind?: unknown; label?: unknown };
    const label = typeof obj.label === "string" && obj.label !== "" ? obj.label : undefined;
    return {
      s3Key: String(obj.s3Key ?? ""),
      kind: (obj.kind ?? "property") as PhotoKind,
      ...(label !== undefined ? { label } : {}),
    };
  });
}

export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Copy the readonly domain {@link Chanote} into the mutable map ElectroDB writes, dropping absent
 * fields so the stored map stays compact. */
export function toStoredChanote(c: Chanote): Record<string, unknown> {
  return stripUndefined({
    titleType: c.titleType,
    deedNumber: c.deedNumber,
    landNumber: c.landNumber,
    surveyPage: c.surveyPage,
    mapSheet: c.mapSheet,
    landOffice: c.landOffice,
    province: c.province,
    district: c.district,
    subdistrict: c.subdistrict,
    landArea: c.landArea,
    ownerName: c.ownerName,
    encumbrances: c.encumbrances ? [...c.encumbrances] : undefined,
    confidenceNote: c.confidenceNote,
  });
}

/** Map a stored event item (ElectroDB item or a raw GSI2 row) onto the domain {@link PropertyEvent};
 * `dueIso` is a keys-only derivation of `dueAt`, so it's dropped here. */
export function toEvent(item: Record<string, unknown>): PropertyEvent {
  return {
    eventId: String(item.eventId ?? ""),
    propertyId: String(item.propertyId ?? ""),
    dueAt: Number(item.dueAt ?? 0),
    title: typeof item.title === "string" ? item.title : undefined,
    notifyConversationKey: String(item.notifyConversationKey ?? ""),
    notifiedAt: typeof item.notifiedAt === "number" ? item.notifiedAt : undefined,
    createdAt: typeof item.createdAt === "number" ? item.createdAt : undefined,
  };
}

// ---------------------------------------------------------------------------
// Conversation tracker (raw atomic ops). The set-if-unset `pendingSince`, conditional claim, and
// sparse GSI1 management need precise UpdateExpressions/ConditionExpressions, so this part bypasses
// ElectroDB and writes the item shape directly: pk=CONV#<key>, sk=META.
// ---------------------------------------------------------------------------
export function trackerKey(conversationKey: string): { pk: string; sk: string } {
  return { pk: `CONV#${conversationKey}`, sk: "META" };
}

/** Debounce policy for the ingestion sweep. A conversation becomes eligible when it has been quiet
 * for `quietDebounceMs` (the timer resets on each new message), but never waits longer than
 * `maxWaitMs` from its first un-ingested message — so a continuously-active chat can't starve. */
export interface DebouncePolicy {
  readonly quietDebounceMs: number;
  readonly maxWaitMs: number;
}

export const DEFAULT_DEBOUNCE: DebouncePolicy = {
  quietDebounceMs: 2 * 60_000, // 2 min quiet (snappier ingestion after a chat goes idle)
  maxWaitMs: 30 * 60_000, // 30 min cap
};

// Match by `.name`, NOT `instanceof ConditionalCheckFailedException`. In a bundled Lambda the SDK
// error can cross a module boundary (duplicate SDK copies / middleware re-throw) where `instanceof`
// silently returns false; the `.name` string is bundle-stable and is AWS's own guidance. It also
// keeps this file free of a client-layer import. Do not "simplify" this to instanceof.
export function isConditionalCheckFailed(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: string }).name === "ConditionalCheckFailedException"
  );
}

export function toTracker(item: Record<string, unknown>): ConversationTracker {
  const status =
    item.status === "INGESTING" ? "INGESTING" : item.status === "FAILED" ? "FAILED" : "IDLE";
  return {
    conversationKey: String(item.conversationKey ?? ""),
    lastInboundAt: Number(item.lastInboundAt ?? 0),
    lastIngestedAt: Number(item.lastIngestedAt ?? 0),
    status,
    pendingSince: typeof item.pendingSince === "string" ? item.pendingSince : undefined,
    claimedAt: typeof item.claimedAt === "number" ? item.claimedAt : undefined,
    ingestAttempts: typeof item.ingestAttempts === "number" ? item.ingestAttempts : undefined,
  };
}
