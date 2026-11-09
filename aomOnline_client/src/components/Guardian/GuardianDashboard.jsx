"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FiAlertCircle, FiRefreshCw, FiArrowRight } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import LevelMessageCard from "@/components/shared/LevelMessageCard";

import StudentProfileCard from "@/components/Student/StudentProfileCard";
import StudentAttendance from "@/components/Student/StudentAttendance";
import StudentAttendanceSummary from "@/components/Student/StudentAttendanceSummary";
import StudentMaterials from "@/components/Student/StudentMaterials";
import { PAYMENT_STATUS_META } from "@/components/Admin/paymentConstants";
import { formatTaka } from "@/components/Admin/managementConstants";

const GuardianDashboard = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/students/me/dashboard?month=${month}&year=${year}`);
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, [fetchDashboard]);

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

  const canGoNext =
    year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-[var(--radius-2xl)] lg:col-span-1" />
          <div className="space-y-5 lg:col-span-2">
            <Skeleton className="h-48 rounded-[var(--radius-2xl)]" />
            <Skeleton className="h-64 rounded-[var(--radius-2xl)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <FiAlertCircle className="mx-auto mb-3 text-4xl text-danger" />
        <p className="text-danger">{error}</p>
        <Button variant="outline" className="mt-5" onClick={fetchDashboard}>
          <FiRefreshCw className="mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  const student = data?.student;
  const attendance = data?.attendance;
  const payment = data?.payment;
  const paymentMeta = payment
    ? PAYMENT_STATUS_META[payment.status] || { label: payment.status, variant: "neutral" }
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <StudentProfileCard student={student} />

          {payment && (
            <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft">
              <p className="text-sm font-medium text-primary-800">This Month&apos;s Payment</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-primary-900">{formatTaka(payment.amount)}</span>
                <Badge variant={paymentMeta.variant}>{paymentMeta.label}</Badge>
              </div>
              {payment.status !== "paid" && (
                <Link href="/dashboard/guardian/payments">
                  <Button variant="primary" size="sm" className="mt-4 w-full justify-center">
                    {payment.status === "pending" ? "View Submission" : "Submit Payment"}
                    <FiArrowRight className="ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          <LevelMessageCard
            className={data?.progress?.className}
            percentage={data?.progress?.percentage ?? 0}
            note={data?.progress?.note}
            milestones={data?.progress?.milestones}
          />

          <StudentAttendance
            attendance={attendance}
            month={attendance?.month || month}
            year={attendance?.year || year}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            canGoNext={canGoNext}
            loading={loading}
          />

          <StudentAttendanceSummary summary={attendance?.summary} />

          <StudentMaterials materials={data?.materials} />
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboard;
