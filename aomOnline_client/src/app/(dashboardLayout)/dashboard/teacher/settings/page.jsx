"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TeacherSettings from "@/components/Teacher/TeacherSettings";

// Teacher — profile photo + name only (no password field, ever).
const TeacherSettingsPage = () => {
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
            Settings
          </h1>
        </div>

        <TeacherSettings />
      </div>
    </ProtectedRoute>
  );
};

export default TeacherSettingsPage;
