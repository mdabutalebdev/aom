"use client";

import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { COURSE_ICON_OPTIONS, getCourseIcon } from "@/components/shared/courseIcons";

// Empty form state.
const emptyForm = {
  name: "",
  nameEn: "",
  monthlyFee: "",
  order: "",
  description: "",
  icon: "",
  milestones: [],
};

/**
 * ClassForm — Class create/edit form fields + milestones editor.
 * Rendered on its own details page (not a modal) so the Save button never
 * falls below the viewport regardless of how many milestones are added.
 * Calls onSubmit(payload) with a validated payload; the parent page performs
 * the API call and navigates away on success.
 */
const ClassForm = ({
  initial = null,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const isEdit = !!initial;
  const SelectedIcon = getCourseIcon(form.icon);

  // Sync form when the initial class arrives (edit) or resets (create).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors({});
    setForm(
      initial
        ? {
            name: initial.name || "",
            nameEn: initial.nameEn || "",
            monthlyFee:
              initial.monthlyFee != null ? String(initial.monthlyFee) : "",
            order: initial.order != null ? String(initial.order) : "",
            description: initial.description || "",
            icon: initial.icon || "",
            milestones: Array.isArray(initial.milestones)
              ? initial.milestones.map((m) => ({
                  percent: m.percent != null ? String(m.percent) : "",
                  label: m.label || "",
                }))
              : [],
          }
        : emptyForm
    );
  }, [initial]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Milestone row helpers.
  const addMilestone = () =>
    setForm((f) => ({
      ...f,
      milestones: [...f.milestones, { percent: "", label: "" }],
    }));

  const removeMilestone = (idx) =>
    setForm((f) => ({
      ...f,
      milestones: f.milestones.filter((_, i) => i !== idx),
    }));

  const setMilestone = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      milestones: f.milestones.map((m, i) =>
        i === idx ? { ...m, [key]: value } : m
      ),
    }));

  // Validation + create payload.
  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Class name is required.";
    if (form.monthlyFee === "" || Number(form.monthlyFee) < 0)
      next.monthlyFee = "Enter a valid monthly fee.";
    if (form.order === "" || Number.isNaN(Number(form.order)))
      next.order = "Enter a valid order.";

    // Milestone percent validation.
    for (const m of form.milestones) {
      if (m.percent === "" || Number.isNaN(Number(m.percent))) {
        next.milestones = "Enter a valid percentage for each milestone.";
        break;
      }
    }

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim(),
      monthlyFee: Number(form.monthlyFee),
      order: Number(form.order),
      description: form.description.trim(),
      icon: form.icon,
      milestones: form.milestones.map((m) => ({
        percent: Number(m.percent),
        ...(m.label.trim() ? { label: m.label.trim() } : {}),
      })),
    };

    onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="name"
          label="Class Name"
          placeholder="e.g. Qaida"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          error={errors.name}
        />
        <Input
          id="nameEn"
          label="English Name (Optional)"
          placeholder="Qaida"
          value={form.nameEn}
          onChange={(e) => setField("nameEn", e.target.value)}
        />
        <Input
          id="monthlyFee"
          type="number"
          min="0"
          label="Monthly Fee (৳)"
          placeholder="500"
          value={form.monthlyFee}
          onChange={(e) => setField("monthlyFee", e.target.value)}
          error={errors.monthlyFee}
        />
        <Input
          id="order"
          type="number"
          label="Order"
          placeholder="1"
          value={form.order}
          onChange={(e) => setField("order", e.target.value)}
          error={errors.order}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-primary-800"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Brief description about the class..."
          className="w-full rounded-[var(--radius-md)] border border-primary-200 bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        />
      </div>

      <div className="flex items-end gap-3">
        <Select
          id="icon"
          label="Icon (Shown on homepage)"
          containerClassName="flex-1"
          value={form.icon}
          onChange={(e) => setField("icon", e.target.value)}
          options={COURSE_ICON_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          placeholder="Default icon will be used"
        />
        <div
          className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"
          title="Preview"
        >
          <SelectedIcon className="text-lg" />
        </div>
      </div>

      {/* Milestone Editor */}
      <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-primary-800">
            Progress Milestones (Optional)
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={addMilestone}>
            <FiPlus className="mr-1" /> Add
          </Button>
        </div>

        {form.milestones.length === 0 ? (
          <p className="text-sm text-primary-400">No milestones added.</p>
        ) : (
          <div className="space-y-3">
            {form.milestones.map((m, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="w-28 shrink-0">
                  <Input
                    id={`milestone-percent-${idx}`}
                    type="number"
                    min="0"
                    max="100"
                    label="Percentage (%)"
                    placeholder="50"
                    value={m.percent}
                    onChange={(e) => setMilestone(idx, "percent", e.target.value)}
                  />
                </div>
                <Input
                  id={`milestone-label-${idx}`}
                  label="Label (Optional)"
                  placeholder="e.g. Half Completed"
                  value={m.label}
                  onChange={(e) => setMilestone(idx, "label", e.target.value)}
                  containerClassName="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeMilestone(idx)}
                  aria-label="Delete milestone"
                  className="mb-1 shrink-0 rounded-[var(--radius-md)] p-2.5 text-danger transition-colors hover:bg-red-50"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.milestones && (
          <p className="mt-2 text-sm text-danger">{errors.milestones}</p>
        )}
      </div>

      {/* Actions — always on the page flow, never off-screen. */}
      <div className="flex justify-end gap-2 border-t border-primary-100 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" disabled={loading} isLoading={loading}>
          <FiSave className="mr-1.5" />
          {submitLabel || (isEdit ? "Update Class" : "Create Class")}
        </Button>
      </div>
    </form>
  );
};

export default ClassForm;
