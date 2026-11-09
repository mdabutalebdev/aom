// Time helpers for the class timetable.
//
// Slot times are stored as plain 'HH:mm' strings in the teacher's own
// timezone, not as absolute instants — "the 6am class" stays at 6am for that
// teacher regardless of where the server runs or whether DST shifted.

export const DEFAULT_TIMEZONE = 'Asia/Dhaka';

export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (minutes: number): string => {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// The current calendar day and minute-of-day as seen in the given timezone.
// Falls back to the default zone if an invalid IANA name was stored.
export const nowInZone = (
  timeZone: string = DEFAULT_TIMEZONE,
): { dateKey: string; minutes: number } => {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
  } catch {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: DEFAULT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
  }

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  // Some ICU builds render midnight as hour '24' under hour12:false.
  const hour = Number(get('hour')) % 24;

  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: hour * 60 + Number(get('minute')),
  };
};

// Whole years between a birth date and today. Returns null when unknown, so
// the UI can omit the age rather than print a misleading 0.
export const ageFromDateOfBirth = (dob?: Date | null): number | null => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age >= 0 && age < 150 ? age : null;
};
