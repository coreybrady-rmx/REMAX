import { PageIntro } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <PageIntro eyebrow="Missing" title="That page is not available">
      <p>A private record uses the same response as a page that does not exist.</p>
    </PageIntro>
  );
}
