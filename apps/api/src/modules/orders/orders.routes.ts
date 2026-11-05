import { Router } from "express";
import { TrackQuery } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { ordersService } from "./orders.service.js";
import { requireCustomer } from "../auth/auth.middleware.js";
import { limits } from "../../shared/rate-limit.js";
import { hasOrderGrant } from "./order-access.js";

export const ordersRouter = Router();
ordersRouter.get("/:id", limits.orderLookup(), h(async (req, res) => {
  const id = req.params.id as string;
  res.json(await ordersService.byIdWithProof(id, { customerId: res.locals.customer?.id, hasGrant: hasOrderGrant(req, id), email: typeof req.query.email === "string" ? req.query.email : undefined }));
}));

export const trackRouter = Router();
trackRouter.get("/", limits.track(), h(async (req, res) => { const q = TrackQuery.parse(req.query); res.json(await ordersService.track(q.number, q.email)); }));

export const myOrdersRouter = Router();
myOrdersRouter.use(requireCustomer);
myOrdersRouter.get("/", h(async (_req, res) => res.json({ items: await ordersService.mine(res.locals.customer!.id) })));
myOrdersRouter.get("/:id", h(async (req, res) => res.json(await ordersService.mineDetail(res.locals.customer!.id, req.params.id as string))));
