import type { ReactNode } from "react";
import Link from "next/link";
import { listPlans, publicProjects, completedPublicProjects } from "@/lib/db";
import { formatBaths, formatSqft } from "@/lib/format";

export default function HomePage() {
  const plans = listPlans();
  const opportunities = publicProjects().filter((project) => project.status !== "completed");
  const completed = completedPublicProjects();
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-brand uppercase">Spec home investment</p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-none md:text-6xl">
              Peaks Home Builders spec home investment opportunities.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Review how Peaks Home Builders approaches residential development, compare the Acadia Homes floor plan
              collection, and request information on a project. Published figures appear only after they are approved.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-full bg-brand px-5 py-3 text-sm font-bold tracking-wide uppercase" href="/opportunities">
                Available projects
              </Link>
              <Link className="rounded-full border border-white px-5 py-3 text-sm font-bold tracking-wide uppercase" href="/plans">
                Floor plans
              </Link>
            </div>
          </div>
          <div className="border border-white/15 p-6 text-sm leading-6 text-white/75">
            <p className="font-bold tracking-[0.16em] text-white uppercase">Rendering pending</p>
            <p className="mt-3">
              No exterior rendering has been approved for the public portal. This frame stays empty rather than using an
              unrelated photograph.
            </p>
          </div>
        </div>
      </section>

      <Section title="Why invest with Peaks Home Builders" href="/process">
        <p>
          Peaks Home Builders is the public brand. Acadia Homes is the floor-plan collection named on the Peaks logo.
          The approach is to match a plan to the lot, the buyer, the neighborhood, and the budget before treating size
          as the reason to build.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {["Property selection", "Market demand", "Construction efficiency", "Financial oversight"].map((item) => (
            <div key={item} className="border border-ink/10 p-4">
              <h3 className="text-xl">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                Each project keeps its own assumptions. A catalog plan is not a guaranteed specification or a promised return.
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Completed projects" href="/completed" tone="paper">
        {completed.length === 0 ? (
          <p>No completed investment has been entered from project accounting and closing documents.</p>
        ) : (
          <ProjectList projects={completed} />
        )}
      </Section>

      <Section title="Current opportunities" href="/opportunities">
        {opportunities.length === 0 ? (
          <p>No investment project is approved for public display.</p>
        ) : (
          <ProjectList projects={opportunities} />
        )}
      </Section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-4xl">Explore our floor plans</h2>
            <Link className="text-sm font-bold text-link" href="/plans">
              All plans
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Link key={plan.slug} href={`/plans/${plan.slug}`} className="border border-ink/10 bg-white p-5 hover:border-ink">
                <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
                  {plan.stories === 1 ? "Rambler" : "Two story"}
                </p>
                <h3 className="mt-2 text-3xl">{plan.name}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/70">
                  {formatSqft(plan.living_sqft)} · {plan.beds} bed · {formatBaths(plan.baths)} bath · garage{" "}
                  {formatSqft(plan.garage_sqft)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section title="Understanding potential returns" href="/returns">
        <p>
          Project profit is the selling price minus the project costs that have actually been entered. Investor cash
          return is calculated only after contributed capital and a participation rule are defined. A projection is not
          an actual result.
        </p>
      </Section>

      <Section title="Our investment process" href="/process" tone="paper">
        <ol className="grid gap-3 md:grid-cols-4">
          {["Acquisition", "Financial review", "Funding", "Construction", "Marketing", "Sale", "Final accounting"].map(
            (step, index) => (
              <li key={step} className="border border-ink/10 bg-white p-4">
                <span className="text-sm font-bold text-brand">0{index + 1}</span>
                <p className="mt-2 text-lg">{step}</p>
              </li>
            ),
          )}
        </ol>
      </Section>

      <Section title="Construction financing" href="/financing">
        <p>
          Investor equity, investor lending, construction financing, and project ownership are different roles. The
          structure for each project is entered separately. Construction draws are not the same thing as investor
          repayment.
        </p>
      </Section>

      <Section title="Construction operations" href="/operations" tone="paper">
        <p>
          Oversight covers budgets, milestones, inspections, reporting, and change orders. The procedures on this site
          are explanatory until a written policy is approved.
        </p>
      </Section>

      <Section title="After construction" href="/operations">
        <p>
          Completion still leaves inspections, sale preparation, marketing, carrying costs, closing, loan payoff, final
          accounting, and distributions. Finishing the house does not by itself repay an investor.
        </p>
      </Section>

      <Section title="Investment risks" href="/faq" tone="paper">
        <p>
          Cost overruns, delays, financing costs, and a change in market value can reduce or eliminate a projected
          profit. Those risks are project-specific and are not removed by a favorable worksheet.
        </p>
      </Section>

      <Section title="Frequently asked questions" href="/faq">
        <p>Short answers to how estimates, returns, documents, and repayment are handled on this portal.</p>
      </Section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-4xl">Request information</h2>
            <p className="mt-4 leading-7 text-ink/80">
              Send a note to ask for an investment overview. The request is stored for review. This form does not collect
              funds or provide wiring instructions.
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
}: {
  title: string;
  href: string;
  children: ReactNode;
  tone?: "white" | "paper";
}) {
  return (
    <section className={tone === "paper" ? "bg-paper" : "bg-white"}>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-4xl">{title}</h2>
        <div className="mt-4 max-w-3xl leading-7 text-ink/80">{children}</div>
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
