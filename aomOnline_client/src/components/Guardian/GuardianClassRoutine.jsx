"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiCalendar, FiClock, FiVideo, FiInbox, FiGlobe } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { WEEKDAYS, formatTime12h } from "@/components/Admin/scheduleConstants";
import { convertDhakaSlot, browserTimezone } from "@/lib/timezone";

// 'HH:mm' + duration → '9:00 AM – 9:30 AM'.
const timeRange = (hhmm, duration) => {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (Number.isNaN(h)) return formatTime12h(hhmm);
  const end = new Date(Date.UTC(2000, 0, 1, h, m + (Number(duration) || 30)));
  const endStr = `${String(end.getUTCHours()).padStart(2, "0")}:${String(
    end.getUTCMinutes(),
  ).padStart(2, "0")}`;
  return `${formatTime12h(hhmm)} – ${formatTime12h(endStr)}`;
};

/**
 * GuardianClassRoutine — the student's weekly class routine (Sun–Sat), built
 * from the recurring schedule the madrasa set. Times are converted from the
 * teacher's timezone (Dhaka) to the guardian's own timezone automatically.
 */
const GuardianClassRoutine = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const viewerTz = useMemo(() => browserTimezone(), []);

  const fetchRoutine = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/schedules/my");
      setSlots(res.data?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load the class routine.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoutine();
  }, [fetchRoutine]);

  // Convert every (Dhaka day + time) slot to the viewer's timezone, then group
  // by the viewer's local weekday. A class three days a week appears under each.
  const byDay = useMemo(() => {
    const map = {};
    WEEKDAYS.forEach((d) => {
      map[d.value] = [];
    });
    slots.forEach((s) => {
      (s.daysOfWeek || []).forEach((dhakaDay) => {
        const conv = convertDhakaSlot(dhakaDay, s.startTime, viewerTz);
        if (!conv || map[conv.day] === undefined) return;
        map[conv.day].push({
          slot: s,
          localHHmm: conv.hhmm,
          localTime: conv.time,
          dhakaTime: formatTime12h(s.startTime),
        });
      });
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => String(a.localHHmm).localeCompare(String(b.localHHmm))),
    );
    return map;
  }, [slots, viewerTz]);

  const hasAnyClass = slots.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchRoutine}>
          Try again
        </Button>
      </div>
    );
  }

  if (!hasAnyClass) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
        <FiInbox className="text-3xl text-primary-300" />
        <p>Your class routine hasn&apos;t been set yet.</p>
        <p className="text-sm text-primary-400">
          Please contact the madrasa to arrange your class times.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Timezone note */}
      <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-lg)] bg-primary-50/60 px-3 py-2 text-sm text-primary-600">
        <FiGlobe className="shrink-0 text-primary-500" />
        <span>
          Times are shown in <span className="font-semibold">your timezone ({viewerTz})</span>.
          The Dhaka time is noted under each class.
        </span>
      </div>

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
                      key={`${c.slot._id}-${i}`}
                      className="rounded-[var(--radius-md)] bg-surface p-2.5 ring-1 ring-secondary-100"
                    >
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary-700">
                        <FiClock className="text-xs" />
                        {timeRange(c.localHHmm, c.slot.durationMinutes)}
                      </p>
                      <p className="text-[11px] text-primary-400">Dhaka: {c.dhakaTime}</p>
                      {c.slot.subject && (
                        <p className="mt-0.5 text-sm text-primary-800">{c.slot.subject}</p>
                      )}
                      {c.slot.teacherRef?.userRef?.name && (
                        <p className="text-xs text-primary-400">
                          {c.slot.teacherRef.userRef.name}
                        </p>
                      )}
                      {c.slot.meetingLink && (
                        <a
                          href={c.slot.meetingLink}
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
    </div>
  );
};

export default GuardianClassRoutine;
