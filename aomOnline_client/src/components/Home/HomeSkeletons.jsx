"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";

/**
 * HomeSkeletons — loading placeholders for the homepage sections that don't
 * fetch their own list data (Hero, StatsBand, WhatWeOffer, HowItWorks,
 * LiveClassDemo, HomeCtaBand). Each mirrors its section's outer wrapper
 * (background + padding) so nothing shifts when the real content swaps in.
 * They are shown while the shared Settings request is still loading.
 */

// A dark shimmer block for use on dark (primary-900) backgrounds.
const DarkBlock = ({ className = "", rounded = "rounded-[var(--radius-md)]" }) => (
  <div className={`animate-pulse bg-white/10 ${rounded} ${className}`} />
);

// Centered section-heading skeleton (icon avatar + title + two subtitle lines).
const HeadingSkeleton = () => (
  <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
    <Skeleton rounded="full" className="h-14 w-14" />
    <Skeleton className="mt-4 h-8 w-64" />
    <Skeleton className="mt-4 h-4 w-full max-w-md" />
    <Skeleton className="mt-2 h-4 w-3/4 max-w-sm" />
  </div>
);

export const HeroSkeleton = () => (
  <section className="relative overflow-hidden bg-surface">
    <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-12">
      <div className="flex flex-col items-center lg:items-start">
        <Skeleton rounded="full" className="h-8 w-60" />
        <Skeleton className="mt-5 h-11 w-4/5" />
        <Skeleton className="mt-3 h-11 w-3/5" />
        <Skeleton className="mt-5 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-xl" />

        <div className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton rounded="full" className="h-12 w-12" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start">
          <Skeleton rounded="lg" className="h-12 w-40" />
          <Skeleton rounded="lg" className="h-12 w-40" />
        </div>
      </div>

      <Skeleton rounded="lg" className="aspect-[4/3] w-full lg:aspect-[5/4]" />
    </div>
  </section>
);

export const StatsBandSkeleton = () => (
  <section className="bg-primary-900 py-10 lg:py-12">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <DarkBlock className="h-11 w-11" rounded="rounded-full" />
          <DarkBlock className="mt-3 h-6 w-20" />
          <DarkBlock className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  </section>
);

export const WhatWeOfferSkeleton = () => (
  <section className="bg-surface-soft py-10 lg:py-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <HeadingSkeleton />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-7"
          >
            <Skeleton rounded="lg" className="h-14 w-14" />
            <Skeleton className="mt-5 h-6 w-40" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const HowItWorksSkeleton = () => (
  <section className="py-10 lg:py-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <HeadingSkeleton />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-center lg:gap-8">
        <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center px-2 text-center">
              <Skeleton rounded="full" className="h-16 w-16" />
              <Skeleton className="mt-4 h-4 w-20" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="rounded-[var(--radius-2xl)] bg-surface-muted p-7">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton rounded="lg" className="mt-6 h-11 w-full" />
        </div>
      </div>
    </div>
  </section>
);

export const LiveClassDemoSkeleton = () => (
  <section className="bg-surface-soft py-10 lg:py-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <HeadingSkeleton />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-[var(--radius-2xl)] border border-primary-100 bg-surface shadow-soft"
          >
            <Skeleton rounded="sm" className="h-12 w-full rounded-none" />
            <Skeleton rounded="sm" className="aspect-video w-full rounded-none" />
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton rounded="full" className="h-8 w-8 shrink-0" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const HomeCtaBandSkeleton = () => (
  <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
    <div className="rounded-[var(--radius-2xl)] bg-primary-900 px-8 py-10 text-center shadow-card sm:px-16">
      <DarkBlock className="mx-auto h-8 w-2/3 max-w-md" />
      <DarkBlock className="mx-auto mt-4 h-4 w-full max-w-2xl" />
      <DarkBlock className="mx-auto mt-2 h-4 w-5/6 max-w-xl" />
      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <DarkBlock className="h-12 w-36" rounded="rounded-[var(--radius-lg)]" />
        <DarkBlock className="h-12 w-36" rounded="rounded-[var(--radius-lg)]" />
      </div>
    </div>
  </section>
);
