"use client";

import React, { useMemo } from "react";
import { FiCalendar, FiClock, FiVideo, FiUser } from "react-icons/fi";

import { WEEKDAYS, formatTime12h } from "@/components/Admin/scheduleConstants";

// 'HH:mm' + duration → '9:00 AM – 9:30 AM'.
const timeRange = (start, end) => {
  if (end) return `${formatTime12h(start)} – ${formatTime12h(end)}`;
  return formatTime12h(start);
};

/**
 * RoutineWeekGrid — a Sun–Sat weekly routine grid shared by the Teacher and
 * Admin "Class Routine" pages. `slots` is the raw weekly schedule list; each
 * slot's `daysOfWeek` places it under every weekday it runs on.
 */
const RoutineWeekGrid = ({ slots = [] }) => {
  const byDay = useMemo(() => {
    const map = {};
    WEEKDAYS.forEach((d) => {
      map[d.value] = [];
    });
    slots.forEach((s) => {
      (s.daysOfWeek || []).forEach((day) => {
        if (map[day] === undefined) return;
        map[day].push(s);
      });
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
    );
    return map;
  }, [slots]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
      {WEEKDAYS.map((d) => {
        const classes = byDay[d.value] || [];
        const off = classes.length === 0;
        return (
          <div
            key={d.value}
            className={`rounded-[var(--radius-lg)] border p-3 shadow-soft ${
              off ? "border-primary-100 bg-surface" : "border-secondary-200 bg-secondary-50/40"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <FiCalendar className={off ? "text-primary-300" : "text-secondary-600"} />
              <p className="font-semibold text-primary-800">{d.label}</p>
            </div>

            {off ? (
              <p className="py-3 text-center text-sm text-primary-300">Off Day</p>
            ) : (
              <div className="space-y-2">
                {classes.map((c, i) => (
                  <div
                    key={`${c._id}-${i}`}
                    className="rounded-[var(--radius-md)] bg-surface p-2.5 ring-1 ring-secondary-100"
                  >
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary-700">
                      <FiClock className="text-xs" />
                      {timeRange(c.startTime, c.endTime)}
                    </p>
                    {c.studentName && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-primary-800">
                        <FiUser className="text-xs text-primary-400" />
                        {c.studentName}
                      </p>
                    )}
                    {c.subject && (
                      <p className="text-xs text-primary-400">{c.subject}</p>
                    )}
                    {c.meetingLink && (
                      <a
                        href={c.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800"
                      >
                        <FiVideo className="text-xs" /> Join Class
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoutineWeekGrid;
