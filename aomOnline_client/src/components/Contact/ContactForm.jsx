"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaCheckCircle } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Contact form validation schema.
const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter your name")
    .min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[-0-9+\-\s]{6,20}$/.test(v),
      "Please enter a valid phone number"
    ),
  subject: z.string().optional(),
  message: z
    .string()
    .min(1, "Please write a message")
    .min(10, "Message must be at least 10 characters"),
});

const ContactForm = () => {
  const [status, setStatus] = useState({ type: null, message: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values) => {
    setStatus({ type: null, message: "" });

    // Omit empty optional fields.
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    };
    if (values.phone?.trim()) payload.phone = values.phone.trim();
    if (values.subject?.trim()) payload.subject = values.subject.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus({
          type: "success",
          message:
            data.message ||
            "Your message has been sent successfully. We'll get back to you soon.",
        });
        reset();
      } else {
        setStatus({
          type: "error",
          message:
            data.message ||
            "Unable to send your message. Please try again.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message:
          "Unable to connect to the server. Please check your internet connection and try again.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-8 shadow-card sm:p-10"
    >
      <h2 className="text-2xl font-semibold text-primary-800">
        Send Us a Message
      </h2>
      <p className="mt-2 text-primary-600">
        Fill out the form below and we&apos;ll get back to you as soon as possible.
      </p>

      {/* Status message */}
      {status.type === "success" && (
        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-700">
          <FaCheckCircle className="mt-0.5 shrink-0 text-base" />
          <span>{status.message}</span>
        </div>
      )}
      {status.type === "error" && (
        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger">
          <FiAlertCircle className="mt-0.5 shrink-0 text-base" />
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          id="name"
          label="Name *"
          placeholder="Your full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="email"
            type="email"
            label="Email *"
            placeholder="Your email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="phone"
            type="tel"
            label="Phone"
            placeholder="Your phone number"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <Input
          id="subject"
          label="Subject"
          placeholder="Subject of your message"
          error={errors.subject?.message}
          {...register("subject")}
        />

        {/* Message (textarea) */}
        <div className="w-full">
          <label
            htmlFor="message"
            className="mb-1.5 block text-sm font-medium text-primary-800"
          >
            Message *
          </label>
          <textarea
            id="message"
            rows={5}
            placeholder="Write your message here..."
            className={`w-full rounded-[var(--radius-md)] border bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:ring-2 ${
              errors.message
                ? "border-danger focus:border-danger focus:ring-red-200"
                : "border-primary-200 focus:border-primary-500 focus:ring-primary-200"
            }`}
            {...register("message")}
          />
          {errors.message && (
            <p className="mt-1.5 text-sm text-danger">
              {errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </motion.div>
  );
};

export default ContactForm;
