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
  FRONTEND_URL: z.string().url(),

  // ai (google gemini)
  GEMINI_API_KEY: z.string().min(1, "Gemini API key required"),
  GEMINI_MODEL: z.string().default("gemini-3.8-flash"),

  // dodo payments (billing)
  DODO_API_KEY: z.string().min(1, "Dodo Payments API key required"),
  DODO_WEBHOOK_KEY: z.string().min(1, "Dodo Payments webhook key required"),
  DODO_PRO_PRODUCT_ID: z.string().min(1, "Dodo Pro product id required"),
  DODO_CAREER_PRODUCT_ID: z
    .string()
    .min(1, "Dodo Career product id required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables: ", parsedEnv.error.message);
  process.exit(1);
}
export const env = parsedEnv.data;
