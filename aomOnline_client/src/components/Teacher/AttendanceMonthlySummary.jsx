"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiBarChart2,
  FiSearch,
} from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

import AdminAvatar from "@/components/Admin/AdminAvatar";
import {
  toBanglaDigits,
  BANGLA_MONTHS,
  ATTENDANCE_STATUSES,
} from "./attendanceConstants";

// Working days = days the student was expected in (present + absent + leave).
// Holidays don't count against attendance, so they're excluded from the rate.
const attendanceRate = (s) => {
  const workingDays = (s.present || 0) + (s.absent || 0) + (s.leave || 0);
  if (!workingDays) return null;
  return Math.round(((s.present || 0) / workingDays) * 100);
};

const rateTone = (rate) => {
  if (rate === null) return "neutral";
  if (rate >= 90) return "success";
  if (rate >= 75) return "warning";
  return "danger";
};

/**
 * AttendanceMonthlySummary — each student's attendance totals for a chosen
 * month: Present / Absent / Leave / Holiday counts, plus an attendance rate.
 * A month+year picker jumps to any month; a search box filters to one student.
 */
const AttendanceMonthlySummary = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/attendance/my-summary?month=${month}&year=${year}`,
        { headers: { ...authHeaders() } },
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data?.data?.students) ? data.data.students : [];
        setRows(list);
      } else {
        setError(data.message || "Failed to load the attendance summary.");
        setRows([]);
      }
    } catch {
      setError("Could not connect to the server.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();
  }, [fetchSummary]);

  const shiftMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  // Don't step past the current month — there's no attendance for the future.
  const isCurrentOrFuture =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);

  const monthOptions = BANGLA_MONTHS.map((m, i) => ({ value: i + 1, label: m }));
  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const y = current - i;
      return { value: y, label: String(y) };
    });
  }, [now]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.studentId || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <div className="space-y-4">
      {/* Month picker + search */}
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={loading}
          aria-label="Previous month"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiChevronLeft className="text-xl" />
        </button>

        <div className="flex items-center gap-2">
          <Select
            options={monthOptions}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            placeholder=""
            className="py-2"
            containerClassName="w-36"
          />
          <Select
            options={yearOptions}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            placeholder=""
            className="py-2"
            containerClassName="w-28"
          />
        </div>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={loading || isCurrentOrFuture}
          aria-label="Next month"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiChevronRight className="text-xl" />
        </button>

        <div className="relative ml-auto w-full sm:w-56">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Legend — what the columns/colors mean */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-xs text-primary-500">
        {ATTENDANCE_STATUSES.map((s) => (
          <span key={s.value} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary-900" />
          Total marked days
        </span>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchSummary()}>
              Retry
            </Button>
          </div>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          <FiBarChart2 className="text-3xl text-primary-300" />
          <p>
            {search.trim()
              ? "No student matches your search."
              : "No attendance recorded for this month."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft md:block">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary-700">
                    Present
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-danger">
                    Absent
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-accent-700">
                    Leave
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-primary-500">
                    Holiday
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Total</th>
                  <th className="px-4 py-3 text-center font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((s) => {
                  const rate = attendanceRate(s);
                  return (
                    <tr
                      key={s.studentId || s._id}
                      className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AdminAvatar name={s.name} size={36} />
                          <div className="min-w-0">
                            <p className="font-medium text-primary-900">{s.name || "—"}</p>
                            <p className="text-xs text-primary-400">{s.studentId || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-secondary-700">
                        {toBanglaDigits(s.present || 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-danger">
                        {toBanglaDigits(s.absent || 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-accent-700">
                        {toBanglaDigits(s.leave || 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-primary-500">
                        {toBanglaDigits(s.holiday || 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-primary-900">
                        {toBanglaDigits(s.total || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rate === null ? (
                          <span className="text-primary-300">—</span>
                        ) : (
                          <Badge variant={rateTone(rate)}>{toBanglaDigits(rate)}%</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filteredRows.map((s) => {
              const rate = attendanceRate(s);
              return (
                <div
                  key={s.studentId || s._id}
                  className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <AdminAvatar name={s.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-primary-900">{s.name || "—"}</p>
                      <p className="text-xs text-primary-400">{s.studentId || "—"}</p>
                    </div>
                    {rate !== null && (
                      <Badge variant={rateTone(rate)}>{toBanglaDigits(rate)}%</Badge>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="rounded-[var(--radius-md)] bg-secondary-50 py-2 ring-1 ring-inset ring-secondary-200">
                      <p className="font-semibold text-secondary-700">
                        {toBanglaDigits(s.present || 0)}
                      </p>
                      <p className="text-[11px] text-secondary-600">Present</p>
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-red-50 py-2 ring-1 ring-inset ring-red-200">
                      <p className="font-semibold text-danger">
                        {toBanglaDigits(s.absent || 0)}
                      </p>
                      <p className="text-[11px] text-danger/80">Absent</p>
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-accent-50 py-2 ring-1 ring-inset ring-accent-200">
                      <p className="font-semibold text-accent-700">
                        {toBanglaDigits(s.leave || 0)}
                      </p>
                      <p className="text-[11px] text-accent-700">Leave</p>
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-primary-50 py-2 ring-1 ring-inset ring-primary-100">
                      <p className="font-semibold text-primary-600">
                        {toBanglaDigits(s.holiday || 0)}
                      </p>
                      <p className="text-[11px] text-primary-500">Holiday</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Refresh */}
      {!loading && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => fetchSummary()} disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceMonthlySummary;
