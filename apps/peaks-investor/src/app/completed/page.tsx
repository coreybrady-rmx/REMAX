import Link from "next/link";
import { PageIntro } from "@/components/SiteChrome";
import { completedPublicProjects, publicActual } from "@/lib/db";
import { formatCents } from "@/lib/format";

export const metadata = { title: "Completed projects" };

export default function CompletedPage() {
  const projects = completedPublicProjects();
  return (
    <>
      <PageIntro eyebrow="Portfolio" title="Completed projects">
        <p>
          A project appears here only when its status is completed and the record is approved for public display. Actual
          dollars require a source note from project accounting or a closing document.
        </p>
      </PageIntro>
      <section className="mx-auto max-w-6xl px-5 py-12">
        {projects.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-10">
            <h2 className="text-3xl">No completed investments are on file</h2>
            <p className="mt-3 max-w-2xl leading-7 text-ink/75">
              Architectural proposals, active listings, and houses still under construction are not counted as completed
              investments. This portfolio will stay empty until those records are entered.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => {
              const actual = publicActual(project.id);
              return (
                <article key={project.id} className="border border-ink/10 p-5">
                  <h2 className="text-3xl">
                    <Link href={`/projects/${project.slug}`}>{project.name}</Link>
                  </h2>
                  <p className="mt-3 leading-7">{project.summary}</p>
                  {actual ? (
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt>Sale price</dt>
                        <dd className="font-semibold">{formatCents(actual.sale_cents)}</dd>
                      </div>
                      <div>
                        <dt>Net profit</dt>
                        <dd className="font-semibold">{formatCents(actual.net_profit_cents)}</dd>
                      </div>
                      <div>
                        <dt>Investor return</dt>
                        <dd className="font-semibold">{formatCents(actual.investor_return_cents)}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-3 text-sm">Approved actual results have not been entered.</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
