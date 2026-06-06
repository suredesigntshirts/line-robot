import { SendMessageBatchCommand, type SQSClient } from "@aws-sdk/client-sqs";
import type { QueuePublisher } from "../../core/ports/runtime.js";

const MAX_BATCH = 10;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/** Publishes events to SQS in batches of 10; throws if any entry fails so ingest returns 5xx. */
export class SqsQueuePublisher implements QueuePublisher {
  constructor(
    private readonly client: SQSClient,
    private readonly queueUrl: string,
  ) {}

  async publish(events: readonly unknown[]): Promise<void> {
    for (const batch of chunk(events, MAX_BATCH)) {
      const result = await this.client.send(
        new SendMessageBatchCommand({
          QueueUrl: this.queueUrl,
          Entries: batch.map((event, index) => ({
            Id: String(index),
            MessageBody: JSON.stringify(event),
          })),
        }),
      );
      if (result.Failed !== undefined && result.Failed.length > 0) {
        throw new Error(`Failed to enqueue ${result.Failed.length} message(s) to SQS`);
      }
    }
  }
}

export function createQueuePublisher(client: SQSClient, queueUrl: string): SqsQueuePublisher {
  return new SqsQueuePublisher(client, queueUrl);
}
