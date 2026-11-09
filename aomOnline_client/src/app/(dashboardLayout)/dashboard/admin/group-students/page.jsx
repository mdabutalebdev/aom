"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GroupStudentsManager from "@/components/Admin/GroupStudentsManager";

// Admin — Group Class Students: students grouped into batches that share one
// teacher, schedule and fee. Each student still has its own guardian.
const GroupStudentsPage = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-primary-900 sm:text-3xl">
            Group Class Students
          </h1>
          <p className="mt-1 text-primary-600">
            Manage all group class students — grouped into batches by teacher, schedule and fee.
          </p>
        </div>

        <GroupStudentsManager />
      </div>
    </ProtectedRoute>
  );
};

export default GroupStudentsPage;
