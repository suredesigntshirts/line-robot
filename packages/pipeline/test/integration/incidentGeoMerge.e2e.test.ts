import { createUserWithIdentity, type Db, dbFromPool } from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CostLog } from "../../src/cost.ts";
import { runPipeline } from "../../src/run.ts";
import type { StepContext } from "../../src/steps/context.ts";

// ---------------------------------------------------------------------------
// A1 REAL-MODEL acceptance — the 2026-06-15 incident replayed through the real
// models + Postgres. A user dumped 5 distinct listings into one DM; conversation-
// level geoHints were sprayed onto every segment, so listings inherited each
// other's coordinates, geo-blocked, and were merged away.
//
// WHAT CHANGED post-A2 (the conservative-merge guard, already shipped): the
// SILENT DATA LOSS no longer reproduces — A2 downgrades the weak geo-merges to
// new rows + moderation, so the dump now persists as ≥4 distinct rows. What
// REMAINS — and what A1 fixes — is the geo MIS-BIND: a listing still inherits a
// coordinate that belongs to a different listing (here, >1 row ends up carrying
// property #2's pin). That mis-bind is the `it.fails` target below.
//
// Two real far-apart pins fed as geoHints; #1 and #2 carry them as [MAP n]
// markers (mirroring the real sweep, which substitutes URLs → markers and passes
// coords out-of-band). Skipped unless ANTHROPIC_API_KEY is present; costs a few
// cents. Run deliberately: `npm run test:integration -w @line-robot/pipeline`.
// Real-model output varies run-to-run — treat as advisory/diagnostic, not CI.
// ---------------------------------------------------------------------------

const HAS_KEY = (() => {
  try {
    process.loadEnvFile(new URL("../../../../.env", import.meta.url).pathname);
  } catch {
    /* fine */
  }
  return process.env.ANTHROPIC_API_KEY !== undefined;
})();

const CONTAINER = "linerobot-incident-e2e";

// Property #2's pin (§2.1). Pre-A1 the survivor wrongly persisted with this coord.
const PIN_2_LAT = 18.82638337;
const PIN_2_LON = 99.05647534;

// 5 distinct listings; only #1 and #2 carry a pin (as a [MAP n] marker).
const TRANSCRIPT = [
  "[0m] U: ขายบ้านเดี่ยว หมู่บ้านวังตาล สันกำแพง เชียงใหม่ 3 นอน 2 น้ำ 50 ตร.ว. ราคา 2.3 ล้าน [MAP 0]",
  "[2m] U: ขายฝากบ้านหลักชัย ต.สันทราย อ.สันทราย จ.เชียงใหม่ ราคา 1.25 ล้าน [MAP 1]",
  "[4m] U: ขายหอพักใกล้ ม.แม่โจ้ 39 ห้อง ผู้เช่าเต็มทุกห้อง ทำเลดี ราคา 13.8 ล้าน",
  "[6m] U: ขายทาวน์โฮม โครงการอรสิริน 6 เชียงใหม่ 2 นอน 2 น้ำ ราคา 1.3 ล้าน",
  "[8m] U: ขายหอพัก บ่อสร้าง สันกำแพง เชียงใหม่ 14 ห้อง ราคา 4.8 ล้าน",
].join("\n");

describe.skipIf(!HAS_KEY)("A1 live: incident dump (real models)", () => {
  let pool: pg.Pool;
  let db: Db;

  beforeAll(async () => {
    const connectionString = await startPostgresLocal(CONTAINER);
    pool = new pg.Pool({ connectionString, max: 2 });
    db = dbFromPool(pool);
    await migrateDb(db);

    const [{ default: Anthropic }, { AnthropicStepLlm }] = await Promise.all([
      import("@anthropic-ai/sdk"),
      import("../../src/adapters/anthropicStepLlm.ts"),
    ]);
    const ctx: StepContext = {
      llm: new AnthropicStepLlm(new Anthropic()),
      costLog: new CostLog(),
      mode: "sync",
    };
    const owner = await createUserWithIdentity(
      db,
      { displayName: "incident-e2e" },
      { provider: "line", providerSubject: "incident-e2e", verifiedAt: new Date() },
    );
    const outcome = await runPipeline(ctx, db, {
      transcript: TRANSCRIPT,
      ownerUserId: owner.id,
      photos: [],
      geoHints: [`${PIN_2_LAT},${PIN_2_LON}`, "18.72989755,98.96882414"],
      contentLang: "th",
    });
    console.log("incident replay outcome:", JSON.stringify(outcome, null, 2));
    console.log("incident replay cost:", ctx.costLog.totalUsd().toFixed(4));
  }, 240_000);

  afterAll(async () => {
    await pool?.end();
    stopPostgresLocal(CONTAINER);
  });

  it("A2 holds: the dump is NOT silently merged away (≥4 distinct rows persist)", async () => {
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM listing");
    expect(rows[0].n).toBeGreaterThanOrEqual(4);
  });

  // TODO(A1): remove `.fails` once run.ts binds geo per-segment. RED today —
  // listings inherit the sprayed pin, so >1 row carries property #2's coordinate.
  // GREEN after A1 (only property #2 keeps it, or — under A1a — none do).
  it.fails("A1 target: no listing inherits property #2's pin", async () => {
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM listing
       WHERE abs(ST_Y(geom::geometry) - $1) < 1e-5 AND abs(ST_X(geom::geometry) - $2) < 1e-5`,
      [PIN_2_LAT, PIN_2_LON],
    );
    expect(rows[0].n).toBeLessThanOrEqual(1);
  });
});
