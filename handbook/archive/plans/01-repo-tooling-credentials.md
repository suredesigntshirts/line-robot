# 01 — Repo, Tooling, Credentials & Doc Gaps

**Goal:** a green, fully-wired skeleton plus working AWS + Pulumi access, and the missing Pulumi
docs fetched. No bot logic yet.
**Prerequisite:** none (first stage). See `00-overview.md` for architecture & decisions.

## Work items

### 1. Git + workspaces
- `git init` at repo root; ensure `.gitignore` (already present) covers `node_modules/`, `dist/`,
  `.env*`, Pulumi state.
- Convert to **npm workspaces**. Root `package.json`:
  ```jsonc
  {
    "name": "line-robot",
    "private": true,
    "workspaces": ["packages/*", "infra"],
    "scripts": {
      "typecheck": "tsc -b",
      "lint": "biome check .",
      "format": "biome format --write .",
      "test": "vitest run",
      "build": "npm -w packages/bot run build"
    }
  }
  ```
- Create `packages/bot/` and `infra/` workspace folders (each with its own `package.json` +
  `tsconfig.json` extending `tsconfig.base.json`).
- **Move** the existing `@line/bot-sdk` dependency from root into `packages/bot/package.json`.

### 2. Toolchain config
- `tsconfig.base.json`: `"strict": true`, `"target":"ES2022"`, `"module":"NodeNext"`,
  `"moduleResolution":"NodeNext"`, `"declaration":true`, `"composite":true`, `"noUncheckedIndexedAccess":true`.
- `biome.json`: enable linter + formatter (recommended ruleset); 2-space indent.
- `vitest.config.ts` in `packages/bot`: node environment, coverage provider `v8`, threshold
  `lines/functions/branches/statements ≥ 80` scoped to `src/core/**`.
- `.editorconfig`.

### 3. Dependencies (in `packages/bot` unless noted)
Runtime:
```
@line/bot-sdk
@aws-lambda-powertools/logger
@aws-lambda-powertools/idempotency
@aws-lambda-powertools/parameters
@aws-lambda-powertools/batch
@aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
@aws-sdk/client-s3
@aws-sdk/client-sqs
@aws-sdk/client-ssm
electrodb
zod
```
Dev:
```
typescript vitest @vitest/coverage-v8 @biomejs/biome esbuild
aws-sdk-client-mock aws-sdk-client-mock-jest
@types/node @types/aws-lambda
```
Infra (`infra/`): `@pulumi/pulumi @pulumi/aws typescript @types/node`.

### 4. Fill documentation gaps
Use the **`documentation-downloader`** skill to fetch the Pulumi AWS resources missing from
`docs/pulumi.com/` (confirmed missing in exploration):
- `aws.dynamodb.Table`
- `aws.cloudwatch.LogGroup`
- `aws.lambda.Alias` (note: there is **no** `aws.lambda.Version` resource — function
  versioning is the `publishVersion: true` attribute on `aws.lambda.Function`)
- `aws.s3.Bucket` / `aws.s3.BucketV2` (+ public-access-block, versioning, lifecycle)
- `aws.sqs.Queue` (+ redrive policy)

Confirm `docs/llms.txt` is back in sync afterward.

### 5. AWS credentials (not set up yet)
- Create a deploy identity in the AWS account: **IAM Identity Center (SSO) profile** preferred,
  or an IAM user with programmatic keys.
- Configure locally: `aws configure sso` (or `aws configure`), default region
  **`ap-southeast-1`**.
- Verify: `aws sts get-caller-identity` returns the expected account.

### 6. Pulumi Cloud
- `pulumi login` (Pulumi Cloud managed backend).
- Verify: `pulumi whoami`.

## Quality gates (must pass)
- **G1** `npm run typecheck` clean.
- **G2** `npm run lint` clean.
- **G3** `npm test` runs (a single placeholder test in `packages/bot` is fine).
- `aws sts get-caller-identity` succeeds in `ap-southeast-1`.
- `pulumi whoami` succeeds.
- `docs/llms.txt` in sync; the 5 missing Pulumi resource docs now present.

## Done criteria
Skeleton compiles, lints, tests; AWS + Pulumi CLIs authenticated; all required docs cached.

## References
- Pulumi TS layout: `docs/pulumi.com/docs/iac/languages-sdks/javascript.md`
- Pulumi projects/stacks: `docs/pulumi.com/docs/iac/concepts/{projects,stacks}.md`
