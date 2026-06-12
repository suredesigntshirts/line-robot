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

// ---------------------------------------------------------------------------
// Q-SA1: the Postgres connection-budget algebra (db.t4g.micro ≈ 85 max
// connections). Every Lambda that opens the @line-robot/db pool holds at most
// POOL_PER_LAMBDA connections per concurrent execution, so the inequality
//   Σ(reservedConcurrency × POOL_PER_LAMBDA) ≤ PG_CONNECTION_BUDGET
// is enforced AT PREVIEW TIME below — exceeding it is a deploy-time error, not
// a production outage. Budget = 60 of ~85, leaving headroom for migrations,
// db:seed, psql sessions and RDS internals.
// SQS algebra (processor): unchanged for v2 — the processor never touches
// Postgres (interactive v1 path; Stage 5 revisits); visibility stays 6× its
// timeout, maxReceiveCount 5 → DLQ, batchSize 10 with partial-batch reporting.
// ---------------------------------------------------------------------------
export const PG_CONNECTION_BUDGET = 60;
export const POOL_PER_LAMBDA = 2; // packages/db/src/pool.ts max:2 (D-S1-4)
/** Sweep: rate(2 min) cron × 180s timeout ⇒ ≤2 natural overlaps; 3 = headroom. */
export const SWEEP_RESERVED_CONCURRENCY = 3;
/** Website SSR: 20 concurrent renders is ample for staging and caps DB pressure. */
export const WEBSITE_RESERVED_CONCURRENCY = 20;

const pgConsumers = SWEEP_RESERVED_CONCURRENCY + WEBSITE_RESERVED_CONCURRENCY;
if (pgConsumers * POOL_PER_LAMBDA > PG_CONNECTION_BUDGET) {
  throw new Error(
    `Q-SA1 violation: ${pgConsumers} reserved Lambda executions × ${POOL_PER_LAMBDA} pooled ` +
      `connections exceeds the ${PG_CONNECTION_BUDGET}-connection Postgres budget`,
  );
}

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
