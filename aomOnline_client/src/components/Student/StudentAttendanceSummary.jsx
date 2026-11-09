"use client";

import React from "react";

import Card from "@/components/ui/Card";
import { toBanglaDigits } from "./studentDashboardConstants";

/**
 * StudentAttendanceSummary —   ।
 *  /  /  /   —  ।
 */
const StudentAttendanceSummary = ({ summary }) => {
  const s = summary || {};

  const cards = [
    {
      key: "present",
      label: "Present",
      value: s.present || 0,
      tint: "bg-secondary-50 ring-secondary-200",
      valueClass: "text-secondary-700",
    },
    {
      key: "absent",
      label: "Absent",
      value: s.absent || 0,
      tint: "bg-red-50 ring-red-200",
      valueClass: "text-danger",
    },
    {
      key: "leave",
      label: "Leave",
      value: s.leave || 0,
      tint: "bg-accent-50 ring-accent-200",
      valueClass: "text-accent-700",
    },
    {
      key: "total",
      label: "Total",
      value: s.total || 0,
      tint: "bg-primary-50 ring-primary-200",
      valueClass: "text-primary-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <Card
          key={c.key}
          className={`p-4 ring-1 ring-inset ${c.tint}`}
        >
          <p className="text-sm font-medium text-primary-500">{c.label}</p>
          <p className={`mt-1 text-2xl font-bold ${c.valueClass}`}>
            {toBanglaDigits(c.value)}
          </p>
        </Card>
      ))}
    </div>
  );
};

export default StudentAttendanceSummary;
