"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

import {
  toDateKey,
  parseDateKey,
  todayKey,
  formatBanglaDate,
} from "./attendanceConstants";

/**
 * AttendanceDatePicker —  ।
 * ◀   /   ▶  +  date input +  / ।
 *   onChange(newDateKey)  ।
 */
const AttendanceDatePicker = ({ value, onChange, disabled = false }) => {
  const shift = (days) => {
    const d = parseDateKey(value);
    d.setDate(d.getDate() + days);
    onChange(toDateKey(d));
  };

  const isToday = value === todayKey();

  return (
    <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-3 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={disabled}
            aria-label="Previous day"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiChevronLeft className="text-lg" />
          </button>

          <div className="min-w-[230px] text-center">
            <p className="text-sm font-semibold text-primary-900">
              {formatBanglaDate(value)}
            </p>
            {isToday && (
              <span className="mt-0.5 inline-block rounded-full bg-secondary-50 px-2 py-0.5 text-[11px] font-medium text-secondary-700">
                Today
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => shift(1)}
            disabled={disabled || isToday}
            aria-label="Next day"
            title={isToday ? "Future dates cannot be marked" : "Next day"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight className="text-lg" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="attendance-date"
            className="inline-flex items-center gap-1.5 text-sm text-primary-500"
          >
            <FiCalendar />
            <span className="sr-only sm:not-sr-only">Date</span>
          </label>
          <input
            id="attendance-date"
            type="date"
            value={value}
            max={todayKey()}
            disabled={disabled}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="rounded-[var(--radius-md)] border border-primary-200 bg-surface px-3 py-1.5 text-sm text-primary-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:opacity-50"
          />
          {!isToday && (
            <button
              type="button"
              onClick={() => onChange(todayKey())}
              disabled={disabled}
              className="whitespace-nowrap rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
            >
              Today
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDatePicker;
