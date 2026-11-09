"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentsManager from "@/components/Admin/StudentsManager";

// Admin Student Management Page (admin, superAdmin).
const StudentsControlPage = () => {
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
            Single Student
          </h1>
          <p className="mt-1 text-primary-600">
            One-to-one students — each with their own teacher, class and guardian.
          </p>
        </div>

        <StudentsManager type="single" />
      </div>
    </ProtectedRoute>
  );
};

export default StudentsControlPage;
