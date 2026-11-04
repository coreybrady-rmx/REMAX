import { notFound } from "next/navigation";
import { Calculator } from "@/components/Money";
import { PageIntro } from "@/components/SiteChrome";
import { categoryLabel } from "@/lib/categories";
import { currentSession } from "@/lib/current";
import {
  getActual,
  getPlan,
  getProject,
  projectDocuments,
  projectMilestones,
  projectScenarios,
  publicActual,
  scenarioLines,
  scenarioTerms,
  toModel,
  userHasProjectGrant,
  visibleMedia,
} from "@/lib/db";
import { FORMULA_NOTES } from "@/lib/finance";
import { formatCents } from "@/lib/format";
import { DrawingViewer } from "@/components/DrawingViewer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  return { title: project?.visibility === "public" ? project.name : "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  const session = await currentSession();
  const published = project?.visibility === "public" && project.approval === "approved";
  const isAdmin = session?.role === "admin";
  const granted = Boolean(project && session && (isAdmin || userHasProjectGrant(session.sub, project.id)));
  if (!project || (!published && !granted)) notFound();
  const scenarios = projectScenarios(project.id);
  const plan = project.plan_slug ? getPlan(project.plan_slug) : undefined;
  const storedActual = getActual(project.id);
  const actual = isAdmin
    ? storedActual
    : storedActual && granted && storedActual.approval === "approved" && storedActual.source_note.trim()
      ? storedActual
      : publicActual(project.id);
  const milestones = projectMilestones(project.id, granted);
  const documents = projectDocuments(project.id, granted).filter((document) => isAdmin || document.approval === "approved");
  const media = visibleMedia("project", project.id, granted).filter((item) => isAdmin || item.approval === "approved");
  const showAddress = Boolean(project.address_line && (project.address_public === 1 || granted));
  return (
    <>
      <PageIntro eyebrow={project.status} title={project.name}>
        <p>{project.summary}</p>
      </PageIntro>
      <article className="mx-auto max-w-6xl space-y-12 px-5 py-12">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink/60">Plan</dt>
            <dd className="text-lg font-semibold">{plan?.name ?? "Not assigned"}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Visibility</dt>
            <dd className="text-lg font-semibold">{project.approval === "approved" && project.visibility === "public" ? "Public" : "Not public"}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Address</dt>
            <dd className="text-lg font-semibold">{showAddress ? project.address_line : "Not published"}</dd>
          </div>
        </dl>
        <DrawingViewer images={media.map((item) => ({ src: `/api/media/${item.id}`, title: item.kind }))} />
        <section>
          <h2 className="text-3xl">Financial overview</h2>
          {scenarios.length === 0 ? <p className="mt-3">No scenario has been entered.</p> : null}
          {scenarios.map((scenario) => {
            const lines = scenarioLines(scenario.id);
            const terms = scenarioTerms(scenario.id);
            const model = toModel(scenario, lines, terms);
            return (
              <div key={scenario.id} className="mt-6">
                <h3 className="text-2xl">{scenario.name}</h3>
                {scenario.notes ? <p className="mt-2 text-sm leading-6 text-ink/70">{scenario.notes}</p> : null}
                <Calculator initial={model} editable={session?.role === "admin" || session?.role === "investor"} />
                <p className="mt-4 text-sm leading-6 text-ink/70">
                  {terms?.repayment_text || "Repayment terms have not been entered."}{" "}
                  {terms?.participation_text || "Participation terms have not been entered."}
                </p>
              </div>
            );
          })}
          <ul className="mt-6 space-y-2 text-sm leading-6">
            {FORMULA_NOTES.map((note) => (
              <li key={note.term}>
                <strong>{note.term}. </strong>
                {note.definition}
              </li>
            ))}
          </ul>
        </section>
        {project.status === "completed" ? (
          <section>
            <h2 className="text-3xl">Actual results</h2>
            {!actual || !actual.source_note.trim() ? (
              <p className="mt-3">No sourced actual results are available.</p>
            ) : (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {(
                  [
                    ["Acquisition", actual.acquisition_cents],
                    ["Construction", actual.construction_cents],
                    ["Total cost", actual.total_cost_cents],
                    ["Sale price", actual.sale_cents],
                    ["Net profit", actual.net_profit_cents],
                    ["Investor return", actual.investor_return_cents],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="border-t border-ink/10 py-2">
                    <dt>{label}</dt>
                    <dd className="font-semibold">{value === null ? "Not entered" : formatCents(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actual?.source_note ? <p className="mt-3 text-sm">Source: {actual.source_note}</p> : null}
          </section>
        ) : null}
        <section>
          <h2 className="text-3xl">Milestones</h2>
          {milestones.length === 0 ? <p className="mt-3">No milestones have been published.</p> : null}
          <ul className="mt-4 space-y-3">
            {milestones.map((milestone) => (
              <li key={milestone.id} className="border border-ink/10 p-4">
                <p className="font-semibold">{milestone.title}</p>
                {milestone.note ? <p className="mt-1 text-sm leading-6">{milestone.note}</p> : null}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-3xl">Documents</h2>
          {documents.length === 0 ? (
            <p className="mt-3">No approved documents are available. Wiring instructions are not published here.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {documents.map((document) => (
                <li key={document.id}>
                  <a className="font-semibold text-link" href={`/api/documents/${document.id}`}>
                    {document.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="text-xs text-ink/50">{categoryLabel("hard_construction")} and the other budget labels are the fields used in every scenario.</p>
      </article>
    </>
  );
}
