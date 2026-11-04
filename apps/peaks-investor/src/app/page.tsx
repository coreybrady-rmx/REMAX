import type { ReactNode } from "react";
import Link from "next/link";
import { brandName } from "@/lib/brand";
import { listPlans, publicProjects, completedPublicProjects } from "@/lib/db";
import { formatBaths, formatSqft } from "@/lib/format";
import { renderingFor } from "@/lib/renderings";

export default function HomePage() {
  const plans = listPlans();
  const opportunities = publicProjects().filter((project) => project.status !== "completed");
  const completed = completedPublicProjects();
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-brand uppercase">{brandName}</p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-none md:text-6xl">
              We build the home the market is ready to buy.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              {brandName} is Corey and Travis. We bring over 30 years of combined real estate experience to every
              decision, from the lot and the plan to the features, before construction starts. In 2025 we completed two
              spec homes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-full bg-brand px-5 py-3 text-sm font-bold tracking-wide uppercase" href="/plans">
                View floor plans
              </Link>
              <Link className="rounded-full border border-white px-5 py-3 text-sm font-bold tracking-wide uppercase" href="/contact">
                Request information
              </Link>
            </div>
          </div>
          <div>
            <img
              src="/plans/alpine/rendering.jpg"
              alt="Alpine exterior rendering from Acadia Homes"
              className="aspect-[16/10] w-full object-cover"
            />
            <p className="mt-3 text-sm leading-6 text-white/75">
              Acadia Homes exterior rendering of the Alpine plan. Landscaping in the image is not a construction
              specification, and the image is not a completed Peaks project.
            </p>
          </div>
        </div>
      </section>

      <Section title={`Why invest with ${brandName}`} href="/process" wide>
        <p>
          Investors back Peaks because the people choosing the home have spent their careers in real estate, and
          because the home is built for the buyer it will meet at sale.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="border border-ink/10 p-4">
            <h3 className="text-xl">Real estate experience</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Corey and Travis have over 30 years of combined experience. That experience decides which lot and which
              plan we commit to before a foundation is poured.
            </p>
          </div>
          <div className="border border-ink/10 p-4">
            <h3 className="text-xl">Matched to the market</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              We use AI tools in our selection process to match the lot, the home, and its features to the market at
              the time the home will be for sale.
            </p>
          </div>
          <div className="border border-ink/10 p-4">
            <h3 className="text-xl">Built and brought to market</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              We carry each selected plan through construction and into sale. In 2025 that process produced two
              completed spec homes.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Homes we have built" href="/completed" tone="paper">
        <p>
          Two spec homes were completed in 2025. Each will be listed here with its address, plan, and sale record once
          those details are confirmed.
        </p>
        {completed.length === 0 ? null : <ProjectList projects={completed} />}
      </Section>

      <Section title="Current opportunities" href="/opportunities">
        {opportunities.length === 0 ? (
          <p>
            No opportunities are open on this page yet. When the next home is selected, its lot, plan, budget, and
            projected sale will be published here, with the same detail we give every project.
          </p>
        ) : (
          <ProjectList projects={opportunities} />
        )}
      </Section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl">The plans we build</h2>
              <p className="mt-3 max-w-2xl leading-7 text-ink/75">
                Six Acadia Homes plans form the library we build from. Each figure below is the published living area,
                bedrooms, bathrooms, and garage size for that plan.
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

      <Section title="How a return is read" href="/returns">
        <p>
          Each home is underwritten on its own. Project costs and the expected sale price determine the projected profit
          for that home. An investor's return is calculated once that investor's capital and role are defined. A closed
          sale is recorded separately from any projection.
        </p>
      </Section>

      <Section title="How we build" href="/process" tone="paper" wide>
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

      <Section title="How a home is funded" href="/financing">
        <p>
          Every home has its own funding. That may be builder capital, a construction loan, investor equity, or a
          combination written for that project. Draws pay for construction and are kept separate from any distribution
          after the sale.
        </p>
      </Section>

      <Section title="How the build is run" href="/operations" tone="paper">
        <p>
          Each Peaks home is run from a budget, a schedule, inspections, and written changes. An assigned investor can
          review the records for that home.
        </p>
      </Section>

      <Section title="From finished house to closed sale" href="/operations">
        <p>
          Once construction is complete, we prepare the home, list it, and carry it through closing. The sale is then
          recorded against that home's cost.
        </p>
      </Section>

      <Section title="What we account for" href="/faq" tone="paper">
        <p>
          Cost, timing, and the market can all change between the day we start and the day a home sells. Those figures
          stay on the project record so each home's result can be read on its own.
        </p>
      </Section>

      <Section title="Frequently asked questions" href="/faq">
        <p>
          Straight answers on how a resale estimate is labeled, how a return is calculated, and what an assigned investor
          can see.
        </p>
      </Section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-4xl">Request information</h2>
            <p className="mt-4 leading-7 text-ink/80">
              Ask for an overview of a {brandName} project. We store your request and follow up from it. This form does not
              collect funds, and submitting it commits you to nothing.
            </p>
          </div>
          <Link className="self-end rounded-full bg-brand px-5 py-3 text-center text-sm font-bold tracking-wide text-white uppercase" href="/contact">
            Contact form
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
