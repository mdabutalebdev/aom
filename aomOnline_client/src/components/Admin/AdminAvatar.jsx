"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiUser } from "react-icons/fi";

/**
 * AdminAvatar — Circular profile picture; if image missing/load fails,
 * shows a fallback initial or icon with a teal background.
 *
 * props: src?, name?, size (px, default 48), className?
 */
const AdminAvatar = ({ src, name = "", size = 48, className = "" }) => {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  // First letter of the name as fallback initial.
  const initial = (name || "").trim().charAt(0);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 ring-1 ring-primary-200 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name || "Profile Picture"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : initial ? (
        <span
          className="font-semibold leading-none"
          style={{ fontSize: Math.max(12, Math.round(size * 0.4)) }}
        >
          {initial}
        </span>
      ) : (
        <FiUser style={{ fontSize: Math.round(size * 0.5) }} />
      )}
    </span>
  );
};

export default AdminAvatar;
