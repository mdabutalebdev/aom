// Shared constants and helpers for Phase 5 Admin Management Module.

// Returns the original value as English digits are default.
export const toBanglaDigits = (value) => {
  return String(value ?? "");
};

// Amount in Taka with the ৳ sign (e.g. "৳1,200").
export const formatTaka = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `৳${n.toLocaleString("en-US")}`;
};

// Student status -> English label + Badge variant.
export const STUDENT_STATUS_META = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "neutral" },
  suspended: { label: "Suspended", variant: "danger" },
};

// Student status filter options (including all).
export const STUDENT_STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

// Status options for form modals (without filter-all).
export const STUDENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];
