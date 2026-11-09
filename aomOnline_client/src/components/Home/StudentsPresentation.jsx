"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiUser } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import Button from "@/components/ui/Button";
import Carousel from "@/components/shared/Carousel";
import SectionHeading from "@/components/shared/SectionHeading";
import VideoThumbnail from "@/components/shared/VideoThumbnail";
import VideoLightbox from "@/components/shared/VideoLightbox";
import { extractYouTubeId } from "@/components/shared/youtube";
import { getCourseIcon } from "@/components/shared/courseIcons";

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

/**
 * StudentsPresentation — "Our Students' Presentation" homepage section.
 * Pulls live data from GET /presentations (public, admin-managed).
 */
const StudentsPresentation = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeVideoId, setActiveVideoId] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/presentations`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setItems(list);
      } else {
        setError(data.message || "Unable to load presentations right now.");
      }
    } catch {
      setError("Unable to load presentations right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [fetchItems]);

  if (!loading && !error && items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
      <SectionHeading
        decorated
        eyebrow="STUDENT PRESENTATIONS"
        title="Our Students' Presentation"
        description="Watch our students as they present what they've learned with confidence and clarity. From Quran recitation to Islamic topics – they shine on every stage."
      />

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
      ) : (
        <Carousel className="mt-10">
          {items.map((p, i) => {
            const videoId = extractYouTubeId(p.youtubeUrl);
            const Icon = getCourseIcon(p.icon);
            return (
              <motion.div
                key={p._id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex h-full flex-col"
              >
                <VideoThumbnail
                  videoId={videoId}
                  duration={p.duration}
                  onPlay={() => setActiveVideoId(videoId)}
                  alt={p.title}
                />
                <div className="mt-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Icon className="text-sm" />
                    </span>
                    <p className="font-semibold text-primary-900">{p.title}</p>
                  </div>
                  {p.subtitle && (
                    <p className="mt-1.5 text-sm text-primary-600">{p.subtitle}</p>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-primary-50 pt-3 text-sm text-primary-500">
                  <FiUser className="shrink-0" /> {p.presenterName}
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
        title="Student presentation video"
      />
    </section>
  );
};

export default StudentsPresentation;
