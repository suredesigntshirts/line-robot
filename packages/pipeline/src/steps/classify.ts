import type { ClassifyResult, VisionImage } from "../steps.ts";
import { STEP_MODELS, type StepContext } from "./context.ts";
import { CLASSIFY_SYSTEM } from "./prompts.ts";
import { classifySchema } from "./schemas.ts";

function toResult(raw: NonNullable<Awaited<ReturnType<typeof callOnce>>>): ClassifyResult {
  return {
    kind: raw.kind,
    label: raw.label,
    chanote:
      raw.kind === "chanote" && raw.deedNo !== ""
        ? {
            deedNo: raw.deedNo,
            province: raw.deedProvince,
            landRai: raw.landRai,
            landNgan: raw.landNgan,
            landWah: raw.landWah,
          }
        : undefined,
    ocrText: raw.ocrText,
    lowConfidence: raw.lowConfidence,
  };
}

async function callOnce(ctx: StepContext, image: VisionImage, model: string) {
  const response = await ctx.llm.run({
    step: "classify",
    model,
    system: CLASSIFY_SYSTEM,
    content: [
      { type: "image", mediaType: image.mediaType, base64: image.base64 },
      { type: "text", text: "Classify this image." },
    ],
    schema: classifySchema,
    maxOutputTokens: 1024,
  });
  ctx.costLog.record("classify", model, response.usage, ctx.mode);
  return response.value;
}

/**
 * Step 1: classify+ocr on the 1568px derivative (never the original — D2.7).
 * Chanote OCR escalates Haiku → Sonnet on lowConfidence (D2.2). Fail: null —
 * the caller stores the image as a plain property photo (v1 behavior, kept).
 */
export async function classifyImage(
  ctx: StepContext,
  image: VisionImage,
): Promise<ClassifyResult | null> {
  const first = await callOnce(ctx, image, STEP_MODELS.classify);
  if (first === null) return null;
  if (first.kind === "chanote" && first.lowConfidence) {
    const escalated = await callOnce(ctx, image, STEP_MODELS.classifyEscalation);
    if (escalated !== null) return toResult(escalated);
  }
  return toResult(first);
}
