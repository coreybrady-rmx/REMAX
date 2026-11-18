"use client";

import type { ReactNode } from "react";
import type { Flag, ScheduleItem } from "@/lib/schedule";
import { calendarEvents, downloadIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/calendar";

const FLAG_STYLE: Record<Flag, { flag: string; label: string; className: string }> = {
  now: { flag: "Green flag", label: "Now", className: "bg-flag-green text-white" },
  next: { flag: "Blue flag", label: "Next", className: "bg-remax-blue text-white" },
  conflict: { flag: "Yellow flag", label: "Conflict", className: "bg-flag-yellow text-ink" },
  optional: { flag: "White flag", label: "Optional", className: "border-2 border-ink bg-white text-ink" },
  unknown: { flag: "Gray flag", label: "Unknown", className: "bg-flag-gray text-ink" },
};

export function FlagChip({ kind }: { kind: Flag }) {
  const style = FLAG_STYLE[kind];
  return (
    <span className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold ${style.className}`}>
      <span className="font-body text-[11px] uppercase tracking-wide">{style.flag}</span>
      <span className="font-display text-lg italic leading-none">{style.label}</span>
    </span>
  );
}

export function Lights({ count, time, caption }: { count: number; time: string; caption: string }) {
  return (
    <div className="rounded-2xl bg-ink px-4 py-4 text-center text-white">
      <p className="font-body text-xs font-semibold tracking-[0.14em] text-remax">LIGHTS OUT</p>
      <p className="mt-1 font-mono text-[1.7rem] font-bold leading-none">{time}</p>
      <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`light h-7 w-7 rounded-full border-2 border-remax ${index < count ? "bg-remax shadow-[0_0_12px_#DC1C2E]" : "bg-ink"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm">{caption}</p>
    </div>
  );
}

export function Banner({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border-2 border-flag-yellow bg-card p-3">
      <span className="w-2 shrink-0 rounded-full bg-flag-yellow" aria-hidden="true" />
      <div>
        <p className="font-display text-xl italic leading-tight text-ink">{title}</p>
        <p className="mt-1 text-sm leading-snug text-ink">{body}</p>
      </div>
    </div>
  );
}

export function SectionHead({ fun, plain }: { fun: string; plain: string }) {
  return (
    <header className="mb-3">
      <div className="checker mb-2 rounded-sm" />
      <h2 className="font-display text-[1.7rem] italic leading-none text-remax">{fun}</h2>
      <p className="mt-1 text-sm font-semibold text-remax-blue">{plain}</p>
    </header>
  );
}

export function ItemCard({ item, live }: { item: ScheduleItem; live?: Flag | null }) {
  const flags = [...(live ? [live] : []), ...item.flags.filter((flag) => flag !== live)];
  return (
    <article className="rounded-2xl bg-card p-3">
      {flags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {flags.map((flag) => (
            <FlagChip key={flag} kind={flag} />
          ))}
        </div>
      )}
      <p className="font-mono text-[13px] font-medium text-remax-blue">{item.primary}</p>
      {item.zoneNote && <p className="font-mono text-xs text-ink">Local: {item.zoneNote}</p>}
      <h3 className="mt-1 font-display text-[1.35rem] italic leading-tight text-ink">{item.title}</h3>
      <p className="mt-1 text-sm text-ink">{item.place}</p>
      {item.note && <p className="mt-1 text-xs font-semibold leading-snug text-ink">{item.note}</p>}
    </article>
  );
}

export function TapLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className="flex min-h-11 items-center rounded-xl bg-remax-blue px-3 text-sm font-semibold text-white"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function CalendarButtons({ id }: { id: string }) {
  const event = calendarEvents.find((item) => item.id === id);
  if (!event) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        type="button"
        className="min-h-11 rounded-xl bg-ink px-2 text-sm font-semibold text-white"
        onClick={() => downloadIcs(event)}
      >
        Add .ics
      </button>
      <a
        className="flex min-h-11 items-center justify-center rounded-xl border-2 border-remax-blue px-2 text-sm font-semibold text-remax-blue"
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noreferrer"
      >
        Google Calendar
      </a>
    </div>
  );
}

export function CheckRow({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className="flex min-h-12 w-full items-center gap-3 rounded-xl bg-card px-3 text-left"
      onClick={() => onToggle(id)}
      aria-pressed={checked}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded border-2 text-[10px] font-bold text-white ${checked ? "border-remax bg-remax" : "border-ink bg-white"}`}
        aria-hidden="true"
      >
        {checked ? "OK" : ""}
      </span>
      <span className={`text-sm ${checked ? "text-ink/70 line-through" : "text-ink"}`}>{label}</span>
    </button>
  );
}

export type { CalendarEvent };
