"use client";

import React from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HeroContentManager from "@/components/Admin/HeroContentManager";

// Admin Homepage → Hero section content page (admin, superAdmin).
const HeroContentPage = () => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
            Hero
          </h1>
          <p className="mt-1 text-primary-600">
            Edit the badge, heading, description, feature callouts, buttons, and right-side photo shown in the homepage hero section.
          </p>
        </div>

        <HeroContentManager />
      </div>
    </ProtectedRoute>
  );
};

export default HeroContentPage;
