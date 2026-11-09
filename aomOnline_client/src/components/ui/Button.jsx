"use client";

import React from "react";
import Spinner from "./Spinner";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-300 shadow-soft",
  secondary:
    "bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-300 shadow-soft",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 focus-visible:ring-accent-300 shadow-soft",
  outline:
    "border border-primary-500 text-primary-600 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-200",
  ghost:
    "bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-200",
  danger:
    "bg-danger text-white hover:brightness-95 focus-visible:ring-red-300 shadow-soft",
};

const sizes = {
  sm: "px-3.5 py-1.5 text-sm rounded-[var(--radius-sm)] gap-1.5",
  md: "px-5 py-2.5 text-base rounded-[var(--radius-md)] gap-2",
  lg: "px-7 py-3.5 text-lg rounded-[var(--radius-lg)] gap-2.5",
};

/**
 * Button — primary interactive control. Bangla-friendly, uses design tokens.
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="flex items-center">
          <Spinner size="sm" className="border-white/40 border-t-white" />
        </span>
      )}
      <span className="flex items-center gap-2">{children}</span>
    </button>
  );
};

export default Button;
