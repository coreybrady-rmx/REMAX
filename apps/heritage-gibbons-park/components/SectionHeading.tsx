export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "charcoal",
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  tone?: "charcoal" | "ivory";
}) {
  const titleColor = tone === "ivory" ? "text-ivory" : "text-charcoal";
  const ledeColor = tone === "ivory" ? "text-ivory/80" : "text-charcoal/80";
  const rule = tone === "ivory" ? "bg-gold" : "bg-gold";
  const label = tone === "ivory" ? "text-gold" : "text-charcoal";

  return (
    <div className="max-w-3xl">
      <p className={`flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] ${label}`}>
        <span className={`h-px w-8 ${rule}`} aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className={`mt-4 font-serif text-4xl leading-[1.1] md:text-5xl ${titleColor}`}>
        {title}
      </h2>
      {lede ? (
        <p className={`mt-5 text-lg leading-relaxed ${ledeColor}`}>{lede}</p>
      ) : null}
    </div>
  );
}
