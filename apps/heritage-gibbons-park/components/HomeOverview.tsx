import { FEATURES, RESIDENCE } from "@/lib/content";
import { SectionHeading } from "./SectionHeading";

const SPECS = [
  ["Builder", RESIDENCE.builder],
  ["Plan", RESIDENCE.plan],
  ["Residence", RESIDENCE.type],
  ["Bedrooms", RESIDENCE.beds],
  ["Bathrooms", RESIDENCE.baths],
  ["Main level", RESIDENCE.mainSf],
  ["Upper level", RESIDENCE.upperSf],
  ["Above-grade", RESIDENCE.aboveGradeSf],
  ["Basement", RESIDENCE.basementSf],
  ["Total", RESIDENCE.totalSf],
  ["Garage", RESIDENCE.garageSf],
] as const;

export function HomeOverview() {
  return (
    <section id="residence" className="scroll-mt-24 bg-stone px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1120px] gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <SectionHeading
            eyebrow="The Heritage residence"
            title="An Acadia Homes plan, stated as planned."
            lede="Features are planned and subject to final selections. Unapproved upgrades are not included. The basement is finished. Hatched areas on the basement sheet are not finished living space."
          />
          <p className="mt-8 max-w-xl leading-relaxed text-charcoal/80">
            Above-grade area is {RESIDENCE.aboveGradeSf}. The basement is{" "}
            {RESIDENCE.basementSf} and is finished. The dollar figures in this
            illustration are unchanged. The basement sheet still prints
            UNEXCAVATED and GARAGE OPTIONAL on hatched areas. Those hatched
            areas are not finished living space.
          </p>
          <h3 className="mt-10 font-serif text-2xl">Planned features</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="border-t border-charcoal/15 py-3 text-sm">
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <dl className="bg-ivory px-6 py-2 md:px-8">
          {SPECS.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-6 border-b border-charcoal/10 py-3 last:border-b-0">
              <dt className="text-sm text-charcoal/70">{label}</dt>
              <dd className="num text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
