"use client";

import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

/**
 * Input — text field with label and error support. Bangla-friendly.
 * Works with react-hook-form via ref forwarding.
 */
const Input = React.forwardRef(
  ({ label, id, error, hint, className = "", containerClassName = "", type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-primary-800"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={inputType}
            className={`w-full rounded-[var(--radius-md)] border bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:ring-2 ${
              isPassword ? "pr-10" : ""
            } ${
              error
                ? "border-danger focus:border-danger focus:ring-red-200"
                : "border-primary-200 focus:border-primary-500 focus:ring-primary-200"
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-primary-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
