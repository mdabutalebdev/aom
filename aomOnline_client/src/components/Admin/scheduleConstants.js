// Shared constants for the Upcoming Class / timetable module.

// 0 = Sunday … 6 = Saturday — matches Date.getUTCDay() and the server.
export const WEEKDAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export const weekdayShort = (value) =>
  WEEKDAYS.find((d) => d.value === value)?.short ?? "";

// Slot state -> label + Badge variant.
// 'ended' is deliberately distinct from 'completed': the class time has passed
// but nobody confirmed it ran, so it must not be shown as done.
export const SLOT_STATE_META = {
  completed: { label: "Completed", variant: "success" },
  ongoing: { label: "Ongoing", variant: "warning" },
  upcoming: { label: "Upcoming", variant: "primary" },
  ended: { label: "Ended", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

// Dot colours cycled down the timeline, purely decorative.
export const TIMELINE_DOTS = [
  "bg-secondary-500",
  "bg-primary-500",
  "bg-accent-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-sky-500",
];

// '14:30' -> '02:30 PM'
export const formatTime12h = (time) => {
  if (!time) return "—";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  if (!Number.isFinite(h)) return time;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${mStr} ${suffix}`;
};

// 'YYYY-MM-DD' -> '18 July 2026'
export const formatLongDate = (dateKey) => {
  if (!dateKey) return "";
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

// Shift a 'YYYY-MM-DD' key by whole days, staying in UTC so the calendar day
// never drifts across timezones.
export const shiftDateKey = (dateKey, days) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

// Digits only, so a stored '+880 17...' still produces a usable wa.me link.
export const whatsappLink = (phone) => {
  const digits = String(phone ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};
