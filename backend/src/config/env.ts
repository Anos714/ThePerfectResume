import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("8000"),
  DATABASE_URL: z.string().url("Database url required"),
  HONO_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables: ", parsedEnv.error.message);
  process.exit(1);
}
export const env = parsedEnv.data;
