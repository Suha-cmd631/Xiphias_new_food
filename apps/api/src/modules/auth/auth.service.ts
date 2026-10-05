import argon2 from "argon2";
import type { Me } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { badRequest, unauthorized } from "../../shared/errors.js";
import { sha256, token } from "../../shared/ids.js";

const SESSION_DAYS = 30;

export const authService = {
  async register(input: { email: string; password: string; firstName: string; lastName: string; marketingOptIn: boolean }, meta: { ip?: string; ua?: string }) {
    const email = input.email.toLowerCase();
    const exists = await prisma.customer.findUnique({ where: { email } });
    if (exists?.passwordHash) throw badRequest("EMAIL_TAKEN", "An account with this email already exists — sign in instead");
    const passwordHash = await argon2.hash(input.password);
    const customer = exists
      ? await prisma.customer.update({ where: { email }, data: { passwordHash, firstName: input.firstName, lastName: input.lastName, marketingOptIn: input.marketingOptIn } })
      : await prisma.customer.create({ data: { email, passwordHash, firstName: input.firstName, lastName: input.lastName, marketingOptIn: input.marketingOptIn } });
    return { customer, session: await this.createSession(customer.id, meta) };
  },
  async login(email: string, password: string, meta: { ip?: string; ua?: string }) {
    const customer = await prisma.customer.findUnique({ where: { email: email.toLowerCase() } });
    if (!customer?.passwordHash || !(await argon2.verify(customer.passwordHash, password))) throw unauthorized("Email or password is incorrect");
    return { customer, session: await this.createSession(customer.id, meta) };
  },
  async createSession(customerId: string, meta: { ip?: string; ua?: string }) {
    const raw = token();
    await prisma.session.create({ data: { customerId, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5), ip: meta.ip, userAgent: meta.ua?.slice(0, 200) } });
    return { token: raw, maxAge: SESSION_DAYS * 86400 };
  },
  async fromToken(raw: string | undefined) {
    if (!raw) return null;
    const s = await prisma.session.findUnique({ where: { tokenHash: sha256(raw) }, include: { customer: true } });
    if (!s || s.expiresAt < new Date() || s.customer.deletedAt) return null;
    return s.customer;
  },
  async logout(raw: string | undefined) {
    if (raw) await prisma.session.deleteMany({ where: { tokenHash: sha256(raw) } });
  },
  me(c: { id: string; email: string; firstName: string; lastName: string; marketingOptIn: boolean; createdAt: Date }): Me {
    return { id: c.id, email: c.email, firstName: c.firstName, lastName: c.lastName, marketingOptIn: c.marketingOptIn, createdAt: c.createdAt.toISOString() };
  },
};
