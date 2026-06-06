/**
 * Reads eagerly-captured media back from object storage (S3) for the ingestion sweep, which feeds
 * image/PDF bytes to extraction. The processor wrote these via {@link ../ports/persistence.RawArchive}
 * `putMedia`, recording the key on the message's `attachment`.
 */
export interface MediaReader {
  /** Fetch the bytes stored at this S3 key. Throws if the object is missing. */
  getMedia(s3Key: string): Promise<Buffer>;
}
