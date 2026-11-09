"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Admin Homepage landing — holds no content of its own. The actual editors
// live in sub-pages (Hero, Class Demo), so this route just forwards to the
// first sub-menu (Hero).
const HomepageContentPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/admin/homepage/hero");
  }, [router]);

  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6" />
    </ProtectedRoute>
  );
};

export default HomepageContentPage;
