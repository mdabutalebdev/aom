"use client";

import React from "react";
import { FiLoader } from "react-icons/fi";

import AdminAvatar from "@/components/Admin/AdminAvatar";
import { ATTENDANCE_STATUSES, STATUS_META } from "./attendanceConstants";

/**
 * StatusToggle — one connected segmented control per student.
 *
 * Rendered as a single bordered group rather than four loose buttons so it
 * reads as one setting with one selected value. Clicking the active segment
 * again clears the mark, which is the only way to undo a mis-tap.
 */
const StatusToggle = ({ status, saving, disabled, onMark, compact = false }) => (
  <div
    role="radiogroup"
    aria-label="Attendance status"
    className="inline-flex overflow-hidden rounded-full border border-primary-200 bg-primary-50/40 p-0.5"
  >
    {ATTENDANCE_STATUSES.map((s) => {
      const active = status === s.value;
      const Icon = s.icon;
      return (
        <button
          key={s.value}
          type="button"
          role="radio"
          aria-checked={active}
          aria-label={s.label}
          title={s.label}
          disabled={saving || disabled}
          onClick={() => onMark(active ? null : s.value)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            active
              ? s.activeClass
              : "text-primary-500 hover:bg-white hover:text-primary-700"
          }`}
        >
          <Icon className="text-sm" />
          <span className={compact ? "sr-only sm:not-sr-only" : ""}>
            {s.label}
          </span>
        </button>
      );
    })}
  </div>
);

/**
 * AttendanceStudentRow — desktop table row: student identity + status toggle.
 */
export const AttendanceStudentRow = ({ student, saving, disabled, onMark }) => {
  const meta = STATUS_META[student.status];

  return (
    <tr className="border-b border-primary-50 transition-colors last:border-0 hover:bg-primary-50/30">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="relative">
            <AdminAvatar src={student.photo} name={student.name} size={36} />
            {/* Colour dot doubles the status signal so a row's state is
                readable without scanning across to the toggle. */}
            {meta && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[var(--color-surface)] ${meta.dot}`}
              />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-primary-900">
              {student.name || "—"}
            </p>
            <p className="truncate text-xs text-primary-400">
              {student.studentId || "—"}
              {student.className ? ` · ${student.className}` : ""}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center justify-end gap-2">
          {saving && (
            <FiLoader className="animate-spin text-primary-400" aria-label="Saving" />
          )}
          <StatusToggle
            status={student.status}
            saving={saving}
            disabled={disabled}
            onMark={onMark}
            compact
          />
        </div>
      </td>
    </tr>
  );
};

/**
 * AttendanceStudentCard — mobile equivalent of the row above.
 */
export const AttendanceStudentCard = ({ student, saving, disabled, onMark }) => {
  const meta = STATUS_META[student.status];

  return (
    <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-3.5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="relative">
          <AdminAvatar src={student.photo} name={student.name} size={40} />
          {meta && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[var(--color-surface)] ${meta.dot}`}
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-primary-900">
            {student.name || "—"}
          </p>
          <p className="truncate text-xs text-primary-400">
            {student.studentId || "—"}
            {student.className ? ` · ${student.className}` : ""}
          </p>
        </div>
        {saving && (
          <FiLoader className="animate-spin text-primary-400" aria-label="Saving" />
        )}
      </div>
      <div className="mt-3 flex justify-center">
        <StatusToggle
          status={student.status}
          saving={saving}
          disabled={disabled}
          onMark={onMark}
        />
      </div>
    </div>
  );
};

export default AttendanceStudentRow;
