import trip from "../../data/trip.json";
import { HOME, VEGAS, clockIn, lightCount, rangeLabel, zoned } from "./time";

export { trip };

export type Flag = "now" | "next" | "conflict" | "optional" | "unknown";
export type Lane = "flight" | "hotel" | "official" | "family" | "travis" | "conflict";

export type ScheduleItem = {
  id: string;
  day: string;
  title: string;
  place: string;
  note: string;
  start: number | null;
  end: number | null;
  primary: string;
  zoneNote: string | null;
  flags: Flag[];
  weight: number;
  lane: Lane;
};

const FAMILY_CONFLICTS = new Set([
  "Jets & Capital (family PDF window)",
  "Charity luncheon (family PDF window)",
  "Speed Vegas",
  "Drivers' parade",
  "National anthem",
  "Lights out, Las Vegas Grand Prix",
]);

function timed(
  id: string,
  day: string,
  title: string,
  place: string,
  note: string,
  startHm: string | null,
  endHm: string | null,
  timeZone: string,
  flags: Flag[],
  weight: number,
  lane: Lane,
): ScheduleItem {
  const start = startHm ? zoned(day, startHm, timeZone) : null;
  const end = startHm && endHm ? zoned(day, endHm, timeZone) : null;
  const primary = start == null ? "Time unknown" : rangeLabel(start, end, VEGAS);
  const zoneNote =
    start != null && timeZone !== VEGAS ? rangeLabel(start, end, timeZone) : null;
  return { id, day, title, place, note, start, end, primary, zoneNote, flags, weight, lane };
}

function absolute(
  id: string,
  day: string,
  title: string,
  place: string,
  note: string,
  start: number,
  end: number | null,
  departZone: string,
  arriveZone: string,
  flags: Flag[],
  weight: number,
  lane: Lane,
): ScheduleItem {
  const primary = end == null ? clockIn(start, VEGAS) : `${clockIn(start, VEGAS)} to ${clockIn(end, VEGAS)}`;
  const notes: string[] = [];
  if (departZone !== VEGAS) notes.push(`Departs ${clockIn(start, departZone)}`);
  if (end != null && arriveZone !== VEGAS) notes.push(`Lands ${clockIn(end, arriveZone)}`);
  return { id, day, title, place, note, start, end, primary, zoneNote: notes.length ? notes.join(". ") : null, flags, weight, lane };
}

function buildItems(): ScheduleItem[] {
  const items: ScheduleItem[] = [];
  const out = trip.flights.segments[0];
  const back = trip.flights.segments[1];
  const outStart = Date.parse(out.departLocal);
  const outEnd = Date.parse(out.arriveLocal);
  const backStart = Date.parse(back.departLocal);
  const backEnd = Date.parse(back.arriveLocal);

  items.push(
    absolute(
      "flight-out",
      out.date,
      `${out.flightNumber} SLC to LAS`,
      `${out.from.name} to ${out.to.name}. Seat unknown. Gate unknown. Terminal unknown.`,
      "Nonstop. Personal item included. Bag count is a conflict: see Pit lane.",
      outStart,
      outEnd,
      HOME,
      VEGAS,
      ["conflict"],
      100,
      "flight",
    ),
  );
  items.push(
    absolute(
      "flight-back",
      back.date,
      `${back.flightNumber} LAS to SLC`,
      `${back.from.name} to ${back.to.name}. Seat unknown. Gate unknown. Terminal unknown.`,
      "Race night at 8:00 PM PT starts after this 6:43 PM PT departure.",
      backStart,
      backEnd,
      VEGAS,
      HOME,
      ["conflict"],
      100,
      "flight",
    ),
  );

  items.push(
    timed(
      "hotel-in",
      trip.hotel.checkInDate,
      `Check in, ${trip.hotel.name}`,
      trip.hotel.address,
      `${trip.hotel.room}. Confirmation ${trip.hotel.confirmationCode}. Check-in time is unknown.`,
      null,
      null,
      VEGAS,
      ["unknown"],
      40,
      "hotel",
    ),
  );
  items.push(
    timed(
      "hotel-out",
      trip.hotel.checkOutDate,
      `Check out, ${trip.hotel.name}`,
      trip.hotel.address,
      "Checkout date is Nov 21. Checkout time is unknown.",
      null,
      null,
      VEGAS,
      ["unknown"],
      40,
      "hotel",
    ),
  );

  for (const session of trip.jetsAndCapital.sessions) {
    const address =
      "address" in session && session.address
        ? session.address
        : "Two addresses are on file. Confirm before going.";
    items.push(
      timed(
        session.id,
        session.date,
        session.title,
        `${session.venue}. ${address}`,
        session.pdfConflict,
        session.officialStart,
        session.officialEnd,
        session.timeZone,
        ["conflict"],
        80,
        "official",
      ),
    );
  }

  for (const day of trip.familyRaceWeekend.days) {
    day.items.forEach((item, index) => {
      const flags: Flag[] = [];
      if (item.optional) flags.push("optional");
      if (!item.start) flags.push("unknown");
      if (FAMILY_CONFLICTS.has(item.title)) flags.push("conflict");
      items.push(
        timed(
          `family-${day.date}-${index}`,
          day.date,
          item.title,
          "place" in item && item.place ? item.place : "Place unknown",
          "note" in item && item.note ? item.note : "",
          item.start,
          item.end,
          VEGAS,
          flags,
          30,
          "family",
        ),
      );
    });
  }

  trip.travisStirlingClubEvents.events.forEach((event, index) => {
    items.push(
      timed(
        `travis-${index}`,
        event.date,
        event.title,
        "The Stirling Club, 2827 Paradise Rd. Travis accepted. Corey is not listed.",
        event.overlaps,
        event.start,
        event.end,
        event.timeZone,
        ["conflict"],
        20,
        "travis",
      ),
    );
  });

  return items.sort((a, b) => {
    if (a.day !== b.day) return a.day < b.day ? -1 : 1;
    if (a.start == null && b.start == null) return 0;
    if (a.start == null) return 1;
    if (b.start == null) return -1;
    return a.start - b.start;
  });
}

export const items = buildItems();

export const outbound = items.find((item) => item.id === "flight-out")!;
export const inbound = items.find((item) => item.id === "flight-back")!;

const SATURDAY_NOON = zoned("2026-11-21", "12:00", VEGAS);
const CHECK_IN_OPEN = Date.parse(trip.flights.checkIn.outboundCheckInOpenedAt);

export type Phase = "pre" | "live" | "saturday" | "complete";

export type NowView = {
  phase: Phase;
  lights: number;
  countdownMs: number;
  countdownLabel: string;
  heroTitle: string;
  heroTime: string;
  heroBody: string;
  heroTone: "alert" | "dark" | "plain";
  current: ScheduleItem | null;
  alsoNow: ScheduleItem[];
  next: ScheduleItem | null;
};

function isHappening(item: ScheduleItem, now: number): boolean {
  if (item.start == null) return false;
  const end = item.end ?? item.start + 45 * 60 * 1000;
  return item.start <= now && now < end;
}

export function viewAt(now: number): NowView {
  const happening = items
    .filter((item) => isHappening(item, now))
    .sort((a, b) => b.weight - a.weight || (b.start ?? 0) - (a.start ?? 0));
  const current = happening[0] ?? null;
  const alsoNow = happening.slice(1, 3);
  const next =
    items
      .filter((item) => item.start != null && item.start > now)
      .sort((a, b) => (a.start ?? 0) - (b.start ?? 0) || b.weight - a.weight)[0] ?? null;

  if (inbound.end != null && now >= inbound.end) {
    return {
      phase: "complete",
      lights: 5,
      countdownMs: 0,
      countdownLabel: "Landed in Salt Lake City",
      heroTitle: "Trip complete",
      heroTime: inbound.zoneNote ? `Landed ${inbound.zoneNote}` : `Landed ${inbound.primary}`,
      heroBody: "F9 1508 is down. Sunday family items were not on this booking.",
      heroTone: "dark",
      current,
      alsoNow,
      next: null,
    };
  }

  if (outbound.start != null && now < outbound.start) {
    const until = outbound.start - now;
    return {
      phase: "pre",
      lights: lightCount(until),
      countdownMs: until,
      countdownLabel: "Until F9 4695 leaves SLC",
      heroTitle: "Next: F9 4695 SLC to LAS",
      heroTime: [outbound.primary, outbound.zoneNote].filter(Boolean).join(". "),
      heroBody:
        now >= CHECK_IN_OPEN
          ? "Check-in is open in the Frontier app. Whether anyone has checked in is unknown. Seats and bags are unknown."
          : "Check-in opens 24 hours before departure.",
      heroTone: "dark",
      current,
      alsoNow,
      next: outbound,
    };
  }

  if (inbound.start != null && now >= SATURDAY_NOON && now < inbound.start) {
    const until = inbound.start - now;
    return {
      phase: "saturday",
      lights: lightCount(until),
      countdownMs: until,
      countdownLabel: "Until F9 1508 leaves LAS",
      heroTitle: "Do not miss F9 1508",
      heroTime: "6:43 PM PT",
      heroBody:
        "Gate unknown. Be at the gate 45 minutes prior, 5:58 PM PT. Grand Prix lights out at 8:00 PM, after this departure.",
      heroTone: "alert",
      current,
      alsoNow,
      next: inbound,
    };
  }

  const target = next?.start ?? inbound.start ?? now;
  const until = Math.max(0, target - now);
  return {
    phase: "live",
    lights: next ? lightCount(until) : 5,
    countdownMs: until,
    countdownLabel: next ? `Until ${next.title}` : "On the clock",
    heroTitle: current ? current.title : "Between sessions",
    heroTime: current ? current.primary : next ? next.primary : "",
    heroBody: current
      ? current.note || current.place
      : next
        ? `Next up: ${next.title}. ${next.primary}.`
        : "Nothing else is timed.",
    heroTone: current?.lane === "flight" ? "alert" : "plain",
    current,
    alsoNow,
    next,
  };
}

export const days = [
  { date: "2026-11-19", fun: "Lap 1", plain: "Thursday, Nov 19", familyOnly: false },
  { date: "2026-11-20", fun: "Lap 2", plain: "Friday, Nov 20", familyOnly: false },
  { date: "2026-11-21", fun: "Lap 3", plain: "Saturday, Nov 21", familyOnly: false },
  {
    date: "2026-11-22",
    fun: "Cool-down lap",
    plain: "Sunday, family schedule only",
    familyOnly: true,
  },
] as const;

export function itemsOn(day: string): ScheduleItem[] {
  return items.filter((item) => item.day === day);
}
