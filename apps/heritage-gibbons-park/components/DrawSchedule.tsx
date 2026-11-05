"use client";

import { ASSUMPTIONS } from "@/lib/assumptions";
import { formatDollars, formatMonths, formatRate } from "@/lib/format";
import { SectionHeading } from "./SectionHeading";
import { useReturns } from "./ReturnsProvider";

export function DrawSchedule() {
  const { input, result } = useReturns();
  const rate = formatRate(input.annualRateBps);

  return (
    <section id="returns" className="scroll-mt-24 bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="Construction draws and interest"
          title="Interest only on money that has been drawn."
          lede="Five equal draws at the start of months 1 through 5. Simple interest, no compounding, and no origination fee. The balance stays outstanding until sale and payoff at the end of the selected month."
        />
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-charcoal/75">
          Interest = principal × {rate} × outstanding months / 12. Outstanding
          months = selected duration − draw index (0 through 4). If the
          duration is shorter than a draw’s month, that draw is not funded and
          accrues no interest. Project cost still includes the full{" "}
          {formatDollars(ASSUMPTIONS.constructionBudget * 100)} construction
          budget. Every duration in this calculator reaches month 5, so all
          five draws are funded.
        </p>
        <div className="mt-10 hidden md:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Construction draws at {formatMonths(input.durationMonths)} and {rate}
            </caption>
            <thead>
              <tr className="border-b border-charcoal/20 text-sm text-charcoal/70">
                <th scope="col" className="py-3 pr-4 font-medium">Draw</th>
                <th scope="col" className="py-3 pr-4 font-medium">Status</th>
                <th scope="col" className="py-3 pr-4 font-medium">Principal</th>
                <th scope="col" className="py-3 pr-4 font-medium">Outstanding</th>
                <th scope="col" className="py-3 font-medium">Interest</th>
              </tr>
            </thead>
            <tbody>
              {result.draws.map((draw) => (
                <tr key={draw.index} className="border-b border-charcoal/10">
                  <th scope="row" className="py-4 pr-4 font-medium">
                    Draw {draw.month}
                    <span className="mt-1 block text-sm font-normal text-charcoal/60">
                      Start of month {draw.month}
                    </span>
                  </th>
                  <td className="py-4 pr-4">{draw.funded ? "Funded" : "Not funded"}</td>
                  <td className="num py-4 pr-4">{formatDollars(draw.principalCents)}</td>
                  <td className="num py-4 pr-4">{formatMonths(draw.outstandingMonths)}</td>
                  <td className="num py-4">
                    {formatDollars(draw.interestCents)}
                    {draw.funded ? (
                      <span className="mt-1 block text-sm text-charcoal/60">
                        {formatDollars(draw.principalCents)} × {rate} × {draw.outstandingMonths}/12
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className="py-4 pr-4">Total interest</th>
                <td />
                <td />
                <td />
                <td className="num py-4 text-lg" data-result="schedule-interest">
                  {formatDollars(result.interestCents)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-10 grid gap-4 md:hidden">
          {result.draws.map((draw) => (
            <article key={draw.index} className="border border-charcoal/10 bg-ivory px-4 py-4">
              <h3 className="font-serif text-2xl">Draw {draw.month}</h3>
              <p className="text-sm text-charcoal/65">
                {draw.funded ? `Funded at the start of month ${draw.month}` : "Not funded"}
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>Principal</dt>
                  <dd className="num">{formatDollars(draw.principalCents)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Outstanding</dt>
                  <dd className="num">{formatMonths(draw.outstandingMonths)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Interest</dt>
                  <dd className="num">{formatDollars(draw.interestCents)}</dd>
                </div>
              </dl>
            </article>
          ))}
          <p className="num text-lg">
            Total interest {formatDollars(result.interestCents)}
          </p>
        </div>
      </div>
    </section>
  );
}
