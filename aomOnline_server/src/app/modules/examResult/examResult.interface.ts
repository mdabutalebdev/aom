// Exam result sheet — a printable "Result Of Final Exam" table the admin fills
// in and downloads as a PDF/PNG. One document = one sheet (one level/batch).
//
// The structure mirrors the printed design: a two-subject marksheet where
// every label is admin-controlled (so the same sheet works for Beginner,
// Intermediate, Alim, Hifz, …). Grades (1st/2nd/3rd) are NOT stored — they are
// derived from row order at render time (the top three rows), exactly as the
// printed sheets show them.

export interface IExamResultRow {
  name: string;
  country?: string;
  mark1: number; // score in subject 1
  mark2: number; // score in subject 2
}

// Header colour scheme — 'teal' matches the Beginner sheet (solid teal header
// cells), 'cyan' matches Intermediate/Alim/Hifz (bright sky header cells).
export type TResultTheme = 'teal' | 'cyan';

export interface IExamResult {
  title: string; // e.g. "Result Of Final Exam"
  level: string; // e.g. "BEGINNER" (free text — admin writes it)

  subject1Label: string; // e.g. "Qaida"
  subject1Max: number; // e.g. 50
  subject2Label: string; // e.g. "Dua"
  subject2Max: number; // e.g. 50
  totalMax: number; // e.g. 100 — shown in the legend ("Total = 100")

  theme: TResultTheme;
  rows: IExamResultRow[];

  createdAt?: Date;
  updatedAt?: Date;
}
