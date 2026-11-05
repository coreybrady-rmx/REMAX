import {
  preliminaryIllustrationDisclosure,
  securitiesDisclosure,
} from "@/lib/disclosures";

export function LegalDisclosures({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const text =
    tone === "dark"
      ? "text-sm leading-relaxed text-ivory/80"
      : "bg-ivory px-6 py-6 text-sm leading-relaxed text-charcoal/85";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <p className={text}>{preliminaryIllustrationDisclosure}</p>
      <p className={text}>{securitiesDisclosure}</p>
    </div>
  );
}
