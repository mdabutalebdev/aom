"use client";

import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { getYouTubeEmbedUrl } from "./youtube";

/**
 * VideoLightbox — full-bleed YouTube player modal. Copies ui/Modal.jsx's
 * Escape/backdrop/scroll-lock behavior rather than reusing it, since video
 * needs no header/padding and must fully unmount the <iframe> on close so
 * playback (and audio) actually stops — returning null while closed does
 * that for free.
 */
const VideoLightbox = ({ isOpen, onClose, videoId, title = "Video" }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-primary-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-fade-in-up relative z-10 w-full max-w-4xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <IoClose className="h-5 w-5" />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-xl)] bg-black shadow-[var(--shadow-lift)]">
          {videoId && (
            <iframe
              src={getYouTubeEmbedUrl(videoId)}
              title={title}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLightbox;
