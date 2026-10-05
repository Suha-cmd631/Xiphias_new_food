import { Router } from "express";
import { ProductListQuery } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { catalogService } from "./catalog.service.js";

export const catalogRouter = Router();

catalogRouter.get("/categories", h(async (_req, res) => res.json({ items: await catalogService.categories() })));
catalogRouter.get("/products", h(async (req, res) => res.json(await catalogService.list(ProductListQuery.parse(req.query), res.locals.region))));
catalogRouter.get("/products/bestsellers", h(async (req, res) => res.json({ items: await catalogService.bestsellers(res.locals.region, Number(req.query.limit ?? 8)) })));
catalogRouter.get("/products/:slug", h(async (req, res) => res.json(await catalogService.detail(req.params.slug as string, res.locals.region))));

export const searchRouter = Router();
searchRouter.get("/suggest", h(async (req, res) => res.json(await catalogService.suggest(String(req.query.q ?? ""), res.locals.region))));
