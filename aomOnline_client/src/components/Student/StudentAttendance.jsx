"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

import Card from "@/components/ui/Card";
import {
  toBanglaDigits,
  BANGLA_MONTHS,
  ATTENDANCE_STATUS_META,
  ATTENDANCE_LEGEND,
  daysInMonth,
} from "./studentDashboardConstants";

/**
 * StudentAttendance —  Attendance  ।
 *      ;  +  
 * (◀  /  ▶)  ?month=&year=   ।
 */
const StudentAttendance = ({
  attendance,
  month,
  year,
  onPrev,
  onNext,
  canGoNext,
  loading,
}) => {
  const a = attendance || {};

  //  →   (API days[] )।
  const statusByDay = {};
  (Array.isArray(a.days) ? a.days : []).forEach((d) => {
    if (d && d.day != null) statusByDay[d.day] = d.status;
  });

  const total = daysInMonth(year, month);
  const cells = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <Card className="p-5 sm:p-6">
      {/*  +   */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100">
            <FiCalendar />
          </span>
          <div>
            <h3 className="text-lg font-bold text-primary-900">Attendance</h3>
            <p className="text-xs text-primary-400">
              {BANGLA_MONTHS[month - 1]} {toBanglaDigits(year)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={loading}
            aria-label=" "
            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiChevronLeft /> 
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={loading || !canGoNext}
            aria-label=" "
            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
             <FiChevronRight />
          </button>
        </div>
      </div>

      {/*   */}
      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-8 xl:grid-cols-10">
        {cells.map((day) => {
          const status = statusByDay[day];
          const meta = status ? ATTENDANCE_STATUS_META[status] : null;
          return (
            <div
              key={day}
              className={`flex aspect-square flex-col items-center justify-center rounded-[var(--radius-md)] text-xs ring-1 ring-inset transition-colors ${
                meta
                  ? meta.cellClass
                  : "bg-surface-soft text-primary-400 ring-primary-100"
              }`}
              title={meta ? meta.label : ""}
            >
              <span className="font-semibold leading-none">
                {toBanglaDigits(day)}
              </span>
              {meta && meta.mark && (
                <span className="mt-0.5 text-sm leading-none">{meta.mark}</span>
              )}
            </div>
          );
        })}
      </div>

      {/*  */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        {ATTENDANCE_LEGEND.map((key) => {
          const meta = ATTENDANCE_STATUS_META[key];
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600"
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full ${meta.dotClass}`}
              />
              {meta.label}
            </span>
          );
        })}
      </div>
    </Card>
  );
};

export default StudentAttendance;
