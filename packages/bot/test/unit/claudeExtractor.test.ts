import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import {
  buildExtractionContent,
  buildExtractionSystem,
  ClaudeExtractor,
  type ModelTier,
} from "../../src/adapters/anthropic/claudeExtractor.js";
import type { ExtractionRequest } from "../../src/core/ports/extraction.js";

function request(over: Partial<ExtractionRequest> = {}): ExtractionRequest {
  return {
    conversationKey: "user#U",
    text: "a condo on Sukhumvit",
    media: [],
    geoHints: [],
    candidates: [],
    ...over,
  };
}

/** The first content block is always the text prompt. */
function promptText(content: ReturnType<typeof buildExtractionContent>): string {
  const first = content[0];
  if (first?.type !== "text") {
    throw new Error("expected a leading text block");
  }
  return first.text;
}

describe("buildExtractionContent", () => {
  it("leads with the batch text and notes when there are no candidates", () => {
    const content = buildExtractionContent(request());
    expect(content).toHaveLength(1);
    const text = promptText(content);
    expect(text).toContain("a condo on Sukhumvit");
    expect(text).toContain("no existing properties");
  });

  it("includes geo hints and existing-property candidates", () => {
    const content = buildExtractionContent(
      request({
        geoHints: [{ lat: 13.75, long: 100.5 }],
        candidates: [
          { propertyId: "p1", normalizedAddress: "123 Sukhumvit", projectName: "The Park" },
        ],
      }),
    );
    const text = promptText(content);
    expect(text).toContain("13.75,100.5");
    expect(text).toContain("id=p1");
    expect(text).toContain("123 Sukhumvit");
    expect(text).toContain("The Park");
  });

  it("appends image media as base64 image blocks", () => {
    const content = buildExtractionContent(
      request({ media: [{ base64: "QUJD", mediaType: "image/png" }] }),
    );
    expect(content).toHaveLength(2);
    expect(content[1]).toEqual({
      type: "image",
      source: { type: "base64", media_type: "image/png", data: "QUJD" },
    });
  });

  it("appends PDFs as document blocks", () => {
    const content = buildExtractionContent(
      request({ media: [{ base64: "JVBE", mediaType: "application/pdf" }] }),
    );
    expect(content[1]).toEqual({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: "JVBE" },
    });
  });

  it("skips unsupported media types (audio/video/unknown)", () => {
    const content = buildExtractionContent(
      request({
        media: [
          { base64: "x", mediaType: "audio/mp4" },
          { base64: "y", mediaType: "image/jpeg" },
        ],
      }),
    );
    // Only the text block + the one image — the audio is dropped.
    expect(content).toHaveLength(2);
    expect(content[1]).toMatchObject({ type: "image" });
  });
});

describe("buildExtractionSystem", () => {
  it("is a single cached block when there's no memory", () => {
    const blocks = buildExtractionSystem();
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ type: "text", cache_control: { type: "ephemeral" } });
    expect(buildExtractionSystem("   ")).toHaveLength(1); // blank memory → no second block
  });

  it("appends the memory note as a second 1h-TTL cached block", () => {
    const blocks = buildExtractionSystem("Khun Mali is the seller. 'Thonglor plot' = PROP#abc.");
    expect(blocks).toHaveLength(2);
    expect(blocks[1]).toMatchObject({
      type: "text",
      cache_control: { type: "ephemeral", ttl: "1h" },
    });
    expect(blocks[1]?.type === "text" && blocks[1].text).toContain("Thonglor plot");
  });
});

describe("ClaudeExtractor — escalation ladder", () => {
  const LADDER: ModelTier[] = [
    { model: "m1" },
    { model: "m2", effort: "medium", thinking: true },
    { model: "m3", effort: "high", thinking: true },
  ];

  interface Call {
    model: string;
    effort?: string;
    thinking?: unknown;
    maxTokens: number;
  }

  /** Fake the SDK client: each model returns its scripted parsed_output (or null). */
  function extractorWith(script: Record<string, { lowConfidence: boolean } | null>) {
    const calls: Call[] = [];
    const client = {
      messages: {
        parse: async (params: {
          model: string;
          max_tokens: number;
          output_config?: { effort?: string };
          thinking?: unknown;
        }) => {
          calls.push({
            model: params.model,
            effort: params.output_config?.effort,
            thinking: params.thinking,
            maxTokens: params.max_tokens,
          });
          const out = script[params.model];
          return { parsed_output: out ? { properties: [], memoryUpdate: null, ...out } : null };
        },
      },
    } as unknown as Anthropic;
    return { extractor: new ClaudeExtractor(client, LADDER), calls };
  }

  it("uses the primary plain when it is confident — no escalation", async () => {
    const { extractor, calls } = extractorWith({ m1: { lowConfidence: false } });
    const result = await extractor.extract(request());
    expect(calls.map((c) => c.model)).toEqual(["m1"]);
    expect(result?.escalatedTo).toBeUndefined();
    expect(calls[0]).toMatchObject({ effort: undefined, thinking: undefined }); // Haiku-style
  });

  it("escalates on low confidence with effort + adaptive thinking, tagging the model used", async () => {
    const { extractor, calls } = extractorWith({
      m1: { lowConfidence: true },
      m2: { lowConfidence: false },
    });
    const result = await extractor.extract(request());
    expect(calls.map((c) => c.model)).toEqual(["m1", "m2"]);
    expect(result?.escalatedTo).toBe("m2");
    expect(calls[1]).toMatchObject({ effort: "medium", thinking: { type: "adaptive" } });
    expect(calls[1]?.maxTokens).toBeGreaterThan(calls[0]?.maxTokens ?? 0);
  });

  it("accepts the last tier even if still low confidence (best effort)", async () => {
    const { extractor, calls } = extractorWith({
      m1: { lowConfidence: true },
      m2: { lowConfidence: true },
      m3: { lowConfidence: true },
    });
    expect((await extractor.extract(request()))?.escalatedTo).toBe("m3");
    expect(calls.map((c) => c.model)).toEqual(["m1", "m2", "m3"]);
  });

  it("escalates past an unparseable tier, and returns null only if every tier fails", async () => {
    const ok = extractorWith({ m1: null, m2: { lowConfidence: false } });
    expect((await ok.extractor.extract(request()))?.escalatedTo).toBe("m2");

    const allNull = extractorWith({});
    expect(await allNull.extractor.extract(request())).toBeNull();
    expect(allNull.calls.map((c) => c.model)).toEqual(["m1", "m2", "m3"]);
  });
});
