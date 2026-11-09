"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiUsers,
  FiVideo,
  FiInfo,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AdminAvatar from "@/components/Admin/AdminAvatar";
import {
  SLOT_STATE_META,
  TIMELINE_DOTS,
  formatLongDate,
  formatTime12h,
  shiftDateKey,
  todayKey,
} from "@/components/Admin/scheduleConstants";

/**
 * TeacherUpcomingClass — the teacher's read-only class timetable.
 *
 * Schedules are owned by the admin: this screen shows what they set up and
 * nothing more. There is deliberately no add/edit/cancel here — a teacher
 * asking for a change goes through the admin, so the timetable stays a single
 * source of truth.
 */
const TeacherUpcomingClass = () => {
  const [date, setDate] = useState(todayKey());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDay = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/schedules/my-day?date=${date}`);
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load your schedule.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDay();
  }, [fetchDay]);

  const rows = data?.rows ?? [];
  const teacher = data?.teacher;
  const isToday = date === todayKey();

  const upcomingCount = rows.filter(
    (r) => r.state === "upcoming" || r.state === "ongoing",
  ).length;

  const stats = [
    { icon: FiCalendar, label: "Classes", value: rows.length },
    {
      icon: FiClock,
      label: isToday ? "Still to come" : "Scheduled",
      value: isToday ? upcomingCount : rows.length,
    },
    { icon: FiUsers, label: "My Students", value: teacher?.studentCount ?? 0 },
  ];

  return (
    <div className="space-y-3">
      {/* Day picker + counts in one card — three separate blocks pushed the
          timetable itself below the fold on a laptop. */}
      <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div>
            <p className="font-semibold text-primary-900">
              {isToday ? "Today's Classes" : "Classes"}
            </p>
            <p className="text-xs text-primary-400">{formatLongDate(date)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDate((d) => shiftDateKey(d, -1))}
              aria-label="Previous day"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50"
            >
              <FiChevronLeft />
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              aria-label="Pick a date"
              className="rounded-[var(--radius-md)] border border-primary-200 bg-surface px-2.5 py-1.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            <button
              type="button"
              onClick={() => setDate((d) => shiftDateKey(d, 1))}
              aria-label="Next day"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50"
            >
              <FiChevronRight />
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={() => setDate(todayKey())}
                className="whitespace-nowrap rounded-[var(--radius-md)] px-2 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
              >
                Today
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-primary-50 bg-primary-50/30 px-4 py-2">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 text-sm text-primary-500"
              >
                <Icon className="text-primary-400" />
                {s.label}
                <span className="font-semibold tabular-nums text-primary-900">
                  {loading ? "—" : s.value}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-2 py-10">
          <Spinner size="lg" />
          <p className="animate-pulse text-sm text-primary-500">Loading...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-6 text-center text-danger">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchDay}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-10 text-center text-sm text-primary-500">
          <FiCalendar className="text-2xl text-primary-300" />
          <p>No classes scheduled for this day.</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && rows.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-primary-100/60 bg-surface p-3 shadow-soft">
          <ul className="relative">
            <span
              aria-hidden="true"
              className="absolute left-[5px] top-5 bottom-5 w-px bg-primary-100"
            />
            {rows.map((r, i) => {
              const meta = SLOT_STATE_META[r.state] ?? SLOT_STATE_META.upcoming;
              const dot = TIMELINE_DOTS[i % TIMELINE_DOTS.length];
              const isCancelled = r.state === "cancelled";
              const isLive = r.state === "ongoing";

              return (
                <li key={r.scheduleId} className="relative pl-6">
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-5 h-2.5 w-2.5 rounded-full ring-4 ring-[var(--color-surface)] ${dot} ${
                      isLive ? "animate-pulse" : ""
                    }`}
                  />
                  <div
                    className={`mb-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--radius-lg)] border px-3 py-2.5 sm:px-3.5 ${
                      isLive
                        ? "border-secondary-200 bg-secondary-50/50"
                        : "border-primary-100/70 bg-surface"
                    } ${isCancelled ? "opacity-60" : ""}`}
                  >
                    <div className="w-[86px] shrink-0">
                      <p
                        className={`font-semibold tabular-nums ${
                          isCancelled
                            ? "text-primary-400 line-through"
                            : "text-primary-900"
                        }`}
                      >
                        {formatTime12h(r.startTime)}
                      </p>
                      <p className="text-xs text-primary-400">
                        {r.durationMinutes} min
                        {r.isRescheduled && " · moved"}
                      </p>
                    </div>

                    <div className="flex min-w-0 flex-[2] items-center gap-2.5">
                      <AdminAvatar
                        src={r.studentPhoto}
                        name={r.studentName}
                        size={38}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-primary-900">
                          {r.studentName}
                        </p>
                        <p className="truncate text-xs text-primary-400">
                          {r.studentAge !== null
                            ? `Age ${r.studentAge} Years`
                            : "Age not set"}
                        </p>
                        {r.subject && (
                          <p className="truncate text-xs text-primary-500">
                            {r.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      {r.meetingLink && !isCancelled && (
                        <a
                          href={r.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant={isLive ? "secondary" : "primary"}
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <FiVideo /> Join Zoom
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {teacher && (
        <p className="flex items-start gap-2 rounded-[var(--radius-lg)] bg-primary-50/50 px-3.5 py-2 text-xs text-primary-500">
          <FiInfo className="mt-0.5 shrink-0 text-primary-400" />
          Times are shown in {teacher.timezone}. This timetable is set by the
          Super Admin — contact them if a class needs to be changed.
        </p>
      )}
    </div>
  );
};

export default TeacherUpcomingClass;
