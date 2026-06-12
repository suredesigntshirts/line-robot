import type { TranslateInput, TranslateResult } from "../steps.ts";
import { STEP_MODELS, type StepContext } from "./context.ts";
import { TRANSLATE_SYSTEM } from "./prompts.ts";
import { translateSchema } from "./schemas.ts";

/**
 * Step 5 (D2.9): th↔en at write time. Numeric/enum/geo fields are
 * language-neutral and never pass through here. Fail: null — the caller skips
 * the target-lang row and the gate flags "translation pending" (non-blocking).
 */
export async function translateContent(
  ctx: StepContext,
  input: TranslateInput,
): Promise<TranslateResult | null> {
  const toLang = input.fromLang === "th" ? "en" : "th";
  const response = await ctx.llm.run({
    step: "translate",
    model: STEP_MODELS.translate,
    system: TRANSLATE_SYSTEM,
    content: [
      {
        type: "text",
        text: `Translate from ${input.fromLang} to ${toLang}.\n\nTITLE: ${input.title}\nDESCRIPTION: ${input.description}\nNOTES: ${input.notes || "(none)"}`,
      },
    ],
    schema: translateSchema,
    maxOutputTokens: 1024,
  });
  ctx.costLog.record("translate", STEP_MODELS.translate, response.usage, ctx.mode);
  if (response.value === null) return null;
  return { lang: toLang, ...response.value };
}
