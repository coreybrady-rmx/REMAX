import type { Metadata } from "next";
import { AgentMicrosite } from "@/components/AgentMicrosite";
import { coreyBrady } from "@/data/agents/corey-brady";

export const metadata: Metadata = {
  title: "Corey Brady | Cache Valley Real Estate",
  description:
    "Work with Corey Brady, Owner at RE/MAX Peaks. Search Cache Valley homes, get your home value, and connect with a local advisor.",
  openGraph: {
    title: "Corey Brady | RE/MAX Peaks",
    description:
      "Cache Valley real estate with clear next steps — search homes or get your home value.",
    images: [
      {
        url: coreyBrady.photo,
        width: 960,
        height: 1200,
        alt: "Corey Brady, Owner at RE/MAX Peaks",
      },
    ],
    url: "https://www.remaxpeaks.com/corey-brady/",
  },
  alternates: {
    canonical: "https://www.remaxpeaks.com/corey-brady/",
  },
};

export default function CoreyBradyPage() {
  return <AgentMicrosite agent={coreyBrady} />;
}
