"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiKey, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { Card, CardHeader, CardTitle, CardBody, Input, Button, Spinner } from "@/components/ui";

// Reset-password validation schema.
const resetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: tokenFromQuery },
  });

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: values.token,
          newPassword: values.newPassword,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok || data.success === false) {
        setServerError(data.message || "Password reset failed.");
        return;
      }

      // If successful, send to login page with success message.
      router.replace("/login?reset=success");
    } catch {
      setServerError("Could not connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set New Password</CardTitle>
        <p className="mt-1 text-sm text-primary-500">
          Enter reset token and new password
        </p>
      </CardHeader>

      <CardBody>
        {serverError && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-danger/30 bg-red-50 px-4 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="relative">
            <FiKey className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
            <Input
              id="token"
              type="text"
              label="Reset Token"
              placeholder="Enter your reset token"
              className="pl-10"
              error={errors.token?.message}
              {...register("token")}
            />
          </div>

          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              label="New Password"
              placeholder="At least 6 characters"
              className="px-10"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-[42px] text-primary-400 hover:text-primary-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              label="Confirm Password"
              placeholder="Re-enter new password"
              className="px-10"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-[42px] text-primary-400 hover:text-primary-600"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={submitting}
            disabled={submitting}
          >
            Reset Password
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-primary-600">
          <Link
            href="/login"
            className="font-medium text-primary-700 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </CardBody>
    </Card>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
