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
    { name: "gsi1", hashKey: "gsi1pk", rangeKey: "gsi1sk", projectionType: "ALL" },
    { name: "gsi2", hashKey: "gsi2pk", rangeKey: "gsi2sk", projectionType: "ALL" },
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

// Anthropic API key for the ingestion sweep's Claude extraction. Parked as a Pulumi config secret.
const anthropicApiKeyParam = new aws.ssm.Parameter("anthropic-api-key", {
  name: `/${prefix}/anthropic-api-key`,
  type: "SecureString",
  value: config.requireSecret("anthropicApiKey"),
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

// Ingestion sweep: EventBridge-cron Lambda. Reads the sparse GSI1 for due conversations, claims
// each (UpdateItem condition), batches its un-ingested messages from the messages table, reads any
// captured media from S3, runs Claude extraction, upserts properties + edges, and pushes a
// confirmation. Read-only on messages + S3; read/write on the catalog tracker/property items + GSI1.
const sweepRole = new aws.iam.Role("sweep-role", {
  name: `${prefix}-sweep`,
  assumeRolePolicy: lambdaAssumeRole,
});
new aws.iam.RolePolicyAttachment("sweep-basic", {
  role: sweepRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});
new aws.iam.RolePolicy("sweep-policy", {
  role: sweepRole.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      {
        // findPending (Query GSI1) + claim/release (UpdateItem) + getConversation/getProperty
        // (GetItem) + upsertProperty/linkConversationProperty (UpdateItem).
        Effect: "Allow",
        Action: ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:PutItem"],
        Resource: [catalogTable.arn, pulumi.interpolate`${catalogTable.arn}/index/*`],
      },
      {
        // findSince: batch a conversation's messages (read-only).
        Effect: "Allow",
        Action: ["dynamodb:Query"],
        Resource: messagesTable.arn,
      },
      {
        // Read captured media (photos / chanote scans) to feed extraction.
        Effect: "Allow",
        Action: ["s3:GetObject"],
        Resource: pulumi.interpolate`${archiveBucket.arn}/*`,
      },
      {
        // Anthropic key (extraction) + channel access token (push confirmation).
        Effect: "Allow",
        Action: ["ssm:GetParameter"],
        Resource: [anthropicApiKeyParam.arn, channelAccessTokenParam.arn],
      },
      ssmKmsDecrypt,
    ],
  }),
});

// Reminder sweep: EventBridge-cron Lambda. Reads the sparse GSI2 for follow-up events past due,
// claims each (UpdateItem condition that clears the GSI keys), reads the property for the card, and
// pushes a reminder. Catalog read/write + the channel access token only — no messages/S3/Anthropic.
const reminderRole = new aws.iam.Role("reminder-role", {
  name: `${prefix}-reminder`,
  assumeRolePolicy: lambdaAssumeRole,
});
new aws.iam.RolePolicyAttachment("reminder-basic", {
  role: reminderRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});
new aws.iam.RolePolicy("reminder-policy", {
  role: reminderRole.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      {
        // findDueEvents (Query GSI2) + markEventNotified (UpdateItem) + getProperty (GetItem).
        Effect: "Allow",
        Action: ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:UpdateItem"],
        Resource: [catalogTable.arn, pulumi.interpolate`${catalogTable.arn}/index/*`],
      },
      {
        // Channel access token (push reminder).
        Effect: "Allow",
        Action: ["ssm:GetParameter"],
        Resource: channelAccessTokenParam.arn,
      },
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
const sweepLogGroup = new aws.cloudwatch.LogGroup("sweep-logs", {
  name: `/aws/lambda/${prefix}-sweep`,
  retentionInDays: logRetentionDays,
});
const reminderLogGroup = new aws.cloudwatch.LogGroup("reminder-logs", {
  name: `/aws/lambda/${prefix}-reminder`,
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
  ANTHROPIC_API_KEY_PARAM: anthropicApiKeyParam.name,
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

// Ingestion sweep — EventBridge-cron triggered (no Function URL, no SQS).
const sweepFn = new aws.lambda.Function(
  "sweep",
  {
    name: `${prefix}-sweep`,
    runtime: aws.lambda.Runtime.NodeJS22dX,
    architectures: ["arm64"],
    handler: "index.handler",
    code: new pulumi.asset.FileArchive("../packages/bot/dist/sweep"),
    role: sweepRole.arn,
    timeout: 60,
    memorySize: 512,
    publish: true,
    environment: { variables: commonEnv },
    loggingConfig: { logFormat: "JSON", logGroup: sweepLogGroup.name },
  },
  { dependsOn: [sweepLogGroup] },
);

new aws.lambda.Alias("sweep-alias", {
  name: stack,
  functionName: sweepFn.name,
  functionVersion: sweepFn.version,
});

// Run the sweep on a fixed cadence. The debounce lives in the GSI1 readyAt key, so the cron just
// needs to tick often enough to keep ingestion latency low (a due conversation waits at most one
// interval past its readyAt).
const sweepSchedule = new aws.cloudwatch.EventRule("sweep-schedule", {
  name: `${prefix}-ingestion-sweep`,
  description: "Trigger the debounced ingestion sweep",
  scheduleExpression: "rate(2 minutes)",
});
new aws.cloudwatch.EventTarget("sweep-target", {
  rule: sweepSchedule.name,
  arn: sweepFn.arn,
});
new aws.lambda.Permission("sweep-invoke", {
  action: "lambda:InvokeFunction",
  function: sweepFn.name,
  principal: "events.amazonaws.com",
  sourceArn: sweepSchedule.arn,
});

// Reminder sweep — EventBridge-cron triggered (no Function URL, no SQS).
const reminderFn = new aws.lambda.Function(
  "reminder",
  {
    name: `${prefix}-reminder`,
    runtime: aws.lambda.Runtime.NodeJS22dX,
    architectures: ["arm64"],
    handler: "index.handler",
    code: new pulumi.asset.FileArchive("../packages/bot/dist/reminder"),
    role: reminderRole.arn,
    timeout: 60,
    memorySize: 256,
    publish: true,
    environment: { variables: commonEnv },
    loggingConfig: { logFormat: "JSON", logGroup: reminderLogGroup.name },
  },
  { dependsOn: [reminderLogGroup] },
);

new aws.lambda.Alias("reminder-alias", {
  name: stack,
  functionName: reminderFn.name,
  functionVersion: reminderFn.version,
});

// Tick every 15 minutes: a follow-up fires within ~15 min of its due time, which is plenty for
// day-grained real-estate reminders, and a near-empty GSI2 query is pennies.
const reminderSchedule = new aws.cloudwatch.EventRule("reminder-schedule", {
  name: `${prefix}-reminder-sweep`,
  description: "Trigger the follow-up reminder sweep",
  scheduleExpression: "rate(15 minutes)",
});
new aws.cloudwatch.EventTarget("reminder-target", {
  rule: reminderSchedule.name,
  arn: reminderFn.arn,
});
new aws.lambda.Permission("reminder-invoke", {
  action: "lambda:InvokeFunction",
  function: reminderFn.name,
  principal: "events.amazonaws.com",
  sourceArn: reminderSchedule.arn,
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
export const sweepFunctionName = sweepFn.name;
export const reminderFunctionName = reminderFn.name;
