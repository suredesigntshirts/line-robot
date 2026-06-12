# Spike — Astro 6 SSR on AWS Lambda via our OWN Pulumi (no SST CLI)

Resolves decision flag **DF-2** (`docs/research/00-product-principles.md`). Question: can an Astro 6
SSR site deploy to AWS Lambda using our own Pulumi code, without the SST CLI owning the deploy?

## VERDICT: Pulumi-wired Astro SSR: **WORKS-WITH-CAVEATS**

- The **build -> bundle -> Pulumi Lambda + Function URL** pipeline works end to end with **zero SST /
  third-party deploy tooling**. Option **A** (hand-rolled thin adapter over the official
  `@astrojs/node` middleware export) succeeded; we never needed Option B (astro-sst) or C
  (@astro-aws). Local in-process proof of real per-request SSR: **PASS**. Pulumi `up` created all
  resources and the Lambda is **Active / LastUpdateStatus Successful**.
- The single caveat is **environmental, not technical**: this AWS account has a guardrail that
  **blocks public (unauthenticated) Lambda Function URLs**, so the `authType: NONE` live-HTTP curl
  returns `403 AccessDeniedException` at AWS's edge — the request never reaches our code (no
  CloudWatch log streams were created). The resource policy granting public `InvokeFunctionUrl` is
  present and correct; a higher-priority account SCP/deny overrides it. The scoped `line-robot`
  deploy identity is also denied `lambda:InvokeFunction`, so a SigV4/CLI invoke fallback is likewise
  unavailable. Per spike rules we did **not** escalate or switch profiles. **Live SSR over public
  HTTP was therefore not demonstrable on this account**, but everything up to and including a
  deployed, Active Lambda running our bundled Astro server **was**.

## Which option won

**Option A — hand-rolled thin Lambda adapter.** ~140 lines (`app/src/lambda.mjs`). It wraps the
**public** `@astrojs/node` *middleware-mode* export `handler(req, res, next)` (from
`dist/server/entry.mjs`) by:
1. turning a Function URL **v2** event into a minimal Node `IncomingMessage` (method, reconstructed
   `rawPath`+`rawQueryString` URL, lower-cased headers, rejoined `cookies[]` -> `Cookie`, pushed body
   with base64 decode),
2. capturing the `ServerResponse` into a buffer (patched `write`/`end`, no real socket),
3. returning the Function URL response shape: `statusCode`, `headers`, `cookies[]` split out from
   `set-cookie`, `isBase64Encoded` + base64 body for non-text content-types.

We deliberately drive the **documented public middleware contract** rather than Astro's internal
`App`/`createApp` class (which is *not* exported from the build entry, and whose API is mid-churn —
the docs disagree between `new App(manifest)` and `createApp()`), so the shim survives adapter
upgrades as long as the middleware signature holds.

## Exact versions

| thing | version |
|---|---|
| astro | **6.4.6** |
| @astrojs/node | **10.1.4** (adapter `mode: "middleware"`, `output: "server"`) |
| esbuild (bundler) | **0.27.7** |
| node (build + Lambda runtime) | **22.x** (`nodejs22.x`, **arm64**) |
| @pulumi/aws / @pulumi/pulumi | ^6 / ^3 (CLI 3.245.0) |

## Local proof (Step 3) — PASS

`app/test-local.mjs` invokes the shim in-process with synthetic Function URL v2 events:

```
PASS  static / returns 200            PASS  static / is HTML
PASS  dynamic /p/42 returns 200       PASS  dynamic renders the path id
PASS  dynamic carries a renderedAt timestamp
PASS  second request renders its own id (99)
PASS  timestamp differs across requests (real per-request SSR, not prerender)
PASS  nonce differs across requests
renderedAt #1: 2026-06-12T14:30:10.546Z
renderedAt #2: 2026-06-12T14:30:10.554Z
ALL LOCAL CHECKS PASSED
```

The differing timestamps + per-request path-id prove **genuine SSR**, not prerender. The **bundled
artifact** (`dist-lambda/server/index.mjs`) was also re-tested in-process with the same result, so
the exact bytes Lambda runs are proven good locally.

## AWS proof (Step 4) — deploy PASS, public HTTP BLOCKED by account guardrail

`pulumi up` (stack `spike`, local file backend, `AWS_PROFILE=line-robot`) created **5 resources** in
22s, all named `linerobot-spike-*`:
- IAM role `linerobot-spike-astro-role` + AWS-managed `AWSLambdaBasicExecutionRole` attachment
- Lambda `linerobot-spike-astro-ssr` (`nodejs22.x`, arm64, handler `server/index.handler`, 512 MB)
- Function URL (authType `NONE`)

Deployed function state:
```
State: Active   LastUpdateStatus: Successful   Runtime: nodejs22.x   Arch: arm64
Handler: server/index.handler   CodeSize: 250738 (zipped)   Mem: 512
```

Live curl of the Function URL (both routes, repeated):
```
GET https://...lambda-url.ap-southeast-1.on.aws/p/77
HTTP/1.1 403 Forbidden
x-amzn-ErrorType: AccessDeniedException
{"Message":"Forbidden. For troubleshooting Function URL authorization issues, see: ...urls-auth.html"}
```
12 polls over 90s — all 403 (not propagation). The resource policy IS correct:
```json
{"Sid":"FunctionURLAllowPublicAccess","Effect":"Allow","Principal":"*",
 "Action":"lambda:InvokeFunctionUrl","Resource":"...:function:linerobot-spike-astro-ssr",
 "Condition":{"StringEquals":{"lambda:FunctionUrlAuthType":"NONE"}}}
```
No CloudWatch log streams were ever created -> the 403 is rejected at AWS's edge **before** invoking
our code. Conclusion: an **account-level SCP / guardrail blocks public Function URLs**. We did not
escalate to the `default`/admin profile (spike rule), and a SigV4 fallback is blocked too
(`line-robot` identity lacks `lambda:InvokeFunction`).

## Gotchas hit (read these before Stage 4)

1. **THE BIG ONE — bundling breaks @astrojs/node's asset-dir resolution.** The middleware entry
   calls `resolveClientDir()`, which **walks up from `import.meta.url` until it finds a directory
   named `server`** (to locate the sibling `client/` static-asset dir). esbuild-ing to a flat file
   throws: *"Could not find the server directory 'server' ... bundled into a single file."* **Fix
   (per the adapter's own error text):** emit the bundle into a path that **contains a `server/`
   segment** and provide a sibling **`client/` dir** (empty is fine if you have no static assets).
   We output `dist-lambda/server/index.mjs` + empty `dist-lambda/client/`; handler =
   `server/index.handler`. (Alternative: don't bundle the server entry — ship `node_modules` — but
   that's a much bigger/cold-start-heavier zip.)
2. **Function URL event is payload v2, not API Gateway v1.** Path is `event.rawPath` +
   `event.rawQueryString` (reconstruct the URL); method is `event.requestContext.http.method`;
   headers are single comma-joined strings; **cookies arrive in a separate `event.cookies[]`
   array**, not the `Cookie` header — rejoin them. On the way out, **`set-cookie` must go in a
   `cookies[]` array** on the response, not stuffed back into `headers`.
3. **Binary handling.** Function URL responses need `isBase64Encoded:true` + base64 body for
   non-text content-types. We base64 everything that isn't `text/*` / json / xml / svg. (This app is
   pure HTML so it always took the text path, but the binary branch is wired for fonts/images.)
4. **Astro `App`/`createApp` internals are unstable & unexported.** Don't reach past the middleware
   handler — the official docs themselves disagree on `new App(manifest)` vs `createApp()`, and
   neither is exported from the build entry. The middleware export is the stable seam.
5. **No client dir is emitted when the app has zero static assets** — `dist/client/` was absent
   after `astro build`. The bundle script `mkdir`s the empty `client/` itself. A real app WILL emit
   `dist/client/**`; Stage 4 must serve those assets (CloudFront/S3 in front, or copy them next to
   the bundle so the adapter's disk-read 404/asset path resolves).
6. **Cached Astro docs are thin** (`docs/docs.astro.build/` has only a few guides — no node-adapter
   or lambda pages). Adapter API was pulled live. Worth caching the node-adapter + adapter-reference
   pages for Stage 4.
7. **Cold-start size is healthy:** 1.2 MB single bundled file / **250 KB zipped**. No layer needed.

## What Stage 4 should REUSE vs REDO

**Reuse:**
- The whole shape: `output:"server"` + `@astrojs/node` `mode:"middleware"` + esbuild bundle into a
  `server/`-segmented path + Pulumi `aws.lambda.Function` (arm64, nodejs22) + Function URL. It maps
  1:1 onto the repo's existing `infra/src/lambdas.ts` / `miniapp.ts` patterns.
- `app/src/lambda.mjs` (the shim) and `app/build-lambda.mjs` (the bundler) are ~production-shaped;
  copy them. Keep the `server/`-segment + empty-`client/` trick (gotcha #1).

**Redo / add:**
- **Static assets:** real Astro apps emit `dist/client/**`. Put **CloudFront + S3 in front** (already
  a solved pattern in this repo — `infra/src/miniapp.ts`) and route `/_astro/*` + asset paths to S3,
  everything else to the Lambda Function URL. Don't try to serve assets from the Lambda.
- **The public-URL guardrail:** confirm with the account owner whether public Function URLs are
  permanently blocked. If so, Stage 4 **must** front the Lambda with **CloudFront** (OAC ->
  Function URL with `authType AWS_IAM`, or keep NONE behind CloudFront if the guardrail only blocks
  *direct* public URLs). This is the same fronting Stage 4 needs anyway for assets, so it's not
  extra work — but it means a bare Function URL is **not** a viable public endpoint on this account.

## Honest assessment — hand-rolled adapter vs SST

**The hand-rolled adapter is maintainable and the right call here.** It's ~140 lines against a
**stable, documented** seam (the `@astrojs/node` middleware handler), it adds **zero deploy-time
coupling** (no SST CLI, no SST state/IAM, no Ion lock-in), and it slots directly into the repo's
existing hand-rolled Pulumi Lambda conventions — which is the entire point of DF-2. The one piece of
real fragility (asset-dir resolution under bundling, gotcha #1) is already solved and pinned by a
comment. **Recommendation: do NOT adopt SST for Stage 4.** Astro releases are predictable; if a
future adapter version changes the middleware signature, the blast radius is this one small file,
caught immediately by `app/test-local.mjs`. SST would buy us nothing the repo's Pulumi setup doesn't
already provide, while costing a parallel deploy/state toolchain next to the existing one.

## Teardown

`pulumi destroy` on stack `spike` — confirmed in the run log. The spike **code and this FINDINGS.md
are kept**; only the AWS resources are destroyed.
