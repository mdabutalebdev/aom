"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TeacherPaymentsView from "@/components/Teacher/TeacherPaymentsView";

// Teacher — read-only view of their OWN salary: what they are owed each month
// and what the Super Admin has paid, with downloadable slips.
const TeacherPaymentsPage = () => {
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
          <h1 className="mt-3 text-2xl font-bold text-primary-900 sm:text-3xl">
            My Salary
          </h1>
          <p className="mt-1 text-primary-600">
            Your monthly salary and the payments recorded by the Super Admin.
          </p>
        </div>

        <TeacherPaymentsView />
      </div>
    </ProtectedRoute>
  );
};

export default TeacherPaymentsPage;
