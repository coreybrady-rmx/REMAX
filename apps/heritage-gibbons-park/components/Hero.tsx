import Image from "next/image";
import { baseCase } from "@/lib/calculate";
import { projectionsSentence } from "@/lib/disclosures";
import { formatDollars, formatPercent } from "@/lib/format";

const STATS = [
  { label: "Target selling price", value: formatDollars(1_400_000_00) },
  { label: "Investor capital", value: formatDollars(225_000_00) },
  {
    label: "Projected cash-on-cash",
    value: formatPercent(baseCase.cashOnCash ?? 0),
  },
  {
    label: "Projected investor profit",
    value: formatDollars(baseCase.investorCents ?? 0),
  },
] as const;

export function Hero() {
  return (
    <section id="top" className="bg-charcoal text-ivory">
      <div className="grid min-w-0 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="order-2 flex min-w-0 flex-col justify-center px-5 py-12 md:px-10 lg:order-1 lg:px-14 lg:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold">
            Peaks | Private real estate development
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-none md:text-7xl lg:text-8xl">
            The Heritage
          </h1>
          <p className="mt-5 max-w-xl text-xl leading-snug text-ivory md:text-2xl">
            A Luxury Residence. A Transparent Investment Opportunity.
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.16em] text-ivory/75">
            Gibbons Park Estates — Lot 1, Logan, Utah
          </p>
          <blockquote className="mt-8 max-w-xl border-l border-gold pl-5 font-serif text-lg italic leading-relaxed text-ivory/90">
            An executive family residence designed for luxury living, with a
            defined development budget, construction-draw financing model, and
            a projected 50/50 profit-sharing structure.
          </blockquote>
          <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 min-[420px]:grid-cols-2">
            {STATS.map((stat) => (
              <div key={stat.label} className="border-t border-ivory/20 pt-3">
                <dd className="num font-sans text-2xl text-ivory">{stat.value}</dd>
                <dt className="mt-1 text-sm text-ivory/70">{stat.label}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#investment"
              className="inline-flex min-h-12 items-center justify-center bg-gold px-5 text-sm font-medium text-charcoal"
            >
              Explore the Investment
            </a>
            <a
              href="#residence"
              className="inline-flex min-h-12 items-center justify-center border border-ivory/40 px-5 text-sm font-medium text-ivory"
            >
              View the Home
            </a>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-ivory/70">
            {projectionsSentence}
          </p>
        </div>
        <div className="relative order-1 aspect-[1800/1087] w-full min-w-0 overflow-hidden bg-[#d5e4ec] lg:order-2 lg:aspect-auto lg:h-full">
          <Image
            src="/heritage-exterior.webp"
            alt="Official exterior rendering of The Heritage, a two-story residence with a light facade, dark windows, and an attached garage."
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-contain object-center"
          />
        </div>
      </div>
    </section>
  );
}
