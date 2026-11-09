"use client";

import React from "react";
import { FiLoader, FiEdit3 } from "react-icons/fi";

import AdminAvatar from "@/components/Admin/AdminAvatar";
import {
  toBanglaDigits,
  formatPercent,
  milestonePercents,
  milestoneLabel,
} from "./progressConstants";

/**
 * MilestoneBar —   :     ;
 * student.percentage    (),  ।
 *        percentage   ।
 */
const MilestoneBar = ({ student }) => {
  const percents = milestonePercents(student);
  const current = Number(student?.percentage) || 0;

  return (
    <div className="w-full">
      <div className="relative">
        {/*   */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-100" />
        {/*   */}
        <div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-500 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, current))}%` }}
        />
        {/*   */}
        <div className="relative flex items-center justify-between">
          {percents.map((p) => {
            const filled = current >= p;
            return (
              <span
                key={p}
                title={milestoneLabel(student, p)}
                className={`flex h-4 w-4 items-center justify-center rounded-full ring-2 transition-colors ${
                  filled
                    ? "bg-primary-500 ring-primary-500"
                    : "bg-surface ring-primary-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    filled ? "bg-white" : "bg-primary-200"
                  }`}
                />
              </span>
            );
          })}
        </div>
      </div>
      {/*   */}
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-primary-400">
        {percents.map((p) => (
          <span key={p} className="w-8 text-center first:text-left last:text-right">
            {toBanglaDigits(p)}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * PercentControls —   ( milestones ) + / ।
 *  onSet(percentage)  । saving/disabled  ।
 */
const PercentControls = ({ student, saving, disabled, onSet }) => {
  const percents = milestonePercents(student);
  const current = Number(student?.percentage) || 0;

  return (
    <div className="space-y-3">
      {/*   */}
      <div className="flex flex-wrap gap-1.5">
        {percents.map((p) => {
          const active = current === p;
          return (
            <button
              key={p}
              type="button"
              disabled={saving || disabled}
              aria-pressed={active}
              onClick={() => onSet(p)}
              className={`rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? "bg-primary-500 text-white ring-primary-500 shadow-soft"
                  : "bg-primary-50 text-primary-700 ring-primary-200 hover:bg-primary-100"
              }`}
            >
              {toBanglaDigits(p)}
            </button>
          );
        })}
      </div>

      {/*  +   */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={current}
          disabled={saving || disabled}
          onChange={(e) => onSet(Number(e.target.value))}
          aria-label="Progress "
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-primary-100 accent-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            value={current}
            disabled={saving || disabled}
            onChange={(e) => {
              const v = Math.min(100, Math.max(0, Number(e.target.value) || 0));
              onSet(v);
            }}
            aria-label="Progress  ()"
            className="w-16 rounded-[var(--radius-md)] border border-primary-200 bg-surface px-2 py-1.5 text-center text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <span className="text-sm text-primary-500">%</span>
        </div>
      </div>
    </div>
  );
};

//    ( +  +  +  +  %)।
const StudentIdentity = ({ student, size = 44 }) => {
  const complete = Number(student?.percentage) === 100;
  return (
    <div className="flex items-center gap-3">
      <AdminAvatar src={student.photo} name={student.name} size={size} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-primary-900">{student.name || "—"}</p>
        <p className="text-xs text-primary-400">
          {student.studentId || "—"}
          {student.className ? ` · ${student.className}` : ""}
        </p>
      </div>
      {complete ? (
        <span className="shrink-0 rounded-full bg-secondary-50 px-2.5 py-1 text-xs font-semibold text-secondary-700 ring-1 ring-inset ring-secondary-200">
            🎉
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-100">
          {formatPercent(student.percentage)}
        </span>
      )}
    </div>
  );
};

// Opens the rich-text message editor for a student. A dot marks students who
// already have a message written.
const MessageButton = ({ student, onClick }) => {
  const has =
    typeof student?.note === "string" &&
    student.note.replace(/<[^>]*>/g, "").trim().length > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-secondary-50 px-2.5 py-1.5 text-xs font-medium text-secondary-700 ring-1 ring-inset ring-secondary-200 transition-colors hover:bg-secondary-100"
    >
      <FiEdit3 className="text-sm" />
      {has ? "Edit Message" : "Add Message"}
      {has && <span className="h-1.5 w-1.5 rounded-full bg-secondary-500" />}
    </button>
  );
};

/**
 * ProgressStudentRow —   :  +   +  ।
 */
export const ProgressStudentRow = ({ student, saving, disabled, onSet, onOpenMessage }) => (
  <tr className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30">
    <td className="px-4 py-4 align-top">
      <StudentIdentity student={student} size={40} />
    </td>
    <td className="px-4 py-4 align-middle" style={{ minWidth: 220 }}>
      <MilestoneBar student={student} />
    </td>
    <td className="px-4 py-4 align-top">
      <div className="flex items-start gap-3">
        {saving && (
          <FiLoader
            className="mt-1 animate-spin text-primary-400"
            aria-label=" "
          />
        )}
        <div className="flex-1 space-y-2.5">
          <PercentControls
            student={student}
            saving={saving}
            disabled={disabled}
            onSet={onSet}
          />
          <MessageButton student={student} onClick={() => onOpenMessage?.(student)} />
        </div>
      </div>
    </td>
  </tr>
);

/**
 * ProgressStudentCard —   ।
 */
export const ProgressStudentCard = ({ student, saving, disabled, onSet, onOpenMessage }) => (
  <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
    <StudentIdentity student={student} size={44} />
    <div className="mt-4">
      <MilestoneBar student={student} />
    </div>
    <div className="mt-4 flex items-start gap-2">
      {saving && (
        <FiLoader
          className="mt-1 animate-spin text-primary-400"
          aria-label=" "
        />
      )}
      <div className="flex-1 space-y-2.5">
        <PercentControls
          student={student}
          saving={saving}
          disabled={disabled}
          onSet={onSet}
        />
        <MessageButton student={student} onClick={() => onOpenMessage?.(student)} />
      </div>
    </div>
  </div>
);

export default ProgressStudentRow;
