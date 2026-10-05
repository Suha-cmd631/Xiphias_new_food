import { Router } from "express";
import { CheckoutCreateBody, MockPayBody } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { checkoutService } from "./checkout.service.js";

export const checkoutRouter = Router();
checkoutRouter.post("/create", h(async (req, res) => { const b = CheckoutCreateBody.parse(req.body); res.status(201).json(await checkoutService.create(req, res, { notes: b.notes, marketingOptIn: b.marketingOptIn })); }));
checkoutRouter.get("/status/:orderId", h(async (req, res) => res.json(await checkoutService.status(req.params.orderId as string, req, res))));
checkoutRouter.post("/mock/complete", h(async (req, res) => { const b = MockPayBody.parse(req.body); res.json(await checkoutService.mockComplete(b.orderId, b.outcome, req, res)); }));
