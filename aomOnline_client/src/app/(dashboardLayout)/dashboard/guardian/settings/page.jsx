"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuardianSettings from "@/components/Guardian/GuardianSettings";

const GuardianSettingsPage = () => (
  <ProtectedRoute allowedRoles={["parent"]}>
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/dashboard/guardian"
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
        >
          <FiArrowLeft /> Dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-primary-900 sm:text-3xl">Settings</h1>
      </div>

      <GuardianSettings />
    </div>
  </ProtectedRoute>
);

export default GuardianSettingsPage;
