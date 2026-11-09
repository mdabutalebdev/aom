"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { MdOutlinePublic } from "react-icons/md";
import { FaBookQuran } from "react-icons/fa6";
import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";
import { HeroSkeleton } from "./HomeSkeletons";
import { getHeroIcon, DEFAULT_HERO_FEATURES } from "@/components/shared/heroIcons";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const Hero = () => {
  const { getSetting, loading } = useSettings();

  const heroFeatures = getSetting("heroFeatures") || DEFAULT_HERO_FEATURES;
  const heroImage = getSetting("heroImage") || "";
  const heroVideoUrl = getSetting("heroVideoUrl") || "";
  const heroMediaType = getSetting("heroMediaType") || "image";
  // The admin's toggle decides which the panel shows; if the chosen media is
  // missing, fall through to the decorative logo + quote composition.
  const showVideo = heroMediaType === "video" && !!heroVideoUrl;
  const showImage = heroMediaType === "image" && !!heroImage;

  if (loading) return <HeroSkeleton />;

  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-12">
        {/* Left: content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-medium text-secondary-700 ring-1 ring-inset ring-secondary-100"
          >
            <HiOutlineUserGroup className="text-base" />
            {getSetting("heroBadgeText") || "Trusted by 500+ Parents Worldwide"}
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-5 text-4xl font-extrabold leading-tight text-primary-950 sm:text-5xl"
          >
            {getSetting("heroHeadingLine1") || "Quality Islamic"}
            <br />
            <span className="text-primary-500">
              {getSetting("heroHeadingHighlight") || "Education"}
            </span>
            <br />
            {getSetting("heroHeadingLine2") || "For Your Child"}
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary-700 lg:mx-0"
          >
            {getSetting("heroDescription") ||
              "Learn Quran, Arabic & Islamic Studies from the comfort of your home with qualified male & female teachers."}
          </motion.p>

          {/* Feature row */}
          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-start justify-center gap-x-2 gap-y-5 lg:justify-start"
          >
            {heroFeatures.map((f, i) => {
              const Icon = getHeroIcon(f.icon);
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span className="hidden self-center text-lg text-primary-300 sm:inline">
                      +
                    </span>
                  )}
                  <div className="flex w-24 flex-col items-center gap-2 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Icon className="text-xl" />
                    </span>
                    <p className="text-xs font-semibold leading-snug text-primary-800">
                      {f.label}
                    </p>
                  </div>
                </React.Fragment>
              );
            })}
          </motion.div>

          <motion.div
            variants={item}
            className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Link href="/admission">
              <Button variant="primary" size="lg">
                {getSetting("heroPrimaryButtonText") || "Join as Student →"}
              </Button>
            </Link>
            <Link href="/join-teacher">
              <Button variant="outline" size="lg">
                {getSetting("heroSecondaryButtonText") || "Join as Teacher"}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-primary-600 lg:justify-start"
          >

          </motion.div>
        </motion.div>

        {/* Right: illustration panel — the outer card (shape, gradient,
            rounded corners) never changes. Its inner content swaps between
            an uploaded photo and the decorative logo+quote composition. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mx-auto w-full max-w-lg lg:mx-0"
        >
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] brand-gradient shadow-lift sm:aspect-[5/4]"
            style={{ borderBottomLeftRadius: "7rem" }}
          >
            {showVideo ? (
              <video
                src={heroVideoUrl}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : showImage ? (
              <Image
                src={heroImage}
                alt={getSetting("siteName") || "AOM Online Madrasa"}
                fill
                sizes="(min-width: 1024px) 32rem, 100vw"
                className="object-cover"
                priority
                // Self-hosted local-disk fallback URLs (see cloudinary.ts) resolve
                // to a loopback address, which Next's image optimizer refuses to
                // fetch (SSRF guard). They also gain nothing from optimization
                // since they're already served as-is by Express, so skip it.
                unoptimized={!heroImage.includes("res.cloudinary.com")}
              />
            ) : (
              <>
                {/* Soft decorative orbs inside the panel */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-black/10 blur-2xl" />

                <div className="relative flex h-full flex-col items-center justify-center gap-5 p-10 text-center text-white">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/15 shadow-lift backdrop-blur-sm">
                    <Image
                      src="/logo.jpg"
                      alt="AOM Online Madrasa logo"
                      width={104}
                      height={104}
                      className="rounded-full border-4 border-white/40"
                      priority
                    />
                  </div>
                  <FaBookQuran className="text-3xl text-accent-300" />
                  <p className="max-w-xs text-sm leading-relaxed text-white/90">
                    {getSetting("heroQuoteText") ||
                      "“Read in the name of your Lord who created.”"}
                    <br />
                    <span className="text-white/60">
                      {getSetting("heroQuoteAttribution") || "— Surah Al-Alaq, 1"}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Floating info card, bottom-right overlap — always shown,
              regardless of whether the panel shows a photo or the
              decorative composition. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute -bottom-6 -right-4 w-56 rounded-[var(--radius-xl)] bg-primary-900 p-4 text-white shadow-lift sm:-right-8"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <MdOutlinePublic className="text-lg" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {getSetting("heroTooltipTitle") || "Learn Anytime, Anywhere"}
                </p>
                <p className="mt-1 text-xs text-white/70">
                  {getSetting("heroTooltipSubtitle") ||
                    "Interactive classes with personal attention"}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
