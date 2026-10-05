import { z } from "zod";

export const ContactBody = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(20).optional().default(""),
  subject: z.string().max(120).optional().default(""),
  message: z.string().min(5).max(2000),
  website: z.string().max(0).optional(), // honeypot
});

export const B2BQuoteBody = z.object({
  company: z.string().min(2).max(120),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  country: z.string().length(2),
  interest: z.enum(["bulk", "private_label", "export", "other"]),
  products: z.array(z.string()).min(1),
  monthlyVolume: z.string().max(60),
  message: z.string().max(2000).optional().default(""),
  website: z.string().max(0).optional(),
});
export type B2BQuoteBody = z.infer<typeof B2BQuoteBody>;

export const LeadCreatedResponse = z.object({ id: z.string(), reference: z.string() });
export type LeadCreatedResponse = z.infer<typeof LeadCreatedResponse>;
export type ContactBody = z.infer<typeof ContactBody>;
