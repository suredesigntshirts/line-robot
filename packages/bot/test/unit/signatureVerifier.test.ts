import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SignatureVerifier } from "../../src/adapters/line/signatureVerifier.js";

const SECRET = "test-channel-secret";

function sign(body: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(body).digest("base64");
}

describe("SignatureVerifier", () => {
  const verifier = new SignatureVerifier(SECRET);
  const body = JSON.stringify({ destination: "U1", events: [] });

  it("accepts a valid signature", () => {
    expect(verifier.verify(body, sign(body))).toBe(true);
  });

  it("rejects a signature made with the wrong secret", () => {
    expect(verifier.verify(body, sign(body, "wrong-secret"))).toBe(false);
  });

  it("rejects a tampered body", () => {
    const signature = sign(body);
    expect(verifier.verify(`${body} `, signature)).toBe(false);
  });

  it("rejects a missing or empty signature", () => {
    expect(verifier.verify(body, undefined)).toBe(false);
    expect(verifier.verify(body, "")).toBe(false);
  });
});
