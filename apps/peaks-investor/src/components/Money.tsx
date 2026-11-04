"use client";

import { useMemo, useState } from "react";
import {
  costSensitivity,
  durationSensitivity,
  evaluate,
  priceSensitivity,
  type ModelInput,
} from "@/lib/finance";
import { formatCents, formatRatio } from "@/lib/format";

export function PriceBlock({
  estimates,
}: {
  estimates: Array<{
    market_area: string;
    lot_label: string | null;
    finish_level: string | null;
    basement_assumption: string | null;
    low_cents: number | null;
    target_cents: number | null;
    high_cents: number | null;
    research_reference: string | null;
    estimated_on: string | null;
  }>;
}) {
  if (estimates.length === 0) {
    return (
      <div className="border border-ink/10 p-6">
        <p className="text-sm font-bold tracking-[0.16em] text-brand uppercase">Developer Estimated Resale Price</p>
        <p className="mt-3 text-2xl">Pricing estimate pending.</p>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          No approved estimate has been entered for this plan. A missing estimate is not filled with a placeholder price.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {estimates.map((estimate) => (
        <article key={`${estimate.market_area}-${estimate.lot_label}`} className="border border-ink/10 p-6">
          <p className="text-sm font-bold tracking-[0.16em] text-brand uppercase">Developer Estimated Resale Price</p>
          <h3 className="mt-2 text-2xl">{estimate.market_area}</h3>
          <p className="mt-2 text-sm text-ink/70">
            {[estimate.finish_level, estimate.basement_assumption, estimate.lot_label].filter(Boolean).join(" · ") ||
              "Configuration recorded with the estimate."}
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-xs tracking-wide text-ink/60 uppercase">Low</dt>
              <dd className="mt-1 text-lg font-semibold">{formatCents(estimate.low_cents)}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-ink/60 uppercase">Target</dt>
              <dd className="mt-1 text-lg font-semibold">{formatCents(estimate.target_cents)}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-ink/60 uppercase">High</dt>
              <dd className="mt-1 text-lg font-semibold">{formatCents(estimate.high_cents)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-ink/70">
            {estimate.research_reference ? `Source: ${estimate.research_reference}. ` : "No research reference was entered. "}
            {estimate.estimated_on ? `Estimate date: ${estimate.estimated_on}. ` : ""}
            This is not a guaranteed sale price or an appraisal.
          </p>
        </article>
      ))}
    </div>
  );
}

function numberOrNull(value: string): number | null {
  const text = value.trim().replaceAll(",", "").replaceAll("$", "");
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

export function Calculator({ initial, editable }: { initial: ModelInput; editable: boolean }) {
  const [model, setModel] = useState(initial);
  const result = useMemo(() => evaluate(model), [model]);
  const prices = useMemo(() => priceSensitivity(model), [model]);
  const costs = useMemo(() => costSensitivity(model), [model]);
  const durations = useMemo(() => durationSensitivity(model), [model]);

  function updateLine(id: string, amount: string) {
    setModel((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === id ? { ...line, amountCents: numberOrNull(amount) } : line)),
    }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <label className="block text-sm">
          Selling price
          <input
            className="mt-1 w-full border border-ink/15 px-3 py-2"
            disabled={!editable}
            value={model.salePriceCents === null ? "" : model.salePriceCents / 100}
            onChange={(event) =>
              setModel((current) => ({ ...current, salePriceCents: numberOrNull(event.target.value) }))
            }
          />
        </label>
        <label className="block text-sm">
          Sales commission percent
          {model.commission.mode === "percent" ? (
            <input
              className="mt-1 w-full border border-ink/15 px-3 py-2"
              disabled={!editable}
              value={model.commission.bps === null ? "" : model.commission.bps / 100}
              onChange={(event) => {
                const text = event.target.value.trim();
                const percent = text === "" ? null : Number(text);
                setModel((current) => ({
                  ...current,
                  commission: {
                    mode: "percent",
                    inclusion: "included",
                    bps: percent === null || !Number.isFinite(percent) ? null : Math.round(percent * 100),
                  },
                }));
              }}
            />
          ) : model.commission.mode === "fixed" ? (
            <input
              className="mt-1 w-full border border-ink/15 px-3 py-2"
              disabled={!editable}
              value={model.commission.amountCents === null ? "" : model.commission.amountCents / 100}
              onChange={(event) =>
                setModel((current) => ({
                  ...current,
                  commission: {
                    mode: "fixed",
                    inclusion: current.commission.mode === "fixed" ? current.commission.inclusion : "included",
                    amountCents: numberOrNull(event.target.value),
                  },
                }))
              }
            />
          ) : (
            <input className="mt-1 w-full border border-ink/15 px-3 py-2" disabled value="None recorded" readOnly />
          )}
        </label>
        <label className="block text-sm">
          Holding period months
          <input
            className="mt-1 w-full border border-ink/15 px-3 py-2"
            disabled={!editable}
            value={model.durationMonths ?? ""}
            onChange={(event) => {
              const text = event.target.value.trim();
              const months = text === "" ? null : Number(text);
              setModel((current) => ({
                ...current,
                durationMonths: months !== null && Number.isInteger(months) && months >= 0 ? months : null,
              }));
            }}
          />
        </label>
        <label className="block text-sm">
          Monthly carrying cost
          <input
            className="mt-1 w-full border border-ink/15 px-3 py-2"
            disabled={!editable}
            value={model.monthlyCarryCents === null ? "" : model.monthlyCarryCents / 100}
            onChange={(event) =>
              setModel((current) => ({ ...current, monthlyCarryCents: numberOrNull(event.target.value) }))
            }
          />
        </label>
        {model.lines.map((line) => (
          <label key={line.id} className="grid gap-1 text-sm md:grid-cols-[1fr_10rem] md:items-center">
            <span>
              {line.label}
              <span className="ml-2 text-ink/50">{line.inclusion}</span>
            </span>
            <input
              className="border border-ink/15 px-3 py-2"
              disabled={!editable || line.inclusion === "excluded"}
              value={line.amountCents === null ? "" : line.amountCents / 100}
              onChange={(event) => updateLine(line.id, event.target.value)}
            />
          </label>
        ))}
        <p className="text-sm leading-6 text-ink/70">
          Blank fields stay blank. A line marked unknown or left blank keeps the model incomplete.
        </p>
      </div>
      <div className="border border-ink/10 bg-paper p-5">
        <h3 className="text-2xl">Projection</h3>
        {!result.complete ? (
          <p className="mt-3 text-sm leading-6">
            Insufficient information. Still needed: {result.missing.map((item) => item.label).join(", ") || "a complete sale price and cost set"}.
          </p>
        ) : (
          <p className="mt-3 text-sm font-semibold">
            {result.projectLoss ? "Projected project loss." : "Projected project result from the figures entered on this screen."}
          </p>
        )}
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Known included costs" value={formatCents(result.knownCostCents)} />
          <Row label="Total project investment" value={formatCents(result.totalInvestmentCents)} />
          <Row label="Project net profit" value={formatCents(result.netProfitCents)} />
          <Row label="Net margin" value={formatRatio(result.margin)} />
          <Row label="Project ROI" value={formatRatio(result.projectRoi)} />
          <Row label="Break-even selling price" value={formatCents(result.breakEvenSaleCents)} />
          <Row label="Investor profit on contributed cash" value={formatCents(result.investorProfitCents)} />
          <Row label="Investor cash ROI" value={formatRatio(result.investorRoi)} />
        </dl>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="mb-2 text-left font-semibold">Sensitivity</caption>
            <tbody>
              {(prices ?? [{ label: "Price sensitivity", result: { ...result, netProfitCents: null, projectRoi: null } }]).map(
                (cell) => (
                  <tr key={cell.label} className="border-t border-ink/10">
                    <th className="py-2 pr-3 font-medium">{prices ? cell.label : "Price sensitivity unavailable"}</th>
                    <td className="py-2">{prices ? formatCents(cell.result.netProfitCents) : "No sale price supplied"}</td>
                  </tr>
                ),
              )}
              {costs.map((cell) => (
                <tr key={cell.label} className="border-t border-ink/10">
                  <th className="py-2 pr-3 font-medium">{cell.label}</th>
                  <td className="py-2">{formatCents(cell.result.netProfitCents)}</td>
                </tr>
              ))}
              {(durations ?? []).map((cell) => (
                <tr key={cell.label} className="border-t border-ink/10">
                  <th className="py-2 pr-3 font-medium">{cell.label}</th>
                  <td className="py-2">{formatCents(cell.result.netProfitCents)}</td>
                </tr>
              ))}
              {!durations ? (
                <tr className="border-t border-ink/10">
                  <th className="py-2 pr-3 font-medium">Holding period</th>
                  <td className="py-2">Unavailable until a monthly carry amount and duration are entered.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2">
      <dt>{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
