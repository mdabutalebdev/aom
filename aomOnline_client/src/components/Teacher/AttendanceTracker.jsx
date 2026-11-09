"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiRefreshCw, FiCheckCircle, FiUsers } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

import Toast from "@/components/Admin/Toast";
import AttendanceDatePicker from "./AttendanceDatePicker";
import {
  AttendanceStudentRow,
  AttendanceStudentCard,
} from "./AttendanceStudentRow";
import { ATTENDANCE_STATUSES, todayKey } from "./attendanceConstants";

/**
 * AttendanceTracker —  Attendance ।
 *   + Student  (   ) +
 * " "  +   ।
 */
const AttendanceTracker = () => {
  const [date, setDate] = useState(todayKey());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -Student  : { [studentId]: true }
  const [saving, setSaving] = useState({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/attendance/my-students?date=${date}`,
        { headers: { ...authHeaders() } }
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data?.data?.students)
          ? data.data.students
          : [];
        setStudents(list);
      } else {
        setError(data.message || "Failed to load your students.");
        setStudents([]);
      }
    } catch {
      setError("Could not connect to the server.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  // Mark (or clear, when status is null) one student — optimistic, with
  // rollback if the request fails.
  const markStudent = async (id, status) => {
    const prev = students;
    setStudents((list) =>
      list.map((s) => (s._id === id ? { ...s, status } : s))
    );
    setSaving((m) => ({ ...m, [id]: true }));

    try {
      const res = status
        ? await fetch(`${API_BASE_URL}/attendance/mark`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ studentId: id, date, status }),
          })
        : await fetch(
            `${API_BASE_URL}/attendance/student/${id}?date=${date}`,
            { method: "DELETE", headers: { ...authHeaders() } }
          );
      const data = await res.json().catch(() => ({}));

      if (!(res.ok && (data.success === undefined || data.success))) {
        setStudents(prev);
        showToast("error", data.message || "Could not save attendance.");
      }
    } catch {
      setStudents(prev);
      showToast("error", "Could not connect to the server.");
    } finally {
      setSaving((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
  };

  //   — POST /attendance/bulk।
  const markAllPresent = async () => {
    if (students.length === 0) return;
    const prev = students;
    setBulkSaving(true);
    // ।
    setStudents((list) => list.map((s) => ({ ...s, status: "present" })));

    try {
      const res = await fetch(`${API_BASE_URL}/attendance/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          date,
          records: prev.map((s) => ({
            studentId: s._id,
            status: "present",
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        showToast("success", "All students marked present.");
      } else {
        setStudents(prev);
        showToast("error", data.message || "Could not mark everyone present.");
      }
    } catch {
      setStudents(prev);
      showToast("error", "Could not connect to the server.");
    } finally {
      setBulkSaving(false);
    }
  };

  //   ।
  const counts = students.reduce(
    (acc, s) => {
      if (s.status && acc[s.status] !== undefined) acc[s.status] += 1;
      return acc;
    },
    { present: 0, absent: 0, leave: 0, holiday: 0 }
  );
  const marked = students.filter((s) => s.status).length;
  const anyDisabled = bulkSaving;

  return (
    <div className="space-y-4">
      <AttendanceDatePicker
        value={date}
        onChange={setDate}
        disabled={loading || bulkSaving}
      />

      {/*   +  */}
      {!loading && !error && students.length > 0 && (
        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {ATTENDANCE_STATUSES.map((s) => (
              <span
                key={s.value}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-50/70 px-2.5 py-1 font-medium text-primary-700"
              >
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                {s.label}
                <span className="tabular-nums font-semibold">
                  {counts[s.value]}
                </span>
              </span>
            ))}
            <span className="text-xs text-primary-400">
              {marked} of {students.length} marked
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStudents()}
              disabled={loading || bulkSaving}
              className="justify-center whitespace-nowrap"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              <span className="ml-1.5">Refresh</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllPresent}
              isLoading={bulkSaving}
              disabled={bulkSaving}
              className="justify-center whitespace-nowrap"
            >
              <FiCheckCircle className="mr-1" /> All Present
            </Button>
          </div>
        </div>
      )}

      {/*  */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchStudents()}>
              Try again
            </Button>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          <FiUsers className="text-3xl text-primary-300" />
          <p>No students are assigned to you yet.</p>
        </div>
      ) : (
        <>
          {/*   */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 text-right font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <AttendanceStudentRow
                    key={s._id || s.studentId}
                    student={s}
                    saving={!!saving[s._id]}
                    disabled={anyDisabled}
                    onMark={(status) => markStudent(s._id, status)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/*    */}
          <div className="space-y-3 md:hidden">
            {students.map((s) => (
              <AttendanceStudentCard
                key={s._id || s.studentId}
                student={s}
                saving={!!saving[s._id]}
                disabled={anyDisabled}
                onMark={(status) => markStudent(s._id, status)}
              />
            ))}
          </div>
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default AttendanceTracker;
