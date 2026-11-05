"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#investment", label: "Summary" },
  { href: "#residence", label: "Residence" },
  { href: "#lot", label: "Lot" },
  { href: "#financials", label: "Financials" },
  { href: "#returns", label: "Returns" },
  { href: "#timeline", label: "Timeline" },
  { href: "#inquiry", label: "Inquire" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#top" className="flex items-baseline gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal">
            Peaks
          </span>
          <span className="font-serif text-lg text-charcoal">The Heritage</span>
        </a>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Page sections">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-charcoal/80 transition-colors hover:text-charcoal"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="inline-flex min-h-11 items-center px-3 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Page sections"
          className="border-t border-charcoal/10 bg-ivory px-5 py-4 lg:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block py-3 text-base"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
