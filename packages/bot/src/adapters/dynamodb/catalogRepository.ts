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
import type { ConversationTracker, Property, PropertyUpsert } from "../../core/domain/catalog.js";
import type { CatalogRepository } from "../../core/ports/catalog.js";

/** DynamoDB GSI for finding conversations with pending ingestion work (sparse — only the tracker
 * writes `gsi1pk`/`gsi1sk`, and only while it has un-ingested messages). */
const GSI1 = "gsi1";

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
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastActivityAt: item.lastActivityAt,
  };
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
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
  quietDebounceMs: 5 * 60_000, // 5 min quiet
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

  private readonly debounce: DebouncePolicy;

  constructor(
    private readonly doc: DynamoDBDocumentClient,
    private readonly table: string,
    debounce: Partial<DebouncePolicy> = {},
  ) {
    this.property = buildPropertyEntity(doc, table);
    this.convProperty = buildConvPropertyEntity(doc, table);
    this.membership = buildMembershipEntity(doc, table);
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

  // --- Membership ---

  async recordMembership(userId: string, conversationKey: string, seenAtMs: number): Promise<void> {
    await this.membership.upsert({ userId, conversationKey, lastSeenAt: seenAtMs }).go();
  }

  async listUserConversations(userId: string): Promise<string[]> {
    const result = await this.membership.query.byUser({ userId }).go();
    return result.data.map((edge) => edge.conversationKey);
  }

  // --- Properties + edges ---

  async upsertProperty(input: PropertyUpsert): Promise<void> {
    // Copy the readonly domain arrays into the mutable shape ElectroDB's writer expects.
    const { rawAddresses, tags, ...rest } = input;
    const data = stripUndefined({
      ...rest,
      ...(rawAddresses ? { rawAddresses: [...rawAddresses] } : {}),
      ...(tags ? { tags: [...tags] } : {}),
    });
    await this.property.upsert(data).go();
  }

  async getProperty(propertyId: string): Promise<Property | null> {
    const result = await this.property.get({ propertyId }).go();
    return result.data ? toProperty(result.data) : null;
  }

  async linkConversationProperty(
    conversationKey: string,
    propertyId: string,
    nowMs: number,
  ): Promise<void> {
    await this.convProperty.upsert({ conversationKey, propertyId, updatedAt: nowMs }).go();
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
}

export function createCatalogRepository(
  doc: DynamoDBDocumentClient,
  table: string,
): DynamoCatalogRepository {
  return new DynamoCatalogRepository(doc, table);
}
