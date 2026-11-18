"use client";

import { useEffect, useState } from "react";
import { trip, days, itemsOn, viewAt, type Flag } from "@/lib/schedule";
import { countdown, vegasNowLabel } from "@/lib/time";
import { Banner, CalendarButtons, CheckRow, FlagChip, ItemCard, Lights, SectionHead, TapLink } from "@/components/ui";

const NAV = [
  ["now", "Now"],
  ["laps", "Laps"],
  ["flights", "Flights"],
  ["hotel", "Hotel"],
  ["events", "Events"],
  ["contacts", "Radio"],
  ["checklist", "List"],
] as const;

const CHECK_KEY = "vegas-gp-checks";

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

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

export function TripApp() {
  const now = useNow();
  const { checked, toggle } = useChecks();
  const [active, setActive] = useState<(typeof NAV)[number][0]>("now");
  const view = now == null ? null : viewAt(now);
  const clock = now == null ? null : vegasNowLabel(now);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* install still works online if the worker is blocked */
      });
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const mark = window.scrollY + 140;
      let next: (typeof NAV)[number][0] = "now";
      for (const [id] of NAV) {
        const node = document.getElementById(id);
        if (node && node.offsetTop <= mark) next = id;
      }
      setActive(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const out = trip.flights.segments[0];
  const back = trip.flights.segments[1];
  const family = trip.familyRaceWeekend;

  return (
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
          <span className="inline-flex min-h-11 items-center rounded-md bg-remax px-3 font-mono text-sm font-medium">
            FLT {trip.flights.confirmationCode}
          </span>
          <span className="inline-flex min-h-11 items-center rounded-md bg-remax px-3 font-mono text-sm font-medium">
            HTL {trip.hotel.confirmationCode}
          </span>
        </div>
      </header>

      <main className="space-y-8 px-4 py-4">
        <section id="now">
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
              {view.current && view.phase === "saturday" && view.current.lane !== "flight" && (
                <ItemCard item={view.current} />
              )}
              {view.next && view.phase === "live" && (
                <ItemCard item={view.next} live="next" />
              )}
            </div>
          )}
        </section>

        <section id="laps">
          <SectionHead fun="Race weekend" plain="Day by day" />
          <p className="mb-4 text-sm">
            {family.uberNote} {trip.hotel.notTheAirbnb} Family items are optional unless a card says otherwise.
          </p>
          {days.map((day) => (
            <div key={day.date} className="mb-6">
              <SectionHead fun={day.fun} plain={day.plain} />
              {day.familyOnly && (
                <p className="mb-3 text-sm font-semibold">
                  Corey and Travis fly home Saturday evening. These Sunday items are on the family PDF only.
                </p>
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
            </div>
          ))}
        </section>

        <section id="flights">
          <SectionHead fun="Pit lane" plain="Flights" />
          <div className="space-y-3">
            <ItemCard item={itemsOn(out.date).find((item) => item.id === "flight-out")!} live={view?.phase === "pre" ? "next" : null} />
            <ItemCard item={itemsOn(back.date).find((item) => item.id === "flight-back")!} live={view?.phase === "saturday" ? "now" : null} />
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

        <section id="hotel">
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

        <section id="events">
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
                  {"mapUrlEmail" in session && session.mapUrlEmail && (
                    <TapLink href={session.mapUrlEmail}>Map, 5050 Koval Lane</TapLink>
                  )}
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

        <section id="contacts">
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
                  {"phone" in person && person.phone && (
                    <TapLink href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}>{person.phone}</TapLink>
                  )}
                  {"email" in person && person.email && <TapLink href={`mailto:${person.email}`}>{person.email}</TapLink>}
                  {"url" in person && person.url && <TapLink href={person.url}>Customer service</TapLink>}
                  {person.phone == null && !("url" in person && person.url) && person.email == null && (
                    <p>Phone unknown. Email unknown.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="checklist">
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
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-flag-gray bg-white" aria-label="Sections">
        <div className="mx-auto flex max-w-[430px]">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center text-[13px] font-display italic ${active === id ? "text-remax" : "text-ink"}`}
              onClick={() => setActive(id)}
            >
              <span className={`mb-1 h-1 w-5 rounded-full ${active === id ? "bg-remax" : "bg-transparent"}`} />
              {label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
