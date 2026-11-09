"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SalaryManager from "@/components/Admin/SalaryManager";

const SalaryManagementPage = () => (
  <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SalaryManager />
    </div>
  </ProtectedRoute>
);

export default SalaryManagementPage;
