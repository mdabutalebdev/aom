"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PresentationsManager from "@/components/Admin/PresentationsManager";

// Admin Student Presentations Management Page (admin, superAdmin).
const PresentationsControlPage = () => {
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
            Student Presentations
          </h1>
          <p className="mt-1 text-primary-600">
            Manage the video presentations shown in the homepage &quot;Our Students&apos; Presentation&quot; section.
          </p>
        </div>

        <PresentationsManager />
      </div>
    </ProtectedRoute>
  );
};

export default PresentationsControlPage;
