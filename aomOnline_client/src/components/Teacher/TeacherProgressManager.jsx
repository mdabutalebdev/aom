"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiEdit3 } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import AdminAvatar from "@/components/Admin/AdminAvatar";
import ProgressPath from "@/components/shared/ProgressPath";

// True when a student already has a written (non-empty) message.
const hasNote = (s) =>
  typeof s?.note === "string" && s.note.replace(/<[^>]*>/g, "").trim().length > 0;

/**
 * TeacherProgressManager — one animated ProgressPath per assigned student.
 * Tapping a step sets that student's percentage; at 100% a "promote to next
 * class" CTA appears (Qaida -> Nazira -> Hafiz, by Class.order).
 */
const TeacherProgressManager = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [promotingId, setPromotingId] = useState(null);
  const [issuingId, setIssuingId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [studentsRes, classesRes] = await Promise.all([
        apiClient.get("/progress/my-students"),
        apiClient.get("/classes"),
      ]);
      setStudents(studentsRes.data?.students || []);
      const classList = Array.isArray(classesRes.data)
        ? classesRes.data
        : classesRes.data?.data || [];
      setClasses([...classList].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (err) {
      setError(err.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const hasNextClass = (classRefId) => {
    const current = classes.find((c) => c._id === classRefId);
    if (!current) return false;
    return classes.some((c) => c.order > current.order && c.isActive !== false);
  };

  const setPercentage = async (student, percent) => {
    setSavingId(student._id);
    setStudents((prev) =>
      prev.map((s) => (s._id === student._id ? { ...s, percentage: percent } : s)),
    );
    try {
      await apiClient.patch(`/progress/student/${student._id}`, { percentage: percent });
      if (percent >= 100) toast.success(`${student.name} reached 100%!`);
    } catch (err) {
      toast.error(err.message || "Could not update progress.");
      fetchAll();
    } finally {
      setSavingId(null);
    }
  };

  const promote = async (student) => {
    setPromotingId(student._id);
    try {
      const res = await apiClient.patch(`/progress/student/${student._id}/promote`);
      toast.success(`${student.name} promoted to ${res.data?.promotedTo?.name || "the next class"}!`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Could not promote this student.");
    } finally {
      setPromotingId(null);
    }
  };

  const issueCertificate = async (student) => {
    setIssuingId(student._id);
    try {
      await apiClient.post(`/certificates/student/${student._id}/issue`);
      toast.success(`Certificate issued for ${student.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Could not issue certificate.");
    } finally {
      setIssuingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchAll}>
          Try again
        </Button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
        No students assigned yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {students.map((s) => (
        <div key={s._id}>
          <div className="mb-2 flex items-center gap-3">
            <AdminAvatar src={s.photo} name={s.name} size={36} />
            <span className="font-semibold text-primary-900">{s.name}</span>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/teacher/progress/${s._id}`)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-secondary-50 px-3 py-1.5 text-xs font-medium text-secondary-700 ring-1 ring-inset ring-secondary-200 transition-colors hover:bg-secondary-100"
            >
              <FiEdit3 className="text-sm" />
              {hasNote(s) ? "Edit Message" : "Add Message"}
              {hasNote(s) && (
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-500" />
              )}
            </button>
          </div>
          <ProgressPath
            className={s.className}
            percentage={s.percentage}
            milestones={s.milestones}
            editable
            saving={savingId === s._id}
            promoting={promotingId === s._id}
            issuing={issuingId === s._id}
            hasNextClass={hasNextClass(s.classRef)}
            onSetPercentage={(percent) => setPercentage(s, percent)}
            onPromote={() => promote(s)}
            onIssueCertificate={() => issueCertificate(s)}
          />
        </div>
      ))}
    </div>
  );
};

export default TeacherProgressManager;
