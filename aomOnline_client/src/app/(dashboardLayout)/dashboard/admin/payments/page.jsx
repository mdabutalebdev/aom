"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PaymentsManager from "@/components/Admin/PaymentsManager";

// Admin Payments Dashboard — Teacher list (admin, superAdmin).
const PaymentsPage = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
            Payment Management
          </h1>
          <p className="mt-1 text-primary-600">
            Payments guardians have submitted — mark them complete once the money is confirmed.
          </p>
        </div>

        <PaymentsManager />
      </div>
    </ProtectedRoute>
  );
};

export default PaymentsPage;
