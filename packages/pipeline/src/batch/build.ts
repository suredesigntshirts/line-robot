import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { toApiContent } from "../adapters/content.ts";
import type { StepLlmRequest } from "../ports.ts";

// ---------------------------------------------------------------------------
// D2.3 batch transport, phase 1: the SAME StepLlmRequest the sync adapter
// executes is serialized into a Message Batches entry — one code path, two
// transports. The passive sweep submits; interactive paths stay sync.
// ---------------------------------------------------------------------------

export interface BatchEntry {
  customId: string;
  request: StepLlmRequest<z.ZodType>;
}

/** Build the params exactly as AnthropicStepLlm would send them sync. */
export function toBatchRequest(
  entry: BatchEntry,
): Anthropic.Messages.Batches.BatchCreateParams.Request {
  const { request } = entry;
  return {
    custom_id: entry.customId,
    params: {
      model: request.model,
      max_tokens: request.maxOutputTokens,
      system: [{ type: "text", text: request.system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: toApiContent(request.content) }],
      output_config: { format: zodOutputFormat(request.schema) },
    },
  };
}

/** Submit one batch for a set of step requests; returns the batch id to poll. */
export async function submitBatch(client: Anthropic, entries: BatchEntry[]): Promise<string> {
  const batch = await client.messages.batches.create({
    requests: entries.map(toBatchRequest),
  });
  return batch.id;
}
