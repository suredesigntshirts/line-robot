import * as aws from "@pulumi/aws";
import { prefix } from "./naming";

// ---------------------------------------------------------------------------
// A5 (Stage 2 cutover hardening): make a production Lambda erroring observable
// instead of silent. One SNS topic + one CloudWatch alarm per production Lambda
// (Errors >= 1 in a 5-minute window). The cron Lambdas (sweep, reminder) sit
// idle most ticks, so `treatMissingData: notBreaching` keeps "no invocations"
// from reading as a failure — the alarm only fires on a real error datapoint.
//
// No subscription is created here: a staging topic with no subscribers is fine,
// and who/how to notify (email, chatbot) is a founder choice — subscribe with
// `aws sns subscribe --topic-arn <arn> --protocol email --notification-endpoint <addr>`.
// ---------------------------------------------------------------------------

/** Lambda functions to alarm on, by their CloudWatch `FunctionName` dimension. */
export interface AlarmTargets {
  processorFn: aws.lambda.Function;
  sweepFn: aws.lambda.Function;
  reminderFn: aws.lambda.Function;
  readApiFn: aws.lambda.Function;
}

export interface Alarms {
  topic: aws.sns.Topic;
}

/** An SNS topic + a per-Lambda `Errors >= 1` alarm wired to it (the four production Lambdas). */
export function createAlarms(targets: AlarmTargets): Alarms {
  const topic = new aws.sns.Topic("alarms", { name: `${prefix}-alarms` });

  // logical name → the Lambda whose Errors metric we watch. The logical names match the existing
  // `${svc}` convention (processor/sweep/reminder/read-api) so the alarm URNs read at a glance.
  const lambdas: Record<string, aws.lambda.Function> = {
    processor: targets.processorFn,
    sweep: targets.sweepFn,
    reminder: targets.reminderFn,
    "read-api": targets.readApiFn,
  };

  for (const [svc, fn] of Object.entries(lambdas)) {
    new aws.cloudwatch.MetricAlarm(`${svc}-errors-alarm`, {
      name: `${prefix}-${svc}-errors`,
      alarmDescription: `${prefix}-${svc} Lambda logged one or more errors in a 5-minute window`,
      namespace: "AWS/Lambda",
      metricName: "Errors",
      dimensions: { FunctionName: fn.name },
      statistic: "Sum",
      period: 300,
      evaluationPeriods: 1,
      threshold: 1,
      comparisonOperator: "GreaterThanOrEqualToThreshold",
      treatMissingData: "notBreaching",
      alarmActions: [topic.arn],
    });
  }

  return { topic };
}
