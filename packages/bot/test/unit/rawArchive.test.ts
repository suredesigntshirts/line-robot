import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it } from "vitest";
import { S3RawArchive } from "../../src/adapters/s3/rawArchive.js";

const s3Mock = mockClient(S3Client);

describe("S3RawArchive", () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  it("puts the raw event as JSON under a dated, conversation-scoped key", async () => {
    s3Mock.on(PutObjectCommand).resolves({});
    const archive = new S3RawArchive(new S3Client({ region: "us-east-1" }), "archive-bucket");

    await archive.put("evt-1", { kind: "group", groupId: "Cg" }, { hello: "world" });

    const calls = s3Mock.commandCalls(PutObjectCommand);
    expect(calls).toHaveLength(1);
    const input = calls[0]?.args[0].input;
    expect(input?.Bucket).toBe("archive-bucket");
    expect(input?.Key).toMatch(/^raw\/\d{4}\/\d{2}\/\d{2}\/group#Cg\/evt-1\.json$/);
    expect(JSON.parse(String(input?.Body))).toEqual({ hello: "world" });
  });
});
