"use client";

import { ASSUMPTIONS } from "@/lib/assumptions";
import { lossTreatmentNote } from "@/lib/disclosures";
import { formatDollars, formatPercent, formatRate } from "@/lib/format";
import { useReturns } from "./ReturnsProvider";

function Slider({
  id,
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
  minLabel,
  maxLabel,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <output htmlFor={id} className="num text-lg">
          {display}
        </output>
      </div>
      <input
        id={id}
        className="mt-3 h-11 w-full accent-charcoal"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-1 flex justify-between text-xs text-charcoal/55">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export function ReturnCalculator() {
  const { input, result, setSalePrice, setDurationMonths, setAnnualRateBps, reset } =
    useReturns();

  const rows: Array<{ label: string; value: string; test: string }> = [
    { label: "Interest", value: formatDollars(result.interestCents), test: "interest" },
    { label: "Total cost", value: formatDollars(result.totalCostCents), test: "cost" },
    {
      label: result.isLoss ? "Project loss" : "Projected project profit",
      value: formatDollars(result.profitCents),
      test: "profit",
    },
    {
      label: "Peaks allocation",
      value:
        result.peaksCents === null ? "Not split" : formatDollars(result.peaksCents),
      test: "peaks",
    },
    {
      label: "Investor allocation",
      value:
        result.investorCents === null
          ? "Not split"
          : formatDollars(result.investorCents),
      test: "investor",
    },
    {
      label: "Capital return",
      value:
        result.capitalReturnCents === null
          ? "Not modeled"
          : formatDollars(result.capitalReturnCents),
      test: "capital",
    },
    {
      label: "Total proceeds",
      value:
        result.proceedsCents === null
          ? "Not modeled"
          : formatDollars(result.proceedsCents),
      test: "proceeds",
    },
    {
      label: "Projected cash-on-cash",
      value: result.cashOnCash === null ? "Not modeled" : formatPercent(result.cashOnCash),
      test: "coc",
    },
    {
      label: "Break-even sale price",
      value: formatDollars(result.breakEvenCents),
      test: "breakeven",
    },
  ];

  return (
    <div className="bg-ivory px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <h2 className="font-serif text-4xl md:text-5xl">Investor returns</h2>
          <p className="mt-4 leading-relaxed text-charcoal/75">
            Lot capital, the construction budget, closing costs, and the 50/50
            profit share stay fixed. Sale price, duration, and the interest
            rate move together through the draw schedule, the results, and the
            charts.
          </p>
          <div className="mt-8 space-y-6">
            <Slider
              id="sale-price"
              label="Sale price"
              min={ASSUMPTIONS.salePriceMin}
              max={ASSUMPTIONS.salePriceMax}
              step={ASSUMPTIONS.salePriceStep}
              value={input.salePrice}
              display={formatDollars(input.salePrice * 100)}
              minLabel={formatDollars(ASSUMPTIONS.salePriceMin * 100)}
              maxLabel={formatDollars(ASSUMPTIONS.salePriceMax * 100)}
              onChange={setSalePrice}
            />
            <Slider
              id="duration"
              label="Duration"
              min={ASSUMPTIONS.durationMin}
              max={ASSUMPTIONS.durationMax}
              step={1}
              value={input.durationMonths}
              display={`${input.durationMonths} months`}
              minLabel={`${ASSUMPTIONS.durationMin} mo`}
              maxLabel={`${ASSUMPTIONS.durationMax} mo`}
              onChange={setDurationMonths}
            />
            <Slider
              id="rate"
              label="Annual simple interest"
              min={ASSUMPTIONS.rateMinBps}
              max={ASSUMPTIONS.rateMaxBps}
              step={ASSUMPTIONS.rateStepBps}
              value={input.annualRateBps}
              display={formatRate(input.annualRateBps)}
              minLabel={formatRate(ASSUMPTIONS.rateMinBps)}
              maxLabel={formatRate(ASSUMPTIONS.rateMaxBps)}
              onChange={setAnnualRateBps}
            />
          </div>
          <button
            type="button"
            className="mt-8 inline-flex min-h-12 items-center border border-charcoal px-5 text-sm"
            onClick={reset}
          >
            Reset to Base Case
          </button>
          <p className="mt-6 text-sm leading-relaxed text-charcoal/70">
            Profit = sale − lot − construction − interest − closing. If profit
            is positive, investor profit = profit × 50%, and cash-on-cash =
            investor profit / lot. That return is projected. It is not an
            annualized IRR. {lossTreatmentNote}
          </p>
        </div>
        <dl className="bg-white px-5 py-2 md:px-8" aria-label="Calculated returns">
          {rows.map((row) => (
            <div
              key={row.test}
              className="flex items-baseline justify-between gap-4 border-b border-charcoal/10 py-3"
            >
              <dt className="text-sm text-charcoal/75">{row.label}</dt>
              <dd className="num text-right text-lg" data-result={row.test}>
                {row.value}
              </dd>
            </div>
          ))}
          {result.isLoss ? (
            <p className="py-4 text-sm leading-relaxed text-charcoal/80">
              {lossTreatmentNote}
            </p>
          ) : null}
        </dl>
      </div>
    </div>
  );
}
