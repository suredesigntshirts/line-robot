/** Inbound side of the LINE Messaging API: download the binary for a media message. Short-lived,
 * so the processor calls this eagerly on receipt and archives the bytes to S3. */
export interface LineContentClient {
  getContent(messageId: string): Promise<Buffer>;
}
