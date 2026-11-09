"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FiSave, FiUpload, FiX, FiPlus, FiTrash2 } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import {
  HERO_ICON_OPTIONS,
  getHeroIcon,
  DEFAULT_CLASSDEMO_ONETOONE_FEATURES,
  DEFAULT_CLASSDEMO_GROUP_FEATURES,
  DEFAULT_CLASSDEMO_TEXT,
} from "@/components/shared/heroIcons";

const TEXT_FIELD_KEYS = [
  "classDemoBadgeText",
  "classDemoHeadingMain",
  "classDemoHeadingHighlight",
  "classDemoDescription",
  "classDemoOneToOneTitle",
  "classDemoGroupTitle",
];

const emptyForm = {
  ...TEXT_FIELD_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: DEFAULT_CLASSDEMO_TEXT[k] ?? "" }),
    {},
  ),
  classDemoOneToOneImage: "",
  classDemoOneToOneVideoUrl: "",
  classDemoOneToOneFeatures: DEFAULT_CLASSDEMO_ONETOONE_FEATURES,
  classDemoGroupImage: "",
  classDemoGroupVideoUrl: "",
  classDemoGroupFeatures: DEFAULT_CLASSDEMO_GROUP_FEATURES,
};

// Single-image dropzone/preview/remove widget — same shape as
// HeroContentManager.jsx's photo widget, parameterized so it can be reused
// for both comparison-card photos without duplicating the JSX twice.
const ImageField = ({ label, inputId, preview, uploading, note, fileKey, onChange, onClear }) => (
  <div>
    <p className="mb-1.5 text-sm font-medium text-primary-800">{label}</p>
    {preview ? (
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-32 overflow-hidden rounded-[var(--radius-lg)] border border-primary-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="h-full w-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary-900/30">
              <Spinner size="md" className="border-white/40 border-t-white" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-primary-200 px-3 py-1.5 text-sm text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-60"
        >
          <FiX /> Remove
        </button>
      </div>
    ) : (
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-primary-200 bg-primary-50/40 px-4 py-6 text-center text-primary-500 transition-colors hover:border-primary-300 hover:bg-primary-50"
      >
        <FiUpload className="text-xl" />
        <span className="text-sm font-medium">Click to select a photo</span>
      </label>
    )}
    <input
      key={fileKey}
      id={inputId}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={onChange}
    />
    {note && <p className="mt-2 text-sm text-accent-700">{note}</p>}
  </div>
);

// Repeatable icon+label feature-bullet editor — same add/remove/set pattern
// as ClassFormModal.jsx's milestone editor.
const FeatureEditor = ({ title, features, onAdd, onRemove, onChange }) => (
  <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/30 p-4">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-medium text-primary-800">{title}</p>
      <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
        <FiPlus className="mr-1" /> Add
      </Button>
    </div>

    {features.length === 0 ? (
      <p className="text-sm text-primary-400">No features added.</p>
    ) : (
      <div className="space-y-3">
        {features.map((f, idx) => {
          const RowIcon = getHeroIcon(f.icon);
          return (
            <div key={idx} className="flex items-end gap-2">
              <div className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <RowIcon className="text-lg" />
              </div>
              <Select
                id={`${title}-icon-${idx}`}
                label="Icon"
                containerClassName="w-40 shrink-0"
                value={f.icon}
                onChange={(e) => onChange(idx, "icon", e.target.value)}
                options={HERO_ICON_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
              <Input
                id={`${title}-label-${idx}`}
                label="Label"
                placeholder="e.g. Flexible Schedule"
                value={f.label}
                onChange={(e) => onChange(idx, "label", e.target.value)}
                containerClassName="flex-1"
              />
              <button
                type="button"
                onClick={() => onRemove(idx)}
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
  </div>
);

/**
 * ClassDemoManager — "Watch Our Live Class Demo" section form.
 * Same fetch/PATCH lifecycle as HeroContentManager.jsx (GET/PATCH
 * /api/settings), rendered alongside it on the Homepage Content admin page.
 */
const ClassDemoManager = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [oneToOnePreview, setOneToOnePreview] = useState("");
  const [oneToOneUploading, setOneToOneUploading] = useState(false);
  const [oneToOneNote, setOneToOneNote] = useState("");
  const [oneToOneFileKey, setOneToOneFileKey] = useState(0);

  const [groupPreview, setGroupPreview] = useState("");
  const [groupUploading, setGroupUploading] = useState(false);
  const [groupNote, setGroupNote] = useState("");
  const [groupFileKey, setGroupFileKey] = useState(0);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        const s = body.data || {};
        setForm({
          // Fall back to the same defaults the live section renders, so the
          // form shows what visitors actually see rather than a blank box.
          ...TEXT_FIELD_KEYS.reduce(
            (acc, k) => ({
              ...acc,
              [k]: s[k] || DEFAULT_CLASSDEMO_TEXT[k] || "",
            }),
            {},
          ),
          classDemoOneToOneImage: s.classDemoOneToOneImage || "",
          classDemoOneToOneVideoUrl: s.classDemoOneToOneVideoUrl || "",
          classDemoOneToOneFeatures:
            Array.isArray(s.classDemoOneToOneFeatures) && s.classDemoOneToOneFeatures.length > 0
              ? s.classDemoOneToOneFeatures.map((f) => ({ icon: f.icon || "", label: f.label || "" }))
              : DEFAULT_CLASSDEMO_ONETOONE_FEATURES,
          classDemoGroupImage: s.classDemoGroupImage || "",
          classDemoGroupVideoUrl: s.classDemoGroupVideoUrl || "",
          classDemoGroupFeatures:
            Array.isArray(s.classDemoGroupFeatures) && s.classDemoGroupFeatures.length > 0
              ? s.classDemoGroupFeatures.map((f) => ({ icon: f.icon || "", label: f.label || "" }))
              : DEFAULT_CLASSDEMO_GROUP_FEATURES,
        });
        setOneToOnePreview("");
        setGroupPreview("");
      } else {
        setError(body.message || "Failed to load class demo content.");
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

  const addFeature = (key) =>
    setForm((f) => ({ ...f, [key]: [...f[key], { icon: "", label: "" }] }));
  const removeFeature = (key, idx) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));
  const setFeature = (key, idx, field, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].map((ft, i) => (i === idx ? { ...ft, [field]: value } : ft)),
    }));

  const uploadImage = async (file, imageField, { setPreview, setUploading, setNote }) => {
    setNote("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE_URL}/settings/upload-image`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.data?.url) {
        setField(imageField, data.data.url);
      } else {
        setNote(data.message || "Unable to upload the photo. Please try again.");
      }
    } catch {
      setNote("Could not connect to server while uploading the photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...TEXT_FIELD_KEYS.reduce((acc, k) => ({ ...acc, [k]: form[k] }), {}),
        classDemoOneToOneImage: form.classDemoOneToOneImage,
        classDemoOneToOneVideoUrl: form.classDemoOneToOneVideoUrl.trim(),
        classDemoOneToOneFeatures: form.classDemoOneToOneFeatures.map((f) => ({
          ...(f.icon ? { icon: f.icon } : {}),
          ...(f.label && f.label.trim() ? { label: f.label.trim() } : {}),
        })),
        classDemoGroupImage: form.classDemoGroupImage,
        classDemoGroupVideoUrl: form.classDemoGroupVideoUrl.trim(),
        classDemoGroupFeatures: form.classDemoGroupFeatures.map((f) => ({
          ...(f.icon ? { icon: f.icon } : {}),
          ...(f.label && f.label.trim() ? { label: f.label.trim() } : {}),
        })),
      };
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Class demo content saved successfully.");
      } else {
        toast.error(body.message || "Failed to save class demo content.");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Section Heading</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input
            id="classDemoBadgeText"
            label="Badge Text"
            value={form.classDemoBadgeText}
            onChange={(e) => setField("classDemoBadgeText", e.target.value)}
          />
          <div />
          <Input
            id="classDemoHeadingMain"
            label="Heading"
            value={form.classDemoHeadingMain}
            onChange={(e) => setField("classDemoHeadingMain", e.target.value)}
          />
          <Input
            id="classDemoHeadingHighlight"
            label="Heading — Highlighted Word"
            value={form.classDemoHeadingHighlight}
            onChange={(e) => setField("classDemoHeadingHighlight", e.target.value)}
          />
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="classDemoDescription">Description</Label>
            <Textarea
              id="classDemoDescription"
              rows={2}
              value={form.classDemoDescription}
              onChange={(e) => setField("classDemoDescription", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>One-to-One Class Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            id="classDemoOneToOneTitle"
            label="Card Title"
            value={form.classDemoOneToOneTitle}
            onChange={(e) => setField("classDemoOneToOneTitle", e.target.value)}
          />
          <div>
            <Input
              id="classDemoOneToOneVideoUrl"
              label="Video (YouTube link)"
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={form.classDemoOneToOneVideoUrl}
              onChange={(e) => setField("classDemoOneToOneVideoUrl", e.target.value)}
            />
            <p className="mt-1.5 text-xs text-primary-500">
              Paste a YouTube link and it will play right on the homepage. If a
              video is set, it shows instead of the photo below.
            </p>
          </div>
          <ImageField
            label="Photo"
            inputId="classDemoOneToOneImageFile"
            preview={oneToOnePreview || form.classDemoOneToOneImage}
            uploading={oneToOneUploading}
            note={oneToOneNote}
            fileKey={oneToOneFileKey}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file)
                uploadImage(file, "classDemoOneToOneImage", {
                  setPreview: setOneToOnePreview,
                  setUploading: setOneToOneUploading,
                  setNote: setOneToOneNote,
                });
            }}
            onClear={() => {
              setField("classDemoOneToOneImage", "");
              setOneToOnePreview("");
              setOneToOneFileKey((k) => k + 1);
            }}
          />
          <FeatureEditor
            title="One-to-One Features"
            features={form.classDemoOneToOneFeatures}
            onAdd={() => addFeature("classDemoOneToOneFeatures")}
            onRemove={(idx) => removeFeature("classDemoOneToOneFeatures", idx)}
            onChange={(idx, field, value) =>
              setFeature("classDemoOneToOneFeatures", idx, field, value)
            }
          />
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Group Class Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            id="classDemoGroupTitle"
            label="Card Title"
            value={form.classDemoGroupTitle}
            onChange={(e) => setField("classDemoGroupTitle", e.target.value)}
          />
          <div>
            <Input
              id="classDemoGroupVideoUrl"
              label="Video (YouTube link)"
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={form.classDemoGroupVideoUrl}
              onChange={(e) => setField("classDemoGroupVideoUrl", e.target.value)}
            />
            <p className="mt-1.5 text-xs text-primary-500">
              Paste a YouTube link and it will play right on the homepage. If a
              video is set, it shows instead of the photo below.
            </p>
          </div>
          <ImageField
            label="Photo"
            inputId="classDemoGroupImageFile"
            preview={groupPreview || form.classDemoGroupImage}
            uploading={groupUploading}
            note={groupNote}
            fileKey={groupFileKey}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file)
                uploadImage(file, "classDemoGroupImage", {
                  setPreview: setGroupPreview,
                  setUploading: setGroupUploading,
                  setNote: setGroupNote,
                });
            }}
            onClear={() => {
              setField("classDemoGroupImage", "");
              setGroupPreview("");
              setGroupFileKey((k) => k + 1);
            }}
          />
          <FeatureEditor
            title="Group Features"
            features={form.classDemoGroupFeatures}
            onAdd={() => addFeature("classDemoGroupFeatures")}
            onRemove={(idx) => removeFeature("classDemoGroupFeatures", idx)}
            onChange={(idx, field, value) =>
              setFeature("classDemoGroupFeatures", idx, field, value)
            }
          />
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

export default ClassDemoManager;
