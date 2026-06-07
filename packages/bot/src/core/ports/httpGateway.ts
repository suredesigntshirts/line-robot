/** A provider-agnostic inbound HTTP request, mapped from the Lambda Function URL event at the
 * `lambda/` boundary so the app handlers stay transport-agnostic (no aws-lambda types). */
export interface HttpRequest {
  readonly method: string;
  /** Path after the host, trailing slash NOT yet normalized. */
  readonly path: string;
  /** Header names are lower-cased by the caller; values may be undefined. */
  readonly headers: Record<string, string | undefined>;
  /** The already-decoded (base64-resolved) raw body, or "" when absent. */
  readonly rawBody: string;
}

/** A provider-agnostic HTTP response — structurally a subset of APIGatewayProxyResultV2
 * (statusCode + optional headers + body), so the lambda maps it back with a plain return. */
export interface HttpResponse {
  readonly statusCode: number;
  readonly headers?: Record<string, string>;
  readonly body: string;
}
