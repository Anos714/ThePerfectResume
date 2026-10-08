import { z } from "zod";

export const envSchema = z
  .object({
    PORT: z.string().default("8080"),
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

  // Only set this when the deployment genuinely terminates every connection at
  // a trusted proxy (Cloudflare, nginx, ...). It makes the rate limiter trust
  // cf-connecting-ip / x-real-ip; leaving it off means a spoofable header
  // would let any client mint fresh rate-limit buckets.
  TRUST_PROXY_HEADERS: z
    .string()
    .default("false")
    .transform((v) => v === "true" || v === "1"),

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
})
  // A signing secret that ships as a literal placeholder is the single most
  // dangerous misconfiguration here: the app boots fine and mints real tokens
  // that any attacker can forge. Only enforced in production so a dev checkout
  // with the .env.example values still runs.
  .superRefine((env, ctx) => {
    if (env.HONO_ENV !== "production") return;

    for (const key of ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const) {
      const value = env[key];
      if (value.length < 32 || value === "replace-me") {
        ctx.addIssue({
          code: "custom",
          message: `${key} must be a unique, unpredictable secret of at least 32 characters in production`,
          path: [key],
        });
      }
    }
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
  TRUST_PROXY_HEADERS: "false",
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
