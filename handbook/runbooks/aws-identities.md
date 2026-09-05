# Runbook — AWS identities (shared account 259543826733, region ap-southeast-1)

- **`line-robot`** profile — the scoped deploy + runtime identity (`linerobot-*` ARNs only). Also
  granted staging-only data-plane **read** (DynamoDB GetItem/Query/Scan, S3, CloudWatch Logs) for
  verifying deploys/tests. Every `pulumi` and `aws` command for this project uses this profile.
- **`default`** profile = `tea-admin` (account admin, belongs to the founder's other project) — only
  needed to edit the deploy policy itself: `infra/deploy-user-policy.json` →
  `aws iam create-policy-version --profile default` (IAM caps a policy at 5 versions; prune the
  oldest non-default first with `aws iam delete-policy-version`).
- If a `pulumi up` hits `AccessDenied`, add the action to `infra/deploy-user-policy.json` and publish
  a new policy version — do not deploy as `default`.
- Staging posture: RDS publicly accessible + TLS forced at the engine (`rds.force_ssl=1`) + a
  generated 44-char password (Pulumi secret `dbPassword`; connection string output
  `dbConnectionString`). **Production hardening (pre-launch): private subnets + VPC endpoints/NAT,
  restricted security group.**
