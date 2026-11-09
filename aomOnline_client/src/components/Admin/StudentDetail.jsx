"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiBookOpen,
  FiCalendar,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressPath from "@/components/shared/ProgressPath";
import AdminAvatar from "./AdminAvatar";
import { toBanglaDigits, formatTaka, STUDENT_STATUS_META } from "./managementConstants";

const EMPTY_SUMMARY = { present: 0, absent: 0, leave: 0, holiday: 0, total: 0 };

/**
 * StudentDetail — Super Admin's read-only view of a single student: profile,
 * animated progress (Qaida/Nazira/Hafiz path), and this month's attendance.
 * Progress is edited by the teacher, not here — admin only observes.
 */
const StudentDetail = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [attendance, setAttendance] = useState({ records: [], summary: EMPTY_SUMMARY });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [issuing, setIssuing] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [studentRes, progressRes, attendanceRes] = await Promise.all([
        apiClient.get(`/students/${studentId}`),
        apiClient.get(`/progress/student/${studentId}`),
        apiClient.get(`/attendance/student/${studentId}`),
      ]);
      setStudent(studentRes.data);
      setProgress(progressRes.data);
      setAttendance({
        records: attendanceRes.data?.records || [],
        summary: attendanceRes.data?.summary || EMPTY_SUMMARY,
      });
    } catch (err) {
      setError(err.message || "Failed to load student details.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const issueCertificate = async () => {
    import("sonner").then(({ toast }) => {
      setIssuing(true);
      apiClient.post(`/certificates/student/${studentId}/issue`)
        .then(() => {
          toast.success(`Certificate issued for ${student.name}!`);
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || err.message || "Could not issue certificate.");
        })
        .finally(() => {
          setIssuing(false);
        });
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
        <p>{error || "Student not found."}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchAll}>
          Try again
        </Button>
      </div>
    );
  }

  const statusMeta = STUDENT_STATUS_META[student.status] || {
    label: student.status,
    variant: "neutral",
  };
  return (
    <div>
      <Link
        href={
          student.teacherRef?._id
            ? `/dashboard/admin/teachers/${student.teacherRef._id}`
            : "/dashboard/admin/students"
        }
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700"
      >
        <FiArrowLeft /> Back
      </Link>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Profile card */}
        <div className="h-fit rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-6 text-center shadow-soft">
          <AdminAvatar src={student.photo} name={student.name} size={96} className="mx-auto" />
          <h2 className="mt-4 text-lg font-bold text-primary-900">{student.name}</h2>
          <Badge variant={statusMeta.variant} className="mt-2">
            {statusMeta.label}
          </Badge>

          <div className="mt-5 space-y-3 text-left text-sm">
            <div className="flex items-center gap-2 text-primary-600">
              <FiUser className="text-primary-400" />
              <span className="text-primary-400">Student ID:</span>
              <span className="font-medium text-primary-900">{student.studentId}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-600">
              <FiBookOpen className="text-primary-400" />
              <span className="text-primary-400">Teacher:</span>
              <span className="font-medium text-primary-900">
                {student.teacherRef?.userRef?.name || "—"}
              </span>
            </div>
            {student.guardianName && (
              <div className="flex items-center gap-2 text-primary-600">
                <FiUser className="text-primary-400" />
                <span className="text-primary-400">Guardian:</span>
                <span className="font-medium text-primary-900">{student.guardianName}</span>
              </div>
            )}
            {student.guardianPhone && (
              <div className="flex items-center gap-2 text-primary-600">
                <FiPhone className="text-primary-400" />
                <span className="font-medium text-primary-900">
                  {toBanglaDigits(student.guardianPhone)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-primary-600">
              <span className="text-primary-400">Monthly Fee:</span>
              <span className="font-medium text-primary-900">{formatTaka(student.monthlyFee)}</span>
            </div>
            {student.teacherPayoutAmount != null && (
              <div className="flex items-center gap-2 text-primary-600">
                <span className="text-primary-400">Teacher Payout:</span>
                <span className="font-medium text-primary-900">
                  {formatTaka(student.teacherPayoutAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress + Attendance */}
        <div className="space-y-6">
          <ProgressPath
            className={progress?.className}
            percentage={progress?.percentage ?? 0}
            milestones={progress?.milestones}
            editable={false}
            onIssueCertificate={issueCertificate}
            issuing={issuing}
          />

          <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <FiCalendar className="text-primary-500" />
              <h3 className="text-base font-semibold text-primary-900">
                This Month&apos;s Attendance
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {[
                { key: "present", label: "Present", tone: "bg-secondary-50 text-secondary-700" },
                { key: "absent", label: "Absent", tone: "bg-red-50 text-danger" },
                { key: "leave", label: "Leave", tone: "bg-accent-50 text-accent-700" },
                { key: "holiday", label: "Holiday", tone: "bg-primary-50 text-primary-600" },
                { key: "total", label: "Total Days", tone: "bg-primary-100/60 text-primary-800" },
              ].map((s) => (
                <div key={s.key} className={`rounded-[var(--radius-lg)] p-3 text-center ${s.tone}`}>
                  <p className="text-xl font-bold">{toBanglaDigits(attendance.summary[s.key] ?? 0)}</p>
                  <p className="text-xs opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
            {attendance.records.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {attendance.records.map((r) => (
                  <span
                    key={r.date}
                    title={`${r.date}: ${r.status}`}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium ${
                      r.status === "present"
                        ? "bg-secondary-100 text-secondary-700"
                        : r.status === "absent"
                        ? "bg-red-100 text-danger"
                        : r.status === "leave"
                        ? "bg-accent-100 text-accent-700"
                        : "bg-primary-100 text-primary-600"
                    }`}
                  >
                    {Number(r.date.slice(-2))}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
