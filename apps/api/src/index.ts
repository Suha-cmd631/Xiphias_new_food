import { buildApp } from "./app.js";
import { checkoutClosed, env, gatewaysConfigured, mockPaymentsAllowed } from "./config/env.js";
import { logger } from "./shared/logger.js";

const app = buildApp();
app.listen(env.API_PORT, () => {
  logger.info(
    { port: env.API_PORT, web: env.WEB_ORIGIN, stripe: gatewaysConfigured.stripe ? "live keys" : mockPaymentsAllowed ? "MOCK" : "NOT CONFIGURED (checkout refused)", jiopay: gatewaysConfigured.jiopay ? "live keys" : mockPaymentsAllowed ? "MOCK" : "NOT CONFIGURED (checkout refused)", checkoutClosed },
    `API ready at http://localhost:${env.API_PORT}  (health: /health, base: /api/v1)`,
  );
});
