"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiUploadCloud, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";
import axios from "axios";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { API_ORIGIN } from "@/config/api";

const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(11, "Phone number is required (min 11 chars)"),
  coverLetter: z.string().optional(),
});

export default function JoinTeacherPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // File states
  const [cvFile, setCvFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
  });

  const onSubmit = async (data) => {
    if (!cvFile || !mediaFile) {
      toast.error("Please upload both your CV and a Recitation (Tilawat) file.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    if (data.coverLetter) formData.append("coverLetter", data.coverLetter);
    formData.append("cv", cvFile);
    formData.append("media", mediaFile);

    try {
      // In development, the proxy or CORS will handle the API call.
      // Usually the base URL is from an env variable. Using a generic approach.
      await axios.post(`${API_ORIGIN}/api/teacher-applications`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setIsSuccess(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <FiCheckCircle className="mb-6 text-7xl text-green-500" />
        <h1 className="mb-4 text-3xl font-bold text-primary-900">Application Received!</h1>
        <p className="max-w-md text-center text-lg text-primary-600">
          Thank you for your interest in joining AOM Online Madrasa. We have received your application and will review it shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
          Join as a Teacher
        </h1>
        <p className="text-lg text-primary-600">
          Inspire and educate students around the world. Fill out the form below to apply.
        </p>
      </div>

      <div className="rounded-[var(--radius-xl)] bg-surface p-6 shadow-soft sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              id="name"
              label="Full Name"
              placeholder="Enter your full name"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
          </div>

          <Input
            id="phone"
            label="Phone Number"
            placeholder="01XXXXXXXXX"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <div className="space-y-1.5">
            <label htmlFor="coverLetter" className="block text-sm font-medium text-primary-800">
              Cover Letter (Optional)
            </label>
            <textarea
              id="coverLetter"
              rows={4}
              className="w-full rounded-[var(--radius-md)] border border-primary-200 bg-surface px-4 py-3 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Tell us a little bit about yourself and why you want to join..."
              {...register("coverLetter")}
            />
          </div>

          <div className="grid gap-6 pt-4 sm:grid-cols-2">
            {/* CV Upload */}
            <div>
              <p className="mb-1.5 block text-sm font-medium text-primary-800">
                Upload CV (PDF) <span className="text-danger">*</span>
              </p>
              <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 p-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50">
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => setCvFile(e.target.files[0])}
                />
                <FiUploadCloud className="mb-2 text-3xl text-primary-400" />
                <span className="text-sm font-medium text-primary-700">
                  {cvFile ? cvFile.name : "Click or drag to upload"}
                </span>
                {!cvFile && <span className="mt-1 text-xs text-primary-500">PDF up to 5MB</span>}
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <p className="mb-1.5 block text-sm font-medium text-primary-800">
                Recitation / Tilawat (Audio/Video) <span className="text-danger">*</span>
              </p>
              <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 p-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50">
                <input
                  type="file"
                  accept="audio/*,video/*"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => setMediaFile(e.target.files[0])}
                />
                <FiUploadCloud className="mb-2 text-3xl text-primary-400" />
                <span className="text-sm font-medium text-primary-700">
                  {mediaFile ? mediaFile.name : "Click or drag to upload"}
                </span>
                {!mediaFile && (
                  <span className="mt-1 text-xs text-primary-500">MP3/MP4 up to 50MB</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
