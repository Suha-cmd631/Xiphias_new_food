import { randomBytes, createHash } from "node:crypto";
import { prisma, type Tx } from "./prisma.js";

export const token = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Atomic counter in a SiteSetting row: one INSERT … ON CONFLICT DO UPDATE … RETURNING statement, so two
 * concurrent callers can never read the same value (the row lock serialises them).
 */
export async function nextSequence(key: string, db: Tx | typeof prisma = prisma): Promise<number> {
  const rows = await db.$queryRaw<{ value: number }[]>`
    INSERT INTO "SiteSetting" ("key", "value") VALUES (${key}, '1'::jsonb)
    ON CONFLICT ("key") DO UPDATE SET "value" = to_jsonb(COALESCE(NULLIF("SiteSetting"."value" #>> '{}', '')::bigint, 0) + 1)
    RETURNING ("value" #>> '{}')::int AS "value"`;
  return Number(rows[0]!.value);
}

export const formatOrderNumber = (year: number, seq: number) => `XS-${year}-${String(seq).padStart(6, "0")}`;

/** XS-2026-000123 — sequential per calendar year. Pass the order transaction so a rolled-back checkout does not burn a number. */
export async function nextOrderNumber(db: Tx | typeof prisma = prisma): Promise<string> {
  const year = new Date().getUTCFullYear();
  return formatOrderNumber(year, await nextSequence(`seq:order:${year}`, db));
}

export async function nextLeadReference(): Promise<string> {
  const year = new Date().getUTCFullYear();
  return `L-${year}-${String(await nextSequence(`seq:lead:${year}`)).padStart(4, "0")}`;
}
