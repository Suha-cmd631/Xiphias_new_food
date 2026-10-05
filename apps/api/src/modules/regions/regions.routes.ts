import { Router } from "express";
import { RegionsResponse, SetRegionBody } from "@xsf/contracts";
import { h } from "../../shared/http.js";
import { COOKIES, setCookie } from "../../shared/cookies.js";
import { loadRegions, toDto } from "./regions.service.js";

export const regionsRouter = Router();

regionsRouter.get(
  "/",
  h(async (_req, res) => {
    const { regions } = await loadRegions();
    const body = RegionsResponse.parse({ regions: regions.map(toDto), current: res.locals.region.code, detectedCountry: res.locals.detectedCountry });
    res.json(body);
  }),
);

regionsRouter.post(
  "/select",
  h(async (req, res) => {
    const { region } = SetRegionBody.parse(req.body);
    setCookie(res, COOKIES.region, region, 365 * 24 * 3600);
    const { regions } = await loadRegions();
    res.json({ region: toDto(regions.find((r) => r.code === region)!) });
  }),
);
