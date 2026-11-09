"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheckSquare, FiBarChart2 } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AttendanceTracker from "@/components/Teacher/AttendanceTracker";
import AttendanceMonthlySummary from "@/components/Teacher/AttendanceMonthlySummary";

const TABS = [
  { key: "daily", label: "Daily", icon: FiCheckSquare },
  { key: "monthly", label: "Monthly Summary", icon: FiBarChart2 },
];

// Teacher Attendance  —    (teacher)।
const TeacherAttendancePage = () => {
  const [tab, setTab] = useState("daily");

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="w-full px-4 py-5 sm:px-6">
        <div className="mb-6">
          <Link
            href="/dashboard/teacher"
            className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
          >
            <FiArrowLeft /> Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-primary-900">
            Attendance
          </h1>
          <p className="mt-1 text-sm text-primary-600">
            Mark your students&apos; attendance for any day up to today.
          </p>
        </div>

        {/*  */}
        <div className="mb-5 inline-flex rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-1 shadow-soft">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-500 text-white shadow-soft"
                    : "text-primary-600 hover:bg-primary-50"
                }`}
              >
                <Icon className="text-base" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "daily" ? <AttendanceTracker /> : <AttendanceMonthlySummary />}
      </div>
    </ProtectedRoute>
  );
};

export default TeacherAttendancePage;
