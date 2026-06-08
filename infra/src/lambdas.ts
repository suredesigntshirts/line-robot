import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { lambdaRole } from "./iam";
import {
  logRetentionDays,
  PROCESSOR_TIMEOUT_SECONDS,
  prefix,
  ssmKmsDecrypt,
  stack,
} from "./naming";
import type { Storage } from "./storage";

/** The bot-path handles `index.ts` must export or the mini-app does not touch. */
export interface BotLambdas {
  ingestUrl: aws.lambda.FunctionUrl;
  sweepFn: aws.lambda.Function;
  reminderFn: aws.lambda.Function;
}

/** The four bot Lambdas (ingest / processor / sweep / reminder): one least-privilege role each, an
 * explicit retained log group, the Function + its per-stack alias, and the trigger wiring (ingest
 * Function URL, processor SQS source mapping, sweep/reminder EventBridge cron). */
export function createBotLambdas(storage: Storage): BotLambdas {
  const {
    messagesTable,
    idempotencyTable,
    catalogTable,
    archiveBucket,
    eventsQueue,
    channelSecretParam,
    channelAccessTokenParam,
    anthropicApiKeyParam,
  } = storage;

  // -------------------------------------------------------------------------
  // IAM: one least-privilege role per Lambda
  // -------------------------------------------------------------------------
  const ingestRole = lambdaRole("ingest", [
    { Effect: "Allow", Action: ["sqs:SendMessage"], Resource: eventsQueue.arn },
    { Effect: "Allow", Action: ["ssm:GetParameter"], Resource: channelSecretParam.arn },
    ssmKmsDecrypt,
  ]);

  const processorRole = lambdaRole("processor", [
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
  ]);

  // Ingestion sweep: EventBridge-cron Lambda. Reads the sparse GSI1 for due conversations, claims
  // each (UpdateItem condition), batches its un-ingested messages from the messages table, reads any
  // captured media from S3, runs Claude extraction, upserts properties + edges, and pushes a
  // confirmation. Read-only on messages + S3; read/write on the catalog tracker/property items + GSI1.
  const sweepRole = lambdaRole("sweep", [
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
  ]);

  // Reminder sweep: EventBridge-cron Lambda. Reads the sparse GSI2 for follow-up events past due,
  // claims each (UpdateItem condition that clears the GSI keys), reads the property for the card, and
  // pushes a reminder. Catalog read/write + the channel access token only — no messages/S3/Anthropic.
  const reminderRole = lambdaRole("reminder", [
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
  ]);

  // -------------------------------------------------------------------------
  // Observability: explicit log groups with retention
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Compute: ingest (Function URL) + processor (SQS-triggered)
  // -------------------------------------------------------------------------
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
      timeout: PROCESSOR_TIMEOUT_SECONDS,
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

  return { ingestUrl, sweepFn, reminderFn };
}
