"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ReportsManager from "@/components/Admin/ReportsManager";

// Admin Reports Page (admin, superAdmin) — Salary/Payment/Attendance/Progress.
const ReportsPage = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="no-print mb-6">
          <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
            Reports
          </h1>
          <p className="mt-1 text-primary-600">
            Select a type and time period to generate reports and save as Print or PDF.
          </p>
        </div>

        <ReportsManager />
      </div>
    </ProtectedRoute>
  );
};

export default ReportsPage;
