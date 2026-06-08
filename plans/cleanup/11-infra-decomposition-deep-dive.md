# Deep dive: is the infra decomposition (#1 / P2 #11 + #20) *proper* and safe?

> Verdict up front: **the decomposition is safe and worth doing — but ONLY as a pure functional split
> that preserves every Pulumi logical name, and NEVER as a `ComponentResource` refactor.** The role
> helper (`lambdaRole`) is a clear win; the `botLambda` helper is marginal. Unlike the bot cleanups,
> this cannot be proven by the test suite — it is proven by **`pulumi preview` showing a zero-change
> diff**. Do it only with appetite to run that preview carefully.

## Why infra is a different animal

The bot units (10–17) were provable: `typecheck + lint + 281 unit + 27 integration`, byte-identical
diffs. Infra has none of that. Pulumi tracks each resource by its **URN**, which is derived from its
**logical name** — the first string arg to `new aws.X("name", …)` — *not* its source location. So:

- Moving `new aws.lambda.Function("processor", {…})` from `index.ts` into `infra/src/lambdas.ts`,
  called identically, yields the **same URN → no change**. ✅ Safe.
- Anything that changes a resource's URN makes Pulumi **destroy the old and create a new one**.

The only correctness proof is: build the bundles, then `pulumi preview` and confirm it reports
**only no-ops** (0 to create / 0 to replace / 0 to update). Any diff = a mistake to fix before `up`.

## The trap that would cause a production outage

The "proper Pulumi way" to make a reusable Lambda component is
`class BotLambda extends pulumi.ComponentResource`. **Do NOT do that here.** Wrapping the existing
resources in a component re-parents every child, which **changes every URN**, so Pulumi would
**replace all five Lambdas, their roles, log groups, and — critically — the ingest Function URL**.
That URL is the LINE webhook endpoint: replacing it changes the hostname, silently breaking inbound
webhooks until the LINE console is re-pointed. (And a careless rename of a table/queue logical name
would replace *those* — i.e. data loss.) The whole refactor must therefore be **plain functions that
`new` resources with the exact original names**, never components, never renamed.

Confirmed: the current file has **no `ComponentResource` and no custom parenting** — all ~60
resources are flat `new aws.X(...)`. So a flat functional split preserves identity perfectly.

## What's actually in the file (≈60 resources, all flat)

Linear and section-commented already, so it reads OK as-is; the problem is length + 5× boilerplate:

- **Storage:** 3 DynamoDB tables, 1 S3 archive bucket (+4 config resources), 2 SQS queues, 3 SSM params.
- **IAM:** 4 lambda roles (ingest/processor/sweep/reminder) + read-api role — each a **uniform triple**
  `Role("<svc>-role", {name:`${prefix}-<svc>`}) + RolePolicyAttachment("<svc>-basic") +
  RolePolicy("<svc>-policy", {…statements…})`. Only the **policy statements differ**.
- **Compute:** 4 log groups + 5 Functions + 5 aliases — each Function a **uniform skeleton**
  (`runtime NodeJS22dX, architectures arm64, handler index.handler, publish true,
  loggingConfig JSON`) with **per-Lambda** name / timeout / memory / env / role / code path /
  logGroup / `dependsOn`. Triggers diverge: ingest+read-api `FunctionUrl`; processor
  `EventSourceMapping`; sweep+reminder `EventRule + EventTarget + Permission`.
- **Mini-app:** private S3 bucket + PAB + OAC + CloudFront distribution + bucket policy + an asset
  loop (`BucketObjectv2("miniapp-asset:${file.key}")`). A self-contained block.
- **Cross-cutting values threaded everywhere:** `prefix`, `stack`, `lambdaAssumeRole`,
  `ssmKmsDecrypt`, `logRetentionDays`, `commonEnv`, `readApiEnv`, plus resource ARNs/names.

## Part A — decomposition (#11): SAFE, the recommended win

Split into `infra/src/{storage,iam,lambdas,miniapp}.ts` as **plain functions** that take their
dependencies as args and return the resources, called in order from `index.ts`. Hard rules:

1. **Preserve every logical name string verbatim** (`"ingest-role"`, `"processor"`, `"miniapp-cdn"`,
   `"miniapp-asset:${file.key}"`, …). This is the entire safety property.
2. **No `ComponentResource`.** Plain functions only.
3. **Thread the shared values + `dependsOn` explicitly** (the reference graph must be byte-identical;
   Pulumi builds its DAG from references, so source *order* doesn't matter, but `dependsOn` does).
4. **Leave the `FileArchive("../packages/bot/dist/<svc>")` paths exactly as-is.** Pulumi resolves them
   relative to the **project root (`infra/`)**, not the source file — so they stay correct after the
   move and must NOT be "fixed" for the new file location.

Verification: `npm run build` (the archives point at `dist/`), then `cd infra && pulumi preview` →
must be **all no-ops**. Then `pulumi up`.

## Part B — helpers (#20): one yes, one marginal

- **`lambdaRole(svc, statements)` → Role + basic attachment + policy: do it.** The triple is genuinely
  uniform; generating `${svc}-role` / `${svc}-basic` / `${svc}-policy` and `name:${prefix}-${svc}`
  reproduces the exact URNs, and the meaningful part (the statements) stays explicit at the call site.
  ~5× boilerplate → one helper, low risk.
- **`botLambda(svc, opts)` → LogGroup + Function + Alias: marginal — I'd skip or keep it thin.** The
  Functions diverge enough (env, timeout, memory, triggers) that the helper captures only the constant
  shell while concentrating the replace-risk (a generated `name` mismatch replaces the Function and its
  URL). The boilerplate it removes is mostly the 5 constant lines (runtime/arch/handler/publish/
  logFormat). If wanted, a thin `lambdaLogGroup(svc)` + keeping Functions explicit is the better
  risk/reward. Each Function staying spelled-out also keeps its timeout/memory/triggers obvious.

## Honest priority verdict

This is the **highest structural value** remaining (biggest file, real 5× duplication) **but the
lowest verification confidence and the largest blast radius** — a slip can change the webhook URL or
replace a table. The file is already linear and section-commented, so it's navigable as-is; the win is
real but not urgent.

**Recommendation:** when there's appetite for a careful `pulumi preview` + deploy window, do it as a
single change = **decomposition (Part A) + `lambdaRole` (Part B-yes)**, skip `botLambda`. Gate the
entire thing on a **zero-change preview**; if the diff shows any replace/update, a name or property
drifted — fix before `up`. Do **not** bundle this casually with bot work, and do **not** let a
"proper Pulumi components" instinct turn it into a `ComponentResource` rewrite.
