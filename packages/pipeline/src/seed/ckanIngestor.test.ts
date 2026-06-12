import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { ckanIngestor } from "./ckanIngestor.ts";

const FIXTURE = new URL("./fixtures/ckan-led-sample.json", import.meta.url);

function fixtureFetch(): typeof fetch {
  return (async (url: Parameters<typeof fetch>[0]) => {
    const body = await readFile(FIXTURE, "utf8");
    return new Response(body, {
      status: 200,
      headers: { "content-type": "application/json", "x-requested": String(url) },
    });
  }) as typeof fetch;
}

describe("ckanIngestor (committed LED-shaped fixture; live source blocked from this network)", () => {
  it("maps datastore rows to listing specs and skips rows without a price", async () => {
    const specs = await ckanIngestor(
      "https://catalog.data.go.th/api/3/action/datastore_search?resource_id=led-auction-sample",
      fixtureFetch(),
    ).fetchSpecs();

    expect(specs).toHaveLength(2); // row 3 has no price → skipped
    expect(specs[0]).toMatchObject({
      dealType: "sale",
      urgency: "quick_sale", // LED auctions are distressed by definition
      titleDeedType: "chanote",
      priceThb: 1_250_000, // "1,250,000" parsed
      province: "เชียงใหม่",
      landRai: 1,
      landNgan: 2,
      landWah: 35,
    });
    expect(specs[1]?.titleDeedType).toBe("ns3g");
    expect(specs[1]?.priceThb).toBe(2_780_000);
  });

  it("is rate-modest: a single request with an explicit row limit", async () => {
    let requested: string | undefined;
    let calls = 0;
    const spy = (async (url: Parameters<typeof fetch>[0]) => {
      calls += 1;
      requested = String(url);
      return new Response(JSON.stringify({ success: true, result: { records: [] } }), {
        status: 200,
      });
    }) as typeof fetch;

    await ckanIngestor(
      "https://example.org/api/3/action/datastore_search?resource_id=x",
      spy,
    ).fetchSpecs();
    expect(calls).toBe(1);
    expect(requested).toContain("limit=100");
  });

  it("throws on a non-OK response instead of retrying", async () => {
    const failing = (async () => new Response("nope", { status: 503 })) as typeof fetch;
    await expect(
      ckanIngestor("https://example.org/api?resource_id=x", failing).fetchSpecs(),
    ).rejects.toThrow("503");
  });
});
