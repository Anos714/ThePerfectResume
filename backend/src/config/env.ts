import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("8000"),
  DATABASE_URL: z.string().url("Database url required"),
  HONO_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  REDIS_URL: z.string().url("Redis url required"),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables: ", parsedEnv.error.message);
  process.exit(1);
}
export const env = parsedEnv.data;
