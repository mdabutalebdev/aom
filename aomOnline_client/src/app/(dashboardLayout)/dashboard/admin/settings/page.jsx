"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SettingsManager from "@/components/Admin/SettingsManager";

// Admin Site Settings Page (admin, superAdmin).
const SettingsPage = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
            Site Settings
          </h1>
          <p className="mt-1 text-primary-600">
            Edit general information, contact details, social links, and descriptions for the website.
          </p>
        </div>

        <SettingsManager />
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage;
