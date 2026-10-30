import Link from "next/link";
import type { AgentProfile } from "@/data/types";
import { FeaturedListings } from "@/components/FeaturedListings";
import { LeadForm } from "@/components/LeadForm";
import { ProofStrip } from "@/components/ProofStrip";
import { SearchWidget } from "@/components/SearchWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyMobileBar } from "@/components/StickyMobileBar";
import { smsHref, telHref } from "@/lib/phone";

export function AgentMicrosite({ agent }: { agent: AgentProfile }) {
  const homeValueHref = `/${agent.slug}/home-value/`;
  const first = agent.firstName;

  return (
    <div className="agent-page">
      <SiteHeader agentName={agent.name} />

      <section className="agent-hero agent-hero--portrait">
        <div className="agent-hero-inner agent-hero-split">
          <div className="agent-hero-portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={agent.photo}
              alt={`${agent.name}, ${agent.title} at RE/MAX Peaks`}
              fetchPriority="high"
            />
          </div>
          <div className="agent-hero-copy">
            <p className="eyebrow eyebrow-light">{agent.marketLine}</p>
            <h1>{agent.name}</h1>
            <p className="hero-title">
              {agent.title}, RE/MAX Peaks
            </p>
            <p className="hero-lede">{agent.headline}</p>
            <p className="hero-support">{agent.shortPitch}</p>
            <div className="hero-ctas">
              <Link className="btn btn-red" href={homeValueHref}>
                Start Searching
              </Link>
              <Link className="btn btn-ghost" href={homeValueHref}>
                Get My Home Value
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProofStrip agent={agent} />

      <section id="property-search" className="section search-section">
        <div className="section-head">
          <p className="eyebrow">Property search</p>
          <h2>Find your next home</h2>
          <p>
            Search live Utah MLS listings. Save what you like and {first} will
            help you tour with confidence.
          </p>
        </div>
        <SearchWidget agentSlug={agent.slug} agentName={agent.name} />
      </section>

      <section className="section connect-section" id="connect">
        <div className="connect-grid">
          <div className="connect-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={agent.teamCardPhoto || agent.photo}
              alt={agent.name}
            />
          </div>
          <div className="connect-copy">
            <p className="eyebrow">Connect with {first}</p>
            <h2>Your neighbor in Cache Valley real estate</h2>
            <p>{agent.bio}</p>
            <ul className="specialty-list">
              {agent.specialties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="connect-actions">
              <a className="btn btn-ghost" href={telHref(agent.phone)}>
                Call {agent.phone}
              </a>
              <a
                className="btn btn-ghost"
                href={smsHref(
                  agent.phone,
                  `Hi ${first}, I found you on RE/MAX Peaks.`,
                )}
              >
                Text {first}
              </a>
              <a className="btn btn-white" href={`mailto:${agent.email}`}>
                Email {first}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section path-section">
        <div className="section-head">
          <p className="eyebrow">How can I help?</p>
          <h2>Buy or sell with a clear plan</h2>
        </div>
        <div className="path-grid">
          <article className="path-card">
            <h3>Buying in Cache Valley</h3>
            <p>
              Search live listings, get local insight on neighborhoods, and move
              with a strategy for tours, offers, and closing.
            </p>
            <Link className="btn btn-red" href={homeValueHref}>
              Start Searching
            </Link>
          </article>
          <article className="path-card">
            <h3>Selling your home</h3>
            <p>
              Get a clear market value and a marketing plan built for Cache
              Valley buyers, priced and positioned to perform.
            </p>
            <Link className="btn btn-red" href={homeValueHref}>
              Get My Home Value
            </Link>
          </article>
        </div>
      </section>

      <FeaturedListings city="Logan" />

      <section className="section neighborhood-section">
        <div className="section-head">
          <p className="eyebrow">Local expertise</p>
          <h2>Neighborhoods {first} knows</h2>
          <p>Hyperlocal guidance across Cache Valley, Preston, and Bear Lake.</p>
        </div>
        <div className="neighborhood-grid">
          {agent.neighborhoods.map((hood) => (
            <Link
              key={hood.slug}
              className="neighborhood-card"
              href={`/${agent.slug}/neighborhoods/${hood.slug}/`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hood.image} alt={hood.name} loading="lazy" />
              <div className="neighborhood-overlay">
                <h3>{hood.name}</h3>
                <p>{hood.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section testimonial-section">
        <div className="section-head">
          <p className="eyebrow">Client stories</p>
          <h2>Trusted by Cache Valley families</h2>
        </div>
        <div className="testimonial-grid">
          {agent.testimonials.map((t) => (
            <blockquote key={t.name} className="testimonial-card">
              <p>“{t.quote}”</p>
              <footer>
                <strong>{t.name}</strong>
                <span>{t.location}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="about-grid">
          <div>
            <p className="eyebrow">About {first}</p>
            <h2>Faith, integrity, and growth</h2>
            <p>{agent.bio}</p>
          </div>
          <div className="about-card">
            <p className="eyebrow">Brokerage</p>
            <h3>RE/MAX Peaks</h3>
            <p>
              Serving Logan, Preston, and Bear Lake. Connected to the full Peaks
              team when you need more capacity, always with {first} as your
              point person.
            </p>
            <a className="btn btn-ghost" href="https://www.remaxpeaks.com/">
              Visit RE/MAX Peaks
            </a>
          </div>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="contact-grid">
          <div>
            <p className="eyebrow">Let&apos;s talk</p>
            <h2>Get in touch with {first}</h2>
            <p>
              Ready to buy, sell, or explore the market? Call, text, or send the
              form. {first} responds fast with options and a clear plan.
            </p>
            <div className="connect-actions">
              <a className="btn btn-ghost" href={telHref(agent.phone)}>
                {agent.phone}
              </a>
              <a className="btn btn-white" href={`mailto:${agent.email}`}>
                {agent.email}
              </a>
            </div>
          </div>
          <LeadForm
            agentSlug={agent.slug}
            agentName={agent.name}
            ghlAssignee={agent.ghlAssignee}
            intent="contact"
            className="lead-form contact-form"
          />
        </div>
      </section>

      <section className="final-cta">
        <h2>Ready when you are</h2>
        <p>
          Request a home value and {first} will get back to you with a CMA.
        </p>
        <div className="hero-ctas">
          <Link className="btn btn-white" href={homeValueHref}>
            Get My Home Value
          </Link>
          <a className="btn btn-ghost" href="#contact">
            Contact {first}
          </a>
        </div>
      </section>

      <SiteFooter />
      <StickyMobileBar
        agentSlug={agent.slug}
        firstName={first}
        phone={agent.phone}
        homeValueHref={homeValueHref}
      />
    </div>
  );
}
