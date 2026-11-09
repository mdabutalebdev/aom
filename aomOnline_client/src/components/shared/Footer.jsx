"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IoMdCall } from "react-icons/io";
import { IoMailOutline, IoLocationOutline } from "react-icons/io5";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import { useSettings } from "@/context/SettingsContext";

// Every social platform the admin can manage. Each shows in the footer
// when it is active (default true unless explicitly turned off).
const SOCIAL_PLATFORMS = [
  { key: "facebook", activeKey: "facebookActive", Icon: FaFacebookF, label: "Facebook" },
  { key: "instagram", activeKey: "instagramActive", Icon: FaInstagram, label: "Instagram" },
  { key: "tiktok", activeKey: "tiktokActive", Icon: FaTiktok, label: "TikTok" },
  { key: "linkedin", activeKey: "linkedinActive", Icon: FaLinkedinIn, label: "LinkedIn" },
  { key: "youtube", activeKey: "youtubeActive", Icon: FaYoutube, label: "YouTube" },
  { key: "whatsapp", activeKey: "whatsappActive", Icon: FaWhatsapp, label: "WhatsApp" },
];

// WhatsApp may be entered as a bare number — turn it into a wa.me link.
const socialHref = (key, url) => {
  if (key === "whatsapp" && url && !/^https?:\/\//i.test(url)) {
    const digits = url.replace(/[^\d]/g, "");
    return digits ? `https://wa.me/${digits}` : url;
  }
  return url;
};

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Admission", href: "/admission" },
  { label: "Login", href: "/login" },
];

const classLinks = [
  { label: "Qaida", href: "/admission" },
  { label: "Nazera", href: "/admission" },
  { label: "Hifz", href: "/admission" },
  { label: "Ampara", href: "/admission" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const { getSetting, settings } = useSettings();

  const phone = getSetting("phone") || "+880 1700-000000";
  const phoneDial = (getSetting("phone") || "+8801700000000").replace(/[^\d+]/g, "");
  const email = getSetting("email") || "info@aomonline.com";
  const address = getSetting("address") || "Dhaka, Bangladesh";

  // Active (not explicitly turned off) platforms, regardless of URL presence.
  const socials = SOCIAL_PLATFORMS.map((p) => ({
    ...p,
    url: getSetting(p.key),
  })).filter((p) => settings?.[p.activeKey] !== false);

  return (
    <footer className="mt-20 border-t border-primary-100 bg-primary-500 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="AOM Online Madrasa logo"
              width={44}
              height={44}
              className="rounded-[var(--radius-md)]"
            />
            <span className="text-lg font-semibold text-white">
              AOM Online Madrasa
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/85">
            Authentic Quran and Islamic education from home — under
            experienced ustadhs, for students of every age.
          </p>

          {/* Social — only active platforms */}
          {socials.length > 0 && (
            <div className="mt-5 flex items-center gap-2.5">
              {socials.map(({ key, url, Icon, label }) => (
                <a
                  key={key}
                  href={socialHref(key, url) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-4 text-base font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-white/85">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Classes */}
        <div>
          <h4 className="mb-4 text-base font-semibold text-white">Our Courses</h4>
          <ul className="space-y-2.5 text-sm text-white/85">
            {classLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 text-base font-semibold text-white">Contact</h4>
          <ul className="space-y-3 text-sm text-white/85">
            <li className="flex items-start gap-2.5">
              <IoMdCall className="mt-0.5 shrink-0 text-base text-white" />
              <a href={`tel:${phoneDial}`} className="hover:text-white">
                {phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <IoMailOutline className="mt-0.5 shrink-0 text-base text-white" />
              <a href={`mailto:${email}`} className="hover:text-white">
                {email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <IoLocationOutline className="mt-0.5 shrink-0 text-base text-white" />
              <span>{address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="text-center text-sm text-white/70">
          © {year} AOM Online Madrasa. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
