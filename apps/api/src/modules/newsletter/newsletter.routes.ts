import { Router } from "express";
import { NewsletterSubscribeBody } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { prisma } from "../../shared/prisma.js";
import { token } from "../../shared/ids.js";
import { enqueue } from "../../shared/outbox.js";
import { env } from "../../config/env.js";

export const newsletterRouter = Router();

/** Double opt-in (required for EU): pending → confirm link by email → confirmed. */
newsletterRouter.post("/subscribe", h(async (req, res) => {
  const b = NewsletterSubscribeBody.parse(req.body);
  const email = b.email.toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing?.status === "confirmed") { res.json({ status: "confirmed" }); return; }
  const row = existing
    ? await prisma.newsletterSubscriber.update({ where: { email }, data: { status: "pending", token: token(24), source: b.source, regionCode: res.locals.region.code } })
    : await prisma.newsletterSubscriber.create({ data: { email, token: token(24), source: b.source, regionCode: res.locals.region.code } });
  await enqueue("email.newsletter_confirm", { subscriberId: row.id });
  res.status(202).json({ status: "pending" });
}));

newsletterRouter.get("/confirm/:token", h(async (req, res) => {
  const row = await prisma.newsletterSubscriber.findUnique({ where: { token: req.params.token as string } });
  if (row && row.status !== "unsubscribed") await prisma.newsletterSubscriber.update({ where: { id: row.id }, data: { status: "confirmed", confirmedAt: new Date() } });
  res.redirect(`${env.WEB_ORIGIN}/newsletter/${row ? "confirmed" : "invalid"}`);
}));

newsletterRouter.get("/unsubscribe/:token", h(async (req, res) => {
  await prisma.newsletterSubscriber.updateMany({ where: { token: req.params.token as string }, data: { status: "unsubscribed" } });
  res.redirect(`${env.WEB_ORIGIN}/newsletter/unsubscribed`);
}));
