import { inbound, outbound, viewAt } from "../src/lib/schedule";
import { VEGAS, zoned } from "../src/lib/time";

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

const wedNight = Date.parse("2026-11-18T22:48:00-08:00");
const thuMorning = Date.parse("2026-11-19T08:45:00-07:00");
const inAir = Date.parse("2026-11-19T09:40:00-07:00");
const mainEvent = Date.parse("2026-11-19T16:00:00-08:00");
const satAfternoon = Date.parse("2026-11-21T16:12:00-08:00");
const afterLanding = Date.parse("2026-11-21T21:30:00-07:00");

const pre = viewAt(wedNight);
assert(pre.phase === "pre", `wed night should be pre, got ${pre.phase}`);
assert(pre.next?.id === "flight-out", "pre next should be the outbound flight");
assert(pre.heroBody.includes("Check-in is open"), "check-in should already be open");
assert(!JSON.stringify(pre).includes("Brett"), "home calendar events stay off the sheet");

const preConflict = viewAt(thuMorning);
assert(preConflict.phase === "pre", "before departure is still pre-trip");
assert(preConflict.current == null, `nothing from home should be current, got ${preConflict.current?.title}`);

const air = viewAt(inAir);
assert(air.phase === "live", `in air should be live, got ${air.phase}`);
assert(air.current?.id === "flight-out", "current item in the air is the outbound flight");

const eventNow = viewAt(mainEvent);
assert(eventNow.current?.id === "main-event", `4pm Thu should be the main event, got ${eventNow.current?.id}`);

const saturday = viewAt(satAfternoon);
assert(saturday.phase === "saturday", `saturday afternoon got ${saturday.phase}`);
assert(saturday.heroTime === "6:43 PM PT", "return flight time stays on the hero");
assert(saturday.lights >= 4, "lights should be nearly full on Saturday afternoon");

const done = viewAt(afterLanding);
assert(done.phase === "complete", `after landing got ${done.phase}`);

assert(outbound.zoneNote?.includes("9:28 AM MT"), `outbound local label: ${outbound.zoneNote}`);
assert(outbound.primary.includes("8:28 AM PT"), `outbound Vegas label: ${outbound.primary}`);
assert(outbound.primary.includes("10:06 AM PT"), `outbound arrival label: ${outbound.primary}`);
assert(inbound.primary.includes("6:43 PM PT"), inbound.primary);
assert(inbound.zoneNote?.includes("9:11 PM MT"), `return landing label: ${inbound.zoneNote}`);

const noon = zoned("2026-11-21", "12:00", VEGAS);
assert(Math.abs(noon - Date.parse("2026-11-21T12:00:00-08:00")) < 1000, "Saturday noon PT");

console.log("schedule checks passed");
