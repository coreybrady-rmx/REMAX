import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyMobileBar } from "@/components/StickyMobileBar";
import { coreyBrady } from "@/data/agents/corey-brady";

export const metadata: Metadata = {
  title: "Get Your Home Value | Corey Brady",
  description:
    "Request a Cache Valley CMA from Corey Brady at RE/MAX Peaks. Share your address and contact info and he will follow up.",
};

export default function HomeValuePage() {
  const agent = coreyBrady;
  return (
    <div className="agent-page">
      <SiteHeader agentName={agent.name} />
      <main className="page-shell">
        <p className="eyebrow">Home value</p>
        <h1>Get My Home Value</h1>
        <p>
          Share your address and contact info. {agent.firstName} will get back
          to you with a CMA.
        </p>
        <div style={{ marginTop: 28 }}>
          <LeadForm
            agentSlug={agent.slug}
            agentName={agent.name}
            ghlAssignee={agent.ghlAssignee}
            intent="home-value"
          />
        </div>
        <p style={{ marginTop: 24, color: "var(--muted)", fontSize: 14 }}>
          Or email{" "}
          <a href={`mailto:${agent.email}`}>{agent.email}</a>
        </p>
        <p style={{ marginTop: 16 }}>
          <Link href={`/${agent.slug}/`}>Back to {agent.firstName}&apos;s page</Link>
        </p>
      </main>
      <SiteFooter />
      <StickyMobileBar
        agentSlug={agent.slug}
        firstName={agent.firstName}
        phone={agent.phone}
        homeValueHref={`/${agent.slug}/home-value/`}
      />
    </div>
  );
}
