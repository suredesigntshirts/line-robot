import type { InboundEvent } from "../domain/events.js";

/** Parses a single raw LINE webhook event (one SQS payload) into a provider-agnostic
 * {@link InboundEvent}. Throws on a structurally malformed payload — the processor catches,
 * logs, and drops (a malformed event re-throws identically on every redelivery). */
export interface WebhookParser {
  parse(raw: unknown): InboundEvent;
}
