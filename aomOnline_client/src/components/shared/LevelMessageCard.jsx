"use client";

import React, { useMemo } from "react";
import { sanitizeRichText, isRichTextEmpty } from "./sanitizeRichText";

// A single gold star (used for the top flourish and milestone nodes).
const Star = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2.5l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.4 19.7l1.3-6.3L2.9 9.1l6.4-.7z"
    />
  </svg>
);

// Smiling kawaii star mascot — the charm of the card.
const MascotStar = ({ className = "" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path
      d="M32 7 L38.5 24.1 L56.7 25 L42.5 36.4 L47.3 54 L32 44 L16.7 54 L21.5 36.4 L7.3 25 L25.5 24.1 Z"
      fill="#fbbf24"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* rosy cheeks */}
    <circle cx="22.5" cy="37" r="2.6" fill="#fb7185" opacity="0.55" />
    <circle cx="41.5" cy="37" r="2.6" fill="#fb7185" opacity="0.55" />
    {/* eyes */}
    <circle cx="26.5" cy="32.5" r="2.2" fill="#7c2d12" />
    <circle cx="37.5" cy="32.5" r="2.2" fill="#7c2d12" />
    {/* smile */}
    <path
      d="M27 37.5 Q32 42.5 37 37.5"
      fill="none"
      stroke="#7c2d12"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Scattered confetti specks inside the bubble (deterministic positions).
const CONFETTI = [
  { top: "10%", left: "8%", color: "#f59e0b", shape: "circle" },
  { top: "16%", left: "88%", color: "#3b82f6", shape: "circle" },
  { top: "30%", left: "4%", color: "#10b981", shape: "rect" },
  { top: "62%", left: "10%", color: "#8b5cf6", shape: "circle" },
  { top: "74%", left: "84%", color: "#f43f5e", shape: "rect" },
  { top: "44%", left: "94%", color: "#f59e0b", shape: "circle" },
  { top: "20%", left: "48%", color: "#10b981", shape: "circle" },
  { top: "84%", left: "40%", color: "#3b82f6", shape: "rect" },
  { top: "52%", left: "2%", color: "#f43f5e", shape: "circle" },
  { top: "8%", left: "68%", color: "#8b5cf6", shape: "rect" },
];

const Confetti = () =>
  CONFETTI.map((c, i) => (
    <span
      key={i}
      className={`pointer-events-none absolute ${
        c.shape === "circle" ? "h-1.5 w-1.5 rounded-full" : "h-2 w-1 rounded-[1px] rotate-12"
      }`}
      style={{ top: c.top, left: c.left, backgroundColor: c.color }}
      aria-hidden="true"
    />
  ));

/**
 * LevelMessageCard — guardian-facing progress card. A festive cloud bubble
 * holds the teacher's hand-written (rich-text) message, framed by gold stars,
 * a smiling star mascot, confetti and playful icons, with the class name, a
 * percentage badge and a calm milestone star-path — no animation.
 */
const LevelMessageCard = ({
  className,
  percentage = 0,
  note = "",
  milestones,
}) => {
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const safeHtml = useMemo(() => sanitizeRichText(note), [note]);
  const hasMessage = !isRichTextEmpty(note);

  const steps = useMemo(() => {
    const base =
      Array.isArray(milestones) && milestones.length > 0
        ? milestones.map((m) => Number(m.percent) || 0)
        : [0, 40, 60, 80, 100];
    return [...new Set(base)].sort((a, b) => a - b);
  }, [milestones]);

  return (
    <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft sm:p-6">
      {/* Header: current class + percentage */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-600 text-lg text-white shadow-soft">
            📖
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-400">
              Current Class
            </p>
            <p className="text-lg font-bold text-secondary-700 dark:text-secondary-300">
              {className || "—"}
            </p>
          </div>
        </div>
        <span className="rounded-[var(--radius-md)] bg-secondary-600 px-3.5 py-1.5 text-base font-bold text-white shadow-soft">
          {pct}%
        </span>
      </div>

      {/* Festive cloud bubble */}
      <div className="relative mt-6 rounded-[2rem] border-2 border-dashed border-secondary-300 bg-gradient-to-br from-secondary-50 via-surface to-accent-50 px-6 pb-10 pt-6 sm:px-10 dark:border-secondary-700 dark:from-secondary-950/40 dark:via-surface dark:to-accent-950/30">
        <Confetti />

        {/* Corner icons */}
        <span className="pointer-events-none absolute -top-4 right-6 text-3xl sm:text-4xl" aria-hidden="true">
          ✏️
        </span>
        <span className="pointer-events-none absolute bottom-3 right-5 text-2xl sm:text-3xl" aria-hidden="true">
          📖
        </span>

        {/* Smiling mascot spilling out of the bottom-left corner */}
        <MascotStar className="pointer-events-none absolute -bottom-5 -left-3 h-16 w-16 drop-shadow sm:h-20 sm:w-20" />

        <div className="relative flex flex-col items-center text-center">
          {/* Gold stars */}
          <div className="flex items-center gap-1 text-amber-400">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className={`h-5 w-5 sm:h-6 sm:w-6 ${i === 2 ? "-mt-1 scale-125" : ""}`} />
            ))}
          </div>

          {/* Teacher's message — the teacher writes all of the wording. */}
          <div className="mt-4 max-w-xl px-2">
            {hasMessage ? (
              <div
                className="rich-message text-base font-semibold leading-relaxed text-secondary-700 sm:text-lg dark:text-secondary-200"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />
            ) : (
              <p className="text-base font-semibold leading-relaxed text-secondary-700 sm:text-lg dark:text-secondary-200">
                তোমার শেখা দারুণ চলছে — এভাবেই এগিয়ে যাও! 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Calm milestone star-path (no animation) */}
      <div className="mt-6 px-2">
        <div className="relative">
          <div className="absolute left-0 right-0 top-3 h-1.5 -translate-y-1/2 rounded-full bg-primary-100" />
          <div
            className="absolute left-0 top-3 h-1.5 -translate-y-1/2 rounded-full bg-secondary-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
          <div className="relative flex items-start justify-between">
            {steps.map((percent, i) => {
              const reached = pct >= percent;
              return (
                <div key={`${percent}-${i}`} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ring-2 transition-colors ${
                      reached
                        ? "bg-secondary-500 text-white ring-secondary-200"
                        : "bg-surface text-primary-300 ring-primary-200"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      reached ? "text-secondary-700" : "text-primary-400"
                    }`}
                  >
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMessageCard;
