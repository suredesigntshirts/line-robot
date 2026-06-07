import type { Readable } from "node:stream";
import { messagingApi } from "@line/bot-sdk";
import type {
  CardAction,
  OutboundMessage,
  PropertyCard,
  QuickReply,
} from "../../core/domain/message.js";
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

// LINE limits: ≤13 quick replies, label ≤20 chars; ≤12 bubbles per carousel.
const MAX_QUICK_REPLIES = 13;
const MAX_LABEL = 20;
const MAX_BUBBLES = 12;

function toQuickReply(items?: readonly QuickReply[]): messagingApi.QuickReply | undefined {
  if (items === undefined || items.length === 0) {
    return undefined;
  }
  return {
    items: items.slice(0, MAX_QUICK_REPLIES).map((q) => ({
      type: "action",
      action: {
        type: "postback",
        label: q.label.slice(0, MAX_LABEL),
        data: q.data,
        ...(q.displayText !== undefined ? { displayText: q.displayText } : {}),
      },
    })),
  };
}

/** Render a card action as the matching LINE action: a `datetimepicker` for `mode: "datetime"`
 * (used by "Set follow-up"), otherwise a plain `postback`. The picker delivers its result back as a
 * postback carrying the same `data` plus a `datetime` param. */
function toCardAction(action: CardAction): messagingApi.Action {
  const label = action.label.slice(0, MAX_LABEL);
  if (action.mode === "datetime") {
    return { type: "datetimepicker", label, data: action.data, mode: "datetime" };
  }
  return { type: "postback", label, data: action.data, displayText: action.label };
}

/** Build a Flex bubble from a semantic {@link PropertyCard}: title/subtitle, `label: value` rows,
 * and action buttons; an optional hero image is included only when a url is present. */
function toBubble(card: PropertyCard): messagingApi.FlexBubble {
  const body: messagingApi.FlexComponent[] = [
    { type: "text", text: card.title, weight: "bold", size: "lg", wrap: true },
  ];
  if (card.subtitle !== undefined) {
    body.push({ type: "text", text: card.subtitle, size: "sm", color: "#888888", wrap: true });
  }
  for (const row of card.rows) {
    body.push({
      type: "box",
      layout: "baseline",
      spacing: "sm",
      contents: [
        { type: "text", text: row.label, size: "sm", color: "#aaaaaa", flex: 2 },
        { type: "text", text: row.value, size: "sm", color: "#555555", flex: 5, wrap: true },
      ],
    });
  }
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: { type: "box", layout: "vertical", spacing: "md", contents: body },
  };
  if (card.heroImageUrl !== undefined) {
    bubble.hero = {
      type: "image",
      url: card.heroImageUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    };
  }
  if (card.actions.length > 0) {
    bubble.footer = {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: card.actions.map((a) => ({
        type: "button",
        style: "primary",
        height: "sm",
        action: toCardAction(a),
      })),
    };
  }
  return bubble;
}

function toFlexContainer(cards: readonly PropertyCard[]): messagingApi.FlexContainer {
  const bubbles = cards.slice(0, MAX_BUBBLES).map(toBubble);
  // A lone card renders as a single bubble; multiple cards as a swipeable carousel.
  return bubbles.length === 1 && bubbles[0] !== undefined
    ? bubbles[0]
    : { type: "carousel", contents: bubbles };
}

function toSdkMessage(message: OutboundMessage): messagingApi.Message {
  const quickReply = toQuickReply(message.quickReplies);
  const withQuickReply = <T extends messagingApi.Message>(m: T): T =>
    quickReply !== undefined ? { ...m, quickReply } : m;

  switch (message.type) {
    case "text":
      return withQuickReply({ type: "text", text: message.text });
    case "flex":
      return withQuickReply({
        type: "flex",
        altText: message.altText,
        contents: toFlexContainer(message.cards),
      });
  }
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
