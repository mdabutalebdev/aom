"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * SectionHeading — shared, scroll-revealed section header (eyebrow + title +
 * description). Used across the homepage so every section's heading shares one
 * design.
 * `decorated` (opt-in): renders the eyebrow as a plain uppercase label instead
 * of a pill badge.
 */
const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  decorated = false,
  className = "",
}) => {
  const alignment =
    align === "left" ? "text-left items-start" : "text-center items-center mx-auto";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`flex max-w-2xl flex-col ${alignment} ${className}`}
    >
      {eyebrow && decorated ? (
        <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-500">
          {eyebrow}
        </span>
      ) : (
        eyebrow && (
          <span className="mb-3 inline-block rounded-full bg-primary-50 px-4 py-1 text-sm font-medium text-primary-600 ring-1 ring-inset ring-primary-100">
            {eyebrow}
          </span>
        )
      )}
      <h2 className="text-3xl font-bold text-primary-900 sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-primary-600 sm:text-lg">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
