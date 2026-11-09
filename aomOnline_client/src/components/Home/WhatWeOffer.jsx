"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FiVideo,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiDownload,
  FiBell,
} from "react-icons/fi";
import SectionHeading from "@/components/shared/SectionHeading";
import Card from "@/components/ui/Card";
import { useSettings } from "@/context/SettingsContext";
import { WhatWeOfferSkeleton } from "./HomeSkeletons";

const features = [
  {
    icon: FiVideo,
    title: "Online Classes",
    desc: "Join live, interactive classes from anywhere, right from the comfort of home.",
  },
  {
    icon: FiUsers,
    title: "Expert Teachers",
    desc: "Authentic Islamic education under the guidance of qualified, experienced ustadhs.",
  },
  {
    icon: FiCheckSquare,
    title: "Attendance Tracking",
    desc: "Every class's attendance is automatically recorded and monitored.",
  },
  {
    icon: FiBarChart2,
    title: "Progress Reports",
    desc: "Regular, detailed reports on your child's learning progress.",
  },
  {
    icon: FiDownload,
    title: "Downloadable Materials",
    desc: "Easily download the study materials and resources you need.",
  },
  {
    icon: FiBell,
    title: "Parent Updates",
    desc: "Regular updates for parents on their child's academic progress.",
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

const WhatWeOffer = () => {
  const { loading } = useSettings();

  if (loading) return <WhatWeOfferSkeleton />;

  return (
    <section className="bg-surface-soft py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          decorated
          eyebrow="WHAT WE OFFER"
          title="Why Families Choose Us"
          description="A complete experience for students and parents, blending modern technology with authentic Islamic education."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Card hoverable className="h-full p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-primary-50 text-primary-600">
                  <f.icon className="text-2xl" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-primary-800">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-primary-600">
                  {f.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeOffer;
