import Link from "next/link";
import { PageIntro } from "@/components/SiteChrome";
import { listPlans } from "@/lib/db";
import { formatBaths, formatSqft } from "@/lib/format";
import { renderingFor } from "@/lib/renderings";

export const metadata = { title: "Acadia floor plan collection" };

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stories?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();
  const stories = params.stories;
  const plans = listPlans().filter((plan) => {
    const haystack = `${plan.name} ${plan.beds} ${plan.ideal_buyer}`.toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (stories === "1" || stories === "2") return String(plan.stories) === stories;
    return true;
  });
  return (
    <>
      <PageIntro eyebrow="Acadia Homes" title="Floor plan collection">
        <p>
          Six standard plans. Square footage, bedrooms, bathrooms, and garage areas are catalog references, not a
          promise that every house will be built to those figures.
        </p>
      </PageIntro>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <form className="flex flex-wrap gap-3" action="/plans">
          <label className="text-sm">
            Search
            <input className="mt-1 block border border-ink/15 px-3 py-2" name="q" defaultValue={params.q ?? ""} />
          </label>
          <label className="text-sm">
            Stories
            <select className="mt-1 block border border-ink/15 px-3 py-2" name="stories" defaultValue={stories ?? ""}>
              <option value="">Any</option>
              <option value="1">Rambler</option>
              <option value="2">Two story</option>
            </select>
          </label>
          <button className="self-end rounded-full bg-ink px-4 py-2 text-sm font-bold text-white" type="submit">
            Filter
          </button>
        </form>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => {
            const rendering = renderingFor(plan.slug);
            return (
              <Link key={plan.slug} href={`/plans/${plan.slug}`} className="border border-ink/10 hover:border-ink">
                {rendering ? (
                  <img src={rendering.src} alt={rendering.title} className="aspect-[16/10] w-full object-cover" />
                ) : null}
                <div className="p-5">
                  <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
                    {plan.stories === 1 ? "One main story" : "Two stories"}
                  </p>
                  <h2 className="mt-2 text-3xl">{plan.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-ink/75">
                    {formatSqft(plan.living_sqft)} living · {plan.beds} bedrooms · {formatBaths(plan.baths)} bathrooms ·
                    garage {formatSqft(plan.garage_sqft)}
                  </p>
                  <p className="mt-3 text-sm leading-6">{plan.ideal_buyer}</p>
                </div>
              </Link>
            );
          })}
        </div>
        {plans.length === 0 ? <p className="mt-8">No plan matches that search.</p> : null}
      </section>
    </>
  );
}
