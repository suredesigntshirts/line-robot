import type { PublicListingDetail } from "@line-robot/db";
import { describe, expect, it } from "vitest";
import { listingJsonLd, safeJsonLdScript } from "../src/lib/jsonLd.ts";

const detail = (
  over: Partial<PublicListingDetail["listing"]>,
  rest?: Partial<PublicListingDetail>,
) =>
  ({
    listing: {
      id: "x",
      dealType: "sale",
      priceThb: 1_000_000,
      province: "เชียงใหม่",
      amphoe: null,
      tambon: null,
      bedrooms: null,
      bathrooms: null,
      floorAreaSqm: null,
      createdAt: new Date("2026-06-13T00:00:00Z"),
      ...over,
    },
    headline: "h",
    description: "",
    photoCount: 0,
    monthlyRent: null,
    amenities: [],
    posterName: "",
    lat: null,
    lon: null,
    photos: [],
    ...rest,
  }) as unknown as PublicListingDetail;

describe("safeJsonLdScript", () => {
  it("escapes < so </script> in content cannot break out", () => {
    const out = safeJsonLdScript({ name: "x</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script");
    expect(JSON.parse(out).name).toBe("x</script><script>alert(1)</script>");
  });
});

describe("listingJsonLd", () => {
  it("never emits null-valued properties (Rich Results requirement)", () => {
    const ld = listingJsonLd(detail({}), "https://x.test/properties/x");
    expect(JSON.stringify(ld)).not.toContain(":null");
    expect(ld).not.toHaveProperty("geo");
    expect(ld).not.toHaveProperty("numberOfBedrooms");
    expect(ld).not.toHaveProperty("description");
  });

  it("prices a sale from priceThb and a rental from monthlyRent per month", () => {
    const sale = listingJsonLd(detail({}), "u") as { offers: { price: number } };
    expect(sale.offers.price).toBe(1_000_000);
    const rent = listingJsonLd(
      detail({ dealType: "rent", priceThb: null }, { monthlyRent: 12_000 }),
      "u",
    ) as { offers: { price: number; priceSpecification: { unitText: string } } };
    expect(rent.offers.price).toBe(12_000);
    expect(rent.offers.priceSpecification.unitText).toBe("MONTH");
  });

  it("omits offers entirely when no price is stated", () => {
    const ld = listingJsonLd(detail({ priceThb: null }), "u");
    expect(ld).not.toHaveProperty("offers");
  });

  it("carries geo when coordinates exist", () => {
    const ld = listingJsonLd(detail({}, { lat: 18.79, lon: 98.96 }), "u") as {
      geo: { latitude: number };
    };
    expect(ld.geo.latitude).toBe(18.79);
  });

  it("includes image[] when photo URLs are given, omits it otherwise (4.1)", () => {
    const withImg = listingJsonLd(detail({}), "u", [
      "https://x.test/a.jpg",
      "https://x.test/b.jpg",
    ]) as { image: string[] };
    expect(withImg.image).toEqual(["https://x.test/a.jpg", "https://x.test/b.jpg"]);
    expect(listingJsonLd(detail({}), "u")).not.toHaveProperty("image");
    expect(listingJsonLd(detail({}), "u", [])).not.toHaveProperty("image");
  });
});
