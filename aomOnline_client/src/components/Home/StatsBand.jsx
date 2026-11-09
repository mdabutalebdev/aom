"use client";

import React from "react";
import { motion } from "framer-motion";
import { MdOutlinePerson, MdOutlineGroups, MdOutlineMenuBook, MdOutlineSchedule } from "react-icons/md";
import { useSettings } from "@/context/SettingsContext";
import { StatsBandSkeleton } from "./HomeSkeletons";

const stats = [
  {
    Icon: MdOutlinePerson,
    value: "300+",
    label: "Experienced Male & Female Teachers",
  },
  {
    Icon: MdOutlineGroups,
    value: "10,000+",
    label: "Happy Students",
  },
  {
    Icon: MdOutlineMenuBook,
    value: "1 to 1",
    label: "Personalized Attention",
  },
  {
    Icon: MdOutlineSchedule,
    value: "Flexible",
    label: "Class Timings",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

/**
 * StatsBand — full-bleed dark trust band on the homepage.
 */
const StatsBand = () => {
  const { loading } = useSettings();

  if (loading) return <StatsBandSkeleton />;

  return (
    <section className="bg-primary-900 py-10 lg:py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="text-center"
          >
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
              <s.Icon className="text-xl" />
            </span>
            <p className="mt-3 text-2xl font-bold text-white sm:text-[1.7rem]">
              {s.value}
            </p>
            <p className="mt-1 text-sm leading-snug text-primary-100/80">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsBand;
