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

  // cloudinary (avatar/image uploads)
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "Cloudinary cloud name required"),
  CLOUDINARY_API_KEY: z.string().min(1, "Cloudinary api key required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "Cloudinary api secret required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // `bun test` sets NODE_ENV=test. The suite must run in a fresh worktree or CI
  // checkout that has no .env, so fall back to throwaway placeholders instead
  // of hard-exiting. Any test that needs real credentials provides its own.
  if (process.env.NODE_ENV === "test") {
    console.warn("Invalid environment variables — using test fallbacks");
  } else {
    console.error("Invalid environment variables: ", parsedEnv.error.message);
    process.exit(1);
  }
}

const fallbackEnv = {
  PORT: "8080",
  HONO_ENV: "test" as const,
  DATABASE_URL: "postgres://user:password@host/db?sslmode=require",
  REDIS_URL: "rediss://default:password@host:6379",
  JWT_ACCESS_SECRET: "test-access-secret",
  JWT_REFRESH_SECRET: "test-refresh-secret",
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "587",
  SMTP_USER: "you@example.com",
  SMTP_PASS: "replace-me",
  EMAIL_FROM: "ThePerfectResume <you@example.com>",
  GOOGLE_CLIENT_ID: "replace-me.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "replace-me",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
  FRONTEND_URL: "http://localhost:3000",
  GEMINI_API_KEY: "replace-me",
  GEMINI_MODEL: "gemini-3.8-flash",
  DODO_API_KEY: "replace-me",
  DODO_WEBHOOK_KEY: "dGVzdC13ZWJob29rLWtleQ==",
  DODO_PRO_PRODUCT_ID: "pro_product_id",
  DODO_CAREER_PRODUCT_ID: "career_product_id",
  CLOUDINARY_CLOUD_NAME: "replace-me",
  CLOUDINARY_API_KEY: "replace-me",
  CLOUDINARY_API_SECRET: "replace-me",
};

export const env = parsedEnv.success ? parsedEnv.data : fallbackEnv;
