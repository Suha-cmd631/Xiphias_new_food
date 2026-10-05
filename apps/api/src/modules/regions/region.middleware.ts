import type { RequestHandler } from "express";
import { RegionCode } from "@xsf/contracts";
import { COOKIES, readCookie, setCookie } from "../../shared/cookies.js";
import { detectCountry, loadRegions, regionForCountry, type RegionCtx } from "./regions.service.js";

declare module "express-serve-static-core" {
  interface Locals {
    region: RegionCtx;
    detectedCountry: string | null;
  }
}

const YEAR = 365 * 24 * 3600;

/** Resolves the shopper's region: cookie → X-Region header → edge geo header → IN. */
export const regionMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const { regions } = await loadRegions();
    const detected = detectCountry(req);
    const fromCookie = readCookie(req, COOKIES.region);
    const fromHeader = req.headers["x-region"] as string | undefined;
    let code = RegionCode.safeParse(fromCookie ?? fromHeader).data;
    if (!code) {
      code = detected ? await regionForCountry(detected) : "IN";
      setCookie(res, COOKIES.region, code, YEAR);
    }
    res.locals.region = regions.find((r) => r.code === code) ?? regions[0]!;
    res.locals.detectedCountry = detected;
    next();
  } catch (e) {
    next(e);
  }
};
