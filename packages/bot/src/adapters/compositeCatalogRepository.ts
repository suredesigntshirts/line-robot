import type {
  ConversationTracker,
  Property,
  PropertyEvent,
  PropertyUpsert,
} from "../core/domain/catalog.js";
import type { CatalogRepository, ConversationStore, PropertyStore } from "../core/ports/catalog.js";

/**
 * The post-cutover catalog: conversation/membership/memory state stays on DynamoDB (the kept
 * ingestion spine), while the property catalog reads/writes Postgres (the v2 model the website and
 * pipeline share). It implements the one `CatalogRepository` the handlers/read-api/processor inject,
 * delegating each method to the store that owns that aggregate.
 *
 * `listPropertiesForUser` is the only method that spans both: it resolves the user's conversations
 * via DynamoDB membership, then those conversations' listings via Postgres — which is exactly why it
 * lives on `CatalogRepository` and not on either store alone.
 */
export class CompositeCatalogRepository implements CatalogRepository {
  constructor(
    private readonly conversations: ConversationStore,
    private readonly properties: PropertyStore,
  ) {}

  // --- ConversationStore (DynamoDB) ---

  touchConversation(conversationKey: string, inboundAtMs: number): Promise<void> {
    return this.conversations.touchConversation(conversationKey, inboundAtMs);
  }
  findPendingConversations(nowIso: string, limit: number): Promise<ConversationTracker[]> {
    return this.conversations.findPendingConversations(nowIso, limit);
  }
  claimConversation(
    conversationKey: string,
    nowMs: number,
    staleTimeoutMs: number,
  ): Promise<ConversationTracker | null> {
    return this.conversations.claimConversation(conversationKey, nowMs, staleTimeoutMs);
  }
  failConversation(conversationKey: string): Promise<void> {
    return this.conversations.failConversation(conversationKey);
  }
  releaseConversation(
    conversationKey: string,
    opts: { watermark: number; claimSeenInboundAt: number },
  ): Promise<void> {
    return this.conversations.releaseConversation(conversationKey, opts);
  }
  getConversation(conversationKey: string): Promise<ConversationTracker | null> {
    return this.conversations.getConversation(conversationKey);
  }
  recordMembership(userId: string, conversationKey: string, seenAtMs: number): Promise<void> {
    return this.conversations.recordMembership(userId, conversationKey, seenAtMs);
  }
  removeMembership(userId: string, conversationKey: string): Promise<void> {
    return this.conversations.removeMembership(userId, conversationKey);
  }
  listUserConversations(userId: string): Promise<string[]> {
    return this.conversations.listUserConversations(userId);
  }
  getMemoryDoc(conversationKey: string): Promise<string | null> {
    return this.conversations.getMemoryDoc(conversationKey);
  }
  putMemoryDoc(conversationKey: string, content: string): Promise<void> {
    return this.conversations.putMemoryDoc(conversationKey, content);
  }

  // --- PropertyStore (Postgres) ---

  upsertProperty(input: PropertyUpsert): Promise<void> {
    return this.properties.upsertProperty(input);
  }
  getProperty(propertyId: string): Promise<Property | null> {
    return this.properties.getProperty(propertyId);
  }
  deleteProperty(propertyId: string): Promise<void> {
    return this.properties.deleteProperty(propertyId);
  }
  linkConversationProperty(
    conversationKey: string,
    propertyId: string,
    nowMs: number,
  ): Promise<void> {
    return this.properties.linkConversationProperty(conversationKey, propertyId, nowMs);
  }
  unlinkConversationProperty(conversationKey: string, propertyId: string): Promise<void> {
    return this.properties.unlinkConversationProperty(conversationKey, propertyId);
  }
  listConversationProperties(conversationKey: string): Promise<string[]> {
    return this.properties.listConversationProperties(conversationKey);
  }
  addEvent(event: PropertyEvent): Promise<void> {
    return this.properties.addEvent(event);
  }
  listPropertyEvents(propertyId: string): Promise<PropertyEvent[]> {
    return this.properties.listPropertyEvents(propertyId);
  }
  deletePropertyEvents(propertyId: string): Promise<void> {
    return this.properties.deletePropertyEvents(propertyId);
  }
  findDueEvents(nowIso: string, limit: number): Promise<PropertyEvent[]> {
    return this.properties.findDueEvents(nowIso, limit);
  }
  markEventNotified(event: PropertyEvent, nowMs: number): Promise<boolean> {
    return this.properties.markEventNotified(event, nowMs);
  }

  // --- Cross-aggregate: membership (DynamoDB) → listings (Postgres) ---

  async listPropertiesForUser(userId: string): Promise<Property[]> {
    const convKeys = await this.conversations.listUserConversations(userId);
    const idLists = await Promise.all(
      convKeys.map((key) => this.properties.listConversationProperties(key)),
    );
    const ids = [...new Set(idLists.flat())];
    const properties = await Promise.all(ids.map((id) => this.properties.getProperty(id)));
    return properties.filter((p): p is Property => p !== null);
  }
}
