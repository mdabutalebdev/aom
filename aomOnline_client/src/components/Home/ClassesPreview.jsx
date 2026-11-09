"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SectionHeading from "@/components/shared/SectionHeading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import API_BASE_URL from "@/config/api";
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
 * ClassesPreview — "Our Courses" section on the homepage.
 * Pulls live data from GET /classes (public, admin-managed) instead of a
 * hardcoded list, so anything an admin adds/edits/deactivates in Class
 * Management is reflected here automatically.
 */
const ClassesPreview = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/classes`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setClasses(list);
      } else {
        setError(data.message || "Unable to load courses right now.");
      }
    } catch {
      setError("Unable to load courses right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClasses();
  }, [fetchClasses]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
      <SectionHeading
        decorated
        eyebrow="OUR COURSES"
        title="What Your Child Will Learn"
        description="Comprehensive Islamic courses designed for all ages and levels."
      />

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex h-full flex-col items-center p-7">
              <Skeleton rounded="full" className="h-16 w-16" />
              <Skeleton className="mt-5 h-5 w-24" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={fetchClasses}>
              Retry
            </Button>
          </div>
        </div>
      ) : classes.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          Course details are being updated. Please check back soon.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {classes.map((c, i) => {
            const Icon = getCourseIcon(c.icon);
            return (
              <motion.div
                key={c._id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Card hoverable className="flex h-full flex-col p-7 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-primary-800">
                    {c.nameEn || c.name}
                  </h3>
                  {c.description && (
                    <p className="mt-3 text-[15px] leading-relaxed text-primary-600">
                      {c.description}
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && !error && classes.length > 0 && (
        <div className="mt-10 text-center">
          <Link href="/admission">
            <Button variant="outline" size="md">
              Explore All Courses &rarr;
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default ClassesPreview;
