// Provider-agnostic HTTP request/response, independent of the Lambda Function URL plumbing (the Lambda
// entry maps the event onto these). Self-contained to this package — packages/api does not depend on
// the bot's HTTP port.

export interface HttpRequest {
  readonly method: string;
  readonly path: string;
  /** Header keys are lower-cased by the Lambda mapper, so lookups are case-insensitive. */
  readonly headers: Record<string, string | undefined>;
  readonly rawBody: string;
}

export interface HttpResponse {
  readonly statusCode: number;
  readonly headers: Record<string, string>;
  readonly body: string;
}

// CORS headers are owned ENTIRELY by the Lambda Function URL's `cors` config (infra), which answers the
// OPTIONS preflight without invoking us and adds the (origin-locked) ACAO to every response. The handler
// must NOT also set `access-control-allow-origin` — two ACAO headers on one response is invalid CORS and
// the browser rejects it.
export function json(statusCode: number, body: unknown): HttpResponse {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

/** The Bearer token from the (case-insensitive) Authorization header, or "" when absent/malformed. */
export function bearerToken(request: HttpRequest): string {
  const raw = request.headers.authorization ?? request.headers.Authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return match?.[1]?.trim() ?? "";
}

/** Parse a JSON request body into a plain object, or null when absent/not-an-object/malformed. */
export function parseJsonBody(rawBody: string): Record<string, unknown> | null {
  if (rawBody === "") return null;
  try {
    const value: unknown = JSON.parse(rawBody);
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
