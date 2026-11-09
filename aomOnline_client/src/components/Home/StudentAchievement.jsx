"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/shared/SectionHeading";

import API_BASE_URL from "@/config/api";
import Button from "@/components/ui/Button";
import Carousel from "@/components/shared/Carousel";
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
 * StudentAchievement — "Our Student Achievement" homepage section. Pulls
 * live data from GET /achievements (public, admin-managed).
 */
const StudentAchievement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/achievements`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setItems(list);
      } else {
        setError(data.message || "Unable to load achievements right now.");
      }
    } catch {
      setError("Unable to load achievements right now.");
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
    <section className="bg-surface-soft py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          decorated
          eyebrow="ACHIEVEMENTS"
          title="Our Student Achievement"
          description="We celebrate every milestone! Our students are awarded beautiful certificates for their hard work and dedication in course completion and Hifz achievement."
        />

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[4/3] rounded-[var(--radius-lg)] bg-primary-100" />
                <div className="h-4 w-3/4 rounded bg-primary-100" />
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
            {items.map((a, i) => {
              const Icon = getCourseIcon(a.icon);
              return (
                <motion.div
                  key={a._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  // h-full + flex column so every card matches the tallest in
                  // the row — a one-line description must not leave its card
                  // shorter than its neighbours.
                  className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-soft"
                >
                  <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-primary-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.certificateImage}
                      alt={a.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                        <Icon className="text-base" />
                      </span>
                      <p className="font-semibold text-primary-900">{a.title}</p>
                    </div>
                    {a.description && (
                      <p className="mt-2 text-sm leading-relaxed text-primary-600">
                        {a.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default StudentAchievement;
