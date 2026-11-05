"use client";

import { ASSUMPTIONS } from "@/lib/assumptions";
import { interestByDuration, sensitivityCases } from "@/lib/calculate";
import { formatDollars, formatPercent, formatRate } from "@/lib/format";
import { useReturns } from "./ReturnsProvider";

export function SensitivityAnalysis() {
  const { input, result } = useReturns();
  const saleCents = input.salePrice * 100;
  const costLines = [
    { label: "Lot", cents: ASSUMPTIONS.lotEquity * 100, bar: "bg-charcoal" },
    { label: "Construction", cents: result.constructionCents, bar: "bg-sage" },
    { label: "Interest", cents: result.interestCents, bar: "bg-gold" },
    { label: "Commission", cents: result.commissionCents, bar: "bg-charcoal/70" },
    { label: "Closing costs", cents: ASSUMPTIONS.closingCosts * 100, bar: "bg-charcoal/35" },
  ];
  const waterfall = [
    { label: "Sale price", cents: saleCents },
    { label: "Lot", cents: -ASSUMPTIONS.lotEquity * 100 },
    { label: "Construction", cents: -result.constructionCents },
    { label: "Interest", cents: -result.interestCents },
    { label: "Commission", cents: -result.commissionCents },
    { label: "Closing costs", cents: -ASSUMPTIONS.closingCosts * 100 },
    { label: result.isLoss ? "Project loss" : "Project profit", cents: result.profitCents },
  ];
  const cases = sensitivityCases({
    durationMonths: input.durationMonths,
    annualRateBps: input.annualRateBps,
  });
  const interestSeries = interestByDuration(input.annualRateBps);
  const maxInterest = Math.max(...interestSeries.map((point) => point.interestCents), 1);
  const profitMagnitudes = cases.map((row) =>
    Math.abs(row.result.investorCents ?? row.result.profitCents),
  );
  const maxBar = Math.max(...profitMagnitudes, 1);

  return (
    <div className="bg-white px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1120px]">
        <h2 className="font-serif text-4xl md:text-5xl">Sensitivity</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-charcoal/75">
          Sale-price cases use the duration and rate selected above. At the
          base case — {ASSUMPTIONS.durationMonths} months and{" "}
          {formatRate(ASSUMPTIONS.annualRateBps)} — the $1,400,000 row is the
          target, not an appraisal. Commission on every row is 5% of that
          sale price. The second chart shows interest as the timeline
          extends, at the selected rate.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <figure>
            <figcaption className="font-serif text-2xl">Cost bars</figcaption>
            <p className="mt-2 text-sm text-charcoal/65">
              Modeled project cost at the selected sale price, duration, and
              rate. Commission is 5% of the sale price.
            </p>
            <ul className="mt-6 space-y-4" aria-label="Modeled project cost">
              {costLines.map((line) => {
                const width = result.totalCostCents
                  ? `${(line.cents / result.totalCostCents) * 100}%`
                  : "0%";
                return (
                  <li key={line.label}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span>{line.label}</span>
                      <span className="num">{formatDollars(line.cents)}</span>
                    </div>
                    <div className="h-2 bg-stone" aria-hidden="true">
                      <div className={`h-2 ${line.bar}`} style={{ width }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-sm">
              Total modeled project cost{" "}
              <span className="num">{formatDollars(result.totalCostCents)}</span>
            </p>
          </figure>
          <figure>
            <figcaption className="font-serif text-2xl">Waterfall</figcaption>
            <p className="mt-2 text-sm text-charcoal/65">
              Sale price minus lot, construction, interest, commission, and
              closing costs. Commission is 5% of the sale price.
            </p>
            <ol className="mt-6 space-y-4" aria-label="Project profit waterfall">
              {waterfall.map((step) => {
                const width = saleCents
                  ? `${(Math.abs(step.cents) / saleCents) * 100}%`
                  : "0%";
                return (
                  <li key={step.label}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span>{step.label}</span>
                      <span className="num">{formatDollars(step.cents)}</span>
                    </div>
                    <div className="h-2 bg-stone" aria-hidden="true">
                      <div className="h-2 bg-charcoal" style={{ width }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </figure>
        </div>

        <div className="mt-10 hidden md:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Profit sensitivity at {input.durationMonths} months and{" "}
              {formatRate(input.annualRateBps)}
            </caption>
            <thead>
              <tr className="border-b border-charcoal/20 text-sm text-charcoal/70">
                <th scope="col" className="py-3 pr-4 font-medium">Sale price</th>
                <th scope="col" className="py-3 pr-4 font-medium">Commission</th>
                <th scope="col" className="py-3 pr-4 font-medium">Project profit</th>
                <th scope="col" className="py-3 pr-4 font-medium">Investor profit</th>
                <th scope="col" className="py-3 font-medium">Cash-on-cash</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((row) => {
                const selected = row.salePrice === input.salePrice;
                const target = row.salePrice === ASSUMPTIONS.salePrice;
                return (
                  <tr
                    key={row.salePrice}
                    className={`border-b border-charcoal/10 ${selected ? "bg-stone" : ""}`}
                  >
                    <th scope="row" className="py-4 pr-4 font-medium">
                      <span className="num">{formatDollars(row.salePrice * 100)}</span>
                      {target ? (
                        <span className="mt-1 block text-sm font-normal text-charcoal/65">
                          Target, not an appraisal
                        </span>
                      ) : null}
                    </th>
                    <td className="num py-4 pr-4">{formatDollars(row.result.commissionCents)}</td>
                    <td className="num py-4 pr-4">{formatDollars(row.result.profitCents)}</td>
                    <td className="num py-4 pr-4">
                      {row.result.investorCents === null
                        ? "Not split"
                        : formatDollars(row.result.investorCents)}
                    </td>
                    <td className="num py-4">
                      {row.result.cashOnCash === null
                        ? "—"
                        : formatPercent(row.result.cashOnCash)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 md:hidden">
          {cases.map((row) => (
            <article key={row.salePrice} className="border border-charcoal/10 px-4 py-4">
              <h3 className="num font-serif text-2xl">{formatDollars(row.salePrice * 100)}</h3>
              {row.salePrice === ASSUMPTIONS.salePrice ? (
                <p className="text-sm text-charcoal/65">Target, not an appraisal</p>
              ) : null}
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>Commission</dt>
                  <dd className="num">{formatDollars(row.result.commissionCents)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Project profit</dt>
                  <dd className="num">{formatDollars(row.result.profitCents)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Investor profit</dt>
                  <dd className="num">
                    {row.result.investorCents === null
                      ? "Not split"
                      : formatDollars(row.result.investorCents)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Cash-on-cash</dt>
                  <dd className="num">
                    {row.result.cashOnCash === null ? "—" : formatPercent(row.result.cashOnCash)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <figure>
            <figcaption className="font-serif text-2xl">
              Investor result by sale price
            </figcaption>
            <p className="mt-2 text-sm text-charcoal/65">
              At {input.durationMonths} months and {formatRate(input.annualRateBps)}.
              A loss is shown as project loss and is not split.
            </p>
            <ul className="mt-6 space-y-4" aria-label="Investor result by sale price">
              {cases.map((row, index) => {
                const magnitude = profitMagnitudes[index];
                const width = `${Math.max(4, (magnitude / maxBar) * 100)}%`;
                const loss = row.result.isLoss;
                return (
                  <li key={row.salePrice}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span className="num">{formatDollars(row.salePrice * 100)}</span>
                      <span className="num">
                        {loss
                          ? `Loss ${formatDollars(row.result.profitCents)}`
                          : formatDollars(row.result.investorCents ?? 0)}
                      </span>
                    </div>
                    <div className="h-2 bg-stone">
                      <div
                        className={`h-2 ${loss ? "bg-charcoal" : "bg-gold"}`}
                        style={{ width }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </figure>
          <figure>
            <figcaption className="font-serif text-2xl">
              Interest as the timeline extends
            </figcaption>
            <p className="mt-2 text-sm text-charcoal/65">
              Simple interest at {formatRate(input.annualRateBps)}. The marked
              month is the duration selected above.
            </p>
            <svg
              viewBox="0 0 640 220"
              role="img"
              aria-labelledby="interest-chart-title"
              className="mt-6 w-full"
            >
              <title id="interest-chart-title">
                Interest from {ASSUMPTIONS.durationMin} to {ASSUMPTIONS.durationMax} months
              </title>
              <polyline
                fill="none"
                stroke="#b49a6b"
                strokeWidth="3"
                points={interestSeries
                  .map((point, index) => {
                    const x = 32 + (index / (interestSeries.length - 1)) * 580;
                    const y = 190 - (point.interestCents / maxInterest) * 160;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              {interestSeries.map((point, index) => {
                const x = 32 + (index / (interestSeries.length - 1)) * 580;
                const y = 190 - (point.interestCents / maxInterest) * 160;
                const selected = point.durationMonths === input.durationMonths;
                return (
                  <circle
                    key={point.durationMonths}
                    cx={x}
                    cy={y}
                    r={selected ? 6 : 3}
                    fill={selected ? "#14232c" : "#b49a6b"}
                  >
                    <title>
                      {point.durationMonths} months, {formatDollars(point.interestCents)}
                    </title>
                  </circle>
                );
              })}
            </svg>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              {interestSeries.map((point) => (
                <li key={point.durationMonths} className="flex justify-between gap-2 border-b border-charcoal/10 py-1">
                  <span>{point.durationMonths} mo</span>
                  <span className="num">{formatDollars(point.interestCents)}</span>
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </div>
    </div>
  );
}
