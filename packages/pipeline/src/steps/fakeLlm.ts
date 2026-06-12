import type { z } from "zod";
import type { LlmUsage, StepLlm, StepLlmRequest } from "../ports.ts";

const USAGE: LlmUsage = { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 4096 };

/**
 * Test fake at the StepLlm port: scripted per-step responses, validated
 * against the request's own schema so fixtures can't drift from contracts.
 */
export class FakeStepLlm implements StepLlm {
  readonly requests: Array<StepLlmRequest<z.ZodType>> = [];
  private readonly queues = new Map<string, unknown[]>();

  /** Queue a response for the next call(s) of `step`. `null` simulates a failed call. */
  enqueue(step: string, value: unknown): this {
    const queue = this.queues.get(step) ?? [];
    queue.push(value);
    this.queues.set(step, queue);
    return this;
  }

  run<S extends z.ZodType>(request: StepLlmRequest<S>) {
    this.requests.push(request as StepLlmRequest<z.ZodType>);
    const queue = this.queues.get(request.step) ?? [];
    const next = queue.shift();
    if (next === undefined) {
      throw new Error(`FakeStepLlm: no response queued for step "${request.step}"`);
    }
    if (next === null) return Promise.resolve({ value: null, usage: USAGE });
    const parsed = request.schema.safeParse(next);
    if (!parsed.success) {
      throw new Error(
        `FakeStepLlm: fixture for "${request.step}" fails its schema: ${parsed.error}`,
      );
    }
    return Promise.resolve({ value: parsed.data as z.infer<S>, usage: USAGE });
  }
}
