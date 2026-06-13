import type {
  ConversationTracker,
  Property,
  PropertyEvent,
  PropertyUpsert,
} from "../domain/catalog.js";

/**
 * Persistence seams for the catalog, split into the two aggregates the single-table DynamoDB design
 * actually has. Keyed by raw string ids (conversationKey / userId / propertyId) rather than
 * {@link ConversationRef} because the ingestion/reminder sweeps work purely from keys discovered via
 * GSIs; callers that hold a ref convert with `conversationKey()`.
 *
 * One DynamoDB adapter ({@link ../../adapters/dynamodb/catalogRepository.DynamoCatalogRepository})
 * implements both; app-layer consumers depend on the store(s) they actually call.
 */

/**
 * Everything keyed by a conversation or its user, sharing the `CONV#…` / `USER#…` partitions: the
 * debounced-ingestion tracker, the edit context stored on that same tracker item, the
 * user↔conversation membership edges (read-access), and the per-conversation memory note. One
 * aggregate because these items co-locate and mutate together (e.g. the edit context lives on the
 * tracker META item).
 */
export interface ConversationStore {
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
   * it is not already claimed (or the claim is older than `staleTimeoutMs`). Also atomically
   * increments `ingestAttempts` (committed before any work) so timeouts/crashes are counted; the
   * returned tracker's `ingestAttempts` lets the caller give up after too many tries. Returns the
   * claimed tracker (so the caller knows the batch range `lastIngestedAt..lastInboundAt`), or `null`
   * if another worker holds a live claim.
   */
  claimConversation(
    conversationKey: string,
    nowMs: number,
    staleTimeoutMs: number,
  ): Promise<ConversationTracker | null>;

  /**
   * Abandon a conversation after repeated failed ingestion attempts: set `status=FAILED` and drop
   * it off the pending index (so the sweep stops reclaiming + reprocessing it — the loop that would
   * otherwise burn inference/Lambda spend indefinitely). A later inbound message re-arms it for a
   * fresh attempt (see {@link touchConversation}).
   */
  failConversation(conversationKey: string): Promise<void>;

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

  // --- Per-conversation memory (durable learned context) ---

  /** The conversation's memory note (people, area aliases, terminology, preferences), or null. */
  getMemoryDoc(conversationKey: string): Promise<string | null>;

  /** Replace the conversation's memory note. Callers bound the length before storing. */
  putMemoryDoc(conversationKey: string, content: string): Promise<void>;
}

/**
 * The property-catalog graph, all `PROP#…` / `CONV#…` keyed: property records, the
 * conversation↔property edges that scope them, and the follow-up events attached to a property. One
 * aggregate because the listing/merge/reminder flows read and write across these items together. The
 * user-facing "my listings" fan-out is NOT here — it spans membership too, so it lives on
 * {@link CatalogRepository}.
 */
export interface PropertyStore {
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

  // --- Property events (calendar / reminders) ---

  /** Create a follow-up event on a property. Its sparse GSI2 key makes it visible to the reminder
   * sweep until it is notified. */
  addEvent(event: PropertyEvent): Promise<void>;

  /** Every event on a property (past + future), for the "upcoming" view. */
  listPropertyEvents(propertyId: string): Promise<PropertyEvent[]>;

  /** Delete every follow-up event on a property (used when fully deleting a listing, so no orphan
   * reminders fire afterwards). No-op when the property has none. */
  deletePropertyEvents(propertyId: string): Promise<void>;

  /** Un-notified events whose due time is at or before `nowIso` — the reminder sweep's work list,
   * sourced from the sparse GSI2 (no scan). */
  findDueEvents(nowIso: string, limit: number): Promise<PropertyEvent[]>;

  /**
   * Atomically claim an event for notification: stamp `notifiedAt` and clear its GSI2 keys, but only
   * if it has not been notified already. Returns `true` if this worker won the claim (and must push
   * the reminder), `false` if another sweep already handled it — so a reminder is sent at most once.
   */
  markEventNotified(event: PropertyEvent, nowMs: number): Promise<boolean>;
}

/**
 * Both stores together, plus the one read that genuinely spans them. Implemented by the single
 * DynamoDB adapter, the in-memory test double, and the post-cutover composite (DynamoDB
 * conversations + Postgres properties); used by the broadest injection site
 * ({@link ../handlers/registry.HandlerDeps}). A consumer that touches only one aggregate depends on
 * just that store.
 */
export interface CatalogRepository extends ConversationStore, PropertyStore {
  /** "Show my listings": resolve user → their conversations (membership, ConversationStore) → those
   * conversations' properties (PropertyStore), deduped. Lives here, not on either store, because it
   * stitches both aggregates — which is also why the cutover composite must implement it directly. */
  listPropertiesForUser(userId: string): Promise<Property[]>;
}
