"use client";

import Image from "next/image";
import { useState } from "react";
import { FLOOR_PLANS } from "@/lib/content";

export function PhotoGallery() {
  const [active, setActive] = useState<(typeof FLOOR_PLANS)[number]["id"]>("main");
  const plan = FLOOR_PLANS.find((item) => item.id === active) ?? FLOOR_PLANS[0];

  return (
    <section aria-labelledby="gallery-title" className="bg-ivory px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <h2 id="gallery-title" className="font-serif text-4xl md:text-5xl">
          Exterior and plans
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-charcoal/75">
          The exterior is the official rendering for this illustration. Floor
          plans below are placeholders until drawings are provided.
        </p>
        <figure className="mt-10">
          <div className="relative aspect-[1800/1087] overflow-hidden bg-[#d5e4ec]">
            <Image
              src="/heritage-exterior.webp"
              alt="Official exterior rendering of The Heritage residence."
              fill
              sizes="(min-width: 1120px) 1120px, 100vw"
              className="object-contain object-center"
            />
          </div>
          <figcaption className="mt-3 text-sm text-charcoal/70">
            Official exterior rendering of The Heritage. A rendering only.
            Selections are not final.
          </figcaption>
        </figure>
        <div className="mt-12">
          <div role="tablist" aria-label="Floor plan placeholders" className="flex flex-wrap gap-2">
            {FLOOR_PLANS.map((item) => {
              const selected = item.id === plan.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${item.id}`}
                  className={`min-h-11 px-4 text-sm ${selected ? "bg-charcoal text-ivory" : "bg-stone text-charcoal"}`}
                  onClick={() => setActive(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div
            role="tabpanel"
            id={`panel-${plan.id}`}
            aria-labelledby={`tab-${plan.id}`}
            className="mt-4 border border-dashed border-charcoal/30 bg-stone px-6 py-16 text-center"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/70">
              Placeholder
            </p>
            <p className="mt-3 font-serif text-3xl">{plan.title}</p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-charcoal/75">
              {plan.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
