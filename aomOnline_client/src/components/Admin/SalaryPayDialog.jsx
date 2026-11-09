"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FiDollarSign, FiDownload, FiUploadCloud, FiImage } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import { downloadNodeAsPdf } from "@/lib/certificatePdf";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/shadcn/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import AdminAvatar from "@/components/Admin/AdminAvatar";
import SalarySlip from "@/components/shared/SalarySlip";
import { formatTaka } from "./managementConstants";
import { banglaMonthName } from "./paymentConstants";
import {
  SALARY_METHODS,
  PAYMENT_PURPOSES,
  methodLabel,
  methodNeedsTxn,
  formatDate,
  todayInputValue,
} from "./salaryConstants";

/**
 * SalaryPayDialog — record one salary disbursement against a teacher/month.
 *
 * The money itself moves outside this system; this writes the ledger entry.
 * The admin sets any amount (pre-filled to the outstanding due), a purpose,
 * a method (+ transaction id for non-cash), and can download a payslip for
 * this exact payment on save.
 */
const SalaryPayDialog = ({ row, month, year, onClose, onSaved }) => {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Monthly Salary");
  const [method, setMethod] = useState("bank");
  const [transactionId, setTransactionId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [paidAt, setPaidAt] = useState(todayInputValue());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [slipData, setSlipData] = useState(null); // hidden render for slip export
  const slipRef = useRef(null);

  // Reset the form each time a different teacher is opened.
  useEffect(() => {
    if (!row) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmount(row.dueAmount > 0 ? String(row.dueAmount) : "");
    setPurpose("Monthly Salary");
    setMethod("bank");
    setTransactionId("");
    setAccountNumber("");
    setScreenshot(null);
    setScreenshotPreview("");
    setPaidAt(todayInputValue());
    setNote("");
  }, [row]);

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG / PNG / WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const numericAmount = Number(amount);
  const due = row?.dueAmount ?? 0;
  const isOverpaying = numericAmount > due;
  const remainingAfter = Math.max(0, due - (numericAmount > 0 ? numericAmount : 0));
  const showTxn = methodNeedsTxn(method);

  const nextFrame = () =>
    new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );

  const persistPayment = async () => {
    const form = new FormData();
    form.append("teacherId", row.teacherRef);
    form.append("amount", String(numericAmount));
    form.append("method", method);
    form.append("purpose", purpose || "Monthly Salary");
    if (showTxn && transactionId.trim()) form.append("transactionId", transactionId.trim());
    if (showTxn && accountNumber.trim()) form.append("accountNumber", accountNumber.trim());
    if (paidAt) form.append("paidAt", paidAt);
    if (note.trim()) form.append("note", note.trim());
    form.append("month", String(month));
    form.append("year", String(year));
    if (screenshot) form.append("screenshot", screenshot);
    return apiClient.post("/salaries/pay", form);
  };

  const buildSlip = (res) => {
    const entries = res?.data?.salary?.entries;
    const last = entries?.[entries.length - 1];
    const newPaid = (row.paidAmount ?? 0) + numericAmount;
    return {
      slipNo: last?._id ? `SAL-${String(last._id).slice(-8).toUpperCase()}` : "—",
      teacherName: row.name,
      teacherId: row.teacherId,
      designation: row.designation || row.subject || "",
      periodLabel: `${banglaMonthName(month)} ${year}`,
      amount: numericAmount,
      salaryAmount: row.salaryAmount,
      paidAmount: newPaid,
      dueAmount: Math.max(0, row.salaryAmount - newPaid),
      methodLabel: methodLabel(method),
      paidAtLabel: formatDate(paidAt),
      purpose,
      transactionId: showTxn ? transactionId.trim() || undefined : undefined,
      accountNumber: showTxn ? accountNumber.trim() || undefined : undefined,
      note: note.trim() || undefined,
    };
  };

  const handleSave = async (withSlip) => {
    if (!(numericAmount > 0)) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    setSaving(true);
    try {
      const res = await persistPayment();
      toast.success(`${formatTaka(numericAmount)} recorded for ${row.name}.`);

      if (withSlip) {
        setSlipData(buildSlip(res));
        await nextFrame(); // let the hidden slip render before capturing
        try {
          await downloadNodeAsPdf(slipRef.current, `salary-slip-${row.teacherId}`);
        } catch (err) {
          toast.error(err.message || "Payment saved, but the slip could not be generated.");
        }
        setSlipData(null);
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Could not record this payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-50 text-secondary-600">
              <FiDollarSign className="text-lg" />
            </span>
            <div>
              <DialogTitle>Pay Salary</DialogTitle>
              <p className="mt-0.5 text-sm text-primary-500">
                {banglaMonthName(month)} {year}
              </p>
            </div>
          </div>
        </DialogHeader>

        {row && (
          <div className="space-y-4">
            {/* Teacher */}
            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-primary-50/50 p-3">
              <AdminAvatar src={row.photo} name={row.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-primary-900">{row.name}</p>
                <p className="text-xs text-primary-400">
                  {row.designation || row.subject || row.teacherId}
                </p>
              </div>
            </div>

            {/* Salary / Paid / Due */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                <p className="text-xs text-primary-400">Salary</p>
                <p className="font-semibold text-primary-900">{formatTaka(row.salaryAmount)}</p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                <p className="text-xs text-primary-400">Paid</p>
                <p className="font-semibold text-secondary-600">{formatTaka(row.paidAmount)}</p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                <p className="text-xs text-primary-400">Due</p>
                <p className="font-semibold text-danger">{formatTaka(row.dueAmount)}</p>
              </div>
            </div>

            {/* Purpose + Amount */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-800">
                  Payment Purpose
                </label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_PURPOSES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="block text-sm font-medium text-primary-800">Paid Amount</label>
                  {due > 0 && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAmount(String(due))}
                        className="rounded-full border border-primary-200 px-2.5 py-0.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                      >
                        Full Due
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmount(String(Math.round(due / 2)))}
                        className="rounded-full border border-primary-200 px-2.5 py-0.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                      >
                        Half
                      </button>
                    </div>
                  )}
                </div>
                <Input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 10000"
                />
                {numericAmount > 0 && !isOverpaying && (
                  <p className="mt-1.5 text-xs text-primary-500">
                    After this payment: {formatTaka(remainingAfter)} due.
                  </p>
                )}
                {isOverpaying && (
                  <p className="mt-1.5 text-xs text-accent-600">
                    This is more than the {formatTaka(due)} outstanding — recorded as an
                    overpayment.
                  </p>
                )}
              </div>
            </div>

            {/* Date + Method */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-800">
                  Payment Date
                </label>
                <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-800">
                  Payment Method
                </label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Account / Transaction / Screenshot — only for non-cash methods.
                These are the proof details the teacher will see on their page. */}
            {showTxn && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary-800">
                      Account / Number <span className="font-normal text-primary-400">(optional)</span>
                    </label>
                    <Input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX / Acc 12345"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary-800">
                      Transaction ID <span className="font-normal text-primary-400">(optional)</span>
                    </label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. TXN123456"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-medium text-primary-800">
                    Payment Screenshot{" "}
                    <span className="font-normal text-primary-400">(optional, up to 5MB)</span>
                  </p>
                  {screenshotPreview ? (
                    <div className="flex items-start gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshotPreview}
                        alt="Payment screenshot preview"
                        className="h-24 w-24 rounded-[var(--radius-lg)] border border-primary-100 object-cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview("");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="salary-screenshot"
                      className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[var(--radius-lg)] border border-dashed border-primary-200 bg-primary-50/40 px-4 py-6 text-center text-primary-500 transition-colors hover:border-primary-400 hover:bg-primary-50"
                    >
                      <FiUploadCloud className="text-2xl" />
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <FiImage /> Upload transfer screenshot
                      </span>
                    </label>
                  )}
                  <input
                    id="salary-screenshot"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshot}
                  />
                </div>
              </>
            )}

            {/* Note */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-800">
                Note <span className="font-normal text-primary-400">(optional)</span>
              </label>
              <Textarea
                placeholder="e.g. Sent to City Bank acc. 12345"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose?.()} disabled={saving}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave(true)} disabled={saving} className="gap-2">
            <FiDownload /> Save &amp; Download Slip
          </Button>
          <Button variant="primary" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? "Saving…" : "Save Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Hidden slip — rendered off-screen only while exporting. */}
      {slipData && (
        <div
          aria-hidden="true"
          style={{ position: "fixed", left: -99999, top: 0, width: 820, pointerEvents: "none" }}
        >
          <SalarySlip ref={slipRef} slip={slipData} />
        </div>
      )}
    </Dialog>
  );
};

export default SalaryPayDialog;
