// Shared constants + helpers for the Exam Result sheet module.

// The four known madrasa levels. Picking one in the form pre-fills the subject
// column labels / totals / colour — but every field stays editable afterwards,
// so the admin can write any text they like (and add new levels freely).
export const RESULT_PRESETS = [
  {
    key: "BEGINNER",
    level: "BEGINNER",
    subject1Label: "Qaida",
    subject2Label: "Dua",
    subject1Max: 50,
    subject2Max: 50,
    totalMax: 100,
    theme: "teal",
  },
  {
    key: "INTERMEDIATE",
    level: "INTERMEDIATE",
    subject1Label: "Quran",
    subject2Label: "Tazweed",
    subject1Max: 50,
    subject2Max: 50,
    totalMax: 100,
    theme: "cyan",
  },
  {
    key: "ALIM",
    level: "ALIM",
    subject1Label: "Written",
    subject2Label: "Spoken",
    subject1Max: 50,
    subject2Max: 50,
    totalMax: 100,
    theme: "cyan",
  },
  {
    key: "HIFZ",
    level: "HIFZ",
    subject1Label: "Quran",
    subject2Label: "Tazweed",
    subject1Max: 50,
    subject2Max: 50,
    totalMax: 100,
    theme: "cyan",
  },
];

export const THEME_OPTIONS = [
  { value: "teal", label: "Teal header (Beginner style)" },
  { value: "cyan", label: "Cyan header (Intermediate / Alim / Hifz style)" },
];

// Grade medals go to the top three rows AS ENTERED (the sheets are written in
// rank order), exactly like the printed design — rows 4+ stay blank.
export const gradeForIndex = (i) =>
  i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : "";

export const rowTotal = (row) =>
  (Number(row?.mark1) || 0) + (Number(row?.mark2) || 0);
