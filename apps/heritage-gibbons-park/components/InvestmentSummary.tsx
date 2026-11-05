import { ASSUMPTIONS } from "@/lib/assumptions";
import { baseCase } from "@/lib/calculate";
import { formatDollars, formatPercent } from "@/lib/format";
import { SectionHeading } from "./SectionHeading";

const CARDS = [
  {
    value: formatDollars(ASSUMPTIONS.salePrice * 100),
    label: "Target Sale Price",
  },
  {
    value: formatDollars(ASSUMPTIONS.lotEquity * 100),
    label: "Lot Investor Equity",
  },
  {
    value: formatDollars(baseCase.investorCents ?? 0),
    label: "Projected Investor Profit",
  },
  {
    value: formatPercent(baseCase.cashOnCash ?? 0),
    label: "Projected Investor Cash-on-Cash Return",
  },
] as const;

export function InvestmentSummary() {
  const baseCapital = ASSUMPTIONS.lotEquity + ASSUMPTIONS.constructionBudget;

  return (
    <section id="investment" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="Investment summary"
          title="Equal share of modeled profit."
          lede="Peaks and the lot investor share modeled project profits equally. The investor supplies the lot capital, while the $850,000 construction budget is modeled as financed through staged construction draws."
        />
        <dl className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card.label} className="bg-stone px-5 py-6">
              <dd className="num text-3xl text-charcoal">{card.value}</dd>
              <dt className="mt-3 text-sm leading-snug text-charcoal/75">{card.label}</dt>
            </div>
          ))}
        </dl>
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <p className="max-w-xl text-base leading-relaxed text-charcoal/80">
            Cash-on-cash is projected investor profit divided by the $225,000
            lot capital. It is not an annualized IRR. The figures on this page
            are the base case: an 8-month hold and 10% simple interest.
          </p>
          <div>
            <h3 className="font-serif text-2xl">Capital structure</h3>
            <dl className="ledger mt-4">
              <div>
                <dt>Investor land equity</dt>
                <dd className="num">{formatDollars(ASSUMPTIONS.lotEquity * 100)}</dd>
              </div>
              <div>
                <dt>Construction financing (debt, not equity)</dt>
                <dd className="num">{formatDollars(ASSUMPTIONS.constructionBudget * 100)}</dd>
              </div>
              <div>
                <dt className="font-medium text-charcoal">Total base capital</dt>
                <dd className="num font-medium">{formatDollars(baseCapital * 100)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
              Total base capital excludes modeled interest and closing costs.
              Those are in the project budget below.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
