export type LeadDeliveryMode = "forward" | "dev-log" | "unconfigured";

/**
 * Missing webhook: log and return success only for local/dev.
 * Production and preview must not tell the visitor the lead was sent.
 */
export function leadDeliveryMode(input: {
  webhook: string | undefined;
  nodeEnv: string | undefined;
  vercelEnv: string | undefined;
}): LeadDeliveryMode {
  if (input.webhook?.trim()) return "forward";

  const vercelEnv = input.vercelEnv?.trim();
  const isDev = vercelEnv
    ? vercelEnv === "development"
    : input.nodeEnv !== "production";

  return isDev ? "dev-log" : "unconfigured";
}
