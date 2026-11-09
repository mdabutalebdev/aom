"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiUsers,
  FiCalendar,
  FiClock,
  FiRadio,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import AdminAvatar from "@/components/Admin/AdminAvatar";
import { formatTime12h, todayKey } from "./scheduleConstants";

const PAGE_SIZE = 8;

// 'in 15 minutes' / 'in 2h 10m' / 'starting now'. Null when nothing is next.
const untilLabel = (minutes) => {
  if (minutes === null || minutes === undefined) return "No class left today";
  if (minutes <= 0) return "Starting now";
  if (minutes < 60) return `In ${minutes} minute${minutes === 1 ? "" : "s"}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `In ${h}h${m ? ` ${m}m` : ""}`;
};

const todayLabel = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

/**
 * UpcomingClassTeachers — the Upcoming Class index.
 * Madrasa-wide stat cards on top, then every teacher as a table row with
 * their class count and next class. Clicking a row opens that teacher's
 * full day timetable.
 */
const UpcomingClassTeachers = () => {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ date: todayKey() });
      if (search.trim()) params.set("search", search.trim());
      const res = await apiClient.get(`/schedules/teachers?${params}`);
      setRows(Array.isArray(res.data) ? res.data : []);
      setSummary(res.summary ?? null);
    } catch (err) {
      setError(err.message || "Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeachers();
  }, [fetchTeachers]);

  // A narrowed search can leave the current page past the end of the results.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  const statCards = [
    {
      key: "teachers",
      label: "Total Teachers",
      value: summary?.totalTeachers ?? 0,
      sub: `${summary?.activeTeachers ?? 0} active`,
      icon: FiUsers,
      tone: "bg-primary-50 text-primary-600",
    },
    {
      key: "classes",
      label: "Today's Classes",
      value: summary?.todayClasses ?? 0,
      sub: "All teachers",
      icon: FiCalendar,
      tone: "bg-secondary-50 text-secondary-600",
    },
    {
      key: "next",
      label: "Next Class",
      value: summary?.nextClassTime ? formatTime12h(summary.nextClassTime) : "—",
      sub: untilLabel(summary?.nextClassInMinutes),
      icon: FiClock,
      tone: "bg-accent-50 text-accent-600",
    },
    {
      key: "live",
      label: "Live Classes",
      value: summary?.liveClasses ?? 0,
      sub: "Right now",
      icon: FiRadio,
      tone: "bg-red-50 text-danger",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-50 text-primary-600">
            <FiCalendar className="text-xl" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-primary-900">
              Upcoming Classes
            </h2>
            <p className="text-sm text-primary-500">
              View all upcoming classes of all teachers
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-3.5 py-2 text-sm font-medium text-primary-700">
          <FiCalendar className="text-primary-400" />
          {todayLabel()}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft"
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${c.tone}`}
                >
                  <Icon className="text-xl" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-primary-400">{c.label}</p>
                  <p className="truncate text-2xl font-bold tabular-nums text-primary-900">
                    {loading ? "—" : c.value}
                  </p>
                  <p className="truncate text-xs text-primary-400">{c.sub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher table */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-auto">
            <h3 className="font-semibold text-primary-900">All Teachers</h3>
            <p className="text-xs text-primary-400">
              Click any teacher to view their upcoming classes
            </p>
          </div>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teacher..."
              className="w-56 pl-9"
            />
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Spinner size="lg" />
            <p className="animate-pulse text-primary-500">Loading...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchTeachers}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
            No teachers found.
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                    <th className="w-10 px-4 py-3.5 font-medium">#</th>
                    <th className="px-4 py-3.5 font-medium whitespace-nowrap">
                      Teacher
                    </th>
                    <th className="px-4 py-3.5 font-medium whitespace-nowrap">
                      Designation
                    </th>
                    <th className="px-4 py-3.5 text-center font-medium whitespace-nowrap">
                      Students
                    </th>
                    <th className="px-4 py-3.5 text-center font-medium whitespace-nowrap">
                      Today&apos;s Classes
                    </th>
                    <th className="px-4 py-3.5 font-medium whitespace-nowrap">
                      Next Class
                    </th>
                    <th className="px-4 py-3.5 text-center font-medium whitespace-nowrap">
                      Status
                    </th>
                    <th className="w-12 px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((t, i) => (
                    <tr
                      key={t._id}
                      tabIndex={0}
                      role="link"
                      aria-label={`View ${t.name}'s schedule`}
                      onClick={() =>
                        router.push(`/dashboard/admin/upcoming-class/${t._id}`)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/dashboard/admin/upcoming-class/${t._id}`);
                        }
                      }}
                      className="group cursor-pointer border-b border-primary-50 outline-none transition-colors last:border-0 hover:bg-primary-50/40 focus-visible:bg-primary-50/40"
                    >
                      <td className="px-4 py-3.5 text-primary-400">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="max-w-[220px] px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <AdminAvatar src={t.photo} name={t.name} size={38} />
                          <div className="min-w-0">
                            <p
                              className="truncate font-medium text-primary-900"
                              title={t.name}
                            >
                              {t.name}
                            </p>
                            <p className="truncate text-xs text-primary-400">
                              {t.teacherId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[150px] px-4 py-3.5">
                        <span className="block truncate text-primary-700">
                          {t.designation || t.subject || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center tabular-nums text-primary-700">
                        {t.studentCount}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-primary-50 px-2 py-0.5 font-semibold tabular-nums text-primary-700">
                          {t.dayClassCount}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {t.nextClassTime ? (
                          <div>
                            <p className="font-semibold tabular-nums text-primary-900">
                              {formatTime12h(t.nextClassTime)}
                            </p>
                            <p className="text-xs text-primary-400">
                              {untilLabel(t.nextClassInMinutes)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-primary-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {t.liveCount > 0 ? (
                          <Badge variant="danger">{t.liveCount} live</Badge>
                        ) : t.dayClassCount > 0 ? (
                          <Badge variant="success">
                            {t.dayClassCount} today
                          </Badge>
                        ) : (
                          <Badge variant="neutral">No class</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <FiChevronRight className="inline text-primary-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-primary-100 bg-primary-50/30 px-4 py-2.5 text-xs text-primary-400">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(page * PAGE_SIZE, rows.length)} of {rows.length}{" "}
                {rows.length === 1 ? "teacher" : "teachers"}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary-200 text-primary-500 transition-colors hover:bg-primary-50 disabled:opacity-40"
                  >
                    <FiChevronLeft />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={p === page ? "page" : undefined}
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors ${
                        p === page
                          ? "border-primary-500 bg-primary-500 text-white"
                          : "border-primary-200 text-primary-600 hover:bg-primary-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary-200 text-primary-500 transition-colors hover:bg-primary-50 disabled:opacity-40"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingClassTeachers;
