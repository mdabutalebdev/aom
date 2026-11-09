"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FiSave, FiInfo, FiPlus, FiTrash2, FiUpload, FiX, FiImage, FiVideo } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import { HERO_ICON_OPTIONS, getHeroIcon, DEFAULT_HERO_FEATURES } from "@/components/shared/heroIcons";

// Plain text/textarea field definitions - grouped by section.
const TEXT_SECTIONS = [
  {
    title: "Badge & Heading",
    fields: [
      { key: "heroBadgeText", label: "Badge Text", type: "text" },
      { key: "heroHeadingLine1", label: "Heading — Line 1", type: "text" },
      { key: "heroHeadingHighlight", label: "Heading — Highlighted Word", type: "text" },
      { key: "heroHeadingLine2", label: "Heading — Line 2", type: "text" },
    ],
  },
  {
    title: "Description & Buttons",
    fields: [
      { key: "heroDescription", label: "Description", type: "textarea" },
      { key: "heroPrimaryButtonText", label: "Primary Button Label", type: "text" },
      { key: "heroSecondaryButtonText", label: "Secondary Button Label", type: "text" },
    ],
  },
  {
    title: "Right Panel Fallback (shown when no photo is uploaded)",
    fields: [
      { key: "heroQuoteText", label: "Quote", type: "textarea" },
      { key: "heroQuoteAttribution", label: "Quote Attribution", type: "text" },
    ],
  },
  {
    title: "Floating Badge",
    fields: [
      { key: "heroTooltipTitle", label: "Title", type: "text" },
      { key: "heroTooltipSubtitle", label: "Subtitle", type: "text" },
    ],
  },
];

const TEXT_FIELD_KEYS = TEXT_SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

const emptyForm = {
  ...TEXT_FIELD_KEYS.reduce((acc, k) => ({ ...acc, [k]: "" }), {}),
  heroFeatures: DEFAULT_HERO_FEATURES,
  heroImage: "",
  heroVideoUrl: "",
  heroMediaType: "image",
};

/**
 * HeroContentManager — Homepage Hero section form.
 * Loads via GET /settings (public), saves via PATCH /settings (admin).
 * The hero photo is uploaded separately via POST /settings/upload-hero-image,
 * then persisted like any other field on the next Save.
 */
const HeroContentManager = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Photo upload state.
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [fileKey, setFileKey] = useState(0);

  // Video upload state.
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoFileKey, setVideoFileKey] = useState(0);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        const s = body.data || {};
        setForm({
          ...TEXT_FIELD_KEYS.reduce((acc, k) => ({ ...acc, [k]: s[k] ?? "" }), {}),
          heroFeatures:
            Array.isArray(s.heroFeatures) && s.heroFeatures.length > 0
              ? s.heroFeatures.map((f) => ({ icon: f.icon || "", label: f.label || "" }))
              : DEFAULT_HERO_FEATURES,
          heroImage: s.heroImage || "",
          heroVideoUrl: s.heroVideoUrl || "",
          heroMediaType: s.heroMediaType || "image",
        });
        setImagePreview("");
      } else {
        setError(body.message || "Failed to load homepage content.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Feature row helpers.
  const addFeature = () =>
    setForm((f) => ({
      ...f,
      heroFeatures: [...f.heroFeatures, { icon: "", label: "" }],
    }));

  const removeFeature = (idx) =>
    setForm((f) => ({
      ...f,
      heroFeatures: f.heroFeatures.filter((_, i) => i !== idx),
    }));

  const setFeature = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      heroFeatures: f.heroFeatures.map((ft, i) => (i === idx ? { ...ft, [key]: value } : ft)),
    }));

  // Photo selected → POST /settings/upload-hero-image (multipart, field "image").
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadNote("");
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/settings/upload-hero-image`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.data?.url) {
        setField("heroImage", data.data.url);
      } else {
        setUploadNote(data.message || "Unable to upload the photo. Please try again.");
      }
    } catch {
      setUploadNote("Could not connect to server while uploading the photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImage = () => {
    setField("heroImage", "");
    setImagePreview("");
    setFileKey((k) => k + 1);
  };

  // Video selected → POST /settings/upload-hero-video (multipart, field "video").
  const handleVideoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadNote("");
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch(`${API_BASE_URL}/settings/upload-hero-video`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.data?.url) {
        setField("heroVideoUrl", data.data.url);
      } else {
        setUploadNote(data.message || "Unable to upload the video. Please try again.");
      }
    } catch {
      setUploadNote("Could not connect to server while uploading the video.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const clearVideo = () => {
    setField("heroVideoUrl", "");
    setVideoFileKey((k) => k + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...TEXT_FIELD_KEYS.reduce((acc, k) => ({ ...acc, [k]: form[k] }), {}),
        heroFeatures: form.heroFeatures.map((f) => ({
          ...(f.icon ? { icon: f.icon } : {}),
          ...(f.label && f.label.trim() ? { label: f.label.trim() } : {}),
        })),
        heroImage: form.heroImage,
        heroVideoUrl: form.heroVideoUrl,
        heroMediaType: form.heroMediaType,
      };
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Homepage content saved successfully.");
      } else {
        toast.error(body.message || "Failed to save homepage content.");
      }
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

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
      <div className="rounded-lg border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchSettings}>
          Try again
        </Button>
      </div>
    );
  }

  const photoSrc = imagePreview || form.heroImage;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-lg border border-primary-100 bg-primary-50/50 px-3 py-2.5 text-xs text-primary-700">
        <FiInfo className="mt-0.5 shrink-0 text-primary-500" />
        <p>
          Controls the homepage hero — the first section visitors see. Leave any field empty to
          keep its current default.
        </p>
      </div>

      {TEXT_SECTIONS.map((section) => (
        <Card key={section.title} size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {section.fields.map((field) => {
              const isTextarea = field.type === "textarea";
              return (
                <div key={field.key} className={isTextarea ? "sm:col-span-2" : ""}>
                  {isTextarea ? (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Textarea
                        id={field.key}
                        rows={2}
                        value={form[field.key]}
                        onChange={(e) => setField(field.key, e.target.value)}
                      />
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      label={field.label}
                      value={form[field.key]}
                      onChange={(e) => setField(field.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Feature Callouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={addFeature}>
              <FiPlus className="mr-1" /> Add
            </Button>
          </div>

          {form.heroFeatures.length === 0 ? (
            <p className="text-sm text-primary-400">No features added.</p>
          ) : (
            <div className="space-y-3">
              {form.heroFeatures.map((f, idx) => {
                const RowIcon = getHeroIcon(f.icon);
                return (
                  <div key={idx} className="flex items-end gap-2">
                    <div className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <RowIcon className="text-lg" />
                    </div>
                    <Select
                      id={`feature-icon-${idx}`}
                      label="Icon"
                      containerClassName="w-44 shrink-0"
                      value={f.icon}
                      onChange={(e) => setFeature(idx, "icon", e.target.value)}
                      options={HERO_ICON_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    />
                    <Input
                      id={`feature-label-${idx}`}
                      label="Label"
                      placeholder="e.g. Flexible Schedule"
                      value={f.label}
                      onChange={(e) => setFeature(idx, "label", e.target.value)}
                      containerClassName="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      aria-label="Delete feature"
                      className="mb-1 shrink-0 rounded-[var(--radius-md)] p-2.5 text-danger transition-colors hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Right Panel Media</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-primary-500">
            Optional — choose a photo OR a video. Leave empty to keep the
            decorative design (logo + quote).
          </p>

          {/* Photo / Video toggle */}
          <div className="mb-4 inline-flex rounded-[var(--radius-lg)] border border-primary-200 p-0.5">
            {[
              { key: "image", label: "Photo", Icon: FiImage },
              { key: "video", label: "Video", Icon: FiVideo },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setField("heroMediaType", key)}
                className={`inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-4 py-1.5 text-sm font-medium transition-colors ${
                  form.heroMediaType === key
                    ? "bg-primary-500 text-white"
                    : "text-primary-600 hover:bg-primary-50"
                }`}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          {/* Photo uploader */}
          {form.heroMediaType === "image" && (
            <>
              {photoSrc ? (
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-[var(--radius-lg)] border border-primary-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoSrc} alt="Hero preview" className="h-full w-full object-cover" />
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
                    <FiX /> Remove Photo
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="heroImageFile"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-primary-200 bg-primary-50/40 px-4 py-8 text-center text-primary-500 transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  <FiUpload className="text-2xl" />
                  <span className="text-sm font-medium">Click to select a photo</span>
                  <span className="text-xs text-primary-400">JPG, PNG, or WEBP</span>
                </label>
              )}
              <input
                key={fileKey}
                id="heroImageFile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </>
          )}

          {/* Video uploader */}
          {form.heroMediaType === "video" && (
            <>
              {form.heroVideoUrl ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative h-32 w-56 overflow-hidden rounded-[var(--radius-lg)] border border-primary-100 bg-black">
                    <video
                      src={form.heroVideoUrl}
                      className="h-full w-full object-cover"
                      controls
                      muted
                      playsInline
                    />
                    {uploadingVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary-900/40">
                        <Spinner size="md" className="border-white/40 border-t-white" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearVideo}
                    disabled={uploadingVideo}
                    className="inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-md)] border border-primary-200 px-3 py-1.5 text-sm text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-60"
                  >
                    <FiX /> Remove Video
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="heroVideoFile"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-primary-200 bg-primary-50/40 px-4 py-8 text-center text-primary-500 transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  {uploadingVideo ? (
                    <>
                      <Spinner size="md" />
                      <span className="text-sm font-medium">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="text-2xl" />
                      <span className="text-sm font-medium">Click to select a video from your PC</span>
                      <span className="text-xs text-primary-400">MP4, MOV, WEBM (up to 500MB)</span>
                    </>
                  )}
                </label>
              )}
              <input
                key={videoFileKey}
                id="heroVideoFile"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoChange}
              />
            </>
          )}

          {uploadNote && <p className="mt-2 text-sm text-accent-700">{uploadNote}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="sm" isLoading={saving}>
          <FiSave className="mr-1.5" />
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default HeroContentManager;
