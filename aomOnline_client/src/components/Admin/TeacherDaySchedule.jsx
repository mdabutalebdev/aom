"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiUsers,
  FiGlobe,
  FiVideo,
  FiMessageCircle,
  FiCheck,
  FiX,
  FiRotateCcw,
  FiPlus,
  FiBell,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import AdminAvatar from "@/components/Admin/AdminAvatar";
import ScheduleFormDialog from "./ScheduleFormDialog";
import {
  SLOT_STATE_META,
  TIMELINE_DOTS,
  formatLongDate,
  formatTime12h,
  shiftDateKey,
  todayKey,
  whatsappLink,
} from "./scheduleConstants";

/**
 * TeacherDaySchedule — one teacher's timetable for a single day.
 *
 * The rows are derived from the recurring weekly template, so nothing is
 * pre-generated; marking a class completed/cancelled/rescheduled writes a
 * dated exception that overrides the template for that day only.
 */
const TeacherDaySchedule = ({ teacherId }) => {
  const [date, setDate] = useState(todayKey());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchDay = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(
        `/schedules/day?teacherId=${teacherId}&date=${date}`,
      );
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load the schedule.");
    } finally {
      setLoading(false);
    }
  }, [teacherId, date]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDay();
  }, [fetchDay]);

  const mark = async (row, status) => {
    setBusyId(row.scheduleId);
    try {
      await apiClient.patch("/schedules/session", {
        scheduleId: row.scheduleId,
        date,
        status,
      });
      toast.success(`${row.studentName}'s class marked ${status}.`);
      await fetchDay();
    } catch (err) {
      toast.error(err.message || "Could not update this class.");
    } finally {
      setBusyId(null);
    }
  };

  const clearMark = async (row) => {
    if (!row.sessionId) return;
    setBusyId(row.scheduleId);
    try {
      await apiClient.delete(`/schedules/session/${row.sessionId}`);
      toast.success("Class status cleared.");
      await fetchDay();
    } catch (err) {
      toast.error(err.message || "Could not clear this status.");
    } finally {
      setBusyId(null);
    }
  };

  const removeSlot = async (row) => {
    setBusyId(row.scheduleId);
    try {
      await apiClient.delete(`/schedules/${row.scheduleId}`);
      toast.success("Class slot removed from the weekly schedule.");
      await fetchDay();
    } catch (err) {
      toast.error(err.message || "Could not remove this slot.");
    } finally {
      setBusyId(null);
    }
  };

  const teacher = data?.teacher;
  const rows = data?.rows ?? [];
  const wa = whatsappLink(teacher?.phone);

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/admin/upcoming-class"
        className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
      >
        <FiArrowLeft /> All teachers
      </Link>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      )}

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchDay}>
            Retry
          </Button>
        </div>
      )}

      {teacher && !error && (
        <>
          {/* Teacher header */}
          <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <AdminAvatar src={teacher.photo} name={teacher.name} size={64} />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-primary-900">
                    {teacher.name}
                  </h2>
                  <p className="truncate text-sm text-primary-500">
                    {teacher.designation || teacher.subject || teacher.teacherId}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                    {[
                      {
                        icon: FiUsers,
                        label: "Total Students",
                        value: teacher.studentCount,
                      },
                      {
                        icon: FiCalendar,
                        label: "Today's Classes",
                        value: data.todayClassCount,
                      },
                      {
                        icon: FiGlobe,
                        label: "Timezone",
                        value: teacher.timezone,
                      },
                    ].map((s) => {
                      const Icon = s.icon;
                      return (
                        <span key={s.label} className="flex items-center gap-2">
                          <Icon className="shrink-0 text-primary-400" />
                          <span className="leading-tight">
                            <span className="block text-[11px] text-primary-400">
                              {s.label}
                            </span>
                            <span className="block text-sm font-semibold text-primary-800">
                              {s.value}
                            </span>
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {teacher.zoomLink ? (
                  <a href={teacher.zoomLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" fullWidth className="whitespace-nowrap">
                      <FiVideo /> Join Zoom Room
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="whitespace-nowrap"
                    title="No meeting room saved for this teacher"
                  >
                    <FiVideo /> No Zoom Room
                  </Button>
                )}
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" fullWidth className="whitespace-nowrap">
                      <FiMessageCircle /> Message on WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Day picker */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-primary-900">
              {data.isToday ? "Today's Schedule" : "Schedule"}
              <span className="ml-1.5 text-sm font-normal text-primary-400">
                ({formatLongDate(data.date)})
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
                <FiPlus /> Add Class
              </Button>
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="rounded-[var(--radius-md)] border border-primary-200 bg-surface px-3 py-1.5 text-sm text-primary-800 outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              />
              <button
                type="button"
                onClick={() => setDate((d) => shiftDateKey(d, -1))}
                aria-label="Previous day"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 text-primary-500 transition-colors hover:bg-primary-50"
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => setDate((d) => shiftDateKey(d, 1))}
                aria-label="Next day"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 text-primary-500 transition-colors hover:bg-primary-50"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Timeline */}
          {rows.length === 0 ? (
            <div className="rounded-[var(--radius-2xl)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
              No classes scheduled for this day.
            </div>
          ) : (
            <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-4 shadow-soft sm:p-5">
              <ul className="relative">
                {/* The rail the dots sit on. Inset top/bottom so it starts and
                    ends at the first/last dot rather than floating past them. */}
                <span
                  aria-hidden="true"
                  className="absolute left-[5px] top-6 bottom-6 w-px bg-primary-100"
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
                        className={`absolute left-0 top-6 h-2.5 w-2.5 rounded-full ring-4 ring-[var(--color-surface)] ${dot} ${
                          isLive ? "animate-pulse" : ""
                        }`}
                      />

                      <div
                        className={`mb-2 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[var(--radius-lg)] border px-3 py-3 transition-colors sm:px-4 ${
                          isLive
                            ? "border-secondary-200 bg-secondary-50/50"
                            : "border-primary-100/70 bg-surface hover:bg-primary-50/30"
                        } ${isCancelled ? "opacity-60" : ""}`}
                      >
                        {/* Time */}
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

                        {/* Student + subject */}
                        <div className="flex min-w-0 flex-[2] items-center gap-2.5">
                          <AdminAvatar
                            src={r.studentPhoto}
                            name={r.studentName}
                            size={40}
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

                        {/* Parent */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-primary-400">Parent</p>
                          <p className="truncate text-sm text-primary-700">
                            {r.guardianName || "—"}
                          </p>
                        </div>

                        {/* Status + actions */}
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

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              disabled={busyId === r.scheduleId}
                              aria-label="Class options"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
                            >
                              <FiMoreVertical />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => mark(r, "completed")}>
                              <FiCheck /> Mark completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => mark(r, "cancelled")}>
                              <FiX /> Cancel this day
                            </DropdownMenuItem>
                            {r.sessionId && (
                              <DropdownMenuItem onClick={() => clearMark(r)}>
                                <FiRotateCcw /> Clear status
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setEditTarget(r);
                                setFormOpen(true);
                              }}
                            >
                              <FiEdit3 /> Edit weekly slot
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => removeSlot(r)}
                            >
                              <FiTrash2 /> Remove slot
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="flex items-start gap-2 rounded-[var(--radius-lg)] border border-secondary-100 bg-secondary-50/50 px-4 py-3 text-sm text-secondary-800">
            <FiBell className="mt-0.5 shrink-0 text-secondary-600" />
            <span>
              Times are shown in {teacher.timezone}.{" "}
              <span className="text-secondary-700">
                &ldquo;Ended&rdquo; means the slot&apos;s time has passed without
                anyone confirming the class ran — mark it completed to record
                that it did.
              </span>
            </span>
          </p>
        </>
      )}

      <ScheduleFormDialog
        open={formOpen}
        teacherId={teacherId}
        schedule={editTarget}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSaved={fetchDay}
      />
    </div>
  );
};

export default TeacherDaySchedule;
