import { describe, expect, it } from "vitest";
import type { IncomingMessage } from "../../src/core/domain/message.js";
import { EditReplyHandler } from "../../src/core/handlers/editReplyHandler.js";
import type {
  ExtractedProperty,
  ExtractionRequest,
  ExtractionResult,
  PropertyExtractor,
} from "../../src/core/ports/extraction.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";
import { textOf } from "../fixtures/outbound.js";

const NOW = 1_000_000;
const clock = { now: () => NOW };
const CONV = "user#U1";

function extracted(over: Partial<ExtractedProperty> = {}): ExtractedProperty {
  return {
    existingPropertyId: "",
    ambiguous: false,
    ambiguousWith: [],
    normalizedAddress: "",
    rawAddress: "",
    projectName: "",
    lat: null,
    long: null,
    district: "",
    subdistrict: "",
    province: "",
    propertyType: "",
    status: "",
    askingPrice: null,
    currency: "",
    tags: [],
    bedrooms: null,
    bathrooms: null,
    usableAreaSqm: null,
    landArea: "",
    floors: null,
    furnishing: "",
    notes: "",
    listingType: "",
    rentPrice: null,
    contact: "",
    source: "",
    ...over,
  };
}

/** A fake extractor returning a fixed result, capturing the request it saw. */
function fakeExtractor(
  result: ExtractionResult | null,
): PropertyExtractor & { seen?: ExtractionRequest } {
  const fake: PropertyExtractor & { seen?: ExtractionRequest } = {
    extract: async (req) => {
      fake.seen = req;
      return result;
    },
  };
  return fake;
}

function msg(text: string): IncomingMessage {
  return {
    ref: { kind: "user", userId: "U1" },
    messageId: "m1",
    contentType: "text",
    text,
    webhookEventId: "e1",
    timestamp: NOW,
  };
}

describe("EditReplyHandler", () => {
  it("does nothing when no edit context is armed", async () => {
    const catalog = new FakeCatalog().seedProperty({ propertyId: "p1" });
    const handler = new EditReplyHandler(catalog, fakeExtractor(null), clock);
    expect(await handler.handle(msg("price is 4.2M"))).toEqual([]);
  });

  it("applies a scoped edit to the armed property and confirms the diff", async () => {
    const catalog = new FakeCatalog().seedProperty({
      propertyId: "p1",
      normalizedAddress: "1 Sukhumvit",
      askingPrice: 5_500_000,
      currency: "THB",
      status: "lead",
    });
    await catalog.armEdit(CONV, "p1", NOW);
    const extractor = fakeExtractor({
      properties: [
        extracted({ existingPropertyId: "p1", askingPrice: 4_200_000, status: "negotiating" }),
      ],
    });
    const handler = new EditReplyHandler(catalog, extractor, clock);

    const out = await handler.handle(msg("now 4.2M and we're negotiating"));
    const text = textOf(out[0]);
    expect(text).toContain("Updated 1 Sukhumvit");
    expect(text).toContain("Price ฿4,200,000 (was ฿5,500,000)");
    expect(text).toContain("Status negotiating (was lead)");
    // The property is updated, and the edit context stays armed (refreshed) so corrections/reverts
    // keep targeting this listing.
    expect(catalog.properties.get("p1")?.askingPrice).toBe(4_200_000);
    expect(await catalog.getEditContext(CONV)).toEqual({ propertyId: "p1", armedAt: NOW });
    // The viewed property was offered as the sole extraction candidate.
    expect(extractor.seen?.candidates).toEqual([
      {
        propertyId: "p1",
        normalizedAddress: "1 Sukhumvit",
        projectName: undefined,
        lat: undefined,
        long: undefined,
      },
    ]);
  });

  it("falls through (and clears) when the model doesn't resolve an update to the armed property", async () => {
    const catalog = new FakeCatalog().seedProperty({ propertyId: "p1", askingPrice: 1 });
    await catalog.armEdit(CONV, "p1", NOW);
    // Model decides this is a NEW property (existingPropertyId ""), not an edit of p1.
    const handler = new EditReplyHandler(
      catalog,
      fakeExtractor({
        properties: [extracted({ existingPropertyId: "", projectName: "Other" })],
      }),
      clock,
    );
    expect(await handler.handle(msg("a totally different place on Thonglor"))).toEqual([]);
    expect(catalog.properties.get("p1")?.askingPrice).toBe(1); // unchanged
    expect(await catalog.getEditContext(CONV)).toBeNull(); // cleared
  });

  it("ignores an expired edit context", async () => {
    const catalog = new FakeCatalog().seedProperty({ propertyId: "p1" });
    await catalog.armEdit(CONV, "p1", NOW - 20 * 60_000); // armed 20 min ago (> 15 min TTL)
    const extractor = fakeExtractor({
      properties: [extracted({ existingPropertyId: "p1", status: "sold" })],
    });
    const handler = new EditReplyHandler(catalog, extractor, clock);

    expect(await handler.handle(msg("mark sold"))).toEqual([]);
    expect(extractor.seen).toBeUndefined(); // never called the model
    expect(await catalog.getEditContext(CONV)).toBeNull(); // expired arm is cleared
  });

  it("clears the context and falls through when the armed property is gone", async () => {
    const catalog = new FakeCatalog(); // no property seeded
    await catalog.armEdit(CONV, "p1", NOW);
    const handler = new EditReplyHandler(catalog, fakeExtractor(null), clock);
    expect(await handler.handle(msg("price 9M"))).toEqual([]);
    expect(await catalog.getEditContext(CONV)).toBeNull();
  });

  it("ignores empty/whitespace replies", async () => {
    const catalog = new FakeCatalog().seedProperty({ propertyId: "p1" });
    await catalog.armEdit(CONV, "p1", NOW);
    const handler = new EditReplyHandler(catalog, fakeExtractor(null), clock);
    expect(await handler.handle(msg("   "))).toEqual([]);
  });
});
