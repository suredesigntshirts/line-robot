import { GetObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { MediaUrlSigner } from "../../core/ports/mediaUrlSigner.js";

/** Presigned-GET expiry. Generous (6h) because LINE fetches + caches the image within seconds of
 * delivery, so the only thing a longer window buys is surviving a rare LINE cache re-fetch; the URL
 * is opaque and these are listing photos, so the mild exposure is acceptable. */
const DEFAULT_EXPIRES_SECONDS = 6 * 60 * 60;

/** S3-presigner-backed {@link MediaUrlSigner}: a GET URL for a private archive object. */
export class S3MediaUrlSigner implements MediaUrlSigner {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
    private readonly expiresIn: number = DEFAULT_EXPIRES_SECONDS,
  ) {}

  async presignGet(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
    return getSignedUrl(this.client, command, { expiresIn: this.expiresIn });
  }
}
