import trip from "../../data/trip.json";
import { toGoogleUtc, zoned } from "./time";

export type CalendarEvent = {
  id: string;
  title: string;
  start: number;
  end: number;
  allDay?: { start: string; end: string };
  description: string;
  location: string;
};

const VEGAS = trip.trip.timeZoneVegas;

function pad(value: string): string {
  return value.replace(/-/g, "");
}

export const calendarEvents: CalendarEvent[] = [
  {
    id: "flight-out",
    title: "F9 4695 SLC to LAS",
    start: Date.parse(trip.flights.segments[0].departLocal),
    end: Date.parse(trip.flights.segments[0].arriveLocal),
    description:
      "Frontier confirmation HE23RS. Corey Brady and Travis Allred. Seat unknown. Gate unknown. Personal item is included. A later note said bags are included, and that conflict is unresolved.",
    location: "Salt Lake City International Airport",
  },
  {
    id: "flight-back",
    title: "F9 1508 LAS to SLC",
    start: Date.parse(trip.flights.segments[1].departLocal),
    end: Date.parse(trip.flights.segments[1].arriveLocal),
    description:
      "Frontier confirmation HE23RS. Departs LAS 6:43 PM PT. Seat unknown. Gate unknown. The Grand Prix viewing window is 8:00 to 10:00 PM PT, after this departure.",
    location: "Harry Reid International Airport",
  },
  {
    id: "hotel",
    title: "Palace Station",
    start: zoned(trip.hotel.checkInDate, "00:00", VEGAS),
    end: zoned("2026-11-22", "00:00", VEGAS),
    allDay: { start: trip.hotel.checkInDate, end: "2026-11-22" },
    description:
      "Confirmation AXL-9SYQ1Y5E. Premier room, 2 queen beds. Check-in time is unknown. Checkout Nov 21, time unknown. $198.95 paid. A pay-at-hotel figure of $181.36 also appeared and is unconfirmed.",
    location: "2411 W Sahara Ave, Las Vegas",
  },
  {
    id: "main-event",
    title: "Jets & Capital main event",
    start: zoned("2026-11-19", "15:00", VEGAS),
    end: zoned("2026-11-19", "21:30", VEGAS),
    description:
      "Official time from the Oct 13 email and Corey calendar: 3:00 to 9:30 PM Las Vegas time. The family weekend PDF lists 3:00 to 10:00 PM and marks it optional. Address conflict: email says 5050 Koval Lane. The family PDF and public listings say 275 E Tropicana Ave. Confirm before going.",
    location: "Cirrus Aviation, Las Vegas",
  },
  {
    id: "charity",
    title: "Susan G. Komen charity event",
    start: zoned("2026-11-20", "10:30", VEGAS),
    end: zoned("2026-11-20", "14:00", VEGAS),
    description:
      "Official time: 10:30 AM to 2:00 PM Las Vegas time at Caesars Palace. The family weekend PDF lists 11:30 AM to 3:00 PM, ages 18+ only. Confirm the start before going.",
    location: "3570 S Las Vegas Blvd, Las Vegas, NV 89109",
  },
];

function icsStamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function eventIcs(event: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//REMAX Peaks//Vegas Grand Prix//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@vegas-grand-prix-1119`,
    `DTSTAMP:${icsStamp(Date.now())}`,
  ];
  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${pad(event.allDay.start)}`);
    lines.push(`DTEND;VALUE=DATE:${pad(event.allDay.end)}`);
  } else {
    lines.push(`DTSTART:${icsStamp(event.start)}`);
    lines.push(`DTEND:${icsStamp(event.end)}`);
  }
  lines.push(
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(event.description)}`,
    `LOCATION:${icsEscape(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  );
  return lines.join("\r\n");
}

export function downloadIcs(event: CalendarEvent): void {
  const blob = new Blob([eventIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.id}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
  });
  if (event.allDay) {
    params.set("dates", `${pad(event.allDay.start)}/${pad(event.allDay.end)}`);
  } else {
    params.set("dates", `${toGoogleUtc(event.start)}/${toGoogleUtc(event.end)}`);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
