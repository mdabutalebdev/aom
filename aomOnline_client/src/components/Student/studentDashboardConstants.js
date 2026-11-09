// Phase 9 Student  Parent  Dashboard     ()।

import {
  toBanglaDigits,
  BANGLA_MONTHS,
  BANGLA_WEEKDAYS,
} from "@/components/Teacher/attendanceConstants";

export { toBanglaDigits, BANGLA_MONTHS, BANGLA_WEEKDAYS };

//      —    
// (📖  · ✏️  · 📝  · 🏫  · 📚  · 🏆 )।
export const MILESTONE_EMOJIS = ["📖", "✏️", "📝", "🏫", "📚", "🏆"];

//     (    )।
export const milestoneEmoji = (index) =>
  MILESTONE_EMOJIS[index] || MILESTONE_EMOJIS[MILESTONE_EMOJIS.length - 1];

// Attendance  →  ,    (  + )।
export const ATTENDANCE_STATUS_META = {
  present: {
    label: "",
    mark: "✓",
    cellClass: "bg-secondary-500 text-white ring-secondary-600",
    dotClass: "bg-secondary-500",
  },
  absent: {
    label: "",
    mark: "✕",
    cellClass: "bg-danger text-white ring-danger",
    dotClass: "bg-danger",
  },
  leave: {
    label: "",
    mark: "•",
    cellClass: "bg-accent-400 text-white ring-accent-500",
    dotClass: "bg-accent-400",
  },
  holiday: {
    label: "",
    mark: "",
    cellClass: "bg-primary-100 text-primary-500 ring-primary-200",
    dotClass: "bg-primary-300",
  },
};

//    ।
export const ATTENDANCE_LEGEND = ["present", "absent", "leave", "holiday"];

//   →  ,     (  )।
export const FILE_TYPE_META = {
  excel: {
    icon: "📊",
    label: " ",
    tint: "bg-secondary-50 text-secondary-700 ring-secondary-200",
  },
  pdf: {
    icon: "📄",
    label: " ",
    tint: "bg-red-50 text-danger ring-red-200",
  },
  image: {
    icon: "🖼️",
    label: " ",
    tint: "bg-blue-50 text-blue-600 ring-blue-200",
  },
  video: {
    icon: "🎬",
    label: " ",
    tint: "bg-primary-50 text-primary-700 ring-primary-200",
  },
  other: {
    icon: "📁",
    label: " ",
    tint: "bg-purple-50 text-purple-600 ring-purple-200",
  },
};

//         (  other)।
export const fileTypeMeta = (fileType) => {
  const key = String(fileType || "").toLowerCase();
  return FILE_TYPE_META[key] || FILE_TYPE_META.other;
};

//  / (-)    ।
export const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
