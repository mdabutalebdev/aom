"use client";

import React, { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { extractYouTubeId, getYouTubeThumbnail } from "@/components/shared/youtube";

// Empty form state.
const emptyForm = {
  reviewerName: "",
  location: "",
  youtubeUrl: "",
  quoteText: "",
  duration: "",
  order: "",
};

/**
 * TestimonialFormModal — Testimonial create/edit form.
 * Shows a live YouTube thumbnail preview once the pasted link resolves to a
 * valid video ID — doubles as inline validation for the link itself.
 * Calls onSubmit(payload); on success, parent modal closes.
 */
const TestimonialFormModal = ({
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

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors({});
    setForm(
      initial
        ? {
            reviewerName: initial.reviewerName || "",
            location: initial.location || "",
            youtubeUrl: initial.youtubeUrl || "",
            quoteText: initial.quoteText || "",
            duration: initial.duration || "",
            order: initial.order != null ? String(initial.order) : "",
          }
        : emptyForm
    );
  }, [isOpen, initial]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.reviewerName.trim()) next.reviewerName = "Reviewer name is required.";
    if (!form.youtubeUrl.trim()) next.youtubeUrl = "YouTube link is required.";
    else if (!extractYouTubeId(form.youtubeUrl))
      next.youtubeUrl = "This doesn't look like a valid YouTube link.";
    if (!form.quoteText.trim()) next.quoteText = "Quote is required.";
    if (form.order !== "" && Number.isNaN(Number(form.order)))
      next.order = "Enter a valid order.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload = {
      reviewerName: form.reviewerName.trim(),
      location: form.location.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
      quoteText: form.quoteText.trim(),
      duration: form.duration.trim(),
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
      title={isEdit ? "Edit Testimonial" : "New Testimonial"}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="reviewerName"
            label="Reviewer Name"
            placeholder="e.g. Mrs. Farhana Akter"
            value={form.reviewerName}
            onChange={(e) => setField("reviewerName", e.target.value)}
            error={errors.reviewerName}
          />
          <Input
            id="location"
            label="Location (Optional)"
            placeholder="e.g. Dhaka, Bangladesh"
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
          />
        </div>

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

        <div>
          <label
            htmlFor="quoteText"
            className="mb-1.5 block text-sm font-medium text-primary-800"
          >
            Quote
          </label>
          <textarea
            id="quoteText"
            rows={3}
            value={form.quoteText}
            onChange={(e) => setField("quoteText", e.target.value)}
            placeholder="What did they say about the classes..."
            className="w-full rounded-[var(--radius-md)] border border-primary-200 bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
          {errors.quoteText && (
            <p className="mt-1.5 text-sm text-danger">{errors.quoteText}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="duration"
            label="Duration (Optional)"
            placeholder="e.g. 1:25"
            value={form.duration}
            onChange={(e) => setField("duration", e.target.value)}
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
      </form>
    </Modal>
  );
};

export default TestimonialFormModal;
