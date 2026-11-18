"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { trip } from "@/lib/schedule";
import { vegasNowLabel } from "@/lib/time";

const NAV = [
  { href: "/", label: "Now" },
  { href: "/laps", label: "Laps" },
  { href: "/flights", label: "Flights" },
  { href: "/hotel", label: "Hotel" },
  { href: "/events", label: "Events" },
  { href: "/contacts", label: "Radio" },
  { href: "/checklist", label: "List" },
] as const;

const NowContext = createContext<number | null>(null);

export function useNow(): number | null {
  return useContext(NowContext);
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href;
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* install still works online if the worker is blocked */
      });
    }
  }, []);

  const clock = now == null ? null : vegasNowLabel(now);

  return (
    <NowContext.Provider value={now}>
      <div className="mx-auto min-h-screen max-w-[430px] bg-white pb-24 text-ink shadow-2xl">
        <div className="checker" />
        <header className="bg-ink px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border-2 border-remax bg-white text-ink" aria-label="RE/MAX logo">
              <span className="flex h-7 w-12 overflow-hidden rounded-sm" aria-hidden="true">
                <span className="w-4 bg-remax-blue" />
                <span className="w-4 border-x border-ink bg-white" />
                <span className="w-4 bg-remax" />
              </span>
              <span className="mt-1 text-[8px] font-bold leading-none">RE/MAX logo</span>
            </div>
            <div>
              <p className="font-display text-2xl italic leading-none">RE/MAX Peaks</p>
              <p className="text-xs font-semibold text-white/90">Nov 19-21, 2026</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold tracking-[0.14em] text-remax">NOW IN LAS VEGAS</p>
          <p className="font-mono text-[1.65rem] font-bold leading-tight">{clock ? clock.time : "--:--:-- PT"}</p>
          <p className="text-xs font-semibold">{clock ? clock.date : "Las Vegas time"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/flights" className="inline-flex min-h-11 items-center rounded-md bg-remax px-3 font-mono text-sm font-medium">
              FLT {trip.flights.confirmationCode}
            </Link>
            <Link href="/hotel" className="inline-flex min-h-11 items-center rounded-md bg-remax px-3 font-mono text-sm font-medium">
              HTL {trip.hotel.confirmationCode}
            </Link>
          </div>
        </header>

        <main className="px-4 py-4">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-flag-gray bg-white" aria-label="Sections">
          <div className="mx-auto flex max-w-[430px]">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-16 flex-1 flex-col items-center justify-center text-[13px] font-display italic ${active ? "text-remax" : "text-ink"}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={`mb-1 h-1 w-5 rounded-full ${active ? "bg-remax" : "bg-transparent"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </NowContext.Provider>
  );
}
