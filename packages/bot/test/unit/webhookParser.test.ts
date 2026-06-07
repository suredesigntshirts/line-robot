import { describe, expect, it } from "vitest";
import { parseRawEvent, parseWebhook } from "../../src/adapters/line/webhookParser.js";
import * as fx from "../fixtures/webhook.js";

function must<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("expected a value but got undefined");
  }
  return value;
}

describe("parseWebhook", () => {
  it("parses a 1:1 text message into an IncomingMessage", () => {
    const parsed = parseWebhook(
      fx.webhookBody([fx.textMessageEvent({ text: "hi", source: fx.userSource("Uabc") })]),
    );
    expect(parsed.destination).toBe(fx.DESTINATION);
    expect(parsed.events).toHaveLength(1);

    const event = must(parsed.events[0]);
    expect(event.kind).toBe("message");
    if (event.kind === "message") {
      expect(event.message.ref).toEqual({ kind: "user", userId: "Uabc" });
      expect(event.message.text).toBe("hi");
      expect(event.message.contentType).toBe("text");
      expect(event.message.replyToken).toBeTruthy();
    }
  });

  it("captures group and room sender ids", () => {
    const parsed = parseWebhook(
      fx.webhookBody([
        fx.textMessageEvent({ source: fx.groupSource("Cg", "Usender") }),
        fx.textMessageEvent({ source: fx.roomSource("Rr", "Usender2") }),
      ]),
    );
    const refs = parsed.events.map((e) => (e.kind === "message" ? e.message.ref : undefined));
    expect(refs[0]).toEqual({ kind: "group", groupId: "Cg", senderUserId: "Usender" });
    expect(refs[1]).toEqual({ kind: "room", roomId: "Rr", senderUserId: "Usender2" });
  });

  it("treats an empty events array (verify ping) as no events", () => {
    expect(parseWebhook(fx.webhookBody([])).events).toEqual([]);
  });

  it("maps non-text content with no text field", () => {
    const parsed = parseWebhook(fx.webhookBody([fx.stickerMessageEvent()]));
    const event = must(parsed.events[0]);
    expect(event.kind).toBe("message");
    if (event.kind === "message") {
      expect(event.message.contentType).toBe("sticker");
      expect(event.message.text).toBeUndefined();
    }
  });

  it("carries coordinates on a location message", () => {
    const parsed = parseWebhook(fx.webhookBody([fx.locationMessageEvent()]));
    const event = must(parsed.events[0]);
    if (event.kind === "message") {
      expect(event.message.contentType).toBe("location");
      expect(event.message.location).toEqual({
        latitude: 13.7401,
        longitude: 100.5601,
        title: "My Office",
        address: "Sukhumvit Rd, Bangkok",
      });
    }
  });

  it("carries the file name on a file message", () => {
    const parsed = parseWebhook(fx.webhookBody([fx.fileMessageEvent({ fileName: "deed.pdf" })]));
    const event = must(parsed.events[0]);
    if (event.kind === "message") {
      expect(event.message.contentType).toBe("file");
      expect(event.message.fileName).toBe("deed.pdf");
    }
  });

  it("extracts member ids on memberJoined/memberLeft", () => {
    const parsed = parseWebhook(fx.webhookBody([fx.memberJoinedEvent(), fx.memberLeftEvent()]));
    const joined = must(parsed.events[0]);
    const left = must(parsed.events[1]);
    if (joined.kind === "memberJoined") {
      expect(joined.memberIds).toEqual(["Umember000000000000000000000001"]);
    }
    if (left.kind === "memberLeft") {
      expect(left.memberIds).toEqual(["Umember000000000000000000000002"]);
    }
  });

  it("parses a postback event with its data payload", () => {
    const parsed = parseWebhook(
      fx.webhookBody([
        fx.postbackEvent({ data: "action=view&id=PROP%23123", source: fx.userSource("Uabc") }),
      ]),
    );
    const event = must(parsed.events[0]);
    expect(event.kind).toBe("postback");
    if (event.kind === "postback") {
      expect(event.ref).toEqual({ kind: "user", userId: "Uabc" });
      expect(event.data).toBe("action=view&id=PROP%23123");
      expect(event.replyToken).toBeTruthy();
      expect(event.params).toBeUndefined();
    }
  });

  it("carries datetime-picker params on a postback", () => {
    const parsed = parseWebhook(
      fx.webhookBody([
        fx.postbackEvent({ data: "action=followup", params: { datetime: "2026-07-01T10:00" } }),
      ]),
    );
    const event = must(parsed.events[0]);
    if (event.kind === "postback") {
      expect(event.params).toEqual({ datetime: "2026-07-01T10:00" });
    }
  });

  it("carries the group sender on a group postback", () => {
    const parsed = parseWebhook(
      fx.webhookBody([fx.postbackEvent({ source: fx.groupSource("Cg", "Usender") })]),
    );
    const event = must(parsed.events[0]);
    if (event.kind === "postback") {
      expect(event.ref).toEqual({ kind: "group", groupId: "Cg", senderUserId: "Usender" });
    }
  });

  it("parses join/leave/memberJoined/memberLeft and reply-token presence", () => {
    const parsed = parseWebhook(
      fx.webhookBody([
        fx.joinEvent(),
        fx.leaveEvent(),
        fx.memberJoinedEvent(),
        fx.memberLeftEvent(),
      ]),
    );
    expect(parsed.events.map((e) => e.kind)).toEqual([
      "join",
      "leave",
      "memberJoined",
      "memberLeft",
    ]);

    const join = must(parsed.events[0]);
    if (join.kind === "join") {
      expect(join.replyToken).toBeTruthy();
    }
    // leave and memberLeft variants carry no reply token
    const leave = must(parsed.events[1]);
    expect("replyToken" in leave).toBe(false);
  });
});

describe("parseRawEvent", () => {
  it("round-trips a valid single postback event", () => {
    const ev = JSON.parse(fx.webhookBody([fx.postbackEvent({ data: "action=x" })])).events[0];
    const parsed = parseRawEvent(ev);
    expect(parsed.kind).toBe("postback");
  });
  it("round-trips a valid text message event", () => {
    const ev = JSON.parse(fx.webhookBody([fx.textMessageEvent({ text: "hi" })])).events[0];
    expect(parseRawEvent(ev).kind).toBe("message");
  });
  it("throws on null / non-object input", () => {
    expect(() => parseRawEvent(null)).toThrow();
    expect(() => parseRawEvent("nope")).toThrow();
    expect(() => parseRawEvent(42)).toThrow();
  });
  it("throws when the type field is missing", () => {
    expect(() => parseRawEvent({ webhookEventId: "e1", timestamp: 1 })).toThrow();
  });
  it("throws when webhookEventId is missing", () => {
    expect(() => parseRawEvent({ type: "message", timestamp: 1 })).toThrow();
  });
  it("throws when timestamp is the wrong type", () => {
    expect(() =>
      parseRawEvent({ type: "message", webhookEventId: "e1", timestamp: "x" }),
    ).toThrow();
  });
});
