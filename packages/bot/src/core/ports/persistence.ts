import type { ConversationRef } from "../domain/conversation.js";
import type { StoredMessage } from "../domain/message.js";

/** Durable, queryable message store (DynamoDB in Stage 03). */
export interface MessageRepository {
  save(message: StoredMessage): Promise<void>;
  /** Most-recent-first; the future LLM context window. */
  findRecent(ref: ConversationRef, limit: number): Promise<StoredMessage[]>;
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
