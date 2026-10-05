import { Router } from "express";
import { TrackQuery } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { ordersService } from "./orders.service.js";
import { requireCustomer } from "../auth/auth.middleware.js";

export const ordersRouter = Router();
ordersRouter.get("/:id", h(async (req, res) => res.json(await ordersService.byIdForEmail(req.params.id as string, req.query.email ? String(req.query.email) : undefined))));

export const trackRouter = Router();
trackRouter.get("/", h(async (req, res) => { const q = TrackQuery.parse(req.query); res.json(await ordersService.track(q.number, q.email)); }));

export const myOrdersRouter = Router();
myOrdersRouter.use(requireCustomer);
myOrdersRouter.get("/", h(async (_req, res) => res.json({ items: await ordersService.mine(res.locals.customer!.id) })));
myOrdersRouter.get("/:id", h(async (req, res) => res.json(await ordersService.mineDetail(res.locals.customer!.id, req.params.id as string))));
