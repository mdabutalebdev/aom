"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/shadcn/chart";
import { toBanglaDigits } from "./managementConstants";

/**
 * DonutChart — Dependency-free inline SVG donut (2 segments).
 * segments = [{ label, value, color }] — Usually Paid vs Unpaid.
 * Shows total in center; legend below with labels.
 */
export const DonutChart = ({ segments = [], centerLabel = "Total" }) => {
  const total = segments.reduce((s, seg) => s + (Number(seg.value) || 0), 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  // Dash-offset calculation for each segment.
  let offset = 0;
  const arcs = segments.map((seg) => {
    const value = Number(seg.value) || 0;
    const fraction = total > 0 ? value / total : 0;
    const dash = fraction * circumference;
    const arc = {
      ...seg,
      dash,
      gap: circumference - dash,
      offset: -offset,
    };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--color-primary-100)"
            strokeWidth="16"
          />
          {total > 0 &&
            arcs.map((arc, i) => (
              <circle
                key={i}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth="16"
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={arc.offset}
                strokeLinecap={arc.dash > 0 && arc.dash < circumference ? "round" : "butt"}
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-primary-900">
            {total}
          </span>
          <span className="text-xs text-primary-500">{centerLabel}</span>
        </div>
      </div>

      {/* Legend */}
      <ul className="space-y-2.5">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-primary-600">{seg.label}</span>
            <span className="ml-auto font-semibold text-primary-900">
              {Number(seg.value) || 0}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * BarChart — Dependency-free CSS bar chart (vertical bars).
 * bars = [{ label, value, color?, sublabel? }]; formatValue for tooltip/label format.
 */
export const BarChart = ({
  bars = [],
  formatValue = (v) => v,
  barColor = "var(--color-primary-500)",
}) => {
  const max = Math.max(1, ...bars.map((b) => Number(b.value) || 0));

  if (bars.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-primary-400">
        No data to display.
      </p>
    );
  }

  return (
    <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
      {bars.map((b, i) => {
        const value = Number(b.value) || 0;
        const heightPct = Math.max(2, (value / max) * 100);
        return (
          <div
            key={`${b.label}-${i}`}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span className="text-[11px] font-medium text-primary-600">
              {value > 0 ? formatValue(value) : ""}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-[var(--radius-sm)] transition-all duration-500"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: b.color || barColor,
                }}
                title={`${b.label}: ${formatValue(value)}`}
              />
            </div>
            <span className="w-full truncate text-center text-[11px] text-primary-500">
              {b.label}
            </span>
            {b.sublabel && (
              <span className="text-[10px] text-primary-400">{b.sublabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const trendChartConfig = {
  value: {
    label: "Collected",
    color: "var(--color-primary-500)",
  },
};

const profitChartConfig = {
  profit: {
    label: "Net Profit",
    color: "var(--color-primary-500)",
  },
};

/**
 * CollectionAreaChart — Recharts smooth area chart (shadcn-styled, solid fill, no gradient).
 * bars = [{ label, value, sublabel? }] — same shape BarChart already consumes.
 */
export const CollectionAreaChart = ({ bars = [] }) => {
  if (bars.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-primary-400">
        No data to display.
      </p>
    );
  }

  const hasData = bars.some((b) => Number(b.value) > 0);
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const lastVal = Number(last?.value) || 0;
  const prevVal = Number(prev?.value) || 0;
  const trendPct = prevVal > 0 ? Math.round(((lastVal - prevVal) / prevVal) * 100) : null;
  const trendingUp = trendPct !== null ? trendPct >= 0 : lastVal >= prevVal;
  const showTrend = hasData && prev && (lastVal !== prevVal || trendPct !== null);

  return (
    <div>
      <ChartContainer config={trendChartConfig} className="aspect-auto h-48 w-full">
        <AreaChart data={bars} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-primary-100)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} />
          <ChartTooltip
            cursor={{ stroke: "var(--color-primary-200)", strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_value, payload) => {
                  const point = payload?.[0]?.payload;
                  return point ? `${point.label} ${point.sublabel || ""}`.trim() : "";
                }}
              />
            }
          />
          <Area
            dataKey="value"
            type="monotone"
            fill="var(--color-value)"
            fillOpacity={0.16}
            stroke="var(--color-value)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--color-value)", strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ChartContainer>
      {showTrend && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-700">
          {trendingUp ? (
            <TrendingUp className="h-4 w-4 text-secondary-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger" />
          )}
          Trending {trendingUp ? "up" : "down"}
          {trendPct !== null ? ` by ${Math.abs(trendPct)}%` : ""} this month
        </p>
      )}
    </div>
  );
};

/**
 * ProfitAreaChart — net profit over the last 6 months.
 * points = [{ label, sublabel?, collection, expenses, profit }]
 *
 * Profit can be negative (a month where salaries exceeded collection), so
 * unlike CollectionAreaChart this one keeps a zero baseline visible rather
 * than letting Recharts auto-fit to positive values only.
 */
export const ProfitAreaChart = ({ points = [] }) => {
  if (points.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-primary-400">
        No data to display.
      </p>
    );
  }

  const hasNegative = points.some((p) => Number(p.profit) < 0);

  return (
    <ChartContainer config={profitChartConfig} className="aspect-auto h-48 w-full">
      <AreaChart data={points} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-primary-100)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} />
        {hasNegative && (
          <ReferenceLine y={0} stroke="var(--color-primary-300)" strokeDasharray="2 2" />
        )}
        <ChartTooltip
          cursor={{ stroke: "var(--color-primary-200)", strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_value, payload) => {
                const point = payload?.[0]?.payload;
                return point ? `${point.label} ${point.sublabel || ""}`.trim() : "";
              }}
            />
          }
        />
        <Area
          dataKey="profit"
          type="monotone"
          fill="var(--color-profit)"
          fillOpacity={0.16}
          stroke="var(--color-profit)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-profit)", strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  );
};
