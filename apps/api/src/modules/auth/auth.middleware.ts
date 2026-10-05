import type { RequestHandler } from "express";
import type { Customer } from "@prisma/client";
import { COOKIES, readCookie } from "../../shared/cookies.js";
import { unauthorized } from "../../shared/errors.js";
import { authService } from "./auth.service.js";

declare module "express-serve-static-core" {
  interface Locals {
    customer: Customer | null;
  }
}

export const attachCustomer: RequestHandler = async (req, res, next) => {
  try {
    res.locals.customer = await authService.fromToken(readCookie(req, COOKIES.session));
    next();
  } catch (e) {
    next(e);
  }
};

export const requireCustomer: RequestHandler = (_req, res, next) => {
  if (!res.locals.customer) return next(unauthorized());
  next();
};
