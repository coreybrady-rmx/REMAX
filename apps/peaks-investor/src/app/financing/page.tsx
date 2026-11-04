import { PageIntro } from "@/components/SiteChrome";

export const metadata = { title: "Financing and investor participation" };

const blocks = [
  ["Investor equity", "Cash contributed for an ownership share. Repayment and profit depend on the signed agreement."],
  ["Investor lending", "A loan from an investor to the project. It is not the same thing as owning the house."],
  ["Construction financing", "A lender’s facility, usually advanced in draws as work is completed. Interest and fees are project costs."],
  ["Project ownership", "The entity that holds the lot and the house. Ownership terms are not inferred from this website."],
  ["Capital requirements", "Initial cash, lender approval, interest, taxes, insurance, and the chance that more cash is required are entered per project."],
  ["Repayment priority", "Who is paid first is a term of the agreement. Construction completion does not automatically trigger repayment."],
];

export default function FinancingPage() {
  return (
    <>
      <PageIntro eyebrow="Capital" title="Financing and investor participation">
        <p>
          These are the roles a project can use. Peaks does not assume every investment uses the same mix. Approved
          financing documents, when they exist, are available only inside the private investor portal.
        </p>
      </PageIntro>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-2">
        {blocks.map(([title, body]) => (
          <article key={title} className="border border-ink/10 p-5">
            <h2 className="text-2xl">{title}</h2>
            <p className="mt-3 leading-7 text-ink/80">{body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
