import {
  addMembership,
  addRole,
  createGroup,
  createListing,
  createUserWithIdentity,
  type Db,
  ewktPoint,
  grantPublishConsent,
} from "@line-robot/db";
import { isSaleBlockedByDeed, landToSqm, type RoleKind } from "@line-robot/domain";
import type { ListingSpec } from "../synthetic/spec.ts";
import type { SeedIngestor } from "./SeedIngestor.ts";

export interface SeedSummary {
  users: number;
  groups: number;
  listings: number;
  /** Sale listings on no-sale deed types — seeded but flagged for moderation (FIELD-03). */
  moderationFlagged: number;
}

const GROUP_NAMES = ["CNX Brokers รวมพล", "อสังหาเชียงใหม่ ซื้อ-ขาย", "Investors North"];

/** Owners get an `owner` role; every third user is also an approved broker (role spread). */
function roleSpread(index: number): Array<{ kind: RoleKind; approved: boolean }> {
  const roles: Array<{ kind: RoleKind; approved: boolean }> = [{ kind: "owner", approved: false }];
  if (index % 3 === 0) roles.push({ kind: "broker", approved: true });
  if (index % 5 === 0) roles.push({ kind: "investor", approved: index % 2 === 0 });
  return roles;
}

/**
 * Load specs from the ingestors into Postgres: users (deduped by poster
 * name), 3 groups with memberships, listings with content/satellites.
 * Idempotency: seeding is into a FRESH database (dev bootstrap), not a sync.
 */
export async function seed(db: Db, ingestors: SeedIngestor[]): Promise<SeedSummary> {
  const specs: Array<ListingSpec & { source: string }> = [];
  for (const ingestor of ingestors) {
    const fetched = await ingestor.fetchSpecs();
    specs.push(...fetched.map((s) => ({ ...s, source: ingestor.source })));
  }

  const groups = [];
  for (const name of GROUP_NAMES) {
    groups.push(await createGroup(db, { name }));
  }

  const userIdByName = new Map<string, string>();
  const groupIdByUser = new Map<string, string>();
  let userIndex = 0;
  let moderationFlagged = 0;
  let listings = 0;

  for (const spec of specs) {
    let ownerId = userIdByName.get(spec.ownerName);
    if (ownerId === undefined) {
      const user = await createUserWithIdentity(
        db,
        { displayName: spec.ownerName },
        {
          provider: "line",
          providerSubject: `seed-${userIndex}`,
          verifiedAt: new Date("2026-06-01T00:00:00Z"),
          contactValue: spec.phone,
        },
      );
      ownerId = user.id;
      userIdByName.set(spec.ownerName, ownerId);
      for (const role of roleSpread(userIndex)) {
        await addRole(db, {
          userId: ownerId,
          kind: role.kind,
          approvalStatus: role.approved ? "approved" : "none",
        });
      }
      const group = groups[userIndex % groups.length];
      if (group) {
        await addMembership(db, { groupId: group.id, userId: ownerId });
        groupIdByUser.set(ownerId, group.id);
      }
      userIndex += 1;
    }

    const blocked = spec.dealType === "sale" && isSaleBlockedByDeed(spec.titleDeedType);
    if (blocked) moderationFlagged += 1;

    const isRent = spec.dealType === "rent";
    const hasGeom = spec.lat !== 0 || spec.lon !== 0;
    const created = await createListing(db, {
      listing: {
        ownerUserId: ownerId,
        // A listing's source group is one its owner is actually a member of.
        sourceGroupId: groupIdByUser.get(ownerId),
        dealType: spec.dealType,
        saleStage: isRent ? null : "available",
        rentalStatus: isRent ? "available" : null,
        titleDeedType: spec.titleDeedType,
        propertyType: spec.propertyType,
        // Rentals price on listing_rental.monthly_rent; listing.price_thb is sale-only.
        priceThb: isRent ? null : spec.priceThb,
        urgency: spec.urgency,
        province: spec.province,
        amphoe: spec.amphoe,
        tambon: spec.tambon,
        landmark: spec.landmark,
        geom: hasGeom ? ewktPoint(spec.lon, spec.lat) : null,
        landRai: spec.landRai,
        landNgan: spec.landNgan,
        landWah: spec.landWah,
        landSqm:
          spec.landRai !== undefined || spec.landNgan !== undefined || spec.landWah !== undefined
            ? landToSqm(spec.landRai ?? 0, spec.landNgan ?? 0, spec.landWah ?? 0)
            : null,
        floorAreaSqm: spec.floorAreaSqm,
        bedrooms: spec.bedrooms,
        bathrooms: spec.bathrooms,
        extractionSource: "auto",
      },
      content: [
        {
          lang: "th",
          headline: `${spec.dealType === "sale" ? "ขาย" : "ให้เช่า"} ${spec.landmark}`,
          description: `ต.${spec.tambon} อ.${spec.amphoe} จ.${spec.province} (seed:${spec.source})`,
          generatedBy: "human",
        },
      ],
      rental: isRent ? { monthlyRent: spec.priceThb, utilityRateType: "unknown" } : undefined,
      amenities: spec.amenities,
    });
    // Publish opt-in (LEGAL-02/D5): two of every three seeded listings consent, so the
    // public site has data while the consent gate stays visibly exercised. Never consent
    // a deed-blocked sale (FIELD-03) — those sit in moderation, not on the public site.
    if (!blocked && listings % 3 !== 2) {
      await grantPublishConsent(db, created.id, ownerId, "seed-v1");
    }
    listings += 1;
  }

  return { users: userIdByName.size, groups: groups.length, listings, moderationFlagged };
}
