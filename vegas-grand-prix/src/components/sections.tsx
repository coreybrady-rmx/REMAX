"use client";

import { useEffect, useState } from "react";
import { days, itemsOn, trip, viewAt, type Flag } from "@/lib/schedule";
import { countdown, vegasDateKey } from "@/lib/time";
import { Banner, CalendarButtons, CheckRow, FlagChip, ItemCard, Lights, SectionHead, TapLink } from "@/components/ui";
import { useNow } from "@/components/Shell";

const CHECK_KEY = "vegas-gp-checks";

function useChecks() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECK_KEY);
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* offline or private mode: checks stay empty */
    }
  }, []);
  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(CHECK_KEY, JSON.stringify(next));
      return next;
    });
  }
  return { checked, toggle };
}

function liveFlag(id: string, currentId?: string, nextId?: string): Flag | null {
  if (id === currentId) return "now";
  if (id === nextId) return "next";
  return null;
}

function defaultLap(now: number | null): string {
  if (now == null) return days[0].date;
  const key = vegasDateKey(now);
  if (days.some((day) => day.date === key)) return key;
  if (key < days[0].date) return days[0].date;
  return days[days.length - 1].date;
}

export function NowSection() {
  const now = useNow();
  const view = now == null ? null : viewAt(now);

  return (
    <section>
      <SectionHead
        fun={view?.phase === "complete" ? "Checkered flag" : view?.phase === "saturday" ? "Do not miss the plane" : "Formation lap"}
        plain={view?.phase === "complete" ? "Trip complete" : "Now and next"}
      />
      {view == null ? (
        <p className="rounded-2xl bg-card p-4 text-sm">Reading the Las Vegas clock.</p>
      ) : (
        <div className="now-card space-y-3">
          {view.phase === "saturday" && (
            <div className="rounded-2xl bg-remax p-4 text-white">
              <p className="text-xs font-semibold tracking-wide">NOW: F9 1508</p>
              <p className="font-display text-4xl italic leading-none">6:43 PM PT</p>
              <p className="mt-2 text-sm">{view.heroBody}</p>
            </div>
          )}
          <Lights count={view.lights} time={view.phase === "complete" ? "LANDED" : countdown(view.countdownMs)} caption={view.countdownLabel} />
          {view.phase !== "saturday" && (
            <article className={`rounded-2xl p-4 ${view.heroTone === "alert" ? "bg-remax text-white" : "bg-card text-ink"}`}>
              <div className="mb-2">
                <FlagChip kind={view.phase === "pre" ? "next" : view.phase === "complete" ? "now" : view.current ? "now" : "next"} />
              </div>
              <h3 className="font-display text-2xl italic leading-tight">{view.heroTitle}</h3>
              <p className="mt-1 font-mono text-sm">{view.heroTime}</p>
              <p className="mt-2 text-sm">{view.heroBody}</p>
            </article>
          )}
          {view.phase === "saturday" && <FlagChip kind="now" />}
          {view.phase === "pre" && (
            <article className="rounded-2xl bg-card p-3">
              <FlagChip kind="unknown" />
              <h3 className="mt-2 font-display text-2xl italic">Open gaps before wheels up</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {trip.gaps.slice(0, 4).map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </article>
          )}
          {view.current && view.phase === "saturday" && view.current.lane !== "flight" && <ItemCard item={view.current} />}
          {view.next && view.phase === "live" && <ItemCard item={view.next} live="next" />}
        </div>
      )}
    </section>
  );
}

export function LapsSection() {
  const now = useNow();
  const view = now == null ? null : viewAt(now);
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? defaultLap(now);
  const day = days.find((item) => item.date === selected) ?? days[0];
  const family = trip.familyRaceWeekend;

  return (
    <section>
      <SectionHead fun="Race weekend" plain="One lap at a time" />
      <div className="mb-4 grid grid-cols-4 gap-2">
        {days.map((item) => {
          const on = item.date === day.date;
          return (
            <button
              key={item.date}
              type="button"
              onClick={() => setPicked(item.date)}
              className={`min-h-11 rounded-xl px-1 text-sm font-display italic ${on ? "bg-remax text-white" : "bg-card text-ink"}`}
              aria-pressed={on}
            >
              {item.fun}
            </button>
          );
        })}
      </div>
      <p className="mb-3 text-sm font-semibold">{day.plain}</p>
      {day.familyOnly && (
        <p className="mb-3 text-sm">Corey and Travis fly home Saturday evening. These Sunday items are on the family PDF only.</p>
      )}
      <div className="space-y-3">
        {itemsOn(day.date).map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            live={view ? liveFlag(item.id, view.current?.id, view.phase === "pre" ? "flight-out" : view.next?.id) : null}
          />
        ))}
      </div>
      {day.date === "2026-11-21" && (
        <p className="mt-3 text-sm">
          Circuit: {family.circuitFacts.lengthMiles} miles, {family.circuitFacts.corners} corners, {family.circuitFacts.raceLaps} laps. {family.circuitFacts.speedNote}.
        </p>
      )}
    </section>
  );
}

export function FlightsSection() {
  const now = useNow();
  const view = now == null ? null : viewAt(now);
  const out = trip.flights.segments[0];
  const back = trip.flights.segments[1];
  const outbound = itemsOn(out.date).find((item) => item.id === "flight-out");
  const inbound = itemsOn(back.date).find((item) => item.id === "flight-back");

  return (
    <section>
      <SectionHead fun="Pit lane" plain="Flights" />
      <div className="space-y-3">
        {outbound && <ItemCard item={outbound} live={view?.phase === "pre" ? "next" : null} />}
        {inbound && <ItemCard item={inbound} live={view?.phase === "saturday" ? "now" : null} />}
        <Banner title="Bag language conflict" body={`${trip.flights.bags.conflict} ${trip.flights.bags.personalItemIncluded} ${trip.flights.bags.carryOnAndCheckedNote}`} />
        <article className="rounded-2xl bg-card p-3 text-sm">
          <p className="font-display text-2xl italic">Booking HE23RS</p>
          <p className="mt-1">Airline: {trip.flights.airline}. Passengers: {trip.flights.passengers.join(", ")}.</p>
          <p>Frontier miles: {trip.flights.frontierMilesNumber}. Paid ${trip.flights.totalPaidUsd.toFixed(2)} by {trip.flights.paymentType}. No card number is stored here.</p>
          <p>Seats: {trip.flights.seats}. Bag status: {trip.flights.bags.status}.</p>
          <p className="mt-2 font-semibold">Check-in</p>
          <p>{trip.flights.checkIn.method}. Status: {trip.flights.checkIn.status}.</p>
          <p>{trip.flights.checkIn.reminderSent}</p>
          <p>{trip.flights.checkIn.arriveEarly} {trip.flights.checkIn.bagDropCutoff}</p>
          <p>{trip.flights.checkIn.gateCutoff}</p>
          <p className="mt-2">Outbound stops: {out.stops}. Return stops: {back.stops}.</p>
          <div className="mt-3 grid gap-2">
            <TapLink href={trip.flights.retrieveUrl}>Retrieve booking</TapLink>
            <TapLink href={trip.flights.manageTripUrl}>Manage trip</TapLink>
            <TapLink href={trip.flights.appStoreUrl}>Frontier on the App Store</TapLink>
            <TapLink href={trip.flights.playStoreUrl}>Frontier on Google Play</TapLink>
          </div>
          <CalendarButtons id="flight-out" />
          <CalendarButtons id="flight-back" />
        </article>
      </div>
    </section>
  );
}

export function HotelSection() {
  return (
    <section>
      <SectionHead fun="Garage" plain="Hotel" />
      <article className="rounded-2xl bg-card p-3 text-sm">
        <p className="font-mono text-remax-blue">Nov 19 to Nov 21</p>
        <h3 className="font-display text-3xl italic leading-none">{trip.hotel.name}</h3>
        <p className="mt-1">{trip.hotel.address}. {trip.hotel.addressNote}</p>
        <p>{trip.hotel.room}. Guests: {trip.hotel.guests.join(", ")}.</p>
        <p>Confirmation {trip.hotel.confirmationCode}. Booked through {trip.hotel.bookedThrough}. {trip.hotel.nights} nights.</p>
        <p>Check-in {trip.hotel.checkInDate}, time {trip.hotel.checkInTime}. Check-out {trip.hotel.checkOutDate}.</p>
        <p>Paid ${trip.hotel.totalPaidUsd.toFixed(2)}. Receipt {trip.hotel.receiptNumber}. {trip.hotel.paidAt}.</p>
        <p>{trip.hotel.payAtHotelNote}</p>
        <p>{trip.hotel.cancellation}</p>
        <Banner title="Not the other beds" body={`${trip.hotel.notTheEventHotel} ${trip.hotel.notTheAirbnb}`} />
        <div className="mt-3 grid gap-2">
          <TapLink href={trip.hotel.mapUrl}>Map, Palace Station</TapLink>
          <TapLink href={trip.hotel.itineraryUrl}>Axel itinerary</TapLink>
          <TapLink href={`mailto:${trip.hotel.supportEmail}`}>Email {trip.hotel.supportEmail}</TapLink>
        </div>
        <CalendarButtons id="hotel" />
      </article>
    </section>
  );
}

export function EventsSection() {
  const family = trip.familyRaceWeekend;

  return (
    <section>
      <SectionHead fun="Starting grid" plain="Event schedule" />
      <div className="space-y-3">
        <Banner
          title="Cirrus address conflict"
          body={
            typeof trip.jetsAndCapital.sessions[0].addressConflict === "string"
              ? trip.jetsAndCapital.sessions[0].addressConflict
              : "Two Cirrus addresses are on file. Confirm before going."
          }
        />
        <Banner
          title="Charity time conflict"
          body={trip.jetsAndCapital.sessions[1]?.pdfConflict ?? "The charity event has two published time windows."}
        />
        {trip.jetsAndCapital.sessions.map((session) => (
          <article key={session.id} className="rounded-2xl bg-card p-3 text-sm">
            <p className="font-mono text-remax-blue">
              {session.officialStart} to {session.officialEnd} PT
            </p>
            <h3 className="font-display text-2xl italic leading-tight">{session.title}</h3>
            <p>{session.venue}. Source: {session.timeSource}</p>
            <p>{session.pdfConflict}</p>
            {"addressEmailAndCalendar" in session && (
              <p>Event email: {session.addressEmailAndCalendar}. Family PDF: {session.addressFamilyPdf}.</p>
            )}
            {"address" in session && session.address && <p>{session.address}</p>}
            <div className="mt-3 grid gap-2">
              {"mapUrlEmail" in session && session.mapUrlEmail && <TapLink href={session.mapUrlEmail}>Map, 5050 Koval Lane</TapLink>}
              {"mapUrlPreferredUnknown" in session && session.mapUrlPreferredUnknown && (
                <TapLink href={session.mapUrlPreferredUnknown}>Map, 275 E Tropicana Ave</TapLink>
              )}
              {"mapUrl" in session && session.mapUrl && <TapLink href={session.mapUrl}>Map, Caesars Palace</TapLink>}
            </div>
            <CalendarButtons id={session.id} />
          </article>
        ))}
        <article className="rounded-2xl bg-card p-3 text-sm">
          <h3 className="font-display text-2xl italic">Optional family weekend</h3>
          <p>{family.suiteNote}</p>
          <p className="mt-1">{family.f1TimesNote}</p>
          <p className="mt-1">Instagram {trip.jetsAndCapital.instagram}. Order {trip.jetsAndCapital.registrationOrder}.</p>
          <p>{trip.jetsAndCapital.whatsAppGroup}</p>
          <div className="mt-3 grid gap-2">
            <TapLink href="https://maps.google.com/?q=4201+East+Hacienda+Avenue,+Las+Vegas,+NV+89120">Map, Hacienda Airbnb</TapLink>
            <TapLink href="https://maps.google.com/?q=3708+S+Las+Vegas+Blvd,+Las+Vegas,+NV+89109">Map, Cosmopolitan</TapLink>
            <TapLink href="https://maps.google.com/?q=3570+S+Las+Vegas+Blvd,+Las+Vegas,+NV+89109">Map, Caesars Palace</TapLink>
            <TapLink href="https://maps.google.com/?q=4301+S+Valley+View+Blvd,+Ste+16,+Las+Vegas,+NV+89103">Map, Dream Exotics</TapLink>
            <TapLink href="https://maps.google.com/?q=3624+Edmond+St,+Las+Vegas,+NV+89103">Map, private mansion</TapLink>
          </div>
        </article>
        <article className="rounded-2xl bg-card p-3 text-sm">
          <h3 className="font-display text-2xl italic">Travis at the Stirling Club</h3>
          <p>{trip.travisStirlingClubEvents.note}</p>
          <div className="mt-3 grid gap-2">
            <TapLink href={trip.travisStirlingClubEvents.venueMapUrl}>Map, The Stirling Club</TapLink>
            {trip.travisStirlingClubEvents.events.map((event) => (
              <TapLink key={event.lumaUrl} href={event.lumaUrl}>
                {event.date.slice(5)} {event.title}
              </TapLink>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export function ContactsSection() {
  return (
    <section>
      <SectionHead fun="Team radio" plain="Contacts" />
      <div className="space-y-3">
        {trip.contacts.map((person) => (
          <article key={person.name} className="rounded-2xl bg-card p-3 text-sm">
            <h3 className="font-display text-2xl italic leading-none">{person.name}</h3>
            <p>{person.role}</p>
            {"phoneNote" in person && person.phoneNote && (
              <p className="font-semibold">{person.phoneNote === "not in Contacts" ? "(not in Contacts)" : person.phoneNote}</p>
            )}
            <div className="mt-2 grid gap-2">
              {"phone" in person && person.phone && <TapLink href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}>{person.phone}</TapLink>}
              {"email" in person && person.email && <TapLink href={`mailto:${person.email}`}>{person.email}</TapLink>}
              {"url" in person && person.url && <TapLink href={person.url}>Customer service</TapLink>}
              {person.phone == null && !("url" in person && person.url) && person.email == null && <p>Phone unknown. Email unknown.</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ChecklistSection() {
  const { checked, toggle } = useChecks();
  const family = trip.familyRaceWeekend;

  return (
    <section>
      <SectionHead fun="Pre-race checklist" plain="Packing and to-dos" />
      <div className="space-y-2">
        <h3 className="font-display text-xl italic">Essentials</h3>
        {family.packing.essentials.map((item) => (
          <CheckRow key={item} id={`pack-${item}`} label={item} checked={Boolean(checked[`pack-${item}`])} onToggle={toggle} />
        ))}
        <h3 className="pt-2 font-display text-xl italic">Optional packing</h3>
        {family.packing.optional.map((item) => (
          <CheckRow key={item} id={`opt-${item}`} label={item} checked={Boolean(checked[`opt-${item}`])} onToggle={toggle} />
        ))}
        <h3 className="pt-2 font-display text-xl italic">Also</h3>
        {family.packing.other.map((item) => (
          <CheckRow key={item} id={`other-${item}`} label={item} checked={Boolean(checked[`other-${item}`])} onToggle={toggle} />
        ))}
        <h3 className="pt-2 font-display text-xl italic">To-dos</h3>
        {trip.todos.map((todo) => (
          <CheckRow key={todo.task} id={`todo-${todo.task}`} label={`${todo.task}. Due: ${todo.due}`} checked={Boolean(checked[`todo-${todo.task}`])} onToggle={toggle} />
        ))}
        <h3 className="pt-3 font-display text-xl italic">Open gaps</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          {trip.gaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
