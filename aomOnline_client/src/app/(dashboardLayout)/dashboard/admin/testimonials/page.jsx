"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TestimonialsManager from "@/components/Admin/TestimonialsManager";

// Admin Parents Review (Testimonials) Management Page (admin, superAdmin).
const TestimonialsControlPage = () => {
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
            Parents Reviews
          </h1>
          <p className="mt-1 text-primary-600">
            Review, accept, or delete video reviews submitted by parents — and add your own. Approved reviews appear in the homepage &quot;Parents Review&quot; section.
          </p>
        </div>

        <TestimonialsManager />
      </div>
    </ProtectedRoute>
  );
};

export default TestimonialsControlPage;
