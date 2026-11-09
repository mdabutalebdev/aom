"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Satisfied Students" },
  { value: "25+", label: "Experienced Ustadhs" },
  { value: "10+", label: "Courses & Levels" },
  { value: "5+", label: "Years of Experience" },
];

const StatsBand = () => {
  return (
    <section className="brand-gradient py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="text-center text-white"
          >
            <p className="text-4xl font-bold sm:text-5xl">{s.value}</p>
            <p className="mt-2 text-sm text-white/85 sm:text-base">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsBand;
