"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiEye,
  FiFileText,
  FiDownload,
  FiImage,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import { downloadNodeAsPdf, downloadNodeAsImage } from "@/lib/certificatePdf";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import SalarySlip from "@/components/shared/SalarySlip";
import { formatTaka } from "@/components/Admin/managementConstants";
import { banglaMonthName } from "@/components/Admin/paymentConstants";
import { SALARY_STATUS_META, methodLabel, formatDate } from "@/components/Admin/salaryConstants";

const DetailRow = ({ label, value }) =>
  value ? (
    <div className="flex gap-2 text-sm">
      <span className="w-32 shrink-0 text-primary-400">{label}</span>
      <span className="font-medium text-primary-800">{value}</span>
    </div>
  ) : null;

/**
 * TeacherPaymentsView — the teacher's OWN salary: what they are owed each month
 * and what the Super Admin has actually paid, as a table. A row opens the
 * payment details (method / number / transaction id / screenshot the admin
 * provided) and a downloadable payslip. No student fee data is shown here.
 */
const TeacherPaymentsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailsTarget, setDetailsTarget] = useState(null); // a month record
  const [slipTarget, setSlipTarget] = useState(null); // a slip object
  const [slipBusy, setSlipBusy] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const slipRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/salaries/my-salary");
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load salary info.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const buildSlip = (record, entry) => ({
    slipNo: entry._id ? `SAL-${String(entry._id).slice(-8).toUpperCase()}` : "—",
    teacherName: data?.teacher?.name,
    teacherId: data?.teacher?.teacherId,
    designation: data?.teacher?.designation || data?.teacher?.subject || "",
    periodLabel: `${banglaMonthName(record.month)} ${record.year}`,
    amount: entry.amount,
    salaryAmount: record.salaryAmount,
    paidAmount: record.paidAmount,
    dueAmount: Math.max(0, record.salaryAmount - record.paidAmount),
    methodLabel: methodLabel(entry.method),
    paidAtLabel: formatDate(entry.paidAt),
    purpose: entry.purpose,
    transactionId: entry.transactionId,
    accountNumber: entry.accountNumber,
    note: entry.note,
  });

  const downloadSlip = async (kind) => {
    if (!slipRef.current) return;
    setSlipBusy(true);
    try {
      const name = `salary-slip-${slipTarget?.slipNo || ""}`;
      if (kind === "image") await downloadNodeAsImage(slipRef.current, name);
      else await downloadNodeAsPdf(slipRef.current, name);
    } catch (err) {
      toast.error(err.message || "Could not generate the slip.");
    } finally {
      setSlipBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
        <p>{error || "Could not load salary info."}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
          Try again
        </Button>
      </div>
    );
  }

  const teacher = data.teacher || {};
  const totals = data.totals || {};
  const records = data.records || [];

  const stats = [
    {
      label: "Next Month Salary",
      value: formatTaka(teacher.projectedSalary),
      icon: FiTrendingUp,
      tone: "border-secondary-100 bg-secondary-50/60 text-secondary-600",
    },
    {
      label: "Total Received",
      value: formatTaka(totals.totalPaid),
      icon: FiDollarSign,
      tone: "border-primary-100 bg-primary-50/60 text-primary-600",
    },
    {
      label: "Total Due",
      value: formatTaka(totals.totalDue),
      icon: FiAlertCircle,
      tone: "border-accent-100 bg-accent-50/60 text-accent-600",
    },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 ${s.tone}`}
            >
              <Icon className="text-xl" />
              <div>
                <p className="text-xs opacity-80">{s.label}</p>
                <p className="text-lg font-bold text-primary-900">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {records.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No salary has been recorded for you yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 text-right font-medium">Salary</th>
                <th className="px-4 py-3 text-right font-medium">Paid</th>
                <th className="px-4 py-3 text-right font-medium">Due</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const meta = SALARY_STATUS_META[r.status] ?? SALARY_STATUS_META.unpaid;
                const dueAmt = Math.max(0, r.salaryAmount - r.paidAmount);
                return (
                  <tr key={r._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-primary-900">
                      {banglaMonthName(r.month)} {r.year}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-primary-900">
                      {formatTaka(r.salaryAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-secondary-600">
                      {formatTaka(r.paidAmount)}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right tabular-nums ${dueAmt > 0 ? "text-danger" : "text-primary-300"}`}>
                      {formatTaka(dueAmt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailsTarget(r)}
                        disabled={!r.entries?.length}
                        className="gap-1.5"
                      >
                        <FiEye /> Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details modal — the payments the admin made for this month */}
      <Dialog open={!!detailsTarget} onOpenChange={(open) => !open && setDetailsTarget(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {detailsTarget && `${banglaMonthName(detailsTarget.month)} ${detailsTarget.year} — Salary`}
            </DialogTitle>
          </DialogHeader>

          {detailsTarget && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                  <p className="text-xs text-primary-400">Salary</p>
                  <p className="font-semibold text-primary-900">{formatTaka(detailsTarget.salaryAmount)}</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                  <p className="text-xs text-primary-400">Paid</p>
                  <p className="font-semibold text-secondary-600">{formatTaka(detailsTarget.paidAmount)}</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                  <p className="text-xs text-primary-400">Due</p>
                  <p className="font-semibold text-danger">
                    {formatTaka(Math.max(0, detailsTarget.salaryAmount - detailsTarget.paidAmount))}
                  </p>
                </div>
              </div>

              {detailsTarget.entries?.map((e) => (
                <div key={e._id} className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-primary-900">{formatTaka(e.amount)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSlipTarget(buildSlip(detailsTarget, e))}
                      className="gap-1.5"
                    >
                      <FiFileText /> Slip
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <DetailRow label="Purpose" value={e.purpose || "Monthly Salary"} />
                    <DetailRow label="Method" value={methodLabel(e.method)} />
                    <DetailRow label="Date" value={formatDate(e.paidAt)} />
                    <DetailRow label="Account / No." value={e.accountNumber} />
                    <DetailRow label="Transaction ID" value={e.transactionId} />
                    <DetailRow label="Note" value={e.note} />
                  </div>
                  {e.screenshotUrl && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs text-primary-400">Payment Screenshot</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={e.screenshotUrl}
                        alt="Payment screenshot"
                        onClick={() => setZoomImage(e.screenshotUrl)}
                        className="max-h-48 cursor-zoom-in rounded-[var(--radius-lg)] border border-primary-100 object-contain"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slip preview + download */}
      <Dialog open={!!slipTarget} onOpenChange={(open) => !open && setSlipTarget(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Salary Slip</DialogTitle>
          </DialogHeader>
          {slipTarget && (
            <div>
              <div className="mb-3 flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadSlip("image")} disabled={slipBusy} className="gap-2">
                  <FiImage /> Image
                </Button>
                <Button variant="primary" size="sm" onClick={() => downloadSlip("pdf")} isLoading={slipBusy} disabled={slipBusy} className="gap-2">
                  <FiDownload /> {slipBusy ? "Preparing…" : "PDF"}
                </Button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                <SalarySlip ref={slipRef} slip={slipTarget} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlipTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screenshot lightbox */}
      <Dialog open={!!zoomImage} onOpenChange={(open) => !open && setZoomImage("")}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {zoomImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={zoomImage} alt="Payment screenshot full size" className="max-h-[75vh] w-full rounded-[var(--radius-lg)] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherPaymentsView;
