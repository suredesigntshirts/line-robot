import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ---------------------------------------------------------------------------
// 4.1: serve listing photos on the public website. The archive bucket is private
// (PAB on), so — exactly like the bot's S3MediaUrlSigner and the read-api — we
// presign a short-lived GET URL at render time. The SSR HTML is served with
// caching DISABLED (per-request), so a presigned URL never gets stale-cached;
// keeping the bucket private avoids exposing the founder's archive publicly.
// We only ever presign keys under `derivatives/` (the 640px thumbs), which is
// all the website-ssr role is granted (least privilege, infra/src/website.ts).
// ---------------------------------------------------------------------------

/** 1h presign: the SSR response itself isn't cached, but a CloudFront 0-TTL miss + the browser's own
 * image fetch can lag the HTML by minutes; an hour is ample and the keys are opaque thumbs. */
const EXPIRES_SECONDS = 60 * 60;

let cached: { client: S3Client; bucket: string } | null = null;

/** Lazily build the S3 client + bucket from env, once. Returns null when ARCHIVE_BUCKET is unset
 * (local `astro dev`, the DB-less SSR smoke) so callers fall back to the no-photo placeholder. */
function s3(): { client: S3Client; bucket: string } | null {
  if (cached) return cached;
  const bucket = process.env.ARCHIVE_BUCKET;
  if (!bucket) return null;
  cached = { client: new S3Client({}), bucket };
  return cached;
}

/** Presign one derivative key. null/empty in → null out (no S3 call); a presign failure degrades to
 * null (the placeholder), never a 500. Local — callers use {@link presignThumbs}. */
async function presignOne(thumbKey: string | null): Promise<string | null> {
  if (!thumbKey) return null;
  const s = s3();
  if (!s) return null;
  try {
    return await getSignedUrl(s.client, new GetObjectCommand({ Bucket: s.bucket, Key: thumbKey }), {
      expiresIn: EXPIRES_SECONDS,
    });
  } catch (error) {
    console.error("presignThumb failed:", error);
    return null;
  }
}

/** Presign many thumb keys in parallel, preserving order; null/missing keys and failures become null
 * (so the card/detail render falls back to the placeholder). The one entry point cards + detail use. */
export function presignThumbs(thumbKeys: Array<string | null>): Promise<Array<string | null>> {
  return Promise.all(thumbKeys.map(presignOne));
}
