"use client";

import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import {
  RESULT_PRESETS,
  THEME_OPTIONS,
  rowTotal,
} from "./resultConstants";

const emptyRow = () => ({ name: "", country: "", mark1: "", mark2: "" });

const emptyForm = {
  title: "Result Of Final Exam",
  level: "",
  subject1Label: "",
  subject1Max: "50",
  subject2Label: "",
  subject2Max: "50",
  totalMax: "100",
  theme: "cyan",
  rows: [emptyRow()],
};

/**
 * ExamResultFormModal — create/edit an exam result sheet. A level preset
 * pre-fills the column labels/totals/colour, but every field stays editable.
 * Students are added as rows; Total is computed automatically and the top three
 * rows become 1st/2nd/3rd on the sheet.
 */
const ExamResultFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initial = null,
  loading = false,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const isEdit = !!initial;

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors({});
    setForm(
      initial
        ? {
            title: initial.title || "Result Of Final Exam",
            level: initial.level || "",
            subject1Label: initial.subject1Label || "",
            subject1Max: String(initial.subject1Max ?? "50"),
            subject2Label: initial.subject2Label || "",
            subject2Max: String(initial.subject2Max ?? "50"),
            totalMax: String(initial.totalMax ?? "100"),
            theme: initial.theme || "cyan",
            rows:
              Array.isArray(initial.rows) && initial.rows.length
                ? initial.rows.map((r) => ({
                    name: r.name || "",
                    country: r.country || "",
                    mark1: r.mark1 ?? "",
                    mark2: r.mark2 ?? "",
                  }))
                : [emptyRow()],
          }
        : emptyForm
    );
  }, [isOpen, initial]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const applyPreset = (key) => {
    const preset = RESULT_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setForm((f) => ({
      ...f,
      level: preset.level,
      subject1Label: preset.subject1Label,
      subject2Label: preset.subject2Label,
      subject1Max: String(preset.subject1Max),
      subject2Max: String(preset.subject2Max),
      totalMax: String(preset.totalMax),
      theme: preset.theme,
    }));
  };

  const setRow = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      rows: f.rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r)),
    }));

  const addRow = () => setForm((f) => ({ ...f, rows: [...f.rows, emptyRow()] }));

  const removeRow = (idx) =>
    setForm((f) => ({
      ...f,
      rows: f.rows.length > 1 ? f.rows.filter((_, i) => i !== idx) : f.rows,
    }));

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const next = {};
    if (!form.level.trim()) next.level = "Level is required.";
    if (!form.subject1Label.trim()) next.subject1Label = "Required.";
    if (!form.subject2Label.trim()) next.subject2Label = "Required.";
    if (form.subject1Max === "" || Number.isNaN(Number(form.subject1Max)))
      next.subject1Max = "Number.";
    if (form.subject2Max === "" || Number.isNaN(Number(form.subject2Max)))
      next.subject2Max = "Number.";

    // At least one named student.
    const validRows = form.rows.filter((r) => r.name.trim());
    if (validRows.length === 0) next.rows = "Add at least one student.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload = {
      title: form.title.trim() || "Result Of Final Exam",
      level: form.level.trim(),
      subject1Label: form.subject1Label.trim(),
      subject1Max: Number(form.subject1Max),
      subject2Label: form.subject2Label.trim(),
      subject2Max: Number(form.subject2Max),
      totalMax:
        form.totalMax === "" || Number.isNaN(Number(form.totalMax))
          ? Number(form.subject1Max) + Number(form.subject2Max)
          : Number(form.totalMax),
      theme: form.theme,
      rows: validRows.map((r) => ({
        name: r.name.trim(),
        country: r.country.trim(),
        mark1: Number(r.mark1) || 0,
        mark2: Number(r.mark2) || 0,
      })),
    };

    onSubmit?.(payload);
  };

  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={loading}
        isLoading={loading}
      >
        {isEdit ? "Update Result" : "Create Result"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Result Sheet" : "New Result Sheet"}
      size="2xl"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Preset quick-fill */}
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/40 p-3">
          <Select
            id="preset"
            label="Quick fill from a level (optional)"
            value=""
            onChange={(e) => applyPreset(e.target.value)}
            options={RESULT_PRESETS.map((p) => ({ value: p.key, label: p.level }))}
            placeholder="Choose a level to pre-fill columns…"
          />
          <p className="mt-1.5 text-xs text-primary-400">
            Pre-fills the subject columns, totals and colour. You can edit every
            field afterwards.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="title"
            label="Title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Result Of Final Exam"
          />
          <Input
            id="level"
            label="Level"
            value={form.level}
            onChange={(e) => setField("level", e.target.value)}
            placeholder="e.g. BEGINNER"
            error={errors.level}
          />
        </div>

        {/* Columns */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-[1fr_6rem] gap-2">
            <Input
              id="subject1Label"
              label="Column 1 name"
              value={form.subject1Label}
              onChange={(e) => setField("subject1Label", e.target.value)}
              placeholder="e.g. Qaida"
              error={errors.subject1Label}
            />
            <Input
              id="subject1Max"
              type="number"
              label="Max"
              value={form.subject1Max}
              onChange={(e) => setField("subject1Max", e.target.value)}
              error={errors.subject1Max}
            />
          </div>
          <div className="grid grid-cols-[1fr_6rem] gap-2">
            <Input
              id="subject2Label"
              label="Column 2 name"
              value={form.subject2Label}
              onChange={(e) => setField("subject2Label", e.target.value)}
              placeholder="e.g. Dua"
              error={errors.subject2Label}
            />
            <Input
              id="subject2Max"
              type="number"
              label="Max"
              value={form.subject2Max}
              onChange={(e) => setField("subject2Max", e.target.value)}
              error={errors.subject2Max}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="totalMax"
            type="number"
            label="Total marks"
            value={form.totalMax}
            onChange={(e) => setField("totalMax", e.target.value)}
            hint="Shown as 'Total = …' in the top-right legend."
          />
          <Select
            id="theme"
            label="Header colour"
            value={form.theme}
            onChange={(e) => setField("theme", e.target.value)}
            options={THEME_OPTIONS}
            placeholder={null}
          />
        </div>

        {/* Students */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-semibold text-primary-800">
              Students (in rank order — top 3 become 1st / 2nd / 3rd)
            </label>
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <FiPlus className="mr-1" /> Add row
            </Button>
          </div>

          {errors.rows && <p className="mb-2 text-sm text-danger">{errors.rows}</p>}

          {/* Column headings for the row editor (desktop) */}
          <div className="hidden grid-cols-[1.6rem_1fr_1fr_4.5rem_4.5rem_3.5rem_2rem] gap-2 px-1 pb-1 text-xs font-medium text-primary-400 sm:grid">
            <span>#</span>
            <span>Name</span>
            <span>Country</span>
            <span className="text-center">{form.subject1Label || "Col 1"}</span>
            <span className="text-center">{form.subject2Label || "Col 2"}</span>
            <span className="text-center">Total</span>
            <span />
          </div>

          <div className="space-y-2">
            {form.rows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 items-center gap-2 rounded-[var(--radius-md)] border border-primary-100 bg-surface p-2 sm:grid-cols-[1.6rem_1fr_1fr_4.5rem_4.5rem_3.5rem_2rem] sm:border-0 sm:bg-transparent sm:p-0"
              >
                <span className="hidden text-center text-sm text-primary-400 sm:block">
                  {idx + 1}
                </span>
                <input
                  value={row.name}
                  onChange={(e) => setRow(idx, "name", e.target.value)}
                  placeholder="Name"
                  className="col-span-2 rounded-[var(--radius-sm)] border border-primary-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 sm:col-span-1"
                />
                <input
                  value={row.country}
                  onChange={(e) => setRow(idx, "country", e.target.value)}
                  placeholder="Country"
                  className="rounded-[var(--radius-sm)] border border-primary-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
                <input
                  type="number"
                  value={row.mark1}
                  onChange={(e) => setRow(idx, "mark1", e.target.value)}
                  placeholder="0"
                  className="rounded-[var(--radius-sm)] border border-primary-200 bg-surface px-2 py-2 text-center text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
                <input
                  type="number"
                  value={row.mark2}
                  onChange={(e) => setRow(idx, "mark2", e.target.value)}
                  placeholder="0"
                  className="rounded-[var(--radius-sm)] border border-primary-200 bg-surface px-2 py-2 text-center text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
                <span className="text-center text-sm font-semibold tabular-nums text-primary-700">
                  {rowTotal(row)}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  aria-label={`Remove row ${idx + 1}`}
                  className="inline-flex h-8 w-8 items-center justify-center justify-self-end rounded-md text-primary-400 transition-colors hover:bg-red-50 hover:text-danger"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ExamResultFormModal;
