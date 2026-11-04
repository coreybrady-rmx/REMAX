import { PageIntro } from "@/components/SiteChrome";

export const metadata = { title: "Construction and operations" };

const items = [
  "Property evaluation and lot feasibility",
  "Budgeting and architectural review",
  "Contractor coordination and inspections",
  "Construction schedule and milestones",
  "Financial reporting",
  "Change orders and contingency",
  "Marketing and project closeout",
  "Final inspections, listing, negotiation, and sale closing",
  "Construction loan payoff, final accounting, and distributions",
];

export default function OperationsPage() {
  return (
    <>
      <PageIntro eyebrow="Operations" title="Construction and what happens after it">
        <p>
          The administrative record can hold milestones, budget changes, and progress files. The list below describes
          the work. It is not a confirmed company policy until it is approved, and it does not grant an investor a vote
          or a rental strategy.
        </p>
      </PageIntro>
      <ul className="mx-auto max-w-3xl list-disc space-y-3 px-10 py-12 leading-7">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}
