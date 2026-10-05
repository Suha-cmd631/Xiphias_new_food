import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  PUBLIC_API_URL: z.string().default("http://localhost:4000"),
  SESSION_SECRET: z.string().min(8).default("dev-secret-change-me"),
  SERVICE_TOKEN: z.string().default("dev-service-token"),
  COOKIE_DOMAIN: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  JIOPAY_MERCHANT_ID: z.string().optional().default(""),
  JIOPAY_API_KEY: z.string().optional().default(""),
  JIOPAY_SECRET: z.string().optional().default(""),
  JIOPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  JIOPAY_BASE_URL: z.string().optional().default(""),

  SHIPROCKET_EMAIL: z.string().optional().default(""),
  SHIPROCKET_PASSWORD: z.string().optional().default(""),
  SHIPROCKET_PICKUP_LOCATION: z.string().optional().default("Primary"),

  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().optional().default(1025),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().optional().default("Xiphias Superfoods <hello@xiphiassuperfoods.com>"),
  ADMIN_NOTIFY_EMAIL: z.string().optional().default("info@xiphias.in"),
  LOG_LEVEL: z.string().optional().default("info"),
});

export const env = Env.parse(process.env);
export const isProd = env.NODE_ENV === "production";

/** Which gateways are really configured. Anything unconfigured falls back to the mock gateway (dev only). */
export const gatewaysConfigured = {
  stripe: Boolean(env.STRIPE_SECRET_KEY),
  jiopay: Boolean(env.JIOPAY_MERCHANT_ID && env.JIOPAY_SECRET && env.JIOPAY_BASE_URL),
};
