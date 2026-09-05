import { createUserWithIdentity, type Db, dbFromPool } from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CostLog } from "../../src/cost.ts";
import { runPipeline } from "../../src/run.ts";
import type { StepContext } from "../../src/steps/context.ts";

// ---------------------------------------------------------------------------
// A1 REAL-MODEL acceptance — the 2026-06-15 incident, replayed through the real
// models + Postgres. Reconstructed faithfully from the actual 77-message thread
// (staging conversation user#U810f7671d201fe7ce3ec2ef49ab8d16a): 5 distinct
// listings, each = (optional map pin) + text + photo burst. Only #1 and #2 carry
// a coordinate pin; #4's map is a coordinate-less short link ([MAP 2]); #3 and #5
// have no pin. Phone numbers anonymized; coordinates are the real pins (already
// public in handbook/archive/plans/23-ingestion-pipeline-audit).
//
// THE BUG: conversation-level geoHints were sprayed onto every segment, so #3/#4/#5
// inherited #2's pin → geo-blocked → merged. A1 binds each segment to ITS OWN pin
// (segmenter mapIndex → coordByMapIndex), so the correct outcome is: #1→pin1,
// #2→pin2, #3/#4/#5→null, and NO two listings share a coordinate.
//
// Skipped unless ANTHROPIC_API_KEY is present; costs a few cents. Run deliberately:
// `npm run test:integration -w @line-robot/pipeline`. Real-model output varies
// run-to-run — D21-advisory; the no-shared-coordinate invariant is the A1 contract.
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

const PIN_1 = "18.72989755,98.96882414"; // Mooban Wangtan ([MAP 0])
const PIN_2 = "18.82638337,99.05647534"; // บ้านหลักชัย, สันนาเม็ง ([MAP 1])

// Faithful reconstruction (timestamps trimmed to minutes; image bursts abbreviated to 2 markers
// each — the segmenter attributes by marker, not by count). [MAP 2] is the coordinate-less short
// link for listing #4. Listing #3 (the แม่โจ้ dorm — the real survivor) and #5 have no pin.
const TRANSCRIPT = [
  "[10:01:56] [MAP 0]",
  "[10:01:56] Mooban Wangtan",
  "[10:01:56] 2.3 Mil",
  "[10:01:57] I already told them 1.7 mil",
  "[10:01:57] If they accept, will go check tomorrow",
  "[10:01:57] [IMG 0] property",
  "[10:01:58] [IMG 1] property",
  "[10:02:18] [MAP 1]",
  "[10:02:19] ขายฝากบ้าน2 ชั้น ในโครงการบ้านหลักชัย ตรงข้ามกาดแม่กวง ต.สันนาเม็ง อ.สันทราย จ.เชียงใหม่ เนื้อที่ 30 ตรว 3 นอน 2 น้ำ ยอด 1,200,000 บาท ดอก 1.25% หักล่วงหน้า 3 เดือน",
  "[10:02:19] [IMG 2] property",
  "[10:02:20] [IMG 3] property",
  "[10:03:06] 🔥 ขายหอพัก 2 ชั้น ใกล้ ม.แม่โจ้ ราคาพิเศษ จาก 15.8 ล้านบาท เหลือเพียง 13.8 มีทั้งหมด 39 ห้อง เฟอร์นิเจอร์ครบทุกห้อง พื้นที่รวมกว่า 700 ตารางวา พร้อมผู้เช่าเต็มทุกห้อง",
  "[10:03:06] [IMG 4] property",
  "[10:03:07] [IMG 5] property",
  "[10:03:21] [MAP 2]",
  "[10:03:21] ทาวน์โฮมในโครงการอรสิริน 6 เนื้อที่ 31 ตรว. ขอยอด 1,300,000 ดอกเบี้ย 1.25% หัก 4 เดือน ค่าดำเนินการ 5% สัญญา 1 ปี",
  "[10:03:22] [IMG 6] property",
  "[10:03:23] [IMG 7] property",
  "[10:03:38] ขายหอพักย่านบ่อสร้าง 14 ห้อง เต็มทุกห้อง เนื้อที่ 52 ตร.ว. ราคาเพียง 4.8 ล้านบาท (รวมโอน) รายได้ 36,000 บาท/เดือน ทำเลดี ต้นเปา สันกำแพง ใกล้แยกบ่อสร้าง 900 ม. โทร 081-111-1111",
  "[10:03:39] [IMG 8] property",
  "[10:03:40] [IMG 9] property",
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
    await runPipeline(ctx, db, {
      transcript: TRANSCRIPT,
      ownerUserId: owner.id,
      photos: [],
      geoHints: [PIN_1, PIN_2], // conversation-level (segmentation context)
      coordByMapIndex: [PIN_1, PIN_2, null], // [MAP 0]→#1, [MAP 1]→#2, [MAP 2]=short link→null
      contentLang: "th",
    });
    const { rows } = await pool.query(
      `SELECT id, property_type, price_thb::bigint AS price,
              ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lon
       FROM listing ORDER BY price_thb`,
    );
    console.log("incident replay rows:", JSON.stringify(rows, null, 2));
    console.log("incident replay cost:", ctx.costLog.totalUsd().toFixed(4));
  }, 240_000);

  afterAll(async () => {
    await pool?.end();
    stopPostgresLocal(CONTAINER);
  });

  it("preserves all 5 distinct listings (ground truth = 5; the bug merged them to 1)", async () => {
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM listing");
    expect(rows[0].n).toBeGreaterThanOrEqual(5);
  });

  it("A1: no listing inherits another's pin — no coordinate is shared across listings", async () => {
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM (
         SELECT ST_AsText(geom) FROM listing WHERE geom IS NOT NULL
         GROUP BY ST_AsText(geom) HAVING count(*) > 1
       ) shared`,
    );
    expect(rows[0].n).toBe(0); // pre-A1: pin #2 lands on ≥2 rows → > 0
  });

  // Non-vacuous: with the authoritative bind, each pinned listing must carry EXACTLY its own pin
  // (proves the model attributed [MAP 0]→#1, [MAP 1]→#2, and the bind applied — not "all null").
  it("A1: each pinned listing persists exactly its own pin (#1→pin1, #2→pin2)", async () => {
    const countAt = async (lat: number, lon: number) => {
      const { rows } = await pool.query(
        `SELECT count(*)::int AS n FROM listing
         WHERE abs(ST_Y(geom::geometry) - $1) < 1e-5 AND abs(ST_X(geom::geometry) - $2) < 1e-5`,
        [lat, lon],
      );
      return rows[0].n;
    };
    expect(await countAt(18.72989755, 98.96882414)).toBe(1); // PIN_1 on exactly one row
    expect(await countAt(18.82638337, 99.05647534)).toBe(1); // PIN_2 on exactly one row
  });
});
