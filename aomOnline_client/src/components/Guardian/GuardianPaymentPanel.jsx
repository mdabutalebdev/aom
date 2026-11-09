"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FiXCircle, FiUploadCloud, FiImage, FiPlus, FiCheckCircle, FiCopy, FiCheck, FiCreditCard } from "react-icons/fi";
import { FaUniversity } from "react-icons/fa";

import apiClient from "@/lib/apiClient";
import { useSettings } from "@/context/SettingsContext";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { formatTaka } from "@/components/Admin/managementConstants";
import { banglaMonthName } from "@/components/Admin/paymentConstants";

const PAYMENT_METHODS = [
  { value: "bKash", label: "bKash" },
  { value: "Nagad", label: "Nagad" },
  { value: "Rocket", label: "Rocket" },
  { value: "Bank", label: "Bank Transfer" },
];

const PAYMENT_TYPES = [
  { value: "Monthly Fee", label: "Monthly Fee" },
  { value: "Admission + Monthly Fee", label: "Admission + Monthly Fee" },
  { value: "Other", label: "Other" },
];

const MAX_SCREENSHOT_MB = 5;

// A read-only "system-filled" field — shown to the guardian, not editable.
const AutoField = ({ label, value }) => (
  <div>
    <p className="mb-1.5 text-sm font-medium text-primary-800">{label}</p>
    <div className="rounded-[var(--radius-md)] border border-primary-100 bg-primary-50/50 px-4 py-2.5 text-base font-medium text-primary-900">
      {value || "—"}
    </div>
  </div>
);

// One copyable detail row — "Label : value" plus an individual copy button that
// shows a brief "copied" tick. Used inside the payment-account cards.
const CopyRow = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = async () => {
    const text = String(value);
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    // Fallback for contexts where the async Clipboard API is blocked.
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <p className="min-w-0 text-sm">
        <span className="text-primary-400">{label}: </span>
        <span className="font-semibold text-primary-900">{value}</span>
      </p>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        title="Copy"
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors ${
          copied ? "text-secondary-600" : "text-primary-500 hover:bg-primary-100"
        }`}
      >
        {copied ? <FiCheck className="text-sm" /> : <FiCopy className="text-sm" />}
      </button>
    </div>
  );
};

// The mobile-wallet accounts the madrasa can receive on. Each is optional —
// only the ones the super admin has filled in appear to the guardian.
const MOBILE_WALLETS = [
  {
    key: "bKash",
    label: "bKash",
    numberSetting: "paymentBkashNumber",
    typeSetting: "paymentBkashType",
    wrapper: "border-pink-200 bg-pink-50/50",
    badge: "bg-pink-100 text-pink-600",
    title: "text-pink-600",
  },
  {
    key: "Nagad",
    label: "Nagad",
    numberSetting: "paymentNagadNumber",
    typeSetting: "paymentNagadType",
    wrapper: "border-orange-200 bg-orange-50/50",
    badge: "bg-orange-100 text-orange-600",
    title: "text-orange-600",
  },
  {
    key: "Rocket",
    label: "Rocket",
    numberSetting: "paymentRocketNumber",
    typeSetting: "paymentRocketType",
    wrapper: "border-purple-200 bg-purple-50/50",
    badge: "bg-purple-100 text-purple-600",
    title: "text-purple-600",
  },
];

// "Payment Details" — the madrasa's receiving accounts (bank + mobile wallets)
// shown so the guardian can pay manually outside the site, copying each field
// as needed.
const PaymentDetails = ({ bank, wallets, instructions }) => {
  const hasBank =
    bank.title || bank.accountNo || bank.name || bank.branch || bank.routing;
  const activeWallets = wallets.filter((wallet) => wallet.number);

  if (!hasBank && !activeWallets.length) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50/60 px-3 py-2.5">
        <p className="text-sm text-amber-800">
          Payment account details haven&apos;t been published yet. Please contact the
          madrasa for the bKash, Nagad, Rocket or bank number before paying.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-lg)] bg-primary-50/60 px-3 py-2">
        <FiCreditCard className="text-primary-600" />
        <p className="text-sm font-semibold text-primary-800">Payment Details</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {hasBank && (
          <div className="rounded-[var(--radius-lg)] border border-secondary-200 bg-secondary-50/40 p-4">
            <div className="mb-2 flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                <FaUniversity />
              </span>
              <p className="font-bold text-secondary-700">Via Bank Transfer</p>
            </div>
            <CopyRow label="A/C Title" value={bank.title} />
            <CopyRow label="Account No" value={bank.accountNo} />
            <CopyRow label="Bank" value={bank.name} />
            <CopyRow label="Branch" value={bank.branch} />
            <CopyRow label="Routing No" value={bank.routing} />
          </div>
        )}

        {activeWallets.map((wallet) => (
          <div
            key={wallet.key}
            className={`rounded-[var(--radius-lg)] border p-4 ${wallet.wrapper}`}
          >
            <div className="mb-2 flex items-center gap-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${wallet.badge}`}
              >
                {wallet.label}
              </span>
              <p className={`font-bold ${wallet.title}`}>
                {wallet.label}
                {wallet.type ? ` (${wallet.type})` : ""}
              </p>
            </div>
            <CopyRow label={`${wallet.label} Number`} value={wallet.number} />
          </div>
        ))}
      </div>

      {instructions && (
        <p className="mt-3 whitespace-pre-line rounded-[var(--radius-lg)] bg-primary-50/60 px-3 py-2 text-xs text-primary-600">
          {instructions}
        </p>
      )}
    </div>
  );
};

/**
 * GuardianPaymentPanel — a summary card ("Amount Due" + a New Payment button)
 * whose button opens the payment form in a modal. Student/class/teacher/amount
 * are auto-filled by the system; the guardian picks a month (already-paid or
 * in-review months appear but are disabled), a payment method (which decides
 * whether mobile-banking or bank fields show), and provides a transaction ID
 * and/or a payment screenshot. Manual review — Super Admin approves/rejects.
 */
const GuardianPaymentPanel = () => {
  const { getSetting } = useSettings();
  const [info, setInfo] = useState(null); // { student, months }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false); // payment modal

  // Form state
  const [period, setPeriod] = useState(""); // "year-month"
  const [paymentMethod, setPaymentMethod] = useState("");
  const [feeType, setFeeType] = useState("Monthly Fee");
  const [feeNote, setFeeNote] = useState("");
  const [amount, setAmount] = useState("");
  const [senderInfo, setSenderInfo] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");

  const firstPayableKey = (months = []) => {
    const p = months.find((m) => m.payable);
    return p ? `${p.year}-${p.month}` : "";
  };

  const fetchPayable = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/payments/my-payable");
      setInfo(res.data || null);
      setPeriod(firstPayableKey(res.data?.months));
    } catch (err) {
      toast.error(err.message || "Failed to load payment info.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayable();
  }, [fetchPayable]);

  const isBank = paymentMethod === "Bank";

  const monthOptions = useMemo(
    () =>
      (info?.months || []).map((m) => {
        const base = `${banglaMonthName(m.month)} ${m.year}`;
        const suffix =
          m.status === "paid" ? " · Paid" : m.status === "pending" ? " · Pending" : "";
        return {
          value: `${m.year}-${m.month}`,
          label: base + suffix,
          disabled: !m.payable,
        };
      }),
    [info],
  );

  const selectedMonth = useMemo(
    () =>
      (info?.months || []).find((m) => `${m.year}-${m.month}` === period) || null,
    [info, period],
  );

  const resetForm = (months) => {
    setPaymentMethod("");
    setFeeType("Monthly Fee");
    setFeeNote("");
    setAmount(info?.student?.amount != null ? String(info.student.amount) : "");
    setSenderInfo("");
    setTransactionId("");
    setBankAccountNumber("");
    setBankAccountHolder("");
    setScreenshot(null);
    setScreenshotPreview("");
    setPeriod(firstPayableKey(months ?? info?.months));
  };

  const openModal = () => {
    resetForm();
    setOpen(true);
  };

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG / PNG / WEBP).");
      return;
    }
    if (file.size > MAX_SCREENSHOT_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SCREENSHOT_MB}MB.`);
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview("");
  };

  const handleSubmit = async () => {
    if (!period) {
      toast.error("Select which month you're paying for.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Select a payment method.");
      return;
    }
    if (!transactionId.trim() && !screenshot) {
      toast.error("Provide a transaction ID or a payment screenshot.");
      return;
    }
    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    const [year, month] = period.split("-");
    const form = new FormData();
    form.append("month", month);
    form.append("year", year);
    form.append("amount", String(amountNum));
    form.append("paymentMethod", paymentMethod);
    form.append("feeType", feeType);
    if (feeType === "Other" && feeNote.trim()) form.append("feeNote", feeNote.trim());
    if (transactionId.trim()) form.append("transactionId", transactionId.trim());

    if (isBank) {
      if (bankAccountNumber.trim())
        form.append("bankAccountNumber", bankAccountNumber.trim());
      if (bankAccountHolder.trim())
        form.append("bankAccountHolder", bankAccountHolder.trim());
    } else if (senderInfo.trim()) {
      form.append("senderInfo", senderInfo.trim());
    }
    if (screenshot) form.append("screenshot", screenshot);

    setSubmitting(true);
    try {
      await apiClient.post("/payments/submit", form);
      toast.success("Payment submitted — awaiting review.");
      setOpen(false);
      // Refetch so the just-submitted month flips to "pending" (disabled).
      const res = await apiClient.get("/payments/my-payable");
      setInfo(res.data || null);
      resetForm(res.data?.months);
    } catch (err) {
      toast.error(err.message || "Could not submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
        No student profile is linked to your account.
      </div>
    );
  }

  const { student } = info;
  const hasPayable = (info.months || []).some((m) => m.payable);

  return (
    <div className="w-full">
      <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft sm:p-6">
        {/* Header row: amount + New Payment button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-50 pb-4">
          <div>
            <p className="text-sm font-medium text-primary-500">Amount Due</p>
            <p className="text-2xl font-bold text-primary-900">{formatTaka(student.amount)}</p>
          </div>
          <Button variant="primary" className="gap-2" onClick={openModal}>
            <FiPlus /> New Payment
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-lg)] border border-secondary-200 bg-secondary-50 px-4 py-3 text-secondary-700">
          <FiCheckCircle className="text-xl shrink-0" />
          <p className="text-sm font-medium">
            Tap <span className="font-bold">New Payment</span> to submit for any month —
            paid and in-review months are shown but locked.
          </p>
        </div>
      </div>

      {/* Payment form modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Payment</DialogTitle>
          </DialogHeader>

          <div className="max-h-[75vh] space-y-4 overflow-y-auto px-0.5">
            {/* 1) Payment method — the switch that decides the fields below */}
            <Select
              id="pay-method"
              label="Payment Method"
              placeholder="Select method"
              options={PAYMENT_METHODS}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />

            {/* Payment type — reflected as the ticked FEE TYPE on the receipt */}
            <Select
              id="pay-type"
              label="Payment Type"
              options={PAYMENT_TYPES}
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
            />
            {feeType === "Other" && (
              <Input
                id="fee-note"
                label="Specify Payment Type"
                placeholder="e.g. Exam fee, Book fee"
                value={feeNote}
                onChange={(e) => setFeeNote(e.target.value)}
              />
            )}

            {/* 2) Which month — paid/pending shown but disabled */}
            <Select
              id="pay-month"
              label="Which month are you paying for?"
              placeholder="Select month"
              options={monthOptions}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              hint={!hasPayable ? "No months are currently open for payment." : undefined}
            />

            {selectedMonth?.rejectionReason && (
              <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-3 text-danger">
                <FiXCircle className="mt-0.5 shrink-0 text-xl" />
                <p className="text-sm">
                  This month was rejected earlier: {selectedMonth.rejectionReason}
                </p>
              </div>
            )}

            {/* 3) Auto-filled — Student/Class/Teacher read-only; Amount is
                pre-filled with the monthly fee but the guardian may edit it. */}
            <div className="grid gap-4 sm:grid-cols-2">
              <AutoField label="Student" value={student.name} />
              <AutoField label="Class" value={student.className} />
              <AutoField label="Teacher" value={student.teacherName} />
              <Input
                id="pay-amount"
                type="number"
                min="1"
                label="Amount (৳)"
                placeholder={String(student.amount ?? "")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                hint="Pre-filled with the monthly fee — change it if needed."
              />
            </div>

            {/* Payment Details — where to send the manual payment (copyable) */}
            <PaymentDetails
              bank={{
                title: getSetting("paymentBankAccountTitle"),
                accountNo: getSetting("paymentBankAccountNo"),
                name: getSetting("paymentBankName"),
                branch: getSetting("paymentBankBranch"),
                routing: getSetting("paymentBankRouting"),
              }}
              wallets={MOBILE_WALLETS.map((wallet) => ({
                ...wallet,
                number: getSetting(wallet.numberSetting),
                type: getSetting(wallet.typeSetting),
              }))}
              instructions={getSetting("paymentInstructions")}
            />

            {/* 4) Method-specific fields */}
            {paymentMethod && (
              <div className="grid gap-4 sm:grid-cols-2">
                {isBank ? (
                  <>
                    <Input
                      id="bank-acc-number"
                      label="Account Number"
                      placeholder="e.g. 1234567890"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                    />
                    <Input
                      id="bank-acc-holder"
                      label="Account Holder Name"
                      placeholder="e.g. Abdul Karim"
                      value={bankAccountHolder}
                      onChange={(e) => setBankAccountHolder(e.target.value)}
                    />
                    <Input
                      id="txn-id"
                      label="Transaction / Reference ID"
                      placeholder="e.g. TXN123456"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      containerClassName="sm:col-span-2"
                    />
                  </>
                ) : (
                  <>
                    <Input
                      id="sender-info"
                      label="Sender Number (that you paid from)"
                      placeholder="e.g. 017XXXXXXXX"
                      value={senderInfo}
                      onChange={(e) => setSenderInfo(e.target.value)}
                    />
                    <Input
                      id="txn-id"
                      label="Transaction ID"
                      placeholder="e.g. TXN123456"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </>
                )}
              </div>
            )}

            {/* 5) Screenshot upload + preview */}
            {paymentMethod && (
              <div>
                <p className="mb-1.5 text-sm font-medium text-primary-800">
                  Payment Screenshot{" "}
                  <span className="font-normal text-primary-400">
                    (JPG / PNG / WEBP, up to {MAX_SCREENSHOT_MB}MB)
                  </span>
                </p>
                {screenshotPreview ? (
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot preview"
                      className="h-32 w-32 rounded-[var(--radius-lg)] border border-primary-100 object-cover"
                    />
                    <Button variant="outline" size="sm" onClick={clearScreenshot}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="screenshot"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-primary-200 bg-primary-50/40 px-4 py-8 text-center text-primary-500 transition-colors hover:border-primary-400 hover:bg-primary-50"
                  >
                    <FiUploadCloud className="text-2xl" />
                    <span className="text-sm font-medium">Tap to upload a screenshot</span>
                    <span className="flex items-center gap-1 text-xs text-primary-400">
                      <FiImage /> Proof of your payment
                    </span>
                  </label>
                )}
                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshot}
                />
              </div>
            )}

            <p className="text-xs text-primary-500">
              Provide at least a transaction ID or a payment screenshot — the Super
              Admin will verify and confirm.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={submitting || !hasPayable}
            >
              Submit Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuardianPaymentPanel;
