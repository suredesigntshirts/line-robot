import type { ConversationTracker, Property, PropertyUpsert } from "../domain/catalog.js";

/**
 * Persistence seam for the catalog. Keyed by raw string ids (conversationKey / userId /
 * propertyId) rather than {@link ConversationRef} because the ingestion/reminder sweeps work
 * purely from keys discovered via GSIs; callers that hold a ref convert with `conversationKey()`.
 */
export interface CatalogRepository {
  // --- Conversation tracker (debounced-ingestion state machine) ---

  /**
   * Record an inbound message on the conversation tracker: always advance `lastInboundAt`, and
   * set `pendingSince` (+ the sparse GSI1 keys) only if not already pending — so the debounce
   * anchors to the first un-ingested message. Idempotent; creates the tracker on first contact.
   */
  touchConversation(conversationKey: string, inboundAtMs: number, nowIso: string): Promise<void>;

  /** Conversations with pending work whose `pendingSince` is at or before `readyBeforeIso`
   * (i.e. quiet for the debounce window). Sourced from the sparse GSI1 — no table scan. */
  findPendingConversations(readyBeforeIso: string, limit: number): Promise<ConversationTracker[]>;

  /**
   * Atomically claim a conversation for ingestion: set `status=INGESTING, claimedAt=now` only if
   * it is not already claimed (or the claim is older than `staleTimeoutMs`). Returns the claimed
   * tracker (so the caller knows the batch range `lastIngestedAt..lastInboundAt`), or `null` if
   * another worker holds a live claim.
   */
  claimConversation(
    conversationKey: string,
    nowMs: number,
    staleTimeoutMs: number,
  ): Promise<ConversationTracker | null>;

  /**
   * Finish an ingestion run. Advances `lastIngestedAt` to `watermark` and releases the claim.
   * If no newer message arrived during the run (`lastInboundAt <= claimSeenInboundAt`), clears
   * `pendingSince` so the conversation drops out of GSI1; otherwise re-arms `pendingSince=nowIso`
   * so the next sweep ingests the remainder (no message is ever lost).
   */
  releaseConversation(
    conversationKey: string,
    opts: { watermark: number; claimSeenInboundAt: number; nowIso: string },
  ): Promise<void>;

  getConversation(conversationKey: string): Promise<ConversationTracker | null>;

  // --- User ↔ Conversation membership (read-access edges) ---

  /** Upsert a membership edge `USER#<userId> → CONV#<conversationKey>`. */
  recordMembership(userId: string, conversationKey: string, seenAtMs: number): Promise<void>;

  /** Conversation keys this user is (or has been) a member of. */
  listUserConversations(userId: string): Promise<string[]>;

  // --- Properties + Conv→Property edges (write-scope + listing) ---

  /** Create or merge a property (set-if-present; never clobbers fields the caller omits). */
  upsertProperty(input: PropertyUpsert): Promise<void>;

  getProperty(propertyId: string): Promise<Property | null>;

  /** Upsert a Conv→Property edge `CONV#<conversationKey> → PROP#<propertyId>`. */
  linkConversationProperty(
    conversationKey: string,
    propertyId: string,
    nowMs: number,
  ): Promise<void>;

  /** Property ids discussed in (scoped to) this conversation — dedup candidates + this chat's
   * listings. */
  listConversationProperties(conversationKey: string): Promise<string[]>;

  /** "Show my listings": resolve user → their conversations → those conversations' properties
   * (deduped). Read-access follows the user across chats. */
  listPropertiesForUser(userId: string): Promise<Property[]>;
}
