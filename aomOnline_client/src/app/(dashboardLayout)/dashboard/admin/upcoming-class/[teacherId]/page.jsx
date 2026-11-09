"use client";

import React, { use } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TeacherDaySchedule from "@/components/Admin/TeacherDaySchedule";

const TeacherSchedulePage = ({ params }) => {
  const { teacherId } = use(params);

  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <TeacherDaySchedule teacherId={teacherId} />
      </div>
    </ProtectedRoute>
  );
};

export default TeacherSchedulePage;
