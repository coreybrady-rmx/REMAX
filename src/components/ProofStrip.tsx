import type { AgentProfile } from "@/data/types";

export function ProofStrip({ agent }: { agent: AgentProfile }) {
  return (
    <section className="proof-strip" aria-label="Results">
      <div className="proof-label">
        <p className="eyebrow">{agent.statsLabel}</p>
      </div>
      <div className="proof-stats">
        {agent.stats.map((stat) => (
          <div key={stat.label} className="proof-stat">
            <p className="proof-value">{stat.value}</p>
            <p className="proof-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
