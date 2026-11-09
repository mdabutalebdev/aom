"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FiCalendar } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { WEEKDAYS } from "./scheduleConstants";

const DURATIONS = [15, 20, 30, 45, 60, 90];

const emptyForm = {
  studentId: "",
  days: [],
  startTime: "09:00",
  duration: 30,
  subject: "",
  meetingLink: "",
};

/**
 * ScheduleFormDialog — create or edit one recurring weekly class slot.
 *
 * Only students already assigned to this teacher can be picked: the server
 * derives the slot's teacher from the student's assignment, so offering
 * anyone else would just produce a rejected request.
 */
const ScheduleFormDialog = ({ open, teacherId, schedule, onClose, onSaved }) => {
  const isEdit = Boolean(schedule?.scheduleId);

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { studentId, days, startTime, duration, subject, meetingLink } = form;
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const fetchStudents = useCallback(async () => {
    if (!open || !teacherId) return;
    setLoadingStudents(true);
    try {
      const res = await apiClient.get(`/students?teacher=${teacherId}&limit=100`);
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Non-fatal — the picker just stays empty and the user sees the hint.
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [open, teacherId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  // Seed the form from the row being edited, or reset it for a new slot.
  // Days always start empty — the day timetable only knows about the one day
  // being viewed, not the slot's whole weekly pattern, so pre-filling from it
  // would silently drop the other days on save.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      schedule
        ? {
            studentId: String(schedule.studentRef ?? ""),
            days: [],
            startTime: schedule.startTime ?? "09:00",
            duration: schedule.durationMinutes ?? 30,
            subject: schedule.subject ?? "",
            meetingLink: schedule.meetingLink ?? "",
          }
        : emptyForm,
    );
  }, [open, schedule]);

  const toggleDay = (value) => {
    setForm((f) => ({
      ...f,
      days: f.days.includes(value)
        ? f.days.filter((d) => d !== value)
        : [...f.days, value],
    }));
  };

  const handleSave = async () => {
    if (!isEdit && !studentId) {
      toast.error("Pick a student.");
      return;
    }
    if (days.length === 0) {
      toast.error("Pick at least one day of the week.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        daysOfWeek: days,
        startTime,
        durationMinutes: Number(duration),
        subject: subject.trim() || undefined,
        meetingLink: meetingLink.trim() || undefined,
      };

      if (isEdit) {
        await apiClient.patch(`/schedules/${schedule.scheduleId}`, payload);
        toast.success("Class slot updated.");
      } else {
        await apiClient.post("/schedules", { ...payload, studentId });
        toast.success("Class slot added to the weekly schedule.");
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Could not save this class slot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <FiCalendar className="text-lg" />
            </span>
            <div>
              <DialogTitle>{isEdit ? "Edit Class Slot" : "Add Class Slot"}</DialogTitle>
              <p className="mt-0.5 text-sm text-primary-500">
                Repeats every week on the days you pick.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-800">
                Student
              </label>
              {loadingStudents ? (
                <div className="flex items-center gap-2 py-2 text-sm text-primary-400">
                  <Spinner size="sm" /> Loading students...
                </div>
              ) : students.length === 0 ? (
                <p className="rounded-[var(--radius-lg)] bg-accent-50 px-3 py-2 text-sm text-accent-700">
                  No students are assigned to this teacher yet. Assign one from the
                  Students page first.
                </p>
              ) : (
                <Select
                  value={studentId}
                  onValueChange={(v) => setField("studentId", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pick a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s._id} value={String(s._id)}>
                        {s.name} {s.studentId ? `(${s.studentId})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {isEdit && (
            <p className="rounded-[var(--radius-lg)] bg-primary-50/60 px-3 py-2 text-sm text-primary-600">
              Editing <span className="font-medium">{schedule?.studentName}</span>&apos;s
              weekly slot.
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">
              Days of the week
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => {
                const active = days.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDay(d.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-primary-200 text-primary-600 hover:bg-primary-50"
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
            {isEdit && (
              <p className="mt-1.5 text-xs text-primary-400">
                Pick the days again — saving replaces the current weekly pattern.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-800">
                Start Time
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setField("startTime", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-800">
                Duration
              </label>
              <Select
                value={String(duration)}
                onValueChange={(v) => setField("duration", Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">
              Subject / Topic{" "}
              <span className="font-normal text-primary-400">(optional)</span>
            </label>
            <Input
              value={subject}
              onChange={(e) => setField("subject", e.target.value)}
              placeholder="e.g. Hifz (Surah Yaseen)"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">
              Zoom Link{" "}
              <span className="font-normal text-primary-400">(optional)</span>
            </label>
            <Input
              value={meetingLink}
              onChange={(e) => setField("meetingLink", e.target.value)}
              placeholder="Leave empty to use the teacher's own room"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose?.()} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleFormDialog;
