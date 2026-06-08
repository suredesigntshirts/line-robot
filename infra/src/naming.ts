import * as pulumi from "@pulumi/pulumi";

// ---------------------------------------------------------------------------
// Cross-cutting configuration shared by every module. These are plain values
// (no resources), so importing them anywhere is free and side-effect-free.
// ---------------------------------------------------------------------------
export const config = new pulumi.Config();
export const stack = pulumi.getStack();
export const prefix = `linerobot-${stack}`;
export const awsRegion = new pulumi.Config("aws").require("region");
export const logRetentionDays = config.getNumber("logRetentionDays") ?? 14;

/** Processor Lambda timeout (seconds). The SQS `events` queue derives its visibility timeout from
 * this (6× — see storage.ts) so a redelivery can't fire while the processor is still working. */
export const PROCESSOR_TIMEOUT_SECONDS = 30;

/** Trust policy shared by every Lambda execution role. */
export const lambdaAssumeRole = JSON.stringify({
  Version: "2012-10-17",
  Statement: [
    { Action: "sts:AssumeRole", Effect: "Allow", Principal: { Service: "lambda.amazonaws.com" } },
  ],
});

// SSM SecureString decrypt, restricted to access made via the SSM service.
export const ssmKmsDecrypt = {
  Effect: "Allow",
  Action: ["kms:Decrypt"],
  Resource: "*",
  Condition: { StringEquals: { "kms:ViaService": `ssm.${awsRegion}.amazonaws.com` } },
};
