import type { OutboundMessage } from "../domain/message.js";

/** Outbound side of the LINE Messaging API: reply (token-based) and push (id-based). */
export interface LineGateway {
  reply(replyToken: string, messages: OutboundMessage[]): Promise<void>;
  push(to: string, messages: OutboundMessage[]): Promise<void>;
  /** Whether a delivery failure is permanent (re-sending can never succeed → drop, don't retry).
   * Keeps the LINE HTTPFetchError check inside the adapter; the app stays SDK-free. */
  isPermanentError(error: unknown): boolean;
}
