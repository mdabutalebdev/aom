"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiAlertCircle, FiUpload, FiX } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AdmissionSuccess from "./AdmissionSuccess";

// Desired class options.
const CLASS_OPTIONS = [
  { value: "Qaida", label: "Qaida" },
  { value: "Nazera", label: "Nazera" },
  { value: "Hifz", label: "Hifz" },
  { value: "Ampara", label: "Ampara" },
];

// Preferred teacher gender + teaching language options.
const TEACHER_GENDER_OPTIONS = [
  { value: "male", label: "Male Teacher" },
  { value: "female", label: "Female Teacher" },
];
const LANGUAGE_OPTIONS = [
  { value: "bengali", label: "Bengali" },
  { value: "english", label: "English" },
  { value: "both", label: "Bengali & English" },
];

// Admission form validation schema.
const admissionSchema = z.object({
  studentName: z
    .string()
    .min(1, "Please enter the student's name")
    .min(2, "Name must be at least 2 characters"),
  guardianName: z
    .string()
    .min(1, "Please enter the guardian's name")
    .min(2, "Name must be at least 2 characters"),
  guardianPhone: z
    .string()
    .min(1, "Please enter the guardian's phone number")
    .refine(
      (v) => /^[-0-9+\-\s]{6,20}$/.test(v),
      "Please enter a valid phone number"
    ),
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email address"),
  address: z
    .string()
    .min(1, "Please enter an address")
    .min(5, "Please enter the complete address"),
  desiredClass: z.string().min(1, "Please select a desired class"),
  preferredTeacherGender: z.string().min(1, "Please select a teacher gender preference"),
  preferredTeachingLanguage: z.string().min(1, "Please select a teaching language"),
  classTime: z.string().optional(),
  guardianProfession: z.string().optional(),
  dateOfBirth: z.string().optional(),
  previousEducation: z.string().optional(),
  note: z.string().optional(),
});

// Textarea field helper — mirrors the Input pattern.
const TextArea = ({ id, label, error, rows = 3, ...props }) => (
  <div className="w-full">
    {label && (
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-primary-800"
      >
        {label}
      </label>
    )}
    <textarea
      id={id}
      rows={rows}
      className={`w-full rounded-[var(--radius-md)] border bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:ring-2 ${
        error
          ? "border-danger focus:border-danger focus:ring-red-200"
          : "border-primary-200 focus:border-primary-500 focus:ring-primary-200"
      }`}
      {...props}
    />
    {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
  </div>
);

// Section heading helper.
const SectionTitle = ({ children }) => (
  <h3 className="mb-4 border-b border-primary-100 pb-2 text-lg font-semibold text-primary-800">
    {children}
  </h3>
);

const AdmissionForm = () => {
  // Submit status: server error message.
  const [serverError, setServerError] = useState("");
  // Confirmation screen after a successful application.
  const [submitted, setSubmitted] = useState(null); // { studentName, message } | null

  // Photo upload state.
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoNote, setPhotoNote] = useState("");
  // Bump key to remount and reset the file input (without a ref).
  const [fileKey, setFileKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(admissionSchema) });

  // Photo selected → POST /admissions/upload-photo (multipart, field "photo").
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoNote("");
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`${API_BASE_URL}/admissions/upload-photo`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.data?.url) {
        setPhotoUrl(data.data.url);
        setPhotoNote("");
      } else {
        // Upload failed — photo is optional, so show a soft note and let them continue without it.
        setPhotoUrl("");
        setPhotoNote(
          "Unable to upload the photo. You can still submit the application without one."
        );
      }
    } catch {
      setPhotoUrl("");
      setPhotoNote(
        "Unable to upload the photo. You can still submit the application without one."
      );
    } finally {
      setUploading(false);
    }
  };

  // Remove the selected photo — remount the input to clear the file.
  const clearPhoto = () => {
    setPhotoUrl("");
    setPhotoPreview("");
    setPhotoNote("");
    setFileKey((k) => k + 1);
  };

  const onSubmit = async (values) => {
    setServerError("");

    // Build the payload — omit empty optional fields.
    const payload = {
      studentName: values.studentName.trim(),
      guardianName: values.guardianName.trim(),
      guardianPhone: values.guardianPhone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      desiredClass: values.desiredClass,
      preferredTeacherGender: values.preferredTeacherGender,
      preferredTeachingLanguage: values.preferredTeachingLanguage,
      ...(values.classTime?.trim()
        ? {
            classTime: values.classTime.trim(),
            // Capture the applicant's own timezone so the admin can convert the
            // preferred class time to Bangladesh time automatically.
            guardianTimezone:
              Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          }
        : {}),
      ...(values.guardianProfession?.trim()
        ? { guardianProfession: values.guardianProfession.trim() }
        : {}),
    };
    if (values.dateOfBirth?.trim()) payload.dateOfBirth = values.dateOfBirth.trim();
    if (values.previousEducation?.trim())
      payload.previousEducation = values.previousEducation.trim();
    if (values.note?.trim()) payload.note = values.note.trim();
    if (photoUrl) payload.photo = photoUrl;

    try {
      const res = await fetch(`${API_BASE_URL}/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSubmitted({
          studentName: payload.studentName,
          message:
            data.message ||
            "Your admission application has been submitted. Our admin will review it and get in touch.",
        });
        reset();
        clearPhoto();
        // Scroll to the top of the page so the confirmation is visible.
        if (typeof window !== "undefined")
          window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError(
          data.message ||
            "Unable to submit the application. Please try again."
        );
      }
    } catch {
      setServerError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }
  };

  // Show the confirmation screen after a successful application.
  if (submitted) {
    return (
      <AdmissionSuccess
        studentName={submitted.studentName}
        message={submitted.message}
        onReset={() => {
          setSubmitted(null);
          setServerError("");
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-6 shadow-card sm:p-8 lg:p-10"
    >
      {/* Server error message */}
      {serverError && (
        <div className="mb-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger">
          <FiAlertCircle className="mt-0.5 shrink-0 text-base" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        {/* Section 1: Student & guardian information */}
        <div>
          <SectionTitle>Student &amp; Guardian Information</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="studentName"
              label="Student's Name *"
              placeholder="Student's full name"
              error={errors.studentName?.message}
              {...register("studentName")}
            />
            <Input
              id="guardianName"
              label="Guardian's Name *"
              placeholder="Guardian's full name"
              error={errors.guardianName?.message}
              {...register("guardianName")}
            />
            <Input
              id="guardianPhone"
              type="tel"
              label="Guardian's Phone *"
              placeholder="Mobile number"
              autoComplete="tel"
              error={errors.guardianPhone?.message}
              {...register("guardianPhone")}
            />
            <Input
              id="email"
              type="email"
              label="Email *"
              placeholder="Email address"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              id="guardianProfession"
              label="Guardian's Profession"
              placeholder="e.g. Teacher, Business, Service"
              error={errors.guardianProfession?.message}
              {...register("guardianProfession")}
            />
          </div>
          <div className="mt-4">
            <TextArea
              id="address"
              label="Address *"
              rows={2}
              placeholder="Village/area, post office, upazila, district"
              error={errors.address?.message}
              {...register("address")}
            />
          </div>

          {/* Class preferences */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select
              id="preferredTeacherGender"
              label="Preferred Teacher Gender *"
              placeholder="Select gender preference"
              options={TEACHER_GENDER_OPTIONS}
              error={errors.preferredTeacherGender?.message}
              {...register("preferredTeacherGender")}
            />
            <Select
              id="preferredTeachingLanguage"
              label="Preferred Teaching Language *"
              placeholder="Select language preference"
              options={LANGUAGE_OPTIONS}
              error={errors.preferredTeachingLanguage?.message}
              {...register("preferredTeachingLanguage")}
            />
            <Input
              id="classTime"
              type="time"
              label="Preferred Class Time (your local time)"
              hint="Pick a time in your own timezone — the madrasa converts it automatically."
              error={errors.classTime?.message}
              {...register("classTime")}
            />
          </div>
        </div>

        {/* Section 2: Education details */}
        <div>
          <SectionTitle>Education Details</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="desiredClass"
              label="Desired Class *"
              placeholder="Select a class"
              options={CLASS_OPTIONS}
              error={errors.desiredClass?.message}
              {...register("desiredClass")}
            />
            <Input
              id="dateOfBirth"
              type="date"
              label="Date of Birth (optional)"
              error={errors.dateOfBirth?.message}
              {...register("dateOfBirth")}
            />
          </div>
          <div className="mt-4">
            <TextArea
              id="previousEducation"
              label="Previous Education (optional)"
              rows={2}
              placeholder="Briefly describe where and what they studied before"
              error={errors.previousEducation?.message}
              {...register("previousEducation")}
            />
          </div>
        </div>

        {/* Section 3: Photo & note */}
        <div>
          <SectionTitle>Photo &amp; Note</SectionTitle>

          {/* Photo upload (optional) */}
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-primary-800">
              Student's Photo (optional)
            </label>

            {photoPreview ? (
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-[var(--radius-lg)] border border-primary-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Selected photo"
                    className="h-full w-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary-900/30">
                      <Spinner size="md" className="border-white/40 border-t-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearPhoto}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-primary-200 px-3 py-1.5 text-sm text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-60"
                >
                  <FiX /> Remove Photo
                </button>
              </div>
            ) : (
              <label
                htmlFor="photo"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-primary-200 bg-primary-50/40 px-4 py-8 text-center text-primary-500 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <FiUpload className="text-2xl" />
                <span className="text-sm font-medium">
                  Click to select a photo
                </span>
                <span className="text-xs text-primary-400">
                  JPG or PNG (optional)
                </span>
              </label>
            )}

            <input
              key={fileKey}
              id="photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {/* Soft note about photo upload */}
            {photoNote && (
              <p className="mt-2 text-sm text-accent-700">{photoNote}</p>
            )}
          </div>

          {/* Note (optional) */}
          <div className="mt-4">
            <TextArea
              id="note"
              label="Note (optional)"
              rows={3}
              placeholder="Write any additional information here"
              error={errors.note?.message}
              {...register("note")}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          disabled={isSubmitting || uploading}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>

        {uploading && (
          <p className="text-center text-sm text-primary-500">
            Uploading photo, please wait...
          </p>
        )}
      </form>
    </motion.div>
  );
};

export default AdmissionForm;
