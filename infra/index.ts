import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const config = new pulumi.Config();
const stack = pulumi.getStack();
const prefix = `linerobot-${stack}`;
const awsRegion = new pulumi.Config("aws").require("region");
const logRetentionDays = config.getNumber("logRetentionDays") ?? 14;

// SSM SecureString decrypt, restricted to access made via the SSM service.
const ssmKmsDecrypt = {
  Effect: "Allow",
  Action: ["kms:Decrypt"],
  Resource: "*",
  Condition: { StringEquals: { "kms:ViaService": `ssm.${awsRegion}.amazonaws.com` } },
};

// ---------------------------------------------------------------------------
// Storage: DynamoDB (messages + idempotency) and S3 (raw archive)
// ---------------------------------------------------------------------------
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
// conversation trackers, User↔Conv membership). GSI1 is the sparse "pending ingestion" index the
// debounced sweep queries to find conversations with un-ingested messages (no table scan).
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
  ],
  globalSecondaryIndexes: [
    { name: "gsi1", hashKey: "gsi1pk", rangeKey: "gsi1sk", projectionType: "ALL" },
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

// ---------------------------------------------------------------------------
// Queue: SQS main + dead-letter
// ---------------------------------------------------------------------------
const dlq = new aws.sqs.Queue("dlq", {
  name: `${prefix}-events-dlq`,
  messageRetentionSeconds: 1_209_600, // 14 days
});

const eventsQueue = new aws.sqs.Queue("events", {
  name: `${prefix}-events`,
  visibilityTimeoutSeconds: 180, // >= 6x the processor timeout
  redrivePolicy: pulumi.jsonStringify({ deadLetterTargetArn: dlq.arn, maxReceiveCount: 5 }),
});

// ---------------------------------------------------------------------------
// Secrets: LINE channel secret + access token as SSM SecureString
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// IAM: one least-privilege role per Lambda
// ---------------------------------------------------------------------------
const lambdaAssumeRole = JSON.stringify({
  Version: "2012-10-17",
  Statement: [
    { Action: "sts:AssumeRole", Effect: "Allow", Principal: { Service: "lambda.amazonaws.com" } },
  ],
});

const ingestRole = new aws.iam.Role("ingest-role", {
  name: `${prefix}-ingest`,
  assumeRolePolicy: lambdaAssumeRole,
});
new aws.iam.RolePolicyAttachment("ingest-basic", {
  role: ingestRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});
new aws.iam.RolePolicy("ingest-policy", {
  role: ingestRole.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      { Effect: "Allow", Action: ["sqs:SendMessage"], Resource: eventsQueue.arn },
      { Effect: "Allow", Action: ["ssm:GetParameter"], Resource: channelSecretParam.arn },
      ssmKmsDecrypt,
    ],
  }),
});

const processorRole = new aws.iam.Role("processor-role", {
  name: `${prefix}-processor`,
  assumeRolePolicy: lambdaAssumeRole,
});
new aws.iam.RolePolicyAttachment("processor-basic", {
  role: processorRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});
new aws.iam.RolePolicy("processor-policy", {
  role: processorRole.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"],
        Resource: eventsQueue.arn,
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
        ],
        Resource: [
          messagesTable.arn,
          idempotencyTable.arn,
          catalogTable.arn,
          pulumi.interpolate`${catalogTable.arn}/index/*`,
        ],
      },
      {
        Effect: "Allow",
        Action: ["s3:PutObject"],
        Resource: pulumi.interpolate`${archiveBucket.arn}/*`,
      },
      { Effect: "Allow", Action: ["ssm:GetParameter"], Resource: channelAccessTokenParam.arn },
      ssmKmsDecrypt,
    ],
  }),
});

// ---------------------------------------------------------------------------
// Observability: explicit log groups with retention
// ---------------------------------------------------------------------------
const ingestLogGroup = new aws.cloudwatch.LogGroup("ingest-logs", {
  name: `/aws/lambda/${prefix}-ingest`,
  retentionInDays: logRetentionDays,
});
const processorLogGroup = new aws.cloudwatch.LogGroup("processor-logs", {
  name: `/aws/lambda/${prefix}-processor`,
  retentionInDays: logRetentionDays,
});

// ---------------------------------------------------------------------------
// Compute: ingest (Function URL) + processor (SQS-triggered)
// ---------------------------------------------------------------------------
const commonEnv: Record<string, pulumi.Input<string>> = {
  MESSAGES_TABLE: messagesTable.name,
  IDEMPOTENCY_TABLE: idempotencyTable.name,
  CATALOG_TABLE: catalogTable.name,
  ARCHIVE_BUCKET: archiveBucket.bucket,
  QUEUE_URL: eventsQueue.url,
  CHANNEL_SECRET_PARAM: channelSecretParam.name,
  CHANNEL_ACCESS_TOKEN_PARAM: channelAccessTokenParam.name,
  POWERTOOLS_SERVICE_NAME: "line-robot",
  POWERTOOLS_LOG_LEVEL: "INFO",
};

const ingestFn = new aws.lambda.Function(
  "ingest",
  {
    name: `${prefix}-ingest`,
    runtime: aws.lambda.Runtime.NodeJS22dX,
    architectures: ["arm64"],
    handler: "index.handler",
    code: new pulumi.asset.FileArchive("../packages/bot/dist/ingest"),
    role: ingestRole.arn,
    timeout: 10,
    memorySize: 256,
    publish: true,
    environment: { variables: commonEnv },
    loggingConfig: { logFormat: "JSON", logGroup: ingestLogGroup.name },
  },
  { dependsOn: [ingestLogGroup] },
);

const processorFn = new aws.lambda.Function(
  "processor",
  {
    name: `${prefix}-processor`,
    runtime: aws.lambda.Runtime.NodeJS22dX,
    architectures: ["arm64"],
    handler: "index.handler",
    code: new pulumi.asset.FileArchive("../packages/bot/dist/processor"),
    role: processorRole.arn,
    timeout: 30,
    memorySize: 512,
    publish: true,
    environment: { variables: commonEnv },
    loggingConfig: { logFormat: "JSON", logGroup: processorLogGroup.name },
  },
  { dependsOn: [processorLogGroup] },
);

// Aliases per stack — stable rollback targets pointing at the published version.
new aws.lambda.Alias("ingest-alias", {
  name: stack,
  functionName: ingestFn.name,
  functionVersion: ingestFn.version,
});
new aws.lambda.Alias("processor-alias", {
  name: stack,
  functionName: processorFn.name,
  functionVersion: processorFn.version,
});

// Public HTTPS endpoint for LINE webhooks. Security is the x-line-signature check (LINE
// advises against IP filtering); authType NONE auto-grants public invoke permission.
const ingestUrl = new aws.lambda.FunctionUrl("ingest-url", {
  functionName: ingestFn.name,
  authorizationType: "NONE",
});

// SQS -> processor, with partial-batch-failure reporting.
new aws.lambda.EventSourceMapping("processor-sqs", {
  eventSourceArn: eventsQueue.arn,
  functionName: processorFn.arn,
  batchSize: 10,
  functionResponseTypes: ["ReportBatchItemFailures"],
});

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
export const webhookUrl = ingestUrl.functionUrl;
export const messagesTableName = messagesTable.name;
export const idempotencyTableName = idempotencyTable.name;
export const catalogTableName = catalogTable.name;
export const archiveBucketName = archiveBucket.bucket;
export const eventsQueueUrl = eventsQueue.url;
export const deadLetterQueueUrl = dlq.url;
