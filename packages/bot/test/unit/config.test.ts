import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@aws-lambda-powertools/parameters/ssm", () => ({
  getParameter: vi.fn(),
}));

import { getParameter } from "@aws-lambda-powertools/parameters/ssm";
import { loadEnv, loadReadApiEnv, loadSecrets } from "../../src/adapters/config/config.js";

const validEnv = {
  MESSAGES_TABLE: "messages",
  IDEMPOTENCY_TABLE: "idempotency",
  ARCHIVE_BUCKET: "bucket",
  CHANNEL_SECRET_PARAM: "/line/secret",
  CHANNEL_ACCESS_TOKEN_PARAM: "/line/token",
} as unknown as NodeJS.ProcessEnv;

const readApiValidEnv = {
  CATALOG_TABLE: "catalog",
  ARCHIVE_BUCKET: "bucket",
  LIFF_CHANNEL_ID: "2010312345",
} as unknown as NodeJS.ProcessEnv;

describe("loadEnv", () => {
  it("parses a valid environment", () => {
    expect(loadEnv(validEnv)).toMatchObject({
      MESSAGES_TABLE: "messages",
      CHANNEL_SECRET_PARAM: "/line/secret",
    });
  });

  it("throws when required variables are missing", () => {
    expect(() => loadEnv({} as NodeJS.ProcessEnv)).toThrow();
  });
});

describe("loadReadApiEnv", () => {
  it("parses the scoped read-api environment", () => {
    expect(loadReadApiEnv(readApiValidEnv)).toEqual({
      CATALOG_TABLE: "catalog",
      ARCHIVE_BUCKET: "bucket",
      LIFF_CHANNEL_ID: "2010312345",
    });
  });

  it("throws when a required scoped variable is missing", () => {
    expect(() => loadReadApiEnv({ CATALOG_TABLE: "catalog" } as NodeJS.ProcessEnv)).toThrow();
  });

  it("ignores extra env vars the read-api role cannot use", () => {
    const withNoise = {
      ...readApiValidEnv,
      MESSAGES_TABLE: "m",
      QUEUE_URL: "q",
    } as NodeJS.ProcessEnv;
    expect(loadReadApiEnv(withNoise)).not.toHaveProperty("MESSAGES_TABLE");
  });
});

describe("loadSecrets", () => {
  beforeEach(() => {
    vi.mocked(getParameter).mockReset();
  });

  it("loads the channel secret and access token from SSM", async () => {
    vi.mocked(getParameter).mockResolvedValueOnce("the-secret").mockResolvedValueOnce("the-token");

    const secrets = await loadSecrets(loadEnv(validEnv));

    expect(secrets).toEqual({ channelSecret: "the-secret", channelAccessToken: "the-token" });
    expect(getParameter).toHaveBeenCalledWith("/line/secret", { decrypt: true, maxAge: 300 });
  });

  it("throws when a parameter is missing", async () => {
    vi.mocked(getParameter).mockResolvedValue(undefined);
    await expect(loadSecrets(loadEnv(validEnv))).rejects.toThrow(/Missing/);
  });
});
