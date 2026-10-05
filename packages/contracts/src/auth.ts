import { z } from "zod";

export const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(60),
  lastName: z.string().max(60).optional().default(""),
  marketingOptIn: z.boolean().default(false),
});
export const LoginBody = z.object({ email: z.string().email(), password: z.string().min(1) });

export const Me = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  marketingOptIn: z.boolean(),
  createdAt: z.string(),
});
export type Me = z.infer<typeof Me>;
export type RegisterBody = z.infer<typeof RegisterBody>;
export type LoginBody = z.infer<typeof LoginBody>;
