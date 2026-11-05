import { RISKS } from "@/lib/content";
import { LegalDisclosures } from "./LegalDisclosures";
import { SectionHeading } from "./SectionHeading";

export function RiskDisclosure() {
  return (
    <section id="risks" className="scroll-mt-24 bg-stone px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="Risks"
          title="What this illustration does not settle."
          lede="No testimonials and no track record are offered. The points below are the risks this model is built to keep visible."
        />
        <ul className="mt-10 max-w-3xl space-y-4">
          {RISKS.map((risk) => (
            <li key={risk} className="border-l border-charcoal/20 pl-4 leading-relaxed">
              {risk}
            </li>
          ))}
        </ul>
        <div id="disclosures" className="mt-14">
          <LegalDisclosures />
        </div>
      </div>
    </section>
  );
}
