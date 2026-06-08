import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { config, prefix } from "./naming";

/** Handles the rest of the program references — tables, bucket, queues, and SSM params. */
export interface Storage {
  messagesTable: aws.dynamodb.Table;
  idempotencyTable: aws.dynamodb.Table;
  catalogTable: aws.dynamodb.Table;
  archiveBucket: aws.s3.BucketV2;
  dlq: aws.sqs.Queue;
  eventsQueue: aws.sqs.Queue;
  channelSecretParam: aws.ssm.Parameter;
  channelAccessTokenParam: aws.ssm.Parameter;
  anthropicApiKeyParam: aws.ssm.Parameter;
}

/** Storage: DynamoDB (messages + idempotency + catalog), S3 (raw archive), SQS (main + DLQ), and the
 * LINE/Anthropic secrets as SSM SecureStrings. */
export function createStorage(): Storage {
  // -------------------------------------------------------------------------
  // DynamoDB (messages + idempotency) and S3 (raw archive)
  // -------------------------------------------------------------------------
  const messagesTable = new aws.dynamodb.Table("messages", {
    name: `${prefix}-messages`,
    billingMode: "PAY_PER_REQUEST",
    hashKey: "pk",
    rangeKey: "sk",
    attributes: [
      { name: "pk", type: "S" },
      { name: "sk", type: "S" },
    ],
    pointInTimeRecovery: { enabled: true },
  });

  const idempotencyTable = new aws.dynamodb.Table("idempotency", {
    name: `${prefix}-idempotency`,
    billingMode: "PAY_PER_REQUEST",
    hashKey: "id",
    attributes: [{ name: "id", type: "S" }],
    ttl: { attributeName: "expiration", enabled: true },
  });

  // Catalog: single-table design for the real-estate assistant (properties, Conv→Property edges,
  // conversation trackers, User↔Conv membership, follow-up events). GSI1 is the sparse "pending
  // ingestion" index the debounced sweep queries to find conversations with un-ingested messages;
  // GSI2 is the sparse "byDueDate" index the reminder sweep queries to find follow-ups due to fire
  // (both no table scan).
  const catalogTable = new aws.dynamodb.Table("catalog", {
    name: `${prefix}-catalog`,
    billingMode: "PAY_PER_REQUEST",
    hashKey: "pk",
    rangeKey: "sk",
    attributes: [
      { name: "pk", type: "S" },
      { name: "sk", type: "S" },
      { name: "gsi1pk", type: "S" },
      { name: "gsi1sk", type: "S" },
      { name: "gsi2pk", type: "S" },
      { name: "gsi2sk", type: "S" },
    ],
    globalSecondaryIndexes: [
      {
        name: "gsi1",
        keySchemas: [
          { attributeName: "gsi1pk", keyType: "HASH" },
          { attributeName: "gsi1sk", keyType: "RANGE" },
        ],
        projectionType: "ALL",
      },
      {
        name: "gsi2",
        keySchemas: [
          { attributeName: "gsi2pk", keyType: "HASH" },
          { attributeName: "gsi2sk", keyType: "RANGE" },
        ],
        projectionType: "ALL",
      },
    ],
    pointInTimeRecovery: { enabled: true },
  });

  const archiveBucket = new aws.s3.BucketV2("archive", {
    bucketPrefix: `${prefix}-archive-`,
  });

  new aws.s3.BucketPublicAccessBlock("archive-pab", {
    bucket: archiveBucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  });

  new aws.s3.BucketVersioningV2("archive-versioning", {
    bucket: archiveBucket.id,
    versioningConfiguration: { status: "Enabled" },
  });

  new aws.s3.BucketServerSideEncryptionConfigurationV2("archive-sse", {
    bucket: archiveBucket.id,
    rules: [{ applyServerSideEncryptionByDefault: { sseAlgorithm: "AES256" } }],
  });

  new aws.s3.BucketLifecycleConfigurationV2("archive-lifecycle", {
    bucket: archiveBucket.id,
    rules: [
      {
        id: "transition-to-ia",
        status: "Enabled",
        filter: {},
        transitions: [{ days: 30, storageClass: "STANDARD_IA" }],
      },
    ],
  });

  // -------------------------------------------------------------------------
  // Queue: SQS main + dead-letter
  // -------------------------------------------------------------------------
  const dlq = new aws.sqs.Queue("dlq", {
    name: `${prefix}-events-dlq`,
    messageRetentionSeconds: 1_209_600, // 14 days
  });

  const eventsQueue = new aws.sqs.Queue("events", {
    name: `${prefix}-events`,
    visibilityTimeoutSeconds: 180, // >= 6x the processor timeout
    redrivePolicy: pulumi.jsonStringify({ deadLetterTargetArn: dlq.arn, maxReceiveCount: 5 }),
  });

  // -------------------------------------------------------------------------
  // Secrets: LINE channel secret + access token as SSM SecureString
  // -------------------------------------------------------------------------
  const channelSecretParam = new aws.ssm.Parameter("channel-secret", {
    name: `/${prefix}/channel-secret`,
    type: "SecureString",
    value: config.requireSecret("channelSecret"),
  });

  const channelAccessTokenParam = new aws.ssm.Parameter("channel-access-token", {
    name: `/${prefix}/channel-access-token`,
    type: "SecureString",
    value: config.requireSecret("channelAccessToken"),
  });

  // Anthropic API key for the ingestion sweep's Claude extraction. Parked as a Pulumi config secret.
  const anthropicApiKeyParam = new aws.ssm.Parameter("anthropic-api-key", {
    name: `/${prefix}/anthropic-api-key`,
    type: "SecureString",
    value: config.requireSecret("anthropicApiKey"),
  });

  return {
    messagesTable,
    idempotencyTable,
    catalogTable,
    archiveBucket,
    dlq,
    eventsQueue,
    channelSecretParam,
    channelAccessTokenParam,
    anthropicApiKeyParam,
  };
}
