"use client";

import React, { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { extractYouTubeId, getYouTubeThumbnail } from "@/components/shared/youtube";
import { COURSE_ICON_OPTIONS, getCourseIcon } from "@/components/shared/courseIcons";

// Empty form state.
const emptyForm = {
  title: "",
  subtitle: "",
  presenterName: "",
  youtubeUrl: "",
  duration: "",
  icon: "",
  order: "",
};

/**
 * PresentationFormModal — Presentation create/edit form.
 * Shows a live YouTube thumbnail preview once the pasted link resolves to a
 * valid video ID — doubles as inline validation for the link itself.
 * Calls onSubmit(payload); on success, parent modal closes.
 */
const PresentationFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initial = null,
  loading = false,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const isEdit = !!initial;
  const videoId = extractYouTubeId(form.youtubeUrl);
  const SelectedIcon = getCourseIcon(form.icon);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors({});
    setForm(
      initial
        ? {
            title: initial.title || "",
            subtitle: initial.subtitle || "",
            presenterName: initial.presenterName || "",
            youtubeUrl: initial.youtubeUrl || "",
            duration: initial.duration || "",
            icon: initial.icon || "",
            order: initial.order != null ? String(initial.order) : "",
          }
        : emptyForm
    );
  }, [isOpen, initial]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.presenterName.trim()) next.presenterName = "Presenter name is required.";
    if (!form.youtubeUrl.trim()) next.youtubeUrl = "YouTube link is required.";
    else if (!extractYouTubeId(form.youtubeUrl))
      next.youtubeUrl = "This doesn't look like a valid YouTube link.";
    if (form.order !== "" && Number.isNaN(Number(form.order)))
      next.order = "Enter a valid order.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      presenterName: form.presenterName.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
      duration: form.duration.trim(),
      icon: form.icon,
      order: form.order === "" ? 0 : Number(form.order),
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
        {isEdit ? "Update" : "Create"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Presentation" : "New Presentation"}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="title"
            label="Title"
            placeholder="e.g. Quran Recitation"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            error={errors.title}
          />
          <Input
            id="subtitle"
            label="Subtitle / Topic (Optional)"
            placeholder="e.g. Surah Al-Furqan (Ayat 1-20)"
            value={form.subtitle}
            onChange={(e) => setField("subtitle", e.target.value)}
          />
        </div>

        <Input
          id="presenterName"
          label="Presenter Name"
          placeholder="e.g. Abdullah Rahman"
          value={form.presenterName}
          onChange={(e) => setField("presenterName", e.target.value)}
          error={errors.presenterName}
        />

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <Input
            id="youtubeUrl"
            label="YouTube Video Link"
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.youtubeUrl}
            onChange={(e) => setField("youtubeUrl", e.target.value)}
            error={errors.youtubeUrl}
          />
          {videoId && (
            <div className="mt-1.5 h-20 w-32 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-primary-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getYouTubeThumbnail(videoId)}
                alt="Video preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto]">
          <Input
            id="duration"
            label="Duration (Optional)"
            placeholder="e.g. 2:15"
            value={form.duration}
            onChange={(e) => setField("duration", e.target.value)}
          />
          <Select
            id="icon"
            label="Icon (Optional)"
            value={form.icon}
            onChange={(e) => setField("icon", e.target.value)}
            options={COURSE_ICON_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            placeholder="Default icon will be used"
          />
          <div
            className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-full bg-primary-50 text-primary-600"
            title="Preview"
          >
            <SelectedIcon className="text-lg" />
          </div>
          <Input
            id="order"
            type="number"
            label="Order"
            placeholder="1"
            value={form.order}
            onChange={(e) => setField("order", e.target.value)}
            error={errors.order}
            containerClassName="w-24"
          />
        </div>
      </form>
    </Modal>
  );
};

export default PresentationFormModal;
