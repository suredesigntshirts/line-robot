import { describe, expect, it } from "vitest";
import { buildExtractionContent } from "../../src/adapters/anthropic/claudeExtractor.js";
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
