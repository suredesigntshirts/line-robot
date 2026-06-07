/**
 * Turns a private-bucket S3 key into a short-lived HTTPS URL the LINE client can fetch to render a
 * Flex hero image. The archive bucket blocks public access, so cards get a presigned GET URL minted
 * fresh at render time (LINE caches the fetched image, so expiry is invisible in practice).
 */
export interface MediaUrlSigner {
  /** A presigned HTTPS GET URL for the object at `s3Key`, valid for a short window. */
  presignGet(s3Key: string): Promise<string>;
}
