import type { ScheduledHandler, SQSHandler } from "aws-lambda";
import { afterEach, describe, expect, it } from "vitest";
import { loadReadApiEnv } from "../../src/adapters/config/config.js";

// A5 deliverable: every production Lambda that needs Postgres must fail fast at boot when
// DATABASE_URL is absent — a missing connection string should crash the cold start loudly, not
// surface as a confusing mid-request error (or, worse, a silent fallback). This test ties that
// requirement to the four entry points so a future refactor can't quietly drop a guard.
//
// sweep / processor / reminder carry a hand-rolled `if (env.DATABASE_URL === undefined) throw` inside
// their composition root (which `lazySingleton` runs on first invocation), so we drive them by
// invoking the handler with a valid env minus DATABASE_URL and asserting it rejects. read-api instead
// makes DATABASE_URL required in its scoped Zod schema (loadReadApiEnv), so it is asserted directly.

// A full, valid bot env — everything the shared EnvSchema requires — EXCEPT DATABASE_URL.
const envWithoutDatabaseUrl = {
  MESSAGES_TABLE: "messages",
  IDEMPOTENCY_TABLE: "idempotency",
  ARCHIVE_BUCKET: "archive",
  CATALOG_TABLE: "catalog",
  QUEUE_URL: "queue",
  CHANNEL_SECRET_PARAM: "/line/secret",
  CHANNEL_ACCESS_TOKEN_PARAM: "/line/token",
  ANTHROPIC_API_KEY_PARAM: "/anthropic/key",
} as const;

const savedEnv = { ...process.env };
afterEach(() => {
  process.env = { ...savedEnv };
});

/** Replace process.env with a valid bot env that omits DATABASE_URL. */
function setEnvWithoutDatabaseUrl(): void {
  process.env = { ...envWithoutDatabaseUrl } as NodeJS.ProcessEnv;
}

describe("boot fail-fast on missing DATABASE_URL", () => {
  it("the sweep Lambda rejects at boot", async () => {
    setEnvWithoutDatabaseUrl();
    const { handler } = await import("../../src/lambda/sweep.js");
    await expect((handler as ScheduledHandler)({} as never, {} as never, () => {})).rejects.toThrow(
      /DATABASE_URL/,
    );
  });

  it("the processor Lambda rejects at boot", async () => {
    setEnvWithoutDatabaseUrl();
    const { handler } = await import("../../src/lambda/processor.js");
    await expect(
      (handler as SQSHandler)({ Records: [] } as never, {} as never, () => {}),
    ).rejects.toThrow(/DATABASE_URL/);
  });

  it("the reminder Lambda rejects at boot", async () => {
    setEnvWithoutDatabaseUrl();
    const { handler } = await import("../../src/lambda/reminder.js");
    await expect((handler as ScheduledHandler)({} as never, {} as never, () => {})).rejects.toThrow(
      /DATABASE_URL/,
    );
  });

  it("the read-api Lambda env schema requires DATABASE_URL", () => {
    // read-api's cold start calls loadReadApiEnv(), whose schema makes DATABASE_URL required — so a
    // missing value fails the parse before a request is served (vs 500ing every request).
    const { DATABASE_URL: _omit, ...withoutDb } = {
      CATALOG_TABLE: "catalog",
      ARCHIVE_BUCKET: "archive",
      LIFF_CHANNEL_ID: "2010312345",
      DATABASE_URL: "postgres://u:p@host/db",
    };
    expect(() => loadReadApiEnv(withoutDb as NodeJS.ProcessEnv)).toThrow();
  });
});
