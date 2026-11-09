"use client";

import React, { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { extractYouTubeId, getYouTubeThumbnail } from "@/components/shared/youtube";

const emptyForm = {
  reviewerName: "",
  location: "",
  youtubeUrl: "",
  quoteText: "",
  duration: "",
};

/**
 * ReviewSubmitModal — public "Write a Review" form for parents. Submits to
 * POST /testimonials/submit (no auth); the review is created as pending and
 * only appears on the homepage after an admin approves it. On success the
 * modal swaps to a thank-you screen.
 */
const ReviewSubmitModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const videoId = extractYouTubeId(form.youtubeUrl);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(emptyForm);
    setErrors({});
    setServerError("");
    setDone(false);
    setSubmitting(false);
  }, [isOpen]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const next = {};
    if (!form.reviewerName.trim()) next.reviewerName = "Your name is required.";
    if (!form.youtubeUrl.trim()) next.youtubeUrl = "A YouTube video link is required.";
    else if (!extractYouTubeId(form.youtubeUrl))
      next.youtubeUrl = "This doesn't look like a valid YouTube link.";
    if (!form.quoteText.trim()) next.quoteText = "Please write a few words.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setServerError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/testimonials/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerName: form.reviewerName.trim(),
          location: form.location.trim(),
          youtubeUrl: form.youtubeUrl.trim(),
          quoteText: form.quoteText.trim(),
          duration: form.duration.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setDone(true);
      } else {
        setServerError(data.message || "Could not submit your review. Please try again.");
      }
    } catch {
      setServerError("Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const footer = done ? (
    <Button variant="primary" size="sm" onClick={onClose}>
      Done
    </Button>
  ) : (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={submitting}
        isLoading={submitting}
      >
        Submit Review
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={done ? "Review Submitted" : "Write a Review"}
      size="lg"
      footer={footer}
    >
      {done ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-50 text-secondary-600">
            <FiCheckCircle className="text-3xl" />
          </span>
          <h3 className="text-lg font-semibold text-primary-900">
            Thank you for your review!
          </h3>
          <p className="mt-2 max-w-sm text-sm text-primary-600">
            Your review has been submitted and will appear on the site once our
            team has approved it.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="rounded-[var(--radius-md)] bg-primary-50 px-3 py-2 text-sm text-primary-600">
            Share a short video review from YouTube. Once approved by our team,
            it will show up in the “Parents Review” section.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="submit-reviewerName"
              label="Your Name"
              placeholder="e.g. Mrs. Farhana Akter"
              value={form.reviewerName}
              onChange={(e) => setField("reviewerName", e.target.value)}
              error={errors.reviewerName}
            />
            <Input
              id="submit-location"
              label="Location (Optional)"
              placeholder="e.g. Dhaka, Bangladesh"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <Input
              id="submit-youtubeUrl"
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
              htmlFor="submit-quoteText"
              className="mb-1.5 block text-sm font-medium text-primary-800"
            >
              Your Review
            </label>
            <textarea
              id="submit-quoteText"
              rows={3}
              value={form.quoteText}
              onChange={(e) => setField("quoteText", e.target.value)}
              placeholder="Tell us about your experience with our classes..."
              className="w-full rounded-[var(--radius-md)] border border-primary-200 bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {errors.quoteText && (
              <p className="mt-1.5 text-sm text-danger">{errors.quoteText}</p>
            )}
          </div>

          <Input
            id="submit-duration"
            label="Video Duration (Optional)"
            placeholder="e.g. 1:25"
            value={form.duration}
            onChange={(e) => setField("duration", e.target.value)}
            containerClassName="sm:max-w-[200px]"
          />

          {serverError && (
            <p className="rounded-[var(--radius-md)] border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
              {serverError}
            </p>
          )}
        </form>
      )}
    </Modal>
  );
};

export default ReviewSubmitModal;
