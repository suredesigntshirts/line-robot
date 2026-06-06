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

  constructor(
    private readonly doc: DynamoDBDocumentClient,
    private readonly table: string,
  ) {
    this.property = buildPropertyEntity(doc, table);
    this.convProperty = buildConvPropertyEntity(doc, table);
    this.membership = buildMembershipEntity(doc, table);
  }

  // --- Conversation tracker ---

  async touchConversation(
    conversationKey: string,
    inboundAtMs: number,
    nowIso: string,
  ): Promise<void> {
    // Always advance lastInboundAt; set pendingSince + sparse GSI1 keys only if not already
    // pending (if_not_exists), anchoring the debounce to the first un-ingested message. Atomic and
    // idempotent — re-running on the same event is a no-op for the pending keys.
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
          "pendingSince = if_not_exists(pendingSince, :now), " +
          "gsi1pk = if_not_exists(gsi1pk, :pending), " +
          "gsi1sk = if_not_exists(gsi1sk, :now)",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":in": inboundAtMs,
          ":zero": 0,
          ":idle": "IDLE",
          ":etype": "conversationTracker",
          ":ckey": conversationKey,
          ":now": nowIso,
          ":pending": "PENDING",
        },
      }),
    );
  }

  async findPendingConversations(
    readyBeforeIso: string,
    limit: number,
  ): Promise<ConversationTracker[]> {
    const result = await this.doc.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: GSI1,
        KeyConditionExpression: "gsi1pk = :p AND gsi1sk <= :before",
        ExpressionAttributeValues: { ":p": "PENDING", ":before": readyBeforeIso },
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
    opts: { watermark: number; claimSeenInboundAt: number; nowIso: string },
  ): Promise<void> {
    const key = trackerKey(conversationKey);
    try {
      // No new message since the claim → clear pending and drop out of GSI1.
      await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: key,
          UpdateExpression:
            "SET lastIngestedAt = :wm, #status = :idle REMOVE pendingSince, gsi1pk, gsi1sk, claimedAt",
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
      // A newer message arrived during ingestion — re-arm pending so the next sweep picks up the
      // remainder. gsi1sk = now keeps it discoverable (it will debounce again from here).
      await this.doc.send(
        new UpdateCommand({
          TableName: this.table,
          Key: key,
          UpdateExpression:
            "SET lastIngestedAt = :wm, #status = :idle, pendingSince = :now, gsi1pk = :pending, gsi1sk = :now REMOVE claimedAt",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":wm": opts.watermark,
            ":idle": "IDLE",
            ":now": opts.nowIso,
            ":pending": "PENDING",
          },
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
