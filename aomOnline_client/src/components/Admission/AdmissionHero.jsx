"use client";

import React from "react";
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";

// Admission page hero section.
const AdmissionHero = () => {
  return (
    <section className="relative overflow-hidden brand-gradient-soft">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-accent-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Badge variant="accent" className="mb-5">
            Admission
          </Badge>
          <h1 className="text-4xl font-bold leading-tight text-primary-900 sm:text-5xl">
            Online Admission Application
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-700">
            Fill out the form below to submit an admission application for
            your child. Our admin will review it and get back to you shortly.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AdmissionHero;
