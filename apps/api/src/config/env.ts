import "dotenv/config";
import { z } from "zod";

/** "true"/"1"/"yes" → true. (z.coerce.boolean() would treat the string "false" as true.) */
const flag = z
  .string()
  .optional()
  .transform((v) => /^(1|true|yes|on)$/i.test((v ?? "").trim()));
const list = (v: string) => v.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  PUBLIC_API_URL: z.string().default("http://localhost:4000"),
  SESSION_SECRET: z.string().min(8).default("dev-secret-change-me"),
  SERVICE_TOKEN: z.string().default("dev-service-token"),
  COOKIE_DOMAIN: z.string().optional(),
  /** Express "trust proxy": number of reverse-proxy hops in front of the API (or a subnet list). Drives req.ip → rate limiting. */
  TRUST_PROXY: z.string().optional().default("1"),

  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  JIOPAY_MERCHANT_ID: z.string().optional().default(""),
  JIOPAY_API_KEY: z.string().optional().default(""),
  JIOPAY_SECRET: z.string().optional().default(""),
  JIOPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  JIOPAY_BASE_URL: z.string().optional().default(""),
  /** Production only: allow the built-in mock gateway (staging/demo). Never set on the live store. */
  ALLOW_MOCK_PAYMENTS: flag,

  /** ISO country codes where checkout is closed (prices still display). Set to an empty value to open everything. */
  CHECKOUT_CLOSED_COUNTRIES: z.string().optional().default("CA"),
  /** Whole region codes (IN, EU, UK, US, CA, ME, ROW) where checkout is closed. */
  CHECKOUT_CLOSED_REGIONS: z.string().optional().default(""),

  SHIPROCKET_EMAIL: z.string().optional().default(""),
  SHIPROCKET_PASSWORD: z.string().optional().default(""),
  SHIPROCKET_PICKUP_LOCATION: z.string().optional().default("Primary"),
  /** Shared secret Shiprocket sends in the `x-api-key` header of tracking webhooks. */
  SHIPROCKET_WEBHOOK_TOKEN: z.string().optional().default(""),

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

// SESSION_SECRET signs the guest order-access cookie. A known default in production would let anyone forge it.
const WEAK_SECRETS = new Set(["dev-secret-change-me", "change-me-to-a-long-random-string"]);
if (isProd && (WEAK_SECRETS.has(env.SESSION_SECRET) || env.SESSION_SECRET.length < 32)) {
  throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters in production");
}

/** Which gateways are really configured. */
export const gatewaysConfigured = {
  stripe: Boolean(env.STRIPE_SECRET_KEY),
  jiopay: Boolean(env.JIOPAY_MERCHANT_ID && env.JIOPAY_SECRET && env.JIOPAY_BASE_URL),
};

/** The mock gateway exists for local development. In production it is off unless ALLOW_MOCK_PAYMENTS=true. */
export const mockPaymentsAllowed = !isProd || env.ALLOW_MOCK_PAYMENTS;

export const checkoutClosed = {
  countries: list(env.CHECKOUT_CLOSED_COUNTRIES),
  regions: list(env.CHECKOUT_CLOSED_REGIONS),
};

/** Express accepts a hop count, a boolean, or a comma-separated list of trusted subnets. */
export const trustProxy: number | boolean | string = /^\d+$/.test(env.TRUST_PROXY) ? Number(env.TRUST_PROXY) : env.TRUST_PROXY === "true" ? true : env.TRUST_PROXY === "false" ? false : env.TRUST_PROXY;
