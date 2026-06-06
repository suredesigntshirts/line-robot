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
