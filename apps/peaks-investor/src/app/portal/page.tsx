import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/SiteChrome";
import { currentSession } from "@/lib/current";
import { assignedProjects, projectDocuments, projectMilestones } from "@/lib/db";

export const metadata = { title: "Investor dashboard" };

export default async function PortalPage() {
  const session = await currentSession();
  if (!session) redirect("/login?next=/portal");
  const projects = session.role === "admin" ? [] : assignedProjects(session.sub);
  return (
    <>
      <PageIntro eyebrow="Private" title="Your projects">
        <p>Contribution and distribution history is shown only when an actual record has been entered. This portal does not move money.</p>
      </PageIntro>
      <section className="mx-auto max-w-6xl px-5 py-12">
        {session.role === "admin" ? (
          <p>
            You are signed in as an administrator. Open the <Link className="font-semibold text-link" href="/admin">admin dashboard</Link>.
          </p>
        ) : null}
        {session.role === "investor" && projects.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-8">
            <h2 className="text-2xl">No projects are assigned yet</h2>
            <p className="mt-2 leading-7">When access is granted, the project, its approved updates, and its documents will appear here.</p>
          </div>
        ) : null}
        <div className="grid gap-4">
          {projects.map((project) => (
            <article key={project.id} className="border border-ink/10 p-5">
              <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">{project.status}</p>
              <h2 className="mt-2 text-3xl">
                <Link href={`/projects/${project.slug}`}>{project.name}</Link>
              </h2>
              <p className="mt-2 leading-7">{project.summary}</p>
              <ul className="mt-3 text-sm">
                {projectMilestones(project.id, true).map((milestone) => (
                  <li key={milestone.id}>{milestone.title}</li>
                ))}
              </ul>
              <ul className="mt-3 text-sm">
                {projectDocuments(project.id, true).map((document) => (
                  <li key={document.id}>
                    <a className="text-link" href={`/api/documents/${document.id}`}>
                      {document.title}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
