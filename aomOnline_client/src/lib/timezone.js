// Timezone helpers for the class-schedule flow.
//
// Class times are stored as wall-clock times in the teacher's timezone
// (Asia/Dhaka). Guardians abroad enter/see times in their own timezone, so we
// convert between zones for display — without pulling in a date library.

export const DHAKA_TZ = "Asia/Dhaka";

const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// The viewer's own IANA timezone (falls back to Dhaka on the server / if blocked).
export const browserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DHAKA_TZ;
  } catch {
    return DHAKA_TZ;
  }
};

// weekday (0=Sun … 6=Sat) of an instant as seen in `tz`.
const weekdayInTz = (instant, tz) =>
  WD[
    new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(instant)
  ];

// 'YYYY-MM-DD' calendar date of an instant in `tz`.
const dateInTz = (instant, tz) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);

// '6:00 AM' — the instant formatted in `tz`.
const time12InTz = (instant, tz) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant);

// 'HH:mm' (24h) of an instant in `tz`.
const hhmmInTz = (instant, tz) => {
  const p = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(instant)
    .forEach((x) => (p[x.type] = x.value));
  return `${p.hour}:${p.minute}`;
};

// Offset (ms) of `tz` at `instant`: (tz wall-clock as UTC) − instant.
const tzOffsetMs = (instant, tz) => {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = {};
  dtf.formatToParts(instant).forEach((x) => (p[x.type] = x.value));
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUTC - instant.getTime();
};

// The UTC instant for a wall-clock "y-mo-d h:mi" in `tz`.
const wallToInstant = (y, mo, d, h, mi, tz) => {
  const guess = Date.UTC(y, mo - 1, d, h, mi, 0);
  const off = tzOffsetMs(new Date(guess), tz);
  return new Date(guess - off);
};

// 'HH:mm' → '8:00 PM' (the raw entered value, no conversion).
export const hhmmTo12h = (hhmm) => {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (Number.isNaN(h)) return hhmm || "—";
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m || 0).padStart(2, "0")} ${period}`;
};

/**
 * convertPreferredTime — a preferred wall-clock time (HH:mm) entered in
 * `fromTz` → the equivalent time in `toTz` (default Dhaka), for the admin view.
 * Returns { time: '6:00 AM', dayDelta: -1 | 0 | 1 } where dayDelta says whether
 * it lands on the previous/next calendar day.
 */
export const convertPreferredTime = (hhmm, fromTz, toTz = DHAKA_TZ) => {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (Number.isNaN(h) || !fromTz) return null;
  try {
    const [y, mo, d] = dateInTz(new Date(), fromTz).split("-").map(Number);
    const instant = wallToInstant(y, mo, d, h, m, fromTz);
    const fromDate = dateInTz(instant, fromTz);
    const toDate = dateInTz(instant, toTz);
    const dayDelta = toDate > fromDate ? 1 : toDate < fromDate ? -1 : 0;
    return { time: time12InTz(instant, toTz), dayDelta };
  } catch {
    return null;
  }
};

/**
 * convertDhakaSlot — a recurring weekly slot (dayOfWeek 0–6 + 'HH:mm' in Dhaka)
 * → the viewer's local { day: 0–6, time: '9:00 AM' }. Handles the day shift
 * that happens across timezones.
 */
export const convertDhakaSlot = (dayOfWeek, hhmm, targetTz) => {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (Number.isNaN(h)) return null;
  try {
    // Find an instant that is `dayOfWeek` at h:m in Dhaka, then read it in the
    // viewer's timezone.
    for (let i = 0; i < 14; i += 1) {
      const probe = new Date(Date.now() + i * 86400000);
      const [y, mo, d] = dateInTz(probe, DHAKA_TZ).split("-").map(Number);
      const instant = wallToInstant(y, mo, d, h, m, DHAKA_TZ);
      if (weekdayInTz(instant, DHAKA_TZ) === dayOfWeek) {
        return {
          day: weekdayInTz(instant, targetTz),
          time: time12InTz(instant, targetTz),
          hhmm: hhmmInTz(instant, targetTz),
        };
      }
    }
  } catch {
    return null;
  }
  return null;
};
