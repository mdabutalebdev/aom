"use client";

import React from "react";
import { motion } from "framer-motion";
import { IoMdCall } from "react-icons/io";
import { IoMailOutline, IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import { FaFacebookF, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { useSettings } from "@/context/SettingsContext";

const ContactInfo = () => {
  const { getSetting } = useSettings();

  const phone = getSetting("phone") || "+880 1700-000000";
  const phoneDial = (getSetting("phone") || "+8801700000000").replace(/[^\d+]/g, "");
  const email = getSetting("email") || "info@aomonline.com";
  const address = getSetting("address") || "Dhaka, Bangladesh";
  const facebookUrl = getSetting("facebookUrl") || "#";
  const youtubeUrl = getSetting("youtubeUrl") || "#";
  const whatsappUrl = getSetting("whatsappUrl") || "#";

  const items = [
    {
      icon: IoMdCall,
      title: "Phone",
      value: phone,
      href: `tel:${phoneDial}`,
    },
    {
      icon: IoMailOutline,
      title: "Email",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: IoLocationOutline,
      title: "Address",
      value: address,
      href: null,
    },
    {
      icon: IoTimeOutline,
      title: "Hours",
      value: "Open 24 Hours (24/7)",
      href: null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-[var(--radius-2xl)] brand-gradient p-8 text-white shadow-card sm:p-10"
    >
      <h2 className="text-2xl font-semibold">Contact Information</h2>
      <p className="mt-2 text-white/80">
        Reach out to us with any question or request. We aim to respond
        quickly.
      </p>

      <ul className="mt-8 space-y-6">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-white/10 text-accent-200">
              <item.icon className="text-xl" />
            </span>
            <div>
              <p className="text-sm text-white/70">{item.title}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-base font-medium text-white transition-colors hover:text-accent-200"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-base font-medium text-white">{item.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Social */}
      <div className="mt-8 border-t border-white/20 pt-6">
        <p className="mb-3 text-sm text-white/70">Connect with us on social media</p>
        <div className="flex items-center gap-3">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <FaFacebookF />
          </a>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <FaYoutube />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <FaWhatsapp />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfo;
