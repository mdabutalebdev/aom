"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiUserPlus, FiCalendar, FiUserCheck, FiMonitor, FiArrowRight } from "react-icons/fi";
import SectionHeading from "@/components/shared/SectionHeading";
import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";
import { HowItWorksSkeleton } from "./HomeSkeletons";

const steps = [
  {
    number: "01",
    Icon: FiUserPlus,
    title: "Register",
    desc: "Create your free account",
  },
  {
    number: "02",
    Icon: FiCalendar,
    title: "Choose Course & Time",
    desc: "Select the course and class time",
  },
  {
    number: "03",
    Icon: FiUserCheck,
    title: "Get Teacher",
    desc: "We assign a qualified teacher",
  },
  {
    number: "04",
    Icon: FiMonitor,
    title: "Start Learning",
    desc: "Begin your learning journey online",
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

/**
 * HowItWorks — 4-step process explainer (circular icon avatars connected
 * by a dotted line) + a side enrollment CTA card.
 */
const HowItWorks = () => {
  const { loading } = useSettings();

  if (loading) return <HowItWorksSkeleton />;

  return (
    <section className="py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          decorated
          eyebrow="GETTING STARTED"
          title="How It Works"
          description="Four simple steps from registration to your child's first live class."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-center lg:gap-8">
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-x-2">
            {steps.map((s, i) => (
              <motion.div
                key={s.number}
                custom={i}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative flex flex-col items-center px-2 text-center"
              >
                {i < steps.length - 1 && (
                  <span className="pointer-events-none absolute left-1/2 top-8 hidden h-0 w-full border-t-2 border-dashed border-primary-200 sm:block" />
                )}
                <div className="relative">
                  <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-surface text-primary-600 shadow-soft ring-1 ring-primary-100">
                    <s.Icon className="text-2xl" />
                  </span>
                  <span className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold text-white ring-2 ring-surface">
                    {s.number}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-primary-900">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-snug text-primary-500">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="rounded-[var(--radius-2xl)] bg-surface-muted p-7 shadow-soft">
              <h3 className="text-xl font-bold text-primary-900">
                Ready to start your child&apos;s Islamic journey?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-primary-600">
                Book a free trial class today and experience the difference.
              </p>
              <Link href="/admission" className="mt-6 block">
                <Button variant="primary" size="md" fullWidth>
                  Book Free Trial Class <FiArrowRight className="ml-1.5 inline" />
                </Button>
              </Link>
             
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
