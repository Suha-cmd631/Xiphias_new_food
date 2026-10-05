import { Router } from "express";
import { PostListQuery } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { contentService } from "./content.service.js";
import { contentRepo } from "./content.repo.js";

export const contentRouter = Router();
contentRouter.get("/posts", h(async (req, res) => res.json(await contentService.posts(PostListQuery.parse(req.query)))));
contentRouter.get("/posts/:slug", h(async (req, res) => res.json(await contentService.post(req.params.slug as string))));
contentRouter.get("/pages/:slug", h(async (req, res) => res.json(await contentService.page(req.params.slug as string))));
contentRouter.get("/banners", h(async (req, res) => res.json({ items: await contentService.banners(String(req.query.placement ?? "hero")) })));
contentRouter.get("/settings", h(async (req, res) => res.json(await contentService.settings(String(req.query.keys ?? "announcement,deal,reviews,store_hours").split(",")))));
contentRouter.get("/redirects", h(async (_req, res) => res.json({ items: await contentRepo.redirects() })));
