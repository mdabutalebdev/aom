"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMapPin, FiEdit3 } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa6";

import API_BASE_URL from "@/config/api";
import Button from "@/components/ui/Button";
import Carousel from "@/components/shared/Carousel";
import SectionHeading from "@/components/shared/SectionHeading";
import VideoThumbnail from "@/components/shared/VideoThumbnail";
import VideoLightbox from "@/components/shared/VideoLightbox";
import { extractYouTubeId } from "@/components/shared/youtube";
import ReviewSubmitModal from "./ReviewSubmitModal";

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

/**
 * ParentsReview — "Parents Review" homepage section. Pulls live data from
 * GET /testimonials (public, admin-managed). Renders nothing once loaded if
 * the admin hasn't added any reviews yet, rather than showing an empty
 * marketing section on the live site.
 */
const ParentsReview = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setItems(list);
      } else {
        setError(data.message || "Unable to load reviews right now.");
      }
    } catch {
      setError("Unable to load reviews right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [fetchItems]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
      <SectionHeading
        decorated
        eyebrow="TESTIMONIALS"
        title="Parents Review"
        description="See what our parents have to say about their experience with our online Quran classes."
      />
      <div className="mt-6 flex justify-center">
        <Button variant="primary" onClick={() => setSubmitOpen(true)}>
          <FiEdit3 className="mr-1.5" /> Write a Review
        </Button>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-video rounded-[var(--radius-lg)] bg-primary-100" />
              <div className="h-4 w-3/4 rounded bg-primary-100" />
              <div className="h-3 w-1/2 rounded bg-primary-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={fetchItems}>
              Retry
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="mx-auto mt-10 max-w-md rounded-[var(--radius-lg)] border border-dashed border-primary-200 bg-primary-50/40 px-4 py-12 text-center">
          <p className="text-primary-600">
            No reviews yet — be the first to share your experience!
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setSubmitOpen(true)}>
              <FiEdit3 className="mr-1.5" /> Write a Review
            </Button>
          </div>
        </div>
      ) : (
        <Carousel className="mt-10">
          {items.map((t, i) => {
            const videoId = extractYouTubeId(t.youtubeUrl);
            return (
              <motion.div
                key={t._id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex h-full flex-col"
              >
                <VideoThumbnail
                  videoId={videoId}
                  duration={t.duration}
                  onPlay={() => setActiveVideoId(videoId)}
                  alt={t.reviewerName}
                />
                <div className="mt-4 flex-1">
                  <FaQuoteLeft className="text-accent-500" />
                  <p className="mt-2 text-sm leading-relaxed text-primary-700">
                    {t.quoteText}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2.5 border-t border-primary-50 pt-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                    <FiUser />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary-900">
                      {t.reviewerName}
                    </p>
                    {t.location && (
                      <p className="flex items-center gap-1 truncate text-xs text-primary-400">
                        <FiMapPin className="shrink-0" /> {t.location}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </Carousel>
      )}

      <VideoLightbox
        isOpen={!!activeVideoId}
        onClose={() => setActiveVideoId(null)}
        videoId={activeVideoId}
        title="Parent review video"
      />

      <ReviewSubmitModal
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
      />
    </section>
  );
};

export default ParentsReview;
