import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { lambdaRole } from "./iam";
import { config, logRetentionDays, prefix, stack } from "./naming";
import { listSiteFiles } from "./staticSite";
import type { Storage } from "./storage";

/** The mini-app handles `index.ts` must export. */
export interface MiniApp {
  readApiUrl: aws.lambda.FunctionUrl;
  siteDistribution: aws.cloudfront.Distribution;
  siteBucket: aws.s3.BucketV2;
}

/**
 * Mini app (plan 14 + 17): a catalog viewer for a LINE MINI App (LIFF) webview.
 *   • read-api Lambda + Function URL — turns a LIFF id-token into the caller's listings as JSON
 *     (presigned photos). Read over the SAME catalog the bot uses, plus one narrow write: "book a
 *     viewing" creates a follow-up event for the caller (plan 17).
 *   • S3 (private) + CloudFront (OAC) — static host for the SPA.
 * Purely additive: the bot path (ingest/processor/sweep/reminder) is untouched.
 *
 * `miniappDist` is the built-SPA directory, computed by the caller against the project root.
 */
export function createMiniApp(
  storage: Pick<Storage, "catalogTable" | "archiveBucket">,
  miniappDist: string,
): MiniApp {
  const { catalogTable, archiveBucket } = storage;

  // The MINI App (LIFF) channel id the read-api validates id-tokens' `aud` against. A channel id is
  // PUBLIC, so plain config (not a secret). Staging = the Developing internal channel (2010316764).
  const liffChannelId = config.require("liffChannelId");

  // read-api is narrowly scoped: only the catalog table, the archive bucket, and the public LIFF
  // channel id (id-token aud). It has no IAM grant for the message/idempotency tables, SSM params, or
  // queue, so it must not carry them — loadReadApiEnv() validates exactly this set.
  const readApiEnv: Record<string, pulumi.Input<string>> = {
    CATALOG_TABLE: catalogTable.name,
    ARCHIVE_BUCKET: archiveBucket.bucket,
    LIFF_CHANNEL_ID: liffChannelId,
    POWERTOOLS_SERVICE_NAME: "line-robot",
    POWERTOOLS_LOG_LEVEL: "INFO",
  };

  // read-api role — read + ONE narrow write: Query/GetItem on the catalog (+ its GSIs), PutItem to
  // create a follow-up event ("book a viewing" — membership-gated in-handler, only ever the caller's
  // own reminder), and GetObject on the archive (to presign photo URLs). No SSM, no SQS, no Anthropic
  // — id-token verification is an outbound HTTPS call carrying only the public client_id, so it needs
  // no AWS creds and no secret. PutItem is the ONLY mutation (no UpdateItem/DeleteItem).
  const readApiRole = lambdaRole("read-api", [
    {
      // listPropertiesForUser/getProperty/listPropertyEvents (GetItem + Query incl. GSIs) + addEvent
      // (PutItem) for the booking route. PutItem applies to the table itself; index/* is harmless.
      Effect: "Allow",
      Action: ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:PutItem"],
      Resource: [catalogTable.arn, pulumi.interpolate`${catalogTable.arn}/index/*`],
    },
    {
      // Presign GET URLs for property/chanote photos (the archive bucket is private).
      Effect: "Allow",
      Action: ["s3:GetObject"],
      Resource: pulumi.interpolate`${archiveBucket.arn}/*`,
    },
  ]);

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
      // Scoped env (not the shared commonEnv): read-api validates only CATALOG_TABLE / ARCHIVE_BUCKET
      // / LIFF_CHANNEL_ID via loadReadApiEnv(), matching its read-only IAM role — it has no grant for
      // the message/idempotency tables, SSM params, or queue, so it must not carry them.
      environment: { variables: readApiEnv },
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
  for (const file of listSiteFiles(miniappDist)) {
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
      // POST is the "book a viewing" write; the browser preflights it (custom Authorization header).
      allowMethods: ["GET", "POST"],
      allowHeaders: ["authorization", "content-type"],
      maxAge: 3600,
    },
  });

  return { readApiUrl, siteDistribution, siteBucket };
}
