// Shared constants and helpers for admission management.

// Status -> English label + Badge variant.
export const STATUS_META = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

// Status filter options (including all).
export const STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// Desired class filter options (including all).
export const CLASS_FILTERS = [
  { value: "", label: "All Classes" },
  { value: "Qaida", label: "Qaida" },
  { value: "Nazera", label: "Nazera" },
  { value: "Hifz", label: "Hifz" },
  { value: "Ampara", label: "Ampara" },
];

// Just returns the value.
export const toBanglaDigits = (value) => {
  return String(value ?? "");
};

// ISO Date -> English Date (dd/mm/yyyy).
export const formatBanglaDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
};
