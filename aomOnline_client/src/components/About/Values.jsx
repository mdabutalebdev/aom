"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaHandHoldingHeart, FaBookQuran, FaUserShield, FaUsers } from "react-icons/fa6";
import SectionHeading from "@/components/shared/SectionHeading";
import Card from "@/components/ui/Card";

const values = [
  {
    icon: FaBookQuran,
    title: "Authenticity",
    desc: "Uncompromising in teaching authentic Quran recitation with Tajweed and correct pronunciation.",
  },
  {
    icon: FaHandHoldingHeart,
    title: "Sincerity",
    desc: "Caring, loving treatment toward every single student.",
  },
  {
    icon: FaUserShield,
    title: "Accountability",
    desc: "Transparency and accountability toward students and parents.",
  },
  {
    icon: FaUsers,
    title: "Compassion",
    desc: "Mutual cooperation and brotherhood for the wellbeing of the Ummah.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

const Values = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <SectionHeading
        eyebrow="Our Values"
        title="The Principles We Believe In"
        description="Every one of our activities is guided by the values and ethics of Islam."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Card hoverable className="h-full p-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                <v.icon className="text-2xl" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-primary-800">
                {v.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-primary-600">
                {v.desc}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Values;
