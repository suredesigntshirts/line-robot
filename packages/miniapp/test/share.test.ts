import type { PropertyDetail } from "@line-robot/shared";
import { describe, expect, it } from "vitest";
import { buildShareFlex } from "../src/lib/share.js";

/** A minimal structural view of the Flex bubble buildShareFlex emits (it returns the SDK's opaque
 * message type), enough to assert the shape the recipient sees. */
interface FlexShape {
  readonly type: string;
  readonly altText: string;
  readonly contents: {
    readonly type: string;
    readonly body: { readonly contents: ReadonlyArray<{ type: string; text?: string }> };
    readonly footer: {
      readonly contents: ReadonlyArray<{ action: { type: string; label: string; uri: string } }>;
    };
  };
}

const base: PropertyDetail = { propertyId: "p1", title: "123 Sukhumvit", photos: [] };

function shape(p: PropertyDetail, url: string): FlexShape {
  return buildShareFlex(p, url) as unknown as FlexShape;
}
function bodyTexts(f: FlexShape): Array<string | undefined> {
  return f.contents.body.contents.filter((c) => c.type === "text").map((c) => c.text);
}

describe("buildShareFlex", () => {
  it("renders a self-contained bubble with title, status, price, and a type · area line", () => {
    const f = shape(
      {
        ...base,
        statusBadge: "🟡 Negotiating",
        price: "฿5,000,000",
        propertyType: "condo",
        area: "Watthana",
      },
      "https://miniapp.line.me/x/p/p1",
    );
    expect(f.type).toBe("flex");
    expect(f.altText).toContain("123 Sukhumvit");
    expect(f.contents.type).toBe("bubble");
    expect(bodyTexts(f)).toEqual([
      "123 Sukhumvit",
      "🟡 Negotiating",
      "฿5,000,000",
      "condo · Watthana",
    ]);
  });

  it("puts a 'View listing' uri button (the deep link) in the footer", () => {
    const f = shape(base, "https://miniapp.line.me/x/p/p1");
    const button = f.contents.footer.contents[0]?.action;
    expect(button).toEqual({
      type: "uri",
      label: "View listing",
      uri: "https://miniapp.line.me/x/p/p1",
    });
  });

  it("omits absent lines — a bare listing shows only its title", () => {
    expect(bodyTexts(shape(base, "u"))).toEqual(["123 Sukhumvit"]);
  });

  it("falls back to the monthly rent as the headline when there is no sale price", () => {
    expect(bodyTexts(shape({ ...base, rent: "฿25,000/mo" }, "u"))).toContain("฿25,000/mo");
  });
});
