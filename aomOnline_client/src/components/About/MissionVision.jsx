"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiTarget, FiEye } from "react-icons/fi";
import Card from "@/components/ui/Card";

const blocks = [
  {
    icon: FiTarget,
    title: "Our Mission",
    accent: "bg-primary-50 text-primary-600",
    desc: "To make authentic Quran recitation and Islamic education accessible in every Muslim household. To build a learning system, guided by experienced ustadhs, where students of any age can learn the Quran without the constraints of time or place.",
  },
  {
    icon: FiEye,
    title: "Our Vision",
    accent: "bg-secondary-50 text-secondary-600",
    desc: "To raise a Quran-centered generation, illuminated by authentic Islamic knowledge, contributing to the wellbeing of themselves and society. To carry Islamic education across borders worldwide through the best use of technology.",
  },
];

const MissionVision = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="grid gap-6 md:grid-cols-2">
        {blocks.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
          >
            <Card className="h-full p-8">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] ${b.accent}`}
              >
                <b.icon className="text-2xl" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-primary-800">
                {b.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-primary-600">
                {b.desc}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MissionVision;
