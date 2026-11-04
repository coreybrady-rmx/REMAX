import { notFound } from "next/navigation";
import { addMilestone, saveActual, saveProject, saveScenario, uploadPrivateFile } from "@/app/actions";
import { BoundForm } from "@/components/BoundForm";
import { COST_CATEGORIES } from "@/lib/categories";
import {
  getActual,
  getPlan,
  getProject,
  listPlans,
  projectDocuments,
  projectMilestones,
  projectScenarios,
  scenarioLines,
  scenarioTerms,
} from "@/lib/db";
import { centsToInput } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  return { title: project ? project.name : "Project" };
}

const field = "mt-1 w-full border border-ink/15 px-3 py-2";

export default async function AdminProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const project = getProject(slug);
  if (!project) notFound();
  const plans = listPlans();
  const plan = project.plan_slug ? getPlan(project.plan_slug) : undefined;
  const scenarios = projectScenarios(project.id);
  const actual = getActual(project.id);
  const milestones = projectMilestones(project.id, true);
  const documents = projectDocuments(project.id, true);
  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">{plan?.name ?? "No plan assigned"}</p>
        <h1 className="mt-2 text-4xl">{project.name}</h1>
        {query.saved ? <p className="mt-3 text-sm font-semibold">Saved.</p> : null}
        {query.error ? <p className="mt-3 text-sm font-semibold text-brand">A field could not be saved. Leave unknown amounts blank.</p> : null}
      </div>
      <BoundForm action={saveProject} className="grid gap-3 bg-white p-5 md:grid-cols-2">
        <input type="hidden" name="slug" value={project.slug} />
        <label className="text-sm">
          Name
          <input className={field} name="name" defaultValue={project.name} required />
        </label>
        <label className="text-sm">
          Status
          <select className={field} name="status" defaultValue={project.status}>
            {["proposed", "active", "completed", "archived"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Plan
          <select className={field} name="plan_slug" defaultValue={project.plan_slug ?? ""}>
            <option value="">Unassigned</option>
            {plans.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Address
          <input className={field} name="address_line" defaultValue={project.address_line ?? ""} />
        </label>
        <label className="text-sm md:col-span-2">
          Summary
          <textarea className={field} name="summary" rows={4} defaultValue={project.summary} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="address_public" type="checkbox" value="1" defaultChecked={project.address_public === 1} /> Publish address
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="visibility" type="checkbox" value="public" defaultChecked={project.visibility === "public"} /> Public
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="approval" type="checkbox" value="approved" defaultChecked={project.approval === "approved"} /> Approved
        </label>
        <button className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white uppercase" type="submit">
          Save project
        </button>
      </BoundForm>
      {scenarios.map((scenario) => {
        const lines = scenarioLines(scenario.id);
        const terms = scenarioTerms(scenario.id);
        return (
          <BoundForm key={scenario.id} action={saveScenario} className="space-y-3 bg-white p-5">
            <h2 className="text-2xl">{scenario.name}</h2>
            <input type="hidden" name="scenario_id" value={scenario.id} />
            <input type="hidden" name="slug" value={project.slug} />
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm">
                Selling price
                <input className={field} name="sale_price" defaultValue={centsToInput(scenario.sale_price_cents)} />
              </label>
              <label className="text-sm">
                Duration, months
                <input className={field} name="duration_months" defaultValue={scenario.duration_months ?? ""} />
              </label>
              <label className="text-sm">
                Monthly carry
                <input className={field} name="monthly_carry" defaultValue={centsToInput(scenario.monthly_carry_cents)} />
              </label>
              <label className="text-sm">
                Commission
                <select className={field} name="commission_mode" defaultValue={scenario.commission_mode}>
                  <option value="none">None</option>
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed dollars</option>
                </select>
              </label>
              <label className="text-sm">
                Commission basis points
                <input className={field} name="commission_bps" defaultValue={scenario.commission_bps ?? ""} />
              </label>
              <label className="text-sm">
                Fixed commission dollars
                <input className={field} name="commission_cents" defaultValue={centsToInput(scenario.commission_cents)} />
              </label>
              <label className="text-sm">
                Commission treatment
                <select className={field} name="commission_inclusion" defaultValue={scenario.commission_inclusion}>
                  <option value="included">Included</option>
                  <option value="excluded">Excluded</option>
                  <option value="unknown">Unknown</option>
                </select>
              </label>
            </div>
            <label className="block text-sm">
              Notes
              <textarea className={field} name="notes" rows={3} defaultValue={scenario.notes} />
            </label>
            <div className="space-y-2">
              {COST_CATEGORIES.map(([category, label]) => {
                const line = lines.find((item) => item.category === category);
                return (
                  <div key={category} className="grid gap-2 md:grid-cols-[1.2fr_8rem_8rem]">
                    <label className="text-sm">
                      {label}
                      <input className={field} name={`note_${category}`} defaultValue={line?.note ?? ""} placeholder="Note" />
                    </label>
                    <label className="text-sm">
                      Amount
                      <input className={field} name={`amount_${category}`} defaultValue={centsToInput(line?.amount_cents ?? null)} />
                    </label>
                    <label className="text-sm">
                      Treatment
                      <select className={field} name={`inclusion_${category}`} defaultValue={line?.inclusion ?? "unknown"}>
                        <option value="included">Included</option>
                        <option value="excluded">Excluded</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Investor capital
                <input className={field} name="capital" defaultValue={centsToInput(terms?.capital_cents ?? null)} />
              </label>
              <label className="text-sm">
                Profit share, basis points
                <input className={field} name="share_bps" defaultValue={terms?.share_bps ?? ""} />
              </label>
              <label className="text-sm">
                Participation rule
                <select className={field} name="investor_rule" defaultValue={terms?.rule ?? "undefined"}>
                  <option value="undefined">Not defined</option>
                  <option value="profitShare">Share of project profit</option>
                </select>
              </label>
              <label className="text-sm">
                Repayment
                <input className={field} name="repayment_text" defaultValue={terms?.repayment_text ?? ""} />
              </label>
              <label className="text-sm md:col-span-2">
                Participation
                <input className={field} name="participation_text" defaultValue={terms?.participation_text ?? ""} />
              </label>
            </div>
            <button className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white uppercase" type="submit">
              Save scenario
            </button>
          </BoundForm>
        );
      })}
      <BoundForm action={saveActual} className="grid gap-3 bg-white p-5 md:grid-cols-2">
        <h2 className="text-2xl md:col-span-2">Actual results</h2>
        <input type="hidden" name="project_id" value={project.id} />
        <input type="hidden" name="slug" value={project.slug} />
        {(
          [
            ["acquisition", "Acquisition", actual?.acquisition_cents],
            ["construction", "Construction", actual?.construction_cents],
            ["total_cost", "Total cost", actual?.total_cost_cents],
            ["sale", "Sale price", actual?.sale_cents],
            ["net_profit", "Net profit", actual?.net_profit_cents],
            ["investor_return", "Investor return", actual?.investor_return_cents],
          ] as const
        ).map(([name, label, value]) => (
          <label key={name} className="text-sm">
            {label}
            <input className={field} name={name} defaultValue={centsToInput(value ?? null)} />
          </label>
        ))}
        <label className="text-sm">
          Holding days
          <input className={field} name="holding_days" defaultValue={actual?.holding_days ?? ""} />
        </label>
        <label className="text-sm md:col-span-2">
          Source note
          <textarea className={field} name="source_note" rows={3} defaultValue={actual?.source_note ?? ""} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="visibility" type="checkbox" value="public" defaultChecked={actual?.visibility === "public"} /> Public
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="approval" type="checkbox" value="approved" defaultChecked={actual?.approval === "approved"} /> Approved
        </label>
        <button className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white uppercase md:col-span-2" type="submit">
          Save actual results
        </button>
      </BoundForm>
      <div className="grid gap-4 md:grid-cols-2">
        <BoundForm action={addMilestone} className="space-y-3 bg-white p-5">
          <h2 className="text-2xl">Milestone</h2>
          <input type="hidden" name="project_id" value={project.id} />
          <input type="hidden" name="slug" value={project.slug} />
          <input className={field} name="title" placeholder="Title" required />
          <textarea className={field} name="note" rows={3} placeholder="Note" />
          <label className="flex items-center gap-2 text-sm">
            <input name="visibility" type="checkbox" value="public" /> Public
          </label>
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white" type="submit">
            Add milestone
          </button>
          <ul className="text-sm">
            {milestones.map((milestone) => (
              <li key={milestone.id}>
                {milestone.title} · {milestone.visibility}
              </li>
            ))}
          </ul>
        </BoundForm>
        <BoundForm action={uploadPrivateFile} className="space-y-3 bg-white p-5">
          <h2 className="text-2xl">Private document</h2>
          <input type="hidden" name="kind" value="document" />
          <input type="hidden" name="project_id" value={project.id} />
          <input type="hidden" name="slug" value={project.slug} />
          <input className={field} name="title" placeholder="Title" />
          <input className={field} name="file" type="file" required />
          <p className="text-sm leading-6 text-ink/70">Uploads stay private and unapproved. This form does not collect wiring instructions.</p>
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white" type="submit">
            Upload
          </button>
          <ul className="text-sm">
            {documents.map((document) => (
              <li key={document.id}>
                {document.title} · {document.visibility} · {document.approval}
              </li>
            ))}
          </ul>
        </BoundForm>
      </div>
    </section>
  );
}
