import { GIBBONS_PARK_LOT_URL } from "@/lib/assumptions";
import { LOT_FACTS } from "@/lib/content";
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
          The facts below are printed on Lot 1 of the Gibbons Park Estates
          final plat. The plat labels that lot 1415 Red Fox Court and 0.249
          acres. Calls that belong to another lot are not repeated here.
        </p>
        <a
          href={GIBBONS_PARK_LOT_URL}
          className="mt-8 inline-flex min-h-12 items-center justify-center bg-charcoal px-5 text-sm font-medium text-ivory"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore Gibbons Park Lots
        </a>
        <figure className="mt-12">
          <object
            data="/gibbons-park-plat.pdf"
            type="application/pdf"
            aria-label="Gibbons Park Estates final plat, sheet 1 of 1."
            className="h-[70vh] min-h-[480px] w-full border border-charcoal/10 bg-ivory"
          >
            <a href="/gibbons-park-plat.pdf">Open the Gibbons Park Estates plat</a>
          </object>
          <figcaption className="mt-3 text-sm text-charcoal/70">
            Gibbons Park Estates final plat, sheet 1 of 1, dated 02-09-2026.{" "}
            <a href="/gibbons-park-plat.pdf" className="underline">
              Open the plat
            </a>
            .
          </figcaption>
        </figure>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {LOT_FACTS.map((item) => (
            <li key={item.label} className="border border-charcoal/10 bg-ivory px-5 py-5">
              <p className="text-xs uppercase tracking-[0.16em] text-charcoal/60">{item.label}</p>
              <p className="mt-3 font-serif text-xl">{item.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
