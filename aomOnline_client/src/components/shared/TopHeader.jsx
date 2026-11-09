"use client";

import React from "react";
import { IoMdCall } from "react-icons/io";
import { IoMailOutline } from "react-icons/io5";
import { FaFacebookF, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { useSettings } from "@/context/SettingsContext";

// Public top header — contact info (phone/email) and social links. Visible on desktop.
const TopHeader = () => {
  const { getSetting } = useSettings();

  // Dynamic value from settings, falls back if unset.
  const phone = getSetting("phone") || "+880 1700-000000";
  const phoneDial = (getSetting("phone") || "+8801700000000").replace(/[^\d+]/g, "");
  const email = getSetting("email") || "info@aomonline.com";
  const facebookUrl = getSetting("facebook") || "#";
  const youtubeUrl = getSetting("youtube") || "#";
  const whatsappUrl = getSetting("whatsapp") || "#";

  return (
    <div className="hidden w-full bg-[#00939A] text-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        {/* Contact Info */}
        <div className="flex items-center gap-6">
          <a
            href={`tel:${phoneDial}`}
            className="group flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white"
          >
            <IoMdCall className="text-base text-accent-200 transition-transform group-hover:scale-110" />
            <span className="tracking-wide">{phone}</span>
          </a>
          <span className="h-4 w-px bg-white/20" />
          <a
            href={`mailto:${email}`}
            className="group flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white"
          >
            <IoMailOutline className="text-base text-accent-200 transition-transform group-hover:scale-110" />
            <span className="tracking-wide">{email}</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70">Connect with us:</span>
          <div className="flex items-center gap-2">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/90 transition-all hover:bg-white/20 hover:text-white"
            >
              <FaFacebookF className="text-xs" />
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/90 transition-all hover:bg-white/20 hover:text-white"
            >
              <FaYoutube className="text-xs" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/90 transition-all hover:bg-white/20 hover:text-white"
            >
              <FaWhatsapp className="text-xs" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
