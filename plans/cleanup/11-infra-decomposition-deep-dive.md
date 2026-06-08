# Infra decomposition (#1 / P2 #11 + #20) — production-ready implementation plan

> **Verdict:** implement it. The `lambdaRole(svc, statements)` helper is an unambiguous win (kills the
> only real duplication in the file); the 4-way module split is a medium-value, low-risk readability
> gain. Both are safe **as a pure functional split that preserves every Pulumi logical name** — proven,
> not asserted, by `pulumi preview --expect-no-changes` returning a clean exit (no replacements). The
> one structural rule: **never wrap the existing resources in a `ComponentResource`** (it re-parents
> every child → URN churn). If a name ever *must* change, the documented escape hatch is the `aliases`
> resource option, **not** a replace — see "Aliases" below.
>
> Grounded against the cached Pulumi docs (`docs/pulumi.com/`): components, resource options, inputs &
> outputs, and CLI exit codes. Citations inline.

## Why infra can't be proven the way the bot cleanups were

Units 10–17 were provable by `typecheck + lint + 281 unit + 27 integration` and byte-identical diffs.
Infra has none of that. Pulumi tracks each resource by its **URN**, derived from `(type, logical
name, parent)` — the logical name being the **first string arg** to `new aws.X("name", …)`, *not* the
source file or function it lives in. Two consequences:

- Moving `new aws.lambda.Function("processor", {…})` from `index.ts` into `infra/src/lambdas.ts`,
  called with the **same name and same parent (the stack)**, yields the **same URN → a no-op**. ✅
- Anything that changes a resource's URN — rename, or re-parent under a component — makes Pulumi
  **destroy the old and create a new one**.

The dependency graph that orders all of this is built from **output→input references and explicit
`dependsOn`**, *not* from source order:

> "Most dependencies between resources are automatically tracked by virtue of one resource's output
> being another resource's input. … For … dependencies … not defined by this output-to-input
> relationship, you can use the `dependsOn` resource option."
> — `docs/iac/concepts/inputs-outputs.md`

So splitting the program into functions that **take dependencies as args and return resource handles**
preserves the DAG exactly, as long as the same references and `dependsOn` edges are threaded through.
That is the entire safety argument for Part A.

## The trap: `ComponentResource` — and the `aliases` escape hatch

The "proper Pulumi way" to package reusable infra is `class BotLambda extends
pulumi.ComponentResource`. **Do not reach for that here.** A component is a real node in the resource
tree, and its children are **re-parented under it**:

> "When you run `pulumi up`, components appear as a resource tree … Child resources are displayed
> nested under their parent component."
> — `docs/iac/concepts/components.md`

Re-parenting changes each child's URN, so wrapping the *existing* ~60 flat resources in components
would **replace all five Lambdas, their roles, log groups, and — critically — the ingest Function
URL**. That URL is the LINE webhook endpoint; replacing it changes the hostname and silently breaks
inbound webhooks until the LINE console is re-pointed. (A careless rename of a table/queue logical name
would replace *those* — data loss.)

**This is survivable but not free.** Pulumi documents the `aliases` resource option precisely for
"renaming, moving, or otherwise restructuring resources without … recreating them" — it lets you tell
the engine "this URN used to be that URN," so a re-parent or rename is treated as the **same** resource
(`aliases` is in the resource-options table and has dedicated inheritance rules — `docs/iac/concepts/
resources/options.md`; the option index in `docs/iac/concepts/resources.md` links `#aliases →
/docs/iac/concepts/resources/options/aliases`). But to convert to components safely you would need an
alias on **every** re-parented resource (~60), and the preview would be a non-empty alias-resolution
diff rather than a clean no-op — strictly more risk and more bookkeeping than the goal (a structural
cleanup) is worth.

**Decision:** do the functional split (zero aliases, true zero-diff preview). Keep `aliases` in your
back pocket as the **recovery move** if the split accidentally drifts a name — alias the new name back
to the old URN instead of accepting a replace.

Confirmed against the live file: it has **no `ComponentResource` and no custom `parent`** — all ~60
resources are flat `new aws.X(...)` parented to the stack. So a flat functional split preserves
identity perfectly.

## What's actually in `infra/index.ts` (772 lines, ≈60 resources, all flat)

Linear and section-commented, so it reads OK; the cost is length + the 5× role boilerplate.

- **Cross-cutting values** (top of file): `config`, `stack`, `prefix`, `awsRegion`,
  `logRetentionDays`, `lambdaAssumeRole`, `ssmKmsDecrypt`, `commonEnv`, `readApiEnv`,
  `SITE_CONTENT_TYPES` + `listSiteFiles()`.
- **Storage:** 3 DynamoDB tables (`messages`/`idempotency`/`catalog`, the last with gsi1+gsi2), the
  `archive` S3 bucket + 4 config resources (PAB / versioning / SSE / lifecycle), 2 SQS queues
  (`dlq`/`events`), 3 SSM SecureString params.
- **IAM:** 5 lambda roles (`ingest`/`processor`/`sweep`/`reminder`/`read-api`) — each a **uniform
  triple**: `Role("<svc>-role", {name:`${prefix}-<svc>`}) + RolePolicyAttachment("<svc>-basic",
  {policyArn: AWSLambdaBasicExecutionRole}) + RolePolicy("<svc>-policy", {…statements…})`. **Only the
  policy statements differ.** This is the duplication the helper removes.
- **Compute (bot):** 4 log groups + 4 Functions (`ingest`/`processor`/`sweep`/`reminder`) + 4 aliases,
  each Function a **uniform skeleton** (`runtime NodeJS22dX, architectures arm64, handler
  index.handler, publish true, loggingConfig JSON, dependsOn:[logGroup]`) differing only in
  name/timeout/memory/env/role/code. Triggers diverge: ingest `FunctionUrl`; processor
  `EventSourceMapping`; sweep+reminder `EventRule + EventTarget + Permission`.
- **Mini-app (plan 14):** the **read-api** half (role + log group + Function + alias + **FunctionUrl
  whose CORS references the CloudFront domain**) plus the SPA host (private S3 + PAB + OAC +
  CloudFront distribution + bucket policy + the `listSiteFiles()` asset loop).
- **Outputs:** `webhookUrl` (=`ingestUrl.functionUrl`), table/bucket/queue names, `sweepFunctionName`,
  `reminderFunctionName`, `readApiUrlOutput`, `miniAppCloudFrontDomain`, `miniAppUrl`,
  `miniAppSiteBucket`.

## Module layout (the split)

```
infra/
  index.ts        # wiring + exports only — reads top-to-bottom as the deployment story
  src/
    naming.ts     # prefix, stack, awsRegion, logRetentionDays, lambdaAssumeRole, ssmKmsDecrypt
    iam.ts        # lambdaRole(svc, statements) helper  ← the high-value win
    storage.ts    # tables, archive bucket(+4 cfg), queues, SSM params  → returns handles
    lambdas.ts    # the 4 BOT lambdas (role+logGroup+fn+alias+triggers) → returns handles
    miniapp.ts    # read-api (role+logGroup+fn+alias+url) + S3/OAC/CloudFront/policy/assets
```

**Why read-api lives in `miniapp.ts`, not `lambdas.ts` (correction to the original sketch):** the
read-api `FunctionUrl`'s CORS `allowOrigins` references `siteDistribution.domainName` (index.ts:748).
Keeping read-api with the CDN keeps that reference inside one module; splitting them would force
`miniapp.ts` to hand its distribution back to `lambdas.ts`. read-api *is* the API half of the
mini-app — group it there.

### Concrete signatures and return shapes

```ts
// naming.ts — plain consts/exports, no resources
export const stack = pulumi.getStack();
export const prefix = `linerobot-${stack}`;
export const awsRegion = new pulumi.Config("aws").require("region");
export const logRetentionDays = config.getNumber("logRetentionDays") ?? 14;
export const lambdaAssumeRole = JSON.stringify({ /* … unchanged … */ });
export const ssmKmsDecrypt = { /* … unchanged, uses awsRegion … */ };

// iam.ts — the helper. svc reproduces the exact original names + role name.
export function lambdaRole(svc: string, statements: pulumi.Input<any>[]): aws.iam.Role {
  const role = new aws.iam.Role(`${svc}-role`, { name: `${prefix}-${svc}`, assumeRolePolicy: lambdaAssumeRole });
  new aws.iam.RolePolicyAttachment(`${svc}-basic`, {
    role: role.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  });
  new aws.iam.RolePolicy(`${svc}-policy`, { role: role.id, policy: pulumi.jsonStringify({ Version: "2012-10-17", Statement: statements }) });
  return role;
}

// storage.ts
export function createStorage(): {
  messagesTable; idempotencyTable; catalogTable; archiveBucket;
  dlq; eventsQueue; channelSecretParam; channelAccessTokenParam; anthropicApiKeyParam;
} { /* the Storage + Queue + Secrets sections, names verbatim */ }

// lambdas.ts — takes storage handles + the shared env; returns what index.ts must export/ref
export function createBotLambdas(s: Storage): { ingestUrl; sweepFn; reminderFn } {
  const ingestRole = lambdaRole("ingest", [ /* statements, referencing s.eventsQueue/… */ ]);
  // … processor/sweep/reminder roles via lambdaRole(...)
  // … 4 log groups, 4 functions (explicit), 4 aliases, triggers — names verbatim
}

// miniapp.ts — takes only what it reads
export function createMiniApp(s: Pick<Storage, "catalogTable" | "archiveBucket">): {
  readApiUrl; siteDistribution; siteBucket;
} { /* read-api via lambdaRole("read-api", …) + S3/OAC/CDN/policy/assets, names verbatim */ }
```

`index.ts` becomes: build `naming` (imported), `const s = createStorage()`, `const { ingestUrl,
sweepFn, reminderFn } = createBotLambdas(s)`, `const { readApiUrl, siteDistribution, siteBucket } =
createMiniApp(s)`, then the `export const …` block referencing those handles — **identical output
names and values.**

## Hard rules (the safety property)

1. **Preserve every logical-name string verbatim** — `"ingest-role"`, `"processor"`, `"sweep-target"`,
   `"miniapp-cdn"`, `"miniapp-asset:${file.key}"`, the SSM param logical names, etc. `lambdaRole(svc,…)`
   must generate **exactly** `${svc}-role` / `${svc}-basic` / `${svc}-policy` and role name
   `${prefix}-${svc}`. This is the whole game.
2. **No `ComponentResource`, no `parent:` option.** Plain functions only.
3. **Thread shared values + every `dependsOn` explicitly.** The reference graph (and `dependsOn:
   [logGroup]` on each Function) must be byte-identical; the engine rebuilds the DAG from references,
   so source *order* is free but **edges are not**.
4. **Two relative-path landmines — they are NOT the same:**
   - **`FileArchive("../packages/bot/dist/<svc>")` — leave exactly as-is.** A `FileArchive` relative
     path resolves against the **Pulumi program's working directory = the project root `infra/`**
     (where `Pulumi.yaml` lives), *not* the source file. Moving the call into `infra/src/lambdas.ts`
     keeps `../packages/bot/dist/...` correct. Do **not** "fix" it.
   - **`MINIAPP_DIST = path.resolve(__dirname, "../packages/miniapp/dist")` — MUST be adjusted if
     moved.** Unlike `FileArchive`, this uses `__dirname`, which is **source-file**-relative. From
     `infra/index.ts`, `__dirname` is `infra/`, so `../packages/miniapp/dist` → `<repo>/packages/
     miniapp/dist` ✅. Move `listSiteFiles()` into `infra/src/miniapp.ts` and `__dirname` becomes
     `infra/src/`, so the same string resolves to `infra/packages/miniapp/dist` ❌ — `listSiteFiles()`
     silently returns `[]` and **the SPA upload vanishes from the plan with no error**. Fix: add one
     `../` (`"../../packages/miniapp/dist"`), **or** compute `MINIAPP_DIST` in `index.ts` and pass it
     into `createMiniApp`. The latter is safer (keeps the path next to the project root it's relative
     to). This is the single subtlest correctness bug in the whole change — a clean `preview` will even
     *hide* it (fewer `BucketObjectv2` resources looks like "nothing to do" if dist isn't built), so
     **verify with the SPA actually built.**

## Part B — the helpers

- **`lambdaRole(svc, statements)` → do it.** The Role+attachment+policy triple is genuinely uniform
  across all 5 services; the helper reproduces the exact three URNs and role name, and the meaningful
  part (the policy statements) stays explicit at each call site. ~5× ~15-line blocks → one ~8-line
  helper. **This is the change's center of gravity** — the only real duplication, removed at zero URN
  risk.
- **`botLambda`/`lambdaFunction` (LogGroup+Function+Alias) → skip.** The Functions diverge enough
  (timeout 10/30/180/60, memory 256/512, env, triggers) that a helper would capture only the constant
  shell (`runtime/arch/handler/publish/loggingConfig`) while **concentrating replace-risk** (a
  generated `name`/logGroup mismatch replaces the Function *and* its URL). Keeping each Function
  spelled out also keeps its timeout/memory/trigger obvious at a glance. Not worth it; leave explicit.

## Verification — the production gate

Infra correctness = **a clean preview**, made scriptable with `--expect-no-changes`:

```bash
# 0. one-time: same env as a deploy (CLAUDE.md "Deploying")
export PATH="$HOME/.pulumi/bin:$PATH"
export AWS_PROFILE=line-robot
export PULUMI_CONFIG_PASSPHRASE="$(cat ~/.line-robot-pulumi-passphrase)"

# 1. build BOTH bundles first — FileArchive points at packages/bot/dist/*,
#    and the miniapp __dirname check only holds when packages/miniapp/dist EXISTS.
npm run build

# 2. typecheck the program (catches the function-signature threading before Pulumi runs)
npm --prefix infra run typecheck   # or: cd infra && npx tsc --noEmit

# 3. THE GATE — preview must be a pure no-op.
cd infra && pulumi preview --expect-no-changes --diff
#   exit 0  → identical resource graph, safe to proceed.            (docs/iac/cli/exit-codes.md)
#   exit 7  → "No changes" expectation NOT met: a name/property drifted. STOP, read the --diff,
#             fix the logical name (or alias it back), re-preview. Do NOT `up`.
```

**Use the gate on `preview`, never on `up`.** The cached `pulumi up` reference notes
`--expect-no-changes` on `up` "happens **after** the update is applied" (`docs/iac/cli/commands/
pulumi_up.md`) — i.e. it would mutate first, then error. `preview` evaluates the diff **without
touching anything**, which is exactly the pre-flight we want. Only after a clean (exit-0) preview:

```bash
cd infra && pulumi up        # review the "0 to create / 0 to replace / 0 to update", then "yes"
```

A clean preview means the refactor changed **zero** infrastructure — which is the point: this is a
source-code reorganization, and the deployed stack must not feel it.

## Step-by-step implementation order

Each step ends green before the next; the `preview` gate runs after the *whole* split (the program
must compile to preview at all):

1. `git switch -c infra-decompose` (don't refactor infra on `main`).
2. **`naming.ts` + `iam.ts`** — move the cross-cutting consts and add `lambdaRole`. No call sites yet.
3. **`storage.ts`** — move Storage+Queue+Secrets, export `createStorage()`. Wire it in `index.ts`;
   `npm --prefix infra run typecheck`.
4. **`lambdas.ts`** — move the 4 bot lambdas, converting each role to `lambdaRole(svc, statements)`.
   Return `{ ingestUrl, sweepFn, reminderFn }`. Re-typecheck.
5. **`miniapp.ts`** — move read-api + SPA host; **apply the `MINIAPP_DIST` `__dirname` fix** (or pass
   it in). Return `{ readApiUrl, siteDistribution, siteBucket }`. Re-typecheck.
6. **`index.ts`** — should now be imports + `createStorage()`/`createBotLambdas()`/`createMiniApp()` +
   the `export const` block. Confirm every original `export const` is present with the same name.
7. **Build → typecheck → `pulumi preview --expect-no-changes --diff`.** Iterate to exit 0.
8. `pulumi up` (clean), then a smoke check (webhook still answers; `pulumi stack output webhookUrl`
   unchanged). Commit. Open PR.

## Rollback

- **Pre-`up`:** it's pure source — `git restore`/branch-delete, nothing deployed.
- **Post-`up`:** if a name slipped through and `up` replaced something, `git revert` the commit and
  `pulumi up` back to the original names (URNs restore). If a Function URL was replaced, also
  re-point the LINE console webhook (and re-set the rich menu token if touched). The per-stack Lambda
  **aliases** (`name: stack`) remain stable rollback targets for the *function version*, independent
  of this refactor.

## Honest appropriateness verdict

- **`lambdaRole` helper:** clearly appropriate. It removes the file's only real duplication with no
  structural risk — exactly the spirit of units 10–11.
- **The 4-way split:** appropriate but **medium-value, not urgent.** The file is already linear and
  section-commented, so the win is isolation + future-growth headroom, *not* rescuing an unreadable
  file. The cost is the cross-module threading of `commonEnv`/storage handles. Worth doing as a single
  gated change; if you ever had to drop scope, keep the helper and the `miniapp.ts` extraction (the
  most self-contained section) and leave the rest.
- **Guardrail:** do it on its own branch, gate the **entire** thing on a zero-change
  `preview --expect-no-changes`, build the miniapp dist before previewing (so the `__dirname` fix is
  actually exercised), and never let a "proper Pulumi components" instinct turn it into a
  `ComponentResource` rewrite. `aliases` is the recovery hatch if a name drifts — not a license to
  re-parent.
</content>
</invoke>
