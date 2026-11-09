"use client";

import React from "react";

import { gradeForIndex, rowTotal } from "@/components/Admin/resultConstants";

// Brand palette (inline hex, not Tailwind/CSS-vars, so html2canvas-pro captures
// the exact colours into the PNG/PDF — the same approach CertificateCard uses).
const CARD_BG = "#0b5f66"; // deep teal background
const GOLD = "#f4c518"; // title + legend underline
const RED = "#e23530"; // 1st / 2nd / 3rd
const INK = "#111827"; // grid lines + row text
const ROW_BG = "#ffffff";
const ROW_ALT = "#ffffff"; // keep all rows white like the printed design

// Header cell colours per theme.
const HEADER = {
  teal: { bg: "#0e8a92", fg: "#ffffff" },
  cyan: { bg: "#36c4e3", fg: "#083b44" },
};

const GRADE_FONT =
  "Arial, 'Segoe UI', 'Hind Siliguri', system-ui, sans-serif";

/**
 * ResultSheet — the printable "Result Of Final Exam" marksheet, matching the
 * madrasa's design. Rendered on screen for preview AND captured (via a ref) into
 * the downloaded PNG/PDF, so what you see is exactly what downloads.
 */
const ResultSheet = React.forwardRef(({ result }, ref) => {
  const r = result || {};
  const theme = HEADER[r.theme] || HEADER.cyan;
  const rows = Array.isArray(r.rows) ? r.rows : [];

  const sub1Max = Number(r.subject1Max) || 0;
  const sub2Max = Number(r.subject2Max) || 0;
  const totalMax = Number(r.totalMax) || sub1Max + sub2Max;

  const th = {
    border: `1.5px solid ${INK}`,
    background: theme.bg,
    color: theme.fg,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    padding: "12px 8px",
    fontSize: 17,
    textAlign: "center",
    whiteSpace: "nowrap",
  };
  const td = {
    border: `1.5px solid ${INK}`,
    color: INK,
    fontWeight: 700,
    padding: "11px 8px",
    fontSize: 17,
    textAlign: "center",
    background: ROW_BG,
  };

  const legendLine = (label, value) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        color: "#ffffff",
        fontWeight: 700,
        fontSize: 15,
        lineHeight: 1.5,
      }}
    >
      <span>{label}</span>
      <span>= {value}</span>
    </div>
  );

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 1040,
        margin: "0 auto",
        background: CARD_BG,
        borderRadius: 14,
        padding: "26px 30px 32px",
        boxSizing: "border-box",
        fontFamily: "'Hind Siliguri', Arial, system-ui, sans-serif",
      }}
    >
      {/* Header: brand · title · legend */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 22,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
          <span
            style={{
              display: "flex",
              height: 52,
              width: 52,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: 12,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="AOM Online Madrasa"
              crossOrigin="anonymous"
              style={{ height: "100%", width: "100%", objectFit: "cover" }}
            />
          </span>
          <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>
            AOM
            <br />
            Online Madrasa
          </span>
        </div>

        {/* Title + level */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              color: GOLD,
              fontWeight: 800,
              fontSize: 40,
              lineHeight: 1.05,
              letterSpacing: "0.01em",
            }}
          >
            {r.title || "Result Of Final Exam"}
          </div>
          <div
            style={{
              marginTop: 6,
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 26,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {r.level || ""}
          </div>
        </div>

        {/* Legend */}
        <div style={{ minWidth: 180 }}>
          {legendLine(r.subject1Label || "Subject 1", sub1Max)}
          {legendLine(r.subject2Label || "Subject 2", sub2Max)}
          <div style={{ height: 3, background: GOLD, borderRadius: 2, margin: "6px 0" }} />
          {legendLine("Total", totalMax)}
        </div>
      </div>

      {/* Marksheet */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          background: ROW_BG,
        }}
      >
        <colgroup>
          <col style={{ width: "7%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "11%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={th}>SL</th>
            <th style={th}>Name</th>
            <th style={th}>Country</th>
            <th style={th}>{r.subject1Label || "Subject 1"}</th>
            <th style={th}>{r.subject2Label || "Subject 2"}</th>
            <th style={th}>Total</th>
            <th style={th}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td style={{ ...td, padding: "22px 8px", color: "#64748b" }} colSpan={7}>
                No students added yet.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const grade = gradeForIndex(i);
              return (
                <tr key={i}>
                  <td style={td}>{i + 1}</td>
                  <td style={{ ...td, fontWeight: 800 }}>{row.name || ""}</td>
                  <td style={td}>{row.country || ""}</td>
                  <td style={td}>{row.mark1 ?? ""}</td>
                  <td style={td}>{row.mark2 ?? ""}</td>
                  <td style={{ ...td, fontWeight: 800 }}>{rowTotal(row)}</td>
                  <td style={{ ...td, padding: "6px 8px" }}>
                    {grade ? (
                      <span
                        style={{
                          color: RED,
                          fontWeight: 800,
                          fontSize: 24,
                          fontFamily: GRADE_FONT,
                        }}
                      >
                        {grade}
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});

ResultSheet.displayName = "ResultSheet";

export default ResultSheet;
