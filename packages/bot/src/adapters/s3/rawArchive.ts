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

/** File extension to give a captured binary, by MIME type. Falls back to no extension. */
function extensionFor(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "audio/mp4": ".m4a",
    "audio/x-m4a": ".m4a",
    "application/pdf": ".pdf",
  };
  return map[contentType] ?? "";
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

  async putMedia(
    ref: ConversationRef,
    messageId: string,
    bytes: Buffer,
    contentType: string,
  ): Promise<string> {
    // Folder-per-message: key is derivable from (conversationKey, messageId) — no listing needed.
    const key = `conv/${conversationKey(ref)}/${messageId}/content${extensionFor(contentType)}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );
    return key;
  }
}

export function createRawArchive(client: S3Client, bucket: string): S3RawArchive {
  return new S3RawArchive(client, bucket);
}
