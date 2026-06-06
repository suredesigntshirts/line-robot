import type { OutboundMessage } from "../../src/core/domain/message.js";

/** Narrow an outbound message to its text, failing loudly if it isn't a text message. Keeps the
 * many "the push said X" assertions readable now that {@link OutboundMessage} is a union. */
export function textOf(message: OutboundMessage | undefined): string {
  if (message?.type !== "text") {
    throw new Error(`expected a text message, got ${message?.type ?? "undefined"}`);
  }
  return message.text;
}
