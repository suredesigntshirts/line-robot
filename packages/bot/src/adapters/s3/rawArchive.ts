import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import type { ConversationRef } from "../../core/domain/conversation.js";
import { conversationKey } from "../../core/domain/conversation.js";
import type { RawArchive } from "../../core/ports/persistence.js";

function datePath(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/** Archives every raw webhook event to S3 as immutable JSON (audit log / future training data). */
export class S3RawArchive implements RawArchive {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
  ) {}

  async put(webhookEventId: string, ref: ConversationRef, raw: unknown): Promise<void> {
    const key = `raw/${datePath(new Date())}/${conversationKey(ref)}/${webhookEventId}.json`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: JSON.stringify(raw),
        ContentType: "application/json",
      }),
    );
  }
}

export function createRawArchive(client: S3Client, bucket: string): S3RawArchive {
  return new S3RawArchive(client, bucket);
}
