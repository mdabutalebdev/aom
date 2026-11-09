"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentForm from "@/components/Admin/StudentForm";

// Admin — create a new student (own page; used to be a modal that grew too
// tall/cramped once the guardian-account fields were added).
const NewStudentPage = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href="/dashboard/admin/students"
            className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
          >
            <FiArrowLeft /> Back to Students
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-primary-900 sm:text-3xl">
            New Student
          </h1>
          <p className="mt-1 text-primary-600">
            Admit a new student and assign a class, teacher, and guardian.
          </p>
        </div>

        <StudentForm />
      </div>
    </ProtectedRoute>
  );
};

export default NewStudentPage;
