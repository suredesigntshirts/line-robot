import type { z } from "zod";

// ---------------------------------------------------------------------------
// Ports at the REAL seams only (LLM; S3 lives behind MediaStore). Step logic
// stays pure; the Anthropic adapter (sync messages.parse / batch) and a fake
// both implement StepLlm.
// ---------------------------------------------------------------------------

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
}

export interface StepLlmRequest<S extends z.ZodType> {
  step: PipelineStepName;
  model: string;
  /** Shared cacheable system prefix (taxonomy/glossary; padded past the cache minimum). */
  system: string;
  /** User content: text and/or images. */
  content: Array<
    | { type: "text"; text: string }
    | { type: "image"; mediaType: "image/jpeg" | "image/png" | "image/webp"; base64: string }
  >;
  schema: S;
  maxOutputTokens: number;
}

export interface StepLlmResponse<T> {
  /** null = the call failed or the output didn't validate; steps apply their own fallback. */
  value: T | null;
  usage: LlmUsage;
}

export interface StepLlm {
  run<S extends z.ZodType>(request: StepLlmRequest<S>): Promise<StepLlmResponse<z.infer<S>>>;
}

export type PipelineStepName =
  | "classify"
  | "segment"
  | "extract"
  | "dedup"
  | "translate"
  | "gate";

/** S3 seam for derivatives (Q-SA3: extends the v1 raw archive's media duties). */
export interface MediaStore {
  getOriginal(s3Key: string): Promise<{ bytes: Uint8Array; contentType: string }>;
  putDerivative(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
}
