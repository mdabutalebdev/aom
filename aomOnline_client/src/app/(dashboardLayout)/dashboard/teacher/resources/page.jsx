"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ResourceCenter from "@/components/Teacher/ResourceCenter";

// Teacher Resources  — Resources/   (teacher)।
const TeacherResourcesPage = () => {
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
            Resources
          </h1>
          <p className="mt-1 text-primary-600">
            Share study materials — files or links — with your students.
          </p>
        </div>

        <ResourceCenter />
      </div>
    </ProtectedRoute>
  );
};

export default TeacherResourcesPage;
