import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { lambdaRole } from "./iam";
import { config, logRetentionDays, prefix, stack } from "./naming";
import type { Storage } from "./storage";

/** What index.ts needs back from the mini-app API stack. */
export interface MiniAppApi {
  apiUrl: aws.lambda.FunctionUrl;
  apiFn: aws.lambda.Function;
}

/**
 * Stage 5 (plan 19) mini-app API: the `packages/api` Lambda behind a Function URL that the rebuilt
 * React mini-app reads from. It turns a LIFF id-token into the caller's identity (verified against the
 * MINI App channel id) and serves the per-user CRM + claim/publish endpoints over the Postgres catalog,
 * presigning gallery photos from the (private) archive bucket.
 *
 * PARALLEL to the v1 `read-api` (createMiniApp) — it does NOT touch or replace those resources; the v1
 * read-api stays deployed as rollback until the Stage 6 gate (Stage 5 open-question resolution).
 *
 * Least privilege: GetObject on the archive bucket (presign the gallery) is the ONLY AWS data grant.
 * The catalog (reads AND the claim/publish/save/viewing/note writes) is all Postgres, reached by the
 * password-auth connection string — no IAM. No DynamoDB, SSM, or queue grant (the scoped env in
 * loadApiEnv() validates exactly ARCHIVE_BUCKET / LIFF_CHANNEL_ID / DATABASE_URL).
 *
 * `allowedOrigin` is the mini-app's CloudFront origin (CORS lock) — passed in from index.ts so this
 * stack stays decoupled from the SPA-host stack.
 */
export function createApi(
  storage: Pick<Storage, "archiveBucket">,
  database: { connectionString: pulumi.Output<string> },
  allowedOrigin: pulumi.Input<string>,
): MiniAppApi {
  const { archiveBucket } = storage;

  // The MINI App (LIFF) channel id the API validates id-tokens' `aud` against. A channel id is PUBLIC,
  // so plain config (not a secret) — the same value the v1 read-api uses.
  const liffChannelId = config.require("liffChannelId");

  const apiEnv: Record<string, pulumi.Input<string>> = {
    ARCHIVE_BUCKET: archiveBucket.bucket,
    LIFF_CHANNEL_ID: liffChannelId,
    DATABASE_URL: database.connectionString,
    POWERTOOLS_SERVICE_NAME: "line-robot",
    POWERTOOLS_LOG_LEVEL: "INFO",
  };

  // GetObject on the archive (presign the gallery: originals under conv/* + the 640px derivatives/*).
  // No DynamoDB / SSM / SQS — id-token verification is an outbound HTTPS call carrying only the public
  // client_id, and the catalog is Postgres (connection string, no IAM).
  const apiRole = lambdaRole("miniapp-api", [
    {
      Effect: "Allow",
      Action: ["s3:GetObject"],
      Resource: pulumi.interpolate`${archiveBucket.arn}/*`,
    },
  ]);

  const apiLogGroup = new aws.cloudwatch.LogGroup("miniapp-api-logs", {
    name: `/aws/lambda/${prefix}-miniapp-api`,
    retentionInDays: logRetentionDays,
  });

  const apiFn = new aws.lambda.Function(
    "miniapp-api",
    {
      name: `${prefix}-miniapp-api`,
      runtime: aws.lambda.Runtime.NodeJS22dX,
      architectures: ["arm64"],
      handler: "index.handler",
      code: new pulumi.asset.FileArchive("../packages/api/dist/api"),
      role: apiRole.arn,
      timeout: 10,
      memorySize: 256,
      publish: true,
      environment: { variables: apiEnv },
      loggingConfig: { logFormat: "JSON", logGroup: apiLogGroup.name },
    },
    { dependsOn: [apiLogGroup] },
  );

  new aws.lambda.Alias("miniapp-api-alias", {
    name: stack,
    functionName: apiFn.name,
    functionVersion: apiFn.version,
  });

  // Public Function URL — security is the in-handler id-token verification (same posture as the v1
  // read-api). CORS is scoped to the mini-app CloudFront origin + the Authorization header. PATCH +
  // DELETE join GET/POST (owner edit + unsave); the browser preflights them (custom Authorization).
  const apiUrl = new aws.lambda.FunctionUrl("miniapp-api-url", {
    functionName: apiFn.name,
    authorizationType: "NONE",
    cors: {
      allowOrigins: [allowedOrigin],
      allowMethods: ["GET", "POST", "PATCH", "DELETE"],
      allowHeaders: ["authorization", "content-type"],
      maxAge: 3600,
    },
  });

  return { apiUrl, apiFn };
}
