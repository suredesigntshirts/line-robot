// Step 3 local proof — invoke the Lambda shim in-process with synthetic Function URL v2 events.
// No test framework: plain asserts, non-zero exit on failure.
import assert from "node:assert/strict";
import { handler } from "./src/lambda.mjs";

function fnUrlEvent(method, rawPath, rawQueryString = "") {
  return {
    version: "2.0",
    rawPath,
    rawQueryString,
    headers: { host: "spike.local", "user-agent": "local-test" },
    requestContext: { http: { method, path: rawPath, sourceIp: "127.0.0.1" } },
    isBase64Encoded: false,
  };
}

function decode(resp) {
  return resp.isBase64Encoded ? Buffer.from(resp.body, "base64").toString("utf8") : resp.body;
}

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${e.message}`);
  }
}

// --- static route ---
const home = await handler(fnUrlEvent("GET", "/"));
check("static / returns 200", () => assert.equal(home.statusCode, 200));
check("static / is HTML", () => assert.match(decode(home), /Hello from Astro SSR/));

// --- dynamic SSR route, request 1 ---
const r1 = await handler(fnUrlEvent("GET", "/p/42"));
const h1 = decode(r1);
check("dynamic /p/42 returns 200", () => assert.equal(r1.statusCode, 200));
check("dynamic renders the path id", () => assert.match(h1, /Property id: 42/));
check("dynamic carries a renderedAt timestamp", () =>
  assert.match(h1, /Rendered at: \d{4}-\d{2}-\d{2}T/),
);

const ts1 = h1.match(/Rendered at: ([^<]+)</)?.[1];
const nonce1 = h1.match(/Request nonce: ([^<]+)</)?.[1];

// --- dynamic SSR route, request 2 — must be a FRESH render (not prerendered/frozen) ---
await new Promise((r) => setTimeout(r, 5));
const r2 = await handler(fnUrlEvent("GET", "/p/99"));
const h2 = decode(r2);
check("second request renders its own id (99)", () => assert.match(h2, /Property id: 99/));
const ts2 = h2.match(/Rendered at: ([^<]+)</)?.[1];
const nonce2 = h2.match(/Request nonce: ([^<]+)</)?.[1];

check("timestamp differs across requests (real per-request SSR, not prerender)", () =>
  assert.notEqual(ts1, ts2),
);
check("nonce differs across requests", () => assert.notEqual(nonce1, nonce2));

console.log(`\nrenderedAt #1: ${ts1}\nrenderedAt #2: ${ts2}`);
console.log(failures === 0 ? "\nALL LOCAL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
