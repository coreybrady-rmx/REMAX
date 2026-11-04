"use client";

import { useState } from "react";

export function DrawingViewer({
  images,
}: {
  images: Array<{ src: string; title: string }>;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  if (images.length === 0) {
    return (
      <p className="border border-dashed border-ink/20 p-8 text-sm leading-6 text-ink/70">
        Architectural drawings for the remaining levels have not been added to this page.
      </p>
    );
  }
  const current = open === null ? null : images[open];
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            className="border border-ink/10 bg-paper p-3 text-left"
            onClick={() => {
              setOpen(index);
              setZoom(1);
            }}
          >
            <img src={image.src} alt={image.title} className="max-h-72 w-full object-contain" />
            <span className="mt-2 block text-sm font-semibold">{image.title}</span>
          </button>
        ))}
      </div>
      {current ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4 text-white" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between gap-4">
            <p className="font-display text-xl">{current.title}</p>
            <button type="button" className="rounded-full bg-brand px-4 py-2 text-sm font-bold" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
          <label className="mt-3 flex items-center gap-3 text-sm">
            Zoom
            <input
              type="range"
              min={1}
              max={4}
              step={0.1}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
          <div className="mt-4 overflow-auto">
            <img
              src={current.src}
              alt={current.title}
              style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
