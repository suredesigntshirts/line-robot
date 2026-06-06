import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, type EntityItem } from "electrodb";
import type { ConversationRef } from "../../core/domain/conversation.js";
import { conversationKey } from "../../core/domain/conversation.js";
import type { MessageContentType, StoredMessage } from "../../core/domain/message.js";
import type { MessageRepository } from "../../core/ports/persistence.js";

/**
 * Single-table ElectroDB entity for messages. Partitioned by conversation, sorted by
 * (timestamp, messageId) so `findRecent` is a descending query — the future LLM context window.
 */
function buildMessageEntity(client: DynamoDBDocumentClient, table: string) {
  return new Entity(
    {
      model: { entity: "message", version: "1", service: "linerobot" },
      attributes: {
        conversationKey: { type: "string", required: true },
        messageId: { type: "string", required: true },
        direction: { type: ["in", "out"] as const, required: true },
        contentType: { type: "string", required: true },
        text: { type: "string" },
        fileName: { type: "string" },
        location: {
          type: "map",
          properties: {
            latitude: { type: "number", required: true },
            longitude: { type: "number", required: true },
            title: { type: "string" },
            address: { type: "string" },
          },
        },
        attachment: {
          type: "map",
          properties: {
            s3Key: { type: "string", required: true },
            contentType: { type: "string", required: true },
          },
        },
        webhookEventId: { type: "string" },
        timestamp: { type: "number", required: true },
        kind: { type: ["user", "group", "room"] as const, required: true },
        userId: { type: "string" },
        groupId: { type: "string" },
        roomId: { type: "string" },
        senderUserId: { type: "string" },
      },
      indexes: {
        byConversation: {
          pk: { field: "pk", composite: ["conversationKey"] },
          sk: { field: "sk", composite: ["timestamp", "messageId"] },
        },
      },
    },
    { client, table },
  );
}

type MessageEntity = ReturnType<typeof buildMessageEntity>;
type MessageItem = EntityItem<MessageEntity>;

function refFromItem(item: MessageItem): ConversationRef {
  switch (item.kind) {
    case "group":
      return { kind: "group", groupId: item.groupId ?? "", senderUserId: item.senderUserId };
    case "room":
      return { kind: "room", roomId: item.roomId ?? "", senderUserId: item.senderUserId };
    default:
      return { kind: "user", userId: item.userId ?? "" };
  }
}

function toStoredMessage(item: MessageItem): StoredMessage {
  return {
    ref: refFromItem(item),
    messageId: item.messageId,
    direction: item.direction,
    contentType: item.contentType as MessageContentType,
    text: item.text,
    fileName: item.fileName,
    location: item.location,
    attachment: item.attachment,
    webhookEventId: item.webhookEventId,
    timestamp: item.timestamp,
  };
}

export class DynamoMessageRepository implements MessageRepository {
  private readonly entity: MessageEntity;

  constructor(client: DynamoDBDocumentClient, table: string) {
    this.entity = buildMessageEntity(client, table);
  }

  async save(message: StoredMessage): Promise<void> {
    const ref = message.ref;
    await this.entity
      .put({
        conversationKey: conversationKey(ref),
        messageId: message.messageId,
        direction: message.direction,
        contentType: message.contentType,
        text: message.text,
        fileName: message.fileName,
        location: message.location,
        attachment: message.attachment,
        webhookEventId: message.webhookEventId,
        timestamp: message.timestamp,
        kind: ref.kind,
        userId: ref.kind === "user" ? ref.userId : undefined,
        groupId: ref.kind === "group" ? ref.groupId : undefined,
        roomId: ref.kind === "room" ? ref.roomId : undefined,
        senderUserId: ref.kind === "user" ? undefined : ref.senderUserId,
      })
      .go();
  }

  async findRecent(ref: ConversationRef, limit: number): Promise<StoredMessage[]> {
    const result = await this.entity.query
      .byConversation({ conversationKey: conversationKey(ref) })
      .go({ order: "desc", limit });
    return result.data.map(toStoredMessage);
  }
}

export function createMessageRepository(
  client: DynamoDBDocumentClient,
  table: string,
): DynamoMessageRepository {
  return new DynamoMessageRepository(client, table);
}
