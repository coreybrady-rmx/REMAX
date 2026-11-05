import { ASSUMPTIONS } from "@/lib/assumptions";
import { baseCase } from "@/lib/calculate";
import { formatDollars, formatPercent } from "@/lib/format";
import { SectionHeading } from "./SectionHeading";

export function ProjectBudget() {
  const rows: Array<{ label: string; value: string; note?: string; strong?: boolean }> = [
    {
      label: "Investor-funded lot",
      value: formatDollars(ASSUMPTIONS.lotEquity * 100),
      note: "Underwriting allowance, not a confirmed acquisition price.",
    },
    {
      label: "Construction budget",
      value: formatDollars(baseCase.constructionCents),
    },
    {
      label: "Construction interest",
      value: formatDollars(baseCase.interestCents),
      note: "Simple interest on drawn funds for the 8-month base case.",
    },
    {
      label: "Closing costs",
      value: formatDollars(ASSUMPTIONS.closingCosts * 100),
    },
    {
      label: "Total modeled project cost",
      value: formatDollars(baseCase.totalCostCents),
      strong: true,
    },
    {
      label: "Target sale price",
      value: formatDollars(ASSUMPTIONS.salePrice * 100),
      note: "Target, not an appraisal.",
    },
    {
      label: "Modeled project profit",
      value: formatDollars(baseCase.profitCents),
      strong: true,
      note: "After the listed costs, including modeled interest. Excludes other costs in the disclosures. Not after-tax net profit.",
    },
  ];

  return (
    <section id="financials" className="scroll-mt-24 bg-stone px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="Project financials"
          title="The base case, line by line."
          lede="These figures are the 8-month, 10% base case. The calculator further down changes interest, cost, and profit together. The full project profit is not the investor’s profit."
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <dl className="ledger bg-ivory px-5 md:px-8">
            {rows.map((row) => (
              <div key={row.label} className="flex-col sm:flex-row sm:items-baseline">
                <dt>
                  <span className={row.strong ? "font-medium text-charcoal" : undefined}>
                    {row.label}
                  </span>
                  {row.note ? (
                    <span className="mt-1 block text-sm font-normal leading-relaxed text-charcoal/65">
                      {row.note}
                    </span>
                  ) : null}
                </dt>
                <dd className={`num text-lg ${row.strong ? "font-medium" : ""}`}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="bg-charcoal px-6 py-8 text-ivory md:px-8">
            <h3 className="font-serif text-3xl">50/50 on profit</h3>
            <p className="mt-4 text-sm leading-relaxed text-ivory/75">
              Modeled profit is split equally. Neither party is assigned the
              full {formatDollars(baseCase.profitCents)}.
            </p>
            <dl className="mt-8 space-y-5">
              <div>
                <dt className="text-sm text-gold">Peaks</dt>
                <dd className="num mt-1 text-3xl">{formatDollars(baseCase.peaksCents ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gold">Lot investor</dt>
                <dd className="num mt-1 text-3xl">{formatDollars(baseCase.investorCents ?? 0)}</dd>
              </div>
            </dl>
            <dl className="mt-8 border-t border-ivory/20 pt-6 text-sm leading-relaxed">
              <div className="flex justify-between gap-4 py-2">
                <dt>Investor capital returned</dt>
                <dd className="num">{formatDollars(baseCase.capitalReturnCents ?? 0)}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt>Investor profit</dt>
                <dd className="num">{formatDollars(baseCase.investorCents ?? 0)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-ivory/20 py-3 font-medium">
                <dt>Total proceeds</dt>
                <dd className="num">{formatDollars(baseCase.proceedsCents ?? 0)}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt>Projected cash-on-cash</dt>
                <dd className="num">{formatPercent(baseCase.cashOnCash ?? 0)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-ivory/70">
              {formatDollars(baseCase.capitalReturnCents ?? 0)} returned + {" "}
              {formatDollars(baseCase.investorCents ?? 0)} profit = {" "}
              {formatDollars(baseCase.proceedsCents ?? 0)}. Cash-on-cash is {" "}
              {formatDollars(baseCase.investorCents ?? 0)} / {formatDollars(ASSUMPTIONS.lotEquity * 100)}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
