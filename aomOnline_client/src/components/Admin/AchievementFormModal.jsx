"use client";

import React, { useEffect, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import { COURSE_ICON_OPTIONS, getCourseIcon } from "@/components/shared/courseIcons";

// Empty form state.
const emptyForm = {
  title: "",
  description: "",
  certificateImage: "",
  icon: "",
  order: "",
};

/**
 * AchievementFormModal — Achievement create/edit form.
 * Certificate image upload mirrors HeroContentManager.jsx's dropzone/preview/
 * remove widget (same state shape, same FormData field name "image").
 * Calls onSubmit(payload); on success, parent modal closes.
 */
const AchievementFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initial = null,
  loading = false,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [fileKey, setFileKey] = useState(0);

  const isEdit = !!initial;
  const SelectedIcon = getCourseIcon(form.icon);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors({});
    setImagePreview("");
    setUploadNote("");
    setForm(
      initial
        ? {
            title: initial.title || "",
            description: initial.description || "",
            certificateImage: initial.certificateImage || "",
            icon: initial.icon || "",
            order: initial.order != null ? String(initial.order) : "",
          }
        : emptyForm
    );
  }, [isOpen, initial]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadNote("");
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/achievements/upload-image`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.data?.url) {
        setField("certificateImage", data.data.url);
        setErrors((er) => ({ ...er, certificateImage: undefined }));
      } else {
        setUploadNote(data.message || "Unable to upload the image. Please try again.");
      }
    } catch {
      setUploadNote("Could not connect to server while uploading the image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImage = () => {
    setField("certificateImage", "");
    setImagePreview("");
    setFileKey((k) => k + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.certificateImage) next.certificateImage = "Upload a certificate image.";
    if (form.order !== "" && Number.isNaN(Number(form.order)))
      next.order = "Enter a valid order.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      certificateImage: form.certificateImage,
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

  const photoSrc = imagePreview || form.certificateImage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Achievement" : "New Achievement"}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary-800">
            Certificate Image
          </label>

          {photoSrc ? (
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-32 overflow-hidden rounded-[var(--radius-lg)] border border-primary-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoSrc}
                  alt="Certificate preview"
                  className="h-full w-full object-cover"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary-900/30">
                    <Spinner size="md" className="border-white/40 border-t-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={clearImage}
                disabled={uploadingImage}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-primary-200 px-3 py-1.5 text-sm text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-60"
              >
                <FiX /> Remove
              </button>
            </div>
          ) : (
            <label
              htmlFor="certificateImageFile"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-primary-200 bg-primary-50/40 px-4 py-8 text-center text-primary-500 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <FiUpload className="text-2xl" />
              <span className="text-sm font-medium">Click to select a certificate image</span>
              <span className="text-xs text-primary-400">JPG, PNG, or WEBP</span>
            </label>
          )}

          <input
            key={fileKey}
            id="certificateImageFile"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {uploadNote && <p className="mt-2 text-sm text-accent-700">{uploadNote}</p>}
          {errors.certificateImage && (
            <p className="mt-2 text-sm text-danger">{errors.certificateImage}</p>
          )}
        </div>

        <Input
          id="title"
          label="Title"
          placeholder="e.g. Quran Nazra Course"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          error={errors.title}
        />

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-primary-800"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={2}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="e.g. For successful completion of Nazra Course."
            className="w-full rounded-[var(--radius-md)] border border-primary-200 bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
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

export default AchievementFormModal;
