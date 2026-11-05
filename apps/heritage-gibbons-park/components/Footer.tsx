import {
  preliminaryIllustrationDisclosure,
  securitiesDisclosure,
} from "@/lib/disclosures";

export function Footer() {
  return (
    <footer className="bg-charcoal px-5 py-16 text-ivory md:px-8">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold">
          Peaks
        </p>
        <p className="mt-3 font-serif text-3xl">The Heritage at Gibbons Park Estates</p>
        <p className="mt-2 text-sm text-ivory/70">
          Lot 1, Logan, Utah. Private illustration. Not indexed.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <p className="text-sm leading-relaxed text-ivory/80">
            {preliminaryIllustrationDisclosure}
          </p>
          <p className="text-sm leading-relaxed text-ivory/80">
            {securitiesDisclosure}
          </p>
        </div>
        <p className="mt-10 text-sm text-ivory/60">
          <a href="#inquiry" className="underline decoration-gold/70 underline-offset-4">
            Inquire
          </a>
        </p>
      </div>
    </footer>
  );
}
