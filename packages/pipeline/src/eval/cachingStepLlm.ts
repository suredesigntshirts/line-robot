import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import type { LlmUsage, StepLlm, StepLlmRequest, StepLlmResponse } from "../ports.ts";

// ---------------------------------------------------------------------------
// Eval-only response cache (U-EVAL-perf, plan 23). Wraps a real StepLlm at the
// StepLlm seam so iteration on model-facing code stops being a ~20-min / ~$1.21
// tax per run. Same prompt (`system`) + same input (`content`) + same
// step/model/maxOutputTokens → same key → cache HIT (zero API call, zero
// rate-limit pressure). Change any of them → key changes → miss → real call.
//
// The cached value is re-validated against the CURRENT request schema on read, so
// a tightened schema (or a prompt edit that changes `system`) auto-misses → real
// call. This is opt-in (EVAL_CACHE=1) and MUST be bypassed for baseline regen /
// model-drift checks: a response cache freezes the model's answers at capture
// time (temp=0), so it can never stand in when we actually want to MEASURE the
// model.
//
// Correctness guards:
//  - Only successful (value !== null) responses are cached — a null (failed or
//    schema-invalid call) is never frozen, so a transient API failure re-calls.
//  - All cache I/O is best-effort: any fs/JSON error degrades to a real call and
//    never fails the eval.
//  - A false MISS is harmless (a real call). A false HIT would require a sha256
//    collision over the full request — so the cache can only ever be STALE
//    (mitigated by re-validate-on-read + EVAL_CACHE opt-in), never wrong.
//  - Assumes step outputs are JSON-round-trippable (the pipeline schemas are
//    plain string/number/null objects — no Dates/transforms).
// ---------------------------------------------------------------------------

export class CachingStepLlm implements StepLlm {
  private readonly inner: StepLlm;
  private readonly dir: string;
  hits = 0;
  misses = 0;

  constructor(inner: StepLlm, dir: string) {
    this.inner = inner;
    this.dir = dir;
    try {
      mkdirSync(dir, { recursive: true });
    } catch {
      /* best-effort: a cache-dir failure degrades the wrapper to pass-through */
    }
  }

  async run<S extends z.ZodType>(request: StepLlmRequest<S>): Promise<StepLlmResponse<z.infer<S>>> {
    const file = join(this.dir, `${request.step}-${keyOf(request)}.json`);
    const cached = this.read(file, request.schema);
    if (cached) {
      this.hits += 1;
      return cached;
    }
    const response = await this.inner.run(request);
    this.misses += 1;
    if (response.value !== null) this.write(file, response);
    return response;
  }

  private read<S extends z.ZodType>(file: string, schema: S): StepLlmResponse<z.infer<S>> | null {
    let raw: string;
    try {
      raw = readFileSync(file, "utf8");
    } catch {
      return null; // miss — no file is the common cold-cache case
    }
    try {
      const parsed = JSON.parse(raw) as { value: unknown; usage: unknown };
      const revalidated = schema.safeParse(parsed.value);
      if (!revalidated.success) return null; // schema/prompt drifted under the entry → miss
      const usage = parsed.usage;
      // Guard usage too: a truncated/edited entry must not feed NaN into estimateCostUsd.
      if (!isUsage(usage)) return null;
      return { value: revalidated.data, usage };
    } catch {
      return null; // corrupt entry → miss
    }
  }

  private write(file: string, response: StepLlmResponse<unknown>): void {
    try {
      writeFileSync(file, JSON.stringify({ value: response.value, usage: response.usage }));
    } catch {
      /* best-effort: a write failure just means the next run re-calls */
    }
  }
}

/** Three finite token counts — a malformed/truncated `usage` is rejected (treated as a miss). */
function isUsage(u: unknown): u is LlmUsage {
  if (typeof u !== "object" || u === null) return false;
  const { inputTokens, outputTokens, cacheReadTokens } = u as Record<string, unknown>;
  return [inputTokens, outputTokens, cacheReadTokens].every(
    (n) => typeof n === "number" && Number.isFinite(n),
  );
}

/**
 * Cache key = everything that affects the model's output EXCEPT the schema
 * (covered by re-validate-on-read) and temperature (globally 0, eval.config).
 * Field order is fixed so the serialization is stable.
 */
function keyOf(request: StepLlmRequest<z.ZodType>): string {
  const canonical = JSON.stringify({
    step: request.step,
    model: request.model,
    system: request.system,
    content: request.content,
    maxOutputTokens: request.maxOutputTokens,
  });
  return createHash("sha256").update(canonical).digest("hex");
}
