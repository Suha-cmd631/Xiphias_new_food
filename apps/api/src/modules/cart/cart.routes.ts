import { Router } from "express";
import { AddLineBody, CartAddressBody, CartShippingBody, CouponBody, UpdateLineBody } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { cartService, currentCart, toDto } from "./cart.service.js";

export const cartRouter = Router();
cartRouter.get("/", h(async (req, res) => res.json(await toDto(await currentCart(req, res), res.locals.region))));
cartRouter.post("/lines", h(async (req, res) => { const b = AddLineBody.parse(req.body); res.status(201).json(await cartService.addLine(req, res, b.variantId, b.qty)); }));
cartRouter.patch("/lines/:id", h(async (req, res) => { const b = UpdateLineBody.parse(req.body); res.json(await cartService.updateLine(req, res, req.params.id as string, b.qty)); }));
cartRouter.delete("/lines/:id", h(async (req, res) => res.json(await cartService.updateLine(req, res, req.params.id as string, 0))));
cartRouter.post("/coupon", h(async (req, res) => res.json(await cartService.setCoupon(req, res, CouponBody.parse(req.body).code))));
cartRouter.delete("/coupon", h(async (req, res) => res.json(await cartService.setCoupon(req, res, null))));
cartRouter.post("/address", h(async (req, res) => { const b = CartAddressBody.parse(req.body); res.json(await cartService.setAddress(req, res, b.email, b.address)); }));
cartRouter.get("/shipping-rates", h(async (req, res) => res.json(await cartService.shippingRates(req, res))));
cartRouter.post("/shipping-rate", h(async (req, res) => res.json(await cartService.setShipping(req, res, CartShippingBody.parse(req.body).optionId))));
