"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  FiUsers,
  FiClock,
  FiCheckSquare,
  FiDollarSign,
  FiTrendingUp,
  FiFolder,
  FiArrowRight,
  FiVideo,
  FiCalendar,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AdminAvatar from "@/components/Admin/AdminAvatar";
import { DonutChart } from "@/components/Admin/DashboardCharts";
import { formatTaka } from "@/components/Admin/managementConstants";
import {
  SLOT_STATE_META,
  formatTime12h,
  todayKey,
} from "@/components/Admin/scheduleConstants";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/teacher/upcoming-class",
    icon: FiClock,
    title: "Upcoming Class",
    desc: "See your full timetable",
  },
  {
    href: "/dashboard/teacher/attendance",
    icon: FiCheckSquare,
    title: "Attendance",
    desc: "Mark today's attendance",
  },
  {
    href: "/dashboard/teacher/progress",
    icon: FiTrendingUp,
    title: "Progress",
    desc: "Update student progress",
  },
  {
    href: "/dashboard/teacher/resources",
    icon: FiFolder,
    title: "Resources",
    desc: "Share study materials",
  },
];

const longDate = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const StatCard = ({ icon: Icon, label, value, sub, tone }) => (
  <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-4 shadow-soft">
    <div className="flex items-center gap-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}
      >
        <Icon className="text-lg" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-primary-400">{label}</p>
        <p className="truncate text-xl font-bold tabular-nums text-primary-900">
          {value}
        </p>
        {sub && <p className="truncate text-xs text-primary-400">{sub}</p>}
      </div>
    </div>
  </div>
);

const Panel = ({ title, action, children, className = "" }) => (
  <div
    className={`rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-4 shadow-soft ${className}`}
  >
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="font-semibold text-primary-900">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

/**
 * TeacherDashboard — the teacher's overview screen.
 *
 * Each panel fetches independently and fails independently: a teacher whose
 * profile isn't linked yet still gets a working progress/attendance view
 * instead of one failed request blanking the whole page.
 */
const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [payments, setPayments] = useState(null);
  const [progress, setProgress] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const today = todayKey();

    // allSettled: one 404 (e.g. no Teacher profile yet) must not blank the rest.
    const [p, pr, at, sc] = await Promise.allSettled([
      apiClient.get("/payments/my-students"),
      apiClient.get("/progress/my-students"),
      apiClient.get(`/attendance/my-students?date=${today}`),
      apiClient.get("/schedules/my-day"),
    ]);

    setPayments(p.status === "fulfilled" ? p.value.data : null);
    setProgress(pr.status === "fulfilled" ? pr.value.data : null);
    setAttendance(at.status === "fulfilled" ? at.value.data : null);
    setSchedule(sc.status === "fulfilled" ? sc.value.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading your dashboard...</p>
      </div>
    );
  }

  const students = progress?.students ?? [];
  const studentCount = payments?.teacher?.studentCount ?? students.length;

  const avgProgress = students.length
    ? Math.round(
        students.reduce((sum, s) => sum + (Number(s.percentage) || 0), 0) /
          students.length,
      )
    : 0;

  // Today's attendance — the roster carries each student's current status.
  const attendanceRows = attendance?.students ?? [];
  const markedToday = attendanceRows.filter((s) => s.status).length;
  const presentToday = attendanceRows.filter((s) => s.status === "present").length;

  const scheduleRows = schedule?.rows ?? [];
  const nextClass = scheduleRows.find((r) => r.state === "upcoming");

  const paidCount = payments?.stats?.totalPaid ?? 0;

  const attendanceSegments = [
    {
      label: "Present",
      value: presentToday,
      color: "var(--color-secondary-500)",
    },
    {
      label: "Other",
      value: Math.max(0, markedToday - presentToday),
      color: "var(--color-accent-400)",
    },
    {
      label: "Not marked",
      value: Math.max(0, attendanceRows.length - markedToday),
      color: "var(--color-primary-200)",
    },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <AdminAvatar src={user?.photo} name={user?.name} size={52} />
          <div>
            <h2 className="text-xl font-semibold text-primary-900">
              Welcome, {user?.name || "Teacher"}
            </h2>
            <p className="text-sm text-primary-500">{longDate()}</p>
          </div>
        </div>
        <Badge variant="primary">Teacher</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={FiUsers}
          label="My Students"
          value={studentCount}
          sub={`${paidCount} paid this month`}
          tone="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={FiCalendar}
          label="Today's Classes"
          value={scheduleRows.length}
          sub={
            nextClass
              ? `Next ${formatTime12h(nextClass.startTime)}`
              : "Nothing left today"
          }
          tone="bg-accent-50 text-accent-600"
        />
        <StatCard
          icon={FiCheckSquare}
          label="Attendance Today"
          value={`${markedToday}/${attendanceRows.length}`}
          sub={markedToday === 0 ? "Not marked yet" : `${presentToday} present`}
          tone="bg-secondary-50 text-secondary-600"
        />
        <StatCard
          icon={FiDollarSign}
          label="Next Month Salary"
          value={formatTaka(payments?.teacher?.nextMonthSalary)}
          sub="Your payout"
          tone="bg-primary-50 text-primary-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Progress */}
        <Panel
          className="lg:col-span-2"
          title="Student Progress"
          action={
            <Link
              href="/dashboard/teacher/progress"
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Manage →
            </Link>
          }
        >
          {students.length === 0 ? (
            <p className="py-10 text-center text-sm text-primary-400">
              No students assigned yet.
            </p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-4 rounded-[var(--radius-lg)] bg-primary-50/50 p-3">
                <div className="text-center">
                  <p className="text-2xl font-bold tabular-nums text-primary-900">
                    {avgProgress}%
                  </p>
                  <p className="text-xs text-primary-400">Average</p>
                </div>
                <div className="h-10 w-px bg-primary-100" />
                <div className="grid flex-1 grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-base font-semibold tabular-nums text-secondary-600">
                      {students.filter((s) => s.percentage >= 100).length}
                    </p>
                    <p className="text-primary-400">Completed</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold tabular-nums text-accent-600">
                      {
                        students.filter(
                          (s) => s.percentage > 0 && s.percentage < 100,
                        ).length
                      }
                    </p>
                    <p className="text-primary-400">In progress</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold tabular-nums text-primary-400">
                      {students.filter((s) => !s.percentage).length}
                    </p>
                    <p className="text-primary-400">Not started</p>
                  </div>
                </div>
              </div>

              {/* Per-student bars — sorted so whoever needs attention is on top */}
              <ul className="space-y-2.5">
                {[...students]
                  .sort((a, b) => (a.percentage || 0) - (b.percentage || 0))
                  .slice(0, 6)
                  .map((s) => (
                    <li key={s._id} className="flex items-center gap-3">
                      <AdminAvatar src={s.photo} name={s.name} size={30} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-medium text-primary-900">
                            {s.name}
                          </p>
                          <span className="shrink-0 text-xs tabular-nums text-primary-500">
                            {s.percentage || 0}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-primary-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              s.percentage >= 100
                                ? "bg-secondary-500"
                                : "bg-primary-500"
                            }`}
                            style={{ width: `${Math.min(100, s.percentage || 0)}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
              {students.length > 6 && (
                <p className="mt-3 text-center text-xs text-primary-400">
                  +{students.length - 6} more student
                  {students.length - 6 === 1 ? "" : "s"}
                </p>
              )}
            </>
          )}
        </Panel>

        {/* Attendance donut */}
        <Panel
          title="Today's Attendance"
          action={
            <Link
              href="/dashboard/teacher/attendance"
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Mark →
            </Link>
          }
        >
          {attendanceRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-primary-400">
              No students to mark.
            </p>
          ) : attendanceSegments.length === 0 ? (
            <p className="py-10 text-center text-sm text-primary-400">
              Nothing marked yet today.
            </p>
          ) : (
            <DonutChart segments={attendanceSegments} centerLabel="Students" />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's classes — first UI for GET /schedules/my-day */}
        <Panel className="lg:col-span-2" title="Today's Classes">
          {scheduleRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-primary-400">
              No classes scheduled for today.
            </p>
          ) : (
            <ul className="divide-y divide-primary-50">
              {scheduleRows.map((r) => {
                const meta =
                  SLOT_STATE_META[r.state] ?? SLOT_STATE_META.upcoming;
                return (
                  <li
                    key={r.scheduleId}
                    className="flex flex-wrap items-center gap-3 py-2.5"
                  >
                    <div className="w-[76px] shrink-0">
                      <p className="text-sm font-semibold tabular-nums text-primary-900">
                        {formatTime12h(r.startTime)}
                      </p>
                      <p className="text-xs text-primary-400">
                        {r.durationMinutes} min
                      </p>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <AdminAvatar
                        src={r.studentPhoto}
                        name={r.studentName}
                        size={32}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary-900">
                          {r.studentName}
                        </p>
                        {r.subject && (
                          <p className="truncate text-xs text-primary-400">
                            {r.subject}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    {r.meetingLink && r.state !== "cancelled" && (
                      <a
                        href={r.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          <FiVideo /> Join
                        </Button>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Quick actions */}
        <div className="space-y-4">
          <Panel title="Quick Actions">
            <div className="space-y-1.5">
              {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-3 rounded-[var(--radius-lg)] px-2.5 py-2 transition-colors hover:bg-primary-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-50 text-primary-600">
                      <Icon />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary-900">
                        {a.title}
                      </p>
                      <p className="truncate text-xs text-primary-400">{a.desc}</p>
                    </div>
                    <FiArrowRight className="shrink-0 text-primary-300" />
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
