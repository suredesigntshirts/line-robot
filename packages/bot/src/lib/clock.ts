import type { Clock } from "../core/ports/runtime.js";

/**
 * The production wall-clock {@link Clock}. Shared by every Lambda entry point so the
 * `{ now: () => Date.now() }` literal lives in exactly one place. Tests inject their own
 * deterministic clock instead of importing this.
 */
export const SYSTEM_CLOCK: Clock = { now: () => Date.now() };
