// Shared hero-feature icon registry — used by both the admin Homepage
// Content form (picker) and the public Hero section (rendering). Keeps icon
// choice data-driven instead of hardcoded, mirroring courseIcons.js.
import {
  MdOutlinePeopleAlt,
  MdOutlineWc,
  MdOutlineCalendarMonth,
  MdOutlineShield,
  MdTrendingUp,
  MdOutlineChat,
  MdOutlineHandshake,
} from "react-icons/md";

export const HERO_ICON_OPTIONS = [
  { value: "users", label: "People / Group", Icon: MdOutlinePeopleAlt },
  { value: "gender", label: "Male & Female", Icon: MdOutlineWc },
  { value: "calendar", label: "Calendar / Schedule", Icon: MdOutlineCalendarMonth },
  { value: "shield", label: "Shield / Security", Icon: MdOutlineShield },
  { value: "trending", label: "Progress / Trending Up", Icon: MdTrendingUp },
  { value: "chat", label: "Chat / Interactive", Icon: MdOutlineChat },
  { value: "handshake", label: "Handshake / Together", Icon: MdOutlineHandshake },
];

const DEFAULT_ICON = MdOutlinePeopleAlt;

// Look up the icon component for a stored icon key; falls back to a sensible
// default when the key is missing/unrecognized.
export const getHeroIcon = (key) =>
  HERO_ICON_OPTIONS.find((o) => o.value === key)?.Icon || DEFAULT_ICON;

// Fallback feature callouts — shared by the public Hero section (rendered
// until Settings loads / if never configured) and the admin form (so it
// pre-fills with what's actually showing on the site rather than blank).
export const DEFAULT_HERO_FEATURES = [
  { icon: "users", label: "One to One Classes" },
  { icon: "gender", label: "Male & Female Teachers" },
  { icon: "calendar", label: "Flexible Schedule" },
  { icon: "shield", label: "Safe & Secure Environment" },
];

// Fallback feature bullets for the "Watch Our Live Class Demo" comparison
// cards — same role as DEFAULT_HERO_FEATURES above, for the Class Demo
// section's two sides.
export const DEFAULT_CLASSDEMO_ONETOONE_FEATURES = [
  { icon: "users", label: "Personalized Attention" },
  { icon: "calendar", label: "Flexible Schedule" },
  { icon: "trending", label: "Faster Progress" },
  { icon: "shield", label: "Focus on Individual Needs" },
];

export const DEFAULT_CLASSDEMO_GROUP_FEATURES = [
  { icon: "chat", label: "Interactive Learning" },
  { icon: "users", label: "Peer Motivation" },
  { icon: "handshake", label: "Learn Together" },
  { icon: "shield", label: "Affordable & Effective" },
];

// Fallback copy for the Class Demo section.
//
// Shared so the admin editor and the live section agree: these used to be
// inline in LiveClassDemo.jsx only, so an unsaved field rendered its default
// on the homepage while the admin form showed an empty box — making it look
// like the section had no content.
export const DEFAULT_CLASSDEMO_TEXT = {
  classDemoBadgeText: "CLASS DEMO",
  classDemoHeadingMain: "Watch Our",
  classDemoHeadingHighlight: "Live Class Demo",
  classDemoDescription:
    "Experience the best of both worlds – One-to-One personalized attention and interactive Group learning.",
  classDemoOneToOneTitle: "ONE-TO-ONE CLASS",
  classDemoGroupTitle: "GROUP CLASS",
};
