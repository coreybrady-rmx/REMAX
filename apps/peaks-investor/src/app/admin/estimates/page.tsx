import { saveEstimate } from "@/app/actions";
import { BoundForm } from "@/components/BoundForm";
import { allEstimates, listPlans } from "@/lib/db";
import { centsToInput, formatCents } from "@/lib/format";

export const metadata = { title: "Resale estimates" };

const field = "mt-1 w-full border border-ink/15 bg-white px-3 py-2";

export default async function EstimatesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const plans = listPlans();
  const estimates = allEstimates();
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl">Developer estimated resale prices</h1>
        <p className="mt-3 max-w-2xl leading-7">
          Leave a price blank when it is unknown. A public approved estimate is labeled Developer Estimated Resale Price
          and still says it is not an appraisal or a guaranteed sale.
        </p>
        {params.saved ? <p className="mt-3 text-sm font-semibold">Saved.</p> : null}
        {params.error ? <p className="mt-3 text-sm font-semibold text-brand">Check the plan, market, and dollar fields.</p> : null}
      </div>
      <BoundForm action={saveEstimate} className="grid gap-3 bg-white p-5 md:grid-cols-2">
        <label className="text-sm">
          Plan
          <select className={field} name="plan_slug" required>
            {plans.map((plan) => (
              <option key={plan.slug} value={plan.slug}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Market area
          <input className={field} name="market_area" required />
        </label>
        <label className="text-sm">
          Lot
          <input className={field} name="lot_label" />
        </label>
        <label className="text-sm">
          Finish level
          <input className={field} name="finish_level" />
        </label>
        <label className="text-sm">
          Basement assumption
          <input className={field} name="basement_assumption" />
        </label>
        <label className="text-sm">
          Low
          <input className={field} name="low" inputMode="decimal" />
        </label>
        <label className="text-sm">
          Target
          <input className={field} name="target" inputMode="decimal" />
        </label>
        <label className="text-sm">
          High
          <input className={field} name="high" inputMode="decimal" />
        </label>
        <label className="text-sm">
          Research reference
          <input className={field} name="research_reference" />
        </label>
        <label className="text-sm">
          Estimate date
          <input className={field} name="estimated_on" placeholder="YYYY-MM-DD" />
        </label>
        <label className="text-sm md:col-span-2">
          Internal notes
          <textarea className={field} name="internal_notes" rows={3} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="visibility" type="checkbox" value="public" /> Public
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="approval" type="checkbox" value="approved" /> Approved for display
        </label>
        <button className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white uppercase md:col-span-2" type="submit">
          Save estimate
        </button>
      </BoundForm>
      <div className="space-y-4">
        {estimates.map((estimate) => (
          <BoundForm key={estimate.id} action={saveEstimate} className="grid gap-3 bg-white p-5 md:grid-cols-2">
            <input type="hidden" name="id" value={estimate.id} />
            <label className="text-sm">
              Plan
              <select className={field} name="plan_slug" defaultValue={estimate.plan_slug}>
                {plans.map((plan) => (
                  <option key={plan.slug} value={plan.slug}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Market area
              <input className={field} name="market_area" defaultValue={estimate.market_area} required />
            </label>
            <label className="text-sm">
              Lot
              <input className={field} name="lot_label" defaultValue={estimate.lot_label ?? ""} />
            </label>
            <label className="text-sm">
              Finish level
              <input className={field} name="finish_level" defaultValue={estimate.finish_level ?? ""} />
            </label>
            <label className="text-sm">
              Basement assumption
              <input className={field} name="basement_assumption" defaultValue={estimate.basement_assumption ?? ""} />
            </label>
            {(["low", "target", "high"] as const).map((key) => (
              <label key={key} className="text-sm">
                {key} ({formatCents(estimate[`${key}_cents`])})
                <input className={field} name={key} defaultValue={centsToInput(estimate[`${key}_cents`])} inputMode="decimal" />
              </label>
            ))}
            <label className="text-sm">
              Research reference
              <input className={field} name="research_reference" defaultValue={estimate.research_reference ?? ""} />
            </label>
            <label className="text-sm">
              Estimate date
              <input className={field} name="estimated_on" defaultValue={estimate.estimated_on ?? ""} />
            </label>
            <label className="text-sm md:col-span-2">
              Internal notes
              <textarea className={field} name="internal_notes" rows={2} defaultValue={estimate.internal_notes ?? ""} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="visibility" type="checkbox" value="public" defaultChecked={estimate.visibility === "public"} /> Public
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="approval" type="checkbox" value="approved" defaultChecked={estimate.approval === "approved"} /> Approved
            </label>
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white uppercase md:col-span-2" type="submit">
              Update estimate
            </button>
          </BoundForm>
        ))}
      </div>
    </section>
  );
}
