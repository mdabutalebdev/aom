"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import { loginUser } from "@/redux/authSlice";
import { getRoleHome } from "@/config/auth";
import { Card, CardHeader, CardTitle, CardBody, Input, Button, Spinner } from "@/components/ui";

// Login validation schema.
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      const result = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(result)) {
        const user = result.payload.user;
        router.replace(getRoleHome(user?.role));
      } else {
        setServerError(result.payload || "Login failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <p className="mt-1 text-sm text-primary-500">
          Enter your details to access your account
        </p>
      </CardHeader>

      <CardBody>
        {resetSuccess && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-secondary-200 bg-secondary-50 px-4 py-2.5 text-sm text-secondary-700">
            Password changed successfully. Please login with your new password.
          </div>
        )}

        {serverError && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-danger/30 bg-red-50 px-4 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

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

          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              className="px-10"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
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

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={submitting}
            disabled={submitting}
          >
            <span>Login</span>
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-primary-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary-700 hover:underline"
          >
            Register
          </Link>
        </p>
      </CardBody>
    </Card>
  );
};

const LoginPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
