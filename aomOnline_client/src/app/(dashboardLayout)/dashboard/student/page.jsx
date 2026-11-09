"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";

import {
  StudentHeader,
  StudentProfileCard,
  StudentProgress,
  StudentAttendance,
  StudentAttendanceSummary,
  StudentMaterials,
  StudentDashboardSkeleton,
} from "@/components/Student";

// notifications     ()   ।
const latestMilestoneMessage = (notifications) => {
  const items = notifications?.items;
  if (!Array.isArray(items)) return "";
  const found =
    items.find((n) => n?.type === "milestone") ||
    items.find((n) => n?.type === "progress");
  return found?.message || "";
};

const StudentDashboardContent = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // -
  const [year, setYear] = useState(now.getFullYear());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/students/me/dashboard?month=${month}&year=${year}`,
        { headers: { ...authHeaders() } }
      );
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setData(body?.data || null);
      } else {
        setError(body?.message || "Dashboard   ।");
      }
    } catch {
      setError("    ।");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    //   /  ; setState await-  (deferred)।
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

  //     ।
  const canGoNext =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);

  const student = data?.student;
  const attendance = data?.attendance;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StudentHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {loading && !data ? (
          <StudentDashboardSkeleton />
        ) : error && !data ? (
          <div className="mx-auto max-w-md rounded-[var(--radius-2xl)] border border-danger/30 bg-red-50 px-6 py-12 text-center">
            <FiAlertCircle className="mx-auto mb-3 text-4xl text-danger" />
            <p className="text-danger">{error}</p>
            <div className="mt-5">
              <Button variant="outline" onClick={() => fetchDashboard()}>
                <FiRefreshCw className="mr-1.5" />   
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/*   */}
            <div className="lg:col-span-1">
              <StudentProfileCard student={student} />
            </div>

            {/*   */}
            <div className="space-y-5 lg:col-span-2">
              <StudentProgress
                progress={data?.progress}
                milestoneMessage={latestMilestoneMessage(data?.notifications)}
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
        )}
      </main>
    </div>
  );
};

// Student  Parent  Dashboard (Phase 9) — student  parent  ।
const StudentDashboardPage = () => (
  <ProtectedRoute allowedRoles={["student", "parent"]}>
    <StudentDashboardContent />
  </ProtectedRoute>
);

export default StudentDashboardPage;
