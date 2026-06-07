// biome-ignore-all lint/suspicious/noTemplateCurlyInString: ElectroDB key templates are plain
// strings whose `${attr}` placeholders ElectroDB interpolates itself — they must NOT be JS
// template literals.
import {
  type DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Entity, type EntityItem } from "electrodb";
import type {
  Chanote,
  ConversationTracker,
  PhotoKind,
  Property,
  PropertyEvent,
  PropertyPhoto,
  PropertyUpsert,
} from "../../core/domain/catalog.js";
import type { CatalogRepository } from "../../core/ports/catalog.js";

/** DynamoDB GSI for finding conversations with pending ingestion work (sparse — only the tracker
 * writes `gsi1pk`/`gsi1sk`, and only while it has un-ingested messages). */
const GSI1 = "gsi1";

/** DynamoDB GSI for finding follow-up events due for a reminder (sparse — a PropertyEvent writes
 * `gsi2pk`/`gsi2sk` on creation, and the reminder sweep clears them once it pushes the reminder). */
const GSI2 = "gsi2";

// ---------------------------------------------------------------------------
// ElectroDB entities (simple CRUD/query). `casing: "none"` preserves case-sensitive LINE ids and
// keeps these keys byte-identical to the raw-written tracker keys in the shared CONV# partition.
// ---------------------------------------------------------------------------
function buildPropertyEntity(client: DynamoDBDocumentClient, table: string) {
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
            properties: { s3Key: { type: "string" }, kind: { type: "string" } },
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

function buildConvPropertyEntity(client: DynamoDBDocumentClient, table: string) {
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

function buildMembershipEntity(client: DynamoDBDocumentClient, table: string) {
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

function buildEventEntity(client: DynamoDBDocumentClient, table: string) {
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
          pk: { field: "gsi2pk", composite: [], template: "DUE", casing: "none" },
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

function buildMemoryEntity(client: DynamoDBDocumentClient, table: string) {
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

function toProperty(item: PropertyItem): Property {
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
  return raw.map((p) =>
    typeof p === "string"
      ? { s3Key: p, kind: "property" as const }
      : {
          s3Key: String((p as { s3Key?: unknown }).s3Key ?? ""),
          kind: ((p as { kind?: unknown }).kind ?? "property") as PhotoKind,
        },
  );
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Copy the readonly domain {@link Chanote} into the mutable map ElectroDB writes, dropping absent
 * fields so the stored map stays compact. */
function toStoredChanote(c: Chanote): Record<string, unknown> {
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
function toEvent(item: Record<string, unknown>): PropertyEvent {
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
function trackerKey(conversationKey: string): { pk: string; sk: string } {
  return { pk: `CONV#${conversationKey}`, sk: "META" };
}

/** Debounce policy for the ingestion sweep. A conversation becomes eligible when it has been quiet
 * for `quietDebounceMs` (the timer resets on each new message), but never waits longer than
 * `maxWaitMs` from its first un-ingested message — so a continuously-active chat can't starve. */
export interface DebouncePolicy {
  readonly quietDebounceMs: number;
  readonly maxWaitMs: number;
}

const DEFAULT_DEBOUNCE: DebouncePolicy = {
  quietDebounceMs: 2 * 60_000, // 2 min quiet (snappier ingestion after a chat goes idle)
  maxWaitMs: 30 * 60_000, // 30 min cap
};

function isConditionalCheckFailed(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: string }).name === "ConditionalCheckFailedException"
  );
}

function toTracker(item: Record<string, unknown>): ConversationTracker {
  return {
    conversationKey: String(item.conversationKey ?? ""),
    lastInboundAt: Number(item.lastInboundAt ?? 0),
    lastIngestedAt: Number(item.lastIngestedAt ?? 0),
    status: item.status === "INGESTING" ? "INGESTING" : "IDLE",
    pendingSince: typeof item.pendingSince === "string" ? item.pendingSince : undefined,
    claimedAt: typeof item.claimedAt === "number" ? item.claimedAt : undefined,
  };
}

export class DynamoCatalogRepository implements CatalogRepository {
  private readonly property: ReturnType<typeof buildPropertyEntity>;
  private readonly convProperty: ReturnType<typeof buildConvPropertyEntity>;
  private readonly membership: ReturnType<typeof buildMembershipEntity>;
  private readonly event: ReturnType<typeof buildEventEntity>;
  private readonly memory: ReturnType<typeof buildMemoryEntity>;

  private readonly debounce: DebouncePolicy;

  constructor(
    private readonly doc: DynamoDBDocumentClient,
    private readonly table: string,
    debounce: Partial<DebouncePolicy> = {},
  ) {
    this.property = buildPropertyEntity(doc, table);
    this.convProperty = buildConvPropertyEntity(doc, table);
    this.membership = buildMembershipEntity(doc, table);
    this.event = buildEventEntity(doc, table);
    this.memory = buildMemoryEntity(doc, table);
    this.debounce = { ...DEFAULT_DEBOUNCE, ...debounce };
  }

  // --- Conversation tracker ---

  async touchConversation(conversationKey: string, inboundAtMs: number): Promise<void> {
    // Quiet-debounce with a max-wait cap. The sparse GSI1 sort key is an absolute "ready-at" time
    // (gsi1sk = readyAt), so the sweep is just `gsi1sk <= now`. readyAt = inboundAt + quietDebounce,
    // pushed out on each message — but never past ingestDeadline = firstPendingAt + maxWait.
    const readyAt = new Date(inboundAtMs + this.debounce.quietDebounceMs).toISOString();
    const deadline = new Date(inboundAtMs + this.debounce.maxWaitMs).toISOString();
    const firstPending = new Date(inboundAtMs).toISOString();

    try {
      // Common path (one write): advance lastInboundAt + push the timer out to readyAt, as long as
      // readyAt is still within the deadline. On the first message, attribute_not_exists wins and
      // seeds pendingSince/ingestDeadline/gsi1 keys. if_not_exists keeps the deadline anchored to
      // the first un-ingested message across subsequent messages.
      await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: trackerKey(conversationKey),
          UpdateExpression:
            "SET lastInboundAt = :in, " +
            "lastIngestedAt = if_not_exists(lastIngestedAt, :zero), " +
            "#status = if_not_exists(#status, :idle), " +
            "entityType = if_not_exists(entityType, :etype), " +
            "conversationKey = if_not_exists(conversationKey, :ckey), " +
            "pendingSince = if_not_exists(pendingSince, :first), " +
            "ingestDeadline = if_not_exists(ingestDeadline, :deadline), " +
            "gsi1pk = if_not_exists(gsi1pk, :pending), " +
            "gsi1sk = :ready",
          ConditionExpression: "attribute_not_exists(ingestDeadline) OR :ready <= ingestDeadline",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":in": inboundAtMs,
            ":zero": 0,
            ":idle": "IDLE",
            ":etype": "conversationTracker",
            ":ckey": conversationKey,
            ":first": firstPending,
            ":deadline": deadline,
            ":ready": readyAt,
            ":pending": "PENDING",
          },
        }),
      );
    } catch (error) {
      if (!isConditionalCheckFailed(error)) {
        throw error;
      }
      // Cap reached (readyAt would exceed the deadline): still advance lastInboundAt, but freeze the
      // GSI key at the deadline so the conversation becomes eligible then rather than starving.
      await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: trackerKey(conversationKey),
          UpdateExpression: "SET lastInboundAt = :in, gsi1sk = ingestDeadline",
          ExpressionAttributeValues: { ":in": inboundAtMs },
        }),
      );
    }
  }

  async findPendingConversations(nowIso: string, limit: number): Promise<ConversationTracker[]> {
    const result = await this.doc.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: GSI1,
        // gsi1sk holds the absolute readyAt, so eligibility is simply readyAt <= now.
        KeyConditionExpression: "gsi1pk = :p AND gsi1sk <= :now",
        ExpressionAttributeValues: { ":p": "PENDING", ":now": nowIso },
        Limit: limit,
      }),
    );
    return (result.Items ?? []).map(toTracker);
  }

  async claimConversation(
    conversationKey: string,
    nowMs: number,
    staleTimeoutMs: number,
  ): Promise<ConversationTracker | null> {
    try {
      const result = await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: trackerKey(conversationKey),
          UpdateExpression: "SET #status = :ingesting, claimedAt = :now",
          ConditionExpression:
            "attribute_exists(pk) AND (#status <> :ingesting OR claimedAt < :staleBefore)",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":ingesting": "INGESTING",
            ":now": nowMs,
            ":staleBefore": nowMs - staleTimeoutMs,
          },
          ReturnValues: "ALL_NEW",
        }),
      );
      return result.Attributes ? toTracker(result.Attributes) : null;
    } catch (error) {
      if (isConditionalCheckFailed(error)) {
        return null;
      }
      throw error;
    }
  }

  async releaseConversation(
    conversationKey: string,
    opts: { watermark: number; claimSeenInboundAt: number },
  ): Promise<void> {
    const key = trackerKey(conversationKey);
    try {
      // No new message since the claim → clear pending and drop out of GSI1.
      await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: key,
          UpdateExpression:
            "SET lastIngestedAt = :wm, #status = :idle REMOVE pendingSince, ingestDeadline, gsi1pk, gsi1sk, claimedAt",
          ConditionExpression: "lastInboundAt <= :seen",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":wm": opts.watermark,
            ":idle": "IDLE",
            ":seen": opts.claimSeenInboundAt,
          },
        }),
      );
    } catch (error) {
      if (!isConditionalCheckFailed(error)) {
        throw error;
      }
      // A newer message arrived during ingestion: only advance the watermark and drop the claim.
      // The conversation stays in GSI1 — touchConversation already re-armed gsi1sk for that message
      // (it runs regardless of INGESTING status) — so the next sweep ingests the remainder.
      await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: key,
          UpdateExpression: "SET lastIngestedAt = :wm, #status = :idle REMOVE claimedAt",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: { ":wm": opts.watermark, ":idle": "IDLE" },
        }),
      );
    }
  }

  async getConversation(conversationKey: string): Promise<ConversationTracker | null> {
    const result = await this.doc.send(
      new GetCommand({ TableName: this.table, Key: trackerKey(conversationKey) }),
    );
    return result.Item ? toTracker(result.Item) : null;
  }

  // --- Edit context ---

  async armEdit(conversationKey: string, propertyId: string, armedAtMs: number): Promise<void> {
    await this.doc.send(
      new UpdateCommand({
        TableName: this.table,
        Key: trackerKey(conversationKey),
        // Set only the edit-context attrs (seeding identity if the META item doesn't exist yet — a
        // view before any inbound message). Deliberately leaves gsi1/pending untouched, so arming an
        // edit never enqueues the conversation for ingestion.
        UpdateExpression:
          "SET editPropertyId = :pid, editArmedAt = :at, " +
          "entityType = if_not_exists(entityType, :etype), " +
          "conversationKey = if_not_exists(conversationKey, :ckey)",
        ExpressionAttributeValues: {
          ":pid": propertyId,
          ":at": armedAtMs,
          ":etype": "conversationTracker",
          ":ckey": conversationKey,
        },
      }),
    );
  }

  async getEditContext(
    conversationKey: string,
  ): Promise<{ propertyId: string; armedAt: number } | null> {
    const result = await this.doc.send(
      new GetCommand({ TableName: this.table, Key: trackerKey(conversationKey) }),
    );
    const item = result.Item;
    if (item === undefined || typeof item.editPropertyId !== "string") {
      return null;
    }
    return { propertyId: item.editPropertyId, armedAt: Number(item.editArmedAt ?? 0) };
  }

  async clearEdit(conversationKey: string): Promise<void> {
    await this.doc.send(
      new UpdateCommand({
        TableName: this.table,
        Key: trackerKey(conversationKey),
        UpdateExpression: "REMOVE editPropertyId, editArmedAt",
      }),
    );
  }

  // --- Membership ---

  async recordMembership(userId: string, conversationKey: string, seenAtMs: number): Promise<void> {
    await this.membership.upsert({ userId, conversationKey, lastSeenAt: seenAtMs }).go();
  }

  async removeMembership(userId: string, conversationKey: string): Promise<void> {
    await this.membership.delete({ userId, conversationKey }).go();
  }

  async listUserConversations(userId: string): Promise<string[]> {
    const result = await this.membership.query.byUser({ userId }).go();
    return result.data.map((edge) => edge.conversationKey);
  }

  // --- Properties + edges ---

  async upsertProperty(input: PropertyUpsert): Promise<void> {
    // Copy the readonly domain arrays/maps into the mutable shape ElectroDB's writer expects.
    const { rawAddresses, tags, photos, chanote, ...rest } = input;
    const data = stripUndefined({
      ...rest,
      ...(rawAddresses ? { rawAddresses: [...rawAddresses] } : {}),
      ...(tags ? { tags: [...tags] } : {}),
      ...(photos ? { photos: photos.map((p) => ({ s3Key: p.s3Key, kind: p.kind })) } : {}),
      ...(chanote ? { chanote: toStoredChanote(chanote) } : {}),
    });
    await this.property.upsert(data).go();
  }

  async getProperty(propertyId: string): Promise<Property | null> {
    const result = await this.property.get({ propertyId }).go();
    return result.data ? toProperty(result.data) : null;
  }

  async deleteProperty(propertyId: string): Promise<void> {
    await this.property.delete({ propertyId }).go();
  }

  async linkConversationProperty(
    conversationKey: string,
    propertyId: string,
    nowMs: number,
  ): Promise<void> {
    await this.convProperty.upsert({ conversationKey, propertyId, updatedAt: nowMs }).go();
  }

  async unlinkConversationProperty(conversationKey: string, propertyId: string): Promise<void> {
    await this.convProperty.delete({ conversationKey, propertyId }).go();
  }

  async listConversationProperties(conversationKey: string): Promise<string[]> {
    const result = await this.convProperty.query.byConversation({ conversationKey }).go();
    return result.data.map((edge) => edge.propertyId);
  }

  async listPropertiesForUser(userId: string): Promise<Property[]> {
    const conversationKeys = await this.listUserConversations(userId);
    const idLists = await Promise.all(
      conversationKeys.map((key) => this.listConversationProperties(key)),
    );
    const uniqueIds = [...new Set(idLists.flat())];
    const properties = await Promise.all(uniqueIds.map((id) => this.getProperty(id)));
    return properties.filter((p): p is Property => p !== null);
  }

  // --- Property events (calendar / reminders) ---

  async addEvent(event: PropertyEvent): Promise<void> {
    const data = stripUndefined({
      eventId: event.eventId,
      propertyId: event.propertyId,
      dueIso: new Date(event.dueAt).toISOString(),
      dueAt: event.dueAt,
      title: event.title,
      notifyConversationKey: event.notifyConversationKey,
      notifiedAt: event.notifiedAt,
      createdAt: event.createdAt,
    });
    await this.event.create(data).go();
  }

  async listPropertyEvents(propertyId: string): Promise<PropertyEvent[]> {
    const result = await this.event.query.byProperty({ propertyId }).go();
    return result.data.map(toEvent);
  }

  async deletePropertyEvents(propertyId: string): Promise<void> {
    const result = await this.event.query.byProperty({ propertyId }).go();
    if (result.data.length === 0) {
      return;
    }
    await this.event
      .delete(result.data.map((e) => ({ propertyId, dueIso: e.dueIso, eventId: e.eventId })))
      .go();
  }

  async findDueEvents(nowIso: string, limit: number): Promise<PropertyEvent[]> {
    // Raw GSI2 query (mirrors findPendingConversations on GSI1): the sort key is `<dueIso>#<eventId>`
    // so `gsi2sk <= now` returns every un-notified event past its due time (notified events have had
    // their GSI keys cleared, so they never appear). Events due exactly now fire on the next tick.
    const result = await this.doc.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: GSI2,
        KeyConditionExpression: "gsi2pk = :p AND gsi2sk <= :now",
        ExpressionAttributeValues: { ":p": "DUE", ":now": nowIso },
        Limit: limit,
      }),
    );
    return (result.Items ?? []).map(toEvent);
  }

  // --- Per-conversation memory ---

  async getMemoryDoc(conversationKey: string): Promise<string | null> {
    const result = await this.memory.get({ conversationKey }).go();
    return result.data?.content ?? null;
  }

  async putMemoryDoc(conversationKey: string, content: string): Promise<void> {
    await this.memory.upsert({ conversationKey, content }).go();
  }

  async markEventNotified(event: PropertyEvent, nowMs: number): Promise<boolean> {
    const dueIso = new Date(event.dueAt).toISOString();
    try {
      // Atomic claim-and-mark: stamp notifiedAt and drop the sparse GSI2 keys, but only if no other
      // sweep already notified. Winning the condition is the licence to push exactly one reminder;
      // losing it means another worker has it. (A push failure after winning loses that one reminder
      // — acceptable, and far rarer than the double-send a non-atomic check would risk.)
      await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: { pk: `PROP#${event.propertyId}`, sk: `EVT#${dueIso}#${event.eventId}` },
          UpdateExpression: "SET notifiedAt = :now REMOVE gsi2pk, gsi2sk",
          ConditionExpression: "attribute_exists(pk) AND attribute_not_exists(notifiedAt)",
          ExpressionAttributeValues: { ":now": nowMs },
        }),
      );
      return true;
    } catch (error) {
      if (isConditionalCheckFailed(error)) {
        return false;
      }
      throw error;
    }
  }
}

export function createCatalogRepository(
  doc: DynamoDBDocumentClient,
  table: string,
): DynamoCatalogRepository {
  return new DynamoCatalogRepository(doc, table);
}
