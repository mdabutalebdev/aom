"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TeacherDashboard from "@/components/Teacher/TeacherDashboard";

const TeacherDashboardPage = () => (
  <ProtectedRoute allowedRoles={["teacher"]}>
    <div className="w-full px-4 py-5 sm:px-6">
      <TeacherDashboard />
    </div>
  </ProtectedRoute>
);

export default TeacherDashboardPage;
