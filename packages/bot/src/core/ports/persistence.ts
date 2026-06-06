import type { ConversationRef } from "../domain/conversation.js";
import type { StoredMessage } from "../domain/message.js";

/** Durable, queryable message store (DynamoDB in Stage 03). */
export interface MessageRepository {
  save(message: StoredMessage): Promise<void>;
  /** Most-recent-first; the future LLM context window. */
  findRecent(ref: ConversationRef, limit: number): Promise<StoredMessage[]>;
  /**
   * Messages newer than the ingest watermark (`timestamp > sinceMs`), oldest-first — the batch the
   * ingestion sweep extracts. Takes a raw `conversationKey` (not a {@link ConversationRef}) because
   * the sweep discovers conversations by key from the GSI, not from a parsed event. Fully paginated
   * so the batch is complete and the caller can advance the watermark to its newest message without
   * dropping a tail.
   */
  findSince(conversationKey: string, sinceMs: number): Promise<StoredMessage[]>;
}

/** Immutable raw-event archive (S3 in Stage 03). */
export interface RawArchive {
  put(webhookEventId: string, ref: ConversationRef, raw: unknown): Promise<void>;
  /**
   * Store an eagerly-captured media binary and return its S3 key. Keyed by `(conversationKey,
   * messageId)` so the ingestion sweep can read it back without an S3 listing.
   */
  putMedia(
    ref: ConversationRef,
    messageId: string,
    bytes: Buffer,
    contentType: string,
  ): Promise<string>;
}
