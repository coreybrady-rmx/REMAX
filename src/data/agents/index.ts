import { coreyBrady } from "./corey-brady";
import type { AgentProfile } from "../types";

/** Registry of agent microsite content packs. Add Phase 2 agents here. */
export const agentRegistry: Record<string, AgentProfile> = {
  "corey-brady": coreyBrady,
};

export function listAgents() {
  return Object.values(agentRegistry);
}

export function getAgentBySlug(slug: string) {
  return agentRegistry[slug] ?? null;
}
