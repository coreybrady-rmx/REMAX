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
    "Request a Cache Valley home value from Corey Brady at RE/MAX Peaks. Fast, local, and no-pressure.",
};

export default function HomeValuePage() {
  const agent = coreyBrady;
  return (
    <div className="agent-page">
      <SiteHeader agentName={agent.name} />
      <main className="page-shell">
        <p className="eyebrow">Seller lead offer</p>
        <h1>What&apos;s your home worth?</h1>
        <p>
          Share a few details and {agent.firstName} will follow up with a
          Cache Valley market read and recommended next steps — priced for
          today&apos;s buyers.
        </p>
        <div style={{ marginTop: 28 }}>
          <LeadForm
            agentSlug={agent.slug}
            agentName={agent.name}
            ghlAssignee={agent.ghlAssignee}
            intent="home-value"
          />
        </div>
        <p style={{ marginTop: 24 }}>
          <Link href={`/${agent.slug}/`}>← Back to {agent.firstName}&apos;s page</Link>
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
