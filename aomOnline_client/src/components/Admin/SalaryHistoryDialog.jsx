"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FiClock, FiTrash2, FiFileText, FiDownload, FiImage } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import { downloadNodeAsPdf, downloadNodeAsImage } from "@/lib/certificatePdf";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
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
  SALARY_STATUS_META,
  formatDate,
  methodLabel,
} from "./salaryConstants";

/**
 * SalaryHistoryDialog — one teacher's full salary record, newest month first.
 * Each month expands to its individual disbursements, since a month can be
 * settled in several instalments. An admin can remove a mistyped entry; the
 * month itself survives so its expected-salary snapshot isn't lost.
 */
const SalaryHistoryDialog = ({ teacherRef, onClose, onChanged }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyEntry, setBusyEntry] = useState(null);
  const [slipTarget, setSlipTarget] = useState(null);
  const [slipBusy, setSlipBusy] = useState(false);
  const slipRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    if (!teacherRef) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/salaries/history/${teacherRef}`);
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load salary history.");
    } finally {
      setLoading(false);
    }
  }, [teacherRef]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  const removeEntry = async (salaryId, entryId) => {
    setBusyEntry(entryId);
    try {
      await apiClient.delete(`/salaries/${salaryId}/entry/${entryId}`);
      toast.success("Payment entry removed.");
      await fetchHistory();
      onChanged?.();
    } catch (err) {
      toast.error(err.message || "Could not remove this entry.");
    } finally {
      setBusyEntry(null);
    }
  };

  const teacher = data?.teacher;
  const records = data?.records ?? [];
  const totals = data?.totals;

  // Shape one payment entry (+ its month record) into the payslip's props.
  const buildSlip = (record, entry) => ({
    slipNo: entry._id ? `SAL-${String(entry._id).slice(-8).toUpperCase()}` : "—",
    teacherName: teacher?.name,
    teacherId: teacher?.teacherId,
    designation: teacher?.designation || teacher?.subject || "",
    periodLabel: `${banglaMonthName(record.month)} ${record.year}`,
    amount: entry.amount,
    salaryAmount: record.salaryAmount,
    paidAmount: record.paidAmount,
    dueAmount: Math.max(0, record.salaryAmount - record.paidAmount),
    methodLabel: methodLabel(entry.method),
    paidAtLabel: formatDate(entry.paidAt),
    purpose: entry.purpose,
    transactionId: entry.transactionId,
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

  return (
    <Dialog open={!!teacherRef} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <FiClock className="text-lg" />
            </span>
            <DialogTitle>Salary History</DialogTitle>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner size="lg" />
            <p className="animate-pulse text-primary-500">Loading...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchHistory}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {/* Teacher identity + lifetime totals */}
            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-primary-50/50 p-3">
              <AdminAvatar src={teacher?.photo} name={teacher?.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-primary-900">{teacher?.name}</p>
                <p className="text-xs text-primary-400">
                  {teacher?.designation || teacher?.subject || teacher?.teacherId}
                </p>
              </div>
            </div>

            {totals && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                  <p className="text-xs text-primary-400">Total Salary</p>
                  <p className="font-semibold text-primary-900">
                    {formatTaka(totals.totalSalary)}
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                  <p className="text-xs text-primary-400">Total Paid</p>
                  <p className="font-semibold text-secondary-600">
                    {formatTaka(totals.totalPaid)}
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-primary-100 px-2 py-2.5">
                  <p className="text-xs text-primary-400">Total Due</p>
                  <p className="font-semibold text-danger">{formatTaka(totals.totalDue)}</p>
                </div>
              </div>
            )}

            {records.length === 0 && (
              <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-12 text-center text-primary-500">
                No salary has been recorded for this teacher yet.
              </div>
            )}

            {records.map((r) => {
              const meta = SALARY_STATUS_META[r.status] ?? SALARY_STATUS_META.unpaid;
              const due = Math.max(0, r.salaryAmount - r.paidAmount);

              return (
                <div
                  key={r._id}
                  className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-primary-900">
                        {banglaMonthName(r.month)} {r.year}
                      </p>
                      <p className="text-xs text-primary-400">
                        {formatTaka(r.paidAmount)} of {formatTaka(r.salaryAmount)}
                        {due > 0 && ` · ${formatTaka(due)} due`}
                      </p>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>

                  {r.entries?.length ? (
                    <ul className="divide-y divide-primary-50">
                      {r.entries.map((e) => (
                        <li
                          key={e._id}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-primary-900">
                              {formatTaka(e.amount)}
                              <span className="ml-2 font-normal text-primary-400">
                                {methodLabel(e.method)}
                              </span>
                            </p>
                            <p className="text-xs text-primary-400">
                              {formatDate(e.paidAt)}
                              {e.note ? ` · ${e.note}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSlipTarget(buildSlip(r, e))}
                              aria-label="Download payment slip"
                              title="Download slip"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-primary-50 hover:text-primary-700"
                            >
                              <FiFileText />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEntry(r._id, e._id)}
                              disabled={busyEntry === e._id}
                              aria-label="Remove this payment entry"
                              title="Remove entry"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-red-50 hover:text-danger disabled:opacity-50"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-sm text-primary-400">
                      Nothing paid for this month yet.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose?.()}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Payslip preview + download (PDF / image) */}
      <Dialog open={!!slipTarget} onOpenChange={(open) => !open && setSlipTarget(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Salary Slip</DialogTitle>
          </DialogHeader>
          {slipTarget && (
            <div>
              <div className="mb-3 flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadSlip("image")}
                  disabled={slipBusy}
                  className="gap-2"
                >
                  <FiImage /> Image
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => downloadSlip("pdf")}
                  isLoading={slipBusy}
                  disabled={slipBusy}
                  className="gap-2"
                >
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
    </Dialog>
  );
};

export default SalaryHistoryDialog;
