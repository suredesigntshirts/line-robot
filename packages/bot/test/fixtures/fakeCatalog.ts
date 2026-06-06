import type {
  ConversationTracker,
  Property,
  PropertyUpsert,
} from "../../src/core/domain/catalog.js";
import type { CatalogRepository } from "../../src/core/ports/catalog.js";

/**
 * A small in-memory {@link CatalogRepository} for handler/assistant tests: real property + edge +
 * membership semantics (so listPropertiesForUser / merge behave), with the ingestion-tracker ops
 * stubbed (those have their own DynamoDB-backed tests). Exposes the backing maps for assertions.
 */
export class FakeCatalog implements CatalogRepository {
  readonly properties = new Map<string, Property>();
  readonly convProps = new Map<string, Set<string>>();
  readonly userConvs = new Map<string, Set<string>>();

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
}
