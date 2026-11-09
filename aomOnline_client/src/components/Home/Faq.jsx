"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import SectionHeading from "@/components/shared/SectionHeading";

const CATEGORIES = [
  { key: "general", label: "General" },
  { key: "courses", label: "Courses" },
  { key: "tutors", label: "Tutors" },
  { key: "progress", label: "Learning & Progress" },
  { key: "pricing", label: "Pricing & Payment" },
];

const FAQ_DATA = {
  general: [
    {
      q: "What is AOM Online Madrasa?",
      a: "AOM Online Madrasa is an online Islamic education platform where students learn authentic Quran recitation, Tajweed, Hifz, and Islamic studies from home under experienced ustadhs.",
    },
    {
      q: "What ages do you accept?",
      a: "We welcome students of every age and level — from young children just starting Qaida to adults pursuing Hifz or deeper Islamic studies.",
    },
    {
      q: "Do I need any special equipment?",
      a: "Just a computer, tablet, or smartphone with an internet connection and a quiet space to attend live classes comfortably.",
    },
  ],
  courses: [
    {
      q: "What courses do you offer?",
      a: "Our course list is actively managed and may grow over time — check the \"Our Courses\" section above for the current, up-to-date list of active courses and levels.",
    },
    {
      q: "How is Qaida different from Nazera?",
      a: "Qaida teaches the foundations — recognizing Arabic letters and correct pronunciation. Nazera builds on that to read the complete Quran fluently while looking at the text.",
    },
    {
      q: "How long does Hifz take?",
      a: "Memorization pace varies by student, age, and daily practice time. Your assigned ustadh will set a personalized, sustainable pace after the first few classes.",
    },
  ],
  tutors: [
    {
      q: "How are ustadhs selected?",
      a: "Every teacher is vetted for qualification, Tajweed proficiency, and teaching experience before joining the platform.",
    },
    {
      q: "Can I request a specific teacher or gender?",
      a: "Yes — you can request a male or female teacher, or a specific ustadh if you already know one, during admission or by contacting us.",
    },
  ],
  progress: [
    {
      q: "How is my child's progress tracked?",
      a: "Every class's attendance is recorded, and teachers regularly update a progress score and milestones as your child advances.",
    },
    {
      q: "Will I receive reports?",
      a: "Yes — parents get regular attendance and progress updates through the platform's dashboard and notifications.",
    },
  ],
  pricing: [
    {
      q: "How much does each course cost?",
      a: "Fees vary by course and level. Visit the admission page to see current pricing for the course you're interested in.",
    },
    {
      q: "What payment methods are accepted?",
      a: "We support convenient local payment options — details are shared with parents after admission is approved.",
    },
    {
      q: "Is there a trial class?",
      a: "Yes — reach out to us through the Contact page and we'll arrange a trial session before you commit.",
    },
  ],
};

const panelVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1 },
};

/**
 * Faq — category-tabbed accordion, teal/gold themed.
 */
const Faq = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [openIndex, setOpenIndex] = useState(0);

  const items = FAQ_DATA[activeCategory] || [];

  const selectCategory = (key) => {
    setActiveCategory(key);
    setOpenIndex(0);
  };

  return (
    <section className="bg-surface-soft py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading
          decorated
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Answers to the questions parents ask us most often."
        />

        {/* Category tabs */}
        <div
          role="tablist"
          aria-label="FAQ categories"
          className="mt-10 flex flex-wrap justify-center gap-2.5"
        >
          {CATEGORIES.map((cat) => {
            const active = cat.key === activeCategory;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectCategory(cat.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors duration-200 ${
                  active
                    ? "bg-primary-500 text-white ring-primary-500"
                    : "bg-primary-50 text-primary-600 ring-primary-100 hover:bg-primary-100"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Accordion */}
        <div className="mt-10 space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${activeCategory}-${i}`;
            const headerId = `faq-header-${activeCategory}-${i}`;
            return (
              <div
                key={headerId}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft"
              >
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-primary-900">{item.q}</span>
                  <FiChevronDown
                    className={`shrink-0 text-accent-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      key="content"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={panelVariants}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-[15px] leading-relaxed text-primary-600">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
