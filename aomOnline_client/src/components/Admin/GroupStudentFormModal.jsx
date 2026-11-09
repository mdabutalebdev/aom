"use client";

import { useEffect, useMemo, useState } from "react";
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
import { formatTaka } from "./managementConstants";

const emptyForm = {
  groupRef: "",
  name: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianPassword: "",
  monthlyFee: "",
  status: "active",
};

/**
 * GroupStudentFormModal — add or edit a group-class student. The teacher, class
 * and schedule come from the chosen group; here the admin only enters the
 * student's own details and their own guardian (with an optional login).
 */
const GroupStudentFormModal = ({ open, onClose, onSaved, initial, groups = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?._id;
  const hasGuardianAccount = !!initial?.userRef;

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      initial
        ? {
            groupRef: initial.groupRef?._id || initial.groupRef || "",
            name: initial.name || "",
            guardianName: initial.guardianName || "",
            guardianPhone: initial.guardianPhone || "",
            guardianEmail: initial.userRef?.email || "",
            guardianPassword: "",
            monthlyFee: initial.monthlyFee != null ? String(initial.monthlyFee) : "",
            status: initial.status || "active",
          }
        : emptyForm,
    );
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedGroup = useMemo(
    () => groups.find((g) => g._id === form.groupRef) || null,
    [groups, form.groupRef],
  );

  const onGroupChange = (value) => {
    setForm((f) => {
      const next = { ...f, groupRef: value };
      const g = groups.find((x) => x._id === value);
      // Pre-fill the fee from the group (still editable as an override).
      if (g && f.monthlyFee === "") next.monthlyFee = String(g.monthlyFee ?? "");
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.groupRef) return toast.error("Select a group.");
    if (!form.name.trim()) return toast.error("Enter the student's name.");
    if (form.guardianPassword && form.guardianPassword.length < 6)
      return toast.error("Guardian password must be at least 6 characters.");
    // Creating a guardian login needs email + password together.
    const wantsAccount = form.guardianEmail.trim() || form.guardianPassword;
    if (!isEdit && wantsAccount && !(form.guardianEmail.trim() && form.guardianPassword.length >= 6))
      return toast.error("Give both a guardian email and a 6+ char password, or leave both blank.");

    const payload = {
      name: form.name.trim(),
      groupRef: form.groupRef,
      guardianName: form.guardianName.trim() || undefined,
      guardianPhone: form.guardianPhone.trim() || undefined,
      ...(form.monthlyFee !== "" ? { monthlyFee: Number(form.monthlyFee) } : {}),
      ...(form.guardianEmail.trim() || form.guardianPassword
        ? {
            guardianEmail: form.guardianEmail.trim(),
            ...(form.guardianPassword ? { guardianPassword: form.guardianPassword } : {}),
          }
        : {}),
      ...(isEdit ? { status: form.status } : {}),
    };

    setSaving(true);
    try {
      if (isEdit) await apiClient.patch(`/students/${initial._id}`, payload);
      else await apiClient.post("/students", payload);
      toast.success(isEdit ? "Student updated." : "Group student added.");
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Could not save the student.");
    } finally {
      setSaving(false);
    }
  };

  const groupOptions = groups.map((g) => ({
    value: g._id,
    label: `${g.name} — ${g.teacherRef?.userRef?.name || "teacher"}`,
  }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Group Student" : "Add Group Class Student"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            id="gs-group"
            label="Group"
            placeholder="Select group"
            options={groupOptions}
            value={form.groupRef}
            onChange={(e) => onGroupChange(e.target.value)}
          />

          {selectedGroup && (
            <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/40 px-4 py-2.5 text-sm text-primary-600">
              <span className="text-primary-400">Class: </span>
              {selectedGroup.classRef?.nameEn || selectedGroup.classRef?.name || "—"}
              <span className="mx-2 text-primary-300">·</span>
              <span className="text-primary-400">Teacher: </span>
              {selectedGroup.teacherRef?.userRef?.name || "—"}
              <span className="mx-2 text-primary-300">·</span>
              <span className="text-primary-400">Schedule: </span>
              {(selectedGroup.scheduleDays || []).join(", ")}
              {selectedGroup.startTime ? ` ${selectedGroup.startTime}` : ""}
              {selectedGroup.endTime ? ` - ${selectedGroup.endTime}` : ""}
            </div>
          )}

          <Input
            id="gs-name"
            label="Student Name"
            placeholder="Student's full name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />

          <Input
            id="gs-fee"
            type="number"
            min="0"
            label="Monthly Fee (৳)"
            placeholder="Auto from group"
            value={form.monthlyFee}
            onChange={(e) => set("monthlyFee", e.target.value)}
            hint="Pre-filled from the group — change it for this student if needed."
          />

          <div className="border-t border-primary-50 pt-3">
            <p className="mb-2 text-sm font-semibold text-primary-800">Guardian</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="gs-gname"
                label="Guardian Name (Optional)"
                placeholder="Guardian's name"
                value={form.guardianName}
                onChange={(e) => set("guardianName", e.target.value)}
              />
              <Input
                id="gs-gphone"
                label="Guardian Phone (Optional)"
                placeholder="e.g. 017XXXXXXXX"
                value={form.guardianPhone}
                onChange={(e) => set("guardianPhone", e.target.value)}
              />
              <Input
                id="gs-gemail"
                type="email"
                autoComplete="off"
                label="Guardian Login Email (Optional)"
                placeholder="guardian@example.com"
                value={form.guardianEmail}
                onChange={(e) => set("guardianEmail", e.target.value)}
              />
              <Input
                id="gs-gpass"
                type="password"
                autoComplete="new-password"
                label={hasGuardianAccount ? "Update Guardian Password" : "Guardian Login Password (Optional)"}
                placeholder={hasGuardianAccount ? "Leave blank to keep current" : "At least 6 characters"}
                value={form.guardianPassword}
                onChange={(e) => set("guardianPassword", e.target.value)}
              />
            </div>
          </div>

          {isEdit && (
            <Select
              id="gs-status"
              label="Status"
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose?.()} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={saving} disabled={saving}>
            {isEdit ? "Save Changes" : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupStudentFormModal;
