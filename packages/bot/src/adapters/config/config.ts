import { getParameter } from "@aws-lambda-powertools/parameters/ssm";
import { z } from "zod";

/**
 * Runtime configuration sourced from Lambda environment variables. Validated with Zod at cold
 * start so a misconfiguration fails fast and loudly rather than midway through a request.
 * `QUEUE_URL` is only required by the ingest Lambda.
 */
const EnvSchema = z.object({
  MESSAGES_TABLE: z.string().min(1),
  IDEMPOTENCY_TABLE: z.string().min(1),
  ARCHIVE_BUCKET: z.string().min(1),
  QUEUE_URL: z.string().min(1).optional(),
  CHANNEL_SECRET_PARAM: z.string().min(1),
  CHANNEL_ACCESS_TOKEN_PARAM: z.string().min(1),
  // Catalog table — used by the processor and the ingestion/reminder sweeps, not by ingest.
  CATALOG_TABLE: z.string().min(1).optional(),
  // Anthropic API key SSM param — used by the ingestion sweep for extraction, not by ingest/processor.
  ANTHROPIC_API_KEY_PARAM: z.string().min(1).optional(),
  // MINI App (LIFF) channel id — the `aud` the read-api validates id-tokens against. Plain config
  // (a channel id is public), only required by the read-api Lambda.
  LIFF_CHANNEL_ID: z.string().min(1).optional(),
  // MINI App (LIFF) base URL, e.g. `https://miniapp.line.me/{liffId}` — used ONLY by the processor to
  // put an "Open in Catalog" deep link (`{base}/p/{propertyId}`) on the Flex detail card. Optional:
  // absent simply omits the button (same graceful-degrade as the rich-menu Catalog tab).
  MINIAPP_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return EnvSchema.parse(source);
}

export interface Secrets {
  channelSecret: string;
  channelAccessToken: string;
}

async function requireParameter(name: string, maxAge: number): Promise<string> {
  const value = await getParameter(name, { decrypt: true, maxAge });
  if (value === undefined) {
    throw new Error(`Missing SSM SecureString parameter: ${name}`);
  }
  return value;
}

/**
 * Channel secret only — used by the ingest Lambda for signature verification. Granular so the
 * ingest role needs read access to just this one SSM parameter (least privilege).
 */
export function loadChannelSecret(env: Env, maxAge = 300): Promise<string> {
  return requireParameter(env.CHANNEL_SECRET_PARAM, maxAge);
}

/** Channel access token only — used by the processor Lambda to call the Messaging API. */
export function loadChannelAccessToken(env: Env, maxAge = 300): Promise<string> {
  return requireParameter(env.CHANNEL_ACCESS_TOKEN_PARAM, maxAge);
}

/** Anthropic API key — used by the ingestion sweep Lambda for property extraction. */
export function loadAnthropicApiKey(env: Env, maxAge = 300): Promise<string> {
  if (env.ANTHROPIC_API_KEY_PARAM === undefined) {
    throw new Error("ANTHROPIC_API_KEY_PARAM is required for the ingestion sweep Lambda");
  }
  return requireParameter(env.ANTHROPIC_API_KEY_PARAM, maxAge);
}

/**
 * Loads both LINE channel secrets from SSM SecureString parameters. Powertools caches values
 * (`maxAge` seconds) so warm invocations don't re-hit SSM.
 */
export async function loadSecrets(env: Env, maxAge = 300): Promise<Secrets> {
  const [channelSecret, channelAccessToken] = await Promise.all([
    loadChannelSecret(env, maxAge),
    loadChannelAccessToken(env, maxAge),
  ]);
  return { channelSecret, channelAccessToken };
}

/**
 * Scoped env for the read-only read-api Lambda. It only needs the catalog table, the archive
 * bucket (to presign photos), and the public LIFF channel id (id-token `aud`). It has NO IAM grant
 * for the message/idempotency tables, the SSM secret params, or the queue — so it must not require
 * (or carry) them. All three are required-non-optional here, replacing the by-hand `undefined`
 * guards in the entry point.
 */
const ReadApiEnvSchema = z.object({
  CATALOG_TABLE: z.string().min(1),
  ARCHIVE_BUCKET: z.string().min(1),
  LIFF_CHANNEL_ID: z.string().min(1),
});

export type ReadApiEnv = z.infer<typeof ReadApiEnvSchema>;

export function loadReadApiEnv(source: NodeJS.ProcessEnv = process.env): ReadApiEnv {
  return ReadApiEnvSchema.parse(source);
}
