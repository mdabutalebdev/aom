"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UpcomingClassTeachers from "@/components/Admin/UpcomingClassTeachers";

const UpcomingClassPage = () => (
  <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
    <div className="mx-auto max-w-7xl px-4 py-8">
      <UpcomingClassTeachers />
    </div>
  </ProtectedRoute>
);

export default UpcomingClassPage;
