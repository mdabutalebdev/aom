"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";

// Emojis representing the Islamic progression
const STEP_ASSETS = ["📖", "✏️", "🏆", "💡", "🎯  ", "🎖️"];

const DEFAULT_MILESTONES = [0, 20, 40, 60, 80, 100];

const CONFETTI_COLORS = [
  "#f43f5e", // rose-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
];

const ConfettiBurst = () => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const distance = 40 + (i % 3) * 20;
      return (
        <motion.span
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
          animate={{
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            scale: 1.2,
          }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        />
      );
    })}
  </div>
);

// Streamers fanning upward out of the popper's mouth, looping while the
// completion banner is visible.
const POPPER_BURST = Array.from({ length: 10 }).map((_, i) => {
  const angle = -90 - (i - 4.5) * 16; // fan out upward, spread ~±72°
  const rad = (angle * Math.PI) / 180;
  const distance = 26 + (i % 3) * 10;
  return {
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    dx: Math.cos(rad) * distance,
    dy: Math.sin(rad) * distance,
    rotate: (i % 2 === 0 ? 1 : -1) * (100 + i * 18),
    delay: i * 0.06,
    round: i % 2 === 0,
  };
});

// Animated congratulations flourish — replaces a static image that rendered
// oddly clipped inside the banner. A 🎉 gently rocks while confetti streamers
// repeatedly burst out and fade, so it reads as a live celebration.
const PartyPopperCelebration = () => (
  <div className="pointer-events-none relative h-16 w-16 shrink-0 self-center sm:h-20 sm:w-20 sm:self-auto">
    {POPPER_BURST.map((c, i) => (
      <motion.span
        key={i}
        className={`absolute ${c.round ? "h-1.5 w-1.5 rounded-full" : "h-1 w-2.5 rounded-[1px]"}`}
        style={{ backgroundColor: c.color, left: "46%", top: "48%" }}
        initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
        animate={{
          x: c.dx,
          y: c.dy,
          opacity: [0, 1, 1, 0],
          rotate: c.rotate,
          scale: 1,
        }}
        transition={{
          duration: 1.1,
          delay: c.delay,
          repeat: Infinity,
          repeatDelay: 0.9,
          ease: "easeOut",
        }}
      />
    ))}
    <motion.span
      className="absolute inset-0 flex items-center justify-center text-4xl drop-shadow-md sm:text-5xl"
      animate={{ rotate: [0, -12, 8, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.9, ease: "easeInOut" }}
    >
      🎉
    </motion.span>
  </div>
);

const ProgressPath = ({
  className,
  percentage = 0,
  milestones,
  editable = false,
  onSetPercentage,
  onPromote,
  promoting = false,
  saving = false,
  hasNextClass = true,
  onIssueCertificate,
  issuing = false,
}) => {
  const [celebrated, setCelebrated] = useState(percentage >= 100);
  const [mounted, setMounted] = useState(false);
  const steps = (milestones?.length ? milestones : DEFAULT_MILESTONES.map((p) => ({ percent: p }))).slice(0, 6);
  const clamped = Math.max(0, Math.min(100, percentage));
  const isComplete = clamped >= 100;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const currentIndex = [...steps]
    .map((m, i) => ({ i, percent: m.percent ?? DEFAULT_MILESTONES[i] ?? 0 }))
    .filter((s) => clamped >= s.percent)
    .pop()?.i ?? 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#046c4e] text-white shadow-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Current Class
            </p>
            <p className="text-2xl font-bold text-[#046c4e]">
              {className || "Not assigned"}
            </p>
          </div>
        </div>
        
        {/* Percentage Badge */}
        <motion.div
          key={clamped}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative rounded-md bg-[#046c4e] px-4 py-1.5 shadow-md"
        >
          <span className="text-xl font-bold text-white">{clamped}%</span>
          {/* Tooltip Tail */}
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#046c4e]" />
        </motion.div>
      </div>

      {/* Progress Track */}
      <div className="relative mt-20 mb-10 px-4">
        {/* Background Line */}
        <div className="absolute left-4 right-4 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gray-200" />
        
        {/* Filled Line */}
        <motion.div
          className="absolute left-4 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#046c4e]"
          initial={false}
          animate={{ width: mounted ? `calc(${clamped}% - ${clamped > 0 ? 32 : 0}px)` : 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
          onAnimationComplete={() => {
            if (isComplete) setCelebrated(true);
          }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between">
          {steps.map((m, i) => {
            const percent = m.percent ?? DEFAULT_MILESTONES[i] ?? 0;
            const reached = clamped >= percent;
            const isCurrent = i === currentIndex && !isComplete;
            const Asset = STEP_ASSETS[i] ?? STEP_ASSETS[STEP_ASSETS.length - 1];
            const Wrapper = editable ? motion.button : motion.div;

            return (
              <Wrapper
                key={percent}
                type={editable ? "button" : undefined}
                disabled={editable ? saving : undefined}
                onClick={editable ? () => onSetPercentage?.(percent) : undefined}
                className={`relative flex flex-col items-center justify-center ${
                  editable ? "cursor-pointer disabled:cursor-not-allowed" : ""
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: mounted ? 0 : i * 0.1 }}
              >
                {/* 3D Icon / Emoji positioned above the node */}
                <motion.div
                  className="absolute bottom-8 text-[3.5rem] leading-none drop-shadow-lg"
                  animate={{
                    y: isCurrent ? [0, -12, 0] : 0,
                    scale: reached ? 1 : 0.8,
                    opacity: reached ? 1 : 0.4,
                  }}
                  transition={{
                    y: isCurrent ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
                  }}
                >
                  {Asset}
                  {percent >= 100 && isComplete && celebrated && <ConfettiBurst />}
                </motion.div>

                {/* The Node (Star inside circle) */}
                <div
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white shadow-sm transition-colors duration-300 ${
                    reached ? "bg-[#046c4e] text-yellow-300" : "bg-gray-300 text-white"
                  }`}
                >
                  <Star className="h-3.5 w-3.5 fill-current" />
                  
                  {/* Current step pulse effect */}
                  {isCurrent && (
                    <motion.span
                      className="absolute inset-0 -z-10 rounded-full bg-[#046c4e]"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>

                {/* Percentage Text positioned below the node */}
                <div className={`absolute top-8 text-sm font-bold ${reached ? "text-gray-800" : "text-gray-400"}`}>
                  {percent}%
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative mt-8 flex flex-col gap-4 overflow-hidden rounded-xl bg-[#edf7f3] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌟</div>
              <div>
                <h3 className="text-lg font-bold text-[#046c4e]">Masha'Allah!</h3>
                <p className="text-sm font-medium text-[#046c4e]/80">
                  You have completed the {className || "level"}!
                </p>
              </div>
            </div>

            {/* Actions Container — only rendered when there's an action,
                so on read-only (guardian) views the celebration sits flush
                right instead of leaving an empty gap. */}
            {(onIssueCertificate || (editable && hasNextClass)) && (
              <div className="z-10 flex gap-2">
                {onIssueCertificate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onIssueCertificate}
                    disabled={issuing}
                    className="bg-white text-[#046c4e] border-[#046c4e] hover:bg-[#edf7f3]"
                  >
                    {issuing ? "Issuing…" : "Issue Certificate"}
                    <Star className="ml-1 h-4 w-4 fill-current" />
                  </Button>
                )}
                {editable && hasNextClass && (
                  <Button
                    size="sm"
                    onClick={onPromote}
                    disabled={promoting}
                    className="bg-[#046c4e] text-white hover:bg-[#03543d]"
                  >
                    {promoting ? "Promoting…" : "Promote"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Animated congratulations — last child so it anchors to the
                right edge on read-only views. */}
            <PartyPopperCelebration />
          </motion.div>
        )}
      </AnimatePresence>

      {editable && (
        <p className="mt-4 text-center text-xs text-gray-400">
          Click on a star to update progress.
        </p>
      )}
    </div>
  );
};

export default ProgressPath;
