"use client";

import React from "react";

/**
 * PaymentToggle — Green toggle switch (paid = on / unpaid = off).
 * props: checked, onChange, loading?, disabled?
 */
const PaymentToggle = ({ checked, onChange, loading = false, disabled = false }) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "Paid — Mark Unpaid" : "Unpaid — Mark Paid"}
      disabled={isDisabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-1 ${
        checked
          ? "bg-secondary-500 focus-visible:ring-secondary-300"
          : "bg-primary-200 focus-visible:ring-primary-200"
      } ${isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      >
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" />
        )}
      </span>
    </button>
  );
};

export default PaymentToggle;
