import { z } from "zod";

// Scoped env for the mini-app API Lambda (matches its least-privilege IAM role): the public LIFF
// channel id (id-token `aud`), the archive bucket (presign gallery photos), and the Postgres
// connection string (the v2 catalog — every read/write lives there; no IAM, password auth). A missing
// value fails the cold-start parse rather than 500ing every request. No DynamoDB, SSM, or queue grant.
const ApiEnvSchema = z.object({
  ARCHIVE_BUCKET: z.string().min(1),
  LIFF_CHANNEL_ID: z.string().min(1),
  DATABASE_URL: z.string().min(1),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function loadApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  return ApiEnvSchema.parse(source);
}
