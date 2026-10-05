import type { Prisma } from "@prisma/client";
import { prisma, type Tx } from "./prisma.js";

/** Request handlers never send email or call couriers inline: they enqueue here and the worker delivers. */
export async function enqueue(type: string, payload: Prisma.InputJsonValue, tx?: Tx) {
  const db = tx ?? prisma;
  return db.outbox.create({ data: { type, payload } });
}
