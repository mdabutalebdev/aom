"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClassDemoManager from "@/components/Admin/ClassDemoManager";

// Admin Homepage → Watch Our Live Class Demo section content page (admin, superAdmin).
const ClassDemoPage = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
            Watch Our Live Class Demo
          </h1>
          <p className="mt-1 text-primary-600">
            Edit the heading, description, and both comparison cards (photo + feature bullets) for the class demo section.
          </p>
        </div>

        <ClassDemoManager />
      </div>
    </ProtectedRoute>
  );
};

export default ClassDemoPage;
