"use client";

import React, { use } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentDetail from "@/components/Admin/StudentDetail";

// Admin — a single student's full profile: progress path + attendance.
const StudentDetailPage = ({ params }) => {
  const { studentId } = use(params);

  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <StudentDetail studentId={studentId} />
      </div>
    </ProtectedRoute>
  );
};

export default StudentDetailPage;
