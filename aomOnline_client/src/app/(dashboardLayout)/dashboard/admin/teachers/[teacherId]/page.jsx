"use client";

import React, { use } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TeacherPaymentDetail from "@/components/Admin/TeacherPaymentDetail";

// Admin — a single teacher's profile: student roster + payment status.
const TeacherDetailPage = ({ params }) => {
  const { teacherId } = use(params);

  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <TeacherPaymentDetail teacherId={teacherId} />
      </div>
    </ProtectedRoute>
  );
};

export default TeacherDetailPage;
