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
   * update the sparse GSI1 "ready-at" key per the quiet-debounce + max-wait policy — the sweep
   * fires once the conversation is quiet for `quietDebounceMs`, but never later than `maxWaitMs`
   * from the first un-ingested message. Idempotent; creates the tracker on first contact.
   */
  touchConversation(conversationKey: string, inboundAtMs: number): Promise<void>;

  /** Conversations whose ready-at time is at or before `nowIso` (i.e. due for ingestion now).
   * Sourced from the sparse GSI1 — no table scan. */
  findPendingConversations(nowIso: string, limit: number): Promise<ConversationTracker[]>;

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
   * If no newer message arrived during the run (`lastInboundAt <= claimSeenInboundAt`), clears the
   * pending state so the conversation drops out of GSI1; otherwise leaves it pending (the mid-run
   * message already re-armed the GSI key) so the next sweep ingests the remainder — no loss.
   */
  releaseConversation(
    conversationKey: string,
    opts: { watermark: number; claimSeenInboundAt: number },
  ): Promise<void>;

  getConversation(conversationKey: string): Promise<ConversationTracker | null>;

  // --- User ↔ Conversation membership (read-access edges) ---

  /** Upsert a membership edge `USER#<userId> → CONV#<conversationKey>`. */
  recordMembership(userId: string, conversationKey: string, seenAtMs: number): Promise<void>;

  /** Remove a membership edge (on `memberLeft`) — the user loses access to this conversation. */
  removeMembership(userId: string, conversationKey: string): Promise<void>;

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
