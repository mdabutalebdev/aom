"use client";

import React, { useState } from "react";
import { FiPlay } from "react-icons/fi";
import { getYouTubeThumbnail } from "./youtube";

/**
 * VideoThumbnail — thumbnail image + circular play button + optional
 * duration badge. Takes an already-derived videoId (parent computes
 * extractYouTubeId once per list item) rather than a raw URL.
 */
const VideoThumbnail = ({ videoId, duration, onPlay, alt = "Video thumbnail" }) => {
  const [errored, setErrored] = useState(false);
  const src = videoId ? getYouTubeThumbnail(videoId) : "";

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label="Play video"
      className="group relative block aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] bg-primary-100"
    >
      {src && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-primary-300">
          <FiPlay className="text-3xl" />
        </div>
      )}

      <span className="absolute inset-0 bg-primary-950/10 transition-colors group-hover:bg-primary-950/25" />

      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-700 shadow-[var(--shadow-lift)] transition-transform group-hover:scale-110">
        <FiPlay className="ml-1 text-xl" />
      </span>

      {duration && (
        <span className="absolute bottom-2 right-2 rounded bg-primary-950/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {duration}
        </span>
      )}
    </button>
  );
};

export default VideoThumbnail;
