import { notFound } from "next/navigation";
import { PageIntro } from "@/components/SiteChrome";
import { RubyProjectArticle } from "@/components/RubyProjects";
import { PROJECTS_PUBLISHED } from "@/lib/flags";
import { rubyProject, viewModel } from "@/lib/ruby-projects";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  if (!PROJECTS_PUBLISHED) return { title: "Project" };
  const project = rubyProject((await params).slug);
  return { title: project?.heading ?? "Project" };
}

export default async function RubyCompletedPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!PROJECTS_PUBLISHED) notFound();
  const project = rubyProject((await params).slug);
  if (!project) notFound();
  const view = viewModel(project);
  return (
    <>
      <PageIntro eyebrow="Completed" title={view.heading}>
        <p>{view.status}</p>
      </PageIntro>
      <RubyProjectArticle view={view} />
    </>
  );
}
