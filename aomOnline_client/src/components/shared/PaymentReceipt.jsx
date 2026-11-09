"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";

// Explicit hex colors (no CSS vars / oklch) so html2canvas-pro captures the
// invoice exactly for the PDF download.
const TEAL = "#0e8c8c";
const TEAL_DEEP = "#0b4f52";
const LABEL = "#0c5b5e";
const ORANGE = "#ef7c1a";
const VALUE = "#1f2937";

const taka = (n) => Number(n || 0).toLocaleString("en-US");
const receiptNo = (id) => (id ? `RCPT-${String(id).slice(-8).toUpperCase()}` : "—");
const dateSlash = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const p = (x) => String(x).padStart(2, "0");
  return `${p(d.getDate())} / ${p(d.getMonth() + 1)} / ${d.getFullYear()}`;
};

// A label followed by a value sitting on a ruled line (invoice-style).
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
      {value || " "}
    </span>
  </div>
);

// A label followed by a bordered box (INVOICE NO. / DATE).
const Box = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
    <span style={{ fontWeight: 700, color: LABEL, fontSize: 13, whiteSpace: "nowrap" }}>{label}</span>
    <span
      style={{
        flex: 1,
        border: `1.5px solid ${TEAL}`,
        borderRadius: 4,
        padding: "5px 12px",
        fontSize: 13,
        fontWeight: 700,
        color: VALUE,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {value || " "}
    </span>
  </div>
);

// Checkbox. The tick is drawn geometrically (a rotated element with two white
// borders) rather than a "✓" text glyph — html2canvas-pro reliably captures
// borders + rotate (proven by the rotated title) but mis-positions/​distorts a
// flex-centered Unicode glyph in a tiny box, which broke the PDF download.
const Check = ({ checked, label }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    <span
      style={{
        position: "relative",
        width: 16,
        height: 16,
        boxSizing: "border-box",
        border: `1.6px solid ${checked ? TEAL : LABEL}`,
        borderRadius: 3,
        backgroundColor: checked ? TEAL : "#ffffff",
        display: "inline-block",
        flex: "0 0 auto",
      }}
    >
      {checked ? (
        <span
          style={{
            position: "absolute",
            top: 1.5,
            left: 5,
            width: 4,
            height: 8,
            borderRight: "2px solid #ffffff",
            borderBottom: "2px solid #ffffff",
            transform: "rotate(45deg)",
          }}
        />
      ) : null}
    </span>
    <span style={{ color: LABEL, fontWeight: 700, fontSize: 12.5 }}>{label}</span>
  </span>
);

/**
 * PaymentReceipt — a payment invoice matching the AOM reference: brand header
 * with WhatsApp/website, a slanted orange "PAYMENT INVOICE", a teal rule, the
 * invoice fields (filled from the payment), and a teal wave footer. Shared by
 * the Guardian receipts view and the Admin payments manager; captured for the
 * PDF download. Attach a ref to capture it.
 */
const PaymentReceipt = React.forwardRef(({ payment }, ref) => {
  const p = payment || {};
  const student = p.studentRef || {};
  const method = p.paymentMethod || "";
  const isBank = /bank/i.test(method);
  const isBkash = /bkash/i.test(method);
  const isNagad = /nagad/i.test(method);
  const isRocket = /rocket/i.test(method);
  // The certificate/receipt is authorised by the Principal.
  const receivedBy = "Principal";
  const dateSrc = p.paidAt || p.reviewedAt || p.submittedAt;

  // Fee type — ticks the matching FEE TYPE box. Older records without a stored
  // feeType fall back to "Monthly Fee" so their receipts stay unchanged.
  const feeType = p.feeType || "Monthly Fee";
  const isMonthlyFee = feeType === "Monthly Fee";
  const isAdmissionMonthly = feeType === "Admission + Monthly Fee";
  const isOtherFee = feeType === "Other";

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
              PAYMENT
              <br />
              INVOICE
            </div>
          </div>
        </div>
      </div>

      {/* Teal rule */}
      <div style={{ height: 7, backgroundColor: TEAL, marginTop: 14 }} />

      {/* Fields */}
      <div style={{ padding: "18px 30px 10px", display: "flex", flexDirection: "column", gap: 15 }}>
        <div style={{ display: "flex", gap: 26 }}>
          <Box label="INVOICE NO.:" value={receiptNo(p._id)} />
          <Box label="DATE:" value={dateSlash(dateSrc)} />
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          <Field label="STUDENT NAME:" value={student.name} />
          <Field label="PHONE:" value={student.phone} />
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          <Field label="PARENT NAME:" value={student.guardianName} />
          {/* The number the payment was actually made from (falls back to the
              registered guardian phone when no sender was captured). */}
          <Field label="PHONE:" value={p.senderInfo || student.guardianPhone} />
        </div>
        <div style={{ display: "flex", gap: 26, alignItems: "flex-end" }}>
          <span style={{ fontWeight: 700, color: LABEL, fontSize: 13, whiteSpace: "nowrap" }}>AMOUNT:</span>
          <Field label="BDT" value={taka(p.amount)} />
          <Field label="USD" value="" />
        </div>

        {/* Fee type — the box matching the guardian's chosen payment type. */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: LABEL, fontSize: 13 }}>FEE TYPE:</span>
          <Check checked={isMonthlyFee} label="MONTHLY FEE" />
          <Check checked={isAdmissionMonthly} label="ADMISSION + MONTHLY FEE" />
          <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 6 }}>
            <Check checked={isOtherFee} label="OTHER:" />
            <span
              style={{
                display: "inline-block",
                minWidth: 90,
                borderBottom: `1.5px solid ${TEAL}`,
                fontSize: 12.5,
                fontWeight: 700,
                color: VALUE,
                textAlign: "center",
              }}
            >
              {isOtherFee && p.feeNote ? p.feeNote : " "}
            </span>
          </span>
        </div>

        {/* Payment method — ticks whichever method the guardian actually used. */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: LABEL, fontSize: 13 }}>PAYMENT METHOD:</span>
          <Check checked={isBkash} label="bKash" />
          <Check checked={isNagad} label="Nagad" />
          <Check checked={isRocket} label="Rocket" />
          <Check checked={isBank} label="BANK TRANSFER" />
        </div>

        {/* Payment details — the number/account the payment was made from, and
            the transaction id — as proper labelled fields (not a footnote), so
            what the guardian entered at pay time shows clearly on the receipt. */}
        {isBank ? (
          <div style={{ display: "flex", gap: 26 }}>
            <Field label="A/C NO.:" value={p.bankAccountNumber} />
            <Field label="HOLDER:" value={p.bankAccountHolder} />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 26 }}>
            <Field label="SENDER NO.:" value={p.senderInfo} />
            <Field label="TRANSACTION ID:" value={p.transactionId} />
          </div>
        )}
        {isBank && p.transactionId ? (
          <div style={{ display: "flex", gap: 26 }}>
            <Field label="TRANSACTION ID:" value={p.transactionId} />
          </div>
        ) : null}

        {/* Received by + thank you */}
        <div style={{ textAlign: "center", marginTop: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 8, justifyContent: "center" }}>
            <span style={{ fontWeight: 700, color: LABEL, fontSize: 13 }}>RECEIVED BY:</span>
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
              {receivedBy}
            </span>
          </div>
          <div style={{ marginTop: 10, fontWeight: 800, color: TEAL_DEEP, fontSize: 14, letterSpacing: "0.02em" }}>
            THANK YOU FOR CHOOSING AOM ONLINE MADRASA
          </div>
        </div>
      </div>

      {/* Bottom teal wave — solid-color CSS shapes only (reliable under
          html2canvas-pro); a symmetric two-tone wave footer. */}
      <div style={{ overflow: "hidden", marginTop: 6 }}>
        <div style={{ height: 30, marginLeft: "-10%", marginRight: "-10%", borderRadius: "50%", backgroundColor: TEAL, opacity: 0.5 }} />
        <div style={{ height: 40, marginTop: -16, backgroundColor: TEAL_DEEP }} />
      </div>
    </div>
  );
});

PaymentReceipt.displayName = "PaymentReceipt";

export default PaymentReceipt;
