"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TeacherUpcomingClass from "@/components/Teacher/TeacherUpcomingClass";

const TeacherUpcomingClassPage = () => (
  <ProtectedRoute allowedRoles={["teacher"]}>
    <div className="w-full px-4 py-5 sm:px-6">
      <div className="mb-3">
        <Link
          href="/dashboard/teacher"
          className="inline-flex items-center gap-1.5 text-xs text-primary-500 transition-colors hover:text-primary-700"
        >
          <FiArrowLeft /> Dashboard
        </Link>
        <h1 className="mt-1.5 text-xl font-bold text-primary-900">
          Upcoming Classes
        </h1>
        <p className="text-sm text-primary-500">
          Your class timetable — which student, what day, and what time.
        </p>
      </div>

      <TeacherUpcomingClass />
    </div>
  </ProtectedRoute>
);

export default TeacherUpcomingClassPage;
