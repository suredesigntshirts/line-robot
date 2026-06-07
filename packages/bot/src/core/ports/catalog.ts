import type {
  ConversationTracker,
  Property,
  PropertyEvent,
  PropertyUpsert,
} from "../domain/catalog.js";

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

  // --- Edit context (last-viewed property → free-text "reply to update") ---

  /**
   * Arm a short-lived "edit context": the next plain-text reply in this conversation targets
   * `propertyId` (see {@link ../handlers/editReplyHandler}). Stored on the tracker META item; it
   * MUST NOT touch the ingestion (GSI1/pending) keys — viewing a listing isn't ingestion work.
   */
  armEdit(conversationKey: string, propertyId: string, armedAtMs: number): Promise<void>;

  /** The conversation's armed edit context (most-recently-viewed property + when), or null. */
  getEditContext(conversationKey: string): Promise<{ propertyId: string; armedAt: number } | null>;

  /** Clear the armed edit context (after applying an edit, or when the reply didn't match it). */
  clearEdit(conversationKey: string): Promise<void>;

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

  /** Delete a property's META row. Used when merging a just-created (still single-conversation)
   * property into an existing one — the new row is removed after its fields move over. */
  deleteProperty(propertyId: string): Promise<void>;

  /** Upsert a Conv→Property edge `CONV#<conversationKey> → PROP#<propertyId>`. */
  linkConversationProperty(
    conversationKey: string,
    propertyId: string,
    nowMs: number,
  ): Promise<void>;

  /** Remove a Conv→Property edge (e.g. after re-pointing a merged property). */
  unlinkConversationProperty(conversationKey: string, propertyId: string): Promise<void>;

  /** Property ids discussed in (scoped to) this conversation — dedup candidates + this chat's
   * listings. */
  listConversationProperties(conversationKey: string): Promise<string[]>;

  /** "Show my listings": resolve user → their conversations → those conversations' properties
   * (deduped). Read-access follows the user across chats. */
  listPropertiesForUser(userId: string): Promise<Property[]>;

  // --- Property events (calendar / reminders) ---

  /** Create a follow-up event on a property. Its sparse GSI2 key makes it visible to the reminder
   * sweep until it is notified. */
  addEvent(event: PropertyEvent): Promise<void>;

  /** Every event on a property (past + future), for the "upcoming" view. */
  listPropertyEvents(propertyId: string): Promise<PropertyEvent[]>;

  /** Un-notified events whose due time is at or before `nowIso` — the reminder sweep's work list,
   * sourced from the sparse GSI2 (no scan). */
  findDueEvents(nowIso: string, limit: number): Promise<PropertyEvent[]>;

  /**
   * Atomically claim an event for notification: stamp `notifiedAt` and clear its GSI2 keys, but only
   * if it has not been notified already. Returns `true` if this worker won the claim (and must push
   * the reminder), `false` if another sweep already handled it — so a reminder is sent at most once.
   */
  markEventNotified(event: PropertyEvent, nowMs: number): Promise<boolean>;

  // --- Per-conversation memory (durable learned context) ---

  /** The conversation's memory note (people, area aliases, terminology, preferences), or null. */
  getMemoryDoc(conversationKey: string): Promise<string | null>;

  /** Replace the conversation's memory note. Callers bound the length before storing. */
  putMemoryDoc(conversationKey: string, content: string): Promise<void>;
}
