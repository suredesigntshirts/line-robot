// Deterministic seed for the real-backend e2e harness (INC-2). Builds the fixed graph the round-trip
// specs drive against: a test USER, a GROUP, the user as a MEMBER of that group, and four listings
// whose `source_group_id` IS that group — so the api's claim/detail/notes/viewings authz gate
// (`isGroupMember`) admits the user. NO `Date.now()`/`new Date()` for content timestamps: every date is
// PINNED, mirroring the website seed's fixed `updatedAt`, so the viewings upcoming/past split (against
// the harness's FIXED `now`) and any date-bearing render are stable run-to-run.
//
// Returns the ids the specs need (the seeded user's LINE subject is fixed below; the group + each
// listing by role).

import {
  addMembership,
  brokerPreferences,
  createGroup,
  createListing,
  createUserWithIdentity,
  ewktPoint,
  grantPublishConsent,
  listings,
  roles,
} from "@line-robot/db";

/** The LINE subject the stub verifier maps the fixture id-token (`e2e.fixture.id-token`) to — the SAME
 * value the LIFF mock's `getProfile().userId` returns, so the seeded user IS the logged-in caller. The
 * DEFAULT identity (no `loginAs`) — every pre-Stage-6 spec + the static gate stays on this. */
export const SEED_LINE_SUBJECT = "e2e-user";
/** A SECOND user's subject — owns the "claimed by another" listing for the 409-loser path. */
export const OTHER_LINE_SUBJECT = "e2e-other-user";

/** Stage 6 MULTI-IDENTITY (INC-B3). Each role's LINE subject is the value the stub verifier maps its
 * fixture token to (server.mjs) — `loginAs(page, role)` sets the token, the verifier resolves it here.
 *   - MEMBER: in the listing's group but NOT the claimant — may flag interest (D-S6-3).
 *   - BROKER: an `approved` broker role + a `broker_preference` row — may submit quotes (D10, vetted).
 * The ADMIN identity (the `admin`-role server gate) is deferred to INC-B3b (the admin screens), where a
 * spec drives it — INC-B3's read gates only take the CLAIMANT branch, never the admin one. */
export const MEMBER_LINE_SUBJECT = "e2e-member";
export const BROKER_LINE_SUBJECT = "e2e-broker";

const SUTHEP = { lon: 98.9525, lat: 18.7953 };
const PINNED = (iso) => new Date(iso);

/** N photo media rows (kind=photo) with thumb keys so detail/gallery render. The harness's fake-S3
 * presign serves a real PNG for any `derivatives/*` key, so each thumb resolves to a decodable image. */
const photos = (prop, n) =>
  Array.from({ length: n }, (_, i) => {
    const nn = String(i + 1).padStart(2, "0");
    return {
      s3Key: `originals/${prop}/${nn}.jpg`,
      thumbKey: `derivatives/${prop}/${nn}.jpg`,
      kind: "photo",
      heroIndex: i,
    };
  });

/** Seed the fixed graph; returns the ids the specs reference. */
export async function seed(db) {
  // --- users + group + membership (the authz spine) ------------------------
  const user = await createUserWithIdentity(
    db,
    { displayName: "ผู้ทดสอบ" },
    {
      provider: "line",
      providerSubject: SEED_LINE_SUBJECT,
      verifiedAt: PINNED("2026-01-01T00:00:00Z"),
    },
  );
  const other = await createUserWithIdentity(
    db,
    { displayName: "สมาชิกอีกคน" },
    {
      provider: "line",
      providerSubject: OTHER_LINE_SUBJECT,
      verifiedAt: PINNED("2026-01-01T00:00:00Z"),
    },
  );
  // Stage 6 multi-identity seeds (INC-B3): a group MEMBER (not the claimant) + a vetted BROKER. (The
  // admin identity is deferred to INC-B3b.)
  const member = await createUserWithIdentity(
    db,
    { displayName: "สมาชิกกลุ่ม" },
    {
      provider: "line",
      providerSubject: MEMBER_LINE_SUBJECT,
      verifiedAt: PINNED("2026-01-01T00:00:00Z"),
    },
  );
  const broker = await createUserWithIdentity(
    db,
    { displayName: "นายหน้าตรวจสอบแล้ว" },
    {
      provider: "line",
      providerSubject: BROKER_LINE_SUBJECT,
      verifiedAt: PINNED("2026-01-01T00:00:00Z"),
    },
  );

  const group = await createGroup(db, { lineGroupId: "C-e2e-group", name: "กลุ่มทดสอบเชียงใหม่" });
  // user/other/member are all group members — the gate admits each to the group's listings (the 409
  // path needs `other` to already hold the claim; the test user must be a member to reach the claim
  // attempt; `member` is a NON-owner member who can flag interest — D-S6-3).
  await addMembership(db, { groupId: group.id, userId: user.id });
  await addMembership(db, { groupId: group.id, userId: other.id });
  await addMembership(db, { groupId: group.id, userId: member.id });

  // BROKER vetting: an APPROVED broker role + a matching-preferences row (the `matchVettedUsers` /
  // `requireVetted` source of truth — seeded directly because the public `applyForRole` only creates a
  // PENDING row; the quote endpoint's vetted gate needs `approved`).
  await db.insert(roles).values({ userId: broker.id, kind: "broker", approvalStatus: "approved" });
  await db.insert(brokerPreferences).values({
    userId: broker.id,
    provinces: ["เชียงใหม่"],
    propertyTypes: ["house", "condo"],
    priceBandIds: [],
  });

  const base = {
    sourceGroupId: group.id,
    titleDeedType: "chanote",
    province: "เชียงใหม่",
    amphoe: "เมืองเชียงใหม่",
    tambon: "สุเทพ",
    geom: ewktPoint(SUTHEP.lon, SUTHEP.lat),
  };

  // (a) UNCLAIMED, claimable — drives claim → publish / keep-private. ownerUserId = the pipeline
  //     pseudo-owner; claimedByUserId stays NULL until the test claims it.
  const claimable = await createListing(db, {
    listing: {
      ...base,
      ownerUserId: user.id,
      dealType: "sale",
      saleStage: "available",
      propertyType: "house",
      priceThb: 3_900_000,
      bedrooms: 3,
      bathrooms: 2,
    },
    content: [
      {
        lang: "th",
        headline: "บ้านเดี่ยวรอการอ้างสิทธิ์ ใกล้ดอยสุเทพ",
        description: "บ้านสวยพร้อมอยู่ ใกล้มหาวิทยาลัยเชียงใหม่ เดินทางสะดวก เหมาะแก่การลงทุน",
        generatedBy: "human",
      },
    ],
    media: photos("claimable", 6),
  });

  // (b) Already CLAIMED BY the test user — the CRM surface (detail/save/viewings/notes/edit).
  const mine = await createListing(db, {
    listing: {
      ...base,
      ownerUserId: user.id,
      claimedByUserId: user.id,
      claimedAt: PINNED("2026-02-01T00:00:00Z"),
      dealType: "sale",
      saleStage: "available",
      propertyType: "house",
      priceThb: 4_500_000,
      bedrooms: 4,
      bathrooms: 3,
    },
    content: [
      {
        lang: "th",
        headline: "บ้านเดี่ยวสี่ห้องนอน ที่อ้างสิทธิ์แล้ว",
        description: "บ้านพร้อมอยู่ ทำเลดี ใกล้แหล่งชุมชน เดินทางสะดวก สภาพดีมาก",
        generatedBy: "human",
      },
    ],
    media: photos("mine", 6),
  });

  // (c) Claimed by ANOTHER user — the 409-loser path (the test user is a group member, so the gate
  //     admits them to the claim attempt, but the optimistic lock is already taken → already_claimed).
  const claimedByOther = await createListing(db, {
    listing: {
      ...base,
      ownerUserId: other.id,
      claimedByUserId: other.id,
      claimedAt: PINNED("2026-02-01T00:00:00Z"),
      dealType: "sale",
      saleStage: "available",
      propertyType: "condo",
      priceThb: 2_100_000,
      bedrooms: 1,
      bathrooms: 1,
    },
    content: [
      {
        lang: "th",
        headline: "คอนโดที่ถูกอ้างสิทธิ์โดยสมาชิกอีกคน",
        description: "คอนโดใจกลางเมือง เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ วิวสวย",
        generatedBy: "human",
      },
    ],
    media: photos("other", 6),
  });

  // (d) A baseline-PUBLISHED listing claimed by the test user — proves keep-private actually WITHDRAWS
  //     an existing consent (not just a no-op on a never-published listing).
  const published = await createListing(db, {
    listing: {
      ...base,
      ownerUserId: user.id,
      claimedByUserId: user.id,
      claimedAt: PINNED("2026-02-01T00:00:00Z"),
      dealType: "sale",
      saleStage: "available",
      propertyType: "house",
      priceThb: 5_200_000,
      bedrooms: 3,
      bathrooms: 2,
    },
    content: [
      {
        lang: "th",
        headline: "บ้านที่เผยแพร่สาธารณะแล้ว",
        description: "บ้านเดี่ยวเผยแพร่บนเว็บไซต์สาธารณะ พร้อมขาย ทำเลดี เดินทางสะดวก",
        generatedBy: "human",
      },
    ],
    media: photos("published", 6),
  });
  await grantPublishConsent(db, published.id, user.id, "v1");

  // (e) A SALE listing claimed by the test user, pre-flagged `quick_sale` (Stage 6, D10) — the quote
  //     round-trip's target: a vetted broker may submit a quote against it (a non-quick-sale listing
  //     409s `not_quick_sale`). Seeding `urgency='quick_sale'` lets the quote spec run independently of
  //     the quick-sale-toggle spec; the toggle spec proves the toggle persists via its own listing.
  const quickSale = await createListing(db, {
    listing: {
      ...base,
      ownerUserId: user.id,
      claimedByUserId: user.id,
      claimedAt: PINNED("2026-02-01T00:00:00Z"),
      dealType: "sale",
      saleStage: "available",
      urgency: "quick_sale",
      propertyType: "house",
      priceThb: 6_800_000,
      bedrooms: 4,
      bathrooms: 3,
    },
    content: [
      {
        lang: "th",
        headline: "บ้านเดี่ยวขายด่วน ราคาต่อรองได้",
        description: "บ้านขายด่วน เจ้าของต้องการเงินสด พร้อมโอน ทำเลดี ใกล้ตัวเมือง",
        generatedBy: "human",
      },
    ],
    media: photos("quicksale", 6),
  });

  // (f) A SALE listing claimed by the test user, NOT yet quick-sale — the quick-sale TOGGLE round-trip's
  //     target (the owner toggles it on; a broker quote then succeeds, proving the urgency persisted).
  const toToggle = await createListing(db, {
    listing: {
      ...base,
      ownerUserId: user.id,
      claimedByUserId: user.id,
      claimedAt: PINNED("2026-02-01T00:00:00Z"),
      dealType: "sale",
      saleStage: "available",
      propertyType: "house",
      priceThb: 4_200_000,
      bedrooms: 3,
      bathrooms: 2,
    },
    content: [
      {
        lang: "th",
        headline: "บ้านเดี่ยวพร้อมขาย รอทำขายด่วน",
        description: "บ้านสภาพดี ทำเลดี เจ้าของพร้อมเจรจา เหมาะแก่การลงทุน",
        generatedBy: "human",
      },
    ],
    media: photos("totoggle", 6),
  });

  // Pin freshness so any date-bearing render is deterministic (mirrors the website seed).
  await db.update(listings).set({ updatedAt: PINNED("2026-05-01T00:00:00Z") });

  return {
    userId: user.id,
    otherUserId: other.id,
    memberUserId: member.id,
    brokerUserId: broker.id,
    groupId: group.id,
    listings: {
      claimable: claimable.id,
      mine: mine.id,
      claimedByOther: claimedByOther.id,
      published: published.id,
      quickSale: quickSale.id,
      toToggle: toToggle.id,
    },
  };
}
