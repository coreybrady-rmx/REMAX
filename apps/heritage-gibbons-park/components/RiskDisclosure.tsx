import { RISKS } from "@/lib/content";
import {
  preliminaryIllustrationDisclosure,
  securitiesDisclosure,
} from "@/lib/disclosures";
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
        <div id="disclosures" className="mt-14 grid gap-6 lg:grid-cols-2">
          <article className="bg-ivory px-6 py-6">
            <h3 className="font-serif text-2xl">Preliminary illustration</h3>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/85">
              {preliminaryIllustrationDisclosure}
            </p>
          </article>
          <article className="bg-ivory px-6 py-6">
            <h3 className="font-serif text-2xl">Not an offer to sell securities</h3>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/85">
              {securitiesDisclosure}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
