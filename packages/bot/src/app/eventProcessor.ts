import { parseRawEvent } from "../adapters/line/webhookParser.js";
import {
  type ConversationRef,
  conversationKey,
  pushTarget,
  senderUserId,
} from "../core/domain/conversation.js";
import type { InboundEvent } from "../core/domain/events.js";
import type {
  IncomingMessage,
  MessageContentType,
  OutboundMessage,
  StoredMessage,
} from "../core/domain/message.js";
import type { CatalogRepository } from "../core/ports/catalog.js";
import type { LineContentClient } from "../core/ports/lineContent.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { MessageHandler } from "../core/ports/messageHandler.js";
import type { MessageRepository, RawArchive } from "../core/ports/persistence.js";
import type { PostbackRouter } from "../core/ports/postbackRouter.js";
import type { Clock, Logger } from "../core/ports/runtime.js";

/** One queued unit of work: a raw LINE event plus its idempotency key. */
export interface EventPayload {
  readonly webhookEventId: string;
  readonly raw: unknown;
}

export interface EventProcessorDeps {
  readonly archive: RawArchive;
  readonly repository: MessageRepository;
  readonly catalog: CatalogRepository;
  readonly content: LineContentClient;
  readonly handler: MessageHandler;
  /** Routes card-button / quick-reply / rich-menu taps (postback events). */
  readonly postback: PostbackRouter;
  readonly gateway: LineGateway;
  readonly logger: Logger;
  readonly clock: Clock;
}

/** The shape `send`/`persistOutbound` need — satisfied by both an IncomingMessage and a postback. */
interface ReplyTarget {
  readonly ref: ConversationRef;
  readonly webhookEventId: string;
  readonly replyToken?: string;
}

const MEDIA_CONTENT_TYPES: ReadonlySet<MessageContentType> = new Set([
  "image",
  "video",
  "audio",
  "file",
]);

function eventRef(event: InboundEvent): ConversationRef | undefined {
  switch (event.kind) {
    case "message":
      return event.message.ref;
    case "join":
    case "leave":
    case "memberJoined":
    case "memberLeft":
    case "postback":
      return event.ref;
    default:
      return undefined;
  }
}

/** Best-effort MIME for a media message, used as the S3 Content-Type + extension. */
function mediaContentType(message: IncomingMessage): string {
  switch (message.contentType) {
    case "image":
      return "image/jpeg";
    case "video":
      return "video/mp4";
    case "audio":
      return "audio/mp4";
    case "file":
      return fileContentType(message.fileName);
    default:
      return "application/octet-stream";
  }
}

function fileContentType(fileName?: string): string {
  const ext = (fileName ?? "").toLowerCase().split(".").pop() ?? "";
  const byExt: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
  };
  return byExt[ext] ?? "application/octet-stream";
}

function toStoredIncoming(message: IncomingMessage): StoredMessage {
  return {
    ref: message.ref,
    messageId: message.messageId,
    direction: "in",
    contentType: message.contentType,
    text: message.text,
    location: message.location,
    fileName: message.fileName,
    webhookEventId: message.webhookEventId,
    timestamp: message.timestamp,
  };
}

/**
 * Processes a single webhook event end-to-end. For messages: eagerly capture any media to S3,
 * persist the message, update the catalog ingestion buffer (conversation tracker + sender
 * membership), then run the interactive handler (reply → push fallback). Member join/leave events
 * maintain the User↔Conv membership edges. Pure orchestration over ports — fully unit-testable.
 */
export class EventProcessor {
  constructor(private readonly deps: EventProcessorDeps) {}

  async process(payload: EventPayload): Promise<void> {
    const event = parseRawEvent(payload.raw);
    const ref = eventRef(event);

    if (ref === undefined) {
      this.deps.logger.info("event without conversation ref; not archived", {
        webhookEventId: payload.webhookEventId,
        kind: event.kind,
      });
      return;
    }
    await this.deps.archive.put(payload.webhookEventId, ref, payload.raw);

    switch (event.kind) {
      case "message":
        await this.handleMessage(event.message);
        return;
      case "memberJoined":
        await this.updateMembership(event.ref, event.memberIds, "joined", event.timestamp);
        return;
      case "memberLeft":
        await this.updateMembership(event.ref, event.memberIds, "left", event.timestamp);
        return;
      case "postback":
        await this.handlePostback(event);
        return;
      default:
        this.deps.logger.info("event archived; no further action", {
          webhookEventId: payload.webhookEventId,
          kind: event.kind,
        });
        return;
    }
  }

  private async handleMessage(message: IncomingMessage): Promise<void> {
    const convKey = conversationKey(message.ref);

    // Eager media capture → S3 (LINE Get Content is short-lived; the sweep reads from S3 later).
    const stored = await this.captureMedia(message);
    await this.deps.repository.save(stored);

    // Ingestion-buffer bookkeeping: mark the conversation pending + keep membership fresh.
    await this.deps.catalog.touchConversation(convKey, message.timestamp);
    const uid = senderUserId(message.ref);
    if (uid !== undefined) {
      await this.deps.catalog.recordMembership(uid, convKey, message.timestamp);
    }

    // Interactive reply path: the CommandHandler answers typed commands; ordinary property chat
    // produces no reply (it's caught by the debounced ingestion sweep instead).
    const replies = await this.deps.handler.handle(message);
    if (replies.length === 0) {
      return;
    }
    await this.send(message, replies);
    await this.persistOutbound(message, replies);
  }

  /**
   * A card-button / quick-reply / rich-menu tap. Unlike chat messages it isn't ingested (it's a UI
   * action, not property content); we only refresh the sender's membership, route the action, and
   * reply (postbacks carry a live reply token, with push as the fallback).
   */
  private async handlePostback(event: Extract<InboundEvent, { kind: "postback" }>): Promise<void> {
    const uid = senderUserId(event.ref);
    if (uid !== undefined) {
      await this.deps.catalog.recordMembership(uid, conversationKey(event.ref), event.timestamp);
    }
    const replies = await this.deps.postback.route({
      ref: event.ref,
      data: event.data,
      params: event.params,
    });
    if (replies.length === 0) {
      return;
    }
    await this.send(event, replies);
    await this.persistOutbound(event, replies);
  }

  private async captureMedia(message: IncomingMessage): Promise<StoredMessage> {
    const stored = toStoredIncoming(message);
    if (!MEDIA_CONTENT_TYPES.has(message.contentType)) {
      return stored;
    }
    try {
      const bytes = await this.deps.content.getContent(message.messageId);
      const contentType = mediaContentType(message);
      const s3Key = await this.deps.archive.putMedia(
        message.ref,
        message.messageId,
        bytes,
        contentType,
      );
      return { ...stored, attachment: { s3Key, contentType } };
    } catch (error) {
      this.deps.logger.warn("media capture failed; message stored without attachment", {
        webhookEventId: message.webhookEventId,
        error: String(error),
      });
      return stored;
    }
  }

  private async updateMembership(
    ref: ConversationRef,
    memberIds: readonly string[],
    change: "joined" | "left",
    timestamp: number,
  ): Promise<void> {
    const convKey = conversationKey(ref);
    await Promise.all(
      memberIds.map((userId) =>
        change === "joined"
          ? this.deps.catalog.recordMembership(userId, convKey, timestamp)
          : this.deps.catalog.removeMembership(userId, convKey),
      ),
    );
    this.deps.logger.info("membership updated", { convKey, change, count: memberIds.length });
  }

  private async send(target: ReplyTarget, replies: OutboundMessage[]): Promise<void> {
    if (target.replyToken !== undefined && target.replyToken !== "") {
      try {
        await this.deps.gateway.reply(target.replyToken, replies);
        return;
      } catch (error) {
        this.deps.logger.warn("reply failed; falling back to push", {
          webhookEventId: target.webhookEventId,
          error: String(error),
        });
      }
    }
    await this.deps.gateway.push(pushTarget(target.ref), replies);
  }

  private async persistOutbound(target: ReplyTarget, replies: OutboundMessage[]): Promise<void> {
    const now = this.deps.clock.now();
    await Promise.all(
      replies.map((reply, index) =>
        this.deps.repository.save({
          ref: target.ref,
          messageId: `${target.webhookEventId}#out#${index}`,
          direction: "out",
          contentType: "text",
          // Flex carousels have no plain text; log their altText so the audit row is meaningful.
          text: outboundText(reply),
          webhookEventId: target.webhookEventId,
          timestamp: now,
        }),
      ),
    );
  }
}

/** A plain-text representation of an outbound message for the message-log row. */
function outboundText(message: OutboundMessage): string {
  // text → its text; flex / imageCarousel → their altText (the meaningful audit summary).
  return message.type === "text" ? message.text : message.altText;
}
