"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClassForm from "@/components/Admin/ClassForm";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/shadcn/card";
import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";

const LIST_PATH = "/dashboard/admin/classes";

// Admin — edit an existing class on its own page (replaces the old modal so the
// Save button is never pushed below the viewport when many milestones exist).
const EditClassPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchClass = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setInitial(data.data || data);
      } else {
        setError(data.message || "Failed to load the class.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) fetchClass();
  }, [id, fetchClass]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === undefined || data.success)) {
        toast.success("Class updated.");
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
            Edit Class
          </h1>
          <p className="mt-1 text-primary-600">
            Update the class details, monthly fee, and progress milestones.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Spinner size="lg" />
            <p className="animate-pulse text-primary-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
            <p>{error}</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={fetchClass}>
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <ClassForm
                initial={initial}
                loading={saving}
                onSubmit={handleSubmit}
                onCancel={() => router.push(LIST_PATH)}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default EditClassPage;
