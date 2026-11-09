// Shared course-icon registry — used by both the admin Class form (picker)
// and the public homepage (rendering). Keeps icon choice data-driven instead
// of hardcoded per-class in either place.
import {
  FaBookQuran,
  FaBookOpen,
  FaMosque,
  FaStarAndCrescent,
  FaChild,
  FaGraduationCap,
  FaPersonPraying,
  FaLanguage,
  FaAward,
  FaTrophy,
  FaCertificate,
  FaUserGroup,
} from "react-icons/fa6";

export const COURSE_ICON_OPTIONS = [
  { value: "quran", label: "Quran", Icon: FaBookQuran },
  { value: "book", label: "Book / Qaida", Icon: FaBookOpen },
  { value: "mosque", label: "Mosque", Icon: FaMosque },
  { value: "crescent", label: "Star & Crescent", Icon: FaStarAndCrescent },
  { value: "child", label: "Child / Kids", Icon: FaChild },
  { value: "graduate", label: "Graduation", Icon: FaGraduationCap },
  { value: "prayer", label: "Prayer", Icon: FaPersonPraying },
  { value: "language", label: "Language / Arabic", Icon: FaLanguage },
  { value: "award", label: "Award", Icon: FaAward },
  { value: "trophy", label: "Trophy", Icon: FaTrophy },
  { value: "certificate", label: "Certificate", Icon: FaCertificate },
  { value: "people", label: "People / Group", Icon: FaUserGroup },
];

const DEFAULT_ICON = FaBookQuran;

// Look up the icon component for a stored icon key; falls back to a sensible
// default when the key is missing/unrecognized (e.g. classes created before
// this field existed).
export const getCourseIcon = (key) =>
  COURSE_ICON_OPTIONS.find((o) => o.value === key)?.Icon || DEFAULT_ICON;
