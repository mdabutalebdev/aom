"use client";

import React from "react";
import { FiHash, FiUser, FiBookOpen } from "react-icons/fi";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import AdminAvatar from "@/components/Admin/AdminAvatar";

/**
 * StudentProfileCard — student summary shown on the Student and Guardian
 * dashboards: avatar + name + "Student" badge, the ID / name / teacher detail
 * rows, and a short hadith on seeking knowledge.
 */
const StudentProfileCard = ({ student }) => {
  const s = student || {};

  const rows = [
    {
      icon: <FiHash />,
      label: "Student ID",
      value: s.studentId || "—",
    },
    {
      icon: <FiUser />,
      label: "Name",
      value: s.name || "—",
    },
    {
      icon: <FiBookOpen />,
      label: "Teacher",
      value: s.teacherName || "—",
    },
  ];

  return (
    <Card className="overflow-hidden">
      {/* Avatar + name + role badge */}
      <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-5">
        <div className="rounded-full bg-secondary-50 p-1.5 ring-4 ring-secondary-100">
          <AdminAvatar src={s.photo} name={s.name} size={104} />
        </div>
        <h2 className="text-center text-xl font-bold text-primary-900">
          {s.name || "—"}
        </h2>
        <Badge variant="success" className="gap-1.5 px-4 py-1 text-sm">
          🎓 Student
        </Badge>
      </div>

      <div className="mx-6 border-t border-primary-100" />

      {/* Detail rows */}
      <div className="space-y-4 px-6 py-5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100">
              {r.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary-400">{r.label}</p>
              <p className="truncate font-semibold text-primary-900">
                {r.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Hadith on seeking knowledge */}
      <div className="mx-6 mb-6 rounded-[var(--radius-lg)] bg-surface-muted p-5 ring-1 ring-primary-100">
        <p className="text-center text-3xl leading-none text-primary-300" aria-hidden="true">
          &ldquo;
        </p>
        <p className="mt-1 text-center text-sm leading-relaxed text-primary-700">
          Seeking knowledge is obligatory upon every Muslim.
        </p>
        <p className="mt-3 text-center text-xs font-medium text-secondary-600">
          — Prophet Muhammad ﷺ
        </p>
      </div>
    </Card>
  );
};

export default StudentProfileCard;
