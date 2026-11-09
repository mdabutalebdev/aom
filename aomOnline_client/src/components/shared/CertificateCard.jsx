"use client";

import React from "react";

// Brand palette (from globals.css)
const TEAL = "#029199";
const TEAL_DARK = "#036168";
const TEAL_DEEP = "#084b51";
const GOLD = "#c9a227";
const GOLD_DARK = "#a9851d";
const GOLD_LIGHT = "#d4af37";

// Fixed pixel radius (not a Tailwind rounded-* class / CSS var) so the value
// is identical for the outer card and the wave footer's bottom corners no
// matter how html2canvas-pro resolves custom properties during capture.
const RADIUS = 20;

// Elegant script for the student name + principal signature. Great Vibes is
// self-hosted via next/font (--font-script in the root layout) so it renders
// identically on screen AND in the html2canvas-pro PDF capture, with system
// handwriting faces as the fallback.
const SCRIPT_FONT =
  "var(--font-script), 'Segoe Script', 'Brush Script MT', 'Snell Roundhand', cursive";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "★";

// Gold rosette / medal seal
const Rosette = () => (
  <svg viewBox="0 0 72 92" className="h-14 w-14" aria-hidden="true">
    <path d="M26 52 L20 86 L30 76 L36 90 L42 76 L52 86 L46 52 Z" fill={GOLD_DARK} />
    <path d="M30 54 L27 80 L36 72 L45 80 L42 54 Z" fill={GOLD} />
    {Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return (
        <circle key={i} cx={36 + Math.cos(a) * 26} cy={32 + Math.sin(a) * 26} r="5" fill={GOLD_LIGHT} />
      );
    })}
    <circle cx="36" cy="32" r="25" fill={GOLD} />
    <circle cx="36" cy="32" r="18" fill={GOLD_DARK} />
    <circle cx="36" cy="32" r="18" fill="none" stroke={GOLD_LIGHT} strokeWidth="1.5" />
    <path
      d="M36 20 l4.2 8.6 9.5 1.3 -6.9 6.6 1.7 9.4 -8.5 -4.5 -8.5 4.5 1.7 -9.4 -6.9 -6.6 9.5 -1.3 Z"
      fill="#fff"
    />
  </svg>
);

/**
 * CertificateCard — printable certificate of achievement, landscape.
 * Shared by the Guardian view and the Admin modal so both render (and export
 * to PDF) an identical design. Display text prefers the manual overrides
 * (studentName / courseName) and falls back to the linked records.
 * Attach a ref/id to capture it for PDF.
 */
const CertificateCard = React.forwardRef(({ cert }, ref) => {
  const studentName =
    cert?.studentName || cert?.studentRef?.name || cert?.studentRef?.userRef?.name || "The Student";
  const photo = cert?.studentRef?.photo || "";
  const courseName =
    cert?.courseName || cert?.classRef?.nameEn || cert?.classRef?.name || "the course";
  const issued = cert?.issuedAt ? new Date(cert.issuedAt) : null;
  const dateStr = issued
    ? `${issued.getDate()}-${issued.getMonth() + 1}-${String(issued.getFullYear()).slice(2)}`
    : "";
  // Principal signature — an uploaded image if configured, else the name
  // rendered in the script font as a placeholder (swap in the real PNG later).
  const signatureUrl = cert?.principalSignatureUrl || "";
  const signatureName = cert?.principalName || "Principal";
  const imageUrl = cert?.imageUrl || "";

  // An uploaded certificate image IS the certificate — render it as-is and
  // skip the built-in template entirely. (crossOrigin so html2canvas-pro can
  // capture it into the PDF.)
  if (imageUrl) {
    return (
      <div ref={ref} className="mx-auto w-full max-w-[788px] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={studentName}
          crossOrigin="anonymous"
          className="block h-auto w-full"
        />
      </div>
    );
  }

  return (
    // Outer "paper" — a plain WHITE rectangle with SQUARE corners, captured for
    // the PDF. The rounded teal frame lives one level in, matting-style (a small
    // white margin all around, then the rounded border), so the PDF page is a
    // clean white rectangle with no rounded-corner cut-outs and the wave sits
    // inside the rounded frame.
    <div ref={ref} className="relative mx-auto w-full max-w-[788px] bg-white" style={{ padding: 14 }}>
      <div
        className="relative overflow-hidden bg-white"
        style={{ border: `3px solid ${TEAL}`, borderRadius: RADIUS }}
      >
      {/* Subtle islamic-pattern background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/islamic-pattern.svg')",
          backgroundRepeat: "repeat",
          opacity: 0.5,
          borderRadius: RADIUS,
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center px-14 pb-6 pt-9 text-center">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2">
          <img
            src="/logo.jpg"
            alt="Annuqtah Online Madrasa"
            width={40}
            height={40}
            className="h-10 w-10 rounded-[var(--radius-md)] object-cover ring-1 ring-black/5"
          />
          <div className="text-left leading-none">
            <p className="text-base font-extrabold tracking-tight" style={{ color: TEAL_DARK }}>
              Annuqtah
            </p>
            <p className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
              Online Madrasa
            </p>
          </div>
        </div>

        {/* Title */}
        <h1
          className="mt-3 font-serif text-[3.25rem] font-bold leading-none tracking-[0.05em]"
          style={{ color: GOLD_DARK, textShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
        >
          CERTIFICATE
        </h1>
        <p
          className="mt-1.5 text-sm font-bold uppercase tracking-[0.24em]"
          style={{ color: TEAL_DARK }}
        >
          Of Achievement Presented To
        </p>

        {/* Photo */}
        <div className="mt-3 flex justify-center">
          <div
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-50"
            style={{ border: `4px solid ${TEAL}`, boxShadow: `0 0 0 5px ${TEAL}22` }}
          >
            {photo ? (
              <img src={photo} alt={studentName} crossOrigin="anonymous" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold" style={{ color: TEAL_DARK }}>
                {initials(studentName)}
              </span>
            )}
          </div>
        </div>

        {/* Name + underline — generous top margin and a light-gray line (not
            near-black) so the underline clears Bangla glyphs' descenders
            (matras/conjuncts) instead of touching or cutting through them. */}
        <p className="mt-3 pb-1 text-4xl font-bold leading-normal" style={{ color: GOLD_DARK, fontFamily: SCRIPT_FONT }}>
          {studentName}
        </p>
        <div className="mx-auto mt-4 h-px w-72 max-w-[80%]" style={{ backgroundColor: "#9ca3af" }} />

        {/* Body */}
        <p className="mx-auto mt-3 max-w-lg text-sm font-semibold" style={{ color: TEAL_DEEP }}>
          This certifies that the student has successfully completed{" "}
          <span className="font-bold" style={{ color: TEAL_DARK }}>
            {courseName}
          </span>
        </p>

        {/* Footer: principal · rosette · seal */}
        <div className="mt-5 flex w-full max-w-md items-end justify-between">
          <div className="w-32 text-center">
            {signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signatureUrl}
                alt="Principal signature"
                crossOrigin="anonymous"
                className="mx-auto mb-0.5 h-9 w-auto object-contain"
              />
            ) : (
              <p
                className="mb-0.5 text-3xl leading-none"
                style={{ color: TEAL_DARK, fontFamily: SCRIPT_FONT }}
              >
                {signatureName}
              </p>
            )}
            <div className="mx-auto w-28 border-t border-gray-500" />
            <p className="mt-1 text-xs font-bold" style={{ color: TEAL_DEEP }}>
              Principal
            </p>
            {dateStr && <p className="text-[0.65rem] text-gray-500">{dateStr}</p>}
          </div>

          <Rosette />

          <div className="flex w-28 justify-center">
            <img
              src="/logo.jpg"
              alt="Seal"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
              style={{ boxShadow: `0 0 0 2px ${TEAL}` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom teal wave footer — inside the rounded frame at its bottom,
          clipped to the frame's rounded corners by its overflow-hidden. Plain
          block divs only (no SVG / absolute / grid — unreliable under
          html2canvas-pro); the second, un-rounded, full-width rectangle keeps
          solid teal reaching the frame's bottom edge and both bottom corners. */}
      <div className="w-full overflow-hidden" aria-hidden="true">
        <div
          style={{
            height: 40,
            marginLeft: "-15%",
            marginRight: "-15%",
            borderRadius: "50%",
            backgroundColor: TEAL_DARK,
            opacity: 0.6,
          }}
        />
        <div style={{ height: 50, marginTop: -20, backgroundColor: TEAL }} />
      </div>
      </div>
    </div>
  );
});

CertificateCard.displayName = "CertificateCard";

export default CertificateCard;
