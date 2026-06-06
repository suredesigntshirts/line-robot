import { IdempotencyConfig, makeIdempotent } from "@aws-lambda-powertools/idempotency";
import { DynamoDBPersistenceLayer } from "@aws-lambda-powertools/idempotency/dynamodb";
import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export interface PersistenceLayerOptions {
  tableName: string;
  /** Override the DynamoDB client (e.g. point at DynamoDB Local in tests). */
  awsSdkV3Client?: DynamoDBClient;
}

export function createPersistenceLayer(opts: PersistenceLayerOptions): DynamoDBPersistenceLayer {
  return new DynamoDBPersistenceLayer({
    tableName: opts.tableName,
    ...(opts.awsSdkV3Client ? { awsSdkV3Client: opts.awsSdkV3Client } : {}),
  });
}

/**
 * Wrap a per-event handler so a redelivered webhook (same `webhookEventId`) runs at most once.
 * Backed by a dedicated DynamoDB table with TTL — see Stage 03/05.
 */
export function makeEventIdempotent<E extends { webhookEventId: string }, R>(
  fn: (event: E) => Promise<R>,
  persistenceStore: DynamoDBPersistenceLayer,
): (event: E) => Promise<R> {
  return makeIdempotent(fn, {
    persistenceStore,
    config: new IdempotencyConfig({ eventKeyJmesPath: "webhookEventId" }),
  });
}
