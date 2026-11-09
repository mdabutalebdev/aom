"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClassForm from "@/components/Admin/ClassForm";
import { Card, CardContent } from "@/components/shadcn/card";
import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";

const LIST_PATH = "/dashboard/admin/classes";

// Admin — create a new class on its own page (replaces the old modal so the
// Save button is never pushed below the viewport).
const NewClassPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === undefined || data.success)) {
        toast.success("New class added.");
        router.push(LIST_PATH);
      } else {
        toast.error(data.message || "Save failed.");
        setSaving(false);
      }
    } catch {
      toast.error("Could not connect to server.");
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href={LIST_PATH}
            className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
          >
            <FiArrowLeft /> Back to Classes
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-primary-900 sm:text-3xl">
            New Class
          </h1>
          <p className="mt-1 text-primary-600">
            Add a class/level with its monthly fee and progress milestones.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <ClassForm
              loading={saving}
              onSubmit={handleSubmit}
              onCancel={() => router.push(LIST_PATH)}
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default NewClassPage;
