import * as fs from "node:fs";
import * as path from "node:path";
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

// Static-asset content types for the mini-app SPA upload (Vite emits these). Anything unlisted falls
// back to a binary octet-stream — harmless for CloudFront, which serves the stored Content-Type.
const SITE_CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const MINIAPP_DIST = path.resolve(__dirname, "../packages/miniapp/dist");

interface SiteFile {
  readonly key: string;
  readonly fullPath: string;
  readonly contentType: string;
  readonly cacheControl: string;
}

/** Recursively list the built SPA's files (relative S3 keys, content-type, cache policy). Returns []
 * when the SPA hasn't been built yet — so the CloudFront/S3 shell can be provisioned first and the
 * assets uploaded on a later `pulumi up` (the documented bootstrap order). */
function listSiteFiles(): SiteFile[] {
  if (!fs.existsSync(MINIAPP_DIST)) {
    pulumi.log.warn(
      `mini-app dist not found at ${MINIAPP_DIST}; skipping SPA upload (build it first)`,
    );
    return [];
  }
  const files: SiteFile[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      const key = path.relative(MINIAPP_DIST, full).split(path.sep).join("/");
      const ext = path.extname(entry.name).toLowerCase();
      files.push({
        key,
        fullPath: full,
        contentType: SITE_CONTENT_TYPES[ext] ?? "application/octet-stream",
        // index.html must always be re-validated so a new deploy is picked up; everything else is a
        // content-hashed asset and can be cached immutably.
        cacheControl: key === "index.html" ? "no-cache" : "public, max-age=31536000, immutable",
      });
    }
  };
  walk(MINIAPP_DIST);
  return files;
}

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
        // PutObject: eager media capture. GetObject: presign hero-image URLs for property cards.
        Effect: "Allow",
        Action: ["s3:PutObject", "s3:GetObject"],
        Resource: pulumi.interpolate`${archiveBucket.arn}/*`,
      },
      {
        // Channel access token (reply/push) + Anthropic key (free-text "reply to update" extraction).
        Effect: "Allow",
        Action: ["ssm:GetParameter"],
        Resource: [channelAccessTokenParam.arn, anthropicApiKeyParam.arn],
      },
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
    // Per-image vision classification + a two-pass (segment then per-property) extraction ladder
    // that can escalate to Opus; a big multi-photo batch needs well over 60s end to end. Bounded
    // concurrency on classification cuts the bulk of it, but keep generous headroom for the tail.
    timeout: 180,
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
// Mini app (plan 14): a read-only catalog viewer for a LINE MINI App (LIFF) webview.
//   • read-api Lambda + Function URL — turns a LIFF id-token into the caller's listings as JSON
//     (presigned photos). READ-ONLY over the SAME catalog the bot uses.
//   • S3 (private) + CloudFront (OAC) — static host for the SPA.
// Purely additive: the bot path (ingest/processor/sweep/reminder) is untouched.
// ---------------------------------------------------------------------------

// The MINI App (LIFF) channel id the read-api validates id-tokens' `aud` against. A channel id is
// PUBLIC, so plain config (not a secret). Staging = the Developing internal channel (2010316764).
const liffChannelId = config.require("liffChannelId");

// read-api role — READ-ONLY: Query/GetItem on the catalog (+ its GSIs) and GetObject on the archive
// (to presign photo URLs). No writes, no SSM, no SQS, no Anthropic — id-token verification is an
// outbound HTTPS call carrying only the public client_id, so it needs no AWS creds and no secret.
const readApiRole = new aws.iam.Role("read-api-role", {
  name: `${prefix}-read-api`,
  assumeRolePolicy: lambdaAssumeRole,
});
new aws.iam.RolePolicyAttachment("read-api-basic", {
  role: readApiRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});
new aws.iam.RolePolicy("read-api-policy", {
  role: readApiRole.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      {
        // listPropertiesForUser/getProperty/listPropertyEvents (GetItem + Query incl. GSIs).
        Effect: "Allow",
        Action: ["dynamodb:Query", "dynamodb:GetItem"],
        Resource: [catalogTable.arn, pulumi.interpolate`${catalogTable.arn}/index/*`],
      },
      {
        // Presign GET URLs for property/chanote photos (the archive bucket is private).
        Effect: "Allow",
        Action: ["s3:GetObject"],
        Resource: pulumi.interpolate`${archiveBucket.arn}/*`,
      },
    ],
  }),
});

const readApiLogGroup = new aws.cloudwatch.LogGroup("read-api-logs", {
  name: `/aws/lambda/${prefix}-read-api`,
  retentionInDays: logRetentionDays,
});

const readApiFn = new aws.lambda.Function(
  "read-api",
  {
    name: `${prefix}-read-api`,
    runtime: aws.lambda.Runtime.NodeJS22dX,
    architectures: ["arm64"],
    handler: "index.handler",
    code: new pulumi.asset.FileArchive("../packages/bot/dist/read-api"),
    role: readApiRole.arn,
    timeout: 10,
    memorySize: 256,
    publish: true,
    // LIFF_CHANNEL_ID added only here (not in the shared commonEnv) so the existing Lambdas stay
    // byte-identical — this deploy is purely additive.
    environment: { variables: { ...commonEnv, LIFF_CHANNEL_ID: liffChannelId } },
    loggingConfig: { logFormat: "JSON", logGroup: readApiLogGroup.name },
  },
  { dependsOn: [readApiLogGroup] },
);

new aws.lambda.Alias("read-api-alias", {
  name: stack,
  functionName: readApiFn.name,
  functionVersion: readApiFn.version,
});

// --- Static SPA host: a private S3 bucket fronted by CloudFront via Origin Access Control (OAC).
// Public access is fully blocked on the bucket; only the distribution (by ARN) can read objects. ---
const siteBucket = new aws.s3.BucketV2("miniapp-site", {
  bucketPrefix: `${prefix}-miniapp-`,
});
new aws.s3.BucketPublicAccessBlock("miniapp-site-pab", {
  bucket: siteBucket.id,
  blockPublicAcls: true,
  blockPublicPolicy: true,
  ignorePublicAcls: true,
  restrictPublicBuckets: true,
});

const siteOac = new aws.cloudfront.OriginAccessControl("miniapp-oac", {
  name: `${prefix}-miniapp`,
  originAccessControlOriginType: "s3",
  signingBehavior: "always",
  signingProtocol: "sigv4",
});

const SITE_ORIGIN_ID = "miniapp-s3";
const siteDistribution = new aws.cloudfront.Distribution("miniapp-cdn", {
  enabled: true,
  comment: `${prefix} mini-app SPA`,
  defaultRootObject: "index.html",
  // OAC origin: reference the bucket's REST endpoint + the OAC id; s3OriginConfig is omitted (that's
  // the legacy OAI path).
  origins: [
    {
      originId: SITE_ORIGIN_ID,
      domainName: siteBucket.bucketRegionalDomainName,
      originAccessControlId: siteOac.id,
    },
  ],
  defaultCacheBehavior: {
    targetOriginId: SITE_ORIGIN_ID,
    viewerProtocolPolicy: "redirect-to-https",
    allowedMethods: ["GET", "HEAD"],
    cachedMethods: ["GET", "HEAD"],
    cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6", // AWS Managed-CachingOptimized
  },
  // History-API SPA routing: a path with no S3 object (e.g. /p/<id>) returns index.html with 200 so
  // the client router can resolve it (no `#` fragment routing — LIFF forbids it).
  customErrorResponses: [
    { errorCode: 403, responseCode: 200, responsePagePath: "/index.html", errorCachingMinTtl: 0 },
    { errorCode: 404, responseCode: 200, responsePagePath: "/index.html", errorCachingMinTtl: 0 },
  ],
  restrictions: { geoRestriction: { restrictionType: "none" } },
  // Default *.cloudfront.net cert satisfies LIFF's HTTPS requirement — no custom domain in v1.
  viewerCertificate: { cloudfrontDefaultCertificate: true },
  priceClass: "PriceClass_200", // includes the Asia/Pacific edges (Thai brokers)
});

// OAC bucket policy: only this distribution may GetObject. PAB stays fully on — no public access.
new aws.s3.BucketPolicy("miniapp-site-policy", {
  bucket: siteBucket.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "AllowCloudFrontOAC",
        Effect: "Allow",
        Principal: { Service: "cloudfront.amazonaws.com" },
        Action: "s3:GetObject",
        Resource: pulumi.interpolate`${siteBucket.arn}/*`,
        Condition: { StringEquals: { "AWS:SourceArn": siteDistribution.arn } },
      },
    ],
  }),
});

// Upload the built SPA (when present — the bootstrap builds it before `pulumi up`). One BucketObject
// per file: index.html is no-cache (a redeploy is seen immediately); Vite's content-hashed assets
// are immutable for a year. CloudFront sees new content the moment the object's hash changes.
for (const file of listSiteFiles()) {
  new aws.s3.BucketObjectv2(`miniapp-asset:${file.key}`, {
    bucket: siteBucket.id,
    key: file.key,
    source: new pulumi.asset.FileAsset(file.fullPath),
    contentType: file.contentType,
    cacheControl: file.cacheControl,
  });
}

// read-api Function URL — public, with security in the in-handler id-token verification (the same
// posture as ingest's x-line-signature check). CORS is scoped to the CloudFront origin + the
// Authorization header so a browser can call it from the SPA.
const readApiUrl = new aws.lambda.FunctionUrl("read-api-url", {
  functionName: readApiFn.name,
  authorizationType: "NONE",
  cors: {
    allowOrigins: [pulumi.interpolate`https://${siteDistribution.domainName}`],
    allowMethods: ["GET"],
    allowHeaders: ["authorization", "content-type"],
    maxAge: 3600,
  },
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
// Mini app (plan 14): the read-api endpoint (→ VITE_READ_API_URL) + the CloudFront SPA host
// (→ the LIFF Endpoint URL set in the LINE console, and the SPA's public origin).
export const readApiUrlOutput = readApiUrl.functionUrl;
export const miniAppCloudFrontDomain = siteDistribution.domainName;
export const miniAppUrl = pulumi.interpolate`https://${siteDistribution.domainName}/`;
export const miniAppSiteBucket = siteBucket.bucket;
