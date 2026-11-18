export const VEGAS = "America/Los_Angeles";
export const HOME = "America/Denver";

export function clean(value: string): string {
  return value.replace(/[\u202f\u00a0]/g, " ");
}

/** Milliseconds to add to a wall-clock-as-UTC guess to reach the real UTC instant. */
function zoneOffset(instant: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );
  const wallAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return instant.getTime() - wallAsUtc;
}

export function zoned(date: string, time: string, timeZone: string): number {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const first = guess + zoneOffset(new Date(guess), timeZone);
  return guess + zoneOffset(new Date(first), timeZone);
}

export function clock(ms: number, timeZone: string): string {
  return clean(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(ms)),
  );
}

export function zoneSuffix(timeZone: string): string {
  if (timeZone === VEGAS) return "PT";
  if (timeZone === HOME) return "MT";
  return "";
}

export function clockIn(ms: number, timeZone: string): string {
  const suffix = zoneSuffix(timeZone);
  return suffix ? `${clock(ms, timeZone)} ${suffix}` : clock(ms, timeZone);
}

export function rangeLabel(start: number, end: number | null, timeZone: string): string {
  if (end == null) return clockIn(start, timeZone);
  return `${clock(start, timeZone)} to ${clockIn(end, timeZone)}`;
}

export function vegasNowLabel(now: number): { time: string; date: string } {
  const time = clean(
    new Intl.DateTimeFormat("en-US", {
      timeZone: VEGAS,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(now)),
  );
  const date = clean(
    new Intl.DateTimeFormat("en-US", {
      timeZone: VEGAS,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(now)),
  );
  return { time: `${time} PT`, date };
}

export function countdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

/** Five start lights fill in as the target gets closer. */
export function lightCount(msUntil: number): number {
  const hours = msUntil / 3_600_000;
  if (hours <= 0) return 5;
  if (hours < 2) return 5;
  if (hours < 6) return 4;
  if (hours < 12) return 3;
  if (hours < 24) return 2;
  return 1;
}

export function toGoogleUtc(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
