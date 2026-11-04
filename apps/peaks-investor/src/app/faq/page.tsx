import { PageIntro } from "@/components/SiteChrome";

export const metadata = { title: "Frequently asked questions" };

const faqs = [
  ["Is a catalog price a sale price?", "No. Until an estimate is approved, the plan page says pricing estimate pending. An approved figure is labeled Developer Estimated Resale Price and is not an appraisal."],
  ["Why are some totals blank?", "Missing costs are not replaced with zero. The calculator withholds profit and ROI until the required lines are entered."],
  ["Is project ROI my return?", "No. Project ROI uses the full project investment. Your cash return needs your contributed capital and the participation rule."],
  ["When am I repaid?", "Construction completion does not repay an investor. Timing comes from the signed agreement and the project’s accounting."],
  ["Can I send money through this site?", "No. The site does not collect investment funds or publish wiring instructions."],
  ["Where are the floor plan drawings?", "Drawings stay off the public site until they are approved for display."],
  ["Are the Hyrum and Hyde Park addresses completed investments?", "No. The marketing site lists them without prices or closing results, so they are not in this portfolio."],
];

export default function FaqPage() {
  return (
    <>
      <PageIntro eyebrow="Questions" title="Frequently asked questions" />
      <section className="mx-auto max-w-3xl space-y-6 px-5 py-12">
        {faqs.map(([question, answer]) => (
          <article key={question}>
            <h2 className="text-2xl">{question}</h2>
            <p className="mt-2 leading-7 text-ink/80">{answer}</p>
          </article>
        ))}
      </section>
    </>
  );
}
