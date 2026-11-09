"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuardianDashboard from "@/components/Guardian/GuardianDashboard";

const GuardianDashboardPage = () => (
  <ProtectedRoute allowedRoles={["parent"]}>
    <GuardianDashboard />
  </ProtectedRoute>
);

export default GuardianDashboardPage;
