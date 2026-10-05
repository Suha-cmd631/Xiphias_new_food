import { Router } from "express";
import { B2BQuoteBody, ContactBody } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { prisma } from "../../shared/prisma.js";
import { nextLeadReference } from "../../shared/ids.js";
import { enqueue } from "../../shared/outbox.js";
import { badRequest } from "../../shared/errors.js";

export const contactRouter = Router();
contactRouter.post("/", h(async (req, res) => {
  const b = ContactBody.parse(req.body);
  if (b.website) throw badRequest("SPAM", "Rejected"); // honeypot
  const reference = await nextLeadReference();
  const lead = await prisma.lead.create({ data: { reference, source: "contact", name: b.name, email: b.email, phone: b.phone, message: `${b.subject ? b.subject + "\n\n" : ""}${b.message}` } });
  await enqueue("email.lead_notify", { leadId: lead.id });
  await enqueue("email.lead_ack", { leadId: lead.id });
  res.status(201).json({ id: lead.id, reference });
}));

export const b2bRouter = Router();
b2bRouter.post("/quote", h(async (req, res) => {
  const b = B2BQuoteBody.parse(req.body);
  if (b.website) throw badRequest("SPAM", "Rejected");
  const reference = await nextLeadReference();
  const lead = await prisma.lead.create({
    data: { reference, source: "b2b_quote", company: b.company, name: b.name, email: b.email, phone: b.phone, country: b.country, interest: b.interest, products: b.products, volume: b.monthlyVolume, message: b.message },
  });
  await enqueue("email.lead_notify", { leadId: lead.id });
  await enqueue("email.lead_ack", { leadId: lead.id });
  res.status(201).json({ id: lead.id, reference });
}));
