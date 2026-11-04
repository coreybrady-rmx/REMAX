import Link from "next/link";
import { createProject } from "@/app/actions";
import { BoundForm } from "@/components/BoundForm";
import { allProjects, listPlans } from "@/lib/db";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const plans = listPlans();
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl">Projects</h1>
        <p className="mt-3 max-w-2xl leading-7">
          A new project starts private and unapproved, with every cost line unknown. The Heritage Linden Lane working
          underwriting stays in that state.
        </p>
        {params.error ? <p className="mt-3 text-sm font-semibold text-brand">Enter a project name.</p> : null}
      </div>
      <BoundForm action={createProject} className="grid gap-3 bg-white p-5 md:grid-cols-3">
        <label className="text-sm">
          Name
          <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="name" required />
        </label>
        <label className="text-sm">
          URL slug, optional
          <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="slug" />
        </label>
        <label className="text-sm">
          Plan
          <select className="mt-1 w-full border border-ink/15 px-3 py-2" name="plan_slug" defaultValue="">
            <option value="">Unassigned</option>
            {plans.map((plan) => (
              <option key={plan.slug} value={plan.slug}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white uppercase md:col-span-3" type="submit">
          Create private draft
        </button>
      </BoundForm>
      <ul className="space-y-3">
        {allProjects().map((project) => (
          <li key={project.id} className="bg-white p-4">
            <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
              {project.status} · {project.visibility} · {project.approval}
            </p>
            <Link className="mt-1 block text-2xl" href={`/admin/projects/${project.slug}`}>
              {project.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
