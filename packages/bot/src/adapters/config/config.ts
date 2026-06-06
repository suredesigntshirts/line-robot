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
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return EnvSchema.parse(source);
}

export interface Secrets {
  channelSecret: string;
  channelAccessToken: string;
}

/**
 * Loads LINE channel secrets from SSM SecureString parameters. Powertools caches values
 * (`maxAge` seconds) so warm invocations don't re-hit SSM.
 */
export async function loadSecrets(env: Env, maxAge = 300): Promise<Secrets> {
  const [channelSecret, channelAccessToken] = await Promise.all([
    getParameter(env.CHANNEL_SECRET_PARAM, { decrypt: true, maxAge }),
    getParameter(env.CHANNEL_ACCESS_TOKEN_PARAM, { decrypt: true, maxAge }),
  ]);
  if (channelSecret === undefined || channelAccessToken === undefined) {
    throw new Error("Missing LINE channel secret or access token in SSM Parameter Store");
  }
  return { channelSecret, channelAccessToken };
}
