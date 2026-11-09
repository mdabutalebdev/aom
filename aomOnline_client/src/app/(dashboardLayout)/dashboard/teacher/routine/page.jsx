"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TeacherClassRoutine from "@/components/Teacher/TeacherClassRoutine";

// Teacher Class Routine Page.
const TeacherRoutinePage = () => {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href="/dashboard/teacher"
            className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-primary-900 sm:text-3xl">
            Class Routine
          </h1>
          <p className="mt-1 text-primary-600">
            Your full weekly class schedule.
          </p>
        </div>

        <TeacherClassRoutine />
      </div>
    </ProtectedRoute>
  );
};

export default TeacherRoutinePage;
