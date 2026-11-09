"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiSearch,
  FiEye,
  FiClock,
  FiDownload,
  FiZap,
  FiEdit3,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import AdminAvatar from "@/components/Admin/AdminAvatar";
import SalaryPayDialog from "./SalaryPayDialog";
import SalaryHistoryDialog from "./SalaryHistoryDialog";
import { formatTaka } from "./managementConstants";
import { banglaMonthName } from "./paymentConstants";
import {
  SALARY_STATUS_META,
  SALARY_STATUS_FILTERS,
  SALARY_METHODS,
  buildPeriodOptions,
  todayInputValue,
} from "./salaryConstants";

const STAT_CARDS = [
  {
    key: "totalTeachers",
    label: "Total Teachers",
    sub: () => "All teachers",
    icon: FiUsers,
    tone: "bg-primary-50 text-primary-600",
  },
  {
    key: "paidTeachers",
    label: "Paid Teachers",
    sub: (s) => `${percent(s.paidTeachers, s.totalTeachers)}% of total`,
    icon: FiCheckCircle,
    tone: "bg-secondary-50 text-secondary-600",
  },
  {
    key: "unpaidTeachers",
    label: "Unpaid Teachers",
    sub: (s) => `${percent(s.unpaidTeachers, s.totalTeachers)}% of total`,
    icon: FiXCircle,
    tone: "bg-red-50 text-danger",
  },
  {
    key: "totalSalary",
    label: "Total Salary",
    sub: () => "This month",
    icon: FiCreditCard,
    tone: "bg-accent-50 text-accent-600",
    money: true,
  },
];

function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

// Build a CSV from the current rows. Values are quoted and inner quotes
// doubled so a teacher name containing a comma can't shift the columns.
const toCsv = (rows, month, year) => {
  const header = [
    "Teacher ID",
    "Name",
    "Designation",
    "Students",
    "Monthly Salary",
    "Paid Amount",
    "Due Amount",
    "Status",
  ];
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.teacherId,
      r.name,
      r.designation,
      r.studentCount,
      r.salaryAmount,
      r.paidAmount,
      r.dueAmount,
      SALARY_STATUS_META[r.status]?.label ?? r.status,
    ]
      .map(escape)
      .join(","),
  );
  return [`"Salary Report — ${banglaMonthName(month)} ${year}"`, header.map(escape).join(","), ...lines].join(
    "\n",
  );
};

/**
 * SalaryManager — teacher salary for one month: what each teacher is owed,
 * what has actually been disbursed, and what is still outstanding.
 *
 * The expected salary is derived from the teacher's student assignments
 * (Σ of each student's teacherPayoutAmount) and snapshotted onto the record
 * the first time money is recorded, so later roster changes don't rewrite
 * a month that has already been settled.
 */
const SalaryManager = () => {
  const periods = useMemo(() => buildPeriodOptions(12), []);
  const [period, setPeriod] = useState(periods[0]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [payTarget, setPayTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMethod, setBulkMethod] = useState("bank");
  const [busy, setBusy] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        month: String(period.month),
        year: String(period.year),
        limit: "100",
      });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const res = await apiClient.get(`/salaries/overview?${params.toString()}`);
      setRows(Array.isArray(res.data) ? res.data : []);
      setSummary(res.summary ?? null);
    } catch (err) {
      setError(err.message || "Failed to load salary data.");
    } finally {
      setLoading(false);
    }
  }, [period, search, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverview();
  }, [fetchOverview]);

  const handleBulkPay = async () => {
    setBusy(true);
    try {
      const res = await apiClient.post("/salaries/bulk-pay", {
        method: bulkMethod,
        paidAt: todayInputValue(),
        month: period.month,
        year: period.year,
      });
      const { paidCount, totalPaid } = res.data ?? {};
      if (paidCount) {
        toast.success(
          `${formatTaka(totalPaid)} recorded across ${paidCount} teacher(s).`,
        );
      } else {
        toast.info("Nothing outstanding — no payments recorded.");
      }
      setBulkOpen(false);
      await fetchOverview();
    } catch (err) {
      toast.error(err.message || "Bulk payment failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleAdjust = async () => {
    const value = Number(adjustAmount);
    if (!(value >= 0)) {
      toast.error("Enter a valid amount.");
      return;
    }
    setBusy(true);
    try {
      await apiClient.patch("/salaries/amount", {
        teacherId: adjustTarget.teacherRef,
        salaryAmount: value,
        month: period.month,
        year: period.year,
      });
      toast.success(`Salary for ${adjustTarget.name} set to ${formatTaka(value)}.`);
      setAdjustTarget(null);
      await fetchOverview();
    } catch (err) {
      toast.error(err.message || "Could not update the salary amount.");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    if (!rows.length) {
      toast.info("Nothing to download for this month.");
      return;
    }
    const blob = new Blob([toCsv(rows, period.month, period.year)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-${period.year}-${String(period.month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periodValue = `${period.year}-${period.month}`;

  return (
    <div className="space-y-6">
      {/* Header — period picker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-primary-900">Salary Management</h2>
          <p className="text-sm text-primary-500">
            Record what each teacher has actually been paid.
          </p>
        </div>
        <Select
          value={periodValue}
          onValueChange={(v) => {
            const [year, month] = v.split("-").map(Number);
            setPeriod({ month, year });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={`${p.year}-${p.month}`} value={`${p.year}-${p.month}`}>
                {banglaMonthName(p.month)} {p.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((c) => {
          const Icon = c.icon;
          const value = summary?.[c.key] ?? 0;
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
                    {c.money ? formatTaka(value) : value}
                  </p>
                  <p className="text-xs text-primary-400">
                    {summary ? c.sub(summary) : "—"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Teacher salary list */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="mr-auto font-semibold text-primary-900">Teacher Salary List</h3>
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teacher..."
                className="w-48 pl-9"
              />
            </div>
            <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALARY_STATUS_FILTERS.map((f) => (
                  <SelectItem key={f.value || "all"} value={f.value || "all"}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchOverview}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
              No teachers match this view.
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
                <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                      <th className="w-10 px-4 py-3.5 font-medium">#</th>
                      <th className="px-4 py-3.5 font-medium whitespace-nowrap">Teacher Name</th>
                      <th className="px-4 py-3.5 font-medium whitespace-nowrap">Designation</th>
                      <th className="px-4 py-3.5 text-right font-medium whitespace-nowrap">
                        Monthly Salary
                      </th>
                      <th className="px-4 py-3.5 text-right font-medium whitespace-nowrap">Paid</th>
                      <th className="px-4 py-3.5 text-right font-medium whitespace-nowrap">Due</th>
                      <th className="px-4 py-3.5 text-center font-medium whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 py-3.5 text-right font-medium whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const meta = SALARY_STATUS_META[r.status] ?? SALARY_STATUS_META.unpaid;
                      return (
                        <tr
                          key={r.teacherRef}
                          className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30"
                        >
                          <td className="px-4 py-3.5 text-primary-400">{i + 1}</td>
                          <td className="max-w-[220px] px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <AdminAvatar src={r.photo} name={r.name} size={34} />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-primary-900" title={r.name}>
                                  {r.name}
                                </p>
                                <p className="whitespace-nowrap text-xs text-primary-400">
                                  {r.studentCount} student{r.studentCount === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[150px] px-4 py-3.5 text-primary-700">
                            <span className="block truncate">
                              {r.designation || r.subject || "—"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium tabular-nums text-primary-900">
                            {formatTaka(r.salaryAmount)}
                            {r.isAmountOverridden && (
                              <span
                                className="ml-1 text-xs text-accent-600"
                                title="Manually adjusted for this month"
                              >
                                *
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium tabular-nums text-secondary-600">
                            {formatTaka(r.paidAmount)}
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3.5 text-right font-medium tabular-nums ${
                              r.dueAmount > 0 ? "text-danger" : "text-primary-300"
                            }`}
                          >
                            {formatTaka(r.dueAmount)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              {r.dueAmount > 0 ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="whitespace-nowrap"
                                  onClick={() => setPayTarget(r)}
                                >
                                  Pay Salary
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="whitespace-nowrap"
                                  onClick={() => setHistoryTarget(r.teacherRef)}
                                >
                                  <FiEye /> View
                                </Button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustTarget(r);
                                  setAdjustAmount(String(r.salaryAmount));
                                }}
                                aria-label="Adjust salary amount"
                                title="Adjust salary amount"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-primary-50 hover:text-primary-700"
                              >
                                <FiEdit3 />
                              </button>
                              <button
                                type="button"
                                onClick={() => setHistoryTarget(r.teacherRef)}
                                aria-label="View salary history"
                                title="Salary history"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-primary-50 hover:text-primary-700"
                              >
                                <FiClock />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="border-t border-primary-100 bg-primary-50/30 px-4 py-2.5 text-xs text-primary-400">
                  Showing {rows.length} of {summary?.totalTeachers ?? rows.length}{" "}
                  {(summary?.totalTeachers ?? rows.length) === 1 ? "teacher" : "teachers"}
                </div>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {rows.map((r) => {
                  const meta = SALARY_STATUS_META[r.status] ?? SALARY_STATUS_META.unpaid;
                  return (
                    <div
                      key={r.teacherRef}
                      className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <AdminAvatar src={r.photo} name={r.name} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-primary-900">{r.name}</p>
                            <p className="text-xs text-primary-400">
                              {r.designation || r.subject || r.teacherId}
                            </p>
                          </div>
                        </div>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p className="text-xs text-primary-400">Salary</p>
                          <p className="font-medium text-primary-900">
                            {formatTaka(r.salaryAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-400">Paid</p>
                          <p className="font-medium text-secondary-600">
                            {formatTaka(r.paidAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-400">Due</p>
                          <p className="font-medium text-danger">{formatTaka(r.dueAmount)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {r.dueAmount > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => setPayTarget(r)}
                          >
                            Pay Salary
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          onClick={() => setHistoryTarget(r.teacherRef)}
                        >
                          History
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Sidebar — summary + quick actions */}
        <div className="space-y-4">
          <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft">
            <h3 className="font-semibold text-primary-900">
              Salary Summary
              <span className="ml-1 text-sm font-normal text-primary-400">
                ({banglaMonthName(period.month)} {period.year})
              </span>
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary-500">Total Salary</span>
                <span className="font-semibold tabular-nums text-primary-900">
                  {formatTaka(summary?.totalSalary)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-500">Paid Amount</span>
                <span className="font-semibold tabular-nums text-secondary-600">
                  {formatTaka(summary?.totalPaid)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-500">Due Amount</span>
                <span className="font-semibold tabular-nums text-danger">
                  {formatTaka(summary?.totalDue)}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-500">Payment Progress</span>
                  <span className="font-semibold tabular-nums text-primary-900">
                    {summary?.progressPercent ?? 0}%
                  </span>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary-100"
                  role="progressbar"
                  aria-valuenow={summary?.progressPercent ?? 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Salary payment progress"
                >
                  <div
                    className="h-full rounded-full bg-secondary-500 transition-all"
                    style={{ width: `${Math.min(100, summary?.progressPercent ?? 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft">
            <h3 className="flex items-center gap-2 font-semibold text-primary-900">
              <FiZap className="text-accent-500" /> Quick Actions
            </h3>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => setBulkOpen(true)}
                disabled={!summary?.totalDue}
                className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-left text-sm font-medium text-primary-800 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiUsers className="text-primary-500" />
                Bulk Salary Payment
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-left text-sm font-medium text-primary-800 transition-colors hover:bg-primary-50"
              >
                <FiDownload className="text-primary-500" />
                Download Report
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Pay dialog */}
      <SalaryPayDialog
        row={payTarget}
        month={period.month}
        year={period.year}
        onClose={() => setPayTarget(null)}
        onSaved={fetchOverview}
      />

      {/* History dialog */}
      {historyTarget && (
        <SalaryHistoryDialog
          teacherRef={historyTarget}
          onClose={() => setHistoryTarget(null)}
          onChanged={fetchOverview}
        />
      )}

      {/* Adjust salary amount */}
      <Dialog open={!!adjustTarget} onOpenChange={(open) => !open && setAdjustTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Salary Amount</DialogTitle>
            <p className="mt-0.5 text-sm text-primary-500">
              {adjustTarget?.name} — {banglaMonthName(period.month)} {period.year}
            </p>
          </DialogHeader>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">
              Monthly Salary
            </label>
            <Input
              type="number"
              min="0"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-primary-400">
              Overrides the amount calculated from student assignments. This month
              will stop auto-updating when students are added or reassigned.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustTarget(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdjust} disabled={busy}>
              {busy ? "Saving…" : "Save Amount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk pay */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Salary Payment</DialogTitle>
            <p className="mt-0.5 text-sm text-primary-500">
              {banglaMonthName(period.month)} {period.year}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-[var(--radius-lg)] bg-primary-50/50 p-4 text-sm">
              <p className="text-primary-600">
                This records the full outstanding amount for every teacher who still
                has a due balance this month.
              </p>
              <p className="mt-2 font-semibold text-primary-900">
                {formatTaka(summary?.totalDue)} across{" "}
                {(summary?.unpaidTeachers ?? 0) + (summary?.partialTeachers ?? 0)} teacher(s)
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-800">
                Payment Method
              </label>
              <Select value={bulkMethod} onValueChange={setBulkMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkPay} disabled={busy}>
              {busy ? "Recording…" : "Record All Payments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaryManager;
