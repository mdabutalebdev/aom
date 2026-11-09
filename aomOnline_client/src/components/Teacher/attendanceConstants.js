// Shared constants for the teacher Attendance module.

import { FiCheck, FiX, FiClock, FiSun } from "react-icons/fi";
import { toBanglaDigits } from "@/components/Admin/managementConstants";

export { toBanglaDigits };

// Attendance status → label + colour classes + Badge variant.
// `short` is used on narrow screens where the full word won't fit.
export const ATTENDANCE_STATUSES = [
  {
    value: "present",
    label: "Present",
    short: "P",
    icon: FiCheck,
    activeClass: "bg-secondary-600 text-white ring-secondary-600 shadow-soft",
    idleClass:
      "bg-secondary-50 text-secondary-700 ring-secondary-200 hover:bg-secondary-100",
    dot: "bg-secondary-500",
    badge: "success",
  },
  {
    value: "absent",
    label: "Absent",
    short: "A",
    icon: FiX,
    activeClass: "bg-danger text-white ring-danger shadow-soft",
    idleClass: "bg-red-50 text-danger ring-red-200 hover:bg-red-100",
    dot: "bg-danger",
    badge: "danger",
  },
  {
    value: "leave",
    label: "Leave",
    short: "L",
    icon: FiClock,
    activeClass: "bg-accent-500 text-white ring-accent-500 shadow-soft",
    idleClass:
      "bg-accent-50 text-accent-800 ring-accent-200 hover:bg-accent-100",
    dot: "bg-accent-500",
    badge: "warning",
  },
  {
    value: "holiday",
    label: "Holiday",
    short: "H",
    icon: FiSun,
    activeClass: "bg-primary-500 text-white ring-primary-500 shadow-soft",
    idleClass:
      "bg-primary-100 text-primary-600 ring-primary-200 hover:bg-primary-200/70",
    dot: "bg-primary-400",
    badge: "neutral",
  },
];

// status value → its meta object.
export const STATUS_META = ATTENDANCE_STATUSES.reduce((acc, s) => {
  acc[s.value] = s;
  return acc;
}, {});

// Month names (index 0 = January).
export const BANGLA_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Weekday names (index 0 = Sunday, matching JS getDay()).
export const BANGLA_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Date → "YYYY-MM-DD", built from local parts so the calendar day never
// shifts the way toISOString() would.
export const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// "YYYY-MM-DD" → local Date (falls back to today on a malformed key).
export const parseDateKey = (key) => {
  const [y, m, d] = (key || "").split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};

export const todayKey = () => toDateKey(new Date());

// "YYYY-MM-DD" → "20 July 2026, Monday"
export const formatBanglaDate = (key) => {
  const date = parseDateKey(key);
  const day = date.getDate();
  const month = BANGLA_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const weekday = BANGLA_WEEKDAYS[date.getDay()];
  return `${day} ${month} ${year}, ${weekday}`;
};
