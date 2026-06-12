// Thin hand-rolled Lambda adapter (Option A) — zero third-party *deploy* coupling.
//
// It wraps the @astrojs/node adapter's public `middleware`-mode export:
//   `handler(req, res, next)` at ../../dist/server/entry.mjs
// which is a standard Node "connect-style" middleware. We:
//   1. turn a Lambda Function URL v2 event into a minimal Node IncomingMessage,
//   2. capture the response via a minimal ServerResponse,
//   3. return the Function URL response shape (statusCode/headers/cookies/body, base64 for binary).
//
// We deliberately drive the *public* Node middleware contract rather than reaching into Astro's
// internal `App` class — so this shim survives adapter upgrades as long as the documented
// middleware signature holds.
//
// NOTE: import path is relative to THIS source file (app/src/lambda.mjs); dist/ sits at app/dist.
// esbuild resolves imports from the source file's location too, so the same path works for the
// bundle (see pulumi/build.mjs).
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";

// The @astrojs/node adapter's public middleware handler.
import { handler as astroHandler } from "../dist/server/entry.mjs";

/** Build a minimal readable IncomingMessage carrying the request line, headers and body. */
function makeReq(event) {
  const req = new IncomingMessage(new Socket());
  const http = event.requestContext?.http ?? {};
  req.method = http.method ?? "GET";

  // Function URL v2 gives rawPath + rawQueryString; reconstruct the full URL the middleware expects.
  const path = event.rawPath ?? "/";
  const qs = event.rawQueryString ? `?${event.rawQueryString}` : "";
  req.url = `${path}${qs}`;

  // Headers: Function URL flattens multi-value into comma-joined strings already.
  const headers = {};
  for (const [k, v] of Object.entries(event.headers ?? {})) headers[k.toLowerCase()] = v;
  // Cookies arrive as a separate array on the event; rejoin into a Cookie header.
  if (Array.isArray(event.cookies) && event.cookies.length) {
    headers.cookie = event.cookies.join("; ");
  }
  req.headers = headers;

  // Push the body, then EOF — the middleware reads the stream for POST/PUT.
  const body = event.body
    ? Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
    : null;
  process.nextTick(() => {
    if (body) req.push(body);
    req.push(null);
  });
  return req;
}

/** Collect a ServerResponse into a buffer + headers without a real socket. */
function makeRes(req) {
  const res = new ServerResponse(req);
  const chunks = [];
  // Patch the write/end sinks so nothing tries to flush to a socket.
  const origWrite = res.write.bind(res);
  res.write = (chunk, enc, cb) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc || "utf8"));
    if (typeof enc === "function") enc();
    else if (typeof cb === "function") cb();
    return true;
  };
  res.end = (chunk, enc, cb) => {
    if (chunk && typeof chunk !== "function") {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc || "utf8"));
    }
    res.emit("__done__", Buffer.concat(chunks));
    const done = typeof chunk === "function" ? chunk : typeof enc === "function" ? enc : cb;
    if (typeof done === "function") done();
    return res;
  };
  return res;
}

/** Decide if a content-type is text (utf8) or binary (base64) for the Function URL response. */
function isTextContentType(ct = "") {
  return /^(text\/|application\/(json|javascript|xml|.*\+json|.*\+xml)|image\/svg)/i.test(ct);
}

export const handler = async (event) => {
  const req = makeReq(event);
  const res = makeRes(req);

  const bodyBuf = await new Promise((resolve, reject) => {
    res.once("__done__", resolve);
    res.once("error", reject);
    // `next` is the connect fall-through: if Astro doesn't handle the route, emit a 404.
    astroHandler(req, res, (err) => {
      if (err) return reject(err);
      res.statusCode = 404;
      res.end("Not Found");
    });
  });

  // Split set-cookie out into the Function URL `cookies` array; keep everything else as headers.
  const rawHeaders = res.getHeaders();
  const headers = {};
  let cookies;
  for (const [k, v] of Object.entries(rawHeaders)) {
    if (k.toLowerCase() === "set-cookie") {
      cookies = Array.isArray(v) ? v : [String(v)];
      continue;
    }
    headers[k] = Array.isArray(v) ? v.join(", ") : String(v);
  }

  const ct = headers["content-type"] || rawHeaders["content-type"] || "";
  const asText = isTextContentType(ct);

  return {
    statusCode: res.statusCode || 200,
    headers,
    ...(cookies ? { cookies } : {}),
    isBase64Encoded: !asText,
    body: asText ? bodyBuf.toString("utf8") : bodyBuf.toString("base64"),
  };
};
