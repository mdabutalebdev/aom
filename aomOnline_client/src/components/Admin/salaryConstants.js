// Shared constants for the teacher Salary Management module.

// Salary status -> label + Badge variant.
// 'partial' is its own state rather than being folded into 'unpaid': once any
// money has been recorded against a month, "Unpaid" would misrepresent it.
export const SALARY_STATUS_META = {
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  unpaid: { label: "Unpaid", variant: "danger" },
};

export const SALARY_STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "unpaid", label: "Unpaid" },
];

// Disbursement methods — must match SALARY_METHODS on the server.
export const SALARY_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "other", label: "Other" },
];

export const methodLabel = (value) =>
  SALARY_METHODS.find((m) => m.value === value)?.label || value || "—";

// What a disbursement is for — shown on the payslip.
export const PAYMENT_PURPOSES = [
  { value: "Monthly Salary", label: "Monthly Salary" },
  { value: "Bonus", label: "Bonus" },
  { value: "Advance", label: "Advance" },
  { value: "Arrears", label: "Arrears (Due)" },
  { value: "Other", label: "Other" },
];

// Cash needs no transaction id; every other method does.
export const methodNeedsTxn = (value) => value !== "cash";

// Build the month options for the period picker: the current month and the
// 11 before it, newest first.
export const buildPeriodOptions = (count = 12) => {
  const now = new Date();
  const options = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    options.push({ month: d.getUTCMonth() + 1, year: d.getUTCFullYear() });
  }
  return options;
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { dateStyle: "medium" });
};

// Today as yyyy-mm-dd for <input type="date"> defaults.
export const todayInputValue = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
