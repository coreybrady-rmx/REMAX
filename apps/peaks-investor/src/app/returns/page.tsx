import { Calculator } from "@/components/Money";
import { PageIntro } from "@/components/SiteChrome";
import { blankModel, FORMULA_NOTES } from "@/lib/finance";

export const metadata = { title: "Returns and financial projections" };

export default function ReturnsPage() {
  return (
    <>
      <PageIntro eyebrow="Numbers" title="Returns and financial projections">
        <p>
          Project profit and an investor’s cash return are different calculations. This worksheet starts empty. It is not
          a Peaks projection, and it does not fill missing costs with zero.
        </p>
      </PageIntro>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Calculator initial={blankModel()} editable />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {FORMULA_NOTES.map((note) => (
            <article key={note.term} className="border border-ink/10 p-5">
              <h2 className="text-2xl">{note.term}</h2>
              <p className="mt-2 leading-7 text-ink/80">{note.definition}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm leading-6 text-ink/70">
          Unverified items stay labeled as missing. A loss stays a loss. Nothing on this page is an appraisal, a
          guaranteed sale price, or an offer of securities.
        </p>
      </section>
    </>
  );
}
