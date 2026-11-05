import { TIMELINE } from "@/lib/content";
import { SectionHeading } from "./SectionHeading";

export function ProjectTimeline() {
  return (
    <section id="timeline" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="Construction timeline"
          title="An illustration, not a confirmed schedule."
          lede="Months below describe a possible sequence for the base-case hold. They are not a construction contract, a start date, or a promised closing."
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TIMELINE.map((item) => (
            <li key={item.when} className="border-t-2 border-gold bg-white px-5 py-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-charcoal/60">
                {item.when}
              </p>
              <p className="mt-3 font-serif text-2xl leading-snug">{item.label}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
