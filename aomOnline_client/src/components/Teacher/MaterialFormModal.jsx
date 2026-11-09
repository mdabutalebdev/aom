"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiUploadCloud, FiCheckCircle, FiLink } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

import {
  MATERIAL_TYPE_OPTIONS,
  guessMaterialType,
} from "./progressConstants";

const emptyForm = {
  title: "",
  description: "",
  fileType: "pdf",
  classRef: "",
  fileUrl: "",
};

/**
 * MaterialFormModal — Resources / ।
 *    POST /materials/upload (multipart `file`) →   url + fileType
 *   ;  /   fileUrl    ( )।
 *  select   (classes) ;  =  ।
 */
const MaterialFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initial = null,
  classes = [],
  loading = false,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedName, setUploadedName] = useState("");
  const fileInputRef = useRef(null);

  const isEdit = !!initial;

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors({});
    setUploadError("");
    setUploadedName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setForm(
      initial
        ? {
            title: initial.title || "",
            description: initial.description || "",
            fileType: initial.fileType || "pdf",
            classRef: initial.classRef?._id || initial.classRef || "",
            fileUrl: initial.fileUrl || "",
          }
        : emptyForm
    );
  }, [isOpen, initial]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  //   → POST /materials/upload (multipart field `file`)।
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setUploadedName("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE_URL}/materials/upload`, {
        method: "POST",
        headers: { ...authHeaders() }, // Content-Type    —  boundary ।
        body: fd,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.data?.url) {
        const url = data.data.url;
        const fileType = data.data.fileType || guessMaterialType(file.name);
        setForm((f) => ({ ...f, fileUrl: url, fileType }));
        setUploadedName(file.name);
      } else {
        setUploadError(
          data.message ||
            "  ।       ।"
        );
      }
    } catch {
      setUploadError(
        "    ।       ।"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.fileUrl.trim())
      next.fileUrl = "Upload a file or paste a link (URL).";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      fileUrl: form.fileUrl.trim(),
      fileType: form.fileType,
      //  classRef =   →  ।
      ...(form.classRef ? { classRef: form.classRef } : {}),
    };

    onSubmit?.(payload);
  };

  const classOptions = [
    { value: "", label: "All classes" },
    ...classes.map((c) => ({ value: c._id, label: c.name })),
  ];

  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={loading || uploading}
        isLoading={loading}
      >
        {isEdit ? "Update" : "Save"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Resource" : "Add Resource"}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="material-title"
          label="Title"
          placeholder="Resource title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          error={errors.title}
        />

        <div>
          <label
            htmlFor="material-description"
            className="mb-1.5 block text-sm font-medium text-primary-800"
          >
            Description (Optional)
          </label>
          <textarea
            id="material-description"
            rows={2}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Short description..."
            className="w-full rounded-[var(--radius-md)] border border-primary-200 bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="material-type"
            label="Type"
            placeholder=""
            options={MATERIAL_TYPE_OPTIONS}
            value={form.fileType}
            onChange={(e) => setField("fileType", e.target.value)}
          />
          <Select
            id="material-class"
            label="Class (Optional)"
            placeholder=""
            options={classOptions}
            value={form.classRef}
            onChange={(e) => setField("classRef", e.target.value)}
          />
        </div>

        {/* File upload */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary-800">
            Upload File
          </label>
          <label
            htmlFor="material-file"
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed px-4 py-6 text-center transition-colors ${
              uploading
                ? "border-primary-200 bg-primary-50/40"
                : "border-primary-300 hover:border-primary-500 hover:bg-primary-50/40"
            }`}
          >
            {uploading ? (
              <>
                <Spinner size="md" />
                <span className="text-sm text-primary-500">Uploading...</span>
              </>
            ) : uploadedName ? (
              <>
                <FiCheckCircle className="text-2xl text-secondary-600" />
                <span className="text-sm font-medium text-secondary-700">
                  {uploadedName}
                </span>
                <span className="text-xs text-primary-400">
                  Click to replace the file
                </span>
              </>
            ) : (
              <>
                <FiUploadCloud className="text-2xl text-primary-400" />
                <span className="text-sm text-primary-500">
                  Click to upload a file
                </span>
              </>
            )}
            <input
              id="material-file"
              ref={fileInputRef}
              type="file"
              className="hidden"
              disabled={uploading || loading}
              onChange={handleFileChange}
            />
          </label>
          {uploadError && (
            <p className="mt-1.5 text-sm text-accent-800">{uploadError}</p>
          )}
        </div>

        {/* Or paste a link instead of uploading */}
        <Input
          id="material-url"
          label="Or paste a link (URL)"
          placeholder="https://..."
          value={form.fileUrl}
          onChange={(e) => setField("fileUrl", e.target.value)}
          error={errors.fileUrl}
          hint="Upload a file above, or paste a direct link here."
        />
        {form.fileUrl && !uploadedName && (
          <p className="flex items-center gap-1.5 text-xs text-primary-400">
            <FiLink className="shrink-0" />
            <span className="truncate">{form.fileUrl}</span>
          </p>
        )}
      </form>
    </Modal>
  );
};

export default MaterialFormModal;
