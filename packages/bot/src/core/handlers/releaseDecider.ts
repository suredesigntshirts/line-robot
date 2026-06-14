import {
  type Db,
  extendExclusivity,
  findOrCreateUserByIdentity,
  getExclusivity,
  getExclusivityWindowDays,
  grantPublishConsent,
  releaseExclusivity,
  setListingMandate,
} from "@line-robot/db";
import { canExtend, extendedExpiry } from "@line-robot/domain";
import type { OutboundMessage } from "../domain/message.js";
import type { Clock } from "../ports/runtime.js";

// ---------------------------------------------------------------------------
// Stage 6, INC-B4 — the release-prompt postback decisions (D-S6-4). The lapse DM (dealflowSweep) offers
// three choices; tapping one lands in the PostbackRouter, which delegates here. This collaborator owns
// the Postgres transitions (the CatalogAssistant is DynamoDB-only), so it's injected separately. All
// three transitions GUARD on an existing exclusivity row first — a 0-row update must not report false
// success (an INC-B1 review note).
//
//  - release-publicly      → grantPublishConsent (LEGAL-02; appears on the website) + releaseExclusivity
//  - release-to-other-groups → drop the group-exclusive mandate (→ 'open') + releaseExclusivity
//  - extend                → bump expires_at by the source group's window (back to held)
//
// The caller (poster) is a real LINE user; we resolve their pg user via the same find-or-create the
// claim/membership path uses, so consent is attributed to the right account.
// ---------------------------------------------------------------------------

/** The publish-consent version recorded on a release-publicly grant (mirrors the api's value). */
const PUBLISH_CONSENT_VERSION = "v1";

export interface ReleaseDeciderDeps {
  db: Db;
  clock: Clock;
}

/** Fallback window (days) when a listing has no source group (a 1:1-sourced listing) — D-S6-1's default. */
const DEFAULT_WINDOW_DAYS = 7;

export class ReleaseDecider {
  constructor(private readonly deps: ReleaseDeciderDeps) {}

  /** Release publicly: grant publish consent (the listing appears on the public website) + release the
   * exclusivity window. No-op-with-message when no window row exists. */
  async releasePublicly(lineUserId: string, listingId: string): Promise<OutboundMessage[]> {
    const exclusivity = await getExclusivity(this.deps.db, listingId);
    if (exclusivity === undefined) {
      return [{ type: "text", text: "ไม่พบช่วงเวลาเฉพาะกลุ่มของประกาศนี้" }];
    }
    const userId = await this.resolveUser(lineUserId);
    await grantPublishConsent(this.deps.db, listingId, userId, PUBLISH_CONSENT_VERSION);
    await releaseExclusivity(this.deps.db, listingId);
    return [{ type: "text", text: "✅ เผยแพร่สู่สาธารณะแล้ว — ประกาศจะปรากฏบนเว็บไซต์" }];
  }

  /** Release to other groups: drop the group-exclusive mandate (→ 'open') + release the window. No
   * per-target plumbing v1 — the membership gate still controls visibility (D-S6-4). */
  async releaseToOtherGroups(_lineUserId: string, listingId: string): Promise<OutboundMessage[]> {
    const exclusivity = await getExclusivity(this.deps.db, listingId);
    if (exclusivity === undefined) {
      return [{ type: "text", text: "ไม่พบช่วงเวลาเฉพาะกลุ่มของประกาศนี้" }];
    }
    await setListingMandate(this.deps.db, listingId, "open");
    await releaseExclusivity(this.deps.db, listingId);
    return [{ type: "text", text: "✅ เปิดให้กลุ่มอื่นแล้ว" }];
  }

  /** Extend the window: bump expires_at by the window (back to held). Refuses an already-released
   * window (canExtend) and a missing window row — neither should report a false success. */
  async extend(_lineUserId: string, listingId: string): Promise<OutboundMessage[]> {
    const exclusivity = await getExclusivity(this.deps.db, listingId);
    if (exclusivity === undefined) {
      return [{ type: "text", text: "ไม่พบช่วงเวลาเฉพาะกลุ่มของประกาศนี้" }];
    }
    if (!canExtend(exclusivity.releaseState)) {
      return [{ type: "text", text: "ประกาศนี้เผยแพร่ไปแล้ว ไม่สามารถต่อเวลาได้" }];
    }
    const windowDays =
      (await getExclusivityWindowDays(this.deps.db, listingId)) ?? DEFAULT_WINDOW_DAYS;
    const newExpiry = extendedExpiry(new Date(this.deps.clock.now()), windowDays);
    await extendExclusivity(this.deps.db, listingId, newExpiry);
    return [{ type: "text", text: `✅ ต่อเวลาเฉพาะกลุ่มเดิมอีก ${windowDays} วันแล้ว` }];
  }

  /** Resolve the LINE caller to their canonical pg user (the same find-or-create the claim path uses). */
  private async resolveUser(lineUserId: string): Promise<string> {
    const user = await findOrCreateUserByIdentity(this.deps.db, "line", lineUserId, "LINE user");
    return user.id;
  }
}
