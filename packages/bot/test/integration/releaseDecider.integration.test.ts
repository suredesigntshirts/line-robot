import {
  createGroup,
  createListing,
  createUserWithIdentity,
  type Db,
  dbFromPool,
  getExclusivity,
  openExclusivityWindow,
} from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ReleaseDecider } from "../../src/core/handlers/releaseDecider.js";
import type { Clock } from "../../src/core/ports/runtime.js";

// Stage 6 INC-B4 — the three exclusivity-lapse release-prompt decisions, end-to-end against a real
// Postgres (Docker). Each asserts the persisted db transition AND the (mocked) reply text:
//  - release-publicly      → a publish_consent row exists (LEGAL-02) + releaseState=released
//  - release-to-other-groups → listing_mandate='open' + releaseState=released
//  - extend                → expires_at bumped by the source group's window (back to held)
// The clock is injected (deterministic `now`) so the extend's new expiry is exact.

const CONTAINER = "linerobot-bot-release-it";
const NOW = new Date("2026-06-15T00:00:00Z");
const clock: Clock = { now: () => NOW.getTime() };

let pool: pg.Pool;
let db: Db;
let decider: ReleaseDecider;
let owner: string;
let posterLineId: string;
let groupId: string;

const baseListing = {
  dealType: "sale" as const,
  saleStage: "available" as const,
  titleDeedType: "chanote" as const,
  propertyType: "house" as const,
  province: "เชียงใหม่",
};

/** A claimed, group-sourced listing with a lapsed exclusivity window. The claimant's LINE identity is
 * `posterLineId` — the same id the postback resolves to a pg user for the consent grant. */
async function lapsedListing(): Promise<string> {
  const listing = await createListing(db, {
    listing: {
      ...baseListing,
      ownerUserId: owner,
      claimedByUserId: await claimantId(),
      sourceGroupId: groupId,
      priceThb: 4_000_000,
    },
    content: [{ lang: "th", headline: "บ้านลาส์", description: "x", generatedBy: "human" }],
  });
  await openExclusivityWindow(db, listing.id, new Date("2026-06-10T00:00:00Z")); // expired vs NOW
  return listing.id;
}

let _claimant: string | undefined;
async function claimantId(): Promise<string> {
  if (_claimant === undefined) {
    _claimant = (
      await createUserWithIdentity(
        db,
        { displayName: "Poster" },
        { provider: "line", providerSubject: posterLineId, verifiedAt: new Date() },
      )
    ).id;
  }
  return _claimant;
}

beforeAll(async () => {
  const connectionString = await startPostgresLocal(CONTAINER);
  pool = new pg.Pool({ connectionString, max: 2 });
  db = dbFromPool(pool);
  await migrateDb(db);
  decider = new ReleaseDecider({ db, clock });

  posterLineId = "Uposter-release";
  owner = (
    await createUserWithIdentity(
      db,
      { displayName: "Owner" },
      { provider: "line", providerSubject: "U-release-owner", verifiedAt: new Date() },
    )
  ).id;
  groupId = (
    await createGroup(db, {
      lineGroupId: "C-release",
      name: "Release group",
      exclusivityWindowDays: 5,
    })
  ).id;
});

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("ReleaseDecider.releasePublicly", () => {
  it("grants publish consent + releases the window, with a Thai confirmation", async () => {
    const id = await lapsedListing();
    const reply = await decider.releasePublicly(posterLineId, id);

    // releaseState → released.
    expect((await getExclusivity(db, id))?.releaseState).toBe("released");
    // A publish_consent row now exists (LEGAL-02) → the public site surfaces it.
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM publish_consent WHERE listing_id = $1 AND deletion_requested_at IS NULL",
      [id],
    );
    expect(rows[0].n).toBe(1);
    expect(reply[0]?.type).toBe("text");
    expect(reply[0]).toMatchObject({ type: "text" });
    expect((reply[0] as { text: string }).text).toContain("เผยแพร่สู่สาธารณะ");
  });

  it("is IDEMPOTENT: a double-tap on an already-released window grants NO second consent row", async () => {
    const id = await lapsedListing();
    await decider.releasePublicly(posterLineId, id); // first release → 1 consent row
    // A second poster tap on the already-released window: must short-circuit, NOT re-grant consent
    // (grantPublishConsent is a bare INSERT — without the released-guard this would write a 2nd row).
    const second = await decider.releasePublicly(posterLineId, id);
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM publish_consent WHERE listing_id = $1",
      [id],
    );
    expect(rows[0].n).toBe(1); // STILL exactly one — the double-tap was a no-op
    expect((second[0] as { text: string }).text).toContain("เผยแพร่ไปแล้ว"); // already-released msg
  });
});

describe("ReleaseDecider.releaseToOtherGroups", () => {
  it("drops the group-exclusive mandate to 'open' + releases the window", async () => {
    const id = await lapsedListing();
    const reply = await decider.releaseToOtherGroups(posterLineId, id);

    const { rows } = await pool.query("SELECT listing_mandate FROM listing WHERE id = $1", [id]);
    expect(rows[0].listing_mandate).toBe("open");
    expect((await getExclusivity(db, id))?.releaseState).toBe("released");
    // It does NOT grant publish consent (release-to-other-groups is not a public publish).
    const { rows: consent } = await pool.query(
      "SELECT count(*)::int AS n FROM publish_consent WHERE listing_id = $1",
      [id],
    );
    expect(consent[0].n).toBe(0);
    expect((reply[0] as { text: string }).text).toContain("เปิดให้กลุ่มอื่น");
  });

  it("is IDEMPOTENT: a re-tap on an already-released window is a no-op (already-released message)", async () => {
    const id = await lapsedListing();
    await decider.releaseToOtherGroups(posterLineId, id); // released, mandate='open'
    const second = await decider.releaseToOtherGroups(posterLineId, id);
    // Still released + open; the second tap short-circuits with the already-released message.
    expect((await getExclusivity(db, id))?.releaseState).toBe("released");
    const { rows } = await pool.query("SELECT listing_mandate FROM listing WHERE id = $1", [id]);
    expect(rows[0].listing_mandate).toBe("open");
    expect((second[0] as { text: string }).text).toContain("เผยแพร่ไปแล้ว");
  });
});

describe("ReleaseDecider.extend", () => {
  it("bumps expires_at by the source group's window (5 days from now), staying held", async () => {
    const id = await lapsedListing();
    const reply = await decider.extend(posterLineId, id);

    const row = await getExclusivity(db, id);
    // 5 days from the injected NOW.
    const expected = new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000);
    expect(row?.expiresAt.toISOString()).toBe(expected.toISOString());
    expect(row?.releaseState).toBe("held"); // extend does NOT release
    expect((reply[0] as { text: string }).text).toContain("ต่อเวลา");
  });

  it("refuses to extend an already-released window (no false success)", async () => {
    const id = await lapsedListing();
    await decider.releasePublicly(posterLineId, id); // now released
    const before = await getExclusivity(db, id);
    const reply = await decider.extend(posterLineId, id);
    // The expiry is unchanged and the message says it's already released.
    expect((await getExclusivity(db, id))?.expiresAt.toISOString()).toBe(
      before?.expiresAt.toISOString(),
    );
    expect((reply[0] as { text: string }).text).toContain("เผยแพร่ไปแล้ว");
  });
});

describe("ReleaseDecider — missing exclusivity row (the 0-row guard)", () => {
  it("does NOT report false success when no window exists", async () => {
    // A claimed listing with NO exclusivity row.
    const created = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: owner,
        claimedByUserId: await claimantId(),
        sourceGroupId: groupId,
        priceThb: 2_000_000,
      },
      content: [{ lang: "th", headline: "ไม่มีหน้าต่าง", description: "x", generatedBy: "human" }],
    });
    const reply = await decider.releasePublicly(posterLineId, created.id);
    expect((reply[0] as { text: string }).text).toContain("ไม่พบช่วงเวลาเฉพาะกลุ่ม");
    // No consent was granted (the guard short-circuited before any write).
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM publish_consent WHERE listing_id = $1",
      [created.id],
    );
    expect(rows[0].n).toBe(0);
  });
});
