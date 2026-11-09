"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { toast } from "sonner";

import apiClient from "@/lib/apiClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/shadcn/card";
import RichTextEditor from "@/components/shared/RichTextEditor";
import LevelMessageCard from "@/components/shared/LevelMessageCard";

const LIST_PATH = "/dashboard/teacher/progress";

/**
 * Teacher — write/edit the rich-text progress message for one student on its
 * own page (not a modal), so the Save button is never pushed off-screen no
 * matter how long the message or preview gets.
 */
const ProgressMessagePage = () => {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.studentId;

  const [student, setStudent] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/progress/my-students");
      const list = res.data?.students || [];
      const s = list.find((x) => x._id === studentId);
      if (!s) {
        setError("Student not found among your students.");
      } else {
        setStudent(s);
        setNote(s.note || "");
      }
    } catch (err) {
      setError(err.message || "Failed to load the student.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (studentId) fetchStudent();
  }, [studentId, fetchStudent]);

  const save = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await apiClient.patch(`/progress/student/${studentId}`, {
        percentage: Number(student.percentage) || 0,
        note,
      });
      toast.success("Message saved.");
      router.push(LIST_PATH);
    } catch (err) {
      toast.error(err.message || "Could not save the message.");
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <Link
            href={LIST_PATH}
            className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
          >
            <FiArrowLeft /> Back to Progress
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-primary-900 sm:text-3xl">
            {student ? `Message — ${student.name}` : "Student Message"}
          </h1>
          <p className="mt-1 text-primary-600">
            Write the message the guardian sees on the progress card. All of the
            wording is yours.
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
              <Button variant="outline" size="sm" onClick={fetchStudent}>
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div>
                <p className="mb-1.5 text-sm font-medium text-primary-800">
                  Write a message for the guardian
                </p>
                <RichTextEditor
                  value={note}
                  onChange={setNote}
                  placeholder="e.g. তুমি এরাবিক লেটার সম্পূর্ণ শিখেছো, এখন তুমি জয়েনিং লেটার শিখছো…"
                />
                <p className="mt-1.5 text-xs text-primary-400">
                  Make text bold, larger, or colourful with the toolbar. This
                  shows on the guardian&apos;s progress card exactly as previewed
                  below.
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-primary-800">
                  Live preview
                </p>
                <LevelMessageCard
                  className={student?.className}
                  percentage={student?.percentage}
                  note={note}
                  milestones={student?.milestones}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-primary-100 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(LIST_PATH)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={save}
                  disabled={saving}
                  isLoading={saving}
                >
                  <FiSave className="mr-1.5" />
                  Save Message
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProgressMessagePage;
