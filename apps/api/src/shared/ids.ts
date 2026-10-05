import { randomBytes, createHash } from "node:crypto";
import { prisma } from "./prisma.js";

export const token = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** XS-2026-000123 — sequential per calendar year, safe under concurrency via a settings row counter. */
export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const key = `seq:order:${year}`;
  const next = await prisma.$transaction(async (tx) => {
    const row = await tx.siteSetting.findUnique({ where: { key } });
    const cur = typeof row?.value === "number" ? row.value : 0;
    const value = cur + 1;
    await tx.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    return value;
  });
  return `XS-${year}-${String(next).padStart(6, "0")}`;
}

export async function nextLeadReference(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const key = `seq:lead:${year}`;
  const next = await prisma.$transaction(async (tx) => {
    const row = await tx.siteSetting.findUnique({ where: { key } });
    const cur = typeof row?.value === "number" ? row.value : 0;
    const value = cur + 1;
    await tx.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    return value;
  });
  return `L-${year}-${String(next).padStart(4, "0")}`;
}
