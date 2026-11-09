"use client";

import React from "react";
import { FiChevronDown } from "react-icons/fi";

import { cn } from "@/lib/utils";

/**
 * Select — dropdown field with label and error support.
 * `options` is an array of { value, label } or plain strings.
 */
const Select = React.forwardRef(
  (
    {
      label,
      id,
      error,
      hint,
      options = [],
      placeholder = "Select...",
      className = "",
      containerClassName = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-primary-800"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={`w-full appearance-none rounded-[var(--radius-md)] border bg-surface px-4 py-2.5 pr-10 text-base text-primary-900 outline-none transition-colors duration-200 focus:ring-2 ${
              error
                ? "border-danger focus:border-danger focus:ring-red-200"
                : "border-primary-200 focus:border-primary-500 focus:ring-primary-200"
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children ||
              options.map((opt) => {
                const value = typeof opt === "string" ? opt : opt.value;
                const label = typeof opt === "string" ? opt : opt.label;
                const disabled = typeof opt === "string" ? false : !!opt.disabled;
                return (
                  <option key={value} value={value} disabled={disabled}>
                    {label}
                  </option>
                );
              })}
          </select>
          {/* Custom chevron — the native arrow is removed by appearance-none. */}
          <FiChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary-400"
          />
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

Select.displayName = "Select";

export default Select;
