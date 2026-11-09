"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";

// Explicit hex colors (no CSS vars / oklch) so html2canvas-pro captures the
// slip exactly for the PDF/image download — same approach as PaymentReceipt.
const TEAL = "#0e8c8c";
const TEAL_DEEP = "#0b4f52";
const LABEL = "#0c5b5e";
const ORANGE = "#ef7c1a";
const VALUE = "#1f2937";
const MUTED = "#5b6b6b";

const taka = (n) => `৳${Number(n || 0).toLocaleString("en-US")}`;

// A label followed by a value on a ruled line (invoice-style).
const Field = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flex: 1, minWidth: 0 }}>
    <span style={{ fontWeight: 700, color: LABEL, fontSize: 13, whiteSpace: "nowrap" }}>{label}</span>
    <span
      style={{
        flex: 1,
        minWidth: 0,
        borderBottom: `1.5px solid ${TEAL}`,
        paddingBottom: 2,
        color: VALUE,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {value || " "}
    </span>
  </div>
);

// A small stat tile (Salary / Paid / Due context).
const Tile = ({ label, value, color }) => (
  <div
    style={{
      flex: 1,
      border: `1.5px solid #d7dde3`,
      borderRadius: 8,
      padding: "8px 10px",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 15, color: color || VALUE, fontWeight: 800, marginTop: 2 }}>{value}</div>
  </div>
);

/**
 * SalarySlip — a printable slip for ONE salary disbursement, matching the AOM
 * brand (same visual language as the payment receipt). Rendered per payment
 * entry and captured for the PDF/image download. Attach a ref to capture it.
 *
 * `slip` carries already-labelled strings (period/method/date) plus raw numbers
 * the component formats itself.
 */
const SalarySlip = React.forwardRef(({ slip }, ref) => {
  const s = slip || {};

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 820,
        margin: "0 auto",
        backgroundColor: "#ffffff",
        border: "1px solid #d7dde3",
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ padding: "22px 30px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src="/logo.jpg"
                alt=""
                width={52}
                height={52}
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }}
              />
              <div style={{ color: TEAL, fontWeight: 800, fontSize: 19, lineHeight: 1.12 }}>
                Annuqtah Online
                <br />
                Madrasa-AOM
              </div>
            </div>
            <div style={{ marginTop: 10, color: TEAL, fontSize: 12.5, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <FaWhatsapp size={14} /> WhatsApp +8801628360133
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <FiGlobe size={14} /> www.aomedu.com
              </span>
            </div>
          </div>

          <div style={{ transform: "rotate(-5deg)", transformOrigin: "right top" }}>
            <div style={{ color: ORANGE, fontWeight: 900, fontSize: 40, lineHeight: 0.95, fontStyle: "italic", textAlign: "right" }}>
              SALARY
              <br />
              SLIP
            </div>
          </div>
        </div>
      </div>

      {/* Teal rule */}
      <div style={{ height: 7, backgroundColor: TEAL, marginTop: 14 }} />

      {/* Fields */}
      <div style={{ padding: "18px 30px 10px", display: "flex", flexDirection: "column", gap: 15 }}>
        <div style={{ display: "flex", gap: 26 }}>
          <Field label="SLIP NO.:" value={s.slipNo} />
          <Field label="DATE:" value={s.paidAtLabel} />
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          <Field label="TEACHER NAME:" value={s.teacherName} />
          <Field label="TEACHER ID:" value={s.teacherId} />
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          <Field label="DESIGNATION:" value={s.designation} />
          <Field label="PERIOD:" value={s.periodLabel} />
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          <Field label="PURPOSE:" value={s.purpose || "Monthly Salary"} />
          <Field label="METHOD:" value={s.methodLabel} />
        </div>
        {s.accountNumber || s.transactionId ? (
          <div style={{ display: "flex", gap: 26 }}>
            <Field label="ACCOUNT / NO.:" value={s.accountNumber} />
            <Field label="TRANSACTION ID:" value={s.transactionId} />
          </div>
        ) : null}

        {/* Amount paid — the headline figure. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `2px solid ${TEAL}`,
            borderRadius: 8,
            padding: "10px 16px",
            backgroundColor: "#f0fafa",
          }}
        >
          <span style={{ fontWeight: 800, color: LABEL, fontSize: 14 }}>AMOUNT PAID</span>
          <span style={{ fontWeight: 900, color: TEAL_DEEP, fontSize: 22 }}>{taka(s.amount)}</span>
        </div>

        {/* Context tiles */}
        <div style={{ display: "flex", gap: 12 }}>
          <Tile label="Monthly Salary" value={taka(s.salaryAmount)} />
          <Tile label="Total Paid" value={taka(s.paidAmount)} color={TEAL} />
          <Tile label="Due" value={taka(s.dueAmount)} color={s.dueAmount > 0 ? "#c0392b" : VALUE} />
        </div>

        {s.note ? (
          <div style={{ fontSize: 12, color: MUTED }}>
            <span style={{ fontWeight: 700, color: LABEL }}>Note: </span>
            {s.note}
          </div>
        ) : null}

        {/* Authorised by + thank you */}
        <div style={{ textAlign: "center", marginTop: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 8, justifyContent: "center" }}>
            <span style={{ fontWeight: 700, color: LABEL, fontSize: 13 }}>AUTHORISED BY:</span>
            <span
              style={{
                minWidth: 220,
                borderBottom: `1.5px solid ${TEAL}`,
                paddingBottom: 2,
                color: VALUE,
                fontWeight: 600,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Principal
            </span>
          </div>
          <div style={{ marginTop: 10, fontWeight: 800, color: TEAL_DEEP, fontSize: 13.5, letterSpacing: "0.02em" }}>
            AOM ONLINE MADRASA — SALARY DISBURSEMENT RECORD
          </div>
        </div>
      </div>

      {/* Bottom teal wave */}
      <div style={{ overflow: "hidden", marginTop: 6 }}>
        <div style={{ height: 30, marginLeft: "-10%", marginRight: "-10%", borderRadius: "50%", backgroundColor: TEAL, opacity: 0.5 }} />
        <div style={{ height: 40, marginTop: -16, backgroundColor: TEAL_DEEP }} />
      </div>
    </div>
  );
});

SalarySlip.displayName = "SalarySlip";

export default SalarySlip;
