import { buildApp } from "./app.js";
import { env, gatewaysConfigured } from "./config/env.js";
import { logger } from "./shared/logger.js";

const app = buildApp();
app.listen(env.API_PORT, () => {
  logger.info(
    { port: env.API_PORT, web: env.WEB_ORIGIN, stripe: gatewaysConfigured.stripe ? "live keys" : "MOCK", jiopay: gatewaysConfigured.jiopay ? "live keys" : "MOCK" },
    `API ready at http://localhost:${env.API_PORT}  (health: /health, base: /api/v1)`,
  );
});
