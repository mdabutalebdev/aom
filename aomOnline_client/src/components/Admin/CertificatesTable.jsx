"use client";

import React from "react";
import { FiEye, FiEdit2, FiTrash2, FiAward } from "react-icons/fi";

// Native date formatting (matches the rest of the app) — avoids a hard
// dependency on date-fns, which isn't installed and was crashing this page.
const formatIssued = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "N/A";

const CertificatesTable = ({ items, onView, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft">
      <table className="w-full text-left text-sm text-primary-600">
        <thead className="border-b border-primary-100 bg-primary-50/50 text-xs uppercase tracking-wider text-primary-500">
          <tr>
            <th className="px-4 py-3 font-medium">Certificate No.</th>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Class</th>
            <th className="px-4 py-3 font-medium">Issued Date</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-50">
          {items.map((item) => (
            <tr
              key={item._id}
              className="group transition-colors hover:bg-primary-50/30"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-primary-900">
                <div className="flex items-center gap-2">
                  <FiAward className="text-primary-400" />
                  {item.certificateNumber}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-primary-900">
                  {item.studentRef?.name || "Unknown"}
                </div>
                <div className="text-xs text-primary-400">
                  {item.studentRef?.studentId || ""}
                </div>
              </td>
              <td className="px-4 py-3 text-primary-700">
                {item.classRef?.name || "Unknown Class"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-primary-600">
                {formatIssued(item.issuedAt)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    title="View & Download"
                    onClick={() => onView(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-primary-500 hover:bg-primary-50 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => onEdit(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-primary-500 hover:bg-primary-50 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => onDelete(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-danger hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-danger/30"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CertificatesTable;
