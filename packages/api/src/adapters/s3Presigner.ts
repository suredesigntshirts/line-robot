import { GetObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Presigned-GET URLs for the (private) archive bucket — the mini-app gallery. Mirrors the bot's
// S3MediaUrlSigner / the website's media.ts: the bucket has public-access fully blocked, so we sign a
// short-lived GET at request time. The mini-app serves the FULL gallery to an authenticated owner
// (originals under `conv/*` + the 640px `derivatives/*` thumbs), so the API role is granted GetObject
// on the whole archive (the v1 read-api's posture) — unlike the public website, which is thumb-only.
//
// No port/interface: there is exactly one implementation. The handler takes a `presign` FUNCTION so
// tests inject a fake — that's the seam, an interface would be a one-impl abstraction (anti-over-
// engineering rule 1/3).

const EXPIRES_SECONDS = 60 * 60; // 1h: ample for LINE's in-app WebView to fetch + cache the images.

/** A function that presigns one archive key into a GET URL (or throws on failure). The handler maps a
 * throw to "drop this photo", never a 500. */
export type Presign = (s3Key: string) => Promise<string>;

/** Build the production presigner over an S3 client + the archive bucket. */
export function s3Presign(client: S3Client, bucket: string): Presign {
  return (s3Key: string) =>
    getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: s3Key }), {
      expiresIn: EXPIRES_SECONDS,
    });
}
