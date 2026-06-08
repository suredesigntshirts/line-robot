import {
  type DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  ConversationTracker,
  Property,
  PropertyEvent,
  PropertyUpsert,
} from "../../core/domain/catalog.js";
import type { CatalogRepository } from "../../core/ports/catalog.js";
import {
  buildConvPropertyEntity,
  buildEventEntity,
  buildMembershipEntity,
  buildMemoryEntity,
  buildPropertyEntity,
  DEFAULT_DEBOUNCE,
  type DebouncePolicy,
  GSI1,
  GSI1_PENDING_PK,
  GSI2,
  GSI2_DUE_PK,
  isConditionalCheckFailed,
  stripUndefined,
  TRACKER_ENTITY_TYPE,
  toEvent,
  toProperty,
  toStoredChanote,
  toTracker,
  trackerKey,
} from "./catalogEntities.js";

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
            // New user activity → fresh attempt budget. Only autonomous reclaim loops (no inbound)
            // accumulate ingestAttempts toward the give-up cap.
            "ingestAttempts = :zero, " +
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
            ":etype": TRACKER_ENTITY_TYPE,
            ":ckey": conversationKey,
            ":first": firstPending,
            ":deadline": deadline,
            ":ready": readyAt,
            ":pending": GSI1_PENDING_PK,
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
        ExpressionAttributeValues: { ":p": GSI1_PENDING_PK, ":now": nowIso },
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
          // ADD is atomic + committed before any extraction work, so a timeout/crash mid-run is
          // still counted toward the give-up cap (the next reclaim sees the bumped attempts).
          UpdateExpression: "SET #status = :ingesting, claimedAt = :now ADD ingestAttempts :one",
          ConditionExpression:
            "attribute_exists(pk) AND (#status <> :ingesting OR claimedAt < :staleBefore)",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":ingesting": "INGESTING",
            ":now": nowMs,
            ":staleBefore": nowMs - staleTimeoutMs,
            ":one": 1,
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
            "SET lastIngestedAt = :wm, #status = :idle REMOVE pendingSince, ingestDeadline, gsi1pk, gsi1sk, claimedAt, ingestAttempts",
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
          // A new message re-armed pending → the claimed batch ingested fine, so the remaining
          // streak starts with a fresh attempt budget.
          UpdateExpression:
            "SET lastIngestedAt = :wm, #status = :idle, ingestAttempts = :zero REMOVE claimedAt",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: { ":wm": opts.watermark, ":idle": "IDLE", ":zero": 0 },
        }),
      );
    }
  }

  async failConversation(conversationKey: string): Promise<void> {
    // Terminal: drop off the pending GSI so no sweep reclaims it again (stops the cost loop). Keep
    // ingestAttempts for diagnostics. A later inbound message re-arms gsi1 + resets attempts.
    await this.doc.send(
      new UpdateCommand({
        TableName: this.table,
        Key: trackerKey(conversationKey),
        UpdateExpression:
          "SET #status = :failed REMOVE pendingSince, ingestDeadline, gsi1pk, gsi1sk, claimedAt",
        ConditionExpression: "attribute_exists(pk)",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":failed": "FAILED" },
      }),
    );
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
          ":etype": TRACKER_ENTITY_TYPE,
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
      ...(photos
        ? {
            photos: photos.map((p) => ({
              s3Key: p.s3Key,
              kind: p.kind,
              ...(p.label !== undefined ? { label: p.label } : {}),
            })),
          }
        : {}),
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
        ExpressionAttributeValues: { ":p": GSI2_DUE_PK, ":now": nowIso },
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
