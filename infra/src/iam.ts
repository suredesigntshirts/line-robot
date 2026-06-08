import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { lambdaAssumeRole, prefix } from "./naming";

/**
 * One least-privilege Lambda execution role: the {@link aws.iam.Role} + the AWS-managed basic
 * execution attachment + an inline policy carrying the given statements.
 *
 * `svc` reproduces the original logical names EXACTLY — `${svc}-role` / `${svc}-basic` /
 * `${svc}-policy`, with the role named `${prefix}-${svc}` — so converting a hand-rolled triple to a
 * `lambdaRole(...)` call is a no-op to Pulumi (same URNs, same physical names). The meaningful part,
 * the policy statements, stays explicit at the call site. Returns the Role so the caller can reference
 * `.arn` for its Function.
 */
export function lambdaRole(svc: string, statements: Record<string, unknown>[]): aws.iam.Role {
  const role = new aws.iam.Role(`${svc}-role`, {
    name: `${prefix}-${svc}`,
    assumeRolePolicy: lambdaAssumeRole,
  });
  new aws.iam.RolePolicyAttachment(`${svc}-basic`, {
    role: role.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  });
  new aws.iam.RolePolicy(`${svc}-policy`, {
    role: role.id,
    policy: pulumi.jsonStringify({ Version: "2012-10-17", Statement: statements }),
  });
  return role;
}
