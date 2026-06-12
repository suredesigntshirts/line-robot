import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import type { DatabaseResources } from "./database";
import { config, lambdaAssumeRole, logRetentionDays, prefix, stack } from "./naming";
import { listSiteFiles } from "./staticSite";

// ---------------------------------------------------------------------------
// Stage 4 (plan 19): the public Astro SSR website.
//   • SSR Lambda (packages/website/dist-lambda, hand-rolled shim per DF-2 spike)
//     + Function URL — NEVER public-facing on its own: the account guardrail
//     403s direct Function URL hits, and CloudFront is required for assets anyway.
//   • S3 (private, OAC) serves Astro's hashed client assets under /_astro/*.
//   • CloudFront: default behavior → SSR (cache disabled), /_astro/* → S3.
// ADDITIVE: no URL-bearing v1 resource is touched.
// ---------------------------------------------------------------------------

// AWS managed policy ids (stable, documented constants):
const CACHING_DISABLED = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad";
const CACHING_OPTIMIZED = "658327ea-f89d-4fab-a63d-7e88639e58f6";
// Forward everything except Host — a Function URL origin requires Host = the Lambda URL host.
const ALL_VIEWER_EXCEPT_HOST = "b689b0a8-53d0-40ab-baf2-68738e2966ac";

export interface Website {
  distribution: aws.cloudfront.Distribution;
  assetsBucket: aws.s3.BucketV2;
  ssrFn: aws.lambda.Function;
}

/** `clientDist` = built packages/website/dist/client, resolved by the caller (index.ts owns __dirname). */
export function createWebsite(
  database: Pick<DatabaseResources, "connectionString">,
  clientDist: string,
): Website {
  // The SSR function needs NO AWS permissions — Postgres is plain TCP and assets
  // come from CloudFront. Role = trust policy + basic logs only (an empty inline
  // policy would be rejected by IAM, hence no lambdaRole() here).
  const role = new aws.iam.Role("website-ssr-role", {
    name: `${prefix}-website-ssr`,
    assumeRolePolicy: lambdaAssumeRole,
  });
  new aws.iam.RolePolicyAttachment("website-ssr-basic", {
    role: role.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  });

  const logGroup = new aws.cloudwatch.LogGroup("website-ssr-logs", {
    name: `/aws/lambda/${prefix}-website-ssr`,
    retentionInDays: logRetentionDays,
  });

  const ssrFn = new aws.lambda.Function(
    "website-ssr",
    {
      name: `${prefix}-website-ssr`,
      runtime: aws.lambda.Runtime.NodeJS22dX,
      architectures: ["arm64"],
      handler: "server/index.handler",
      code: new pulumi.asset.FileArchive("../packages/website/dist-lambda"),
      role: role.arn,
      timeout: 15,
      memorySize: 512,
      publish: true,
      environment: {
        variables: {
          // D-S1-4: the bundle's pg.Pool is max 2 — keep Lambda concurrency modest.
          DATABASE_URL: database.connectionString,
          // CONV-06: the detail page's "Chat on LINE" CTA renders only when set.
          // Founder: `pulumi config set lineOaUrl https://line.me/R/ti/p/@<oa-id>`.
          LINE_OA_URL: config.get("lineOaUrl") ?? "",
        },
      },
      loggingConfig: { logFormat: "JSON", logGroup: logGroup.name },
    },
    { dependsOn: [logGroup] },
  );

  new aws.lambda.Alias("website-ssr-alias", {
    name: stack,
    functionName: ssrFn.name,
    functionVersion: ssrFn.version,
  });

  // authType NONE is safe-by-construction here: the account SCP already blocks
  // direct public Function URL access (DF-2 spike, verified 403), so CloudFront
  // is the only viable path; SEO canonical URLs are baked at build via SITE_URL.
  const ssrUrl = new aws.lambda.FunctionUrl("website-ssr-url", {
    functionName: ssrFn.name,
    authorizationType: "NONE",
  });
  const ssrOriginDomain = ssrUrl.functionUrl.apply((u) => new URL(u).hostname);

  // --- Private assets bucket + OAC (same posture as the mini-app SPA host). ---
  const assetsBucket = new aws.s3.BucketV2("website-assets", {
    bucketPrefix: `${prefix}-website-`,
  });
  new aws.s3.BucketPublicAccessBlock("website-assets-pab", {
    bucket: assetsBucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  });
  const assetsOac = new aws.cloudfront.OriginAccessControl("website-oac", {
    name: `${prefix}-website`,
    originAccessControlOriginType: "s3",
    signingBehavior: "always",
    signingProtocol: "sigv4",
  });

  const SSR_ORIGIN_ID = "website-ssr";
  const ASSETS_ORIGIN_ID = "website-assets";
  const distribution = new aws.cloudfront.Distribution("website-cdn", {
    enabled: true,
    comment: `${prefix} public website`,
    origins: [
      {
        originId: SSR_ORIGIN_ID,
        domainName: ssrOriginDomain,
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "https-only",
          originSslProtocols: ["TLSv1.2"],
        },
      },
      {
        originId: ASSETS_ORIGIN_ID,
        domainName: assetsBucket.bucketRegionalDomainName,
        originAccessControlId: assetsOac.id,
      },
    ],
    // SSR everywhere by default: no caching (pages are per-request), forward the
    // full request minus Host. Compression still applies at the edge.
    defaultCacheBehavior: {
      targetOriginId: SSR_ORIGIN_ID,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      cachedMethods: ["GET", "HEAD"],
      cachePolicyId: CACHING_DISABLED,
      originRequestPolicyId: ALL_VIEWER_EXCEPT_HOST,
      compress: true,
    },
    // Astro's content-hashed client assets — immutable, served straight from S3.
    orderedCacheBehaviors: [
      {
        pathPattern: "/_astro/*",
        targetOriginId: ASSETS_ORIGIN_ID,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        cachePolicyId: CACHING_OPTIMIZED,
        compress: true,
      },
    ],
    restrictions: { geoRestriction: { restrictionType: "none" } },
    // Domain (D19) is a parked founder decision — *.cloudfront.net until then.
    // When decided: ACM cert (us-east-1) + aliases here, and SITE_URL at build.
    viewerCertificate: { cloudfrontDefaultCertificate: true },
    priceClass: "PriceClass_200", // Asia/Pacific edges included
  });

  new aws.s3.BucketPolicy("website-assets-policy", {
    bucket: assetsBucket.id,
    policy: pulumi.jsonStringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "AllowCloudFrontOAC",
          Effect: "Allow",
          Principal: { Service: "cloudfront.amazonaws.com" },
          Action: "s3:GetObject",
          Resource: pulumi.interpolate`${assetsBucket.arn}/*`,
          Condition: { StringEquals: { "AWS:SourceArn": distribution.arn } },
        },
      ],
    }),
  });

  // Upload the built client assets (hashed → immutable cache headers via listSiteFiles).
  for (const file of listSiteFiles(clientDist)) {
    new aws.s3.BucketObjectv2(`website-asset:${file.key}`, {
      bucket: assetsBucket.id,
      key: file.key,
      source: new pulumi.asset.FileAsset(file.fullPath),
      contentType: file.contentType,
      cacheControl: file.cacheControl,
    });
  }

  return { distribution, assetsBucket, ssrFn };
}
