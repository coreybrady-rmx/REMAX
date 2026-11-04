import { PageIntro } from "@/components/SiteChrome";

export const metadata = { title: "How the investment process works" };

const steps = [
  ["Acquisition", "A lot is evaluated for width, depth, slope, utilities, and whether a chosen Acadia plan can sit on it."],
  ["Financial review", "Land, site work, construction, fees, carry, marketing, and selling costs are entered as separate lines. A contract price is not treated as the whole investment."],
  ["Funding", "Equity, a loan, or another structure is recorded for that project. One project’s capital stack is not assumed for the next."],
  ["Construction", "Draws follow the construction budget. They are not investor distributions."],
  ["Marketing", "After the house is ready, listing and carrying costs continue."],
  ["Sale", "A sale price is an outcome, not the estimate that was used while underwriting."],
  ["Final accounting", "Loan payoff, closing costs, and distributions are recorded from the project’s own documents."],
];

export default function ProcessPage() {
  return (
    <>
      <PageIntro eyebrow="Process" title="How an investment moves from lot to accounting">
        <p>This sequence is an explanation of the work. It is not a signed policy and it does not create voting rights or a repayment date.</p>
      </PageIntro>
      <ol className="mx-auto max-w-3xl space-y-6 px-5 py-12">
        {steps.map(([title, body], index) => (
          <li key={title} className="border-l-2 border-brand pl-5">
            <p className="text-sm font-bold text-brand">0{index + 1}</p>
            <h2 className="text-2xl">{title}</h2>
            <p className="mt-2 leading-7 text-ink/80">{body}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
