import type { ReactNode } from "react";
import Link from "next/link";
import { brandName } from "@/lib/brand";
import { CompletedRubySection } from "@/components/RubyProjects";
import { listPlans, publicProjects } from "@/lib/db";
import { formatBaths, formatSqft } from "@/lib/format";
import { renderingFor } from "@/lib/renderings";

export default function HomePage() {
  const plans = listPlans();
  const opportunities = publicProjects().filter((project) => project.status !== "completed");
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-brand">{brandName}</p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-none md:text-6xl">
              Build with a team that knows the market before we break ground.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              {brandName} chooses every lot, plan, and feature with over 30 years of combined real estate experience
              behind each decision. We then build, sell, and report on each home as its own project, so you can see
              exactly how every dollar is used and returned.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-full bg-brand px-5 py-3 text-sm font-bold tracking-wide uppercase" href="/plans">
                View the plans
              </Link>
              <Link className="rounded-full border border-white px-5 py-3 text-sm font-bold tracking-wide uppercase" href="/contact">
                Request a project overview
              </Link>
            </div>
          </div>
          <div>
            <img
              src="/plans/alpine/rendering.jpg"
              alt="Alpine exterior rendering from Acadia Homes"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <Section title="Why investors choose Peaks" href="/process" wide>
        <p>
          Our investors back a builder whose selection decisions are made by people who have spent their careers in
          real estate, for a buyer who will be there at sale.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="border border-ink/10 p-4">
            <h3 className="text-xl">Experience before the foundation</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Corey and Travis bring over 30 years of combined experience to each decision. That experience shapes
              which lot, plan, and features we commit to before construction begins.
            </p>
          </div>
          <div className="border border-ink/10 p-4">
            <h3 className="text-xl">Built for the buyer at sale</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              We use AI tools in our selection process to match each lot, home, and feature set to the market at the
              time the home will be for sale.
            </p>
          </div>
          <div className="border border-ink/10 p-4">
            <h3 className="text-xl">A process you can review</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              We carry every project from selection through construction and into sale. In 2025 we completed two spec
              homes using this process.
            </p>
          </div>
        </div>
      </Section>

      <CompletedRubySection />

      <Section title="The next project is published here first" href="/opportunities">
        {opportunities.length === 0 ? (
          <p>
            No offering is open on this page yet. When the next home is selected, we will publish its lot, plan,
            budget, and projected sale here, with the same detail we provide to every investor.
          </p>
        ) : (
          <ProjectList projects={opportunities} />
        )}
        <Link
          className="mt-5 inline-block rounded-full bg-brand px-5 py-3 text-sm font-bold tracking-wide text-white uppercase"
          href="/contact"
        >
          Request a project overview
        </Link>
      </Section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl">Six plans, each with a clear footprint</h2>
              <p className="mt-3 max-w-2xl leading-7 text-ink/75">
                Every home we build starts from one of six Acadia Homes plans. Each figure below is the published
                living area, bedrooms, bathrooms, and garage size for that plan.
              </p>
            </div>
            <Link className="text-sm font-bold text-link" href="/plans">
              All plans
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const rendering = renderingFor(plan.slug);
              return (
                <Link key={plan.slug} href={`/plans/${plan.slug}`} className="border border-ink/10 bg-white hover:border-ink">
                  {rendering ? (
                    <img src={rendering.src} alt={rendering.title} className="aspect-[16/10] w-full object-cover" />
                  ) : null}
                  <div className="p-5">
                    <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
                      {plan.stories === 1 ? "Rambler" : "Two story"}
                    </p>
                    <h3 className="mt-2 text-3xl">{plan.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink/70">
                      {formatSqft(plan.living_sqft)} · {plan.beds} bed · {formatBaths(plan.baths)} bath · garage{" "}
                      {formatSqft(plan.garage_sqft)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Section title="Every home is measured on its own" href="/returns">
        <p>
          Each home is underwritten separately. Project costs and the expected sale price set the projected profit for
          that home. An investor's return is calculated once that investor's capital and role are defined. Closed sales
          are recorded apart from projections, so you can see what was projected and what actually happened.
        </p>
      </Section>

      <Section title="From selection to sale, in six steps" href="/process" tone="paper" wide>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Select the lot",
            "Match the plan and features",
            "Price the work",
            "Build the home",
            "Bring it to market",
            "Close and record the result",
          ].map((step, index) => (
            <li key={step} className="border border-ink/10 bg-white p-4">
              <span className="text-sm font-bold text-brand">0{index + 1}</span>
              <p className="mt-2 text-lg">{step}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Funding written for each project" href="/financing">
        <p>
          Every home has its own funding. That may be builder capital, a construction loan, investor equity, or a
          combination written for that project. Construction draws are kept separate from any distribution made after
          the sale.
        </p>
      </Section>

      <Section title="Run from a budget, a schedule, and inspections" href="/operations" tone="paper">
        <p>
          Each Peaks home is managed against a budget, a schedule, inspections, and written changes. Any investor
          assigned to a project can review the records for that home.
        </p>
      </Section>

      <Section title="Completion leads directly to sale" href="/operations">
        <p>
          Once construction is complete, we prepare the home, list it, and carry it through closing. The sale is then
          recorded against that home's cost.
        </p>
      </Section>

      <Section title="Each home's result stands on its own record" href="/faq" tone="paper">
        <p>
          Cost, timing, and the market can all change between the day we start and the day a home sells. Those figures
          stay on the project record, so the result of each home can be read independently.
        </p>
      </Section>

      <Section title="Answers before you ask" href="/faq">
        <p>
          Clear explanations of how a resale estimate is labeled, how returns are calculated, and what an assigned
          investor can review.
        </p>
        <Link
          className="mt-5 inline-block rounded-full bg-brand px-5 py-3 text-sm font-bold tracking-wide text-white uppercase"
          href="/faq"
        >
          Read the questions
        </Link>
      </Section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-4xl">Request a project overview</h2>
            <p className="mt-4 leading-7 text-ink/80">
              Learn how a {brandName} project is selected, funded, and reported. We store your request and follow up on
              it. This form does not collect funds, and submitting it commits you to nothing.
            </p>
          </div>
          <Link className="self-end rounded-full bg-brand px-5 py-3 text-center text-sm font-bold tracking-wide text-white uppercase" href="/contact">
            Send request
          </Link>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  href,
  children,
  tone = "white",
  wide = false,
}: {
  title: string;
  href: string;
  children: ReactNode;
  tone?: "white" | "paper";
  wide?: boolean;
}) {
  return (
    <section className={tone === "paper" ? "bg-paper" : "bg-white"}>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-4xl">{title}</h2>
        <div className={`mt-4 leading-7 text-ink/80 ${wide ? "" : "max-w-3xl"}`}>{children}</div>
        <Link className="mt-5 inline-block text-sm font-bold text-link" href={href}>
          Read more
        </Link>
      </div>
    </section>
  );
}

function ProjectList({
  projects,
}: {
  projects: Array<{ slug: string; name: string; status: string; summary: string }>;
}) {
  return (
    <div className="mt-4 grid gap-4">
      {projects.map((project) => (
        <Link key={project.slug} href={`/projects/${project.slug}`} className="border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">{project.status}</p>
          <h3 className="mt-1 text-2xl">{project.name}</h3>
          <p className="mt-2 text-sm leading-6">{project.summary}</p>
        </Link>
      ))}
    </div>
  );
}
