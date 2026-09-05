# Infra & Build — Code Quality Findings

## Summary

The infrastructure and build setup is generally clean: least-privilege IAM is carefully maintained per Lambda, the Pulumi structure is readable, and the esbuild bundler config is straightforward. The most significant concern is a growing monolithic `infra/index.ts` (760 lines, five Lambdas, two EventBridge schedules, a CloudFront distribution, and five IAM roles) with no decomposition. A secondary structural problem is a single shared `EnvSchema` in the bot package that forces the read-only `read-api` Lambda to receive environment variables it has no IAM permission to use, creating a tight coupling between unrelated Lambda roles.

## Findings

### [F01] `infra/index.ts` is a 760-line monolith with no decomposition
**Severity:** medium
**File:** `infra/index.ts:1-760`
**Issue:** All five Lambda roles, five IAM policies, five log groups, five Lambda functions, two EventBridge schedules, a CloudFront distribution, and S3/DynamoDB/SQS resources live in a single file. Adding the mini-app (plan 14) alone pushed it past 750 lines. At this scale, navigation requires scrolling past unrelated sections to find a specific resource. There is an `src/` directory listed in the infra tsconfig but it is empty — the skeleton for splitting was set up and never used.
**Suggestion:** Extract into modules: `infra/src/storage.ts` (DynamoDB + S3 + SQS), `infra/src/iam.ts` (roles + policies), `infra/src/lambdas.ts` (functions + aliases + event sources), `infra/src/miniapp.ts` (CloudFront + site bucket). `index.ts` becomes an orchestrator that imports and wires them. Each file stays under 150 lines.

---

### [F02] Single shared `EnvSchema` forces read-api Lambda to carry unused required env vars
**Severity:** medium
**File:** `packages/bot/src/adapters/config/config.ts:7-22`, `infra/index.ts:404-415`
**Issue:** `EnvSchema` requires `MESSAGES_TABLE`, `IDEMPOTENCY_TABLE`, `CHANNEL_SECRET_PARAM`, and `CHANNEL_ACCESS_TOKEN_PARAM` as non-optional fields. The `read-api` Lambda calls `loadEnv()` at cold start, so `commonEnv` must inject all four of these values even though the read-api Lambda has no IAM permission to access those SSM parameters or those DynamoDB tables. The env vars are set but permanently inaccessible, turning them into noise that misleads the IAM diff reader. The infra comment at line 632 ("so the existing Lambdas stay byte-identical") acknowledges the tension but patches around it instead of fixing it.
**Suggestion:** Define a `ReadApiEnvSchema` in `config.ts` (or a `read-api/config.ts`) that requires only `CATALOG_TABLE`, `ARCHIVE_BUCKET`, and `LIFF_CHANNEL_ID`. The read-api Lambda calls `loadReadApiEnv()` instead of `loadEnv()`. The infra then constructs a scoped env object for `readApiFn` with only the vars it legitimately uses, and the IAM policy and the env object tell the same story.

---

### [F03] `Pulumi.yaml` description is stale and `Environment` tag is hardcoded to `staging`
**Severity:** low
**File:** `infra/Pulumi.yaml:3`, `infra/Pulumi.yaml:8`
**Issue:** The project description still reads `"LINE echo bot infrastructure — Lambda (ingest + processor), SQS, DynamoDB, S3, SSM"` — it omits sweep, reminder, read-api, and the CloudFront mini-app. More importantly, `aws:defaultTags` hardcodes `Environment: staging` at the project level. If a second stack (e.g. `prod`) is ever provisioned, every resource in the prod stack will be tagged `Environment: staging`. Pulumi supports `pulumi.getStack()` as a config value expression, but not directly inside `Pulumi.yaml` — the usual fix is to move the tag into `index.ts` dynamically.
**Suggestion:** Fix the description. Move the `Environment` tag out of `Pulumi.yaml` and into `index.ts` using `aws.defaultTags` with `{ Environment: stack }` (or a map from stack name to environment string), so a prod stack gets `Environment: prod` automatically.

---

### [F04] Hardcoded AWS-managed CloudFront cache policy UUID
**Severity:** low
**File:** `infra/index.ts:684`
**Issue:** `cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6"` is the well-known UUID for `Managed-CachingOptimized` but this is invisible without a comment or lookup. A reader who doesn't recognize the UUID has to Google it to understand the cache behavior.
**Suggestion:** Either add an inline comment with the policy name (as a minimum), or use `aws.cloudfront.getCachePolicyOutput({ name: "Managed-CachingOptimized" })` to look it up by name so the code is self-documenting. The lookup approach is preferred because it breaks loudly if AWS ever retires the UUID rather than silently using a wrong policy.

---

### [F05] Orphaned Pulumi config entries: `assertionPrivateKey` and `assertionKeyId`
**Severity:** low
**File:** `infra/Pulumi.staging.yaml:20-23`, `infra/index.ts` (absent)
**Issue:** `line-robot:assertionPrivateKey` and `line-robot:assertionKeyId` are set in `Pulumi.staging.yaml` and `infra/assertion-public-key.jwk.json` exists in the repo, but neither is referenced anywhere in `infra/index.ts`. They appear to be a preparation for LINE channel access token v2.1 (stateless JWT signing) that was never wired up. They add confusion when reading the config — a reviewer cannot tell whether they are intentionally deferred or accidentally dropped.
**Suggestion:** If this feature is deferred, add a comment in `Pulumi.staging.yaml` next to the keys explaining their purpose and the plan they belong to. If it was abandoned, remove the config entries and the `infra/assertion-public-key.jwk.json` file.

---

### [F06] SQS visibility timeout comment is arithmetically misleading
**Severity:** low
**File:** `infra/index.ts:194`
**Issue:** The comment reads `// >= 6x the processor timeout` but `visibilityTimeoutSeconds: 180` is exactly `6 × 30` — the minimum safe value, not "at least" 6x. The `>=` wording implies there is slack, when in fact there is none. If the processor timeout is ever raised without updating this value, the comment will mask the hazard.
**Suggestion:** Change to `// 6× the processor timeout (30 s) — the minimum to avoid spurious re-deliveries during batch-item-failure processing`. Better yet, derive the value: `const processorTimeout = 30; const visibilityTimeoutSeconds = 6 * processorTimeout;` and reference `processorTimeout` in both the SQS queue and the Lambda function definition, so they stay in sync automatically.

---

### [F07] `miniapp` `tsconfig.json` does not extend `tsconfig.base.json`; bot misses `noUnusedLocals`/`noUnusedParameters`
**Severity:** low
**File:** `packages/miniapp/tsconfig.json:1`, `tsconfig.base.json`
**Issue:** The miniapp has a standalone `tsconfig.json` with `"target": "ES2022"`, `"module": "ESNext"`, `noUnusedLocals: true`, and `noUnusedParameters: true`. The bot extends `tsconfig.base.json` but the base does not declare `noUnusedLocals` or `noUnusedParameters`, so those stricter checks are absent from the bot package. The two packages have inconsistent strictness levels with no documented intent. The infra `tsconfig.json` also stands alone (justified by its CommonJS runtime requirement) but its `"target": "ES2020"` diverges from the base's `"ES2022"` with no comment.
**Suggestion:** Add `noUnusedLocals: true` and `noUnusedParameters: true` to `tsconfig.base.json` so all packages that extend it inherit them. Update the miniapp tsconfig to `extends: "../../tsconfig.base.json"` and override only what is browser/bundler-specific (`lib`, `module`, `moduleResolution`, `jsx`, `jsxImportSource`). Add a comment to the infra tsconfig explaining why it cannot extend the base.

---

### [F08] `@esbuild/linux-x64` pinned as the only esbuild platform binary
**Severity:** low
**File:** `packages/bot/package.json:29`
**Issue:** `@esbuild/linux-x64` is in `devDependencies` as the sole esbuild platform shim. This works on x86-64 Linux CI and x86-64 Mac under Rosetta but fails on Apple Silicon natively or on ARM CI runners. The Lambda target is `arm64`, which is unrelated (esbuild outputs architecture-agnostic JS), but the mismatch in the dev binary is a latent "works on my machine" hazard.
**Suggestion:** Replace the pinned platform binary with esbuild's automatic platform detection: remove `@esbuild/linux-x64` from the explicit devDependencies and let npm install the correct optional dependency for the host. Alternatively, add both `@esbuild/linux-x64` and `@esbuild/linux-arm64` as optional dependencies so CI on either architecture works.

---

### [F09] `infra` Pulumi dependencies listed as `dependencies` rather than `devDependencies`
**Severity:** low
**File:** `infra/package.json:7-10`
**Issue:** `@pulumi/aws` and `@pulumi/pulumi` are listed under `dependencies`. For a private, never-published package this has no runtime consequence, but it is semantically wrong: these are build/deploy tools, not runtime library dependencies. It creates a mismatch with the mental model of the workspace (`packages/bot` has a `dependencies`/`devDependencies` split that reflects actual runtime vs build-time usage).
**Suggestion:** Move both to `devDependencies` in `infra/package.json`. Pulumi resolves them from `node_modules` regardless of category in a private workspace.

---

### [F10] `miniapp` vitest config has no coverage configuration; `@vitest/coverage-istanbul` is unused there
**Severity:** low
**File:** `packages/miniapp/vitest.config.ts:1-10`, `package.json:23`
**Issue:** `@vitest/coverage-istanbul` is a root-level `devDependency` (implying it is used by both packages), but the miniapp's `vitest.config.ts` has no `coverage` block and `npm test` in the miniapp never generates a coverage report. The bot correctly runs `vitest run --coverage` on every test invocation; the miniapp runs bare `vitest run`. Whether coverage is intentionally omitted for the miniapp (its logic is thin) or accidentally missing is unclear from reading the config.
**Suggestion:** If coverage for the miniapp is intentionally skipped, move `@vitest/coverage-istanbul` from the root `package.json` into `packages/bot/package.json` as a devDependency, which is the only package that uses it. If coverage is wanted for the miniapp too, add a `coverage` block to `packages/miniapp/vitest.config.ts` and update the test script.

---

### [F11] `Pulumi.yaml` description refers to project as "LINE echo bot"
**Severity:** low
**File:** `infra/Pulumi.yaml:3`
**Issue:** `description: LINE echo bot infrastructure` — the project is now a real-estate catalog assistant with a LIFF mini-app, debounced AI ingestion, reminder sweeps, and CloudFront hosting. The "echo bot" label is a relic of the very first plan.
**Suggestion:** Update to something like `"LINE real-estate catalog assistant — Lambda (ingest/processor/sweep/reminder/read-api), SQS, DynamoDB, S3, CloudFront, SSM"`.

## Cross-cutting patterns

**Repetitive IAM boilerplate.** Every Lambda follows an identical four-step pattern: `new Role` + `new RolePolicyAttachment` (basic execution) + `new RolePolicy` (custom) + optional `new LogGroup`. Across five functions this is 60+ near-identical lines. A helper `function lambdaRole(name, statements)` that returns `{ role, logGroup }` would cut this to a single call per function and make the IAM diff reviewable in terms of the `statements` array alone.

**Repetitive Lambda function + alias blocks.** Each of the five functions repeats the same set of properties (`runtime`, `architectures: ["arm64"]`, `handler: "index.handler"`, `publish: true`, `loggingConfig`) with only `name`, `code`, `role`, `timeout`, `memorySize`, and `environment` varying. A helper `function botLambda(opts)` with sensible defaults would eliminate the boilerplate and ensure a new Lambda cannot accidentally omit `publish: true` or `architectures`.

**commonEnv as a leaky abstraction.** The `commonEnv` object was the right call when there were two similar Lambdas. With five Lambdas serving very different purposes (webhook ingestion, message processing, AI sweep, reminder push, read-only API), the common env has become a grab-bag. Each Lambda's comment in the infra carefully explains what it does and does not need, but the actual env injection tells a different story. Consider scoped env builders (`botEnv()`, `sweepEnv()`, `readApiEnv()`) that compose from a shared base only what each role legitimately uses.
