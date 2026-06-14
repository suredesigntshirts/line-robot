import {
  type Db,
  type LapsedExclusivity,
  listApprovedVettedUsers,
  listLapsedExclusivity,
  listQuickSaleUnpushed,
  markQuickSalePushed,
  markReleasePromptSent,
} from "@line-robot/db";
import { deriveExclusivityState, isReleasable, matchVettedUsers } from "@line-robot/domain";
import { quickQuoteCard, quoteDeepLink, releasePromptCard } from "../core/handlers/views.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { Clock, Logger } from "../core/ports/runtime.js";

// ---------------------------------------------------------------------------
// Stage 6, INC-B4 — the dealflow sweep (bot app layer; honours the webhook→sweep spine, NO LINE in
// packages/pipeline). Two scheduled passes, FOLDED into an existing scheduled lambda (no new infra):
//
//  1. EXCLUSIVITY-LAPSE RELEASE PROMPT (D-S6-4). Scan the lapsed-but-undecided windows
//     (`listLapsedExclusivity`) and DM the poster a `releasePromptCard` ONCE, guarded by the
//     `held → releasable` transition (`markReleasePromptSent`). The pure domain engine
//     (`deriveExclusivityState`/`isReleasable`) confirms the logical state before we prompt. Ignoring
//     the DM leaves the listing group-private (NO silent auto-release).
//
//  2. QUICK-QUOTE FLEX PUSH (D10/D-S6-6). Scan the un-pushed quick-sale listings
//     (`listQuickSaleUnpushed`), match the APPROVED-VETTED candidates (`matchVettedUsers` over
//     `listApprovedVettedUsers` — the server-side vetted filter is the spec invariant: a push can
//     NEVER reach an unvetted user), and Flex-push each match a `/quote/{id}` deep link. Then
//     `markQuickSalePushed` (the one-shot guard). A null/negative price is skipped (the repo already
//     filters non-null price; we defend in code too).
//
// Every push is best-effort: a failed DM is logged and never fails the sweep (the guard already
// advanced, mirroring `sendClaimInvites` — a transient push failure means that one prompt/quote is
// not retried, the accepted trade for a simple once-guard; the poster can still act in the app).
// ---------------------------------------------------------------------------

export interface DealflowSweepDeps {
  db: Db;
  gateway: LineGateway;
  logger: Logger;
  clock: Clock;
  /** The MINI App base URL (`MINIAPP_URL`). The quick-quote card deep-links to `{miniappUrl}/quote/{id}`;
   * absent → the quick-quote push is skipped (the deep link can't resolve). The lapse-prompt DM carries
   * postback buttons (no deep link), so it runs regardless. */
  miniappUrl?: string;
}

/** Tallies one dealflow run — returned for the Lambda log line and asserted in tests. */
export interface DealflowResult {
  /** Lapsed windows the scan reported. */
  readonly lapsed: number;
  /** Release-prompt DMs this run sent (won the held→releasable guard for). */
  readonly promptsSent: number;
  /** Quick-sale listings the scan reported. */
  readonly quickSale: number;
  /** Quick-sale listings this run pushed (matched ≥1 vetted user + won the push guard). */
  readonly quotePushes: number;
  /** Matched-vetted recipients the quick-quote pushes reached (sum over pushed listings). */
  readonly quoteRecipients: number;
}

/**
 * The dealflow sweep. Pure orchestration over the db + gateway ports — fully unit-testable with fakes.
 * The clock is injected (deterministic `now`; never `Date.now()` in logic).
 */
export class DealflowSweep {
  constructor(private readonly deps: DealflowSweepDeps) {}

  async run(): Promise<DealflowResult> {
    const lapse = await this.runLapsePrompts();
    const quote = await this.runQuickQuotePush();
    const result: DealflowResult = { ...lapse, ...quote };
    this.deps.logger.info("dealflow sweep complete", { ...result });
    return result;
  }

  /**
   * The exclusivity-lapse release prompt. For each lapsed window (the join already filters to a
   * claimant with a LINE identity + a source group), confirm the logical state is `lapsed` via the
   * pure engine, win the `held → releasable` once-guard, then DM the poster the release-prompt card. A
   * lost guard means a prior sweep already prompted — never re-DM. A failed push is logged and does not
   * fail the sweep (the guard already advanced; the poster can still act on the listing in the app).
   */
  private async runLapsePrompts(): Promise<Pick<DealflowResult, "lapsed" | "promptsSent">> {
    const now = new Date(this.deps.clock.now());
    const lapsed = await listLapsedExclusivity(this.deps.db, now);
    if (lapsed.length === 0) {
      return { lapsed: 0, promptsSent: 0 };
    }
    let promptsSent = 0;
    for (const row of lapsed) {
      // Defence-in-depth: the SQL already selects held + expired, but confirm via the pure engine
      // (the single source of truth for the logical state) before we DM — never prompt a non-lapsed row.
      const state = deriveExclusivityState({
        releaseState: "held",
        expiresAt: row.expiresAt,
        hasInterestFlags: false,
        now,
      });
      if (!isReleasable(state)) continue;

      const firstSent = await markReleasePromptSent(this.deps.db, row.listingId);
      if (!firstSent) continue; // already prompted on a prior sweep — never re-DM.

      if (await this.pushReleasePrompt(row)) promptsSent += 1;
    }
    return { lapsed: lapsed.length, promptsSent };
  }

  /** Push one release-prompt DM, best-effort (a failed push is logged, never throws out of the sweep). */
  private async pushReleasePrompt(row: LapsedExclusivity): Promise<boolean> {
    const title = row.headline || row.listingId.slice(0, 8);
    try {
      await this.deps.gateway.push(row.posterLineUserId, [releasePromptCard(row.listingId, title)]);
      this.deps.logger.info("dealflow: release prompt sent", {
        listingId: row.listingId,
        to: row.posterLineUserId,
      });
      return true;
    } catch (error) {
      this.deps.logger.warn("dealflow: release prompt push failed", {
        listingId: row.listingId,
        error: String(error),
      });
      return false;
    }
  }

  /**
   * The quick-quote Flex push. For each un-pushed quick-sale listing, match the approved-vetted
   * candidates (the recipient set is filtered server-side to approved broker/investor users — a push
   * can never reach an unvetted user), push the quote card to each match, then win the once-guard.
   * Skipped when no `miniappUrl` is configured (the `/quote/{id}` deep link can't resolve). A listing
   * with no match is left un-pushed (so it can match once a vetted user is later approved).
   */
  private async runQuickQuotePush(): Promise<
    Pick<DealflowResult, "quickSale" | "quotePushes" | "quoteRecipients">
  > {
    const miniappUrl = this.deps.miniappUrl;
    if (miniappUrl === undefined || miniappUrl === "") {
      return { quickSale: 0, quotePushes: 0, quoteRecipients: 0 };
    }
    const listingsToPush = await listQuickSaleUnpushed(this.deps.db);
    if (listingsToPush.length === 0) {
      return { quickSale: 0, quotePushes: 0, quoteRecipients: 0 };
    }
    // Load the approved-vetted candidate set ONCE per sweep (it's the same for every listing).
    const candidates = await listApprovedVettedUsers(this.deps.db);

    let quotePushes = 0;
    let quoteRecipients = 0;
    for (const listing of listingsToPush) {
      // Defence-in-depth: the repo already excludes null/negative prices, but never match on one.
      if (listing.amountThb <= 0) continue;

      const matched = matchVettedUsers(
        {
          province: listing.province,
          propertyType: listing.propertyType,
          dealType: listing.dealType,
          amountThb: listing.amountThb,
        },
        candidates,
      );
      if (matched.length === 0) continue; // no vetted match — leave un-pushed for a later sweep.

      const quoteUrl = quoteDeepLink(miniappUrl, listing.listingId);
      if (quoteUrl === undefined) continue; // unreachable (miniappUrl is set), keeps the type honest.

      // Win the once-guard BEFORE pushing so a re-sweep can't double-push even if the pushes below are
      // slow; a lost guard means a concurrent sweep already pushed.
      const firstPush = await markQuickSalePushed(
        this.deps.db,
        listing.listingId,
        new Date(this.deps.clock.now()),
      );
      if (!firstPush) continue;

      const title = listing.headline || listing.listingId.slice(0, 8);
      const card = quickQuoteCard(title, quoteUrl);
      let reached = 0;
      for (const c of matched) {
        try {
          await this.deps.gateway.push(c.userId, [card]);
          reached += 1;
        } catch (error) {
          this.deps.logger.warn("dealflow: quick-quote push failed", {
            listingId: listing.listingId,
            to: c.userId,
            error: String(error),
          });
        }
      }
      quotePushes += 1;
      quoteRecipients += reached;
      this.deps.logger.info("dealflow: quick-quote push sent", {
        listingId: listing.listingId,
        matched: matched.length,
        reached,
      });
    }
    return { quickSale: listingsToPush.length, quotePushes, quoteRecipients };
  }
}
