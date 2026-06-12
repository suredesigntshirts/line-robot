import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import type { StepLlm, StepLlmRequest, StepLlmResponse } from "../ports.ts";

// ---------------------------------------------------------------------------
// Sync transport (D2.3): messages.parse with strict structured output. The
// per-step system prefix carries cache_control so repeated step calls hit the
// prompt cache (verify via usage.cache_read_input_tokens — never assume).
// Failures and schema mismatches return value:null; steps own their fallback
// (segment → single-segment, extract → drop+gate, dedup → "new", …).
// ---------------------------------------------------------------------------

export class AnthropicStepLlm implements StepLlm {
  constructor(private readonly client: Anthropic) {}

  async run<S extends z.ZodType>(request: StepLlmRequest<S>): Promise<StepLlmResponse<z.infer<S>>> {
    try {
      const response = await this.client.messages.parse({
        model: request.model,
        max_tokens: request.maxOutputTokens,
        system: [{ type: "text", text: request.system, cache_control: { type: "ephemeral" } }],
        messages: [
          {
            role: "user",
            content: request.content.map((block) =>
              block.type === "text"
                ? ({ type: "text", text: block.text } as const)
                : ({
                    type: "image",
                    source: { type: "base64", media_type: block.mediaType, data: block.base64 },
                  } as const),
            ),
          },
        ],
        output_config: { format: zodOutputFormat(request.schema) },
      });
      return {
        value: (response.parsed_output as z.infer<S> | null) ?? null,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        },
      };
    } catch (error) {
      // Step-level fallbacks are the resilience mechanism; surface the cause in logs only.
      console.error(`pipeline ${request.step} call failed:`, error);
      return { value: null, usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 } };
    }
  }
}
