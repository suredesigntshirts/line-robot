/**
 * LINE Messaging API hard limits we enforce when rendering outbound messages: a Flex carousel
 * accepts at most 12 bubbles, and a single message at most 13 quick-reply buttons. Enforced in two
 * layers — the view builder ({@link ../handlers/views}, which truncates and notes the overflow) and
 * the gateway ({@link ../../adapters/line/lineGateway}, the final hard cap before the SDK call) — so
 * they live here once and can't drift.
 */

/** Max bubbles in a LINE Flex carousel. */
export const LINE_MAX_CAROUSEL_BUBBLES = 12;

/** Max quick-reply buttons on a single LINE message. */
export const LINE_MAX_QUICK_REPLIES = 13;
