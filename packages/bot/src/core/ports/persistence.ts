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
}
