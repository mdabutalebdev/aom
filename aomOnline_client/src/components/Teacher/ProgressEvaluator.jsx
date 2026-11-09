"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiRefreshCw, FiUsers } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

import Toast from "@/components/Admin/Toast";
import {
  ProgressStudentRow,
  ProgressStudentCard,
} from "./ProgressStudentRow";
import ProgressMessageModal from "./ProgressMessageModal";
import { toBanglaDigits } from "./progressConstants";

/**
 * ProgressEvaluator — Teacher Student Progress ।
 *  Student    + /     
 * (  + PATCH /progress/student/:_id + )।
 */
const ProgressEvaluator = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -Student  : { [_id]: true }
  const [saving, setSaving] = useState({});
  const [toast, setToast] = useState(null);

  // Rich-text message editor: the student being edited + its save state.
  const [messageTarget, setMessageTarget] = useState(null);
  const [savingNote, setSavingNote] = useState(false);

  //   (      )।
  const debounceRef = useRef({});

  const showToast = (type, message) => setToast({ type, message });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/progress/my-students`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data?.data?.students)
          ? data.data.students
          : [];
        setStudents(list);
      } else {
        setError(data.message || "Student    ।");
        setStudents([]);
      }
    } catch {
      setError("    ।");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  //    (:_id = Student Mongo _id)।
  const persist = useCallback(
    async (id, percentage, prevList) => {
      setSaving((m) => ({ ...m, [id]: true }));
      try {
        const res = await fetch(`${API_BASE_URL}/progress/student/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ percentage }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && (data.success === undefined || data.success)) {
          if (percentage === 100) {
            showToast("success", "🎉  ! Progress  ।");
          }
        } else {
          setStudents(prevList); // 
          showToast("error", data.message || "Progress   ।");
        }
      } catch {
        setStudents(prevList); // 
        showToast("error", "    ।");
      } finally {
        setSaving((m) => {
          const next = { ...m };
          delete next[id];
          return next;
        });
      }
    },
    []
  );

  //    —   +  persist।
  const setPercentage = (id, percentage) => {
    const clamped = Math.min(100, Math.max(0, Number(percentage) || 0));
    let prevList;
    setStudents((list) => {
      prevList = list;
      return list.map((s) =>
        s._id === id ? { ...s, percentage: clamped } : s
      );
    });

    // :   ~ms  ; prevList  ।
    if (debounceRef.current[id]) clearTimeout(debounceRef.current[id]);
    debounceRef.current[id] = setTimeout(() => {
      delete debounceRef.current[id];
      persist(id, clamped, prevList);
    }, 400);
  };

  // Save the rich-text message. The progress endpoint requires percentage, so
  // we resend the student's current value alongside the note.
  const saveNote = async (note) => {
    if (!messageTarget) return;
    const id = messageTarget._id;
    setSavingNote(true);
    try {
      const res = await fetch(`${API_BASE_URL}/progress/student/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          percentage: Number(messageTarget.percentage) || 0,
          note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === undefined || data.success)) {
        setStudents((list) =>
          list.map((s) => (s._id === id ? { ...s, note } : s))
        );
        setMessageTarget(null);
        showToast("success", "Message saved.");
      } else {
        showToast("error", data.message || "Could not save the message.");
      }
    } catch {
      showToast("error", "Could not connect to server.");
    } finally {
      setSavingNote(false);
    }
  };

  const completedCount = students.filter(
    (s) => Number(s.percentage) === 100
  ).length;

  return (
    <div className="space-y-4">
      {/*   +  */}
      {!loading && !error && students.length > 0 && (
        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 font-medium text-primary-700 ring-1 ring-inset ring-primary-100">
               {toBanglaDigits(students.length)}  Student
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-50 px-2.5 py-1 font-medium text-secondary-700 ring-1 ring-inset ring-secondary-200">
              {toBanglaDigits(completedCount)}   🎉
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStudents()}
            disabled={loading}
            className="justify-center"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5"></span>
          </Button>
        </div>
      )}

      {/*  */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500"> ...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchStudents()}>
                
            </Button>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          <FiUsers className="text-3xl text-primary-300" />
          <p>  Student  ।</p>
        </div>
      ) : (
        <>
          {/*   */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft lg:block">
            <table className="w-full min-w-[840px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium"></th>
                  <th className="px-4 py-3 font-medium">Progress </th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <ProgressStudentRow
                    key={s._id || s.studentId}
                    student={s}
                    saving={!!saving[s._id]}
                    disabled={false}
                    onSet={(p) => setPercentage(s._id, p)}
                    onOpenMessage={setMessageTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* /   */}
          <div className="space-y-3 lg:hidden">
            {students.map((s) => (
              <ProgressStudentCard
                key={s._id || s.studentId}
                student={s}
                saving={!!saving[s._id]}
                disabled={false}
                onSet={(p) => setPercentage(s._id, p)}
                onOpenMessage={setMessageTarget}
              />
            ))}
          </div>
        </>
      )}

      <ProgressMessageModal
        isOpen={!!messageTarget}
        student={messageTarget}
        saving={savingNote}
        onClose={() => setMessageTarget(null)}
        onSave={saveNote}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default ProgressEvaluator;
