"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiUser,
  FiBookOpen,
  FiUserPlus,
  FiTrendingUp,
  FiClock,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiArrowRight,
  FiInbox,
  FiMail,
} from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

import { formatTaka } from "./managementConstants";
import {
  DonutChart,
  BarChart,
  CollectionAreaChart,
  ProfitAreaChart,
} from "./DashboardCharts";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ADMISSION_STATUS = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const CONTACT_STATUS = {
  new: { label: "New", variant: "default" },
  read: { label: "Read", variant: "outline" },
  replied: { label: "Replied", variant: "secondary" },
  resolved: { label: "Resolved", variant: "secondary" },
};

const shortDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};

const STAT_CARDS = [
  { key: "teachers", label: "Total Teachers", icon: FiUsers, tone: "bg-primary-50 text-primary-600", get: (d) => d.counts?.teachers, money: false },
  { key: "students", label: "Total Students", icon: FiUser, tone: "bg-secondary-50 text-secondary-600", get: (d) => d.counts?.students, money: false },
  { key: "singleStudents", label: "Single Students", icon: FiUser, tone: "bg-primary-50 text-primary-600", get: (d) => d.counts?.singleStudents, money: false },
  { key: "groupStudents", label: "Group Students", icon: FiUsers, tone: "bg-accent-50 text-accent-600", get: (d) => d.counts?.groupStudents, money: false },
  { key: "classes", label: "Total Classes", icon: FiBookOpen, tone: "bg-accent-50 text-accent-600", get: (d) => d.counts?.classes, money: false },
  { key: "pendingAdmissions", label: "Pending Admissions", icon: FiUserPlus, tone: "bg-primary-50 text-primary-600", get: (d) => d.counts?.pendingAdmissions, money: false },
  { key: "totalCollected", label: "Collected this month", icon: FiTrendingUp, tone: "bg-secondary-50 text-secondary-600", get: (d) => d.payments?.totalCollected, money: true },
  { key: "totalDue", label: "Total Due", icon: FiClock, tone: "bg-red-50 text-danger", get: (d) => d.payments?.totalDue, money: true },
  { key: "totalSalaryNextMonth", label: "Salary (Next Month)", icon: FiCreditCard, tone: "bg-accent-50 text-accent-600", get: (d) => d.payments?.totalSalaryNextMonth, money: true },
  { key: "netProfit", label: "Profit (This Month)", icon: FiTrendingUp, tone: "bg-primary-50 text-primary-600", get: (d) => d.profit?.netProfit, money: true },
];

const QUICK_LINKS = [
  { href: "/dashboard/admin/admissions", icon: FiUserPlus, label: "Admissions" },
  { href: "/dashboard/admin/classes", icon: FiBookOpen, label: "Classes" },
  { href: "/dashboard/admin/teachers", icon: FiUsers, label: "Teachers" },
  { href: "/dashboard/admin/students", icon: FiUser, label: "Students" },
  { href: "/dashboard/admin/payments", icon: FiCreditCard, label: "Payments" },
  { href: "/dashboard/admin/reports", icon: FiBarChart2, label: "Reports" },
  { href: "/dashboard/admin/settings", icon: FiSettings, label: "Settings" },
];

/**
 * AdminDashboard — Central Admin Dashboard.
 * Fetches data from GET /analytics/overview.
 */
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: { ...authHeaders() },
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setData(body.data || {});
      } else {
        setError(body.message || "Failed to load dashboard data.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverview();
  }, [fetchOverview]);

  const d = data || {};
  const payments = d.payments || {};
  const attendance = d.attendance || {};
  const progress = d.progress || {};
  const trend = Array.isArray(d.collectionTrend) ? d.collectionTrend : [];
  const recentAdmissions = Array.isArray(d.recentAdmissions) ? d.recentAdmissions : [];
  const recentContacts = Array.isArray(d.recentContacts) ? d.recentContacts : [];

  const paidSegments = [
    { label: "Paid", value: payments.paidCount || 0, color: "var(--color-secondary-500)" },
    { label: "Unpaid", value: payments.unpaidCount || 0, color: "var(--color-accent-400)" },
  ];

  const trendBars = trend.slice(-6).map((t) => ({
    label: MONTH_NAMES[(Number(t.month) || 1) - 1] || "",
    value: Number(t.collected) || 0,
    sublabel: t.year.toString(),
  }));

  const profit = d.profit || {};
  const netProfit = Number(profit.netProfit) || 0;
  const profitTrend = Array.isArray(d.profitTrend) ? d.profitTrend : [];
  const profitPoints = profitTrend.slice(-6).map((t) => ({
    label: MONTH_NAMES[(Number(t.month) || 1) - 1] || "",
    sublabel: String(t.year),
    collection: Number(t.collection) || 0,
    expenses: Number(t.expenses) || 0,
    profit: Number(t.profit) || 0,
  }));

  const attendanceBars = [
    { label: "Present", value: attendance.present || 0, color: "var(--color-secondary-500)" },
    { label: "Absent", value: attendance.absent || 0, color: "var(--color-danger)" },
    { label: "Leave", value: attendance.leave || 0, color: "var(--color-accent-400)" },
    { label: "Holiday", value: attendance.holiday || 0, color: "var(--color-primary-400)" },
  ];
  const hasAttendance = attendanceBars.some((b) => b.value > 0);

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchOverview}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_CARDS.map((c) => {
          const Icon = c.icon;
          const raw = c.get(d);
          return (
            <Card key={c.key} size="sm" className="shadow-none">
              <CardContent className="flex items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${c.tone}`}>
                  <Icon />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{c.label}</p>
                  {loading ? (
                    <Skeleton className="mt-1 h-5 w-16" />
                  ) : (
                    <p
                      className={`truncate text-lg font-bold tabular-nums ${
                        c.key === "netProfit" && (raw ?? 0) < 0
                          ? "text-danger"
                          : "text-foreground"
                      }`}
                    >
                      {c.money ? formatTaka(raw ?? 0) : (raw ?? 0)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Row */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card size="sm" className="shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Payment Status</CardTitle>
            <span className="text-xs text-muted-foreground">This Month</span>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mx-auto h-36 w-36" rounded="full" />
            ) : (
              <DonutChart segments={paidSegments} centerLabel="Students" />
            )}
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Collection Trend (Last 6 Months)</CardTitle>
            <FiTrendingUp className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-44 w-full" />
            ) : (
              <CollectionAreaChart bars={trendBars} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profit Overview — collection in, salary out, what's left */}
      <Card size="sm" className="shadow-none">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Profit Overview (This Month)</CardTitle>
          <span className="text-xs text-muted-foreground">Last 6 months</span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-44 w-full" />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
              <ProfitAreaChart points={profitPoints} />

              <div className="space-y-3">
                <div className="rounded-[var(--radius-lg)] bg-primary-50/60 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p
                    className={`text-2xl font-bold tabular-nums ${
                      netProfit < 0 ? "text-danger" : "text-primary-900"
                    }`}
                  >
                    {formatTaka(netProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
                      Total Collection
                    </span>
                    <span className="font-semibold tabular-nums text-secondary-600">
                      {formatTaka(profit.totalCollection)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                      Total Expenses
                    </span>
                    <span className="font-semibold tabular-nums text-danger">
                      {formatTaka(profit.totalExpenses)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-2 border-t border-primary-100 pt-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                      Net Profit
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        netProfit < 0 ? "text-danger" : "text-primary-900"
                      }`}
                    >
                      {formatTaka(netProfit)}
                    </span>
                  </li>
                </ul>

                {/* Salary committed but not yet disbursed — without this the
                    profit figure reads better than it really is. */}
                {profit.salaryDue > 0 && (
                  <p className="rounded-[var(--radius-lg)] bg-accent-50 px-3 py-2 text-xs leading-relaxed text-accent-700">
                    {formatTaka(profit.salaryDue)} of salary is still unpaid this
                    month — profit will drop once it is disbursed.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Bars */}
      {!loading && hasAttendance && (
        <Card size="sm" className="shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Attendance (This Month)</CardTitle>
            <span className="text-xs text-muted-foreground">Total {attendance.total || 0} records</span>
          </CardHeader>
          <CardContent>
            <BarChart bars={attendanceBars} />
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      {!loading && (progress.avgPercentage != null || progress.completedLevels != null) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card size="sm" className="shadow-none">
            <CardContent className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-50 text-base text-secondary-600">
                <FiTrendingUp />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Average Progress</p>
                <p className="text-lg font-bold text-foreground">{Math.round(progress.avgPercentage || 0)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="shadow-none">
            <CardContent className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-base text-accent-600">
                <FiBookOpen />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Completed Levels</p>
                <p className="text-lg font-bold text-foreground">{progress.completedLevels || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activities */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card size="sm" className="shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Admissions</CardTitle>
            <Link
              href="/dashboard/admin/admissions"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-800"
            >
              View All <FiArrowRight className="text-xs" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentAdmissions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                <FiInbox className="text-xl" />
                <p className="text-sm">No recent admissions.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {recentAdmissions.map((a) => {
                  const meta = ADMISSION_STATUS[a.status] || { label: a.status, variant: "outline" };
                  return (
                    <li key={a._id} className="flex items-center justify-between gap-3 py-2.5">
                      <Link href="/dashboard/admin/admissions" className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{a.studentName || "—"}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.desiredClass || "—"} · {shortDate(a.createdAt)}
                        </p>
                      </Link>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentContacts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                <FiMail className="text-xl" />
                <p className="text-sm">No recent messages.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {recentContacts.map((c) => {
                  const meta = CONTACT_STATUS[c.status] || { label: c.status, variant: "outline" };
                  return (
                    <li key={c._id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.name || "—"}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.subject || "Contact Message"} · {shortDate(c.createdAt)}
                        </p>
                      </div>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-2.5 text-sm font-semibold text-foreground">Quick Links</h2>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {QUICK_LINKS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-primary-100/60 bg-surface p-3 text-center ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:ring-primary-200"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-base text-primary-600">
                <Icon />
              </span>
              <span className="text-xs font-medium text-primary-800">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
