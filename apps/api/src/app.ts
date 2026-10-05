import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./shared/logger.js";
import { errorHandler, notFoundHandler } from "./shared/errors.js";
import { regionMiddleware } from "./modules/regions/region.middleware.js";
import { attachCustomer } from "./modules/auth/auth.middleware.js";
import { regionsRouter } from "./modules/regions/regions.routes.js";
import { catalogRouter, searchRouter } from "./modules/catalog/catalog.routes.js";
import { contentRouter } from "./modules/content/content.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { checkoutRouter } from "./modules/checkout/checkout.routes.js";
import { webhooksRouter } from "./modules/webhooks/webhooks.routes.js";
import { myOrdersRouter, ordersRouter, trackRouter } from "./modules/orders/orders.routes.js";
import { authRouter, meRouter } from "./modules/auth/auth.routes.js";
import { b2bRouter, contactRouter } from "./modules/leads/leads.routes.js";
import { newsletterRouter } from "./modules/newsletter/newsletter.routes.js";
import { prisma } from "./shared/prisma.js";

export function buildApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.WEB_ORIGIN.split(","), credentials: true, exposedHeaders: ["x-region"] }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));

  app.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, db: "up", time: new Date().toISOString() });
    } catch {
      res.status(503).json({ ok: false, db: "down" });
    }
  });

  // Webhooks need the raw body — mounted before the JSON parser.
  app.use("/api/v1/webhooks", webhooksRouter);

  app.use(express.json({ limit: "1mb" }));
  app.use(regionMiddleware);
  app.use(attachCustomer);

  const v1 = express.Router();
  v1.use("/regions", regionsRouter);
  v1.use("/catalog", catalogRouter);
  v1.use("/search", searchRouter);
  v1.use("/content", contentRouter);
  v1.use("/cart", cartRouter);
  v1.use("/checkout", checkoutRouter);
  v1.use("/orders", ordersRouter);
  v1.use("/track", trackRouter);
  v1.use("/auth", authRouter);
  v1.use("/me", meRouter);
  v1.use("/me/orders", myOrdersRouter);
  v1.use("/contact", contactRouter);
  v1.use("/b2b", b2bRouter);
  v1.use("/newsletter", newsletterRouter);
  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
