import type { Tx } from "../../shared/prisma.js";

/** Atomic reservation: one statement, no read-then-write race. Returns false when stock is insufficient. */
export async function reserveStock(tx: Tx, variantId: string, qty: number): Promise<boolean> {
  const rows = await tx.$executeRaw`UPDATE "Inventory" SET "reserved" = "reserved" + ${qty} WHERE "variantId" = ${variantId} AND ("onHand" - "reserved") >= ${qty}`;
  return rows === 1;
}
