"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuardianHomework from "@/components/Guardian/GuardianHomework";

const GuardianHomeworkPage = () => (
  <ProtectedRoute allowedRoles={["parent"]}>
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <Link
          href="/dashboard/guardian"
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
        >
          <FiArrowLeft /> Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary-900 sm:text-3xl">Homework</h1>
        <p className="mt-0.5 text-sm text-primary-500">
          Homework your child&apos;s teacher has sent.
        </p>
      </div>

      <GuardianHomework />
    </div>
  </ProtectedRoute>
);

export default GuardianHomeworkPage;
