"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import apiClient from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyForm = {
  name: "",
  classRef: "",
  teacherRef: "",
  scheduleDays: [],
  startTime: "",
  endTime: "",
  monthlyFee: "",
  teacherPayout: "",
  status: "active",
};

/**
 * GroupFormModal — create or edit a Group (batch): its class, teacher, schedule,
 * monthly fee and the flat teacher payout for the whole group.
 */
const GroupFormModal = ({ open, onClose, onSaved, initial, classes = [], teachers = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?._id;

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      initial
        ? {
            name: initial.name || "",
            classRef: initial.classRef?._id || initial.classRef || "",
            teacherRef: initial.teacherRef?._id || initial.teacherRef || "",
            scheduleDays: initial.scheduleDays || [],
            startTime: initial.startTime || "",
            endTime: initial.endTime || "",
            monthlyFee: initial.monthlyFee != null ? String(initial.monthlyFee) : "",
            teacherPayout: initial.teacherPayout != null ? String(initial.teacherPayout) : "",
            status: initial.status || "active",
          }
        : emptyForm,
    );
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onClassChange = (value) => {
    setForm((f) => {
      const next = { ...f, classRef: value };
      const cls = classes.find((c) => c._id === value);
      if (cls && !isEdit && f.monthlyFee === "") next.monthlyFee = String(cls.monthlyFee ?? "");
      return next;
    });
  };

  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      scheduleDays: f.scheduleDays.includes(day)
        ? f.scheduleDays.filter((d) => d !== day)
        : [...f.scheduleDays, day],
    }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Enter a group / batch name.");
    if (!form.classRef) return toast.error("Select a class.");
    if (!form.teacherRef) return toast.error("Select a teacher.");
    if (form.monthlyFee === "" || Number(form.monthlyFee) < 0)
      return toast.error("Enter a valid monthly fee.");

    const payload = {
      name: form.name.trim(),
      classRef: form.classRef,
      teacherRef: form.teacherRef,
      scheduleDays: form.scheduleDays,
      startTime: form.startTime.trim() || undefined,
      endTime: form.endTime.trim() || undefined,
      monthlyFee: Number(form.monthlyFee),
      teacherPayout: form.teacherPayout === "" ? 0 : Number(form.teacherPayout),
      status: form.status,
    };

    setSaving(true);
    try {
      if (isEdit) await apiClient.patch(`/groups/${initial._id}`, payload);
      else await apiClient.post("/groups", payload);
      toast.success(isEdit ? "Group updated." : "Group created.");
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Could not save the group.");
    } finally {
      setSaving(false);
    }
  };

  const classOptions = classes.map((c) => ({ value: c._id, label: c.nameEn || c.name }));
  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: t.userRef?.name || t.teacherId || "—",
  }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Group" : "Create Group"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            id="group-name"
            label="Group / Batch Name"
            placeholder="e.g. Batch 101"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="group-class"
              label="Class"
              placeholder="Select class"
              options={classOptions}
              value={form.classRef}
              onChange={(e) => onClassChange(e.target.value)}
            />
            <Select
              id="group-teacher"
              label="Teacher"
              placeholder="Select teacher"
              options={teacherOptions}
              value={form.teacherRef}
              onChange={(e) => set("teacherRef", e.target.value)}
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-primary-800">Schedule Days</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const on = form.scheduleDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      on
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-primary-200 text-primary-600 hover:bg-primary-50"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="group-start"
              label="Start Time"
              placeholder="e.g. 6:00 PM"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
            <Input
              id="group-end"
              label="End Time"
              placeholder="e.g. 7:00 PM"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="group-fee"
              type="number"
              min="0"
              label="Monthly Fee (৳)"
              placeholder="e.g. 3000"
              value={form.monthlyFee}
              onChange={(e) => set("monthlyFee", e.target.value)}
              hint="Default fee for each student in the group."
            />
            <Input
              id="group-payout"
              type="number"
              min="0"
              label="Teacher Payout — flat (৳)"
              placeholder="e.g. 5000"
              value={form.teacherPayout}
              onChange={(e) => set("teacherPayout", e.target.value)}
              hint="What the teacher earns for this whole group."
            />
          </div>

          <Select
            id="group-status"
            label="Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose?.()} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={saving} disabled={saving}>
            {isEdit ? "Save Changes" : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupFormModal;
