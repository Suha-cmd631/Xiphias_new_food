import { Router } from "express";
import { LoginBody, RegisterBody } from "@xsf/contracts";
import { h, ipOf } from "../../shared/http.js";
import { clearCookie, COOKIES, readCookie, setCookie } from "../../shared/cookies.js";
import { authService } from "./auth.service.js";

export const authRouter = Router();

authRouter.post("/register", h(async (req, res) => {
  const b = RegisterBody.parse(req.body);
  const { customer, session } = await authService.register(b, { ip: ipOf(req), ua: req.headers["user-agent"] });
  setCookie(res, COOKIES.session, session.token, session.maxAge);
  res.status(201).json(authService.me(customer));
}));

authRouter.post("/login", h(async (req, res) => {
  const b = LoginBody.parse(req.body);
  const { customer, session } = await authService.login(b.email, b.password, { ip: ipOf(req), ua: req.headers["user-agent"] });
  setCookie(res, COOKIES.session, session.token, session.maxAge);
  res.json(authService.me(customer));
}));

authRouter.post("/logout", h(async (req, res) => {
  await authService.logout(readCookie(req, COOKIES.session));
  clearCookie(res, COOKIES.session);
  res.status(204).end();
}));

export const meRouter = Router();
// 200 + null for guests (avoids noisy 401s on every page); the account page redirects on null.
meRouter.get("/", h(async (_req, res) => res.json(res.locals.customer ? authService.me(res.locals.customer) : null)));
