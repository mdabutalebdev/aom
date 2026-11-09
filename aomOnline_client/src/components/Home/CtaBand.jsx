"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

const CtaBand = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-primary-500 px-8 py-14 text-center shadow-card sm:px-16"
      >
        <div className="relative">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Enroll Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-100/90">
            Don&apos;t miss this golden opportunity to learn the Quran.
            Register now and begin your child&apos;s Islamic education
            journey.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/admission">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-primary-700 hover:bg-primary-50"
              >
                Enroll Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-white/60 text-white hover:bg-white/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CtaBand;
