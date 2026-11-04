import Link from "next/link";
import { PROJECTS_PUBLISHED } from "@/lib/flags";
import { rubyProjects, viewModel, type RubyView } from "@/lib/ruby-projects";

const intro =
  "Two Ruby homes built by Peaks Home Builders in 2025 and sold in the first half of 2026. Each project is documented from selection through sale.";

export function CompletedRubySection() {
  if (!PROJECTS_PUBLISHED) return null;
  return (
    <section id="completed-projects" className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-4xl">Completed projects</h2>
        <p className="mt-4 max-w-3xl leading-7 text-ink/80">{intro}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {rubyProjects.map((project) => (
            <RubyCard key={project.slug} view={viewModel(project)} />
          ))}
        </div>
        <p className="mt-6 max-w-3xl leading-7 text-ink/80">
          <Link className="font-bold text-link" href="/contact">
            Request an overview
          </Link>{" "}
          to see the build records for a project of this type.
        </p>
      </div>
    </section>
  );
}

export function RubyProjectArticle({ view }: { view: RubyView }) {
  return (
    <article className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm font-bold">{view.status}</p>
      {view.address ? <p className="mt-3 leading-7">{view.address}</p> : null}
      <img src={view.image} alt={view.alt} className="mt-6 aspect-[16/10] w-full object-cover" />
      <p className="mt-6 max-w-3xl leading-7 text-ink/80">{view.body}</p>
      <ReturnLines view={view} />
      <p className="mt-6 max-w-3xl leading-7">
        <Link className="font-bold text-link" href="/contact">
          Request an overview
        </Link>{" "}
        to see the build records for a project of this type.
      </p>
    </article>
  );
}

function RubyCard({ view }: { view: RubyView }) {
  return (
    <article className="border border-ink/10 bg-white">
      <Link href={`/completed/${view.slug}`}>
        <img src={view.image} alt={view.alt} className="aspect-[16/10] w-full object-cover" />
        <div className="p-5">
          <h3 className="text-3xl">{view.heading}</h3>
          <p className="mt-2 text-sm font-bold">{view.status}</p>
          {view.address ? <p className="mt-2 text-sm leading-6">{view.address}</p> : null}
          <p className="mt-3 text-sm leading-6 text-ink/80">{view.body}</p>
          <ReturnLines view={view} />
        </div>
      </Link>
    </article>
  );
}

function ReturnLines({ view }: { view: RubyView }) {
  if (!view.returnLine) return null;
  return (
    <div className="mt-4 text-sm leading-6">
      <p>{view.returnLine}</p>
      <p>{view.basisLine}</p>
    </div>
  );
}
