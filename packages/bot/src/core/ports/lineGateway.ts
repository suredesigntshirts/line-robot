import type { OutboundMessage } from "../domain/message.js";

/** Outbound side of the LINE Messaging API: reply (token-based) and push (id-based). */
export interface LineGateway {
  reply(replyToken: string, messages: OutboundMessage[]): Promise<void>;
  push(to: string, messages: OutboundMessage[]): Promise<void>;
}
