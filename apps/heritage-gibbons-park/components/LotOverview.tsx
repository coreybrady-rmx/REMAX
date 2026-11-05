import { GIBBONS_PARK_LOT_URL } from "@/lib/assumptions";
import { LOT_PLACEHOLDERS } from "@/lib/content";
import { SectionHeading } from "./SectionHeading";

export function LotOverview() {
  return (
    <section id="lot" className="scroll-mt-24 bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="Lot 1 and Gibbons Park Estates"
          title="Proposed for Lot 1, Logan, Utah."
          lede="This illustration is prepared for Lot 1 at Gibbons Park Estates. The $225,000 lot figure is an underwriting allowance, not a confirmed acquisition price."
        />
        <p className="mt-8 max-w-2xl leading-relaxed text-charcoal/80">
          Site facts that are not in hand stay blank here. The public lot page
          is linked for the homesite itself. This page does not restate plat,
          size, dimensions, envelope, or orientation as if they were underwritten.
        </p>
        <a
          href={GIBBONS_PARK_LOT_URL}
          className="mt-8 inline-flex min-h-12 items-center justify-center bg-charcoal px-5 text-sm font-medium text-ivory"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore Gibbons Park Lots
        </a>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOT_PLACEHOLDERS.map((item) => (
            <li key={item} className="border border-charcoal/10 bg-ivory px-5 py-5">
              <p className="text-xs uppercase tracking-[0.16em] text-charcoal/60">{item}</p>
              <p className="mt-3 font-serif text-xl">Not provided</p>
              <p className="mt-2 text-sm text-charcoal/70">Placeholder. Do not treat as confirmed.</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
