import Link from "next/link";
import { PageIntro } from "@/components/SiteChrome";
import { publicProjects } from "@/lib/db";
import { gibbonsLotsUrl } from "@/lib/gibbons";

export const metadata = { title: "Current investment opportunities" };

export default function OpportunitiesPage() {
  const projects = publicProjects().filter((project) => project.status === "proposed" || project.status === "active");
  return (
    <>
      <PageIntro eyebrow="Projects" title="Current investment opportunities">
        <p>Only projects marked proposed or active, and approved for the public site, are listed here.</p>
      </PageIntro>
      <section className="mx-auto max-w-6xl px-5 py-12">
        {projects.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-10">
            <h2 className="text-3xl">No public opportunities yet</h2>
            <p className="mt-3 max-w-2xl leading-7 text-ink/75">
              A proposal, an active listing, or a house under construction is not shown here until the record is approved.
              Nothing on this page is filled in to make the list look active. The Heritage is planned for Lot 1 at
              Gibbons Park Estates in Logan.{" "}
              <a className="font-bold text-link" href={gibbonsLotsUrl}>
                Explore Gibbons Park Lots
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="border border-ink/10 p-5">
                <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">{project.status}</p>
                <h2 className="mt-2 text-3xl">{project.name}</h2>
                <p className="mt-3 leading-7">{project.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
