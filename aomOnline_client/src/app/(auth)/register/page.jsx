"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import { registerUser } from "@/redux/authSlice";
import { getRoleHome } from "@/config/auth";
import { Card, CardHeader, CardTitle, CardBody, Input, Button } from "@/components/ui";

// Registration validation schema.
const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9+\-\s]{6,15}$/.test(val),
        "Enter a valid phone number"
      ),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      //  : { name, email, password, phone? }
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      if (values.phone) payload.phone = values.phone;

      const result = await dispatch(registerUser(payload));
      if (registerUser.fulfilled.match(result)) {
        const user = result.payload.user;
        // - Student → Student Dashboard।
        router.replace(getRoleHome(user?.role) || "/dashboard/student");
      } else {
        setServerError(result.payload || "Registration failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <p className="mt-1 text-sm text-primary-500">
          Create a new student account
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
            <FiUser className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
            <Input
              id="name"
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              className="pl-10"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>

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
            <FiPhone className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
            <Input
              id="phone"
              type="tel"
              label="Phone Number (Optional)"
              placeholder="Enter your phone number"
              className="pl-10"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>

          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="At least 6 characters"
              className="px-10"
              autoComplete="new-password"
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

          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-[42px] text-primary-400" />
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              label="Confirm Password"
              placeholder="Re-enter your password"
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
            Register
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-primary-600">
          Already have an account?{" "}
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

export default RegisterPage;
