// Phase 6 — Shared constants for teacher management and payment system.

// Payment status -> English label + Badge variant.
export const PAYMENT_STATUS_META = {
  paid: { label: "Paid", variant: "success" },
  unpaid: { label: "Unpaid", variant: "danger" },
  pending: { label: "Pending Review", variant: "warning" },
};

// Student payment status filter options (including all).
export const PAYMENT_STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "pending", label: "Pending Review" },
];

// English month names (1-based index, month=1 -> January).
export const BANGLA_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// month (1-12) -> English month name; empty string if out of bounds.
export const banglaMonthName = (month) => {
  const idx = Number(month) - 1;
  return BANGLA_MONTHS[idx] || "";
};
