import { describe, expect, it, vi } from "vitest";
import { type LineApiClient, LineMessagingGateway } from "../../src/adapters/line/lineGateway.js";

function fakeClient(): LineApiClient {
  return {
    replyMessage: vi.fn(async () => ({})),
    pushMessage: vi.fn(async () => ({})),
  };
}

// biome-ignore lint/suspicious/noExplicitAny: tests inspect the loosely-typed SDK request payloads.
function firstMessage(fn: unknown, callIndex = 0): any {
  const calls = (fn as ReturnType<typeof vi.fn>).mock.calls;
  const call = calls[callIndex];
  if (call === undefined) {
    throw new Error(`expected a call at index ${callIndex}`);
  }
  return call[0].messages[0];
}

describe("LineMessagingGateway", () => {
  it("maps outbound text onto an SDK reply request", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);

    await gateway.reply("rt", [
      { type: "text", text: "a" },
      { type: "text", text: "b" },
    ]);

    expect(client.replyMessage).toHaveBeenCalledWith({
      replyToken: "rt",
      messages: [
        { type: "text", text: "a" },
        { type: "text", text: "b" },
      ],
    });
  });

  it("maps outbound text onto an SDK push request", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);

    await gateway.push("Cgroup", [{ type: "text", text: "hey" }]);

    expect(client.pushMessage).toHaveBeenCalledWith({
      to: "Cgroup",
      messages: [{ type: "text", text: "hey" }],
    });
  });

  it("does not call the API for an empty message list", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);

    await gateway.reply("rt", []);
    await gateway.push("Cg", []);

    expect(client.replyMessage).not.toHaveBeenCalled();
    expect(client.pushMessage).not.toHaveBeenCalled();
  });

  it("attaches quick replies (capped, label-truncated) to a text message", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);

    await gateway.push("U1", [
      {
        type: "text",
        text: "Confirm?",
        quickReplies: [
          { label: "This label is definitely longer than twenty", data: "action=keep&id=p1" },
          { label: "Merge", data: "action=merge&from=p1&into=p2", displayText: "Merge it" },
        ],
      },
    ]);

    const sent = firstMessage(client.pushMessage);
    expect(sent.quickReply.items).toHaveLength(2);
    expect(sent.quickReply.items[0].action).toMatchObject({
      type: "postback",
      label: "This label is defini", // truncated to 20 chars
      data: "action=keep&id=p1",
    });
    expect(sent.quickReply.items[1].action.displayText).toBe("Merge it");
  });

  it("renders a single card as a bubble and multiple as a carousel", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);

    await gateway.reply("rt", [
      {
        type: "flex",
        altText: "Your listings",
        cards: [
          {
            title: "123 Sukhumvit",
            subtitle: "negotiating",
            rows: [{ label: "Price", value: "฿5.5M" }],
            actions: [{ label: "Details", data: "action=view&id=p1" }],
          },
        ],
      },
    ]);
    const single = firstMessage(client.replyMessage);
    expect(single.type).toBe("flex");
    expect(single.altText).toBe("Your listings");
    expect(single.contents.type).toBe("bubble");
    expect(single.contents.footer.contents[0].action).toMatchObject({
      type: "postback",
      data: "action=view&id=p1",
    });

    await gateway.reply("rt", [
      {
        type: "flex",
        altText: "Two",
        cards: [
          { title: "A", rows: [], actions: [] },
          { title: "B", rows: [], actions: [] },
        ],
      },
    ]);
    const multi = firstMessage(client.replyMessage, 1);
    expect(multi.contents.type).toBe("carousel");
    expect(multi.contents.contents).toHaveLength(2);
  });

  it("renders a `mode: datetime` card action as a LINE datetime-picker", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);

    await gateway.reply("rt", [
      {
        type: "flex",
        altText: "card",
        cards: [
          {
            title: "123 Sukhumvit",
            rows: [],
            actions: [
              { label: "📅 Follow-up", data: "action=setfollowup&id=p1", mode: "datetime" },
            ],
          },
        ],
      },
    ]);
    expect(firstMessage(client.replyMessage).contents.footer.contents[0].action).toMatchObject({
      type: "datetimepicker",
      mode: "datetime",
      data: "action=setfollowup&id=p1",
    });
  });

  it("renders a `mode: uri` card action as a LINE uri button, plus headline + notes", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);

    await gateway.reply("rt", [
      {
        type: "flex",
        altText: "card",
        cards: [
          {
            title: "123 Sukhumvit",
            subtitle: "🟡 Negotiating",
            headline: "฿4,500,000",
            rows: [{ label: "Type", value: "condo" }],
            notes: ["💬 Reply to update", "Saved 2 Jun · Updated 6 Jun"],
            actions: [
              { label: "🗺 Open in Maps", data: "", mode: "uri", uri: "https://maps.example/x" },
            ],
          },
        ],
      },
    ]);
    const bubble = firstMessage(client.replyMessage).contents;
    expect(bubble.footer.contents[0].action).toMatchObject({
      type: "uri",
      label: "🗺 Open in Maps",
      uri: "https://maps.example/x",
    });
    // headline + the two note lines (after a separator) are present in the body.
    const texts = bubble.body.contents
      .filter((c: { type: string; text?: string }) => c.type === "text")
      .map((c: { text?: string }) => c.text);
    expect(texts).toContain("฿4,500,000");
    expect(texts).toContain("💬 Reply to update");
    expect(bubble.body.contents.some((c: { type: string }) => c.type === "separator")).toBe(true);
  });

  it("renders an imageCarousel as a flex carousel of tappable image bubbles", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);

    await gateway.reply("rt", [
      { type: "imageCarousel", altText: "Photos", imageUrls: ["https://i/1", "https://i/2"] },
    ]);
    const sent = firstMessage(client.replyMessage);
    expect(sent.type).toBe("flex");
    expect(sent.altText).toBe("Photos");
    expect(sent.contents.type).toBe("carousel");
    expect(sent.contents.contents).toHaveLength(2);
    const hero = sent.contents.contents[0].hero;
    expect(hero).toMatchObject({ type: "image", url: "https://i/1" });
    expect(hero.action).toMatchObject({ type: "uri", uri: "https://i/1" });
  });

  it("caps a carousel at 12 bubbles", async () => {
    const client = fakeClient();
    const gateway = new LineMessagingGateway(client);
    const cards = Array.from({ length: 20 }, (_, i) => ({
      title: `P${i}`,
      rows: [],
      actions: [],
    }));

    await gateway.push("U1", [{ type: "flex", altText: "many", cards }]);
    const sent = firstMessage(client.pushMessage);
    expect(sent.contents.contents).toHaveLength(12);
  });
});
