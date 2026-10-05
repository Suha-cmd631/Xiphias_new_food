import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";

// Engine-less Prisma client (query compiler + pg driver adapter): no Rust binary download, smaller images.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter, log: process.env.PRISMA_LOG ? ["query", "warn", "error"] : ["warn", "error"] });
export type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];
