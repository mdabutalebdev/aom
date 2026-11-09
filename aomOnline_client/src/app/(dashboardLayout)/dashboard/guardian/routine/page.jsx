"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuardianClassRoutine from "@/components/Guardian/GuardianClassRoutine";

const GuardianRoutinePage = () => (
  <ProtectedRoute allowedRoles={["parent"]}>
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <Link
          href="/dashboard/guardian"
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
        >
          <FiArrowLeft /> Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary-900 sm:text-3xl">
          Class Routine
        </h1>
        <p className="mt-0.5 text-sm text-primary-500">
          Your child&apos;s weekly class schedule.
        </p>
      </div>

      <GuardianClassRoutine />
    </div>
  </ProtectedRoute>
);

export default GuardianRoutinePage;
