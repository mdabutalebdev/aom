"use client";

import React, { useCallback, useState } from "react";
import { FiPrinter, FiSearch } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

import { formatTaka, toBanglaDigits } from "./managementConstants";

// Report type options.
const REPORT_TYPES = [
  { value: "salary", label: "Salary" },
  { value: "payment", label: "Payment" },
  { value: "attendance", label: "Attendance" },
  { value: "progress", label: "Progress" },
];

const REPORT_TYPE_LABEL = REPORT_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {}
);

// Month options (1-12).
const MONTHS = [
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
const MONTH_OPTIONS = MONTHS.map((label, i) => ({
  value: String(i + 1),
  label,
}));

// Year options (current and past 5 years).
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: toBanglaDigits(y) };
});

// row/totals common keys -> English column headers.
const COLUMN_LABELS = {
  name: "Name",
  teacherName: "Teacher Name",
  studentName: "Student Name",
  teacherId: "Teacher ID",
  studentId: "Student ID",
  className: "Class",
  subject: "Subject",
  phone: "Phone",
  studentCount: "Students",
  ratePerStudent: "Rate/Student",
  salary: "Salary",
  amount: "Amount",
  monthlyFee: "Monthly Fee",
  paid: "Paid",
  due: "Due",
  status: "Status",
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  holiday: "Holiday",
  total: "Total",
  percentage: "Percentage",
  progress: "Progress",
  completedLevels: "Completed Levels",
  currentLevel: "Current Level",
  month: "Month",
  year: "Year",
};

// Which keys should be formatted as money.
const MONEY_KEYS = new Set([
  "salary",
  "amount",
  "monthlyFee",
  "paid",
  "due",
  "ratePerStudent",
  "totalCollected",
  "totalDue",
  "totalSalary",
]);

// Which keys are percentage.
const PERCENT_KEYS = new Set(["percentage", "progress", "avgPercentage"]);

// Payment status -> English.
const humanizeStatus = (v) => {
  const map = {
    paid: "Paid",
    unpaid: "Unpaid",
    pending: "Pending",
    partial: "Partial",
  };
  return map[v] || v;
};

// Format a cell value.
const formatCell = (key, value) => {
  if (value == null || value === "") return "—";
  if (key === "status") return humanizeStatus(value);
  if (MONEY_KEYS.has(key)) return formatTaka(value);
  if (PERCENT_KEYS.has(key))
    return `${toBanglaDigits(Math.round(Number(value) || 0))}%`;
  if (typeof value === "number") return toBanglaDigits(value);
  // If number-like string.
  if (/^\d+$/.test(String(value))) return toBanglaDigits(value);
  return String(value);
};

/**
 * ReportsManager — Report generator.
 * Type + month/year selection -> GET /analytics/report?type=&month=&year=;
 * rows table + totals row; print/PDF via window.print().
 * Only report area is visible in print (@media print).
 */
const ReportsManager = () => {
  const now = new Date();
  const [type, setType] = useState("salary");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const generate = useCallback(
    async (e) => {
      e?.preventDefault();
      setLoading(true);
      setError("");
      setTouched(true);
      try {
        const params = new URLSearchParams({ type, month, year });
        const res = await fetch(
          `${API_BASE_URL}/analytics/report?${params.toString()}`,
          { headers: { ...authHeaders() } }
        );
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setReport(body.data || { type, month, year, rows: [], totals: {} });
        } else {
          setError(body.message || "Failed to generate report.");
          setReport(null);
        }
      } catch {
        setError("Could not connect to server.");
        setReport(null);
      } finally {
        setLoading(false);
      }
    },
    [type, month, year]
  );

  const rows = Array.isArray(report?.rows) ? report.rows : [];
  const totals = report?.totals || {};

  // Extract column keys from rows (following order of first row).
  const columns = rows.length > 0 ? Object.keys(rows[0]).filter((k) => k !== "_id") : [];

  const selectedMonthLabel = MONTHS[Number(month) - 1] || "";

  return (
    <div>
      {/* Controls (Hidden in print) */}
      <form
        onSubmit={generate}
        className="no-print mb-6 rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            id="report-type"
            label="Report Type"
            options={REPORT_TYPES}
            placeholder=""
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <Select
            id="report-month"
            label="Month"
            options={MONTH_OPTIONS}
            placeholder=""
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <Select
            id="report-year"
            label="Year"
            options={YEAR_OPTIONS}
            placeholder=""
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
            >
              <FiSearch className="mr-1.5" />
              Generate Report
            </Button>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="no-print rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={generate}>
              Try again
            </Button>
          </div>
        </div>
      ) : !touched ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          Select type and month/year to generate report.
        </div>
      ) : (
        <div id="report-print-area" className="space-y-4">
          {/* Report Header (Visible in print) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary-900">
                {REPORT_TYPE_LABEL[type]} Report
              </h2>
              <p className="text-sm text-primary-500">
                {selectedMonthLabel} {toBanglaDigits(year)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="no-print"
            >
              <FiPrinter className="mr-1.5" />
              Print / PDF
            </Button>
          </div>

          {/* Print Title (Visible only in print) */}
          <div className="print-only mb-2 text-center">
            <p className="text-lg font-bold">AOM Online Madrasa</p>
            <p className="text-sm">
              {REPORT_TYPE_LABEL[type]} Report — {selectedMonthLabel}{" "}
              {toBanglaDigits(year)}
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
              No data found for this period.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface shadow-soft">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-primary-100 bg-primary-50/60 text-left text-primary-700">
                    <th className="px-4 py-3 font-semibold">Sl.</th>
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-3 font-semibold">
                        {COLUMN_LABELS[col] || col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row._id || i}
                      className="border-b border-primary-50 text-primary-800"
                    >
                      <td className="px-4 py-2.5 text-primary-500">
                        {toBanglaDigits(i + 1)}
                      </td>
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2.5">
                          {formatCell(col, row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {/* Totals row */}
                {Object.keys(totals).length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-primary-200 bg-primary-50/60 font-semibold text-primary-900">
                      <td className="px-4 py-3" colSpan={1}>
                        Total
                      </td>
                      {columns.map((col, idx) => {
                        // Show matching key from totals, else empty.
                        const tKey = Object.keys(totals).find(
                          (k) =>
                            k === col ||
                            k === `total${col.charAt(0).toUpperCase()}${col.slice(1)}`
                        );
                        return (
                          <td key={col} className="px-4 py-3">
                            {tKey != null && idx > 0
                              ? formatCell(col, totals[tKey])
                              : ""}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* Totals summary (Totals outside columns, visible in print) */}
          {Object.keys(totals).length > 0 && (
            <div className="flex flex-wrap gap-3">
              {Object.entries(totals).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/50 px-4 py-2"
                >
                  <span className="text-xs text-primary-500">
                    {COLUMN_LABELS[k.replace(/^total/, "").replace(/^./, (c) => c.toLowerCase())] ||
                      COLUMN_LABELS[k] ||
                      k}
                    :{" "}
                  </span>
                  <span className="font-semibold text-primary-900">
                    {MONEY_KEYS.has(k) || /amount|salary|collected|due|fee/i.test(k)
                      ? formatTaka(v)
                      : formatCell(k, v)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsManager;
