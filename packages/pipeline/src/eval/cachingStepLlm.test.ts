import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import type { StepLlm, StepLlmRequest, StepLlmResponse } from "../ports.ts";
import { CachingStepLlm } from "./cachingStepLlm.ts";

const SCHEMA = z.object({ n: z.number() });

/** Counting fake: records how many times the wrapped adapter is actually hit. */
class CountingLlm implements StepLlm {
  calls = 0;
  private readonly value: { n: number } | null;
  constructor(value: { n: number } | null) {
    this.value = value;
  }
  run<S extends z.ZodType>(_request: StepLlmRequest<S>): Promise<StepLlmResponse<z.infer<S>>> {
    this.calls += 1;
    return Promise.resolve({
      value: this.value as z.infer<S> | null,
      usage: { inputTokens: 10, outputTokens: 2, cacheReadTokens: 0 },
    });
  }
}

const request = (overrides: Partial<StepLlmRequest<typeof SCHEMA>> = {}) =>
  ({
    step: "extract",
    model: "claude-sonnet-4-6",
    system: "system prompt",
    content: [{ type: "text", text: "a transcript" }],
    schema: SCHEMA,
    maxOutputTokens: 100,
    ...overrides,
  }) satisfies StepLlmRequest<typeof SCHEMA>;

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "eval-cache-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("CachingStepLlm", () => {
  it("cold call hits the inner adapter once and persists the response", async () => {
    const inner = new CountingLlm({ n: 7 });
    const cache = new CachingStepLlm(inner, dir);
    const res = await cache.run(request());
    expect(inner.calls).toBe(1);
    expect(res.value).toEqual({ n: 7 });
    expect(res.usage.inputTokens).toBe(10);
    expect(cache.misses).toBe(1);
    expect(cache.hits).toBe(0);
  });

  it("warm run makes ZERO inner calls and returns the cached value + usage", async () => {
    // Write the cache with one adapter, then read it back with a fresh wrapper
    // pointing at the same dir (simulates a second `npm run eval`).
    const warm = new CachingStepLlm(new CountingLlm({ n: 7 }), dir);
    await warm.run(request());

    const inner = new CountingLlm({ n: 999 }); // would return a DIFFERENT value if called
    const cache = new CachingStepLlm(inner, dir);
    const res = await cache.run(request());
    expect(inner.calls).toBe(0); // the decisive property: no API call on a warm run
    expect(res.value).toEqual({ n: 7 }); // the cached value, not the fresh 999
    expect(res.usage).toEqual({ inputTokens: 10, outputTokens: 2, cacheReadTokens: 0 });
    expect(cache.hits).toBe(1);
    expect(cache.misses).toBe(0);
  });

  it("misses (re-calls) when the input content changes", async () => {
    await new CachingStepLlm(new CountingLlm({ n: 7 }), dir).run(request());
    const inner = new CountingLlm({ n: 8 });
    const cache = new CachingStepLlm(inner, dir);
    const res = await cache.run(
      request({ content: [{ type: "text", text: "a DIFFERENT transcript" }] }),
    );
    expect(inner.calls).toBe(1);
    expect(res.value).toEqual({ n: 8 });
  });

  it("misses (re-calls) when the cached value no longer validates the current schema", async () => {
    // Seed with the lenient schema, then read with a tightened one.
    await new CachingStepLlm(new CountingLlm({ n: 7 }), dir).run(request());
    const tightened = z.object({ n: z.number().min(100) }); // 7 no longer passes
    const inner = new CountingLlm({ n: 150 });
    const cache = new CachingStepLlm(inner, dir);
    const res = await cache.run({ ...request(), schema: tightened });
    expect(inner.calls).toBe(1); // stale entry rejected → real call
    expect(res.value).toEqual({ n: 150 });
  });

  it("misses (re-calls) when the cached entry has a malformed usage block", async () => {
    // A truncated/edited entry whose `value` still validates but `usage` is garbage
    // must NOT feed NaN into the cost aggregate — treat it as a miss.
    await new CachingStepLlm(new CountingLlm({ n: 7 }), dir).run(request());
    const [file] = readdirSync(dir);
    writeFileSync(
      join(dir, file as string),
      JSON.stringify({ value: { n: 7 }, usage: { inputTokens: "oops" } }),
    );
    const inner = new CountingLlm({ n: 7 });
    const cache = new CachingStepLlm(inner, dir);
    const res = await cache.run(request());
    expect(inner.calls).toBe(1); // garbage usage rejected → real call
    expect(res.usage.inputTokens).toBe(10);
  });

  it("never caches a null (failed/invalid) response — the next run re-calls", async () => {
    const failing = new CountingLlm(null);
    await new CachingStepLlm(failing, dir).run(request());
    const inner = new CountingLlm({ n: 7 });
    const cache = new CachingStepLlm(inner, dir);
    const res = await cache.run(request());
    expect(inner.calls).toBe(1); // a transient failure was NOT frozen
    expect(res.value).toEqual({ n: 7 });
  });
});
