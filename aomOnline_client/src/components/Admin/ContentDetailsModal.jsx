"use client";

import React from "react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

/**
 * ContentDetailsModal — read-only detail view for a homepage content row.
 *
 * The tables truncate long titles and descriptions to keep columns aligned,
 * so this is where the full, untruncated values are read. Shared by the
 * Achievements and Presentations managers since both show the same shape:
 * a preview image, a heading, and a set of label/value rows.
 */
const ContentDetailsModal = ({
  isOpen,
  onClose,
  title = "Details",
  heading,
  subheading,
  icon: Icon,
  image,
  imageAlt,
  imageHref,
  rows = [],
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="xl"
    footer={
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
    }
  >
    <div className="space-y-4">
      {/* Heading strip */}
      <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-primary-50/60 p-3">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-primary-600">
            <Icon className="text-lg" />
          </span>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-primary-900">{heading || "—"}</p>
          {subheading && (
            <p className="text-sm text-primary-500">{subheading}</p>
          )}
        </div>
      </div>

      {/* Preview — full image rather than the table's cropped thumbnail */}
      {image &&
        (imageHref ? (
          <a
            href={imageHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-[var(--radius-lg)] border border-primary-100 transition-opacity hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={imageAlt || heading || ""} className="w-full" />
          </a>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-primary-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={imageAlt || heading || ""} className="w-full" />
          </div>
        ))}

      {/* Field rows */}
      <div className="rounded-[var(--radius-lg)] border border-primary-100 px-4">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 border-b border-primary-50 py-2.5 last:border-0"
          >
            <span className="shrink-0 text-sm text-primary-400">{r.label}</span>
            <span className="min-w-0 max-w-full text-right text-sm font-medium break-words text-primary-900">
              {r.href ? (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
                >
                  {r.value}
                </a>
              ) : (
                r.value || "—"
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  </Modal>
);

export default ContentDetailsModal;
