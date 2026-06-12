"use strict";
// Spike Pulumi program (DF-2): Astro SSR -> Lambda + Function URL, deployed by OUR code (no SST).
// Mirrors the repo's own Function-URL Lambda pattern (infra/src/lambdas.ts) at minimal scale:
//   - one IAM role with the AWS-managed basic-execution policy
//   - one Lambda (nodejs22.x, arm64) whose code is the bundled Astro server (app/dist-lambda)
//   - one public Function URL (authType NONE -> auto-grants public invoke)
// All resources named linerobot-spike-* to stay inside the scoped deploy identity.
const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");
const path = require("path");

const NAME = "linerobot-spike-astro";
// The bundled handler artifact: app/dist-lambda/  (handler = server/index.handler)
const codeDir = path.resolve(__dirname, "..", "app", "dist-lambda");

const role = new aws.iam.Role("spike-role", {
  name: "linerobot-spike-astro-role",
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { Service: "lambda.amazonaws.com" },
        Action: "sts:AssumeRole",
      },
    ],
  }),
});

new aws.iam.RolePolicyAttachment("spike-basic", {
  role: role.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

const fn = new aws.lambda.Function("spike-ssr", {
  name: "linerobot-spike-astro-ssr",
  runtime: "nodejs22.x",
  architectures: ["arm64"],
  handler: "server/index.handler",
  code: new pulumi.asset.FileArchive(codeDir),
  role: role.arn,
  timeout: 15,
  memorySize: 512,
});

// Public HTTPS endpoint. authType NONE auto-creates the public lambda:InvokeFunctionUrl permission.
const fnUrl = new aws.lambda.FunctionUrl("spike-url", {
  functionName: fn.name,
  authorizationType: "NONE",
});

exports.functionUrl = fnUrl.functionUrl;
exports.functionName = fn.name;
