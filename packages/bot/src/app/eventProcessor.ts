import { parseRawEvent } from "../adapters/line/webhookParser.js";
import { type ConversationRef, pushTarget } from "../core/domain/conversation.js";
import type { InboundEvent } from "../core/domain/events.js";
import type { IncomingMessage, OutboundMessage, StoredMessage } from "../core/domain/message.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { MessageHandler } from "../core/ports/messageHandler.js";
import type { MessageRepository, RawArchive } from "../core/ports/persistence.js";
import type { Clock, Logger } from "../core/ports/runtime.js";

/** One queued unit of work: a raw LINE event plus its idempotency key. */
export interface EventPayload {
  readonly webhookEventId: string;
  readonly raw: unknown;
}

export interface EventProcessorDeps {
  readonly archive: RawArchive;
  readonly repository: MessageRepository;
  readonly handler: MessageHandler;
  readonly gateway: LineGateway;
  readonly logger: Logger;
  readonly clock: Clock;
}

function eventRef(event: InboundEvent): ConversationRef | undefined {
  switch (event.kind) {
    case "message":
      return event.message.ref;
    case "join":
    case "leave":
    case "memberJoined":
    case "memberLeft":
      return event.ref;
    default:
      return undefined;
  }
}

function toStoredIncoming(message: IncomingMessage): StoredMessage {
  return {
    ref: message.ref,
    messageId: message.messageId,
    direction: "in",
    contentType: message.contentType,
    text: message.text,
    webhookEventId: message.webhookEventId,
    timestamp: message.timestamp,
  };
}

/**
 * Processes a single webhook event end-to-end: archive raw → persist → run the handler →
 * reply (falling back to push) → persist the outbound reply. Pure orchestration over ports,
 * so it is fully unit-testable with fakes.
 */
export class EventProcessor {
  constructor(private readonly deps: EventProcessorDeps) {}

  async process(payload: EventPayload): Promise<void> {
    const event = parseRawEvent(payload.raw);
    const ref = eventRef(event);

    if (ref !== undefined) {
      await this.deps.archive.put(payload.webhookEventId, ref, payload.raw);
    } else {
      this.deps.logger.info("event without conversation ref; not archived", {
        webhookEventId: payload.webhookEventId,
        kind: event.kind,
      });
    }

    if (event.kind !== "message") {
      this.deps.logger.info("non-message event ignored by echo bot", {
        webhookEventId: payload.webhookEventId,
        kind: event.kind,
      });
      return;
    }

    const message = event.message;
    await this.deps.repository.save(toStoredIncoming(message));

    const replies = await this.deps.handler.handle(message);
    if (replies.length === 0) {
      return;
    }

    await this.send(message, replies);
    await this.persistOutbound(message, replies);
  }

  private async send(message: IncomingMessage, replies: OutboundMessage[]): Promise<void> {
    if (message.replyToken !== undefined && message.replyToken !== "") {
      try {
        await this.deps.gateway.reply(message.replyToken, replies);
        return;
      } catch (error) {
        this.deps.logger.warn("reply failed; falling back to push", {
          webhookEventId: message.webhookEventId,
          error: String(error),
        });
      }
    }
    await this.deps.gateway.push(pushTarget(message.ref), replies);
  }

  private async persistOutbound(
    message: IncomingMessage,
    replies: OutboundMessage[],
  ): Promise<void> {
    const now = this.deps.clock.now();
    await Promise.all(
      replies.map((reply, index) =>
        this.deps.repository.save({
          ref: message.ref,
          messageId: `${message.webhookEventId}#out#${index}`,
          direction: "out",
          contentType: "text",
          text: reply.text,
          webhookEventId: message.webhookEventId,
          timestamp: now,
        }),
      ),
    );
  }
}
