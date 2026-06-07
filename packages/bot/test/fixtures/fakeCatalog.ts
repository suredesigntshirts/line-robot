import type {
  ConversationTracker,
  Property,
  PropertyEvent,
  PropertyUpsert,
} from "../../src/core/domain/catalog.js";
import type { CatalogRepository } from "../../src/core/ports/catalog.js";

/**
 * A small in-memory {@link CatalogRepository} for handler/assistant tests: real property + edge +
 * membership + event semantics (so listPropertiesForUser / merge / follow-ups behave), with the
 * ingestion-tracker ops stubbed (those have their own DynamoDB-backed tests). Exposes the backing
 * maps for assertions.
 */
export class FakeCatalog implements CatalogRepository {
  readonly properties = new Map<string, Property>();
  readonly convProps = new Map<string, Set<string>>();
  readonly userConvs = new Map<string, Set<string>>();
  /** Follow-up events, keyed by propertyId. */
  readonly events = new Map<string, PropertyEvent[]>();

  seedProperty(property: Property): this {
    this.properties.set(property.propertyId, property);
    return this;
  }

  seedEdge(conversationKey: string, propertyId: string): this {
    this.convProps.set(
      conversationKey,
      (this.convProps.get(conversationKey) ?? new Set()).add(propertyId),
    );
    return this;
  }

  seedMembership(userId: string, conversationKey: string): this {
    this.userConvs.set(userId, (this.userConvs.get(userId) ?? new Set()).add(conversationKey));
    return this;
  }

  // --- Conversation tracker (stubbed) ---
  async touchConversation(): Promise<void> {}
  async findPendingConversations(): Promise<ConversationTracker[]> {
    return [];
  }
  async claimConversation(): Promise<ConversationTracker | null> {
    return null;
  }
  async releaseConversation(): Promise<void> {}
  async getConversation(): Promise<ConversationTracker | null> {
    return null;
  }

  // --- Membership ---
  async recordMembership(userId: string, conversationKey: string): Promise<void> {
    this.seedMembership(userId, conversationKey);
  }
  async removeMembership(userId: string, conversationKey: string): Promise<void> {
    this.userConvs.get(userId)?.delete(conversationKey);
  }
  async listUserConversations(userId: string): Promise<string[]> {
    return [...(this.userConvs.get(userId) ?? [])];
  }

  // --- Properties + edges ---
  async upsertProperty(input: PropertyUpsert): Promise<void> {
    const existing = this.properties.get(input.propertyId) ?? { propertyId: input.propertyId };
    const merged: Record<string, unknown> = { ...existing };
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        merged[key] = value;
      }
    }
    this.properties.set(input.propertyId, merged as unknown as Property);
  }
  async getProperty(propertyId: string): Promise<Property | null> {
    return this.properties.get(propertyId) ?? null;
  }
  async deleteProperty(propertyId: string): Promise<void> {
    this.properties.delete(propertyId);
  }
  async linkConversationProperty(conversationKey: string, propertyId: string): Promise<void> {
    this.seedEdge(conversationKey, propertyId);
  }
  async unlinkConversationProperty(conversationKey: string, propertyId: string): Promise<void> {
    this.convProps.get(conversationKey)?.delete(propertyId);
  }
  async listConversationProperties(conversationKey: string): Promise<string[]> {
    return [...(this.convProps.get(conversationKey) ?? [])];
  }
  async listPropertiesForUser(userId: string): Promise<Property[]> {
    const ids = new Set<string>();
    for (const convKey of this.userConvs.get(userId) ?? []) {
      for (const id of this.convProps.get(convKey) ?? []) {
        ids.add(id);
      }
    }
    return [...ids]
      .map((id) => this.properties.get(id))
      .filter((p): p is Property => p !== undefined);
  }

  // --- Property events ---
  seedEvent(event: PropertyEvent): this {
    this.events.set(event.propertyId, [...(this.events.get(event.propertyId) ?? []), event]);
    return this;
  }
  async addEvent(event: PropertyEvent): Promise<void> {
    this.seedEvent(event);
  }
  async listPropertyEvents(propertyId: string): Promise<PropertyEvent[]> {
    return [...(this.events.get(propertyId) ?? [])];
  }
  async findDueEvents(nowIso: string, limit: number): Promise<PropertyEvent[]> {
    return [...this.events.values()]
      .flat()
      .filter((e) => e.notifiedAt === undefined && new Date(e.dueAt).toISOString() <= nowIso)
      .sort((a, b) => a.dueAt - b.dueAt)
      .slice(0, limit);
  }
  async markEventNotified(event: PropertyEvent, nowMs: number): Promise<boolean> {
    const list = this.events.get(event.propertyId) ?? [];
    const target = list.find((e) => e.eventId === event.eventId);
    if (target === undefined || target.notifiedAt !== undefined) {
      return false;
    }
    this.events.set(
      event.propertyId,
      list.map((e) => (e.eventId === event.eventId ? { ...e, notifiedAt: nowMs } : e)),
    );
    return true;
  }

  // --- Per-conversation memory ---
  readonly memoryDocs = new Map<string, string>();
  async getMemoryDoc(conversationKey: string): Promise<string | null> {
    return this.memoryDocs.get(conversationKey) ?? null;
  }
  async putMemoryDoc(conversationKey: string, content: string): Promise<void> {
    this.memoryDocs.set(conversationKey, content);
  }
}
