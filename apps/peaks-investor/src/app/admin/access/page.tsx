import { grantAccess } from "@/app/actions";
import { BoundForm } from "@/components/BoundForm";
import { allProjects, listInvestors } from "@/lib/db";

export const metadata = { title: "Investor access" };

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const projects = allProjects();
  const investors = listInvestors();
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl">Investor access</h1>
        <p className="mt-3 max-w-2xl leading-7">
          A new investor needs a password of at least eight characters. An existing investor keeps the current password
          when that field is left blank. Access covers one project at a time.
        </p>
        {params.saved ? <p className="mt-3 text-sm font-semibold">Access saved.</p> : null}
        {params.error ? <p className="mt-3 text-sm font-semibold text-brand">Check the email, password, and project.</p> : null}
      </div>
      <BoundForm action={grantAccess} className="grid gap-3 bg-white p-5 md:grid-cols-2">
        <label className="text-sm">
          Email
          <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="email" type="email" required />
        </label>
        <label className="text-sm">
          Name
          <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="name" />
        </label>
        <label className="text-sm">
          Password for a new account
          <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="password" type="password" />
        </label>
        <label className="text-sm">
          Project
          <select className="mt-1 w-full border border-ink/15 px-3 py-2" name="project_id" required>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white uppercase md:col-span-2" type="submit">
          Grant access
        </button>
      </BoundForm>
      <ul className="space-y-2 text-sm">
        {investors.map((investor) => (
          <li key={investor.id} className="bg-white px-4 py-3">
            {investor.name} · {investor.email}
          </li>
        ))}
      </ul>
    </section>
  );
}
