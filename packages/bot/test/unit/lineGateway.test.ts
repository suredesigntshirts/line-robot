import { describe, expect, it, vi } from "vitest";
import { type LineApiClient, LineMessagingGateway } from "../../src/adapters/line/lineGateway.js";

function fakeClient(): LineApiClient {
  return {
    replyMessage: vi.fn(async () => ({})),
    pushMessage: vi.fn(async () => ({})),
  };
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
});
