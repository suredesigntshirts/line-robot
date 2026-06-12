import type Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import type { StepLlmRequest } from "../ports.ts";

/** One content builder shared by both transports (sync adapter + batch build). */
export function toApiContent(
  content: StepLlmRequest<z.ZodType>["content"],
): Anthropic.Messages.ContentBlockParam[] {
  return content.map((block) =>
    block.type === "text"
      ? ({ type: "text", text: block.text } as const)
      : ({
          type: "image",
          source: { type: "base64", media_type: block.mediaType, data: block.base64 },
        } as const),
  );
}
