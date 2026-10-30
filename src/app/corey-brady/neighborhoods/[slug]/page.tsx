import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedListings } from "@/components/FeaturedListings";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyMobileBar } from "@/components/StickyMobileBar";
import { coreyBrady } from "@/data/agents/corey-brady";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return coreyBrady.neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hood = coreyBrady.neighborhoods.find((n) => n.slug === slug);
  if (!hood) return {};
  return {
    title: `${hood.name} Real Estate | Corey Brady`,
    description: hood.blurb,
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const { slug } = await params;
  const agent = coreyBrady;
  const hood = agent.neighborhoods.find((n) => n.slug === slug);
  if (!hood) notFound();

  const city =
    hood.slug === "bear-lake"
      ? "Garden City"
      : hood.slug === "north-logan"
        ? "North Logan"
        : hood.name;

  return (
    <div className="agent-page">
      <SiteHeader agentName={agent.name} />
      <section
        className="agent-hero"
        style={{ backgroundImage: `url('${hood.image}')`, minHeight: "56vh" }}
      >
        <div className="agent-hero-inner">
          <p className="eyebrow eyebrow-light">Neighborhood guide</p>
          <h1>{hood.name}</h1>
          <p className="hero-support">{hood.blurb}</p>
          <div className="hero-ctas">
            <a className="btn btn-red" href="#listings">
              Search {hood.name}
            </a>
            <Link className="btn btn-ghost" href={`/${agent.slug}/`}>
              Back to {agent.firstName}
            </Link>
          </div>
        </div>
      </section>
      <div id="listings">
        <FeaturedListings city={city} />
      </div>
      <section className="section">
        <div className="path-card">
          <h3>Want a local walkthrough?</h3>
          <p>
            {agent.firstName} can share recent sales, school context, and
            upcoming inventory in {hood.name}.
          </p>
          <Link className="btn btn-red" href={`/${agent.slug}/#contact`}>
            Contact {agent.firstName}
          </Link>
        </div>
      </section>
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
