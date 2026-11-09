// Phase 8 Teacher  — Progress   Resources    ()।

import { toBanglaDigits } from "@/components/Admin/managementConstants";

export { toBanglaDigits };

// Progress    ( milestones   )।
export const DEFAULT_MILESTONE_PERCENTS = [0, 20, 40, 60, 80, 100];

//  →  ,  "%"।
export const formatPercent = (value) => `${toBanglaDigits(Number(value) || 0)}%`;

//   milestones      (, ),
//      ।
export const milestonePercents = (student) => {
  const raw = Array.isArray(student?.milestones)
    ? student.milestones
        .map((m) => (typeof m === "number" ? m : Number(m?.percent)))
        .filter((n) => Number.isFinite(n))
    : [];
  const list = raw.length ? raw : DEFAULT_MILESTONE_PERCENTS;
  return Array.from(new Set(list)).sort((a, b) => a - b);
};

//     ( student.milestones ,   )।
export const milestoneLabel = (student, percent) => {
  const found = Array.isArray(student?.milestones)
    ? student.milestones.find(
        (m) => typeof m !== "number" && Number(m?.percent) === percent
      )
    : null;
  return found?.label || formatPercent(percent);
};

// ─────────────────────────────────────────────────────────────
// Resources  —    (- Badge +  )।
// ─────────────────────────────────────────────────────────────
export const MATERIAL_TYPE_META = {
  pdf: { label: "PDF", variant: "danger" },
  excel: { label: "Excel", variant: "success" },
  image: { label: "Image", variant: "accent" },
  video: { label: "Video", variant: "primary" },
  other: { label: "Other", variant: "neutral" },
};

//    (  neutral )।
export const materialTypeMeta = (type) =>
  MATERIAL_TYPE_META[type] || { label: type || "", variant: "neutral" };

// / select-  ।
export const MATERIAL_TYPE_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "other", label: "Other" },
];

// Type filter options (with an "All types" entry).
export const MATERIAL_TYPE_FILTERS = [
  { value: "", label: "All Types" },
  ...MATERIAL_TYPE_OPTIONS,
];

//   → materialType  (  fileType  )।
export const guessMaterialType = (nameOrUrl = "") => {
  const ext = String(nameOrUrl).split("?")[0].split(".").pop()?.toLowerCase();
  if (["pdf"].includes(ext)) return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext))
    return "image";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
  return "other";
};

// "YYYY-MM-DD..."  ISO →   ,  "  "।
const BANGLA_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatBanglaDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${toBanglaDigits(d.getDate())} ${
    BANGLA_MONTHS_SHORT[d.getMonth()]
  } ${toBanglaDigits(d.getFullYear())}`;
};
