"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiUser, FiUsers } from "react-icons/fi";
import SectionHeading from "@/components/shared/SectionHeading";

import { useSettings } from "@/context/SettingsContext";
import { LiveClassDemoSkeleton } from "./HomeSkeletons";
import {
  getHeroIcon,
  DEFAULT_CLASSDEMO_ONETOONE_FEATURES,
  DEFAULT_CLASSDEMO_GROUP_FEATURES,
  DEFAULT_CLASSDEMO_TEXT,
} from "@/components/shared/heroIcons";

// Turn any common YouTube URL (watch?v=, youtu.be/, embed/, shorts/, live/, or a
// bare 11-char id) into an embeddable player URL. Returns null when the link
// isn't a recognizable YouTube video, so the card falls back to the photo.
const toYouTubeEmbed = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/,
  );
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  if (/^[\w-]{11}$/.test(trimmed)) return `https://www.youtube.com/embed/${trimmed}`;
  return null;
};

// One comparison card — header bar + video/photo (or icon placeholder when
// neither is set) + feature-bullet list. A YouTube video, when provided, is
// shown in place of the photo.
const ComparisonCard = ({ headerIcon: HeaderIcon, headerClass, title, image, videoUrl, features, alt }) => {
  const embedUrl = toYouTubeEmbed(videoUrl);
  return (
  <div className="overflow-hidden rounded-[var(--radius-xl)] border border-primary-100 bg-surface shadow-soft">
    <div className={`flex items-center gap-2.5 px-4 py-3 text-white ${headerClass}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
        <HeaderIcon className="text-sm" />
      </span>
      <p className="text-sm font-bold tracking-wide">{title}</p>
    </div>

    {embedUrl ? (
      <div className="relative aspect-[16/9] w-full bg-primary-900">
        <iframe
          src={embedUrl}
          title={alt}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    ) : image ? (
      <div className="relative aspect-[16/9] w-full bg-primary-50">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 28rem, 100vw"
          className="object-cover"
          unoptimized={!image.includes("res.cloudinary.com")}
        />
      </div>
    ) : (
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-primary-50 text-primary-300">
        <HeaderIcon className="text-4xl" />
      </div>
    )}

    {/* Two columns on wider cards so four bullets don't stretch the card
        into a tall block. */}
    <div className="grid gap-x-4 gap-y-2.5 p-4 sm:grid-cols-2">
      {features.map((f, i) => {
        const Icon = getHeroIcon(f.icon);
        return (
          <div key={i} className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Icon className="text-xs" />
            </span>
            <p className="text-sm font-medium text-primary-800">{f.label}</p>
          </div>
        );
      })}
    </div>
  </div>
  );
};

/**
 * LiveClassDemo — "Watch Our Live Class Demo" homepage section. Fixed
 * 2-card comparison (One-to-One vs Group), reads from the Settings
 * singleton via useSettings() — same pattern as Hero.jsx, not a list.
 */
const LiveClassDemo = () => {
  const { getSetting, loading } = useSettings();

  if (loading) return <LiveClassDemoSkeleton />;

  const oneToOneFeatures =
    getSetting("classDemoOneToOneFeatures") || DEFAULT_CLASSDEMO_ONETOONE_FEATURES;
  const groupFeatures = getSetting("classDemoGroupFeatures") || DEFAULT_CLASSDEMO_GROUP_FEATURES;

  return (
    <section className="bg-surface-soft py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          decorated
          eyebrow={
            getSetting("classDemoBadgeText") ||
            DEFAULT_CLASSDEMO_TEXT.classDemoBadgeText
          }
          title={`${
            getSetting("classDemoHeadingMain") ||
            DEFAULT_CLASSDEMO_TEXT.classDemoHeadingMain
          } ${
            getSetting("classDemoHeadingHighlight") ||
            DEFAULT_CLASSDEMO_TEXT.classDemoHeadingHighlight
          }`}
          description={
            getSetting("classDemoDescription") ||
            DEFAULT_CLASSDEMO_TEXT.classDemoDescription
          }
        />

        {/* Capped so the two cards stay a readable size instead of stretching
            to the full 7xl container on large screens. */}
        <div className="mx-auto mt-8 grid max-w-5xl gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ComparisonCard
              headerIcon={FiUser}
              headerClass="bg-secondary-700"
              title={
                getSetting("classDemoOneToOneTitle") ||
                DEFAULT_CLASSDEMO_TEXT.classDemoOneToOneTitle
              }
              image={getSetting("classDemoOneToOneImage") || ""}
              videoUrl={getSetting("classDemoOneToOneVideoUrl") || ""}
              features={oneToOneFeatures}
              alt="One-to-One class"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <ComparisonCard
              headerIcon={FiUsers}
              headerClass="bg-accent-600"
              title={
                getSetting("classDemoGroupTitle") ||
                DEFAULT_CLASSDEMO_TEXT.classDemoGroupTitle
              }
              image={getSetting("classDemoGroupImage") || ""}
              videoUrl={getSetting("classDemoGroupVideoUrl") || ""}
              features={groupFeatures}
              alt="Group class"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveClassDemo;
