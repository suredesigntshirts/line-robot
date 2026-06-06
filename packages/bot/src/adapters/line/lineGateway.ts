import type { Readable } from "node:stream";
import { messagingApi } from "@line/bot-sdk";
import type { OutboundMessage } from "../../core/domain/message.js";
import type { LineContentClient } from "../../core/ports/lineContent.js";
import type { LineGateway } from "../../core/ports/lineGateway.js";

/**
 * The slice of the SDK's MessagingApiClient we depend on. Narrowing it to an interface keeps
 * the gateway trivially mockable in tests (no need to construct the real client).
 */
export interface LineApiClient {
  replyMessage(request: messagingApi.ReplyMessageRequest): Promise<unknown>;
  pushMessage(request: messagingApi.PushMessageRequest): Promise<unknown>;
}

function toSdkMessage(message: OutboundMessage): messagingApi.Message {
  return { type: "text", text: message.text };
}

export class LineMessagingGateway implements LineGateway {
  constructor(private readonly client: LineApiClient) {}

  async reply(replyToken: string, messages: OutboundMessage[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }
    await this.client.replyMessage({ replyToken, messages: messages.map(toSdkMessage) });
  }

  async push(to: string, messages: OutboundMessage[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }
    await this.client.pushMessage({ to, messages: messages.map(toSdkMessage) });
  }
}

/** Build a gateway backed by the real LINE Messaging API client. */
export function createLineMessagingGateway(channelAccessToken: string): LineMessagingGateway {
  return new LineMessagingGateway(new messagingApi.MessagingApiClient({ channelAccessToken }));
}

/** The slice of the SDK's blob client we depend on — narrowed for trivial mocking. */
export interface LineBlobClient {
  getMessageContent(messageId: string): Promise<Readable>;
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export class LineMessagingContentClient implements LineContentClient {
  constructor(private readonly blob: LineBlobClient) {}

  async getContent(messageId: string): Promise<Buffer> {
    return streamToBuffer(await this.blob.getMessageContent(messageId));
  }
}

/** Build a content client backed by the real LINE blob (Get Content) API. */
export function createLineContentClient(channelAccessToken: string): LineMessagingContentClient {
  return new LineMessagingContentClient(
    new messagingApi.MessagingApiBlobClient({ channelAccessToken }),
  );
}
