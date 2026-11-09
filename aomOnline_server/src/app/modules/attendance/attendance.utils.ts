// Date helpers for attendance — everything is anchored to UTC so a given
// calendar day maps to exactly one stored Date regardless of server timezone.

// Normalize any Date/parsable-string to start-of-day UTC (00:00:00.000Z).
// Accepts 'YYYY-MM-DD' (parsed as that UTC calendar day) or a full Date.
export const normalizeToStartOfDayUTC = (input?: string | Date): Date => {
  let d: Date;
  if (input === undefined) {
    d = new Date();
  } else if (input instanceof Date) {
    d = input;
  } else {
    // 'YYYY-MM-DD' → build the UTC day explicitly to avoid TZ drift.
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
    if (match) {
      const [, y, m, day] = match;
      return new Date(Date.UTC(Number(y), Number(m) - 1, Number(day)));
    }
    d = new Date(input);
  }
  if (Number.isNaN(d.getTime())) {
    throw Object.assign(new Error('Invalid date'), { status: 400 });
  }
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

// Format a Date as a 'YYYY-MM-DD' string in UTC.
export const formatDateUTC = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

// Resolve the effective month (1-12) / year, defaulting to the current UTC date.
export const resolveMonthYear = (
  month?: number,
  year?: number,
): { month: number; year: number } => {
  const now = new Date();
  return {
    month: month ?? now.getUTCMonth() + 1, // getUTCMonth() is 0-based
    year: year ?? now.getUTCFullYear(),
  };
};

// Inclusive-start / exclusive-end UTC range covering a whole month.
// Use as: date >= start && date < end.
export const monthRangeUTC = (
  month: number,
  year: number,
): { start: Date; end: Date } => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1)); // first day of next month
  return { start, end };
};
