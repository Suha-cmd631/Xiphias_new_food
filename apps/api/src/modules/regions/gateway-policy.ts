/**
 * Which gateway a region really uses (pure, unit-tested).
 * Local development: a gateway without keys falls back to the mock gateway so checkout still works.
 * Production: there is NO fallback unless ALLOW_MOCK_PAYMENTS=true — the region keeps its real gateway and is flagged unconfigured.
 */
export function resolveGateway(
  wanted: "jiopay" | "stripe" | "mock",
  configured: { stripe: boolean; jiopay: boolean },
  mockAllowed: boolean,
): { gateway: "jiopay" | "stripe" | "mock"; paymentsConfigured: boolean } {
  if (wanted === "stripe" && configured.stripe) return { gateway: "stripe", paymentsConfigured: true };
  if (wanted === "jiopay" && configured.jiopay) return { gateway: "jiopay", paymentsConfigured: true };
  if (mockAllowed) return { gateway: "mock", paymentsConfigured: true };
  return { gateway: wanted, paymentsConfigured: false };
}
