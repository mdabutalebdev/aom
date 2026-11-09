"use client";

import React from "react";

import Card from "@/components/ui/Card";
import { toBanglaDigits, milestoneEmoji } from "./studentDashboardConstants";

/**
 * StudentProgress —   ।
 * " " +    ( percent-) +    +
 *  {percentage}%  + %   ।
 */
const StudentProgress = ({ progress, milestoneMessage }) => {
  const p = progress || {};
  const percentage = Math.max(0, Math.min(100, Number(p.percentage) || 0));
  const className = p.className || "—";

  //   —   0/20/40/60/80/100 ।
  const milestones =
    Array.isArray(p.milestones) && p.milestones.length > 0
      ? p.milestones
      : [0, 20, 40, 60, 80, 100].map((percent) => ({ percent }));

  const isComplete = percentage >= 100;

  return (
    <Card className="p-5 sm:p-6">
      {/* :   +   */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-2xl text-white shadow-soft ring-4 ring-secondary-100">
            📖
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-400">
               
            </p>
            <p className="text-2xl font-bold text-primary-900">{className}</p>
          </div>
        </div>

        <div className="relative">
          <span className="inline-flex items-center rounded-[var(--radius-md)] bg-secondary-500 px-4 py-1.5 text-lg font-bold text-white shadow-soft">
            {toBanglaDigits(percentage)}%
          </span>
        </div>
      </div>

      {/*   */}
      <div className="mt-8 px-1">
        <div className="relative">
          {/*   */}
          <div className="absolute left-0 right-0 top-6 h-2 -translate-y-1/2 rounded-full bg-primary-100" />
          {/*  */}
          <div
            className="absolute left-0 top-6 h-2 -translate-y-1/2 rounded-full bg-secondary-500 transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />

          {/*   */}
          <div className="relative flex items-start justify-between">
            {milestones.map((m, i) => {
              const percent = Number(m.percent) || 0;
              const reached = percentage >= percent;
              return (
                <div
                  key={`${percent}-${i}`}
                  className="flex flex-1 flex-col items-center gap-2"
                  style={{ minWidth: 0 }}
                >
                  {/*   */}
                  <span
                    className={`text-2xl transition-transform sm:text-3xl ${
                      reached ? "scale-100" : "scale-90 opacity-40 grayscale"
                    }`}
                    aria-hidden="true"
                  >
                    {milestoneEmoji(i)}
                  </span>
                  {/*    */}
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ring-2 transition-colors ${
                      reached
                        ? "bg-secondary-500 text-white ring-secondary-200"
                        : "bg-white text-primary-300 ring-primary-200"
                    }`}
                  >
                    {reached ? "★" : ""}
                  </span>
                  {/*   */}
                  <span
                    className={`text-xs font-semibold ${
                      reached ? "text-secondary-700" : "text-primary-400"
                    }`}
                  >
                    {toBanglaDigits(percent)}%
                  </span>
                  {m.label && (
                    <span className="text-center text-[10px] leading-tight text-primary-400">
                      {m.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/*   (%) */}
      {isComplete && (
        <div className="mt-8 flex items-center gap-4 rounded-[var(--radius-lg)] bg-secondary-50 p-4 ring-1 ring-secondary-200 sm:p-5">
          <span className="text-3xl sm:text-4xl" aria-hidden="true">
            🎉
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-secondary-700 sm:text-lg">
              !  {className}   !
            </p>
            {milestoneMessage && (
              <p className="mt-0.5 text-sm text-secondary-600">
                {milestoneMessage}
              </p>
            )}
          </div>
          <span className="hidden text-3xl sm:inline sm:text-4xl" aria-hidden="true">
            🏆
          </span>
        </div>
      )}
    </Card>
  );
};

export default StudentProgress;
