"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMail } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { Card, CardHeader, CardTitle, CardBody, Input, Button } from "@/components/ui";

// Forgot-password validation schema.
const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

const ForgotPasswordPage = () => {
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Backend directly returns resetToken in dev mode.
  const [resetToken, setResetToken] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values) => {
    setServerError("");
    setResetToken("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok || data.success === false) {
        setServerError(data.message || "Request failed. Please try again.");
        return;
      }

      setResetToken(data.data?.resetToken || "");
    } catch {
      setServerError("Could not connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password?</CardTitle>
        <p className="mt-1 text-sm text-primary-500">
          Enter your email and we'll help you reset it
        </p>
      </CardHeader>

      <CardBody>
        {serverError && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-danger/30 bg-red-50 px-4 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

        {resetToken ? (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-md)] border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-700">
              <p className="font-medium">Reset token generated.</p>
              <p className="mt-1">
                In development mode, you can use the token below to reset your password:
              </p>
              <code className="mt-2 block break-all rounded-[var(--radius-sm)] bg-white px-3 py-2 text-xs text-primary-800">
                {resetToken}
              </code>
            </div>

            <Link href={`/reset-password?token=${encodeURIComponent(resetToken)}`}>
              <Button variant="primary" fullWidth>
                Reset Password
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                className="pl-10"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={submitting}
              disabled={submitting}
            >
              Get Reset Link
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-primary-600">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </CardBody>
    </Card>
  );
};

export default ForgotPasswordPage;
