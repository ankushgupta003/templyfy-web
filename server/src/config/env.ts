import { config } from "dotenv";
import { z } from "zod";

config({ path: "../.env" });
config();

const booleanFromEnv = z.preprocess((value) => {
  if (value === "true" || value === true) {
    return true;
  }

  if (value === "false" || value === false) {
    return false;
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(12, "JWT_SECRET must be set"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.coerce.number().int().positive().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
  APP_URL: z.string().url(),
  CORS_ORIGINS: z.string().optional(),
  TRUST_PROXY: booleanFromEnv.optional().default(false),
  STORAGE_PROVIDER: z.enum(["local", "supabase"]).default("local"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_PUBLIC_BUCKET: z.string().default("templyfy-public"),
  SUPABASE_PRIVATE_BUCKET: z.string().default("templyfy-private"),
  DOWNLOAD_TOKEN_SECRET: z.string().min(12),
  DOWNLOAD_LINK_EXPIRY_HOURS: z.coerce.number().int().positive().default(72),
});

const parsedEnv = envSchema.parse(process.env);

if (
  parsedEnv.STORAGE_PROVIDER === "supabase" &&
  (!parsedEnv.SUPABASE_URL || !parsedEnv.SUPABASE_SERVICE_ROLE_KEY)
) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when STORAGE_PROVIDER=supabase.");
}

const usesJsonTransport =
  parsedEnv.NODE_ENV === "test" ||
  (parsedEnv.EMAIL_HOST?.includes("example.com") ?? false) ||
  parsedEnv.EMAIL_USER === "smtp-user";

if (!parsedEnv.RESEND_API_KEY && !usesJsonTransport) {
  if (!parsedEnv.EMAIL_HOST || !parsedEnv.EMAIL_PORT || !parsedEnv.EMAIL_USER || !parsedEnv.EMAIL_PASS) {
    throw new Error("SMTP email configuration is incomplete. Set RESEND_API_KEY or configure EMAIL_HOST/PORT/USER/PASS.");
  }
}

export const env = parsedEnv;
