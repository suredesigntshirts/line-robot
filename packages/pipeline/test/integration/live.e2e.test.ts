import { createUserWithIdentity, type Db, dbFromPool } from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CostLog } from "../../src/cost.ts";
import { runPipeline } from "../../src/run.ts";
import type { StepContext } from "../../src/steps/context.ts";
import { specCatalog } from "../../src/synthetic/catalog.ts";
import { MESSY_GROUP_CHAT } from "../../src/synthetic/chaosProfile.ts";
import { generateCase } from "../../src/synthetic/generator.ts";

// ---------------------------------------------------------------------------
// LIVE end-to-end: real Anthropic models + real Postgres — the exact path the
// PIPELINE_V2 flip exercises in staging (minus LINE + S3). Skipped unless an
// API key is present; costs a few cents per run. This catches what fakes
// cannot: strict-structured-output acceptance of our schemas, model output
// drift, prompt-cache behavior.
// ---------------------------------------------------------------------------

const HAS_KEY = (() => {
  try {
    process.loadEnvFile(new URL("../../../../.env", import.meta.url).pathname);
  } catch {
    /* fine */
  }
  return process.env.ANTHROPIC_API_KEY !== undefined;
})();

const CONTAINER = "linerobot-live-e2e";

describe.skipIf(!HAS_KEY)("LIVE e2e: messy chat → real models → Postgres", () => {
  let pool: pg.Pool;
  let db: Db;

  beforeAll(async () => {
    const connectionString = await startPostgresLocal(CONTAINER);
    pool = new pg.Pool({ connectionString, max: 2 });
    db = dbFromPool(pool);
    await migrateDb(db);
  });

  afterAll(async () => {
    await pool?.end();
    stopPostgresLocal(CONTAINER);
  });

  it("lands a messy two-property dump in Postgres with sane fields", async () => {
    const [{ default: Anthropic }, { AnthropicStepLlm }] = await Promise.all([
      import("@anthropic-ai/sdk"),
      import("../../src/adapters/anthropicStepLlm.ts"),
    ]);
    const ctx: StepContext = {
      llm: new AnthropicStepLlm(new Anthropic()),
      costLog: new CostLog(),
      mode: "sync",
    };

    const specs = specCatalog(24).slice(1, 3); // rental condo + urgent house
    const messy = generateCase(specs, {
      ...MESSY_GROUP_CHAT,
      seed: 777,
      duplicateRepost: { enabled: false, priceDriftPct: 0, contactDrift: false },
    });

    const owner = await createUserWithIdentity(
      db,
      { displayName: "live-e2e" },
      { provider: "line", providerSubject: "live-e2e", verifiedAt: new Date() },
    );

    const outcome = await runPipeline(ctx, db, {
      transcript: messy.transcript,
      ownerUserId: owner.id,
      photos: [],
      geoHints: [],
      contentLang: "th",
    });

    console.log("live e2e outcome:", JSON.stringify(outcome, null, 2));
    console.log(
      "live e2e cost:",
      ctx.costLog.totalUsd().toFixed(4),
      "cacheHit:",
      ctx.costLog.sawCacheHit(),
    );

    // Both properties extracted and persisted (allow 1 drop under heavy chaos).
    expect(outcome.listings.length).toBeGreaterThanOrEqual(specs.length - 1);
    const { rows } = await pool.query(
      `SELECT deal_type, property_type, price_thb::bigint AS price, urgency,
              (SELECT count(*)::int FROM listing_content c WHERE c.listing_id = l.id) AS content_rows
       FROM listing l`,
    );
    expect(rows.length).toBe(outcome.listings.length);
    for (const row of rows) {
      expect(["sale", "rent"]).toContain(row.deal_type);
      expect(row.content_rows).toBeGreaterThanOrEqual(1); // th always; en when translate succeeded
    }
    // The urgent house's quick-sale signal survived the chaos into the DB.
    expect(rows.some((r) => r.urgency === "quick_sale")).toBe(true);
  }, 240_000);
});
