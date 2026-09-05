# Running Playwright `@playwright/test` Fast & Token-Efficiently in an Agent Loop

**Date:** 2026-06-14
**Scope:** We run Playwright e2e/visual tests as a quality gate inside autonomous Claude-driven build loops. The agent invokes the suite, reads the result, fixes, reruns. Two hard constraints: (1) iterations must be FAST (single browser, headless), (2) test OUTPUT must not flood the agent's context (no HTML report dumps, no inline traces). We test our OWN app on localhost.

All version-specific behavior is noted. Every non-obvious claim is cited; see **Sources**.

---

## 1. Reporters / output minimization

### The reporters, ranked by verbosity for an agent

Playwright ships these built-in reporters: `list`, `line`, `dot`, `json`, `blob`, `html`, `junit`, `github`. [test-reporters]

| Reporter | What it emits to stdout | Agent fit |
|---|---|---|
| `list` (default off-CI) | One line **per test**, pass and fail. Most verbose on green runs — every passing test prints a line. | Poor — passing-test noise scales with suite size. |
| `line` | A **single rewriting line** ("last finished test"), but prints failures inline as they happen. Concise even for large suites. | Good for human-watched terminals; the rewriting line is TTY-oriented. |
| `dot` (default on CI) | **One character per test** (`·` pass, `F` fail, `±` flaky), then a failure summary. Minimal stdout. | Good — near-zero green noise, failures still summarized. |
| `json` | A complete structured JSON object/file of the whole run (every test, status, error, duration). | Best **machine-readable** source — write to a FILE and grep, do not stream to stdout. |
| `blob` | A zip of full run details + attachments. Built for **merging sharded reports**, not for reading. (v1.37+) | Not for the agent. |
| `html` | A self-contained web report folder; **auto-serves/opens by default on failure**. | Avoid in the loop — see "stop it auto-opening" below. Fine as an on-demand human artifact. |
| `junit` | JUnit XML. CI integration format. | Not needed for our loop. |
| `github` | GitHub Actions annotations. Concise, but only meaningful inside GH Actions UI. | Only if running in GH Actions. |

[test-reporters] confirms: dot = "one character is displayed for each test"; list = "one line per test"; line = "single line to report last finished test" with inline failures.

### The token-minimizing pattern: quiet stdout + JSON file the agent greps

The winning combination for an agent is **a quiet stdout reporter for a glanceable pass/fail, plus a JSON reporter written to a file** that the agent reads ONLY on failure. You configure multiple reporters as an array. [test-reporters]

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['dot'],                                   // near-zero stdout on green runs
    ['json', { outputFile: 'test-results/results.json' }], // machine-readable, on disk
  ],
});
```

Why a file, not stdout JSON: the full JSON of a 20-test run is large and would flood context if streamed. On disk, the agent reads `test-results/results.json` only when the run is red and extracts just the failing entries (see §3). The `json` reporter's output target can also be set via env var instead of config: `PLAYWRIGHT_JSON_OUTPUT_NAME=test-results/results.json` (also `PLAYWRIGHT_JSON_OUTPUT_DIR`, `PLAYWRIGHT_JSON_OUTPUT_FILE`). [test-reporters]

JSON structure the agent greps: the report has run-level `stats` (totals: passed/failed/skipped, start/duration) and per-test entries carrying `status`, `error`/`errors` (message + stack), `duration`, and the test title/file. Parse `suites[].specs[].tests[].results[]` (or just filter for any entry whose `status` is not `passed`/`expected`). [test-reporters][reporter-api]

### Stop the HTML reporter auto-opening / serving

By default the `html` reporter **opens a browser / starts a server on failure** (`open` default is `'on-failure'`), which will hang or hijack an autonomous run. Force it off. [test-reporters]

```ts
reporter: [['html', { open: 'never' }]],   // never auto-open or serve
```

Equivalent env var: `PLAYWRIGHT_HTML_OPEN=never`. Allowed values are `'always' | 'never' | 'on-failure'`. Related HTML env vars: `PLAYWRIGHT_HTML_OUTPUT_DIR`, `PLAYWRIGHT_HTML_NO_SNIPPETS`. [test-reporters]

For our loop we recommend NOT including `html` at all (it writes a `playwright-report/` folder on every run regardless of `open`). Keep it as a separate on-demand command (`npx playwright show-report`) when a human wants to inspect. [test-reporters]

### Keeping passing-test noise near-zero

- Use `dot` (CI default) or `line` rather than `list` — `list` prints a line per passing test. [test-reporters]
- Do not add `html` to the loop config (folder write + potential serve).
- Keep the JSON on disk; only read it on red.
- Combined with fail-fast (§3), a green run produces a single short line and the agent moves on.

---

## 2. Speed

### Single-project, headless config

Headless is the **default** (`headless: true` in `use`); do not pass `--headed`. [test-use-options] For the agent loop, define exactly one project (one browser, e.g. Chromium) so a run launches a single browser engine — multiple `projects` multiply the suite by each browser.

```ts
// playwright.config.ts
export default defineConfig({
  use: { headless: true, baseURL: 'http://localhost:3000' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
```

To run just one project ad hoc: `--project=chromium` ("only run tests from the specified list of projects, supports '*' wildcard"). [test-cli]

### Parallelism: `fullyParallel` and `workers`

- Default parallelism is **file-level**: test files run in parallel, tests within a file run in order in the same worker. [test-parallel]
- `fullyParallel: true` parallelizes **across all tests and files**, not just files — the biggest single config lever for wall-clock on a suite of independent tests. [test-parallel]
- `--workers <n>` / `-j` = "Number of concurrent workers or percentage of logical CPU cores, use 1 to run in a single worker (default: 50%)." Each worker is its own OS process + browser instance; more workers = faster but more RAM/CPU. [test-cli][test-parallel]
- `workers: 1` disables parallelism (sequential) — only for debugging or order-dependent tests; it sacrifices speed. [test-parallel]

```ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 1 : '50%',  // tune to the build box; '100%' if cores are idle
});
```

For a ~20-test suite on a typical multi-core dev/build box, `fullyParallel: true` plus a healthy worker count is what actually moves the needle — it collapses the run toward the duration of the single slowest test rather than the sum.

### Retries tradeoff

`--retries <n>` ("zero for no retries", default no retries). [test-cli] Retries hide flakiness and **multiply wall-clock on red runs** (a failing test runs N+1 times). In a tight agent loop where you WANT to see the real failure fast, prefer **`retries: 0`** locally. Keep retries (e.g. 1–2) only on CI where flake-tolerance matters. Note that artifact options keyed to retries (`on-first-retry`) only fire if retries > 0 — see the artifact note below.

### Run only what changed / failed (tightest loops)

- `--only-changed [ref]`: "Only run test files that have been changed between 'HEAD' and 'ref'. Defaults to running all uncommitted changes. Only supports Git." Introduced in **v1.46**. [test-cli][release-notes]
- `--last-failed`: "Only re-run the failures." Introduced in **v1.44**. After a red run, `npx playwright test --last-failed` reruns just the failed tests — ideal for the fix-and-rerun inner loop. [test-cli][release-notes]
- `--grep <re>` / `-g`: run only tests matching a regex. `--grep-invert <re>`: run only tests NOT matching. `--project <name>`: scope to a project. [test-cli]
- `--repeat-each <n>`: run each test N times (flakiness hunting; not for the normal loop). [test-cli]

### Sharding

`--shard=current/all` (e.g. `3/5`) splits the suite across **machines**; combine shards via `blob` reports + `npx playwright merge-reports`. This is for **CI / multi-machine** fan-out, not a single build box — on one machine `workers`/`fullyParallel` already parallelize. Skip sharding for our loop. (blob + merge-reports: v1.37+.) [test-sharding][release-notes]

### `webServer` with `reuseExistingServer` — don't reboot the app every run

The single biggest non-test time sink is rebuilding/rebooting the dev server each iteration. `webServer` starts the app before tests and `reuseExistingServer` reuses an already-running one. [test-webserver]

```ts
export default defineConfig({
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',        // polled until it returns 2xx–4xx
    reuseExistingServer: !process.env.CI, // local: reuse a running server; CI: fresh
    timeout: 120 * 1000,
    stdout: 'ignore',                     // suppress server stdout (token noise)
    stderr: 'pipe',                       // keep errors only
  },
});
```

`reuseExistingServer: !process.env.CI`: locally `process.env.CI` is undefined so this is `true` — Playwright reuses the running server across runs instead of booting a new one each time; in CI it boots fresh. [test-webserver] For the agent loop, keep one long-lived dev server up (start it once) and let every test invocation reuse it. Set `stdout: 'ignore'` so the app's logs don't pollute agent context. [test-webserver]

### Disable expensive artifacts on success

Artifacts (trace/video/screenshot) cost wall-clock and disk; capture them **only on failure**. [test-use-options]

```ts
export default defineConfig({
  use: {
    headless: true,
    screenshot: 'only-on-failure',  // 'off' | 'on' | 'only-on-failure'
    trace: 'retain-on-failure',     // 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
    video: 'off',                   // 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
  },
});
```

- `screenshot: 'only-on-failure'` — captures a screenshot just for failing tests. [test-use-options]
- `trace`: `'on-first-retry'` records a trace only when a test is retried (cheapest — zero cost if retries=0 or test passes), but requires retries > 0 to ever fire; `'retain-on-failure'` records and keeps a trace for any failed test regardless of retries. **Pick `'retain-on-failure'` if you run with `retries: 0`** (otherwise you'd get no trace at all). [test-use-options]
- `video: 'off'` by default — video is the most expensive artifact; keep it off, or `'retain-on-failure'` only if you genuinely need motion. [test-use-options]

### What actually moves the needle on a ~20-test suite

1. **Reuse the dev server** (`reuseExistingServer`) — removes a full boot/build per run. Biggest non-test win. [test-webserver]
2. **`fullyParallel: true` + adequate `workers`** — collapses run time toward the slowest single test. [test-parallel]
3. **One headless project** — no per-browser multiplication, no UI. [test-use-options]
4. **`retries: 0` locally** — no failing-test re-runs inflating red iterations. [test-cli]
5. **Artifacts only on failure** — no trace/video tax on green runs. [test-use-options]
6. **`--last-failed` / `--only-changed`** for inner-loop reruns — run a handful, not all 20. [test-cli][release-notes]

---

## 3. Agent invocation pattern

Goal: the agent runs the suite, sees a one-line green/red verdict, and on red pulls **only** the failing test names, error messages, and the specific failing screenshot/diff paths — never the whole report.

### Fail-fast for tight loops

- `-x` = "Stop after the first failure." [test-cli]
- `--max-failures <N>` = "Stop after the first N failures." [test-cli]

Use `-x` (or `--max-failures 1`) so the agent gets the first real failure immediately instead of waiting for all 20 tests and a wall of errors. Fix, rerun with `--last-failed`.

### Recommended run command (the loop)

```bash
# quiet stdout + JSON to disk; stop at first failure
npx playwright test --reporter=dot,json -x
# (or rely on config reporter array and just: npx playwright test -x)
```

On green: `dot` prints a short line, exit code 0 — agent proceeds, reads nothing else.

On red (exit ≠ 0): the agent reads `test-results/results.json` and extracts ONLY failures — title, file, and `error.message` — e.g.:

```bash
# list just failing tests + their error message (no stack flood)
jq -r '.suites[].specs[]
        | select(.tests[].results[].status=="failed")
        | .title' test-results/results.json

# or pull the first error message
jq -r '[.. | objects | select(.status=="failed") | .error.message] | first' test-results/results.json
```

This surfaces the minimum the model needs to fix-and-rerun, keeping giant stacks/HTML out of context. (JSON carries per-test `status` and `error`; run-level `stats` give totals. [test-reporters][reporter-api])

### Visual-diff failures: pull only the diff path

For `toHaveScreenshot()` failures, Playwright writes the **expected**, **actual**, and **diff** PNGs into the test's output folder under `test-results/` (named `*-expected.png`, `*-actual.png`, `*-diff.png`); the failure error references them, and they're attachments in the JSON. [test-snapshots][test-reporters] The agent should read **only the `-diff.png`** (or `-actual.png`) for the failing test — one image, not the whole report — to see what changed, then fix the code or, for intentional UI changes, update the baseline:

```bash
npx playwright test --update-snapshots   # -u; regenerate golden screenshots after an intended change
```

`--update-snapshots` (`-u`) regenerates/overwrites baselines and is required on the very first run to create them. [test-snapshots]

### Minimum-context fix loop (summary)

1. Run `npx playwright test -x` (quiet reporter + JSON file, fail-fast).
2. Green → done. Read nothing.
3. Red → read `results.json`, extract failing title + `error.message` only.
4. If visual: open just the failing `*-diff.png`.
5. Fix code (or `-u` if the change was intended).
6. Rerun `npx playwright test --last-failed -x`.

---

## 4. Claude / LLM-specific guidance

### Official Anthropic guidance (Claude Code best-practices)

Anthropic's official Claude Code best-practices doc does NOT mention Playwright by name, but it directly endorses the test-as-verification-loop and screenshot-comparison patterns this artifact implements: [cc-best-practices]

- **"Give Claude a way to verify its work … a check it can run: tests, a build, a screenshot to compare. It's the difference between a session you watch and one you walk away from."** The check is "anything that returns a signal Claude can read in the conversation: a test suite, a build exit code, a linter, a script that diffs output against a fixture, or a browser screenshot compared against a design." [cc-best-practices]
- **"Verify UI changes visually"** is called out explicitly: *"implement this design. take a screenshot of the result and compare it to the original. list differences and fix them."* [cc-best-practices]
- It recommends gating the stop with a **Stop hook** ("runs your check as a script and blocks the turn from ending until it passes") or a `/goal` condition re-checked every turn — directly applicable to wiring the Playwright run as the gate. [cc-best-practices]
- **"Have Claude show evidence rather than asserting success: the test output, the command it ran and what it returned."** Reinforces emitting a compact pass/fail, not a dump. [cc-best-practices]
- The whole doc's thesis — **"Claude's context window fills up fast, and performance degrades as it fills"** — is exactly why we minimize reporter output and read failures from a file. [cc-best-practices]

So: there is no Playwright-specific Anthropic doc, but the official best-practices guidance squarely supports (a) tests/screenshots as the agent's self-verification loop and (b) keeping output compact to protect context.

### `@playwright/test` RUNNER vs Playwright MCP / driver — when an agent uses which

These are two different tools and the distinction is the heart of question 4:

- **`@playwright/test` (the test RUNNER)** — committed, deterministic test files (`*.spec.ts`) that live in the repo and run via `npx playwright test`. This is the **quality gate**: repeatable, headless, parallel, run every loop iteration, produces a pass/fail exit code + JSON. Use it for **everything in this artifact** — the regression/e2e/visual suite the agent runs, reads, and iterates against. The community consensus: "use the CLI for repeatable test flows in CI/CD pipelines." [builder-mcp]

- **Playwright MCP server** (Microsoft's `microsoft/playwright-mcp`; also packaged as an official **Anthropic Claude plugin** — that plugin *is* the Microsoft Playwright MCP server, not the test runner). It drives a **live browser** for the agent via the **accessibility tree, not pixels**: README states **"Uses Playwright's accessibility tree, not pixel-based input"** and **"No vision models needed, operates purely on structured data,"** which makes it fast and token-efficient (structured snapshots are far smaller than screenshots). [playwright-plugin][playwright-mcp] Its README positions it for **"exploratory automation, self-healing tests, or long-running autonomous workflows"** needing "persistent state, rich introspection, and iterative reasoning over page structure" — and notes the **CLI/Skills path is better for "high-throughput coding agents" with "limited context windows."** [playwright-mcp]

**When to use which (for us):**

| Need | Tool |
|---|---|
| Repeatable quality gate run every build-loop iteration; regression/e2e/visual suite; CI | **`@playwright/test` runner** (this artifact) |
| Live, one-off exploration: "open my localhost app, click through the new flow, tell me what's broken"; self-QA of a just-made change; generating a first draft test from a manual walkthrough | **Playwright MCP** (accessibility-tree, token-cheap live browsing) |
| Establishing/updating visual baselines after an intended UI change | runner with `--update-snapshots` |

Practical division of labor in an autonomous loop: use the **MCP** to *explore and author/verify* a change interactively when needed, then **commit `@playwright/test` specs** and let the **runner** be the deterministic gate the loop iterates against. The runner — not the MCP — is what should block the stop, because it's reproducible and emits a clean exit code. The MCP's own README and the community guidance both draw this line. [playwright-mcp][builder-mcp]

> Note: the "token-efficient / accessibility-tree" claim is sourced from the Playwright MCP README and a reputable engineering blog, not an Anthropic doc; Anthropic's plugin page confirms the plugin is the Microsoft MCP server but offers no runner-vs-MCP strategy text. [playwright-plugin][playwright-mcp][builder-mcp]

---

## Recommended config for our agent loop

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 1 : '50%',
  retries: process.env.CI ? 1 : 0,        // 0 locally → real failures fast, no re-run tax
  reporter: [
    ['dot'],                              // near-zero green-run stdout
    ['json', { outputFile: 'test-results/results.json' }], // failures read from disk
    // intentionally NO ['html'] in the loop — run `npx playwright show-report` on demand
  ],
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',           // pairs with retries:0 (on-first-retry would never fire)
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // reuse the long-lived dev server every iteration
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120 * 1000,
  },
});
```

Loop commands:

```bash
# normal gate: quiet, fail-fast, JSON to disk
npx playwright test -x

# inner fix loop after a red run
npx playwright test --last-failed -x

# scope to changed files only (v1.46+)
npx playwright test --only-changed -x

# on red, agent reads ONLY failures from disk (no stack flood):
jq -r '.suites[].specs[] | select(.tests[].results[].status=="failed") | .title' test-results/results.json

# intended UI change → refresh baselines
npx playwright test --update-snapshots
```

Belt-and-suspenders env (if any stray `html` reporter is configured): `PLAYWRIGHT_HTML_OPEN=never`.

**Top recommendations, condensed:**
1. Reporter = `dot` (quiet stdout) + `json` to a FILE; never stream JSON; never auto-open `html` (`open:'never'` / omit it). [test-reporters]
2. Read failures from `test-results/results.json` (titles + `error.message`), not from stdout/HTML. [test-reporters]
3. `fullyParallel:true` + workers, one headless Chromium project — collapses wall-clock. [test-parallel][test-use-options]
4. `reuseExistingServer:!CI` + keep one dev server up — kills the per-run reboot. [test-webserver]
5. Artifacts only on failure: `screenshot:'only-on-failure'`, `trace:'retain-on-failure'`, `video:'off'`. [test-use-options]
6. `retries:0` locally so red runs surface the real error once. [test-cli]
7. Fail-fast `-x` / `--max-failures 1`; rerun with `--last-failed`; scope with `--only-changed`. [test-cli][release-notes]
8. For visual fails, open only the failing `*-diff.png`; `-u` to rebaseline intended changes. [test-snapshots]
9. Runner = the committed quality gate the loop iterates against; Playwright MCP = live, token-cheap (accessibility-tree) exploration/self-QA, not the gate. [playwright-mcp][builder-mcp]
10. Anthropic's official best-practices doc endorses "give Claude a check it can run (tests / screenshot compare)" and keeping output compact to protect context — exactly this setup. [cc-best-practices]

---

## Sources

- **[test-reporters]** https://playwright.dev/docs/test-reporters — official: every built-in reporter (list/line/dot/json/blob/html/junit/github), their verbosity, the multi-reporter array, `json` `outputFile` + `PLAYWRIGHT_JSON_OUTPUT_NAME`, and the HTML `open:'never'` / `PLAYWRIGHT_HTML_OPEN` controls.
- **[test-cli]** https://playwright.dev/docs/test-cli — official: CLI flags — `-x`/`--max-failures`, `--grep`/`--grep-invert`, `--project`, `--workers`, `--retries`, `--last-failed`, `--only-changed`, `--repeat-each`, `--shard`, `--headed`, `--reporter`.
- **[test-webserver]** https://playwright.dev/docs/test-webserver — official: `webServer` (command/url/timeout/stdout/stderr/cwd) and how `reuseExistingServer:!process.env.CI` reuses a running dev server locally.
- **[test-use-options]** https://playwright.dev/docs/test-use-options — official: `trace`/`screenshot`/`video` allowed values + meanings, `headless` default true, the failure-only artifact config.
- **[test-parallel]** https://playwright.dev/docs/test-parallel — official: file- vs test-level parallelism, `fullyParallel`, `workers`, worker=process+browser, the `workers:1` tradeoff.
- **[test-sharding]** https://playwright.dev/docs/test-sharding — official: `--shard=current/all` is for multi-machine CI; blob reports merged via `merge-reports`; single machine already parallelizes via workers.
- **[test-snapshots]** https://playwright.dev/docs/test-snapshots — official: `toHaveScreenshot()`, baseline naming, expected/actual/diff PNGs, `--update-snapshots`/`-u` (required on first run / for intended changes).
- **[release-notes]** https://playwright.dev/docs/release-notes — official: version introductions — `--last-failed` v1.44, `--fail-on-flaky-tests` v1.45, `--only-changed` v1.46, blob reporter + merge-reports v1.37.
- **[reporter-api]** https://playwright.dev/docs/api/class-reporter — official: TestResult `status`/`error(s)` fields underpinning the JSON the agent greps. (Referenced via search index; reporter result shape.)
- **[cc-best-practices]** https://code.claude.com/docs/en/best-practices — Anthropic official: "Give Claude a way to verify its work" (tests/build/screenshot-compare as the loop's check), "Verify UI changes visually," Stop-hook/`/goal` gating, "show evidence not assertions," and the context-window-fills-fast rationale for compact output. No Playwright-by-name guidance.
- **[playwright-plugin]** https://claude.com/plugins/playwright — Anthropic plugin listing: confirms the official Claude Playwright plugin IS the Microsoft Playwright MCP server (not the `@playwright/test` runner); accessibility-data-based browser automation; no explicit runner-vs-MCP strategy text.
- **[playwright-mcp]** https://github.com/microsoft/playwright-mcp — Microsoft official README: "Uses Playwright's accessibility tree, not pixel-based input," "No vision models needed, operates purely on structured data" (token-efficient); positions MCP for exploratory/long-running autonomous workflows and the CLI/Skills path for high-throughput agents with limited context.
- **[builder-mcp]** https://www.builder.io/blog/playwright-mcp-server-claude-code — reputable engineering blog: corroborates "use MCP for exploratory testing / self-QA, use the CLI runner for repeatable flows in CI/CD," and the accessibility-tree token-efficiency framing.

_All playwright.dev pages and the Anthropic/Microsoft pages above were fetched successfully. One item — `test-snapshots` — did not, in the fetched excerpt, spell out the exact `test-results/<...>/*-diff.png` path; the diff/actual/expected PNG triplet and naming are corroborated by the reporters/attachments docs and standard Playwright behavior, but treat the precise on-disk path as "verify against your own `test-results/` after a first visual failure." No source returned an outright fetch error._
