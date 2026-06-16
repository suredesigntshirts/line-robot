import {
  type Db,
  findOrCreateGroupByLineGroupId,
  findOrCreateUserByIdentity,
  markClaimInvited,
  upsertMembership,
} from "@line-robot/db";
import {
  buildDerivatives,
  CostLog,
  type MediaStore,
  type PipelineListingOutcome,
  runPipeline,
  type StepContext,
  type StepLlm,
} from "@line-robot/pipeline";
import type { Chanote, PropertyPhoto } from "../core/domain/catalog.js";
import { pushTargetFromKey, senderUserId } from "../core/domain/conversation.js";
import { formatShortDateTime } from "../core/domain/datetime.js";
import { parseGeoLinks, parseMapUrls } from "../core/domain/geo.js";
import type { StoredMessage } from "../core/domain/message.js";
import { type AppliedProperty, claimDeepLink, claimInviteCard } from "../core/handlers/views.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { Logger } from "../core/ports/runtime.js";

// ---------------------------------------------------------------------------
// The ingestion sweep's extract-and-apply: packages/pipeline → Postgres. The claim/debounce/
// watermark machinery around it (in IngestionSweep) is unchanged (spine audit: KEEP).
//
// v2 image pipeline (A2): each image gets two sharp derivatives — a 1568px vision image that feeds
// classify + chanote OCR (deed numbers → dedup, gallery kinds), and a 640px thumb stored on the
// media row for the public website. A per-photo build failure degrades just that photo to an
// unclassified plain media row, never the whole sweep.
// Remaining v2-lite simplification:
// - Owner identity is the CONVERSATION (provider line, subject = conversation key) until Stage 4
//   account linking maps real LINE user ids.
//
// Stage 5, Build C — the claim/publish loop's ingest half lives HERE (the bot app layer, which may
// use the gateway + db; packages/pipeline must gain NO LINE import):
//  1. SOURCE-GROUP + MEMBERSHIP population. The conversation key encodes the LINE group id
//     (`group#<lineGroupId>`); we find-or-create the Postgres `group` and pass its id as
//     `sourceGroupId` to the pipeline (so `listing.source_group_id` is non-NULL — the mini-app claim
//     gate can't admit anyone for a NULL group). For EVERY distinct real message sender we upsert a
//     `group_membership` edge, so the claim gate (`isGroupMember`) admits the real poster (today only
//     the seed wrote memberships — this is the launch blocker the build fixes).
//  2. GATE-PASS CLAIM DM. For each listing that PASSES the quality gate we stamp `claim_invited_at`
//     once (`markClaimInvited` guards re-sends), and on the first stamp DM the batch's primary sender
//     a Flex claim card deep-linking to `{miniappUrl}/claim/{id}`. The membership gate is the real
//     control, so an imperfect per-listing→sender mapping is acceptable (the precise mapping needs
//     per-segment sender annotation in the transcript — queued, not built here).
// ---------------------------------------------------------------------------

export interface PipelineV2Port {
  run(conversationKey: string, batch: StoredMessage[]): Promise<AppliedProperty[]>;
}

/** One classified attachment from a batch: its S3 key, content-type, and (best-effort) the image's
 * kind/label/OCR. The marker pass below only sets `kind`; the real per-image classification happens
 * inside the pipeline. */
export interface ClassifiedMedia {
  readonly s3Key: string;
  readonly contentType: string;
  readonly kind: PropertyPhoto["kind"];
  readonly label?: string;
  readonly chanote?: Chanote;
  readonly ocrText?: string;
}

/** Build the timestamped transcript the pipeline segmenter reads. Each line is `[<Bangkok
 * date+time>]` followed by the message text (with map links rewritten to `[MAP n]`) or an image
 * marker `[IMG n] <kind> - <label> ocr: <text>`. The timestamps (second resolution) expose
 * burst/gap structure for segmentation; the indexed markers let the segmenter attribute media per
 * property. */
export function buildTranscript(
  batch: readonly StoredMessage[],
  classified: readonly ClassifiedMedia[],
): { transcript: string; mapLinks: string[]; coordByMapIndex: (string | null)[] } {
  const indexByKey = new Map(classified.map((c, i) => [c.s3Key, i]));
  const ordered = [...batch].sort((a, b) => a.timestamp - b.timestamp);
  const mapLinks: string[] = [];
  // Parallel to mapLinks: each [MAP n]'s coordinate ("lat,long"), or null for a coordinate-less
  // short link. A segment's `mapIndex` resolves its own pin THROUGH this array (A1, plan 23), so
  // [MAP n] and its coordinate stay index-aligned even when a short link (e.g. maps.app.goo.gl)
  // carries no coords — the case that mis-binds when geoHints (which drops short links) is indexed.
  const coordByMapIndex: (string | null)[] = [];
  const lines: string[] = [];
  for (const m of ordered) {
    const stamp = `[${formatShortDateTime(m.timestamp)}]`;
    const attachKey = m.attachment?.s3Key;
    if (attachKey !== undefined && indexByKey.has(attachKey)) {
      const i = indexByKey.get(attachKey) as number;
      const c = classified[i] as ClassifiedMedia;
      const label = c.label !== undefined ? ` - ${c.label}` : "";
      const ocr = c.ocrText !== undefined ? ` ocr: ${c.ocrText}` : "";
      lines.push(`${stamp} [IMG ${i}] ${c.kind}${label}${ocr}`);
      continue;
    }
    const text = m.text;
    if (text !== undefined && text !== "") {
      let rewritten = text;
      for (const url of parseMapUrls(text)) {
        let idx = mapLinks.indexOf(url);
        if (idx === -1) {
          idx = mapLinks.length;
          mapLinks.push(url);
          const geo = parseGeoLinks(url)[0];
          coordByMapIndex.push(geo ? `${geo.lat},${geo.long}` : null);
        }
        rewritten = rewritten.split(url).join(`[MAP ${idx}]`);
      }
      lines.push(`${stamp} ${rewritten}`);
    }
  }
  return { transcript: lines.join("\n"), mapLinks, coordByMapIndex };
}

interface PipelineV2Deps {
  db: Db;
  llm: StepLlm;
  media: MediaStore;
  logger: Logger;
  /** The LINE gateway — the bot app layer may push (the claim DM). Optional so a sweep without LINE
   * config (e.g. an eval/back-fill run) still ingests; the claim DM is simply skipped then. */
  gateway?: LineGateway;
  /** The MINI App base URL (`MINIAPP_URL`). The claim DM deep-links to `{miniappUrl}/claim/{id}`;
   * absent → no claim DM is sent (the deep link can't resolve). Membership/group population is
   * UNAFFECTED — it runs regardless, so the gate is populated even before the DM is configured. */
  miniappUrl?: string;
}

/** Parse the LINE group id out of a conversation key, for a group/room conversation only. The id is
 * everything after the first `#` (delegated to {@link pushTargetFromKey}); a 1:1 (`user#…`) key returns
 * undefined — a DM has no source group, so its listings stay group-less (NULL `source_group_id`). */
function lineGroupIdFromKey(conversationKey: string): string | undefined {
  if (conversationKey.startsWith("group#") || conversationKey.startsWith("room#")) {
    return pushTargetFromKey(conversationKey);
  }
  return undefined;
}

/**
 * Populate the source group + every sender's membership for this batch (Stage 5, Build C — the launch
 * blocker). Returns the Postgres `sourceGroupId` to stamp on the batch's listings, or undefined for a
 * 1:1 conversation (no source group). All writes are idempotent (the sweep runs at-least-once), so a
 * re-sweep is a safe no-op. Memberships are written for ALL distinct real senders in the batch — a
 * robust gate that doesn't depend on which sender a given segment came from.
 */
async function populateGroupMembership(
  db: Db,
  conversationKey: string,
  batch: readonly StoredMessage[],
  logger: Logger,
): Promise<string | undefined> {
  const lineGroupId = lineGroupIdFromKey(conversationKey);
  if (lineGroupId === undefined) return undefined;
  const group = await findOrCreateGroupByLineGroupId(db, lineGroupId);

  const senders = new Set(
    batch.map((m) => senderUserId(m.ref)).filter((id): id is string => id !== undefined),
  );
  for (const lineUserId of senders) {
    // Resolve the REAL sender to a pg user — the SAME identity the mini-app's LIFF id-token resolves
    // to, so the membership written here is the user the claim gate checks.
    const user = await findOrCreateUserByIdentity(db, "line", lineUserId, "LINE user");
    await upsertMembership(db, { groupId: group.id, userId: user.id });
  }
  logger.info("pipeline v2: source group + memberships populated", {
    conversationKey,
    sourceGroupId: group.id,
    senders: senders.size,
  });
  return group.id;
}

export function createPipelineV2Port(deps: PipelineV2Deps): PipelineV2Port {
  return {
    async run(conversationKey, batch) {
      // Only image attachments become photos: a PDF/video/audio would throw inside sharp and degrade
      // to a media row that points at a non-image as if it were a photo. Filtering here keeps the
      // `photos` and `markers` lists (and so the [IMG n] transcript indices) aligned.
      const attachments = batch
        .map((m) => m.attachment)
        .filter((a): a is NonNullable<typeof a> => a !== undefined)
        .filter((a) => a.contentType.startsWith("image/"));

      // Build both derivatives per image (sharp): the 1568px vision image feeds classify + chanote
      // OCR; the 640px thumb is stored for the public website. A failed build degrades just that
      // photo to a plain unclassified media row (the original key), never the whole sweep.
      const photos = await Promise.all(
        attachments.map(async (a, index) => {
          try {
            const d = await buildDerivatives(deps.media, a.s3Key);
            return {
              index,
              s3Key: a.s3Key,
              thumbKey: d.thumbKey,
              vision: {
                s3Key: d.visionKey,
                mediaType: "image/jpeg" as const,
                base64: Buffer.from(d.visionJpeg).toString("base64"),
              },
            };
          } catch (error) {
            deps.logger.warn("pipeline v2: derivative build failed; photo unclassified", {
              s3Key: a.s3Key,
              error: String(error),
            });
            return { index, s3Key: a.s3Key };
          }
        }),
      );

      // Marker-only entries so buildTranscript emits the [IMG n] lines the segmenter attributes by
      // index — the real per-image classification happens inside the pipeline.
      const markers: ClassifiedMedia[] = attachments.map((a) => ({
        s3Key: a.s3Key,
        contentType: a.contentType ?? "image/jpeg",
        kind: "property",
      }));
      const { transcript, coordByMapIndex } = buildTranscript(batch, markers);
      if (transcript.trim() === "") {
        deps.logger.info("pipeline v2: nothing to extract", { conversationKey });
        return [];
      }

      const chatText = batch
        .map((m) => m.text)
        .filter((t): t is string => t !== undefined && t !== "")
        .join("\n");

      const ctx: StepContext = { llm: deps.llm, costLog: new CostLog(), mode: "sync" };
      // The listing's `owner_user_id` — a CONVERSATION-scoped pseudo-user (subject = the conversation
      // key), NOT the real sender; the real claimant is the mini-app user who later claims it.
      const owner = await findOrCreateUserByIdentity(
        deps.db,
        "line",
        conversationKey,
        conversationKey,
      );
      // Materialise the source group + memberships BEFORE the pipeline so the listings it writes carry
      // a non-NULL source_group_id (the mini-app claim gate needs it) and the real posters are members
      // (the gate admits them). A 1:1 conversation yields undefined — its listings stay group-less.
      const sourceGroupId = await populateGroupMembership(
        deps.db,
        conversationKey,
        batch,
        deps.logger,
      );
      const outcome = await runPipeline(ctx, deps.db, {
        transcript,
        ownerUserId: owner.id,
        sourceGroupId,
        photos,
        geoHints: parseGeoLinks(chatText).map((g) => `${g.lat},${g.long}`),
        coordByMapIndex,
        contentLang: "th",
      });

      deps.logger.info("pipeline v2: sweep complete", {
        conversationKey,
        listings: outcome.listings.length,
        dropped: outcome.droppedSegments.length,
        estCostUsd: ctx.costLog.totalUsd(),
        cacheHit: ctx.costLog.sawCacheHit(),
      });

      // Claim DM (best-effort): for each listing that PASSED the gate, stamp claim_invited_at ONCE
      // (the guard), and on the first stamp DM the batch's primary sender a deep-linked claim card.
      // Only for a group-sourced batch — a 1:1 listing has no source group, so its claim screen would
      // dead-end in the gate's 404 (passing sourceGroupId lets sendClaimInvites skip it).
      await sendClaimInvites(deps, conversationKey, batch, outcome.listings, sourceGroupId);

      return outcome.listings.map((l) => ({
        propertyId: l.listingId,
        isNew: l.decision.decision === "new",
        ambiguous: false,
        label: l.title || l.listingId.slice(0, 8),
      }));
    },
  };
}

/**
 * Push the one-shot claim DM for every gate-passed listing in this batch (Stage 5, D7). Each listing's
 * `claim_invited_at` guard (`markClaimInvited`) ensures exactly one DM per listing across all sweeps —
 * a re-sweep of the same listing stamps nothing and sends nothing. A non-gate-pass listing is skipped
 * entirely (it surfaces through moderation instead). The DM targets the batch's PRIMARY sender
 * (`batch[0].ref.senderUserId`) — a best-effort nudge; the membership gate is the real control, so an
 * imperfect per-listing→sender mapping is acceptable (the precise mapping is queued — see the header).
 *
 * Skipped entirely (no stamp, no DM) when:
 *  - there's no `sourceGroupId` (a 1:1-sourced listing — its claim screen would dead-end in the claim
 *    gate's 404, since a NULL source group can't be group-claimed), OR
 *  - the gateway / `miniappUrl` is absent (the deep link can't resolve). Because `markClaimInvited` is
 *    NOT called in these skips, once the MINI App URL is set the first sweep that re-sees a still-
 *    unstamped gate-passed listing sends its DM (no listing is silently burned).
 *
 * Every push is wrapped: a failed DM never fails the sweep (the watermark already advanced).
 */
async function sendClaimInvites(
  deps: PipelineV2Deps,
  conversationKey: string,
  batch: readonly StoredMessage[],
  listings: readonly PipelineListingOutcome[],
  sourceGroupId: string | undefined,
): Promise<void> {
  const gateway = deps.gateway;
  const miniappUrl = deps.miniappUrl;
  // No source group → the claim gate can't admit anyone for these listings; no gateway/URL → the deep
  // link can't resolve. Either way there's nothing to send (and no stamp to burn).
  if (sourceGroupId === undefined || gateway === undefined || miniappUrl === undefined) return;

  const target = senderUserId(batch[0]?.ref ?? { kind: "user", userId: "" });
  if (target === undefined || target === "") {
    // No real sender to DM (e.g. LINE omitted the sender id) — nothing to nudge.
    return;
  }

  for (const l of listings) {
    if (!l.gate.pass) continue;
    let firstInvite = false;
    try {
      firstInvite = await markClaimInvited(deps.db, l.listingId, new Date());
    } catch (error) {
      deps.logger.warn("pipeline v2: claim-invite guard failed; skipping DM", {
        conversationKey,
        listingId: l.listingId,
        error: String(error),
      });
      continue;
    }
    if (!firstInvite) continue; // already invited on a prior sweep — never re-send.

    const claimUrl = claimDeepLink(miniappUrl, l.listingId);
    if (claimUrl === undefined) continue; // unreachable (miniappUrl is set), but keeps the type honest.
    const title = l.title || l.listingId.slice(0, 8);
    try {
      await gateway.push(target, [claimInviteCard(title, claimUrl)]);
      deps.logger.info("pipeline v2: claim DM sent", { conversationKey, listingId: l.listingId });
    } catch (error) {
      deps.logger.warn("pipeline v2: claim DM push failed", {
        conversationKey,
        listingId: l.listingId,
        error: String(error),
      });
    }
  }
}
