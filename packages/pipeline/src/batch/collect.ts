import type Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import type { CostLog } from "../cost.ts";
import type { LlmUsage, StepLlmResponse } from "../ports.ts";
import type { BatchEntry } from "./build.ts";

// ---------------------------------------------------------------------------
// D2.3 batch transport, phase 2: poll until ended, parse each result back
// through its entry's own zod schema (same validation the sync path gets),
// record batch-priced cost entries. Failures map to value:null so the step
// fallbacks (default-new, single-segment, …) apply identically.
// ---------------------------------------------------------------------------

const ZERO_USAGE: LlmUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 };

export interface CollectedBatch {
  /** Per-customId step responses (value null on errored/expired entries). */
  responses: Map<string, StepLlmResponse<unknown>>;
}

function parseResult(
  entry: BatchEntry,
  result: Anthropic.Messages.Batches.MessageBatchIndividualResponse["result"],
): StepLlmResponse<unknown> {
  if (result.type !== "succeeded") return { value: null, usage: ZERO_USAGE };
  const usage: LlmUsage = {
    inputTokens: result.message.usage.input_tokens,
    outputTokens: result.message.usage.output_tokens,
    cacheReadTokens: result.message.usage.cache_read_input_tokens ?? 0,
  };
  const text = result.message.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  )?.text;
  if (text === undefined) return { value: null, usage };
  try {
    const parsed = (entry.request.schema as z.ZodType).safeParse(JSON.parse(text));
    return { value: parsed.success ? parsed.data : null, usage };
  } catch {
    return { value: null, usage };
  }
}

/** Poll the batch to completion, then parse + cost-log every entry. */
export async function collectBatch(
  client: Anthropic,
  batchId: string,
  entries: BatchEntry[],
  costLog: CostLog,
  pollIntervalMs = 60_000,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<CollectedBatch> {
  for (;;) {
    const batch = await client.messages.batches.retrieve(batchId);
    if (batch.processing_status === "ended") break;
    await sleep(pollIntervalMs);
  }

  const byId = new Map(entries.map((e) => [e.customId, e]));
  const responses = new Map<string, StepLlmResponse<unknown>>();
  for await (const result of await client.messages.batches.results(batchId)) {
    const entry = byId.get(result.custom_id);
    if (!entry) continue;
    const parsed = parseResult(entry, result.result);
    responses.set(result.custom_id, parsed);
    costLog.record(entry.request.step, entry.request.model, parsed.usage, "batch");
  }
  // Entries the API never returned (expired/cancelled) fall back like failures.
  for (const entry of entries) {
    if (!responses.has(entry.customId)) {
      responses.set(entry.customId, { value: null, usage: ZERO_USAGE });
      costLog.record(entry.request.step, entry.request.model, ZERO_USAGE, "batch");
    }
  }
  return { responses };
}
