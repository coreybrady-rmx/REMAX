import Link from "next/link";
import { notFound } from "next/navigation";
import { DrawingViewer } from "@/components/DrawingViewer";
import { PriceBlock } from "@/components/Money";
import { PageIntro } from "@/components/SiteChrome";
import { getPlan, listPlans, publicEstimates, publicProjects, visibleMedia } from "@/lib/db";
import { formatBaths, formatSqft } from "@/lib/format";
import { planDiagrams, renderingFor } from "@/lib/renderings";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const plan = getPlan((await params).slug);
  return { title: plan ? `${plan.name} plan` : "Plan" };
}

export default async function PlanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const plan = getPlan((await params).slug);
  if (!plan) notFound();
  const estimates = publicEstimates(plan.slug);
  const projects = publicProjects().filter((project) => project.plan_slug === plan.slug);
  const media = visibleMedia("plan", plan.slug, false);
  const rendering = renderingFor(plan.slug);
  const diagrams = planDiagrams[plan.slug] ?? [];
  const viewerImages = [
    ...diagrams,
    ...media.map((item) => ({ src: `/api/media/${item.id}`, title: item.kind })),
  ];
  const strengths = JSON.parse(plan.strengths) as string[];
  const tradeoffs = JSON.parse(plan.tradeoffs) as string[];
  const areas = [
    ["Main level", plan.main_sqft],
    ["Upper level", plan.upper_sqft],
    [plan.basement_kind === "optional" ? "Optional basement" : "Finished basement", plan.basement_sqft],
    ["Garage, excluded from living area", plan.garage_sqft],
  ] as const;
  return (
    <>
      <PageIntro eyebrow="Acadia Homes plan" title={plan.name}>
        <p>{plan.spec_note}</p>
      </PageIntro>
      <article className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          {rendering ? (
            <figure>
              <img src={rendering.src} alt={rendering.title} className="w-full object-cover" />
              <figcaption className="mt-2 text-sm leading-6 text-ink/70">
                Exterior rendering published by Acadia Homes. It shows a design idea, including landscaping that is not
                part of a construction contract.
              </figcaption>
            </figure>
          ) : null}
          <div className="mt-8">
            <DrawingViewer images={viewerImages} />
          </div>
          <h2 className="mt-10 text-3xl">Level areas</h2>
          <table className="mt-4 w-full text-left text-sm">
            <tbody>
              {areas.map(([label, value]) =>
                value ? (
                  <tr key={label} className="border-t border-ink/10">
                    <th className="py-3 font-medium">{label}</th>
                    <td className="py-3">{formatSqft(value)}</td>
                  </tr>
                ) : null,
              )}
              <tr className="border-t border-ink/10">
                <th className="py-3 font-medium">Total living area</th>
                <td className="py-3">{formatSqft(plan.living_sqft)}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-sm leading-6 text-ink/70">{plan.garage_note}</p>
          <p className="mt-6 text-sm leading-6">
            {plan.beds} bedrooms · {formatBaths(plan.baths)} bathrooms · {plan.stories === 1 ? "one main story" : "two stories"}
          </p>
          <h2 className="mt-10 text-3xl">Planning notes</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            From the Acadia comparison guide. These are selection notes, not measured investment results.
          </p>
          <ul className="mt-4 list-disc pl-5 leading-7">
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-xl">Tradeoffs</h3>
          <ul className="mt-2 list-disc pl-5 leading-7">
            {tradeoffs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-xl">Ideal buyer</h3>
          <p className="mt-2 leading-7">{plan.ideal_buyer}</p>
          <h3 className="mt-6 text-xl">Construction considerations</h3>
          <p className="mt-2 leading-7">{plan.construction_notes}</p>
        </div>
        <aside className="space-y-6">
          <PriceBlock estimates={estimates} />
          <div className="border border-ink/10 p-5">
            <h2 className="text-2xl">Projects using this plan</h2>
            {projects.length === 0 ? (
              <p className="mt-3 text-sm leading-6">No public project is assigned to this plan.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link className="font-semibold text-link" href={`/projects/${project.slug}`}>
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-sm leading-6 text-ink/70">
            Other Acadia plans in this collection:{" "}
            {listPlans()
              .filter((item) => item.slug !== plan.slug)
              .map((item) => item.name)
              .join(", ")}
            .
          </p>
        </aside>
      </article>
    </>
  );
}
