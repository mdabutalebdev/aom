"use client";

import React from "react";
import { useSelector } from "react-redux";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminDashboard from "@/components/Admin/AdminDashboard";

// Admin Central Dashboard (admin, superAdmin) —
// Stat cards, charts, recent activities, and quick links.
const AdminDashboardPage = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-primary-600">
            Get an overview of AOM Online Madrasa at a glance.
          </p>
        </div>

        <AdminDashboard />
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;
