"use client";

import React from "react";
import { FiExternalLink, FiMapPin, FiClock } from "react-icons/fi";

import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { extractYouTubeId, getYouTubeThumbnail } from "@/components/shared/youtube";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

/**
 * ReviewDetailModal — read-only detail view for a single review/testimonial,
 * used from the admin moderation table.
 */
const ReviewDetailModal = ({ isOpen, onClose, review, onAccept, onEdit, onDelete }) => {
  if (!review) {
    return <Modal isOpen={isOpen} onClose={onClose} title="Review Details" size="lg" />;
  }

  const videoId = extractYouTubeId(review.youtubeUrl);
  const isPending = review.status === "pending";
  const isParent = review.source === "parent";

  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onClose}>
        Close
      </Button>
      {isPending && (
        <Button variant="secondary" size="sm" onClick={() => onAccept?.(review)}>
          Accept
        </Button>
      )}
      {!isPending && (
        <Button variant="primary" size="sm" onClick={() => onEdit?.(review)}>
          Edit
        </Button>
      )}
      <Button
        variant="danger"
        size="sm"
        onClick={() => onDelete?.(review)}
      >
        Delete
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Details" size="lg" footer={footer}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isPending ? "warning" : "success"}>
            {isPending ? "Pending" : "Approved"}
          </Badge>
          <Badge variant={isParent ? "accent" : "primary"}>
            {isParent ? "Parent submitted" : "Admin added"}
          </Badge>
          <span className="ml-auto text-xs text-primary-400">
            Submitted {formatDate(review.createdAt)}
          </span>
        </div>

        {videoId && (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-primary-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getYouTubeThumbnail(videoId)}
              alt={review.reviewerName}
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/40 px-4 py-3">
          <p className="text-sm leading-relaxed text-primary-700">
            “{review.quoteText}”
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-primary-900">{review.reviewerName}</p>
          {review.location && (
            <p className="flex items-center gap-1.5 text-sm text-primary-500">
              <FiMapPin className="shrink-0" /> {review.location}
            </p>
          )}
          {review.duration && (
            <p className="flex items-center gap-1.5 text-sm text-primary-500">
              <FiClock className="shrink-0" /> {review.duration}
            </p>
          )}
        </div>

        {review.youtubeUrl && (
          <a
            href={review.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            <FiExternalLink /> Open video on YouTube
          </a>
        )}
      </div>
    </Modal>
  );
};

export default ReviewDetailModal;
